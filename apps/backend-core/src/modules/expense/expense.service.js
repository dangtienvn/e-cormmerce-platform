/**
 * @fileoverview Dịch vụ xử lý logic nghiệp vụ cho thực thể Chi phí (Expense).
 * @module ExpenseService
 */

const AppError = require("../../utils/app-error");
const ExpenseRepository = require("./expense.repository");
const LogService = require("../log/log.service");

/**
 * Cung cấp các phương thức nghiệp vụ quản lý chi phí.
 * @namespace ExpenseService
 */
const ExpenseService = {
  /**
   * Lấy danh sách tất cả các chi phí.
   * @param {string} [search] - Từ khóa tìm kiếm.
   * @returns {Promise<Array<Object>>} Danh sách chi phí.
   */
  async getAllExpenses(search) {
    return await ExpenseRepository.findAll(search);
  },

  /**
   * Lấy danh sách các chi phí đã bị xóa (trong thùng rác).
   * @param {string} [search] - Từ khóa tìm kiếm.
   * @returns {Promise<Array<Object>>} Danh sách chi phí trong thùng rác.
   */
  async getTrashExpenses(search) {
    return await ExpenseRepository.findTrash(search);
  },

  /**
   * Lấy thông tin chi tiết một chi phí theo ID.
   * @param {number|string} id - ID của chi phí.
   * @returns {Promise<Object>} Dữ liệu chi phí tương ứng.
   * @throws {AppError} Ném lỗi 400 nếu không tìm thấy chi phí.
   */
  async getExpenseById(id) {
    const expense = await ExpenseRepository.findById(id);
    if (!expense) throw new AppError("Không tìm thấy chi phí", 400);
    return expense;
  },

  /**
   * Tạo mới một chi phí.
   * @param {Object} expenseData - Dữ liệu chi phí cần tạo.
   * @param {string} expenseData.name - Tên chi phí.
   * @param {number} expenseData.amount - Số tiền chi phí.
   * @param {string} expenseData.type - Loại chi phí.
   * @param {Object} [actor=null] - Thông tin người thực hiện hành động (để ghi log).
   * @returns {Promise<Object>} Chi phí vừa được tạo mới.
   * @throws {AppError} Ném lỗi 400 nếu thiếu dữ liệu bắt buộc.
   */
  async createExpense(expenseData, actor = null) {
    if (!expenseData.name || !expenseData.amount || !expenseData.type) {
      throw new AppError("Tên, số tiền và loại chi phí là bắt buộc", 400);
    }
    const expense = await ExpenseRepository.create(expenseData);
    if (actor) {
      await LogService.logAction(actor.id, "Thêm chi phí", "expense", expense.id, `Thêm chi phí: ${expense.name}`).catch(console.error);
    }
    return expense;
  },

  /**
   * Cập nhật thông tin một chi phí.
   * @param {number|string} id - ID của chi phí cần cập nhật.
   * @param {Object} expenseData - Dữ liệu chi phí cần cập nhật.
   * @param {string} expenseData.name - Tên chi phí.
   * @param {number} expenseData.amount - Số tiền chi phí.
   * @param {string} expenseData.type - Loại chi phí.
   * @param {Object} [actor=null] - Thông tin người thực hiện hành động (để ghi log).
   * @returns {Promise<Object>} Chi phí sau khi đã cập nhật.
   * @throws {AppError} Ném lỗi 400 nếu không tìm thấy chi phí hoặc thiếu dữ liệu bắt buộc.
   */
  async updateExpense(id, expenseData, actor = null) {
    await this.getExpenseById(id);
    if (!expenseData.name || !expenseData.amount || !expenseData.type) {
      throw new AppError("Tên, số tiền và loại chi phí là bắt buộc", 400);
    }
    const expense = await ExpenseRepository.update(id, expenseData);
    if (actor) {
      await LogService.logAction(actor.id, "Cập nhật chi phí", "expense", id, `Cập nhật chi phí ID: ${id}`).catch(console.error);
    }
    return expense;
  },

  /**
   * Xóa mềm (đưa vào thùng rác) một chi phí.
   * @param {number|string} id - ID của chi phí cần xóa.
   * @param {Object} [actor=null] - Thông tin người thực hiện hành động (để ghi log).
   * @returns {Promise<boolean>} Trả về true nếu xóa thành công.
   * @throws {AppError} Ném lỗi 400 nếu không tìm thấy chi phí.
   */
  async deleteExpense(id, actor = null) {
    await this.getExpenseById(id);
    await ExpenseRepository.delete(id);
    if (actor) {
      await LogService.logAction(actor.id, "Xóa chi phí vào thùng rác", "expense", id, `Xóa tạm chi phí ID: ${id}`).catch(console.error);
    }
    return true;
  },

  /**
   * Khôi phục một chi phí đã bị xóa từ thùng rác.
   * @param {number|string} id - ID của chi phí cần khôi phục.
   * @param {Object} [actor=null] - Thông tin người thực hiện hành động (để ghi log).
   * @returns {Promise<boolean>} Trả về true nếu khôi phục thành công.
   */
  async restoreExpense(id, actor = null) {
    await ExpenseRepository.restore(id);
    if (actor) {
      await LogService.logAction(actor.id, "Khôi phục chi phí", "expense", id, `Khôi phục chi phí ID: ${id}`).catch(console.error);
    }
    return true;
  }
};

module.exports = ExpenseService;
