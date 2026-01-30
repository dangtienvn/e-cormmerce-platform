/**
 * @fileoverview Module controller xử lý các yêu cầu liên quan đến xác thực người dùng (Authentication).
 * Bao gồm đăng ký, đăng nhập, quên mật khẩu và đặt lại mật khẩu.
 */

const AuthService = require("./auth.service");

/**
 * Đối tượng AuthController chứa các phương thức xử lý request/response cho xác thực.
 */
const AuthController = {
  /**
   * Xử lý yêu cầu đăng ký người dùng mới.
   * 
   * @param {Object} req - Đối tượng request của Express, chứa thông tin người dùng (name, email, password, phone) trong req.body.
   * @param {Object} res - Đối tượng response của Express dùng để trả về kết quả.
   * @param {Function} next - Hàm middleware tiếp theo của Express dùng để xử lý lỗi.
   * @returns {Promise<void>}
   */
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body || {};

      if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
      }

      const user = await AuthService.register({ 
        full_name: name, 
        phone,
        email, 
        password, 
        role: "customer"
      });

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý yêu cầu đăng nhập của người dùng.
   * 
   * @param {Object} req - Đối tượng request của Express, chứa email và password trong req.body.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware tiếp theo của Express dùng để xử lý lỗi.
   * @returns {Promise<Object|void>} Trả về JSON chứa token đăng nhập và thông tin người dùng nếu thành công.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email và password là bắt buộc" });
      }

      const data = await AuthService.login(email, password);

      return res.json({
        success: true,
        message: "Login thành công",
        ...data
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý yêu cầu quên mật khẩu, gửi email chứa liên kết/token để đặt lại mật khẩu.
   * 
   * @param {Object} req - Đối tượng request của Express, chứa email của người dùng trong req.body.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware tiếp theo của Express dùng để xử lý lỗi.
   * @returns {Promise<Object|void>} Trả về JSON thông báo đã xử lý yêu cầu.
   */
  async forgot(req, res, next) {
    try {
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ success: false, message: "Email là bắt buộc" });

      await AuthService.forgotPassword(email);

      return res.json({ success: true, message: "Nếu tài khoản tồn tại, bạn sẽ nhận được email để đặt lại mật khẩu" });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý yêu cầu đặt lại mật khẩu mới thông qua token.
   * 
   * @param {Object} req - Đối tượng request của Express, chứa token và password (mật khẩu mới) trong req.body.
   * @param {Object} res - Đối tượng response của Express.
   * @param {Function} next - Hàm middleware tiếp theo của Express dùng để xử lý lỗi.
   * @returns {Promise<Object|void>} Trả về JSON thông báo đặt lại mật khẩu thành công.
   */
  async reset(req, res, next) {
    try {
      const { token, password } = req.body || {};
      if (!token || !password) return res.status(400).json({ success: false, message: "Token và mật khẩu mới là bắt buộc" });

      await AuthService.resetPassword(token, password);

      return res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;
