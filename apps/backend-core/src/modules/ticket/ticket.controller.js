/**
 * @fileoverview Controller xử lý các yêu cầu liên quan đến hỗ trợ khách hàng (Support Ticket).
 * Chứa các logic điều hướng và xử lý request/response cho hệ thống ticket.
 */

const TicketService = require("./ticket.service");
const ResponseHelper = require("../../utils/response.helper");

/**
 * Controller quản lý các thao tác với ticket.
 * @namespace TicketController
 */
const TicketController = {
  /**
   * Lấy danh sách tất cả các ticket (dành cho Admin).
   * Có thể lọc theo trạng thái (status).
   *
   * @param {Object} req - Đối tượng Request của Express.
   * @param {Object} res - Đối tượng Response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>} Trả về danh sách ticket thông qua ResponseHelper.
   */
  async getAll(req, res, next) {
    try {
      const tickets = await TicketService.getAllTickets(req.query.status);
      return ResponseHelper.success(res, tickets);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách các ticket của người dùng hiện tại (dành cho Customer).
   *
   * @param {Object} req - Đối tượng Request của Express, chứa thông tin user (`req.user.id`).
   * @param {Object} res - Đối tượng Response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>} Trả về danh sách ticket của người dùng thông qua ResponseHelper.
   */
  async getMyTickets(req, res, next) {
    try {
      const tickets = await TicketService.getMyTickets(req.user.id);
      return ResponseHelper.success(res, tickets);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo một ticket hỗ trợ mới.
   *
   * @param {Object} req - Đối tượng Request của Express, chứa dữ liệu ticket (`req.body`) và thông tin user (`req.user`).
   * @param {Object} res - Đối tượng Response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>} Trả về dữ liệu ticket vừa tạo thông qua ResponseHelper.
   */
  async create(req, res, next) {
    try {
      const data = await TicketService.createTicket(req.body, req.user);
      return ResponseHelper.created(res, data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Phản hồi (reply) một ticket từ phía quản trị viên.
   *
   * @param {Object} req - Đối tượng Request của Express, chứa ID ticket (`req.params.id`), nội dung phản hồi (`req.body.admin_reply`) và thông tin admin (`req.user`).
   * @param {Object} res - Đối tượng Response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>} Trả về thông báo thành công thông qua ResponseHelper.
   */
  async reply(req, res, next) {
    try {
      await TicketService.replyTicket(req.params.id, req.body.admin_reply, req.user);
      return ResponseHelper.success(res, null, "Reply sent successfully");
    } catch (error) {
      next(error);
    }
  }
};

module.exports = TicketController;
