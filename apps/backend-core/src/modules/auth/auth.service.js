/**
 * @fileoverview Module dịch vụ (service) xử lý logic nghiệp vụ cho xác thực người dùng (Authentication).
 * Giao tiếp với cơ sở dữ liệu và các tiện ích khác như mã hóa, JWT, gửi email.
 */

const AppError = require("../../utils/app-error");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserRepository = require("../user/user.repository");
const PasswordResetRepository = require("../user/password-reset.repository");
const RefreshTokenRepository = require("./refresh-token.repository");
const EmailVerificationRepository = require("./email-verification.repository");
const { sendResetPasswordEmail, sendEmailVerification } = require("../../utils/mailer");
const TOKEN_CONFIG = {
  accessExpires: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  refreshExpiresDays: Number(process.env.REFRESH_TOKEN_DAYS) || 30
};

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

    // generate tokens
    const tokens = await this.generateTokensForUser(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      refreshExpiresAt: tokens.refreshExpiresAt,
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
  },

  /**
   * Generate access + refresh tokens for a user and persist refresh token hash.
   * @param {Object} user
   */
  async generateTokensForUser(user) {
    const payload = { id: user.id, email: user.email, role: user.role_name };
    const accessToken = jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_CONFIG.accessExpires });

    // refresh token: random string stored hashed in DB
    const refreshRaw = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshRaw).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_CONFIG.refreshExpiresDays * 24 * 3600 * 1000);

    await RefreshTokenRepository.create(user.id, refreshHash, expiresAt);

    return {
      accessToken,
      refreshToken: refreshRaw,
      refreshExpiresAt: expiresAt
    };
  },

  /**
   * Refresh access token using refresh token raw value. Rotates refresh token.
   * @param {string} refreshRaw
   */
  async refreshAccessToken(refreshRaw) {
    if (!refreshRaw) throw new AppError('Missing refresh token', 401);
    const refreshHash = crypto.createHash('sha256').update(refreshRaw).digest('hex');
    const record = await RefreshTokenRepository.findByTokenHash(refreshHash);
    if (!record) throw new AppError('Invalid refresh token', 401);

    const expiresAt = new Date(record.expires_at || record.expiresAt || record.expires);
    if (expiresAt.getTime() < Date.now()) {
      await RefreshTokenRepository.deleteById(record.id);
      throw new AppError('Refresh token expired', 401);
    }

    const user = await UserRepository.findById(record.user_id || record.userId);
    if (!user) throw new AppError('User not found', 400);

    // rotate refresh token: delete old & create new
    await RefreshTokenRepository.deleteById(record.id);
    const newRaw = crypto.randomBytes(64).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRaw).digest('hex');
    const newExpires = new Date(Date.now() + TOKEN_CONFIG.refreshExpiresDays * 24 * 3600 * 1000);
    await RefreshTokenRepository.create(user.id, newHash, newExpires);

    const payload = { id: user.id, email: user.email, role: user.role_name };
    const newAccess = jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_CONFIG.accessExpires });

    return { accessToken: newAccess, refreshToken: newRaw, refreshExpiresAt: newExpires };
  },

  async logout(refreshRaw) {
    if (!refreshRaw) return;
    const refreshHash = crypto.createHash('sha256').update(refreshRaw).digest('hex');
    await RefreshTokenRepository.deleteByTokenHash(refreshHash);
  },

  /**
   * Create email verification token and send verification email.
   * @param {Object} user
   */
  async sendEmailVerificationForUser(user) {
    const tokenRaw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days

    // remove existing
    await EmailVerificationRepository.deleteByUserId(user.id);
    await EmailVerificationRepository.createToken(user.id, tokenHash, expiresAt);

    await sendEmailVerification(user.email, tokenRaw);
  },

  async verifyEmail(tokenRaw) {
    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');
    const record = await EmailVerificationRepository.findByTokenHash(tokenHash);
    if (!record) throw new AppError('Invalid or expired verification token', 400);

    const expiresAt = new Date(record.expires_at || record.expiresAt || record.expires);
    if (expiresAt.getTime() < Date.now()) {
      await EmailVerificationRepository.deleteById(record.id);
      throw new AppError('Verification token expired', 400);
    }

    // mark user as verified
    await UserRepository.setEmailVerified(record.user_id || record.userId);
    await EmailVerificationRepository.deleteById(record.id);

    return true;
  }
};

module.exports = AuthService;
module.exports = AuthService;
