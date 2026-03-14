/**
 * @fileoverview Module service chứa logic nghiệp vụ liên quan đến mã giảm giá (Voucher).
 */
const AppError = require("../../utils/app-error");
const VoucherRepository = require("./voucher.repository");

/**
 * @class VoucherService
 * @description Xử lý các logic nghiệp vụ (business logic) của mã giảm giá
 */
const VoucherService = {
  /**
   * Lấy danh sách tất cả các mã giảm giá
   * @param {string} [search] - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách các mã giảm giá
   */
  async getAllVouchers(search) {
    return await VoucherRepository.findAll(search);
  },

  /**
   * Tạo một mã giảm giá mới
   * @param {Object} data - Dữ liệu đầu vào để tạo mã giảm giá
   * @param {string} data.code - Mã code giảm giá
   * @param {number} data.discount_percent - Phần trăm giảm giá
   * @throws {AppError} Lỗi nếu thiếu thông tin bắt buộc hoặc mã code đã tồn tại
   * @returns {Promise<Object>} Thông tin mã giảm giá vừa tạo
   */
  async createVoucher(data) {
    if (!data.code || !data.discount_percent) {
      throw new AppError("Code and discount_percent are required", 400);
    }
    const existing = await VoucherRepository.findByCode(data.code);
    if (existing) {
      throw new AppError("Voucher code already exists", 400);
    }
    const id = await VoucherRepository.create(data);
    return { id, ...data };
  },

  /**
   * Cập nhật thông tin mã giảm giá
   * @param {number|string} id - ID của mã giảm giá
   * @param {Object} data - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Thông tin mã giảm giá sau khi cập nhật
   */
  async updateVoucher(id, data) {
    return await VoucherRepository.update(id, data);
  },

  /**
   * Xóa mềm một mã giảm giá (đưa vào thùng rác)
   * @param {number|string} id - ID của mã giảm giá
   * @returns {Promise<boolean>}
   */
  async deleteVoucher(id) {
    return await VoucherRepository.delete(id);
  },

  /**
   * Lấy danh sách mã giảm giá trong thùng rác
   * @param {string} [search] - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách mã giảm giá đã bị xóa mềm
   */
  async getTrash(search) {
    return await VoucherRepository.findTrash(search);
  },

  /**
   * Khôi phục mã giảm giá từ thùng rác
   * @param {number|string} id - ID của mã giảm giá
   * @returns {Promise<boolean>}
   */
  async restoreVoucher(id) {
    return await VoucherRepository.restore(id);
  },

  /**
   * Xóa vĩnh viễn mã giảm giá khỏi hệ thống
   * @param {number|string} id - ID của mã giảm giá
   * @returns {Promise<boolean>}
   */
  async forceDelete(id) {
    return await VoucherRepository.hardDelete(id);
  },

  /**
   * Kiểm tra tính hợp lệ của mã giảm giá áp dụng cho đơn hàng
   * @param {string} code - Mã code của voucher
   * @param {number} [orderTotal=0] - Tổng giá trị đơn hàng
   * @throws {AppError} Lỗi nếu mã không tồn tại, khóa, hết hạn, hết lượt, hoặc không đủ điều kiện
   * @returns {Promise<Object>} Thông tin mã giảm giá hợp lệ
   */
  async checkVoucher(code, orderTotal = 0) {
    if (!code) throw new AppError("Code is required", 400);
    
    const voucher = await VoucherRepository.findByCode(code);
    if (!voucher) throw new AppError("Mã giảm giá không tồn tại", 400);
    if (!voucher.is_active) throw new AppError("Mã giảm giá đã bị khóa", 400);
    
    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      throw new AppError("Mã giảm giá đã hết hạn", 400);
    }
    
    if (voucher.max_uses > 0 && voucher.used_count >= voucher.max_uses) {
      throw new AppError("Mã giảm giá đã hết lượt sử dụng", 400);
    }

    if (voucher.min_order_value && Number(orderTotal) < Number(voucher.min_order_value)) {
      throw new AppError(`Mã giảm giá yêu cầu đơn hàng tối thiểu ${Number(voucher.min_order_value, 400).toLocaleString('vi-VN')}đ`);
    }

    return voucher;
  }
};

module.exports = VoucherService;
