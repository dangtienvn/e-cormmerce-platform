/**
 * @fileoverview Middleware xác thực và phân quyền người dùng cho ứng dụng.
 * Cung cấp các hàm bảo vệ route, kiểm tra quyền admin, và xác thực token JWT.
 */

const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.repository");

/**
 * Lấy chuỗi khóa bí mật (secret) của JWT từ biến môi trường.
 * @throws {Error} Nếu biến môi trường JWT_SECRET chưa được cấu hình.
 * @returns {string} Khóa bí mật JWT.
 */
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

/**
 * Middleware bảo vệ route, yêu cầu người dùng phải đăng nhập hợp lệ.
 * Xác thực token JWT được gửi qua header Authorization và đính kèm thông tin người dùng vào request.
 * 
 * @param {import('express').Request} req - Đối tượng request của Express.
 * @param {import('express').Response} res - Đối tượng response của Express.
 * @param {import('express').NextFunction} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const JWT_SECRET = getJwtSecret();
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (user) {
        delete user.password;
        req.user = user;
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: "Không được cấp quyền, token bị lỗi" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Không được cấp quyền, không có token" });
  }
};

/**
 * Middleware kiểm tra quyền admin của người dùng.
 * Yêu cầu phải gọi middleware `protect` trước đó để có thông tin `req.user`.
 * 
 * @param {import('express').Request} req - Đối tượng request của Express.
 * @param {import('express').Response} res - Đối tượng response của Express.
 * @param {import('express').NextFunction} next - Hàm middleware tiếp theo.
 * @returns {void}
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role_name === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Không được cấp quyền, yêu cầu quyền admin" });
  }
};

/**
 * Middleware phân quyền động theo nhiều vai trò (role) khác nhau.
 * Kiểm tra xem người dùng hiện tại có nằm trong danh sách các quyền được phép truy cập hay không.
 * 
 * @param {...string} roles - Danh sách các tên quyền (role_name) được phép truy cập.
 * @returns {import('express').RequestHandler} Hàm middleware xác thực phân quyền.
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.role_name) {
    return res.status(401).json({ success: false, message: "Không được cấp quyền, chưa đăng nhập" });
  }

  const normalizedRoles = roles.map((role) => String(role).toLowerCase());
  const currentRole = String(req.user.role_name).toLowerCase();
  if (!normalizedRoles.includes(currentRole)) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện thao tác này" });
  }
  return next();
};

/**
 * Middleware xác thực tùy chọn. 
 * Nếu có token hợp lệ, nó sẽ giải mã và gắn thông tin người dùng vào request. 
 * Nếu không có token hoặc token không hợp lệ, nó vẫn cho phép đi tiếp (không báo lỗi).
 * 
 * @param {import('express').Request} req - Đối tượng request của Express.
 * @param {import('express').Response} res - Đối tượng response của Express.
 * @param {import('express').NextFunction} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const JWT_SECRET = getJwtSecret();
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        delete user.password;
        req.user = user;
      }
    } catch (error) {
      // Ignore error for optional
    }
  }
  next();
};

/**
 * Middleware kiểm tra xem người dùng có quyền (permission) cụ thể hay không.
 * Yêu cầu gọi middleware `protect` trước đó.
 * 
 * @param {string} requiredPermission - Tên quyền yêu cầu (ví dụ: "create_product").
 * @returns {import('express').RequestHandler}
 */
const requirePermission = (requiredPermission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Không được cấp quyền, chưa đăng nhập" });
  }

  // Admin mặc định có toàn quyền (tùy chọn)
  if (req.user.role_name === 'admin') {
    return next();
  }

  const userPermissions = req.user.permissions || [];
  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ success: false, message: `Bạn không có quyền thực hiện thao tác này (yêu cầu quyền: ${requiredPermission})` });
  }

  return next();
};

module.exports = { protect, admin, authorize, optionalProtect, requirePermission };
