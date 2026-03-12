/**
 * @fileoverview Module controller xử lý các yêu cầu HTTP liên quan đến mã giảm giá (Voucher).
 */
const VoucherService = require("./voucher.service");
const ResponseHelper = require("../../utils/response.helper");

/**
 * @class VoucherController
 * @description Controller quản lý các chức năng của mã giảm giá (Voucher)
 */
const VoucherController = {
  /**
   * Lấy danh sách tất cả các mã giảm giá
   * @param {Object} req - Đối tượng request của Express
   * @param {Object} res - Đối tượng response của Express
   * @param {Function} next - Hàm middleware tiếp theo
   * @returns {Promise<void>}
   */
  async getAll(req, res, next) {
    try {
      const vouchers = await VoucherService.getAllVouchers(req.query.search);
      return ResponseHelper.success(res, vouchers);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo một mã giảm giá mới
   * @param {Object} req - Đối tượng request của Express
   * @param {Object} res - Đối tượng response của Express
   * @param {Function} next - Hàm middleware tiếp theo
   * @returns {Promise<void>}
   */
  async create(req, res, next) {
    try {
      const data = await VoucherService.createVoucher(req.body);
      return ResponseHelper.created(res, data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật thông tin mã giảm giá
   * @param {Object} req - Đối tượng request của Express
   * @param {Object} res - Đối tượng response của Express
   * @param {Function} next - Hàm middleware tiếp theo
   * @returns {Promise<void>}
   */
  async update(req, res, next) {
    try {
      await VoucherService.updateVoucher(req.params.id, req.body);
      return ResponseHelper.success(res, null, "Voucher updated");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa mềm một mã giảm giá (đưa vào thùng rác)
   * @param {Object} req - Đối tượng request của Express
   * @param {Object} res - Đối tượng response của Express
   * @param {Function} next - Hàm middleware tiếp theo
   * @returns {Promise<void>}
   */
  async delete(req, res, next) {
    try {
      await VoucherService.deleteVoucher(req.params.id);
      return ResponseHelper.success(res, null, "Đã chuyển mã giảm giá vào thùng rác");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách mã giảm giá trong thùng rác
   * @param {Object} req - Đối tượng request của Express
   * @param {Object} res - Đối tượng response của Express
   * @param {Function} next - Hàm middleware tiếp theo
   * @returns {Promise<void>}
   */
  async getTrash(req, res, next) {
    try {
      const vouchers = await VoucherService.getTrash(req.query.search);
      return ResponseHelper.success(res, vouchers);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Khôi phục mã giảm giá từ thùng rác
   * @param {Object} req - Đối tượng request của Express
   * @param {Object} res - Đối tượng response của Express
   * @param {Function} next - Hàm middleware tiếp theo
   * @returns {Promise<void>}
   */
  async restore(req, res, next) {
    try {
      await VoucherService.restoreVoucher(req.params.id);
      return ResponseHelper.success(res, null, "Khôi phục mã giảm giá thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa vĩnh viễn mã giảm giá khỏi hệ thống
   * @param {Object} req - Đối tượng request của Express
   * @param {Object} res - Đối tượng response của Express
   * @param {Function} next - Hàm middleware tiếp theo
   * @returns {Promise<void>}
   */
  async forceDelete(req, res, next) {
    try {
      await VoucherService.forceDelete(req.params.id);
      return ResponseHelper.success(res, null, "Xóa vĩnh viễn mã giảm giá thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Kiểm tra tính hợp lệ của mã giảm giá dựa trên mã code và tổng giá trị đơn hàng
   * @param {Object} req - Đối tượng request của Express
   * @param {Object} res - Đối tượng response của Express
   * @param {Function} next - Hàm middleware tiếp theo
   * @returns {Promise<void>}
   */
  async check(req, res, next) {
    try {
      const voucher = await VoucherService.checkVoucher(req.body.code, req.body.orderTotal || 0);
      return ResponseHelper.success(res, voucher);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = VoucherController;
