/**
 * @fileoverview Module service cung cấp các phương thức nghiệp vụ cho quản lý nhật ký hệ thống.
 * Đóng vai trò cầu nối giữa Controller và Repository.
 */
const LogRepository = require("./log.repository");

/**
 * Service xử lý logic nghiệp vụ liên quan đến nhật ký hoạt động.
 */
const LogService = {
  /**
   * Lấy danh sách tất cả các log dựa trên bộ lọc.
   *
   * @param {Object} filters - Đối tượng chứa các điều kiện lọc (tìm kiếm, thời gian, giới hạn).
   * @returns {Promise<Array<Object>>} Trả về danh sách log hoạt động phù hợp.
   */
  async getAllLogs(filters) {
    return await LogRepository.findAll(filters);
  },

  /**
   * Lấy danh sách các log liên quan đến một thực thể (entity) cụ thể.
   *
   * @param {string} entity_type - Loại thực thể (ví dụ: 'order', 'product').
   * @param {number|string} entity_id - ID của thực thể cần xem log.
   * @returns {Promise<Array<Object>>} Trả về danh sách log của thực thể.
   */
  async getLogsByEntity(entity_type, entity_id) {
    return await LogRepository.findByEntity(entity_type, entity_id);
  },

  /**
   * Ghi nhận một hành động mới vào nhật ký hệ thống.
   *
   * @param {number|string|null} user_id - ID người dùng thực hiện hành động.
   * @param {string} action - Hành động đã thực hiện.
   * @param {string} entity_type - Loại thực thể bị ảnh hưởng.
   * @param {number|string|null} entity_id - ID thực thể bị ảnh hưởng.
   * @param {string} [description=""] - Mô tả chi tiết hành động.
   * @returns {Promise<Object>} Trả về dữ liệu của log mới tạo.
   */
  async logAction(user_id, action, entity_type, entity_id, description = "") {
    return await LogRepository.logAction(user_id, action, entity_type, entity_id, description);
  }
};

module.exports = LogService;
