/**
 * @fileoverview Controller xử lý các yêu cầu HTTP (HTTP requests) liên quan đến quản lý danh mục.
 */
const CategoryService = require("./category.service");
const ResponseHelper = require("../../utils/response.helper");

/**
 * Đối tượng xử lý các request/response cho danh mục
 * @namespace CategoryController
 */
const CategoryController = {
  /**
   * Lấy danh sách tất cả các danh mục
   * @param {import("express").Request} req - Đối tượng Request từ Express, chứa query `search`
   * @param {import("express").Response} res - Đối tượng Response từ Express
   * @param {import("express").NextFunction} next - Hàm xử lý middleware tiếp theo
   * @returns {Promise<void>} Trả về JSON chứa danh sách danh mục
   */
  async getAll(req, res, next) {
    try {
      const { search } = req.query;
      const categories = await CategoryService.getAllCategories(search);
      return ResponseHelper.success(res, categories);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy thông tin chi tiết một danh mục theo định danh (ID)
   * @param {import("express").Request} req - Đối tượng Request chứa `id` trên URL (params)
   * @param {import("express").Response} res - Đối tượng Response
   * @param {import("express").NextFunction} next - Hàm xử lý middleware tiếp theo
   * @returns {Promise<void>} Trả về JSON thông tin chi tiết của danh mục
   */
  async getById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      return ResponseHelper.success(res, category);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý yêu cầu tạo danh mục mới
   * @param {import("express").Request} req - Đối tượng Request chứa dữ liệu tạo danh mục (body)
   * @param {import("express").Response} res - Đối tượng Response
   * @param {import("express").NextFunction} next - Hàm xử lý middleware tiếp theo
   * @returns {Promise<void>} Trả về JSON chứa thông tin danh mục vừa được tạo
   */
  async create(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return ResponseHelper.created(res, category);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý yêu cầu cập nhật thông tin một danh mục
   * @param {import("express").Request} req - Đối tượng Request chứa `id` trên URL và dữ liệu mới trong body
   * @param {import("express").Response} res - Đối tượng Response
   * @param {import("express").NextFunction} next - Hàm xử lý middleware tiếp theo
   * @returns {Promise<void>} Trả về JSON chứa thông tin danh mục sau khi được cập nhật
   */
  async update(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      return ResponseHelper.success(res, category);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý yêu cầu xóa (mềm) danh mục
   * @param {import("express").Request} req - Đối tượng Request chứa `id` cần xóa
   * @param {import("express").Response} res - Đối tượng Response
   * @param {import("express").NextFunction} next - Hàm xử lý middleware tiếp theo
   * @returns {Promise<void>} Trả về JSON thông báo xóa thành công
   */
  async delete(req, res, next) {
    try {
      await CategoryService.deleteCategory(req.params.id);
      return ResponseHelper.success(res, null, "Xóa danh mục thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách các danh mục trong thùng rác
   * @param {import("express").Request} req - Đối tượng Request chứa query `search`
   * @param {import("express").Response} res - Đối tượng Response
   * @param {import("express").NextFunction} next - Hàm xử lý middleware tiếp theo
   * @returns {Promise<void>} Trả về JSON danh sách các danh mục đã bị xóa
   */
  async getTrash(req, res, next) {
    try {
      const { search } = req.query;
      const categories = await CategoryService.getTrash(search);
      return ResponseHelper.success(res, categories);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý yêu cầu khôi phục danh mục từ thùng rác
   * @param {import("express").Request} req - Đối tượng Request chứa `id` cần khôi phục
   * @param {import("express").Response} res - Đối tượng Response
   * @param {import("express").NextFunction} next - Hàm xử lý middleware tiếp theo
   * @returns {Promise<void>} Trả về JSON thông báo khôi phục thành công
   */
  async restore(req, res, next) {
    try {
      await CategoryService.restoreCategory(req.params.id);
      return ResponseHelper.success(res, null, "Khôi phục danh mục thành công");
    } catch (error) {
      next(error);
    }
  }
};

module.exports = CategoryController;
