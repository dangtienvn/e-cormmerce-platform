/**
 * @fileoverview Service xử lý các nghiệp vụ logic liên quan đến Sản phẩm (Product).
 * Chịu trách nhiệm tương tác với Repository, xác thực nghiệp vụ (business logic), 
 * xử lý hình ảnh, ghi log, và gửi thông báo.
 * @module product/service
 */

const AppError = require("../../utils/app-error");
const ProductRepository = require("./product.repository");
const NotificationService = require("../notification/notification.service");
const LogService = require("../log/log.service");

/**
 * Service xử lý logic nghiệp vụ cho sản phẩm
 * @namespace ProductService
 */
const ProductService = {
  /**
   * Lấy danh sách sản phẩm.
   * @async
   * @function getAllProducts
   * @param {string} search - Từ khóa tìm kiếm.
   * @param {Object} user - Đối tượng người dùng để phân quyền lấy dữ liệu.
   * @param {number|string|null} page - Số trang hiện tại.
   * @param {number|string|null} limit - Số bản ghi mỗi trang.
   * @returns {Promise<Array<Object>>} Danh sách sản phẩm.
   */
  async getAllProducts(search, user, page = null, limit = null) {
    return await ProductRepository.findAll(search, user, page, limit);
  },

  /**
   * Lấy thông tin chi tiết một sản phẩm dựa trên ID.
   * @async
   * @function getProductById
   * @param {number|string} id - ID của sản phẩm.
   * @throws {AppError} Lỗi 400 nếu không tìm thấy sản phẩm.
   * @returns {Promise<Object>} Thông tin sản phẩm.
   */
  async getProductById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) throw new AppError("Không tìm thấy sản phẩm", 400);
    return product;
  },

  /**
   * Tạo mới một sản phẩm. Xử lý lưu ảnh base64, ghi log và gửi thông báo nếu cần.
   * @async
   * @function createProduct
   * @param {Object} data - Dữ liệu sản phẩm mới.
   * @param {Object|null} [actor=null] - Người thực hiện thao tác tạo.
   * @throws {AppError} Lỗi 400 nếu trùng tên hoặc tải quá 5 ảnh.
   * @returns {Promise<Object>} Sản phẩm vừa tạo.
   */
  async createProduct(data, actor = null) {
    const productExists = await ProductRepository.findByName(data.name);
    if (productExists) {
      throw new AppError("Tên sản phẩm đã tồn tại", 400);
    }
    if (data.images && Array.isArray(data.images)) {
      if (data.images.length > 5) throw new AppError("Không thể tải lên quá 5 ảnh cho mỗi sản phẩm", 400);
      const FileUploadUtils = require("../../utils/file-upload");
      data.images = await Promise.all(data.images.map(img => FileUploadUtils.saveBase64Image(img)));
    }
    
    if (actor) data.created_by = actor.id;
    const product = await ProductRepository.create(data);

    if (actor) {
      await LogService.logAction(actor.id, "Tạo mới sản phẩm", "product", product.id, `Tạo mới sản phẩm: ${product.name}`).catch(console.error);
    }
    if (data.status === 'pending_review') {
      await NotificationService.notifyAdmins(`Sản phẩm chờ duyệt: ${product.name}`, `/src/pages/admin/products/create.html?edit=${product.id}`).catch(console.error);
    }
    
    return product;
  },

  /**
   * Cập nhật thông tin một sản phẩm.
   * Xử lý xác thực quyền, cập nhật trạng thái duyệt/từ chối, ghi log và thông báo tương ứng.
   * @async
   * @function updateProduct
   * @param {number|string} id - ID của sản phẩm cần cập nhật.
   * @param {Object} data - Dữ liệu cập nhật mới.
   * @param {Object|null} [actor=null] - Người thực hiện thao tác cập nhật.
   * @throws {AppError} Lỗi 400 nếu không tìm thấy, không có quyền, hoặc lỗi dữ liệu (như quá 5 ảnh).
   * @returns {Promise<Object>} Sản phẩm sau khi cập nhật.
   */
  async updateProduct(id, data, actor = null) {
    const product = await ProductRepository.findById(id);
    if (!product) throw new AppError("Không tìm thấy sản phẩm", 400);
    
    if (actor && actor.role_name === 'editor' && product.created_by !== actor.id) {
      throw new AppError("Bạn không có quyền sửa sản phẩm này", 400);
    }

    if (data.images && Array.isArray(data.images)) {
      if (data.images.length > 5) throw new AppError("Không thể tải lên quá 5 ảnh cho mỗi sản phẩm", 400);
      const FileUploadUtils = require("../../utils/file-upload");
      data.images = await Promise.all(data.images.map(img => FileUploadUtils.saveBase64Image(img)));
    }
    
    let logAction = "Cập nhật sản phẩm";
    let logDesc = `Cập nhật sản phẩm: ${product.name}`;

    if (data.status && data.status !== product.status) {
      if (data.status === 'pending_review') {
         logAction = "Gửi duyệt sản phẩm";
         logDesc = `Gửi yêu cầu duyệt sản phẩm: ${product.name}`;
         await NotificationService.notifyAdmins(`Sản phẩm chờ duyệt: ${product.name}`, `/src/pages/admin/products/create.html?edit=${id}`).catch(console.error);
      } else if (data.status === 'published') {
         logAction = "Phê duyệt sản phẩm";
         logDesc = `Phê duyệt sản phẩm: ${product.name}`;
         if (product.created_by) {
             await NotificationService.notifyUser(product.created_by, `Sản phẩm của bạn đã được duyệt: ${product.name}`, `/src/pages/admin/products/create.html?edit=${id}`).catch(console.error);
         }
      } else if (data.status === 'rejected') {
         logAction = "Từ chối sản phẩm";
         logDesc = `Từ chối sản phẩm: ${product.name} - Lý do: ${data.feedback || ''}`;
         if (product.created_by) {
             await NotificationService.notifyUser(product.created_by, `Sản phẩm của bạn bị từ chối duyệt: ${product.name}`, `/src/pages/admin/products/create.html?edit=${id}`).catch(console.error);
         }
      }
    }

    if (actor && actor.role_name === 'admin' && data.status === 'published') {
      data.approved_by = actor.id;
      data.approved_at = new Date();
    }

    const updatedProduct = await ProductRepository.update(id, data);
    
    if (actor) {
      await LogService.logAction(actor.id, logAction, "product", id, logDesc).catch(console.error);
    }

    return updatedProduct;
  },

  /**
   * Xóa mềm một sản phẩm (chỉ những người có quyền như tác giả hoặc admin mới được thực hiện).
   * @async
   * @function deleteProduct
   * @param {number|string} id - ID sản phẩm cần xóa.
   * @param {Object|null} [actor=null] - Người thực hiện thao tác xóa.
   * @throws {AppError} Lỗi 400 nếu không tìm thấy hoặc không có quyền.
   * @returns {Promise<boolean>} Trả về true nếu xóa thành công.
   */
  async deleteProduct(id, actor = null) {
    const product = await ProductRepository.findById(id);
    if (!product) throw new AppError("Không tìm thấy sản phẩm", 400);
    
    if (actor && actor.role_name === 'editor' && product.created_by !== actor.id) {
      throw new AppError("Bạn không có quyền xóa sản phẩm này", 400);
    }
    
    await ProductRepository.delete(id);
    if (actor) {
      await LogService.logAction(actor.id, "Xóa sản phẩm", "product", id, `Xóa sản phẩm: ${product.name}`).catch(console.error);
    }
    return true;
  },

  /**
   * Lấy danh sách sản phẩm trong thùng rác.
   * @async
   * @function getTrash
   * @param {string} search - Từ khóa tìm kiếm.
   * @param {Object} user - Người dùng yêu cầu để phân quyền hiển thị thùng rác.
   * @returns {Promise<Array<Object>>} Danh sách sản phẩm đã bị xóa.
   */
  async getTrash(search, user) {
    return await ProductRepository.findTrash(search, user);
  },

  /**
   * Khôi phục một sản phẩm đã xóa từ thùng rác.
   * @async
   * @function restoreProduct
   * @param {number|string} id - ID sản phẩm.
   * @param {Object|null} [actor=null] - Người thực hiện thao tác.
   * @throws {AppError} Lỗi 400 nếu không tìm thấy hoặc không có quyền.
   * @returns {Promise<boolean>} Trả về true nếu khôi phục thành công.
   */
  async restoreProduct(id, actor = null) {
    const product = await ProductRepository.findById(id);
    if (!product) throw new AppError("Không tìm thấy sản phẩm", 400);
    
    if (actor && actor.role_name === 'editor' && product.created_by !== actor.id) {
      throw new AppError("Bạn không có quyền khôi phục sản phẩm này", 400);
    }
    
    await ProductRepository.restore(id);
    if (actor) {
      await LogService.logAction(actor.id, "Khôi phục sản phẩm", "product", id, `Khôi phục sản phẩm (ID: ${id})`).catch(console.error);
    }
    return true;
  },

  /**
   * Lấy danh sách đánh giá của sản phẩm.
   * @async
   * @function getProductReviews
   * @param {number|string} productId - ID sản phẩm.
   * @throws {AppError} Lỗi 400 nếu không tìm thấy sản phẩm.
   * @returns {Promise<Array<Object>>} Danh sách đánh giá.
   */
  async getProductReviews(productId) {
    const product = await ProductRepository.findById(productId);
    if (!product) throw new AppError("Không tìm thấy sản phẩm", 400);
    return await ProductRepository.getReviews(productId);
  },

  /**
   * Thêm hoặc cập nhật đánh giá (review) của người dùng đối với một sản phẩm.
   * Chỉ cho phép đánh giá khi người dùng đã mua sản phẩm đó.
   * @async
   * @function createOrUpdateReview
   * @param {number|string} productId - ID sản phẩm.
   * @param {number|string} userId - ID người dùng.
   * @param {Object} data - Dữ liệu đánh giá gồm số sao (`rating`) và nội dung (`comment`).
   * @throws {AppError} Lỗi 400 nếu dữ liệu không hợp lệ hoặc người dùng chưa mua sản phẩm.
   * @returns {Promise<Object>} Thông tin đánh giá.
   */
  async createOrUpdateReview(productId, userId, data) {
    const product = await ProductRepository.findById(productId);
    if (!product) throw new AppError("Không tìm thấy sản phẩm", 400);

    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError("Số sao đánh giá phải từ 1 đến 5", 400);
    }

    const purchased = await ProductRepository.hasPurchased(userId, productId);
    if (!purchased) {
      throw new AppError("Bạn chỉ có thể đánh giá sản phẩm đã mua", 400);
    }

    const review = await ProductRepository.upsertReview(userId, productId, rating, data.comment);
    await NotificationService.notifyAdminsAndProductOwners(`Khách hàng vừa đánh giá ${rating} sao cho sản phẩm #${productId}.`, `/src/pages/admin/products/create.html?edit=${productId}`, [productId]).catch(console.error);
    return review;
  },

  /**
   * Lấy danh sách các đánh giá mới nhất trên hệ thống.
   * @async
   * @function getLatestReviews
   * @param {number} [limit=6] - Số lượng đánh giá muốn lấy.
   * @returns {Promise<Array<Object>>} Danh sách đánh giá.
   */
  async getLatestReviews(limit = 6) {
    return await ProductRepository.getLatestReviews(limit);
  },

  /**
   * Kiểm tra quyền và cấp liên kết tải xuống sản phẩm cho người dùng.
   * Ghi log lại quá trình tải xuống.
   * @async
   * @function processDownload
   * @param {number|string} productId - ID sản phẩm.
   * @param {number|string} userId - ID người dùng tải xuống.
   * @param {string|null} [ipAddress=null] - IP của người dùng.
   * @param {string|null} [userAgent=null] - Thông tin user-agent.
   * @returns {Promise<string>} URL để tải sản phẩm xuống.
   */
  async processDownload(productId, userId, ipAddress = null, userAgent = null) {
    const rawUrl = await ProductRepository.processDownload(productId, userId, ipAddress, userAgent);
    if (!rawUrl) return null;
    const StorageService = require("../../shared/storage/storage.service");
    // Sinh URL an toàn (Local hoặc S3) có hiệu lực
    return await StorageService.getDownloadLink(rawUrl);
  }
};

module.exports = ProductService;
