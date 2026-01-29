/**
 * @fileoverview Middleware xử lý kết quả xác thực dữ liệu đầu vào.
 * Sử dụng cùng với thư viện express-validator để bắt và trả về các lỗi xác thực.
 */

const { validationResult } = require('express-validator');

/**
 * Middleware kiểm tra kết quả xác thực của các trường dữ liệu (fields) trong request.
 * Nếu có lỗi (dữ liệu không hợp lệ), nó sẽ trả về mã trạng thái 400 kèm theo thông báo lỗi đầu tiên.
 * Nếu không có lỗi, request sẽ được đi tiếp tới middleware/controller tiếp theo.
 * 
 * @param {import('express').Request} req - Đối tượng request của Express.
 * @param {import('express').Response} res - Đối tượng response của Express.
 * @param {import('express').NextFunction} next - Hàm middleware tiếp theo.
 * @returns {void}
 */
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

module.exports = { runValidation };
