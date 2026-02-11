/**
 * @fileoverview Module controller cho chức năng quản lý lịch sử hệ thống (activity logs).
 * Xử lý các HTTP requests liên quan đến truy xuất dữ liệu nhật ký hoạt động.
 */
const LogService = require("./log.service");

/**
 * Controller xử lý các yêu cầu liên quan đến nhật ký hoạt động (Logs).
 */
const LogController = {
  /**
   * Lấy danh sách tất cả các nhật ký hoạt động dựa trên các bộ lọc được cung cấp.
   *
   * @param {Object} req - Đối tượng request của Express, chứa các query parameters để lọc.
   * @param {Object} res - Đối tượng response của Express để trả về dữ liệu hoặc lỗi.
   * @param {Function} next - Hàm middleware tiếp theo để chuyển tiếp lỗi.
   * @returns {Promise<void>} Trả về JSON chứa danh sách logs hoặc gọi next(error) nếu có lỗi.
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search || "",
        limit: req.query.limit || 100,
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || "",
        userId: req.query.userId || ""
      };
      const logs = await LogService.getAllLogs(filters);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Lấy danh sách các nhật ký hoạt động liên quan đến một thực thể (entity) cụ thể.
   *
   * @param {Object} req - Đối tượng request của Express, chứa parameters `entity_type` và `entity_id`.
   * @param {Object} res - Đối tượng response của Express để trả về dữ liệu.
   * @param {Function} next - Hàm middleware tiếp theo để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa danh sách logs theo thực thể hoặc gọi next(error) nếu có lỗi.
   */
  async getEntityLogs(req, res, next) {
    try {
      const { entity_type, entity_id } = req.params;
      const logs = await LogService.getLogsByEntity(entity_type, entity_id);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = LogController;
