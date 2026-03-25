const request = require('supertest');
const express = require('express');

// Khởi tạo một app nhỏ để test thay vì nạp toàn bộ app.js (đỡ bị lỗi dính DB Prisma trong khi test)
const app = express();
app.use(express.json());
app.use('/api/products', require('../src/modules/product/product.route'));

describe('Product API Integration Tests', () => {
  it('should return a list of latest reviews (GET /api/products/reviews/latest)', async () => {
    // Mock the controller method just to test route configuration
    const ProductController = require('../src/modules/product/product.controller');
    ProductController.getLatestReviews = jest.fn((req, res) => res.status(200).json({ success: true, data: [] }));

    const response = await request(app).get('/api/products/reviews/latest');
    
    expect(response.status).toBe(200);
    // Since we didn't mock the DB, it will actually hit the real controller if not mocked.
    // If it hits DB, it should still return 200 with an array format.
  });
});
