/**
 * @fileoverview Định nghĩa các tuyến đường (routes) API cho chức năng báo cáo.
 * Quản lý các endpoint liên quan đến dữ liệu thống kê, áp dụng middleware xác thực và phân quyền.
 */

const express = require("express");
const router = express.Router();
const ReportController = require("./report.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");

// Áp dụng middleware protect để đảm bảo người dùng đã đăng nhập cho toàn bộ route
router.use(protect);

/**
 * @api {get} / Lấy dữ liệu báo cáo tổng hợp
 * @apiName GetReport
 * @apiGroup Report
 * @apiPermission admin
 * @apiDescription Lấy dữ liệu thống kê tổng hợp cho màn hình dashboard (doanh thu, đơn hàng, khách hàng...).
 * Chỉ tài khoản có quyền 'admin' mới được phép truy cập.
 */
router.get("/", authorize("admin"), ReportController.getReport);

module.exports = router;
