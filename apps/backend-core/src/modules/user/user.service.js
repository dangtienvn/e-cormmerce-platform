/**
 * @fileoverview Module này chứa các nghiệp vụ logic (Business Logic) cốt lõi liên quan đến quản lý người dùng.
 * Nó đóng vai trò cầu nối xử lý dữ liệu giữa Controller và Repository.
 * @module UserService
 */
const AppError = require("../../utils/app-error");
const UserRepository = require("./user.repository");

const UserService = {
  /**
   * Lấy danh sách tất cả người dùng dựa trên các bộ lọc (filters).
   *
   * @async
   * @param {Object} filters - Các tiêu chí lọc (search, role, pagination...).
   * @returns {Promise<Array<Object>>} Danh sách người dùng phù hợp.
   */
  async getAllUsers(filters) {
    return await UserRepository.findAll(filters);
  },  

  /**
   * Lấy thông tin chi tiết của người dùng theo ID.
   *
   * @async
   * @param {number|string} id - ID của người dùng.
   * @returns {Promise<Object>} Dữ liệu chi tiết của người dùng.
   * @throws {AppError} Lỗi 400 nếu không tìm thấy người dùng.
   */
  async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError("Không tìm thấy người dùng", 400);
    return user;
  },

  /**
   * Tạo tài khoản người dùng mới cùng với các kiểm tra hợp lệ (validation) về tính duy nhất của dữ liệu.
   *
   * @async
   * @param {Object} data - Dữ liệu người dùng cần tạo.
   * @returns {Promise<Object>} Thông tin người dùng sau khi được tạo.
   * @throws {AppError} Lỗi 400 nếu username, email, hoặc số điện thoại đã tồn tại.
   */
  async createUser(data) {
    if (!data.email) {
      data.email = data.phone ? `${data.phone}@noemail.local` : `user_${Date.now()}@noemail.local`;
    }

    if (!data.password) {
      data.password = 'crm123456';
    }

    if (data.username) {
      const existingUser = await UserRepository.findByUsername(data.username);
      if (existingUser) throw new AppError("Tên đăng nhập đã tồn tại", 400);
    }
    
    if (data.email) {
      const existingEmail = await UserRepository.findOneByEmail(data.email);
      if (existingEmail) throw new AppError("Email đã tồn tại", 400);
    }

    if (data.phone) {
      const existingPhone = await UserRepository.findOneByPhone(data.phone);
      if (existingPhone) throw new AppError("Số điện thoại đã tồn tại", 400);
    }

    return await UserRepository.create(data);
  },

  /**
   * Cập nhật thông tin của một người dùng, có xử lý kiểm tra trùng lặp email/sđt và thay đổi mật khẩu nếu cần.
   *
   * @async
   * @param {number|string} id - ID của người dùng.
   * @param {Object} data - Dữ liệu cần cập nhật.
   * @returns {Promise<Object>} Dữ liệu người dùng sau khi đã cập nhật.
   * @throws {AppError} Lỗi 400 nếu không tìm thấy, trùng email/sđt, hoặc sai mật khẩu hiện tại.
   */
  async updateUser(id, data) {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError("Không tìm thấy người dùng", 400);

    if (data.email === "") {
      delete data.email;
    } else if (data.email && data.email !== user.email) {
      const existingEmail = await UserRepository.findOneByEmail(data.email);
      if (existingEmail && existingEmail.id !== parseInt(id)) {
        throw new AppError("Email đã tồn tại", 400);
      }
    }

    if (data.phone && data.phone !== user.phone) {
      const existingPhone = await UserRepository.findOneByPhone(data.phone);
      if (existingPhone && existingPhone.id !== parseInt(id)) {
        throw new AppError("Số điện thoại đã tồn tại", 400);
      }
    }
    
    if (data.newPassword) {
      if (data.currentPassword) {
        const isMatch = await UserRepository.matchPassword(data.currentPassword, user.password);
        if (!isMatch) throw new AppError("Mật khẩu hiện tại không chính xác", 400);
      }
      await UserRepository.setPassword(id, data.newPassword);
    }
    
    return await UserRepository.update(id, data);
  },

  /**
   * Xóa mềm một người dùng theo ID.
   *
   * @async
   * @param {number|string} id - ID của người dùng cần xóa.
   * @returns {Promise<boolean>} Kết quả xóa.
   * @throws {AppError} Lỗi 400 nếu không tìm thấy người dùng.
   */
  async deleteUser(id) {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError("Không tìm thấy người dùng", 400);
    return await UserRepository.delete(id);
  },

  /**
   * Lấy danh sách người dùng đã bị xóa mềm.
   *
   * @async
   * @param {Object} filters - Các tiêu chí lọc.
   * @returns {Promise<Array<Object>>} Danh sách người dùng trong thùng rác.
   */
  async getTrash(filters) {
    return await UserRepository.findTrash(filters);
  },

  /**
   * Khôi phục lại người dùng đã bị xóa mềm từ thùng rác.
   *
   * @async
   * @param {number|string} id - ID của người dùng cần khôi phục.
   * @returns {Promise<boolean>} Kết quả khôi phục.
   */
  async restoreUser(id) {
    return await UserRepository.restore(id);
  },

  /**
   * Thực hiện khóa (lock) tài khoản của một người dùng.
   *
   * @async
   * @param {number|string} id - ID của người dùng cần khóa.
   * @returns {Promise<boolean>} Kết quả khóa tài khoản.
   */
  async lockUser(id) {
    return await UserRepository.setLockStatus(id, true);
  },

  /**
   * Mở khóa (unlock) tài khoản đang bị khóa của một người dùng.
   *
   * @async
   * @param {number|string} id - ID của người dùng cần mở khóa.
   * @returns {Promise<boolean>} Kết quả mở khóa.
   */
  async unlockUser(id) {
    return await UserRepository.setLockStatus(id, false);
  }
};

module.exports = UserService;
