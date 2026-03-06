/**
 * @fileoverview Repository chuyên xử lý các thao tác tương tác với cơ sở dữ liệu cho Support Ticket.
 * Kế thừa từ BaseRepository và mở rộng thêm các phương thức đặc thù của ticket.
 */

const BaseRepository = require("../../shared/base.repository");
const { prisma } = require("../../config/database");

/**
 * Lớp Repository cho Ticket, tương tác với bảng `support_tickets`.
 * @extends BaseRepository
 */
class TicketRepository extends BaseRepository {
  /**
   * Khởi tạo TicketRepository.
   * Gắn với bảng `support_tickets` trong cơ sở dữ liệu.
   */
  constructor() {
    super("support_tickets");
  }

  /**
   * Lấy danh sách tất cả các ticket.
   * Có thể tuỳ chọn lọc theo trạng thái.
   * Đồng thời kết hợp thông tin chi tiết người dùng (họ tên, email).
   *
   * @param {string} [status=""] - Trạng thái của ticket để lọc (ví dụ: 'open', 'resolved', 'closed').
   * @returns {Promise<Array<Object>>} Trả về mảng các đối tượng ticket đã được định dạng.
   */
  async findAll(status = "") {
    const where = {};
    if (status) {
      where.status = status;
    }
    const tickets = await prisma.support_tickets.findMany({
      where,
      include: { users: true },
      orderBy: { created_at: 'desc' }
    });
    return tickets.map(t => ({
      ...t,
      user_full_name: t.users?.full_name,
      user_email: t.users?.email
    }));
  }

  /**
   * Lấy danh sách ticket của một người dùng cụ thể dựa vào User ID.
   * Sắp xếp theo thời gian tạo giảm dần.
   *
   * @param {number|string} userId - ID của người dùng.
   * @returns {Promise<Array<Object>>} Trả về mảng các ticket thuộc về người dùng đó.
   */
  async findByUserId(userId) {
    const tickets = await prisma.support_tickets.findMany({
      where: { user_id: parseInt(userId) },
      orderBy: { created_at: 'desc' }
    });
    return tickets;
  }

  /**
   * Cập nhật phản hồi từ quản trị viên cho một ticket cụ thể.
   * Tự động thay đổi trạng thái của ticket thành 'resolved' và cập nhật thời gian.
   *
   * @param {number|string} id - ID của ticket cần cập nhật.
   * @param {string} adminReply - Nội dung phản hồi của quản trị viên.
   * @returns {Promise<Object>} Trả về bản ghi ticket đã được cập nhật.
   */
  async updateReply(id, adminReply) {
    return await prisma.support_tickets.update({
      where: { id: parseInt(id) },
      data: {
        admin_reply: adminReply,
        status: 'resolved',
        updated_at: new Date()
      }
    });
  }
}

module.exports = new TicketRepository();
