const request = require('supertest');
const express = require('express');

jest.mock('../src/middlewares/auth.middleware', () => ({
  protect: (req, res, next) => {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer')) {
      req.user = { id: 5, email: 'cartuser@example.com' };
    }
    next();
  },
  admin: (req, res, next) => next(),
  authorize: () => (req, res, next) => next()
}));

jest.mock('../src/modules/cart/cart.service', () => ({
  addToCart: jest.fn(),
  getCart: jest.fn(),
  updateQuantity: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  syncCart: jest.fn(),
}));

const CartService = require('../src/modules/cart/cart.service');
const cartRoute = require('../src/modules/cart/cart.routes');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/cart', cartRoute);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, message: err.message });
  });
  return app;
}

describe('E2E Mocked: Cart flows (add, get, update, remove, clear)', () => {
  let app;
  let agent;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
    agent = request.agent(app);
  });

  test('Add item then Get cart returns items', async () => {
    CartService.addToCart.mockResolvedValue({ id: 1, user_id: 5, product_id: 11, quantity: 3 });
    CartService.getCart.mockResolvedValue([{ id: 1, user_id: 5, product_id: 11, quantity: 3 }]);

    const addRes = await agent.post('/api/cart').set('Authorization', 'Bearer access-token').send({ productId: 11, quantity: 3 }).expect(200);
    expect(addRes.body.success).toBe(true);
    expect(CartService.addToCart).toHaveBeenCalledWith(5, 11, 3);

    const getRes = await agent.get('/api/cart').set('Authorization', 'Bearer access-token').expect(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data).toEqual([{ id: 1, user_id: 5, product_id: 11, quantity: 3 }]);
    expect(CartService.getCart).toHaveBeenCalledWith(5);
  });

  test('Update quantity for an item', async () => {
    CartService.updateQuantity.mockResolvedValue({ id: 1, user_id: 5, product_id: 11, quantity: 5 });

    const res = await agent.put('/api/cart/11').set('Authorization', 'Bearer access-token').send({ quantity: 5 }).expect(200);
    expect(res.body.success).toBe(true);
    expect(CartService.updateQuantity).toHaveBeenCalledWith(5, '11', 5);
  });

  test('Remove item from cart', async () => {
    CartService.removeFromCart.mockResolvedValue(true);

    const res = await agent.delete('/api/cart/11').set('Authorization', 'Bearer access-token').expect(200);
    expect(res.body.success).toBe(true);
    expect(CartService.removeFromCart).toHaveBeenCalledWith(5, 11);
  });

  test('Clear cart', async () => {
    CartService.clearCart.mockResolvedValue(true);

    const res = await agent.delete('/api/cart').set('Authorization', 'Bearer access-token').expect(200);
    expect(res.body.success).toBe(true);
    expect(CartService.clearCart).toHaveBeenCalledWith(5);
  });
});
