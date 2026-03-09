/**
 * @fileoverview Dịch vụ xử lý nghiệp vụ cho chức năng Support Ticket.
 * Chứa logic core, xác thực dữ liệu trước khi tương tác với cơ sở dữ liệu qua repository.
 */

const AppError = require("../../utils/app-error");
const TicketRepository = require("./ticket.repository");
const LogService = require("../log/log.service");

/**
 * Service quản lý các thao tác và logic nghiệp vụ của ticket.
 * @namespace TicketService
 */
const TicketService = {
  /**
   * Lấy danh sách toàn bộ các ticket, thường dùng cho admin.
   *
   * @param {string} [status] - Trạng thái cần lọc (tuỳ chọn).
   * @returns {Promise<Array<Object>>} Trả về danh sách các ticket tương ứng.
   */
  async getAllTickets(status) {
    return await TicketRepository.findAll(status);
  },

  /**
   * Lấy danh sách các ticket theo ID của người dùng.
   *
   * @param {number|string} userId - ID của người dùng (Customer).
   * @returns {Promise<Array<Object>>} Trả về danh sách ticket của người dùng.
   */
  async getMyTickets(userId) {
    return await TicketRepository.findByUserId(userId);
  },

  /**
   * Tạo mới một ticket hỗ trợ từ khách hàng.
   * Kiểm tra thông tin bắt buộc và lưu log thao tác vào hệ thống.
   *
   * @param {Object} data - Dữ liệu payload tạo ticket.
   * @param {string} data.subject - Tiêu đề của ticket (bắt buộc).
   * @param {string} data.message - Nội dung chi tiết của ticket (bắt buộc).
   * @param {Object} actor - Thông tin người thực hiện hành động tạo ticket.
   * @param {number|string} actor.id - ID của người tạo ticket.
   * @returns {Promise<Object>} Trả về đối tượng chứa ID của ticket vừa được tạo.
   * @throws {AppError} Ném lỗi với mã 400 nếu thiếu tiêu đề hoặc nội dung.
   */
  async createTicket(data, actor) {
    if (!data.subject || !data.message) {
      throw new AppError("Subject and message are required", 400);
    }
    const newTicket = await TicketRepository.create({
      user_id: actor.id,
      subject: data.subject,
      message: data.message
    });
    if (actor) {
      await LogService.logAction(
        actor.id, 
        "CREATE_TICKET", 
        "support_ticket", 
        newTicket.id, 
        `Tạo yêu cầu hỗ trợ mới: ${data.subject}`
      ).catch(console.error);
    }
    return { id: newTicket.id };
  },

  /**
   * Quản trị viên phản hồi một ticket.
   * Thực hiện cập nhật phản hồi, đổi trạng thái ticket và lưu log hệ thống.
   *
   * @param {number|string} ticketId - ID của ticket cần phản hồi.
   * @param {string} adminReply - Nội dung phản hồi từ admin (bắt buộc).
   * @param {Object} actor - Thông tin quản trị viên thực hiện hành động.
   * @param {number|string} actor.id - ID của quản trị viên.
   * @returns {Promise<boolean>} Trả về `true` khi phản hồi thành công.
   * @throws {AppError} Ném lỗi với mã 400 nếu không có nội dung phản hồi.
   */
  async replyTicket(ticketId, adminReply, actor) {
    if (!adminReply) {
      throw new AppError("Admin reply is required", 400);
    }
    await TicketRepository.updateReply(ticketId, adminReply);
    if (actor) {
      await LogService.logAction(
        actor.id, 
        "REPLY_TICKET", 
        "support_ticket", 
        ticketId, 
        `Admin đã trả lời yêu cầu hỗ trợ #${ticketId}`
      ).catch(console.error);
    }
    return true;
  }
};

module.exports = TicketService;
