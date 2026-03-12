/**
 * @fileoverview Module repository xử lý các thao tác tương tác với cơ sở dữ liệu cho mã giảm giá (Voucher).
 */
const { prisma } = require("../../config/database");

/**
 * @class VoucherRepository
 * @description Lớp đảm nhiệm việc truy vấn, thêm, sửa, xóa dữ liệu mã giảm giá qua Prisma ORM
 */
class VoucherRepository {
  /**
   * Lấy danh sách tất cả các mã giảm giá (chưa bị xóa)
   * @param {string} [search=""] - Từ khóa tìm kiếm theo mã giảm giá
   * @returns {Promise<Array>} Danh sách các mã giảm giá
   */
  async findAll(search = "") {
    const where = { deleted_at: null };
    if (search) {
      where.code = { contains: search };
    }
    return await prisma.vouchers.findMany({
      where,
      orderBy: { id: 'desc' }
    });
  }

  /**
   * Lấy danh sách các mã giảm giá trong thùng rác (đã bị xóa mềm)
   * @param {string} [search=""] - Từ khóa tìm kiếm theo mã giảm giá
   * @returns {Promise<Array>} Danh sách các mã giảm giá trong thùng rác
   */
  async findTrash(search = "") {
    const where = { deleted_at: { not: null } };
    if (search) {
      where.code = { contains: search };
    }
    return await prisma.vouchers.findMany({
      where,
      orderBy: { deleted_at: 'desc' }
    });
  }
  
  /**
   * Tìm kiếm mã giảm giá dựa trên mã code
   * @param {string} code - Mã của voucher
   * @returns {Promise<Object|null>} Thông tin mã giảm giá hoặc null nếu không tìm thấy
   */
  async findByCode(code) {
    return await prisma.vouchers.findFirst({
      where: { code, deleted_at: null }
    });
  }

  /**
   * Tìm kiếm mã giảm giá dựa trên ID
   * @param {number|string} id - ID của mã giảm giá
   * @returns {Promise<Object|null>} Thông tin mã giảm giá hoặc null nếu không tìm thấy
   */
  async findById(id) {
    return await prisma.vouchers.findFirst({
      where: { id: parseInt(id), deleted_at: null }
    });
  }

  /**
   * Tạo mới một mã giảm giá
   * @param {Object} data - Dữ liệu của mã giảm giá cần tạo
   * @param {string} data.code - Mã giảm giá
   * @param {number} data.discount_percent - Phần trăm giảm giá
   * @param {number} [data.max_uses=0] - Số lần sử dụng tối đa
   * @param {number} [data.min_order_value=0.00] - Giá trị đơn hàng tối thiểu
   * @param {number} [data.max_discount_amount=null] - Số tiền giảm tối đa
   * @param {number} [data.usage_per_user=1] - Số lần sử dụng tối đa mỗi người dùng
   * @param {string|Date} [data.expiry_date=null] - Ngày hết hạn
   * @param {boolean} [data.is_active=true] - Trạng thái hoạt động
   * @returns {Promise<Object>} Thông tin mã giảm giá vừa được tạo
   */
  async create(data) {
    return await prisma.vouchers.create({
      data: {
        code: data.code,
        discount_percent: data.discount_percent,
        max_uses: data.max_uses !== undefined ? parseInt(data.max_uses) : 0,
        used_count: 0,
        min_order_value: data.min_order_value !== undefined ? parseFloat(data.min_order_value) : 0.00,
        max_discount_amount: data.max_discount_amount !== undefined ? parseFloat(data.max_discount_amount) : null,
        usage_per_user: data.usage_per_user !== undefined ? parseInt(data.usage_per_user) : 1,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true
      }
    });
  }

  /**
   * Cập nhật thông tin mã giảm giá
   * @param {number|string} id - ID của mã giảm giá cần cập nhật
   * @param {Object} data - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Dữ liệu mã giảm giá sau khi cập nhật
   */
  async update(id, data) {
    const updateData = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.discount_percent !== undefined) updateData.discount_percent = data.discount_percent;
    if (data.max_uses !== undefined) updateData.max_uses = parseInt(data.max_uses);
    if (data.used_count !== undefined) updateData.used_count = parseInt(data.used_count);
    if (data.min_order_value !== undefined) updateData.min_order_value = parseFloat(data.min_order_value);
    if (data.max_discount_amount !== undefined) updateData.max_discount_amount = parseFloat(data.max_discount_amount);
    if (data.usage_per_user !== undefined) updateData.usage_per_user = parseInt(data.usage_per_user);
    if (data.expiry_date !== undefined) updateData.expiry_date = data.expiry_date ? new Date(data.expiry_date) : null;
    if (data.is_active !== undefined) updateData.is_active = Boolean(data.is_active);

    return await prisma.vouchers.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  }

  /**
   * Xóa mềm một mã giảm giá (Cập nhật trường deleted_at)
   * @param {number|string} id - ID của mã giảm giá
   * @returns {Promise<boolean>} Trả về true nếu xóa thành công
   */
  async delete(id) {
    await prisma.vouchers.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });
    return true;
  }

  /**
   * Khôi phục mã giảm giá từ thùng rác (Xóa giá trị trường deleted_at)
   * @param {number|string} id - ID của mã giảm giá
   * @returns {Promise<boolean>} Trả về true nếu khôi phục thành công
   */
  async restore(id) {
    await prisma.vouchers.update({
      where: { id: parseInt(id) },
      data: { deleted_at: null }
    });
    return true;
  }

  /**
   * Tăng số lượng đã sử dụng của mã giảm giá thêm 1
   * @param {number|string} id - ID của mã giảm giá
   * @returns {Promise<boolean>} Trả về true nếu tăng thành công
   */
  async incrementUsage(id) {
    await prisma.vouchers.update({
      where: { id: parseInt(id) },
      data: { used_count: { increment: 1 } }
    });
    return true;
  }

  /**
   * Xóa vĩnh viễn một mã giảm giá khỏi cơ sở dữ liệu
   * @param {number|string} id - ID của mã giảm giá
   * @returns {Promise<boolean>} Trả về true nếu xóa thành công
   */
  async hardDelete(id) {
    await prisma.vouchers.delete({
      where: { id: parseInt(id) }
    });
    return true;
  }
}

module.exports = new VoucherRepository();
