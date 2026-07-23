const request = require('supertest');
const express = require('express');

jest.mock('../src/middlewares/auth.middleware', () => ({
  protect: (req, res, next) => next(),
  authorize: () => (req, res, next) => next(),
}));

jest.mock('../src/modules/report/report.service', () => ({
  getDashboardReport: jest.fn(),
}));

const ReportService = require('../src/modules/report/report.service');
const reportRoute = require('../src/modules/report/report.route');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/reports', reportRoute);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, message: err.message });
  });
  return app;
}

describe('Report routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  test('GET /api/reports returns dashboard data', async () => {
    const reportData = { stats: { totalRevenue: 100 } };
    ReportService.getDashboardReport.mockResolvedValue(reportData);

    const res = await request(app)
      .get('/api/reports?startDate=2025-01-01&endDate=2025-01-07')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(reportData);
    expect(ReportService.getDashboardReport).toHaveBeenCalledWith({
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      productType: undefined,
      customerSource: undefined,
    });
  });
});
