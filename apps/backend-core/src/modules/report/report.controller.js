/**
 * @fileoverview Controller xử lý các yêu cầu liên quan đến báo cáo (report).
 * Cung cấp API để lấy dữ liệu thống kê tổng quan cho màn hình dashboard.
 */

const ReportService = require("./report.service");

/**
 * Object chứa các hàm điều khiển (controller) cho chức năng báo cáo.
 * @namespace ReportController
 */
const ReportController = {
  /**
   * Lấy dữ liệu báo cáo tổng quan dựa trên các bộ lọc (filters) cung cấp.
   * Nhận các tham số lọc từ query string và gọi sang ReportService để lấy dữ liệu,
   * sau đó trả về cho client dưới định dạng JSON.
   *
   * @async
   * @param {import('express').Request} req - Đối tượng Request của Express, chứa các query params: startDate, endDate, productType, customerSource.
   * @param {import('express').Response} res - Đối tượng Response của Express để trả về dữ liệu.
   * @param {import('express').NextFunction} next - Hàm next của Express để chuyển lỗi tới middleware xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa thông tin báo cáo thành công hoặc đẩy lỗi sang next().
   */
  async getReport(req, res, next) {
    try {
      const { startDate, endDate, productType, customerSource } = req.query;
      const reportData = await ReportService.getDashboardReport({
        startDate,
        endDate,
        productType,
        customerSource
      });
      res.json({ success: true, data: reportData });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ReportController;
