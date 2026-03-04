/**
 * @fileoverview Module định nghĩa các luật kiểm tra (validation rules) cho dữ liệu đầu vào của Sản phẩm.
 * Sử dụng thư viện `express-validator` để đảm bảo dữ liệu hợp lệ trước khi được xử lý tiếp.
 * @module product/validation
 */

const { check } = require("express-validator");
const { runValidation } = require("../../middlewares/validation");

/**
 * Đối tượng chứa các mảng middleware xác thực dữ liệu cho Sản phẩm.
 * @namespace ProductValidation
 */
const ProductValidation = {
  /**
   * Middleware kiểm tra dữ liệu khi tạo mới sản phẩm.
   * Yêu cầu `name` không được để trống và `price` phải là số.
   * @type {Array<Function>}
   */
  validateCreate: [
    check("name").notEmpty().withMessage("Tên sản phẩm là bắt buộc"),
    check("price").isNumeric().withMessage("Giá sản phẩm phải là một số"),
    runValidation
  ],

  /**
   * Middleware kiểm tra dữ liệu khi cập nhật sản phẩm.
   * `name` và `price` là không bắt buộc nhưng nếu có thì phải hợp lệ.
   * @type {Array<Function>}
   */
  validateUpdate: [
    check("name").optional().notEmpty().withMessage("Tên sản phẩm không được để trống"),
    check("price").optional().isNumeric().withMessage("Giá sản phẩm phải là một số"),
    runValidation
  ]
};

module.exports = ProductValidation;
