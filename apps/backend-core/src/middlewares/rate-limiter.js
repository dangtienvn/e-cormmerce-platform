/**
 * @fileoverview Middleware giới hạn số lượng yêu cầu (Rate Limiter).
 * Ngăn chặn các cuộc tấn công DDoS hoặc brute-force bằng cách giới hạn số lượng request từ một IP.
 */

const rateLimit = require('express-rate-limit');

/**
 * Hàm tạo middleware giới hạn số lượng yêu cầu với các tùy chọn linh hoạt.
 * 
 * @param {Object} [options={}] - Các tùy chọn cấu hình.
 * @param {number} [options.windowMs=900000] - Khung thời gian giới hạn (tính bằng milliseconds, mặc định 15 phút).
 * @param {number} [options.max=100] - Số lượng yêu cầu tối đa mỗi IP được phép gửi trong một khung thời gian.
 * @returns {import('express').RequestHandler} Middleware xử lý rate limit của Express.
 */
const createLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
  });
};

// Specific limiter for auth sensitive endpoints (forgot password)
/**
 * Middleware giới hạn số lượng yêu cầu chuyên biệt cho các điểm cuối xác thực nhạy cảm 
 * (như quên mật khẩu, gửi mã OTP).
 * Giới hạn: 5 yêu cầu mỗi giờ.
 * @type {import('express').RequestHandler}
 */
const authLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 5 }); // 5 requests per hour

module.exports = { createLimiter, authLimiter };
