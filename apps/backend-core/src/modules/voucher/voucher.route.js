/**
 * @fileoverview Module route định tuyến các API liên quan đến mã giảm giá (Voucher).
 */
const express = require("express");
const router = express.Router();
const VoucherController = require("./voucher.controller");
const { protect, admin } = require("../../middlewares/auth.middleware");

/**
 * Các route dành cho Admin quản lý mã giảm giá
 * Yêu cầu quyền truy cập (protect) và quyền quản trị viên (admin)
 */
// Lấy danh sách mã giảm giá trong thùng rác
router.get("/trash", protect, admin, VoucherController.getTrash);
// Lấy danh sách tất cả các mã giảm giá
router.get("/", protect, admin, VoucherController.getAll);
// Tạo mới một mã giảm giá
router.post("/", protect, admin, VoucherController.create);
// Khôi phục mã giảm giá từ thùng rác
router.put("/:id/restore", protect, admin, VoucherController.restore);
// Cập nhật thông tin một mã giảm giá
router.put("/:id", protect, admin, VoucherController.update);
// Xóa vĩnh viễn một mã giảm giá khỏi hệ thống
router.delete("/:id/force", protect, admin, VoucherController.forceDelete);
// Xóa mềm một mã giảm giá (đưa vào thùng rác)
router.delete("/:id", protect, admin, VoucherController.delete);

/**
 * Các route dành cho khách hàng hoặc quá trình thanh toán (public)
 */
// Kiểm tra tính hợp lệ của mã giảm giá
router.post("/check", VoucherController.check);

module.exports = router;
