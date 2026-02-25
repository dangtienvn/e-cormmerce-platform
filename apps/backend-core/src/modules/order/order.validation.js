/**
 * @fileoverview Cấu hình validation (kiểm tra tính hợp lệ của dữ liệu) cho module Đơn hàng.
 * Sử dụng express-validator để bắt các lỗi dữ liệu đầu vào từ người dùng.
 * @module modules/order/validation
 */

const { check } = require("express-validator");
const { runValidation } = require("../../middlewares/validation");

/**
 * Các middleware kiểm tra dữ liệu đầu vào cho các route tạo và thanh toán đơn hàng.
 */
const OrderValidation = {
  /**
   * Middleware kiểm tra thông tin khi Admin tạo đơn hàng mới.
   */
  validateCreate: [
    check("items").isArray({ min: 1 }).withMessage("Đơn hàng phải có ít nhất một sản phẩm"),
    check("items.*.product_id").notEmpty().withMessage("Sản phẩm không hợp lệ"),
    check("items.*.quantity").isNumeric().withMessage("Số lượng không hợp lệ"),
    runValidation
  ],

  /**
   * Middleware kiểm tra thông tin khi Khách hàng tự thực hiện checkout.
   */
  validateCheckout: [
    check("items").isArray({ min: 1 }).withMessage("Đơn hàng phải có ít nhất một sản phẩm"),
    check("items.*.product_id").notEmpty().withMessage("Sản phẩm không hợp lệ"),
    check("items.*.quantity").isNumeric().withMessage("Số lượng không hợp lệ"),
    runValidation
  ]
};

module.exports = OrderValidation;
