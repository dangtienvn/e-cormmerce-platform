/**
 * @fileoverview Tiện ích chuẩn hóa cấu trúc dữ liệu phản hồi (response) cho các API.
 */

/**
 * @namespace ResponseHelper
 * @description Tập hợp các hàm tiện ích để gửi HTTP response nhất quán trong toàn bộ ứng dụng.
 */
const ResponseHelper = {
  /**
   * @function success
   * @description Gửi phản hồi thành công.
   * @param {Object} res - Đối tượng response của Express.
   * @param {*} [data=null] - Dữ liệu trả về cho client.
   * @param {string} [message="Thành công"] - Thông báo thành công.
   * @param {number} [statusCode=200] - Mã trạng thái HTTP (mặc định là 200 OK).
   * @returns {Object} JSON response chứa kết quả thành công.
   */
  success(res, data = null, message = "Thành công", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  /**
   * @function created
   * @description Gửi phản hồi thành công khi tạo mới một tài nguyên.
   * @param {Object} res - Đối tượng response của Express.
   * @param {*} [data=null] - Dữ liệu của tài nguyên vừa được tạo.
   * @param {string} [message="Tạo mới thành công"] - Thông báo tạo mới thành công.
   * @returns {Object} JSON response với mã trạng thái 201 Created.
   */
  created(res, data = null, message = "Tạo mới thành công") {
    return this.success(res, data, message, 201);
  },

  /**
   * @function error
   * @description Gửi phản hồi lỗi.
   * @param {Object} res - Đối tượng response của Express.
   * @param {string} [message="Đã xảy ra lỗi"] - Thông báo lỗi.
   * @param {number} [statusCode=400] - Mã trạng thái HTTP (mặc định 400 Bad Request).
   * @param {*} [errors=null] - Chi tiết lỗi (VD: danh sách lỗi validation).
   * @returns {Object} JSON response chứa thông tin lỗi.
   */
  error(res, message = "Đã xảy ra lỗi", statusCode = 400, errors = null) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  },

  /**
   * @function unauthorized
   * @description Gửi phản hồi lỗi xác thực (chưa đăng nhập hoặc token không hợp lệ/đã hết hạn).
   * @param {Object} res - Đối tượng response của Express.
   * @param {string} [message="Vui lòng đăng nhập"] - Thông báo lỗi.
   * @returns {Object} JSON response với mã trạng thái 401 Unauthorized.
   */
  unauthorized(res, message = "Vui lòng đăng nhập") {
    return this.error(res, message, 401);
  },

  /**
   * @function forbidden
   * @description Gửi phản hồi lỗi phân quyền (đã đăng nhập nhưng không có quyền truy cập tài nguyên).
   * @param {Object} res - Đối tượng response của Express.
   * @param {string} [message="Không có quyền truy cập"] - Thông báo lỗi.
   * @returns {Object} JSON response với mã trạng thái 403 Forbidden.
   */
  forbidden(res, message = "Không có quyền truy cập") {
    return this.error(res, message, 403);
  },

  /**
   * @function notFound
   * @description Gửi phản hồi lỗi khi không tìm thấy tài nguyên yêu cầu.
   * @param {Object} res - Đối tượng response của Express.
   * @param {string} [message="Không tìm thấy tài nguyên"] - Thông báo lỗi.
   * @returns {Object} JSON response với mã trạng thái 404 Not Found.
   */
  notFound(res, message = "Không tìm thấy tài nguyên") {
    return this.error(res, message, 404);
  },

  /**
   * @function internalError
   * @description Gửi phản hồi lỗi hệ thống/máy chủ nội bộ.
   * @param {Object} res - Đối tượng response của Express.
   * @param {string} [message="Lỗi máy chủ nội bộ"] - Thông báo lỗi.
   * @returns {Object} JSON response với mã trạng thái 500 Internal Server Error.
   */
  internalError(res, message = "Lỗi máy chủ nội bộ") {
    return this.error(res, message, 500);
  }
};

module.exports = ResponseHelper;
