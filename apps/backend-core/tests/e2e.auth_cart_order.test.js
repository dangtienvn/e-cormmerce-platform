const request = require('supertest');
const express = require('express');

// Mock middlewares: protect should attach a user when Authorization header present
jest.mock('../src/middlewares/auth.middleware', () => ({
  protect: (req, res, next) => {
    // simple mocked protect: if Authorization header exists, set req.user
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer')) {
      req.user = { id: 1, email: 'demo@example.com' };
    }
    next();
  },
  admin: (req, res, next) => next(),
  authorize: () => (req, res, next) => next()
}));

jest.mock('../src/modules/auth/auth.service', () => ({
  register: jest.fn(),
  sendEmailVerificationForUser: jest.fn(),
  login: jest.fn(),
  refreshAccessToken: jest.fn(),
  logout: jest.fn(),
  verifyEmail: jest.fn(),
}));

jest.mock('../src/modules/cart/cart.service', () => ({
  addToCart: jest.fn(),
  getCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  syncCart: jest.fn(),
  removeFromCart: jest.fn(),
}));

jest.mock('../src/modules/order/order.service', () => ({
  checkout: jest.fn(),
  processSepayWebhook: jest.fn(),
}));

const AuthService = require('../src/modules/auth/auth.service');
const CartService = require('../src/modules/cart/cart.service');
const OrderService = require('../src/modules/order/order.service');

const authRoute = require('../src/modules/auth/auth.route');
const cartRoute = require('../src/modules/cart/cart.routes');
const orderRoute = require('../src/modules/order/order.route');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoute);
  app.use('/api/cart', cartRoute);
  app.use('/api/orders', orderRoute);
  // simple error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, message: err.message });
  });
  return app;
}

describe('E2E Mocked: auth -> cart -> order flows', () => {
  let app;
  let agent;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
    agent = request.agent(app);
    process.env.SEPAY_API_TOKEN = 'sepay-secret';
  });

  test('Full flow: register -> login -> refresh -> add to cart -> checkout -> webhook', async () => {
    // 1) register
    AuthService.register.mockResolvedValue({ id: 1, email: 'demo@example.com', full_name: 'Demo' });

    const reg = await agent.post('/api/auth/register').send({ name: 'Demo', email: 'demo@example.com', password: 'P@ssw0rd!', phone: '0123456789' }).expect(201);
    expect(reg.body.success).toBe(true);
    expect(AuthService.register).toHaveBeenCalled();

    // 2) login -> set cookie
    AuthService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      user: { id: 1, email: 'demo@example.com' }
    });

    const loginRes = await agent.post('/api/auth/login').send({ email: 'demo@example.com', password: 'P@ssw0rd!' }).expect(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBe('access-token');

    // 3) refresh
    AuthService.refreshAccessToken.mockResolvedValue({ accessToken: 'access-token-2', refreshToken: 'refresh-token-2', refreshExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) });

    // send refresh via header
    const refreshRes = await agent.post('/api/auth/refresh').set('x-refresh-token', 'refresh-token').expect(200);
    expect(refreshRes.body.success).toBe(true);
    expect(AuthService.refreshAccessToken).toHaveBeenCalledWith('refresh-token');

    // 4) add item to cart (protected) - because our protect sets req.user when Authorization header present, include Bearer access-token
    CartService.addToCart.mockResolvedValue({ id: 1, user_id: 1, product_id: 10, quantity: 2 });
    const addCartRes = await agent.post('/api/cart').set('Authorization', 'Bearer access-token').send({ productId: 10, quantity: 2 }).expect(200);
    expect(addCartRes.body.success).toBe(true);
    expect(CartService.addToCart).toHaveBeenCalledWith(1, 10, 2);

    // 5) checkout
    OrderService.checkout.mockResolvedValue({ id: 100, status: 'pending', final_amount: 200, payment_method: 'mock' });
    const checkoutRes = await agent.post('/api/orders/checkout').set('Authorization', 'Bearer access-token').send({ items: [{ product_id: 10, quantity: 2 }], payment_method: 'mock' }).expect(201);
    expect(checkoutRes.body.success).toBe(true);
    expect(OrderService.checkout).toHaveBeenCalled();

    // 6) simulate payment webhook
    OrderService.processSepayWebhook.mockResolvedValue(true);
    const webhookRes = await agent.post('/api/orders/webhook/sepay').set('x-sepay-token', process.env.SEPAY_API_TOKEN).send({ order_id: 100, status: 'paid' }).expect(200);
    expect(webhookRes.body.success).toBe(true);
    expect(OrderService.processSepayWebhook).toHaveBeenCalledWith(expect.objectContaining({ order_id: 100, status: 'paid' }));
  });
});
