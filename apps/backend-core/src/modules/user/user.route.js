/**
 * @fileoverview Module này định nghĩa các routes (đường dẫn) API liên quan đến người dùng (User).
 * Nó cũng tích hợp các middleware xác thực (protect), phân quyền (authorize) và tải lên file (upload).
 * @module UserRoute
 */
const express = require("express");
const router = express.Router();    
const UserController = require("./user.controller");
const { protect, requirePermission } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

router.use(protect);

router.get("/my-profile", UserController.getMyProfile);
router.put("/my-profile", UserController.updateMyProfile);
router.put("/my-profile/avatar", upload.single("avatar"), UserController.updateMyAvatar);
router.put("/my-password", UserController.changeMyPassword);
router.get("/", requirePermission("view_users"), UserController.getAll);
router.get("/trash", requirePermission("view_users"), UserController.getTrash);
router.get("/:id", requirePermission("view_users"), UserController.getById);
router.post("/", requirePermission("create_user"), UserController.create);
router.put("/:id/restore", requirePermission("edit_user"), UserController.restore);
router.put("/:id/lock", requirePermission("edit_user"), UserController.lockUser);
router.put("/:id/unlock", requirePermission("edit_user"), UserController.unlockUser);
router.put("/:id", requirePermission("edit_user"), UserController.update);
router.delete("/:id", requirePermission("delete_user"), UserController.delete);

module.exports = router;
