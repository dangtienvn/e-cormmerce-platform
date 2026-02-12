/**
 * @fileoverview Module định tuyến (routes) cho các API quản lý nhật ký hệ thống.
 * Cấu hình các endpoints và middlewares xác thực, phân quyền cho LogController.
 */
const express = require("express");
const router = express.Router();
const LogController = require("./log.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");

// Yêu cầu xác thực người dùng cho tất cả các routes phía dưới
router.use(protect);

// API lấy danh sách toàn bộ log (chỉ dành cho admin)
router.get("/", authorize("admin"), LogController.getAll);

// API lấy danh sách log dựa trên một thực thể (chỉ dành cho admin)
router.get("/:entity_type/:entity_id", authorize("admin"), LogController.getEntityLogs);

module.exports = router;
