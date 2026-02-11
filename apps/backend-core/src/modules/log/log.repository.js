/**
 * @fileoverview Module repository cho chức năng quản lý lịch sử hệ thống (activity logs).
 * Đảm nhiệm giao tiếp trực tiếp với database thông qua Prisma ORM.
 */
const BaseRepository = require("../../shared/base.repository");
const { prisma } = require("../../config/database");

/**
 * Lớp thao tác cơ sở dữ liệu cho bảng activity_logs.
 * Kế thừa từ BaseRepository để cung cấp các phương thức cơ bản.
 */
class LogRepository extends BaseRepository {
  /**
   * Khởi tạo LogRepository và thiết lập tên bảng cơ sở dữ liệu là "activity_logs".
   */
  constructor() {
    super("activity_logs");
  }

  /**
   * Tìm kiếm và lấy danh sách các nhật ký hoạt động kèm theo thông tin người dùng.
   * Hỗ trợ tìm kiếm theo từ khóa, lọc theo người dùng và khoảng thời gian.
   *
   * @param {Object} filters - Đối tượng chứa các tiêu chí lọc.
   * @param {string} [filters.search=""] - Từ khóa tìm kiếm theo hành động hoặc mô tả.
   * @param {number|string} [filters.limit=100] - Số lượng bản ghi tối đa trả về.
   * @param {string} [filters.startDate] - Ngày bắt đầu để lọc (định dạng YYYY-MM-DD).
   * @param {string} [filters.endDate] - Ngày kết thúc để lọc (định dạng YYYY-MM-DD).
   * @param {number|string} [filters.userId] - ID của người dùng để lọc các log tương ứng.
   * @returns {Promise<Array<Object>>} Trả về danh sách các bản ghi nhật ký hoạt động kèm thông tin người dùng.
   */
  async findAll(filters = {}) {
    const { search = "", limit = 100, startDate, endDate, userId } = filters;
    const where = {};
    
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (userId) {
      where.user_id = parseInt(userId);
    }
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(`${startDate} 00:00:00`);
      if (endDate) where.created_at.lte = new Date(`${endDate} 23:59:59`);
    }

    const logs = await prisma.activity_logs.findMany({
      where,
      include: { users: true },
      orderBy: { created_at: 'desc' },
      take: Number(limit) || 100
    });
    
    return logs.map(l => ({
      ...l,
      user_full_name: l.users?.full_name,
      user_username: l.users?.username
    }));
  }

  /**
   * Ghi lại một hành động mới vào cơ sở dữ liệu.
   *
   * @param {number|string|null} user_id - ID của người dùng thực hiện hành động.
   * @param {string} action - Tên hành động được thực hiện (VD: CREATE, UPDATE).
   * @param {string} entity_type - Loại thực thể bị tác động (VD: user, order).
   * @param {number|string|null} entity_id - ID của thực thể bị tác động.
   * @param {string} [description=""] - Mô tả chi tiết về hành động (tùy chọn).
   * @returns {Promise<Object>} Trả về bản ghi log vừa được tạo.
   */
  async logAction(user_id, action, entity_type, entity_id, description = "") {
    return await prisma.activity_logs.create({
      data: {
        user_id: user_id ? parseInt(user_id) : null,
        action,
        entity_type,
        entity_id: entity_id ? parseInt(entity_id) : null,
        description
      }
    });
  }

  /**
   * Tìm kiếm và lấy danh sách log dựa trên một thực thể (entity) cụ thể.
   *
   * @param {string} entity_type - Tên loại thực thể (VD: product, customer).
   * @param {number|string} entity_id - ID của thực thể.
   * @returns {Promise<Array<Object>>} Trả về danh sách log của thực thể kèm thông tin người dùng.
   */
  async findByEntity(entity_type, entity_id) {
    const logs = await prisma.activity_logs.findMany({
      where: {
        entity_type,
        entity_id: parseInt(entity_id)
      },
      include: { users: true },
      orderBy: { created_at: 'desc' }
    });
    return logs.map(l => ({
      ...l,
      user_full_name: l.users?.full_name,
      user_username: l.users?.username
    }));
  }
}

module.exports = new LogRepository();
