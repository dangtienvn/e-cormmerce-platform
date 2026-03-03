/**
 * @fileoverview Khai báo các route (đường dẫn API) cho module Sản phẩm (Product).
 * Áp dụng các middleware xác thực (protect, optionalProtect), phân quyền (authorize) 
 * và validate dữ liệu trước khi chuyển request đến controller.
 * @module product/route
 */

const express = require("express");
const router = express.Router();
const ProductController = require("./product.controller");
const ProductValidation = require("./product.validation");
const { protect, requirePermission, optionalProtect } = require("../../middlewares/auth.middleware");

// Lấy danh sách tất cả sản phẩm
router.get("/", optionalProtect, ProductController.getAll);

// Lấy danh sách sản phẩm trong thùng rác (Yêu cầu quyền admin/editor)
router.get("/trash", protect, requirePermission("view_products"), ProductController.getTrash);

// Lấy danh sách các đánh giá mới nhất
router.get("/reviews/latest", ProductController.getLatestReviews);

// Lấy danh sách đánh giá của một sản phẩm
router.get("/:id/reviews", ProductController.getReviews);

// Lấy chi tiết một sản phẩm theo ID
router.get("/:id", optionalProtect, ProductController.getById);

// Tải xuống sản phẩm (Yêu cầu đăng nhập và có quyền sở hữu)
router.get("/:id/download", protect, ProductController.download);

// Đánh giá sản phẩm (Yêu cầu đăng nhập)
router.post("/:id/reviews", protect, ProductController.createReview);

// Tạo sản phẩm mới (Yêu cầu quyền admin/editor)
router.post("/", protect, requirePermission("create_product"), ProductValidation.validateCreate, ProductController.create);

// Cập nhật thông tin sản phẩm (Yêu cầu quyền admin/editor)
router.put("/:id", protect, requirePermission("edit_product"), ProductValidation.validateUpdate, ProductController.update);

// Xóa sản phẩm (Yêu cầu quyền admin/editor)
router.delete("/:id", protect, requirePermission("delete_product"), ProductController.delete);

// Khôi phục sản phẩm từ thùng rác (Yêu cầu quyền admin/editor)
router.put("/:id/restore", protect, requirePermission("edit_product"), ProductController.restore);

module.exports = router;
