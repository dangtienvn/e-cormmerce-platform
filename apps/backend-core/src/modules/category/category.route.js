/**
 * @fileoverview Định tuyến (Routes) cho các API quản lý danh mục (Category).
 * Chứa các endpoint để thực hiện các thao tác CRUD, quản lý thùng rác và khôi phục danh mục.
 */
const express = require("express");
const router = express.Router();
const CategoryController = require("./category.controller");
const { protect, admin } = require("../../middlewares/auth.middleware");

/**
 * Route lấy danh sách danh mục trong thùng rác
 * Yêu cầu đăng nhập (protect) và quyền quản trị viên (admin)
 */
router.get("/trash", protect, admin, CategoryController.getTrash);

/**
 * Route lấy danh sách tất cả các danh mục
 * Công khai
 */
router.get("/", CategoryController.getAll);

/**
 * Route lấy thông tin chi tiết một danh mục theo ID
 * Công khai
 */
router.get("/:id", CategoryController.getById);

/**
 * Route tạo mới danh mục
 * Yêu cầu đăng nhập (protect) và quyền quản trị viên (admin)
 */
router.post("/", protect, admin, CategoryController.create);

/**
 * Route cập nhật thông tin danh mục theo ID
 * Yêu cầu đăng nhập (protect) và quyền quản trị viên (admin)
 */
router.put("/:id", protect, admin, CategoryController.update);

/**
 * Route xóa mềm danh mục theo ID (đưa vào thùng rác)
 * Yêu cầu đăng nhập (protect) và quyền quản trị viên (admin)
 */
router.delete("/:id", protect, admin, CategoryController.delete);

/**
 * Route khôi phục danh mục từ thùng rác theo ID
 * Yêu cầu đăng nhập (protect) và quyền quản trị viên (admin)
 */
router.put("/:id/restore", protect, admin, CategoryController.restore);

module.exports = router;
