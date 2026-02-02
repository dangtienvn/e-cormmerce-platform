/**
 * @fileoverview Module Controller xử lý các yêu cầu liên quan đến giỏ hàng (Cart).
 * Chứa các logic để xử lý request lấy danh sách giỏ hàng, thêm sản phẩm, đồng bộ giỏ hàng, và xóa sản phẩm.
 */

const CartService = require('./cart.service');
const ResponseHelper = require('../../utils/response.helper');

/**
 * Controller quản lý các thao tác với giỏ hàng của người dùng.
 * @namespace CartController
 */
const CartController = {
  /**
   * Lấy danh sách sản phẩm trong giỏ hàng của người dùng hiện tại.
   * @async
   * @function getCart
   * @param {Object} req - Đối tượng request của Express, chứa thông tin người dùng (req.user).
   * @param {Object} res - Đối tượng response của Express dùng để trả về kết quả.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi nếu có.
   * @returns {Promise<void>} Trả về phản hồi JSON chứa danh sách các sản phẩm trong giỏ hàng.
   */
  async getCart(req, res, next) {
    try {
      const items = await CartService.getCart(req.user.id);
      return ResponseHelper.success(res, items);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Thêm một sản phẩm vào giỏ hàng của người dùng.
   * @async
   * @function addToCart
   * @param {Object} req - Đối tượng request của Express, chứa ID sản phẩm (req.body.productId) và thông tin người dùng (req.user).
   * @param {Object} res - Đối tượng response của Express dùng để trả về kết quả.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi nếu có.
   * @returns {Promise<void>} Trả về phản hồi JSON chứa thông tin sản phẩm vừa thêm vào giỏ.
   */
  async addToCart(req, res, next) {
    try {
      const { productId } = req.body;
      const item = await CartService.addToCart(req.user.id, productId);
      return ResponseHelper.success(res, item);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Đồng bộ giỏ hàng từ danh sách ID các sản phẩm.
   * Thường dùng khi đồng bộ giỏ hàng cục bộ (localStorage) lên máy chủ.
   * @async
   * @function syncCart
   * @param {Object} req - Đối tượng request của Express, chứa danh sách ID giỏ hàng (req.body.cartIds) và thông tin người dùng (req.user).
   * @param {Object} res - Đối tượng response của Express dùng để trả về kết quả.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi nếu có.
   * @returns {Promise<void>} Trả về phản hồi JSON chứa danh sách giỏ hàng sau khi đồng bộ.
   */
  async syncCart(req, res, next) {
    try {
      const { cartIds } = req.body;
      const items = await CartService.syncCart(req.user.id, cartIds);
      return ResponseHelper.success(res, items);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa một sản phẩm cụ thể khỏi giỏ hàng.
   * @async
   * @function removeFromCart
   * @param {Object} req - Đối tượng request của Express, chứa ID sản phẩm cần xóa trên URL params (req.params.productId).
   * @param {Object} res - Đối tượng response của Express dùng để trả về kết quả.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi nếu có.
   * @returns {Promise<void>} Trả về thông báo xóa thành công.
   */
  async removeFromCart(req, res, next) {
    try {
      const { productId } = req.params;
      await CartService.removeFromCart(req.user.id, parseInt(productId));
      return ResponseHelper.success(res, null, "Đã xóa khỏi giỏ");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa toàn bộ sản phẩm khỏi giỏ hàng của người dùng.
   * @async
   * @function clearCart
   * @param {Object} req - Đối tượng request của Express, chứa thông tin người dùng (req.user).
   * @param {Object} res - Đối tượng response của Express dùng để trả về kết quả.
   * @param {Function} next - Hàm middleware chuyển tiếp lỗi nếu có.
   * @returns {Promise<void>} Trả về thông báo xóa toàn bộ giỏ thành công.
   */
  async clearCart(req, res, next) {
    try {
      await CartService.clearCart(req.user.id);
      return ResponseHelper.success(res, null, "Đã xóa toàn bộ giỏ");
    } catch (error) {
      next(error);
    }
  }
};

module.exports = CartController;
