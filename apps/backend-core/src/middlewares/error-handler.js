/**
 * @fileoverview Middleware xử lý lỗi tập trung cho toàn bộ ứng dụng.
 * Nhận và xử lý các lỗi từ các route hoặc middleware khác gửi đến, 
 * sau đó trả về phản hồi lỗi thống nhất cho client.
 */

/**
 * Hàm middleware xử lý lỗi chung (Generic error handler).
 * Phân loại các lỗi (Lỗi hoạt động, lỗi cơ sở dữ liệu Prisma, lỗi request) 
 * và trả về thông báo lỗi thân thiện cùng mã trạng thái (status code) phù hợp.
 * 
 * @param {Error|any} err - Đối tượng lỗi được bắt. Có thể chứa các thuộc tính như statusCode, status, isOperational, code.
 * @param {import('express').Request} req - Đối tượng request của Express.
 * @param {import('express').Response} res - Đối tượng response của Express.
 * @param {import('express').NextFunction} next - Hàm gọi middleware hoặc error handler tiếp theo.
 * @returns {void} Trả về phản hồi JSON với thông báo lỗi.
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Log error for developers
  console.error("🔥 [Error]: ", err);

  // Default to 500 server error
  let statusCode = err.statusCode || err.status || 500;
  let message = 'Máy chủ đang gặp sự cố: ' + err.message;

  // If it is an operational error (AppError), use its message and status code
  if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.code === 'P2002') {
    // Prisma Unique Constraint Violation
    statusCode = 400;
    message = 'Thông tin bạn nhập đã tồn tại trong hệ thống (như tài khoản, sđt, email...). Vui lòng kiểm tra lại.';
  } else if (err.code && err.code.startsWith('P')) {
    // Basic catch for Prisma errors (Prisma error codes start with 'P')
    console.error('Prisma error details:', err.meta || err.message);
    statusCode = 500;
    if (err.code === 'P2022') {
      message = 'Cơ sở dữ liệu chưa được cập nhật schema. Vui lòng liên hệ quản trị viên.';
    } else {
      message = 'Lỗi hệ thống: ' + (err.meta?.message || err.message || err.code);
    }
  } else if (err.status >= 400 && err.status < 500) {
     // Some other bad request errors (like from body-parser)
     message = err.message;
  }

  res.status(statusCode).json({ success: false, message });
}

module.exports = errorHandler;
