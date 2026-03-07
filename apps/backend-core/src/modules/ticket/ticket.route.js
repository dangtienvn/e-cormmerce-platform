/**
 * @fileoverview Định nghĩa các tuyến đường (routes) cho chức năng Support Ticket.
 * Chứa cấu hình API router liên quan đến người dùng thông thường và quản trị viên (admin).
 */

const express = require("express");
const router = express.Router();
const TicketController = require("./ticket.controller");
const { protect, admin } = require("../../middlewares/auth.middleware");

/**
 * @route GET /my-tickets
 * @description Lấy danh sách các ticket hỗ trợ của người dùng hiện tại (Customer).
 * @access Private (Yêu cầu đăng nhập - middleware protect)
 */
router.get("/my-tickets", protect, TicketController.getMyTickets);

/**
 * @route POST /
 * @description Tạo một yêu cầu hỗ trợ (ticket) mới (Customer).
 * @access Private (Yêu cầu đăng nhập - middleware protect)
 */
router.post("/", protect, TicketController.create);

/**
 * @route GET /
 * @description Lấy danh sách toàn bộ các yêu cầu hỗ trợ (Admin). Có thể có bộ lọc trạng thái.
 * @access Private/Admin (Yêu cầu đăng nhập và phân quyền admin - middleware protect, admin)
 */
router.get("/", protect, admin, TicketController.getAll);

/**
 * @route PUT /:id/reply
 * @description Quản trị viên phản hồi một ticket thông qua ID của ticket (Admin).
 * @access Private/Admin (Yêu cầu đăng nhập và phân quyền admin - middleware protect, admin)
 */
router.put("/:id/reply", protect, admin, TicketController.reply);

module.exports = router;
