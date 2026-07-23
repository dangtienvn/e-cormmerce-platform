/**
 * @fileoverview Repository xử lý các thao tác với cơ sở dữ liệu cho bảng categories (danh mục).
 * Kế thừa từ BaseRepository để tái sử dụng các thao tác CRUD cơ bản.
 */
const BaseRepository = require("../../shared/base.repository");
const { prisma } = require("../../config/database");

/**
 * Lớp đại diện cho Category Repository quản lý truy xuất dữ liệu danh mục
 * @class
 * @extends BaseRepository
 */
class CategoryRepository extends BaseRepository {
  /**
  * Khởi tạo CategoryRepository và thiết lập tên bảng là "categories"
  * @constructor
  */
 constructor() {
   super("categories");
 }

 /**
  * Lấy danh sách tất cả danh mục, hỗ trợ tìm kiếm theo tên
  * @param {string} [search=""] - Từ khóa tìm kiếm
  * @returns {Promise<Array<Object>>} Danh sách các bản ghi danh mục
  */
 async findAll(search = "") {
   return super.findAll(search, ["name"]);
 }

 /**
  * Tìm kiếm danh mục theo tên chính xác (chỉ lấy các bản ghi chưa bị xóa)
  * @param {string} name - Tên danh mục cần tìm
  * @returns {Promise<Object|null>} Dữ liệu danh mục nếu tìm thấy, ngược lại trả về null
  */
 async findByName(name) {
   return await prisma.categories.findFirst({
     where: { name, deleted_at: null }
   });
 }

 /**
  * Tìm một danh mục theo ID trong các bản ghi chưa bị xóa
  * @param {number|string} id - ID của danh mục
  * @returns {Promise<Object|null>} Danh mục nếu tồn tại
  */
 async findById(id) {
   return await prisma.categories.findFirst({
     where: { id: parseInt(id), deleted_at: null }
   });
 }

 /**
  * Lấy toàn bộ danh mục chưa bị xóa, phục vụ xây dựng cây lồng nhau.
  * @param {string} [search=""] - Từ khóa tìm kiếm
  * @returns {Promise<Array<Object>>}
  */
 async findAllWithRelations(search = "") {
   const where = { deleted_at: null };
   if (search && search.trim()) {
     where.name = { contains: search.trim(), mode: 'insensitive' };
   }
   return await prisma.categories.findMany({
     where,
     orderBy: { id: 'desc' }
   });
 }
}

module.exports = new CategoryRepository();
