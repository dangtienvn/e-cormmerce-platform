/**
 * @fileoverview Định tuyến (Routes) cho các API liên quan đến giỏ hàng.
 * Khai báo các endpoint để lấy, thêm, đồng bộ và xóa sản phẩm trong giỏ hàng.
 * Tất cả các route trong module này đều yêu cầu xác thực người dùng.
 */

const express = require('express');
const router = express.Router();
const CartController = require('./cart.controller');
const { protect } = require('../../middlewares/auth.middleware');

// Yêu cầu xác thực (đăng nhập) cho tất cả các route bên dưới
router.use(protect);

/**
 * @route GET /api/cart
 * @description Lấy danh sách sản phẩm trong giỏ hàng của người dùng hiện tại
 * @access Private
 */
router.get('/', CartController.getCart);

/**
 * @route POST /api/cart
 * @description Thêm một sản phẩm vào giỏ hàng
 * @access Private
 */
router.post('/', CartController.addToCart);

/**
 * @route POST /api/cart/sync
 * @description Đồng bộ giỏ hàng từ máy khách lên máy chủ
 * @access Private
 */
router.post('/sync', CartController.syncCart);

/**
 * @route DELETE /api/cart/:productId
 * @description Xóa một sản phẩm cụ thể khỏi giỏ hàng
 * @access Private
 */
router.delete('/:productId', CartController.removeFromCart);

/**
 * @route DELETE /api/cart
 * @description Xóa toàn bộ sản phẩm khỏi giỏ hàng
 * @access Private
 */
router.delete('/', CartController.clearCart);

module.exports = router;
