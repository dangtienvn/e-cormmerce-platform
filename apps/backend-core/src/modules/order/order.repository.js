const { prisma } = require("../../config/database");

/**
 * @fileoverview Lớp Repository chịu trách nhiệm giao tiếp trực tiếp với database (thông qua Prisma) cho các thao tác liên quan đến Đơn hàng (Orders).
 * @module modules/order/repository
 */

/**
 * Lớp cung cấp các phương thức thao tác với dữ liệu đơn hàng trong cơ sở dữ liệu.
 */
class OrderRepository {
  /**
   * Lấy danh sách tất cả các đơn hàng chưa bị xóa (soft delete), có hỗ trợ lọc.
   * 
   * @param {Object} filters - Các điều kiện lọc.
   * @param {string} [filters.search] - Chuỗi tìm kiếm theo tên khách hàng hoặc ID đơn hàng.
   * @param {string} [filters.status] - Lọc theo trạng thái đơn hàng.
   * @param {string} [filters.paymentMethod] - Lọc theo phương thức thanh toán.
   * @returns {Promise<Array<Object>>} Danh sách đơn hàng kèm thông tin khách hàng và người tạo.
   */
  async findAll(filters = {}) {
    const { search = "", status = "", paymentMethod = "" } = filters;
    const where = { deleted_at: null };

    if (search) {
      where.OR = [
        { users_orders_customer_idTousers: { full_name: { contains: search } } }
      ];
      if (!isNaN(parseInt(search))) {
        where.OR.push({ id: parseInt(search) });
      }
    }
    if (status && status !== 'all') where.status = status;
    if (paymentMethod && paymentMethod !== 'all') where.payment_method = paymentMethod;

    const orders = await prisma.orders.findMany({
      where,
      include: {
        users_orders_customer_idTousers: true,
        users_orders_created_byTousers: true
      },
      orderBy: { created_at: 'desc' }
    });

    return orders.map(o => ({
      ...o,
      discount_amount: o.discount,
      customer_name: o.users_orders_customer_idTousers?.full_name,
      customer_phone: o.users_orders_customer_idTousers?.phone,
      user_name: o.users_orders_created_byTousers?.username
    }));
  }

  /**
   * Tìm và lấy thông tin chi tiết của một đơn hàng dựa trên ID.
   * 
   * @param {number|string} id - ID của đơn hàng cần tìm.
   * @returns {Promise<Object|null>} Chi tiết đơn hàng (bao gồm sản phẩm, khách hàng, người tạo) hoặc null nếu không tìm thấy/đã bị xóa.
   */
  async findById(id) {
    const order = await prisma.orders.findFirst({
      where: { id: parseInt(id), deleted_at: null },
      include: {
        users_orders_customer_idTousers: true,
        users_orders_created_byTousers: true,
        order_items: {
          include: { products: true }
        }
      }
    });

    if (!order) return null;

    return {
      ...order,
      discount_amount: order.discount,
      customer_name: order.users_orders_customer_idTousers?.full_name,
      customer_phone: order.users_orders_customer_idTousers?.phone,
      user_name: order.users_orders_created_byTousers?.username,
      items: order.order_items.map(item => ({
        ...item,
        product_name: item.product_name || item.products?.name
      }))
    };
  }

  /**
   * Lấy danh sách các đơn hàng đã bị xóa mềm (nằm trong thùng rác).
   * 
   * @param {Object} filters - Các điều kiện lọc.
   * @param {string} [filters.search] - Chuỗi tìm kiếm theo tên khách hàng hoặc ID đơn hàng.
   * @param {string} [filters.status] - Lọc theo trạng thái.
   * @param {string} [filters.paymentMethod] - Lọc theo phương thức thanh toán.
   * @returns {Promise<Array<Object>>} Danh sách đơn hàng đã xóa.
   */
  async findTrash(filters = {}) {
    const { search = "", status = "", paymentMethod = "" } = filters;
    const where = { deleted_at: { not: null } };

    if (search) {
      where.OR = [
        { users_orders_customer_idTousers: { full_name: { contains: search } } }
      ];
      if (!isNaN(parseInt(search))) {
        where.OR.push({ id: parseInt(search) });
      }
    }
    if (status && status !== 'all') where.status = status;
    if (paymentMethod && paymentMethod !== 'all') where.payment_method = paymentMethod;

    const orders = await prisma.orders.findMany({
      where,
      include: {
        users_orders_customer_idTousers: true,
        users_orders_created_byTousers: true
      },
      orderBy: { deleted_at: 'desc' }
    });

    return orders.map(o => ({
      ...o,
      discount_amount: o.discount,
      customer_name: o.users_orders_customer_idTousers?.full_name,
      customer_phone: o.users_orders_customer_idTousers?.phone,
      user_name: o.users_orders_created_byTousers?.username
    }));
  }

  /**
   * Lấy danh sách các đơn hàng của một người dùng cụ thể.
   * 
   * @param {number|string} userId - ID của khách hàng.
   * @returns {Promise<Array<Object>>} Danh sách đơn hàng của người dùng.
   */
  async findMyOrders(userId) {
    const orders = await prisma.orders.findMany({
      where: {
        customer_id: parseInt(userId),
        deleted_at: null,
        status: { not: 'revoked' }
      },
      include: { order_items: true },
      orderBy: { created_at: 'desc' }
    });

    return orders.map(o => ({
      ...o,
      items: o.order_items.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        total_price: item.total_price
      }))
    }));
  }

  /**
   * Lấy danh sách các sản phẩm mà một người dùng đã sở hữu (đã mua).
   * 
   * @param {number|string} userId - ID của khách hàng.
   * @returns {Promise<Array<Object>>} Danh sách sản phẩm sở hữu kèm thông tin chi tiết sản phẩm.
   */
  async findMyProducts(userId) {
    const owned = await prisma.owned_products.findMany({
      where: { user_id: parseInt(userId) },
      include: {
        products: {
          include: {
            product_images: {
              orderBy: [ { is_primary: 'desc' }, { id: 'asc' } ],
              take: 1
            },
            reviews: {
              where: { user_id: parseInt(userId) }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return owned.map(op => ({
      product_id: op.product_id,
      order_id: op.order_id,
      purchased_at: op.created_at,
      name: op.products?.name,
      description: op.products?.description,
      price: op.products?.price,
      type: op.products?.type,
      primary_image: op.products?.product_images?.[0]?.image_url || null,
      has_review: (op.products?.reviews?.length || 0) > 0,
      status: op.status
    }));
  }

  /**
   * Tạo một bản ghi đơn hàng mới trong cơ sở dữ liệu.
   * 
   * @param {Object} tx - Prisma transaction object.
   * @param {Object} data - Dữ liệu của đơn hàng cần tạo.
   * @returns {Promise<number>} ID của đơn hàng vừa được tạo.
   */
  async createOrderRecord(tx, data) {
    const db = tx || prisma;
    const {
      customer_id, billing_name, billing_email, billing_phone, 
      total_amount, discount, final_amount, status, payment_method, created_by,
      payment_status, currency
    } = data;

    const result = await db.orders.create({
      data: {
        customer_id: customer_id ? parseInt(customer_id) : null,
        billing_name,
        billing_email,
        billing_phone,
        total_amount,
        discount,
        final_amount,
        status: status || 'pending',
        payment_method,
        created_by: created_by ? parseInt(created_by) : null,
        payment_status: payment_status || 'pending',
        currency: currency || 'VND'
      }
    });
    return result.id;
  }

  /**
   * Tạo các bản ghi chi tiết đơn hàng (các sản phẩm trong đơn hàng).
   * 
   * @param {Object} tx - Prisma transaction object.
   * @param {number|string} orderId - ID của đơn hàng.
   * @param {Array<Object>} items - Danh sách các sản phẩm (chi tiết đơn hàng).
   * @returns {Promise<void>}
   */
  async createOrderItems(tx, orderId, items) {
    const db = tx || prisma;
    await db.order_items.createMany({
      data: items.map(item => ({
        order_id: parseInt(orderId),
        product_id: parseInt(item.product_id),
        product_name: item.product_name || item.name,
        price: item.price,
        cost_price: item.cost_price,
        quantity: item.quantity,
        total_price: item.total_price
      }))
    });
  }

  /**
   * Xóa tất cả các chi tiết đơn hàng (sản phẩm) của một đơn hàng.
   * Thường dùng khi cập nhật lại toàn bộ giỏ hàng của đơn hàng đó.
   * 
   * @param {Object} tx - Prisma transaction object.
   * @param {number|string} orderId - ID của đơn hàng.
   * @returns {Promise<void>}
   */
  async clearOrderItems(tx, orderId) {
    const db = tx || prisma;
    await db.order_items.deleteMany({
      where: { order_id: parseInt(orderId) }
    });
  }

  /**
   * Cập nhật thông tin chung của một đơn hàng.
   * 
   * @param {Object} tx - Prisma transaction object.
   * @param {number|string} id - ID của đơn hàng cần cập nhật.
   * @param {Object} data - Dữ liệu cần cập nhật.
   * @returns {Promise<void>}
   */
  async updateOrderInfo(tx, id, data) {
    const db = tx || prisma;
    await db.orders.update({
      where: { id: parseInt(id) },
      data
    });
  }

  /**
   * Xóa mềm (soft delete) một đơn hàng bằng cách cập nhật trường deleted_at.
   * 
   * @param {number|string} id - ID của đơn hàng cần xóa.
   * @returns {Promise<boolean>} Trả về true nếu thành công.
   */
  async delete(id) {
    await prisma.orders.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });
    return true;
  }

  /**
   * Phục hồi một đơn hàng đã bị xóa mềm.
   * 
   * @param {number|string} id - ID của đơn hàng cần phục hồi.
   * @returns {Promise<boolean>} Trả về true nếu thành công.
   */
  async restore(id) {
    await prisma.orders.update({
      where: { id: parseInt(id) },
      data: { deleted_at: null }
    });
    return true;
  }
}

module.exports = new OrderRepository();
