/**
 * @fileoverview Controller xử lý các yêu cầu HTTP liên quan đến quản lý chi phí (Expense).
 * @module ExpenseController
 */
const ExpenseService = require("./expense.service");
const ResponseHelper = require("../../utils/response.helper");

/**
 * Controller chứa các phương thức xử lý API cho thực thể Chi phí (Expense).
 * @namespace ExpenseController
 */
const ExpenseController = {
  /**
   * Lấy danh sách tất cả chi phí.
   * @param {Object} req - Đối tượng HTTP Request (Express).
   * @param {Object} res - Đối tượng HTTP Response (Express).
   * @param {Function} next - Hàm callback chuyển tiếp (Express).
   * @returns {Promise<void>} Phản hồi danh sách chi phí dưới dạng JSON.
   */
  async getAll(req, res, next) {
    try {
      const expenses = await ExpenseService.getAllExpenses(req.query.search);
      return ResponseHelper.success(res, expenses);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách chi phí đã bị xóa (trong thùng rác).
   * @param {Object} req - Đối tượng HTTP Request.
   * @param {Object} res - Đối tượng HTTP Response.
   * @param {Function} next - Hàm callback chuyển tiếp.
   * @returns {Promise<void>} Phản hồi danh sách chi phí đã xóa.
   */
  async getTrash(req, res, next) {
    try {
      const expenses = await ExpenseService.getTrashExpenses(req.query.search);
      return ResponseHelper.success(res, expenses);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy thông tin chi tiết một chi phí theo ID.
   * @param {Object} req - Đối tượng HTTP Request.
   * @param {Object} res - Đối tượng HTTP Response.
   * @param {Function} next - Hàm callback chuyển tiếp.
   * @returns {Promise<void>} Phản hồi thông tin chi tiết chi phí.
   */
  async getById(req, res, next) {
    try {
      const expense = await ExpenseService.getExpenseById(req.params.id);
      return ResponseHelper.success(res, expense);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo mới một chi phí.
   * @param {Object} req - Đối tượng HTTP Request, chứa thông tin chi phí trong body.
   * @param {Object} res - Đối tượng HTTP Response.
   * @param {Function} next - Hàm callback chuyển tiếp.
   * @returns {Promise<void>} Phản hồi thông tin chi phí vừa tạo thành công.
   */
  async create(req, res, next) {
    try {
      const { name, amount, type, note, date, product_id } = req.body;
      const expense = await ExpenseService.createExpense({ name, amount, type, note, date, product_id }, req.user);
      return ResponseHelper.created(res, expense, "Thêm chi phí thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật thông tin một chi phí dựa theo ID.
   * @param {Object} req - Đối tượng HTTP Request, chứa ID trên param và dữ liệu cập nhật trong body.
   * @param {Object} res - Đối tượng HTTP Response.
   * @param {Function} next - Hàm callback chuyển tiếp.
   * @returns {Promise<void>} Phản hồi thông tin chi phí sau khi cập nhật.
   */
  async update(req, res, next) {
    try {
      const expense = await ExpenseService.updateExpense(req.params.id, req.body, req.user);
      return ResponseHelper.success(res, expense, "Cập nhật chi phí thành công");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa mềm (đưa vào thùng rác) một chi phí dựa theo ID.
   * @param {Object} req - Đối tượng HTTP Request.
   * @param {Object} res - Đối tượng HTTP Response.
   * @param {Function} next - Hàm callback chuyển tiếp.
   * @returns {Promise<void>} Phản hồi thông báo xóa thành công.
   */
  async delete(req, res, next) {
    try {
      await ExpenseService.deleteExpense(req.params.id, req.user);
      return ResponseHelper.success(res, null, "Đã chuyển vào thùng rác");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Khôi phục một chi phí đã bị xóa từ thùng rác.
   * @param {Object} req - Đối tượng HTTP Request.
   * @param {Object} res - Đối tượng HTTP Response.
   * @param {Function} next - Hàm callback chuyển tiếp.
   * @returns {Promise<void>} Phản hồi thông báo khôi phục thành công.
   */
  async restore(req, res, next) {
    try {
      await ExpenseService.restoreExpense(req.params.id, req.user);
      return ResponseHelper.success(res, null, "Khôi phục chi phí thành công");
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ExpenseController;
