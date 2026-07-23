/**
 * @fileoverview Service xử lý các logic nghiệp vụ (business logic) liên quan đến quản lý danh mục.
 */

const AppError = require("../../utils/app-error");
const CategoryRepository = require("./category.repository");

function buildCategoryTree(categories) {
  const map = new Map();
  const roots = [];

  categories.forEach(category => {
   map.set(category.id, { ...category, children: [] });
  });

  categories.forEach(category => {
   const node = map.get(category.id);
   if (category.parent_id && map.has(category.parent_id)) {
     map.get(category.parent_id).children.push(node);
   } else {
     roots.push(node);
   }
  });

  return roots;
}

function isDescendant(categories, parentId, childId) {
  const map = new Map();
  categories.forEach(category => {
   map.set(category.id, category.parent_id || null);
  });

  let current = parentId;
  while (current) {
   if (current === childId) {
     return true;
   }
   current = map.get(current) || null;
  }
  return false;
}

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
   * Lấy danh sách danh mục dưới dạng cây lồng nhau
   * @param {string} search - Từ khóa tìm kiếm
   * @returns {Promise<Array<Object>>} Cây danh mục
   */
  async getCategoryTree(search) {
   const categories = await CategoryRepository.findAllWithRelations(search);
   return buildCategoryTree(categories);
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
    const { name, status, parent_id } = data;
    if (!name || !name.trim()) {
      throw new AppError("Tên danh mục không được để trống", 400);
    }

    const trimmedName = name.trim();
    const exists = await CategoryRepository.findByName(trimmedName);
    if (exists) {
      throw new AppError("Tên danh mục đã tồn tại", 400);
    }

    const createData = { name: trimmedName };
    if (status && typeof status === 'string') {
      createData.status = status.trim();
    }

    if (parent_id !== undefined && parent_id !== null) {
      const parentCategory = await CategoryRepository.findById(parent_id);
      if (!parentCategory) {
        throw new AppError("Danh mục cha không tồn tại", 400);
      }
      createData.parent_id = parseInt(parent_id);
    }

    return await CategoryRepository.create(createData);
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
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new AppError("Không tìm thấy danh mục", 400);
    }

    const updateData = {};
    if (data.name !== undefined) {
      if (!data.name || !data.name.trim()) {
        throw new AppError("Tên danh mục không được để trống", 400);
      }
      const trimmedName = data.name.trim();
      const exists = await CategoryRepository.findByName(trimmedName);
      if (exists && exists.id !== Number(id)) {
        throw new AppError("Tên danh mục đã tồn tại", 400);
      }
      updateData.name = trimmedName;
    }

    if (data.status !== undefined) {
      if (data.status !== null && typeof data.status !== 'string') {
        throw new AppError("Status danh mục không hợp lệ", 400);
      }
      updateData.status = data.status === null ? null : data.status.trim();
    }

    if (data.parent_id !== undefined) {
      if (data.parent_id === null) {
        updateData.parent_id = null;
      } else {
        const parentId = parseInt(data.parent_id);
        if (Number.isNaN(parentId)) {
          throw new AppError("Giá trị parent_id không hợp lệ", 400);
        }
        if (parentId === Number(id)) {
          throw new AppError("Danh mục cha không thể trùng với chính nó", 400);
        }
        const parentCategory = await CategoryRepository.findById(parentId);
        if (!parentCategory) {
          throw new AppError("Danh mục cha không tồn tại", 400);
        }

        const categories = await CategoryRepository.findAllWithRelations();
        if (isDescendant(categories, parentId, Number(id))) {
          throw new AppError("Danh mục cha không được là con của danh mục hiện tại", 400);
        }

        updateData.parent_id = parentId;
      }
    }

    if (!Object.keys(updateData).length) {
      return category;
    }

    return await CategoryRepository.update(id, updateData);
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
