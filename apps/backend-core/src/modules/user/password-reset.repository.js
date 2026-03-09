/**
 * @fileoverview Module này chứa các phương thức tương tác với cơ sở dữ liệu (Database) phục vụ cho chức năng đặt lại mật khẩu (password reset).
 * @module PasswordResetRepository
 */
const { prisma } = require("../../config/database");

const PasswordResetRepository = {
  /**
   * Tạo một mã token mới để đặt lại mật khẩu lưu vào cơ sở dữ liệu.
   *
   * @async
   * @param {number} userId - ID của người dùng yêu cầu đặt lại mật khẩu.
   * @param {string} tokenHash - Chuỗi hash của token đặt lại mật khẩu.
   * @param {Date} expiresAt - Thời điểm token hết hạn.
   * @returns {Promise<{id: number}>} Promise chứa đối tượng có ID của bản ghi token vừa được tạo.
   */
  async createToken(userId, tokenHash, expiresAt) {
    const result = await prisma.password_resets.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt
      }
    });
    return { id: result.id };
  },

  /**
   * Tìm kiếm bản ghi yêu cầu đặt lại mật khẩu dựa trên chuỗi hash của token.
   *
   * @async
   * @param {string} tokenHash - Chuỗi hash của token cần tìm kiếm.
   * @returns {Promise<Object|null>} Promise chứa thông tin bản ghi kèm dữ liệu người dùng, hoặc null nếu không tìm thấy.
   */
  async findByTokenHash(tokenHash) {
    const record = await prisma.password_resets.findFirst({
      where: { token_hash: tokenHash },
      include: { users: true }
    });
    if (!record) return null;
    return {
      ...record,
      email: record.users?.email,
      user_id: record.users?.id
    };
  },

  /**
   * Xóa bản ghi token đặt lại mật khẩu dựa trên ID của bản ghi.
   *
   * @async
   * @param {number} id - ID của bản ghi token cần xóa.
   * @returns {Promise<void>}
   */
  async deleteById(id) {
    await prisma.password_resets.delete({
      where: { id }
    });
  },

  /**
   * Xóa tất cả các bản ghi token đặt lại mật khẩu liên quan đến một người dùng cụ thể.
   *
   * @async
   * @param {number} userId - ID của người dùng cần xóa các token đặt lại mật khẩu.
   * @returns {Promise<void>}
   */
  async deleteByUserId(userId) {
    await prisma.password_resets.deleteMany({
      where: { user_id: userId }
    });
  }
};

module.exports = PasswordResetRepository;
