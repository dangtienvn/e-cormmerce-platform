/**
 * @fileoverview Module này đảm nhận việc tương tác với cơ sở dữ liệu (Database) thông qua Prisma cho các nghiệp vụ liên quan đến người dùng (User).
 * @module UserRepository
 */
const { prisma } = require("../../config/database");
const bcrypt = require("bcryptjs");
const ALLOWED_ROLES = ["admin", "editor", "customer"];

const UserRepository = {
  /**
   * Tìm kiếm người dùng dựa trên địa chỉ email (chỉ tìm những người chưa bị xóa mềm).
   *
   * @async
   * @param {string} email - Địa chỉ email của người dùng.
   * @returns {Promise<Object|null>} Trả về thông tin người dùng kèm theo vai trò và hồ sơ khách hàng (nếu có), hoặc null nếu không tìm thấy.
   */
  async findOneByEmail(email) {
    const user = await prisma.users.findFirst({
      where: { email, deleted_at: null },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: { permissions: true }
            }
          }
        },
        customer_profiles: true
      }
    });
    if (!user) return null;
    const permissions = user.roles?.role_permissions?.map(rp => rp.permissions?.name) || [];
    return {
      ...user,
      role_name: user.roles?.name?.toLowerCase(),
      permissions,
      note: user.customer_profiles?.note,
      status: user.customer_profiles?.status,
      source: user.customer_profiles?.source,
      tag: user.customer_profiles?.tag
    };
  },

  /**
   * Tìm kiếm người dùng dựa trên số điện thoại (chỉ tìm những người chưa bị xóa mềm).
   *
   * @async
   * @param {string} phone - Số điện thoại của người dùng.
   * @returns {Promise<Object|null>} Trả về thông tin người dùng hoặc null.
   */
  async findOneByPhone(phone) {
    if (!phone) return null;
    const user = await prisma.users.findFirst({
      where: { phone, deleted_at: null }
    });
    return user;
  },

  /**
   * Tìm kiếm người dùng dựa trên ID (chỉ tìm những người chưa bị xóa mềm).
   *
   * @async
   * @param {number|string} id - ID của người dùng.
   * @returns {Promise<Object|null>} Trả về đối tượng người dùng có kèm thông tin mở rộng, hoặc null.
   */
  async findById(id) {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return null;
    const user = await prisma.users.findFirst({
      where: { id: parsedId, deleted_at: null },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: { permissions: true }
            }
          }
        },
        customer_profiles: true
      }
    });
    if (!user) return null;
    const permissions = user.roles?.role_permissions?.map(rp => rp.permissions?.name) || [];
    return {
      ...user,
      role_name: user.roles?.name?.toLowerCase(),
      permissions,
      note: user.customer_profiles?.note,
      status: user.customer_profiles?.status,
      source: user.customer_profiles?.source
    };
  },

  /**
   * Tạo một người dùng mới vào cơ sở dữ liệu, có xử lý mã hóa mật khẩu và tạo hồ sơ cho customer nếu cần.
   *
   * @async
   * @param {Object} userData - Đối tượng chứa thông tin người dùng mới.
   * @returns {Promise<Object>} Trả về đối tượng người dùng vừa tạo (không bao gồm mật khẩu).
   * @throws {Error} Ném lỗi nếu vai trò không hợp lệ hoặc không có trong hệ thống.
   */
  async create(userData) {
    const { 
      username, full_name, email, password, phone, role,
      address, note, interactions, source, status, tag 
    } = userData;

    const normalizedRole = (role || 'customer').toLowerCase();
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      throw new Error("Vai trò không hợp lệ");
    }
    
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Get role
    const roleRecord = await prisma.roles.findFirst({
      where: { name: normalizedRole }
    });
    if (!roleRecord) {
      throw new Error("Vai trò chưa được cấu hình trong hệ thống");
    }

    const newUser = await prisma.users.create({
      data: {
        username: username || null,
        full_name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role_id: roleRecord.id,
        address: address || null,
        note: note || null,
        interactions: interactions || 0,
        source: source || 'manual',
        status: status || 'lead',
        tag: tag || 'Normal',
        customer_profiles: normalizedRole === 'customer' ? {
          create: {
            source: source || 'manual',
            status: status || 'lead',
            tag: tag || 'Normal',
            note: note || null
          }
        } : undefined
      }
    });

    const { password: _, ...userWithoutPassword } = userData;
    return { id: newUser.id, ...userWithoutPassword };
  },

  /**
   * Kiểm tra mật khẩu đầu vào có khớp với mật khẩu đã được mã hóa lưu trong cơ sở dữ liệu hay không.
   *
   * @async
   * @param {string} enteredPassword - Mật khẩu do người dùng nhập.
   * @param {string} storedPassword - Mật khẩu đã được mã hóa trong hệ thống.
   * @returns {Promise<boolean>} Trả về true nếu mật khẩu khớp, ngược lại false.
   */
  async matchPassword(enteredPassword, storedPassword) {
    if (!storedPassword) return false;
    return await bcrypt.compare(enteredPassword, storedPassword);
  },

  /**
   * Thiết lập (cập nhật) mật khẩu mới cho người dùng.
   *
   * @async
   * @param {number|string} userId - ID của người dùng.
   * @param {string} newPassword - Mật khẩu mới dạng văn bản thuần.
   * @returns {Promise<void>}
   */
  async setPassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { password: hashedPassword }
    });
  },

  /**
   * Lấy danh sách tất cả người dùng với hỗ trợ bộ lọc, tìm kiếm và phân trang.
   *
   * @async
   * @param {Object} filters - Các tham số lọc, tìm kiếm, phân trang (search, role, source, tag, status, page, limit).
   * @returns {Promise<Array<Object>>} Trả về mảng danh sách người dùng phù hợp với điều kiện.
   */
  async findAll(filters = {}) {
    const { search = "", role = null, source = null, tag = null, status = null, page = null, limit = null } = filters;
    
    const whereClause = { deleted_at: null };
    
    if (role) {
      whereClause.roles = { name: role };
    }
    
    if (search) {
      whereClause.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    
    if (source && source !== 'all') {
      whereClause.customer_profiles = { ...whereClause.customer_profiles, source };
    }
    if (tag && tag !== 'all') {
      whereClause.customer_profiles = { ...whereClause.customer_profiles, tag };
    }
    if (status && status !== 'all') {
      whereClause.customer_profiles = { ...whereClause.customer_profiles, status };
    }

    const queryParams = {
      where: whereClause,
      include: {
        roles: true,
        customer_profiles: true
      },
      orderBy: { id: 'desc' }
    };

    if (page && limit) {
      queryParams.skip = (parseInt(page) - 1) * parseInt(limit);
      queryParams.take = parseInt(limit);
    }

    const users = await prisma.users.findMany(queryParams);

    return users.map(user => ({
      ...user,
      role_name: user.roles?.name?.toLowerCase(),
      note: user.customer_profiles?.note,
      status: user.customer_profiles?.status,
      source: user.customer_profiles?.source,
      tag: user.customer_profiles?.tag,
      total_spent: user.customer_profiles?.total_spent,
      total_orders: user.customer_profiles?.total_orders
    }));
  },

  /**
   * Tìm kiếm người dùng bằng tài khoản đăng nhập (hiện tại ánh xạ với trường email).
   *
   * @async
   * @param {string} username - Tài khoản / email của người dùng.
   * @returns {Promise<Object|null>} Trả về đối tượng người dùng hoặc null.
   */
  async findByUsername(username) {
    const user = await prisma.users.findFirst({
      where: { email: username, deleted_at: null },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: { permissions: true }
            }
          }
        }
      }
    });
    if (!user) return null;
    const permissions = user.roles?.role_permissions?.map(rp => rp.permissions?.name) || [];
    return {
      ...user,
      role_name: user.roles?.name?.toLowerCase(),
      permissions
    };
  },

  /**
   * Cập nhật thông tin của người dùng (bao gồm cả hồ sơ khách hàng nếu là role customer).
   *
   * @async
   * @param {number|string} id - ID của người dùng cần cập nhật.
   * @param {Object} userData - Các dữ liệu cần cập nhật.
   * @returns {Promise<Object>} Trả về thông tin người dùng sau khi đã cập nhật.
   */
  async update(id, userData) {
    const { 
      full_name, email, phone, role,
      note, source, status, tag, avatar_url
    } = userData;

    const dataToUpdate = { full_name, email, phone: phone || null };
    if (avatar_url !== undefined) {
      dataToUpdate.avatar_url = avatar_url;
    }

    await prisma.users.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    const user = await this.findById(id);
    if (user && user.role_name === 'customer') {
      const existingProfile = await prisma.customer_profiles.findUnique({
        where: { user_id: parseInt(id) }
      });
      if (existingProfile) {
        await prisma.customer_profiles.update({
          where: { user_id: parseInt(id) },
          data: { note, source, status, tag }
        });
      } else {
        await prisma.customer_profiles.create({
          data: { 
            user_id: parseInt(id), 
            note, 
            source: source || 'manual', 
            status: status || 'lead', 
            tag: tag || 'Normal' 
          }
        });
      }
    }

    return await this.findById(id);
  },

  /**
   * Thực hiện xóa mềm (soft delete) người dùng.
   *
   * @async
   * @param {number|string} id - ID của người dùng cần xóa.
   * @returns {Promise<boolean>} Trả về true nếu thành công.
   */
  async delete(id) {
    await prisma.users.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });
    return true;
  },

  /**
   * Lấy danh sách những người dùng đã bị xóa mềm (thùng rác), kèm hỗ trợ bộ lọc.
   *
   * @async
   * @param {Object} filters - Các tham số lọc, tìm kiếm.
   * @returns {Promise<Array<Object>>} Trả về mảng người dùng trong thùng rác.
   */
  async findTrash(filters = {}) {
    const { search = "", role = null, source = null, tag = null, status = null } = filters;
    
    const whereClause = { deleted_at: { not: null } };
    
    if (role) {
      whereClause.roles = { name: role };
    }
    
    if (search) {
      whereClause.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    
    if (source && source !== 'all') {
      whereClause.customer_profiles = { ...whereClause.customer_profiles, source };
    }
    if (tag && tag !== 'all') {
      whereClause.customer_profiles = { ...whereClause.customer_profiles, tag };
    }
    if (status && status !== 'all') {
      whereClause.customer_profiles = { ...whereClause.customer_profiles, status };
    }

    const users = await prisma.users.findMany({
      where: whereClause,
      include: {
        roles: true,
        customer_profiles: true
      },
      orderBy: { deleted_at: 'desc' }
    });

    return users.map(user => ({
      ...user,
      role_name: user.roles?.name?.toLowerCase(),
      note: user.customer_profiles?.note,
      status: user.customer_profiles?.status,
      source: user.customer_profiles?.source,
      tag: user.customer_profiles?.tag,
      total_spent: user.customer_profiles?.total_spent,
      total_orders: user.customer_profiles?.total_orders
    }));
  },

  /**
   * Khôi phục lại người dùng đã bị xóa mềm.
   *
   * @async
   * @param {number|string} id - ID của người dùng cần khôi phục.
   * @returns {Promise<boolean>} Trả về true nếu thành công.
   */
  async restore(id) {
    await prisma.users.update({
      where: { id: parseInt(id) },
      data: { deleted_at: null }
    });
    return true;
  },

  /**
   * Thay đổi trạng thái khóa/mở khóa tài khoản của người dùng.
   *
   * @async
   * @param {number|string} id - ID của người dùng.
   * @param {boolean} isLocked - Trạng thái khóa (true là khóa, false là mở).
   * @returns {Promise<boolean>} Trả về true nếu thao tác thành công.
   */
  async setLockStatus(id, isLocked) {
    await prisma.users.update({
      where: { id: parseInt(id) },
      data: { is_locked: isLocked }
    });
    return true;
  },

  /**
   * Đánh dấu email của người dùng đã được xác thực.
   * @async
   * @param {number|string} id
   */
  async setEmailVerified(id) {
    await prisma.users.update({
      where: { id: parseInt(id) },
      data: { email_verified_at: new Date() }
    });
    return true;
  }
};

module.exports = UserRepository;
