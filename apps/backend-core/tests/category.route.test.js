const request = require('supertest');
const express = require('express');

jest.mock('../src/middlewares/auth.middleware', () => ({
  protect: (req, res, next) => next(),
  admin: (req, res, next) => next(),
}));

jest.mock('../src/modules/category/category.service', () => ({
  getAllCategories: jest.fn(),
  getCategoryTree: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  getCategoryById: jest.fn(),
  deleteCategory: jest.fn(),
  getTrash: jest.fn(),
  restoreCategory: jest.fn(),
}));

const CategoryService = require('../src/modules/category/category.service');
const categoryRoute = require('../src/modules/category/category.route');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/categories', categoryRoute);
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  });
  return app;
}

describe('Category routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  test('GET /api/categories/tree returns nested category data', async () => {
    const nested = [{ id: 1, name: 'Electronics', children: [] }];
    CategoryService.getCategoryTree.mockResolvedValue(nested);

    const res = await request(app).get('/api/categories/tree').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(nested);
    expect(CategoryService.getCategoryTree).toHaveBeenCalled();
  });

  test('GET /api/categories with tree=true returns nested data', async () => {
    const nested = [{ id: 1, name: 'Electronics', children: [] }];
    CategoryService.getCategoryTree.mockResolvedValue(nested);

    const res = await request(app).get('/api/categories?tree=true').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(nested);
    expect(CategoryService.getCategoryTree).toHaveBeenCalled();
  });

  test('POST /api/categories creates category with status and parent_id', async () => {
    const newCategory = { id: 2, name: 'Phones', status: 'active', parent_id: 1 };
    CategoryService.createCategory.mockResolvedValue(newCategory);

    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Phones', status: 'active', parent_id: 1 })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(newCategory);
    expect(CategoryService.createCategory).toHaveBeenCalledWith({ name: 'Phones', status: 'active', parent_id: 1 });
  });

  test('PUT /api/categories/:id updates category', async () => {
    const updated = { id: 2, name: 'Phones', status: 'inactive', parent_id: 1 };
    CategoryService.updateCategory.mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/categories/2')
      .send({ status: 'inactive', parent_id: 1 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(updated);
    expect(CategoryService.updateCategory).toHaveBeenCalledWith('2', { status: 'inactive', parent_id: 1 });
  });
});
