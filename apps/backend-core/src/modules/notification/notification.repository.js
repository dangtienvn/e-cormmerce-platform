/**
 * @fileoverview Lớp kho lưu trữ (Repository) cho thông báo.
 * Giao tiếp với cơ sở dữ liệu Prisma để thực hiện các thao tác CRUD lên bảng `notifications`.
 */
const BaseRepository = require("../../shared/base.repository");
const { prisma } = require("../../config/database");

/**
 * Lớp cung cấp các phương thức truy xuất và thao tác dữ liệu thông báo trong cơ sở dữ liệu.
 * @extends BaseRepository
 */
class NotificationRepository extends BaseRepository {
  /**
   * Khởi tạo NotificationRepository và gọi hàm tạo của BaseRepository với tên bảng `notifications`.
   */
  constructor() {
    super("notifications");
  }

  /**
   * Tạo một thông báo mới cho người dùng.
   * @param {number|string} user_id - ID của người dùng nhận thông báo.
   * @param {string} message - Nội dung của thông báo.
   * @param {string} [link] - Đường dẫn liên kết liên quan đến thông báo (tuỳ chọn).
   * @returns {Promise<number>} Trả về ID của thông báo vừa được tạo.
   */
  async createNotification(user_id, message, link) {
    const result = await prisma.notifications.create({
      data: {
        user_id: parseInt(user_id),
        message,
        link
      }
    });
    return result.id;
  }

  /**
   * Lấy danh sách các thông báo chưa đọc của một người dùng, sắp xếp theo thời gian mới nhất.
   * @param {number|string} user_id - ID của người dùng.
   * @returns {Promise<Array>} Trả về mảng các thông báo chưa đọc.
   */
  async getUnreadByUser(user_id) {
    return await prisma.notifications.findMany({
      where: { user_id: parseInt(user_id), is_read: false },
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Lấy danh sách tất cả thông báo của một người dùng, sắp xếp theo thời gian mới nhất.
   * @param {number|string} user_id - ID của người dùng.
   * @param {number} [limit=50] - Số lượng thông báo tối đa cần lấy (mặc định là 50).
   * @returns {Promise<Array>} Trả về mảng các thông báo.
   */
  async getAllByUser(user_id, limit = 50) {
    return await prisma.notifications.findMany({
      where: { user_id: parseInt(user_id) },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit)
    });
  }

  /**
   * Đánh dấu một thông báo cụ thể của người dùng là đã đọc.
   * @param {number|string} id - ID của thông báo.
   * @param {number|string} user_id - ID của người dùng sở hữu thông báo.
   * @returns {Promise<boolean>} Trả về `true` nếu cập nhật thành công, ngược lại là `false`.
   */
  async markAsRead(id, user_id) {
    const result = await prisma.notifications.updateMany({
      where: { id: parseInt(id), user_id: parseInt(user_id) },
      data: { is_read: true }
    });
    return result.count > 0;
  }
  
  /**
   * Đánh dấu tất cả thông báo chưa đọc của người dùng là đã đọc.
   * @param {number|string} user_id - ID của người dùng.
   * @returns {Promise<number>} Trả về số lượng thông báo đã được cập nhật.
   */
  async markAllAsRead(user_id) {
    const result = await prisma.notifications.updateMany({
      where: { user_id: parseInt(user_id), is_read: false },
      data: { is_read: true }
    });
    return result.count;
  }
}

module.exports = new NotificationRepository();
