/**
 * @fileoverview Lớp tùy chỉnh để xử lý lỗi trong ứng dụng, cung cấp thêm mã trạng thái HTTP (statusCode).
 */

/**
 * @class AppError
 * @extends Error
 * @description Lớp đại diện cho các lỗi hệ thống có thể lường trước (operational errors) với thông báo và mã trạng thái HTTP cụ thể.
 */
class AppError extends Error {
  /**
   * Khởi tạo một đối tượng AppError.
   * 
   * @param {string} message - Thông báo mô tả lỗi chi tiết.
   * @param {number} statusCode - Mã trạng thái HTTP tương ứng với lỗi (VD: 400, 404, 500).
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
