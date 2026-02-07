/**
 * @fileoverview Service xử lý các logic nghiệp vụ (business logic) liên quan đến quản lý danh mục.
 */

const AppError = require("../../utils/app-error");
const CategoryRepository = require("./category.repository");

/**
 * Đối tượng xử lý các nghiệp vụ của Category (Danh mục)
 * @namespace CategoryService
 */
const CategoryService = {
  /**
   * Lấy danh sách tất cả danh mục, có hỗ trợ tìm kiếm
   * @param {string} search - Từ khóa tìm kiếm
   * @returns {Promise<Array<Object>>} Danh sách các danh mục
   */
  async getAllCategories(search) {
    return await CategoryRepository.findAll(search);
  },

  /**
   * Lấy thông tin chi tiết một danh mục dựa trên ID
   * @param {number|string} id - Định danh của danh mục
   * @returns {Promise<Object>} Thông tin chi tiết của danh mục
   * @throws {AppError} Ném ra lỗi 400 nếu không tìm thấy danh mục
   */
  async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw new AppError("Không tìm thấy danh mục", 400);
    return category;
  },

  /**
   * Tạo mới một danh mục
   * @param {Object} data - Dữ liệu danh mục mới
   * @param {string} data.name - Tên của danh mục
   * @returns {Promise<Object>} Dữ liệu danh mục vừa được tạo
   * @throws {AppError} Ném ra lỗi 400 nếu tên trống hoặc tên danh mục đã tồn tại
   */
  async createCategory(data) {
    const { name } = data;
    if (!name || !name.trim()) {
      throw new AppError("Tên danh mục không được để trống", 400);
    }
    const exists = await CategoryRepository.findByName(name.trim());
    if (exists) {
      throw new AppError("Tên danh mục đã tồn tại", 400);
    }
    return await CategoryRepository.create({ name: name.trim() });
  },

  /**
   * Cập nhật thông tin của một danh mục hiện có
   * @param {number|string} id - ID của danh mục cần cập nhật
   * @param {Object} data - Dữ liệu cập nhật
   * @param {string} data.name - Tên mới của danh mục
   * @returns {Promise<Object>} Thông tin danh mục sau khi cập nhật thành công
   * @throws {AppError} Ném ra lỗi 400 nếu dữ liệu không hợp lệ, không tìm thấy danh mục hoặc tên mới đã bị trùng
   */
  async updateCategory(id, data) {
    const { name } = data;
    if (!name || !name.trim()) {
      throw new AppError("Tên danh mục không được để trống", 400);
    }
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new AppError("Không tìm thấy danh mục", 400);
    }
    const exists = await CategoryRepository.findByName(name.trim());
    if (exists && exists.id !== Number(id)) {
      throw new AppError("Tên danh mục đã tồn tại", 400);
    }
    return await CategoryRepository.update(id, { name: name.trim() });
  },

  /**
   * Xóa mềm (soft delete) một danh mục (chuyển vào thùng rác)
   * @param {number|string} id - ID của danh mục cần xóa
   * @returns {Promise<Object>} Kết quả của thao tác xóa
   * @throws {AppError} Ném ra lỗi 400 nếu không tìm thấy danh mục
   */
  async deleteCategory(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new AppError("Không tìm thấy danh mục", 400);
    }
    return await CategoryRepository.delete(id);
  },

  /**
   * Lấy danh sách các danh mục đã bị xóa mềm (nằm trong thùng rác)
   * @param {string} search - Từ khóa tìm kiếm
   * @returns {Promise<Array<Object>>} Danh sách các danh mục trong thùng rác
   */
  async getTrash(search) {
    return await CategoryRepository.findTrash(search);
  },

  /**
   * Khôi phục một danh mục từ thùng rác
   * @param {number|string} id - ID của danh mục cần khôi phục
   * @returns {Promise<Object>} Kết quả thao tác khôi phục
   */
  async restoreCategory(id) {
    return await CategoryRepository.restore(id);
  }
};

module.exports = CategoryService;
