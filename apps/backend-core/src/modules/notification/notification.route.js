/**
 * @fileoverview Định tuyến (Routes) cho chức năng thông báo.
 * Định nghĩa các endpoint (API) để quản lý thông báo, yêu cầu xác thực người dùng.
 */
const express = require("express");
const router = express.Router();
const NotificationController = require("./notification.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);

router.get("/", NotificationController.getMyNotifications);
router.get("/unread", NotificationController.getMyUnreadNotifications);
router.put("/:id/read", NotificationController.markAsRead);
router.put("/read-all", NotificationController.markAllAsRead);

module.exports = router;
