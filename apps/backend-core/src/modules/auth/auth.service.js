/**
 * @fileoverview Module dịch vụ (service) xử lý logic nghiệp vụ cho xác thực người dùng (Authentication).
 * Giao tiếp với cơ sở dữ liệu và các tiện ích khác như mã hóa, JWT, gửi email.
 */

const AppError = require("../../utils/app-error");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserRepository = require("../user/user.repository");
const PasswordResetRepository = require("../user/password-reset.repository");
const { sendResetPasswordEmail } = require("../../utils/mailer");

/**
 * Lấy khóa bí mật JWT từ biến môi trường.
 * 
 * @returns {string} Khóa bí mật JWT.
 * @throws {AppError} Ném lỗi nếu JWT_SECRET chưa được cấu hình.
 */
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not configured", 400);
  }
  return process.env.JWT_SECRET;
};

/**
 * Đối tượng AuthService chứa các phương thức nghiệp vụ liên quan đến xác thực.
 */
const AuthService = {
  /**
   * Xử lý logic đăng ký tài khoản người dùng mới.
   * 
   * @param {Object} userData - Dữ liệu người dùng cần đăng ký (bao gồm email, phone, ...).
   * @returns {Promise<Object>} Trả về thông tin người dùng vừa được tạo trong cơ sở dữ liệu.
   * @throws {AppError} Ném lỗi nếu email hoặc số điện thoại đã tồn tại.
   */
  async register(userData) {
    const { email, phone } = userData;
    const userExists = await UserRepository.findOneByEmail(email);
    if (userExists) {
      throw new AppError("Email này đã được sử dụng", 400);
    }
    
    // Số điện thoại là duy nhất 
    if (phone) {
      const phoneExists = await UserRepository.findOneByPhone(phone);
      if (phoneExists) {
        throw new AppError("Số điện thoại này đã được sử dụng", 400);
      }
    }

    return await UserRepository.create(userData);
  },

  /**
   * Xử lý logic đăng nhập người dùng.
   * 
   * @param {string} email - Email của người dùng.
   * @param {string} password - Mật khẩu của người dùng.
   * @returns {Promise<Object>} Trả về một đối tượng chứa JWT token và thông tin cơ bản của người dùng.
   * @throws {AppError} Ném lỗi nếu sai thông tin đăng nhập hoặc tài khoản bị khóa.
   */
  async login(email, password) {
    const user = await UserRepository.findOneByEmail(email);
    if (!user) {
      throw new AppError("Sai tài khoản hoặc mật khẩu", 400);
    }

    if (user.is_locked) {
      throw new AppError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.", 400);
    }

    const match = await UserRepository.matchPassword(password, user.password);
    if (!match) {
      throw new AppError("Sai tài khoản hoặc mật khẩu", 400);
    }

    const payload = { id: user.id, email: user.email, role: user.role_name };
    const expiresIn = (user.role_name === 'admin' || user.role_name === 'editor') ? '24h' : '30d';
    const token = jwt.sign(payload, getJwtSecret(), { expiresIn });

    return {
      token,
      user: {
        id: user.id,
        name: user.full_name || user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        role: user.role_name,
        avatar_url: user.avatar_url,
      }
    };
  },

  /**
   * Xử lý logic quên mật khẩu, tạo token và gửi email cho người dùng.
   * 
   * @param {string} email - Email của người dùng cần đặt lại mật khẩu.
   * @returns {Promise<void>} Hoàn thành không trả về dữ liệu.
   */
  async forgotPassword(email) {
    const user = await UserRepository.findOneByEmail(email);

    // Always return success to avoid user enumeration
    if (!user) {
      return;
    }

    // generate token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // remove existing tokens for user
    await PasswordResetRepository.deleteByUserId(user.id);

    await PasswordResetRepository.createToken(user.id, tokenHash, expiresAt);

    // send email (do not await to avoid leaking timing? we await to catch errors)
    await sendResetPasswordEmail(user.email, token);
  },

  /**
   * Xử lý logic đặt lại mật khẩu bằng cách kiểm tra token và cập nhật mật khẩu mới.
   * 
   * @param {string} token - Token đặt lại mật khẩu được cung cấp.
   * @param {string} newPassword - Mật khẩu mới cần cập nhật.
   * @returns {Promise<void>} Hoàn thành không trả về dữ liệu.
   * @throws {AppError} Ném lỗi nếu token không hợp lệ hoặc đã hết hạn.
   */
  async resetPassword(token, newPassword) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await PasswordResetRepository.findByTokenHash(tokenHash);
    if (!record) {
      throw new AppError("Token không hợp lệ hoặc đã hết hạn", 400);
    }

    const expiresAt = new Date(record.expires_at || record.expiresAt || record.expires);
    if (expiresAt.getTime() < Date.now()) {
      // expired
      await PasswordResetRepository.deleteById(record.id);
      throw new AppError("Token đã hết hạn", 400);
    }

    // update password
    await UserRepository.setPassword(record.user_id || record.userId, newPassword);

    // remove used token
    await PasswordResetRepository.deleteById(record.id);
  }
};

module.exports = AuthService;
