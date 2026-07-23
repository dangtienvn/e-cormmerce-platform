const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

process.env.BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

jest.mock('../src/middlewares/auth.middleware', () => ({
  protect: (req, res, next) => next(),
}));

const fileRoute = require('../src/modules/file/file.route');

const uploadsDir = path.join(__dirname, '../uploads');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/files', fileRoute);
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  });
  return app;
}

describe('File upload flow', () => {
  let app;

  beforeAll(() => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  });

  beforeEach(() => {
    app = buildApp();
  });

  afterAll(() => {
    // cleanup any leftover test files
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file.includes('test') || file.endsWith('.png') || file.endsWith('.jpg')) {
          try {
            fs.unlinkSync(path.join(uploadsDir, file));
          } catch (error) {
            // ignore cleanup failures
          }
        }
      }
    }
  });

  test('uploads a base64 image and deletes it', async () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAwMBAQAr/wQAAAAASUVORK5CYII=';

    const uploadRes = await request(app)
      .post('/api/files/upload')
      .send({ base64: base64Image })
      .expect(200);

    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.url).toBeDefined();
    expect(uploadRes.body.urls).toContain(uploadRes.body.url);

    const deleteRes = await request(app)
      .delete('/api/files')
      .send({ url: uploadRes.body.url })
      .expect(200);

    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.results).toHaveLength(1);
    expect(deleteRes.body.results[0].deleted).toBe(true);
  });
});
