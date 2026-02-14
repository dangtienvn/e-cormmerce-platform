/**
 * @fileoverview Dịch vụ (Service) xử lý nghiệp vụ cho tính năng thông báo.
 * Quản lý việc gửi thông báo cho quản trị viên, chủ sở hữu sản phẩm và người dùng, 
 * cũng như các chức năng truy xuất và cập nhật trạng thái thông báo.
 */
const NotificationRepository = require("./notification.repository");
const UserRepository = require("../user/user.repository");
const { prisma } = require("../../config/database");

/**
 * Đối tượng cung cấp các dịch vụ liên quan đến thông báo.
 */
const NotificationService = {
  /**
   * Gửi thông báo đến tất cả các quản trị viên (admins).
   * @param {string} message - Nội dung thông báo.
   * @param {string|null} [link=null] - Đường dẫn liên kết đi kèm thông báo (tuỳ chọn).
   * @returns {Promise<void>} 
   */
  async notifyAdmins(message, link = null) {
    // Find all admins
    const admins = await UserRepository.findAll({ role: "admin" });
    for (const admin of admins) {
      await NotificationRepository.createNotification(admin.id, message, link);
    }
  },

  /**
   * Gửi thông báo đến tất cả quản trị viên và người tạo (chủ sở hữu) của các sản phẩm cụ thể.
   * Sử dụng Set để đảm bảo không gửi trùng thông báo nếu người tạo cũng là quản trị viên.
   * @param {string} message - Nội dung thông báo.
   * @param {string|null} [link=null] - Đường dẫn liên kết đi kèm thông báo (tuỳ chọn).
   * @param {Array<number>} [productIds=[]] - Mảng chứa các ID sản phẩm để tìm người tạo.
   * @returns {Promise<void>}
   */
  async notifyAdminsAndProductOwners(message, link = null, productIds = []) {
    const admins = await UserRepository.findAll({ role: "admin" });
    const userIdsToNotify = new Set(admins.map(a => a.id));

    if (productIds && productIds.length > 0) {
      const products = await prisma.products.findMany({
        where: { id: { in: productIds } },
        select: { created_by: true }
      });
      for (const p of products) {
        if (p.created_by) {
          userIdsToNotify.add(p.created_by);
        }
      }
    }

    for (const userId of userIdsToNotify) {
      await NotificationRepository.createNotification(userId, message, link);
    }
  },

  /**
   * Gửi thông báo đến một người dùng cụ thể.
   * @param {number|string} user_id - ID của người dùng nhận thông báo.
   * @param {string} message - Nội dung thông báo.
   * @param {string|null} [link=null] - Đường dẫn liên kết đi kèm thông báo (tuỳ chọn).
   * @returns {Promise<void>}
   */
  async notifyUser(user_id, message, link = null) {
    if (user_id) {
      await NotificationRepository.createNotification(user_id, message, link);
    }
  },

  /**
   * Lấy toàn bộ danh sách thông báo của một người dùng.
   * @param {number|string} user_id - ID của người dùng.
   * @returns {Promise<Array>} Mảng danh sách các thông báo.
   */
  async getUserNotifications(user_id) {
    return await NotificationRepository.getAllByUser(user_id);
  },

  /**
   * Lấy danh sách các thông báo chưa đọc của một người dùng.
   * @param {number|string} user_id - ID của người dùng.
   * @returns {Promise<Array>} Mảng danh sách các thông báo chưa đọc.
   */
  async getUnreadNotifications(user_id) {
    return await NotificationRepository.getUnreadByUser(user_id);
  },

  /**
   * Đánh dấu một thông báo cụ thể là đã đọc.
   * @param {number|string} id - ID của thông báo cần đánh dấu.
   * @param {number|string} user_id - ID của người dùng sở hữu thông báo.
   * @returns {Promise<boolean>} Trả về `true` nếu thành công.
   */
  async markAsRead(id, user_id) {
    return await NotificationRepository.markAsRead(id, user_id);
  },
  
  /**
   * Đánh dấu tất cả thông báo chưa đọc của người dùng thành đã đọc.
   * @param {number|string} user_id - ID của người dùng.
   * @returns {Promise<number>} Số lượng thông báo được cập nhật.
   */
  async markAllAsRead(user_id) {
    return await NotificationRepository.markAllAsRead(user_id);
  }
};

module.exports = NotificationService;
