/**
 * @fileoverview Định nghĩa các route (đường dẫn API) cho module Đơn hàng.
 * Phân chia quyền truy cập (public, khách hàng, admin) và gắn các middleware tương ứng.
 * @module modules/order/route
 */

const express = require("express");
const router = express.Router();
const OrderController = require("./order.controller");
const OrderValidation = require("./order.validation");
const { protect, authorize } = require("../../middlewares/auth.middleware");

// Webhook SePay (Public, không yêu cầu xác thực JWT)
router.post("/webhook/sepay", OrderController.sepayWebhook);

// Bắt buộc đăng nhập cho tất cả các API bên dưới
router.use(protect);

// API dành cho Khách hàng
router.get("/my/products", OrderController.getMyProducts);
router.get("/my/orders", OrderController.getMyOrders);
router.post("/checkout", OrderValidation.validateCheckout, OrderController.checkout);
router.post("/:id/confirm-payment", OrderController.confirmPayment);

// API dành cho Quản trị viên (Admin)
router.get("/trash", authorize("admin"), OrderController.getTrash);
router.get("/", authorize("admin"), OrderController.getAll);
router.get("/:id", OrderController.getById);
router.post("/", authorize("admin"), OrderValidation.validateCreate, OrderController.create);
router.put("/:id", authorize("admin"), OrderController.update);
router.delete("/:id", authorize("admin"), OrderController.delete);
router.put("/:id/restore", authorize("admin"), OrderController.restore);
router.put("/:id/revoke", authorize("admin"), OrderController.revokeOrder);
router.post("/:id/resend-email", authorize("admin"), OrderController.resendEmail);

module.exports = router;
