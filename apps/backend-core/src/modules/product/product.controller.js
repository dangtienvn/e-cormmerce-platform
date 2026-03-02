/**
 * @fileoverview Controller xử lý các yêu cầu HTTP liên quan đến thực thể Sản phẩm (Product).
 * Chịu trách nhiệm tiếp nhận request, gọi service tương ứng và trả về response cho client.
 * @module product/controller
 */

const ProductService = require("./product.service");
const ResponseHelper = require("../../utils/response.helper");

/**
 * Controller chứa các hàm xử lý API của sản phẩm
 * @namespace ProductController
 */
const ProductController = {
  /**
   * Lấy danh sách sản phẩm với các điều kiện phân trang và tìm kiếm.
   * @async
   * @function getAll
   * @param {Object} req - Request object của Express chứa `query` (search, page, limit) và `user`.
   * @param {Object} res - Response object của Express dùng để trả về kết quả.
   * @param {Function} next - Middleware next() để chuyển lỗi cho error handler.
   * @returns {Promise<void>} Trả về JSON chứa danh sách sản phẩm.
   */
  async getAll(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const products = await ProductService.getAllProducts(search, req.user, page, limit);
      return ResponseHelper.success(res, products);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy thông tin chi tiết một sản phẩm dựa trên ID.
   * @async
   * @function getById
   * @param {Object} req - Request object chứa `params.id`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa chi tiết sản phẩm.
   */
  async getById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return ResponseHelper.success(res, product);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo mới một sản phẩm.
   * @async
   * @function create
   * @param {Object} req - Request object chứa dữ liệu sản phẩm trong `body` và thông tin người tạo trong `user`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa thông tin sản phẩm vừa tạo.
   */
  async create(req, res, next) {
    try {
      const productData = { ...req.body };
      const product = await ProductService.createProduct(productData, req.user);
      return ResponseHelper.created(res, product);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật thông tin một sản phẩm đã có.
   * @async
   * @function update
   * @param {Object} req - Request object chứa `params.id` và dữ liệu cần cập nhật trong `body`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa thông tin sản phẩm đã được cập nhật.
   */
  async update(req, res, next) {
    try {
      const productData = { ...req.body };
      const product = await ProductService.updateProduct(req.params.id, productData, req.user);
      return ResponseHelper.success(res, product);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa một sản phẩm (thường là xóa mềm - soft delete).
   * @async
   * @function delete
   * @param {Object} req - Request object chứa `params.id` và thông tin người xóa trong `user`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về thông báo xóa thành công.
   */
  async delete(req, res, next) {
    try {
      await ProductService.deleteProduct(req.params.id, req.user);
      return ResponseHelper.success(res, null, "Xóa sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách sản phẩm đã bị xóa (thùng rác).
   * @async
   * @function getTrash
   * @param {Object} req - Request object chứa điều kiện tìm kiếm `query.search` và `user`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa danh sách sản phẩm trong thùng rác.
   */
  async getTrash(req, res, next) {
    try {
      const { search } = req.query;
      const products = await ProductService.getTrash(search, req.user);
      return ResponseHelper.success(res, products);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Khôi phục một sản phẩm đã bị xóa từ thùng rác.
   * @async
   * @function restore
   * @param {Object} req - Request object chứa `params.id` và `user`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về thông báo khôi phục thành công.
   */
  async restore(req, res, next) {
    try {
      await ProductService.restoreProduct(req.params.id, req.user);
      return ResponseHelper.success(res, null, "Khôi phục sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách các đánh giá (reviews) của một sản phẩm.
   * @async
   * @function getReviews
   * @param {Object} req - Request object chứa `params.id`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa danh sách đánh giá.
   */
  async getReviews(req, res, next) {
    try {
      const reviews = await ProductService.getProductReviews(req.params.id);
      return ResponseHelper.success(res, reviews);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo mới hoặc cập nhật đánh giá của người dùng cho một sản phẩm.
   * @async
   * @function createReview
   * @param {Object} req - Request object chứa `params.id`, `user.id`, và dữ liệu đánh giá trong `body`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa thông tin đánh giá vừa được tạo/cập nhật.
   */
  async createReview(req, res, next) {
    try {
      const review = await ProductService.createOrUpdateReview(req.params.id, req.user.id, req.body || {});
      return ResponseHelper.created(res, review, "Đánh giá sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách các đánh giá mới nhất trên hệ thống.
   * @async
   * @function getLatestReviews
   * @param {Object} req - Request object chứa tham số giới hạn số lượng `query.limit`.
   * @param {Object} res - Response object.
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về JSON chứa danh sách các đánh giá mới nhất.
   */
  async getLatestReviews(req, res, next) {
    try {
      const limit = Number(req.query.limit) || 3;
      const reviews = await ProductService.getLatestReviews(limit);
      return ResponseHelper.success(res, reviews);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý tải xuống sản phẩm, đồng thời ghi nhận log tải xuống.
   * @async
   * @function download
   * @param {Object} req - Request object chứa `params.id` của sản phẩm và `user.id`.
   * @param {Object} res - Response object để thực hiện chuyển hướng tải file (redirect).
   * @param {Function} next - Middleware next() để xử lý lỗi.
   * @returns {Promise<void>} Trả về chuyển hướng HTTP (302) đến URL tải xuống của sản phẩm.
   */
  async download(req, res, next) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const downloadUrl = await ProductService.processDownload(req.params.id, req.user.id, ipAddress, userAgent);
      res.redirect(302, downloadUrl);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ProductController;
