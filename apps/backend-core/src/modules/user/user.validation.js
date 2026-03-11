/**
 * @fileoverview Module này chịu trách nhiệm xác thực (validate) dữ liệu đầu vào cho các yêu cầu liên quan đến người dùng/nhân viên trước khi đưa vào Controller xử lý.
 * @module StaffValidation
 */

const StaffValidation = {
  /**
   * Hàm middleware kiểm tra tính hợp lệ của dữ liệu khi tạo mới người dùng/nhân viên.
   * Yêu cầu các trường cơ bản phải có mặt.
   *
   * @function validateCreate
   * @param {Object} req - Đối tượng request của Express chứa dữ liệu trong req.body.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp, được gọi nếu xác thực thành công.
   * @returns {Object|void} Trả về lỗi 400 nếu thiếu dữ liệu, ngược lại gọi next().
   */
  validateCreate(req, res, next) {
    const { username, full_name, email, phone, address } = req.body;
    if (!username || !full_name || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: "Tất cả các trường là bắt buộc" });
    } 
    next();
  }
};

module.exports = StaffValidation;
