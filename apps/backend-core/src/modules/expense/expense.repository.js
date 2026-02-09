/**
 * @fileoverview Repository xử lý tương tác cơ sở dữ liệu cho thực thể Chi phí (Expense).
 * @module ExpenseRepository
 */
const BaseRepository = require("../../shared/base.repository");
const { prisma } = require("../../config/database");

/**
 * Lớp kế thừa BaseRepository để thực hiện các thao tác CRUD với bảng expenses.
 * @class ExpenseRepository
 * @extends BaseRepository
 */
class ExpenseRepository extends BaseRepository {
  /**
   * Khởi tạo ExpenseRepository, thiết lập tên bảng là "expenses".
   * @constructor
   */
  constructor() {
    super("expenses");
  }

  /**
   * Tìm kiếm và lấy danh sách chi phí chưa bị xóa, hỗ trợ tìm kiếm theo tên chi phí hoặc tên sản phẩm liên kết.
   * @param {string} [search=""] - Từ khóa tìm kiếm.
   * @returns {Promise<Array<Object>>} Mảng chứa danh sách các chi phí kèm tên sản phẩm.
   */
  async findAll(search = "") {
    const where = { deleted_at: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { products: { name: { contains: search } } }
      ];
    }
    const expenses = await prisma.expenses.findMany({
      where,
      include: { products: true },
      orderBy: { id: 'desc' }
    });
    return expenses.map(e => ({
      ...e,
      product_name: e.products ? e.products.name : null
    }));
  }
}

module.exports = new ExpenseRepository();
