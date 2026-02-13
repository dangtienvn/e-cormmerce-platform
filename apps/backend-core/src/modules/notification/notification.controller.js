/**
 * @fileoverview Bộ điều khiển (Controller) cho chức năng thông báo.
 * Xử lý các yêu cầu HTTP liên quan đến việc lấy thông báo và đánh dấu đã đọc.
 */

const NotificationService = require('./notification.service');

const NotificationController = {
  async getMyNotifications(req, res, next) {
    try {
      // Assuming a getMyNotifications exists, or fallback to unread
      const logs = await NotificationService.getUnreadNotifications(req.user.id);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Lấy danh sách các thông báo chưa đọc của người dùng hiện tại.
   * @param {Object} req - Đối tượng request của Express, chứa thông tin người dùng (`req.user.id`).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware tiếp theo để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa danh sách thông báo chưa đọc.
   */
  async getMyUnreadNotifications(req, res, next) {
    try {
      const logs = await NotificationService.getUnreadNotifications(req.user.id);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Đánh dấu một thông báo cụ thể là đã đọc.
   * @param {Object} req - Đối tượng request của Express, chứa ID thông báo trong `req.params.id` và ID người dùng trong `req.user.id`.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware tiếp theo để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON xác nhận thành công.
   */
  async markAsRead(req, res, next) {
    try {
      await NotificationService.markAsRead(req.params.id, req.user.id);
      res.json({ success: true, message: "Đã đánh dấu đã đọc" });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc.
   * @param {Object} req - Đối tượng request của Express, chứa thông tin người dùng (`req.user.id`).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware tiếp theo để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON xác nhận thành công.
   */
  async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      res.json({ success: true, message: "Đã đánh dấu tất cả đã đọc" });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = NotificationController;
