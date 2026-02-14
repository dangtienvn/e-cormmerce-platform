/**
 * @fileoverview Controller xử lý các HTTP request liên quan đến Đơn hàng (Order).
 * Tiếp nhận request từ client, gọi sang OrderService để xử lý logic, và trả về response.
 * @module modules/order/controller
 */

const OrderService = require("./order.service");
const ResponseHelper = require("../../utils/response.helper");

/**
 * Controller quản lý đơn hàng.
 */
const OrderController = {
  /**
   * API: Lấy danh sách tất cả các đơn hàng.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async getAll(req, res, next) {
    try {
      const { search, status, paymentMethod } = req.query;
      const bills = await OrderService.getAllOrders({ search, status, paymentMethod });
      return ResponseHelper.success(res, bills);
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Lấy thông tin chi tiết một đơn hàng theo ID.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async getById(req, res, next) {
    try {
      const bill = await OrderService.getOrderById(req.params.id, req.user);
      return ResponseHelper.success(res, bill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Quản trị viên hoặc nhân viên tạo đơn hàng mới.
   * 
   * @param {Object} req - Express request object, body chứa thông tin tạo đơn hàng.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async create(req, res, next) {
    try {
      if (req.user && req.user.id) {
        req.body.user_id = req.user.id;
      }
      const bill = await OrderService.createOrder(req.body);
      return ResponseHelper.created(res, bill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Cập nhật thông tin một đơn hàng (danh sách sản phẩm, giảm giá, phương thức thanh toán).
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async update(req, res, next) {
    try {
      const bill = await OrderService.updateOrder(req.params.id, req.body);
      return ResponseHelper.success(res, bill, "Cập nhật đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Khách hàng tự thực hiện thanh toán giỏ hàng (checkout).
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async checkout(req, res, next) {
    try {
      const userId = req.user.id;
      const bill = await OrderService.checkout(userId, {
        items: req.body?.items,
        payment_method: req.body?.payment_method,
        idempotency_key: req.body?.idempotency_key,
        billing_name: req.body?.billing_name,
        billing_phone: req.body?.billing_phone,
        billing_email: req.body?.billing_email,
        voucher_code: req.body?.voucher_code,
      });
      return ResponseHelper.created(res, bill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Xác nhận thanh toán thành công cho đơn hàng từ phía quản trị viên.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async confirmPayment(req, res, next) {
    try {
      const bill = await OrderService.confirmPayment(req.params.id, req.user);
      return ResponseHelper.success(res, bill, "Xác nhận thanh toán thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Nhận webhook từ SePay để tự động xác nhận đơn hàng khi khách hàng chuyển khoản thành công.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async sepayWebhook(req, res, next) {
    try {
      const token = req.headers['authorization'] || req.headers['x-sepay-token'] || req.body.apikey;
      if (process.env.SEPAY_API_TOKEN && token !== `Bearer ${process.env.SEPAY_API_TOKEN}` && token !== process.env.SEPAY_API_TOKEN) {
        return res.status(401).json({ success: false, message: "Unauthorized Webhook" });
      }
      await OrderService.processSepayWebhook(req.body);
      res.status(200).json({ success: true, message: "Webhook processed" });
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Xóa mềm một đơn hàng (chỉ khi ở trạng thái pending).
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async delete(req, res, next) {
    try {
      await OrderService.deleteOrder(req.params.id);
      return ResponseHelper.success(res, null, "Xóa hóa đơn thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Lấy danh sách các đơn hàng đã bị xóa mềm (thùng rác).
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async getTrash(req, res, next) {
    try {
      const { search, status, paymentMethod } = req.query;
      const bills = await OrderService.getTrash({ search, status, paymentMethod });
      return ResponseHelper.success(res, bills);
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Phục hồi lại đơn hàng đã bị xóa mềm.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async restore(req, res, next) {
    try {
      await OrderService.restoreOrder(req.params.id);
      return ResponseHelper.success(res, null, "Khôi phục đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Khách hàng xem danh sách các sản phẩm họ đã sở hữu (mua thành công).
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async getMyProducts(req, res, next) {
    try {
      const userId = req.user.id;
      const products = await OrderService.getMyProducts(userId);
      return ResponseHelper.success(res, products);
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Khách hàng xem lịch sử đơn hàng của chính họ.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async getMyOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await OrderService.getMyOrders(userId);
      return ResponseHelper.success(res, orders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Thu hồi quyền truy cập sản phẩm của một đơn hàng đã thanh toán.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async revokeOrder(req, res, next) {
    try {
      const orderId = req.params.id;
      await OrderService.revokeOrder(orderId);
      return ResponseHelper.success(res, null, "Thu hồi quyền truy cập thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * API: Gửi lại email xác nhận thanh toán thành công cho đơn hàng.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Promise<void>}
   */
  async resendEmail(req, res, next) {
    try {
      await OrderService.resendEmail(req.params.id);
      return ResponseHelper.success(res, null, "Đã gửi lại email thành công");
    } catch (error) {
      next(error);
    }
  }
};

module.exports = OrderController;
