/**
 * @fileoverview Module này đóng vai trò là Controller xử lý các yêu cầu (requests) HTTP liên quan đến người dùng (User).
 * @module UserController
 */
const UserService = require("./user.service");
const ResponseHelper = require("../../utils/response.helper");
const cloudinary = require("../../config/cloudinary");

const UserController = {
  /**
   * Lấy danh sách tất cả người dùng kèm theo các bộ lọc tùy chọn.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa các tham số query (req.query).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async getAll(req, res, next) {
    try {
      const filters = { ...req.query };
      const users = await UserService.getAllUsers(filters);
      return ResponseHelper.success(res, users);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy thông tin chi tiết của một người dùng theo ID.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa ID người dùng trong tham số URL (req.params.id).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async getById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return ResponseHelper.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo một tài khoản người dùng mới.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa dữ liệu người dùng (req.body).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async create(req, res, next) {
    try {
      const payload = { ...req.body };
      const user = await UserService.createUser(payload);
      return ResponseHelper.created(res, user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật thông tin của một người dùng dựa theo ID.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa ID (req.params.id) và thông tin cần cập nhật (req.body).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async update(req, res, next) {
    try {
      const payload = { ...req.body };
      const user = await UserService.updateUser(req.params.id, payload);
      return ResponseHelper.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa mềm (soft delete) một người dùng theo ID.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa ID của người dùng cần xóa.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async delete(req, res, next) {
    try {
      await UserService.deleteUser(req.params.id);
      return ResponseHelper.success(res, null, "Xóa người dùng thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách người dùng đã bị xóa mềm (trong thùng rác).
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa các tham số bộ lọc.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async getTrash(req, res, next) {
    try {
      const filters = { ...req.query };
      const users = await UserService.getTrash(filters);
      return ResponseHelper.success(res, users);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Khôi phục tài khoản của một người dùng đã bị xóa mềm.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa ID của người dùng cần khôi phục.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async restore(req, res, next) {
    try {
      await UserService.restoreUser(req.params.id);
      return ResponseHelper.success(res, null, "Khôi phục người dùng thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Khóa (lock) tài khoản của một người dùng.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa ID của người dùng cần khóa.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async lockUser(req, res, next) {
    try {
      await UserService.lockUser(req.params.id);
      return ResponseHelper.success(res, null, "Khóa tài khoản thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mở khóa (unlock) tài khoản cho một người dùng.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa ID của người dùng cần mở khóa.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async unlockUser(req, res, next) {
    try {
      await UserService.unlockUser(req.params.id);
      return ResponseHelper.success(res, null, "Mở khóa tài khoản thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy thông tin cá nhân của người dùng đang đăng nhập (Profile).
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa thông tin người dùng được xác thực (req.user).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async getMyProfile(req, res, next) {
    try {
      const user = await UserService.getUserById(req.user.id);
      return ResponseHelper.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật thông tin cá nhân của người dùng đang đăng nhập.
   * (Loại bỏ các trường nhảy cảm như password, role_id, status)
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa thông tin cập nhật trong req.body.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void>}
   */
  async updateMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { password, role_id, status, ...updateData } = req.body;
      const user = await UserService.updateUser(userId, updateData);
      return ResponseHelper.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Thay đổi mật khẩu của người dùng đang đăng nhập.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa mật khẩu cũ (currentPassword) và mật khẩu mới (newPassword).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void|Object>} Trả về thông báo lỗi nếu dữ liệu không hợp lệ.
   */
  async changeMyPassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return ResponseHelper.error(res, "Vui lòng cung cấp mật khẩu cũ và mới");
      }
      await UserService.updateUser(userId, { currentPassword, newPassword });
      return ResponseHelper.success(res, null, "Đổi mật khẩu thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật ảnh đại diện (avatar) của người dùng đang đăng nhập.
   * Ảnh sẽ được tải lên dịch vụ Cloudinary.
   *
   * @async
   * @param {Object} req - Đối tượng request của Express chứa tệp hình ảnh được tải lên (req.file).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi.
   * @returns {Promise<void|Object>} Trả về URL của avatar mới.
   */
  async updateMyAvatar(req, res, next) {
    try {
      const userId = req.user.id;
      if (!req.file) {
        return ResponseHelper.error(res, "Không tìm thấy file ảnh");
      }

      // Tải lên Cloudinary bằng stream vì dùng memoryStorage
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "crm_avatars" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const result = await uploadPromise;
      const avatar_url = result.secure_url;

      // Cập nhật URL vào Database
      const user = await UserService.updateUser(userId, { avatar_url });
      
      return ResponseHelper.success(res, { avatar_url }, "Cập nhật Avatar thành công");
    } catch (error) {
      next(error);
    }
  }
};

module.exports = UserController;
