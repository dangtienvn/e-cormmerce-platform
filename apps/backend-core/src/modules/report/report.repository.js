/**
 * @fileoverview Lớp Repository xử lý các truy vấn trực tiếp xuống cơ sở dữ liệu cho phần báo cáo.
 * Sử dụng Prisma raw query để thực hiện các tính toán tổng hợp phức tạp một cách tối ưu.
 */

const { prisma } = require("../../config/database");

/**
 * Cache lưu trữ kết quả kiểm tra cột của bảng trong cơ sở dữ liệu
 * @type {Object<string, boolean>}
 */
const _columnCache = {};

/**
 * Kiểm tra xem một cột có tồn tại trong bảng của cơ sở dữ liệu hay không.
 * Tối ưu hóa hiệu suất bằng cách lưu cache kết quả.
 * 
 * @async
 * @param {string} table - Tên bảng cần kiểm tra.
 * @param {string} column - Tên cột cần kiểm tra.
 * @returns {Promise<boolean>} Trả về `true` nếu cột tồn tại, ngược lại `false`.
 */
async function hasColumn(table, column) {
  const cacheKey = `${table}:${column}`;
  if (_columnCache[cacheKey] !== undefined) return _columnCache[cacheKey];
  try {
    const dbName = process.env.DB_NAME || 'shopflow_crm';
    const rows = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?", dbName, table, column
    );
    _columnCache[cacheKey] = !!(rows && rows[0] && rows[0].cnt > 0);
  } catch (err) {
    _columnCache[cacheKey] = false;
  }
  return _columnCache[cacheKey];
}

/**
 * Tạo điều kiện lọc cơ bản cho bảng orders (ví dụ: loại bỏ các bản ghi đã xóa mềm).
 * Tự động dựa vào việc bảng có cột `is_deleted` hoặc `deleted_at` hay không.
 *
 * @async
 * @returns {Promise<string>} Chuỗi điều kiện WHERE SQL (VD: " 1=1  AND orders.is_deleted = FALSE ").
 */
async function getOrderFilter() {
  let filter = " 1=1 ";
  if (await hasColumn('orders', 'is_deleted')) {
    filter += " AND orders.is_deleted = FALSE ";
  } else if (await hasColumn('orders', 'deleted_at')) {
    filter += " AND orders.deleted_at IS NULL ";
  }
  return filter;
}

/**
 * Tạo điều kiện lọc cơ bản cho bảng users (ví dụ: loại bỏ tài khoản đã xóa mềm).
 * Tự động kiểm tra cột `is_deleted` hoặc `deleted_at` trong CSDL.
 *
 * @async
 * @returns {Promise<string>} Chuỗi điều kiện WHERE SQL.
 */
async function getUserFilter() {
  let filter = " 1=1 ";
  if (await hasColumn('users', 'is_deleted')) {
    filter += " AND users.is_deleted = FALSE ";
  } else if (await hasColumn('users', 'deleted_at')) {
    filter += " AND users.deleted_at IS NULL ";
  }
  return filter;
}

/**
 * Xây dựng chuỗi điều kiện WHERE SQL và danh sách tham số (parameters) cho các truy vấn liên quan đến đơn hàng.
 * Tích hợp điều kiện lọc thời gian, loại sản phẩm và điều kiện xóa mềm cơ bản.
 *
 * @async
 * @param {Object} filters - Các tham số lọc từ client (startDate, endDate, productType).
 * @param {string} [tableAlias='orders'] - Bí danh (alias) của bảng orders trong câu truy vấn SQL.
 * @returns {Promise<{whereClause: string, params: any[]}>} Đối tượng chứa chuỗi WHERE và mảng tham số cho prepared statement.
 */
async function buildOrderQueryConditions(filters, tableAlias = 'orders') {
  const { startDate, endDate, productType } = filters;
  const orderFilter = await getOrderFilter();
  
  let whereClause = orderFilter.replace(/orders\./g, `${tableAlias}.`);
  const params = [];

  if (startDate) {
    whereClause += ` AND ${tableAlias}.created_at >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    whereClause += ` AND ${tableAlias}.created_at <= ?`;
    params.push(`${endDate} 23:59:59`);
  }
  if (productType && productType !== 'all') {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${tableAlias}.id AND p.type = ?
    )`;
    params.push(productType);
  }
  return { whereClause, params };
}

/**
 * Repository xử lý các truy vấn thống kê dữ liệu báo cáo.
 * @namespace ReportRepository
 */
const ReportRepository = {
  /**
   * Tính toán và trả về các chỉ số tổng quan.
   * Gồm: Tổng doanh thu, tổng đơn hàng, khách hàng mới, tỷ lệ chuyển đổi, chi phí, lợi nhuận.
   *
   * @async
   * @param {Object} [filters={}] - Tiêu chí lọc (thời gian, loại sản phẩm, nguồn khách hàng...).
   * @returns {Promise<{totalRevenue: number, totalOrders: number, totalCustomers: number, conversionRate: number, totalCost: number, totalExpense: number, totalProfit: number}>} Số liệu thống kê tổng quan.
   */
  async getOverviewStats(filters = {}) {
    const { whereClause: revWhere, params: revParams } = await buildOrderQueryConditions(filters, 'orders');
    const userFilter = await getUserFilter();

    // 1. Total Revenue from paid orders
    const revResult = await prisma.$queryRawUnsafe(
      `SELECT SUM(final_amount) as total_revenue FROM orders WHERE status = 'paid' AND ${revWhere}`, ...revParams);
    const totalRevenue = Number(revResult[0]?.total_revenue || 0);

    // 2. Total Orders
    const { whereClause: ordWhere, params: ordParams } = await buildOrderQueryConditions(filters, 'orders');
    const ordersResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as total_orders FROM orders WHERE ${ordWhere}`, ...ordParams);
    const totalOrders = Number(ordersResult[0]?.total_orders || 0);

    // 3. New Customers (users with 'customer' role & optionally filtered by registration date / source)
    const { startDate, endDate, customerSource } = filters;
    let custWhere = ` LOWER(r.name) = 'customer' AND ${userFilter.replace(/users\./g, 'u.')}`;
    const custParams = [];
    
    let custJoin = "";
    if (customerSource && customerSource !== 'all') {
      custJoin = " LEFT JOIN customer_profiles cp ON u.id = cp.user_id ";
      custWhere += " AND cp.source = ? ";
      custParams.push(customerSource);
    }
    if (startDate) {
      custWhere += " AND u.created_at >= ? ";
      custParams.push(startDate);
    }
    if (endDate) {
      custWhere += " AND u.created_at <= ? ";
      custParams.push(`${endDate} 23:59:59`);
    }

    const customersResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(DISTINCT u.id) as total_customers 
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ${custJoin}
       WHERE ${custWhere}`, ...custParams);
    const totalCustomers = Number(customersResult[0]?.total_customers || 0);

    // 4. Conversion Rate: (Unique paid buyers / Total customers) * 100
    const { whereClause: buyerWhere, params: buyerParams } = await buildOrderQueryConditions(filters, 'orders');
    const buyersResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(DISTINCT customer_id) as buyers FROM orders WHERE status = 'paid' AND ${buyerWhere}`, ...buyerParams);
    const buyers = Number(buyersResult[0]?.buyers || 0);
    const conversionRate = totalCustomers > 0 ? (buyers / totalCustomers) * 100 : 0;

    // 5. Total Cost Price from paid orders
    const costResult = await prisma.$queryRawUnsafe(
      `SELECT SUM(oi.cost_price * oi.quantity) as total_cost 
       FROM order_items oi 
       JOIN orders ON oi.order_id = orders.id 
       WHERE orders.status = 'paid' AND ${revWhere}`, ...revParams);
    const totalCost = Number(costResult[0]?.total_cost || 0);

    // 6. Total Expenses
    let expWhere = " 1=1 ";
    const expParams = [];
    if (filters.startDate) {
      expWhere += " AND created_at >= ? ";
      expParams.push(filters.startDate);
    }
    if (filters.endDate) {
      expWhere += " AND created_at <= ? ";
      expParams.push(`${filters.endDate} 23:59:59`);
    }

    const expResult = await prisma.$queryRawUnsafe(`SELECT SUM(amount) as total_expense FROM expenses WHERE ${expWhere}`, ...expParams);
    const totalExpense = Number(expResult[0]?.total_expense || 0);

    const totalProfit = totalRevenue - totalCost - totalExpense;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      conversionRate,
      totalCost,
      totalExpense,
      totalProfit
    };
  },

  /**
   * Thống kê doanh thu bán hàng theo từng ngày trong một khoảng thời gian nhất định.
   * Nếu không truyền ngày, mặc định lấy dữ liệu của 7 ngày gần nhất.
   *
   * @async
   * @param {Object} [filters={}] - Tiêu chí lọc, bao gồm startDate, endDate.
   * @returns {Promise<Array<{date: string, amount: number}>>} Mảng các đối tượng chứa ngày (hoặc thứ) và doanh thu tương ứng.
   */
  async getRevenueByDay(filters = {}) {
    const { startDate, endDate } = filters;
    
    let start = startDate;
    let end = endDate;

    if (!start || !end) {
      // Default to last 7 days
      const d = new Date();
      const endD = new Date();
      const startD = new Date();
      startD.setDate(startD.getDate() - 6);
      
      start = startD.toISOString().split('T')[0];
      end = endD.toISOString().split('T')[0];
    }

    const { whereClause, params } = await buildOrderQueryConditions({ ...filters, startDate: start, endDate: end }, 'orders');

    // Fetch the paid orders within the interval
    const rows = await prisma.$queryRawUnsafe(
      `SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date_str,
        SUM(final_amount) as amount
       FROM orders
       WHERE status = 'paid' 
         AND ${whereClause}
       GROUP BY date_str
       ORDER BY date_str ASC`, ...params);

    // Map rows to object for fast lookup
    const dbData = {};
    rows.forEach(r => {
      dbData[r.date_str] = Number(r.amount || 0);
    });

    // Populate exactly all dates in the range (Max 31 days to avoid chart clutter)
    const result = [];
    const curr = new Date(start);
    const last = new Date(end);
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    let count = 0;
    while (curr <= last && count < 31) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const date = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;

      // If range is within 7 days, show the day name, otherwise show the short date DD/MM
      const dateDiff = (last - new Date(start)) / (1000 * 60 * 60 * 24);
      const label = dateDiff <= 7 ? dayNames[curr.getDay()] : `${date}/${month}`;

      result.push({
        date: label,
        amount: dbData[dateStr] || 0
      });

      curr.setDate(curr.getDate() + 1);
      count++;
    }

    return result;
  },

  /**
   * Thống kê số lượng đơn hàng phân theo từng trạng thái (Hoàn tất, Chờ duyệt, Thất bại).
   *
   * @async
   * @param {Object} [filters={}] - Tiêu chí lọc dữ liệu.
   * @returns {Promise<Array<{status: string, count: number}>>} Mảng thống kê trạng thái và số lượng tương ứng.
   */
  async getOrderStatus(filters = {}) {
    const { whereClause, params } = await buildOrderQueryConditions(filters, 'orders');

    const rows = await prisma.$queryRawUnsafe(
      `SELECT status, COUNT(*) as count 
       FROM orders 
       WHERE ${whereClause}
       GROUP BY status`, ...params);

    const statusMap = {
      'paid': 'Hoàn tất (Paid)',
      'pending': 'Chờ duyệt (Pending)',
      'revoked': 'Bị thu hồi (Revoked)'
    };

    const counts = {
      'paid': 0,
      'pending': 0,
      'revoked': 0
    };

    rows.forEach(r => {
      if (counts[r.status] !== undefined) {
        counts[r.status] = Number(r.count || 0);
      }
    });

    return Object.keys(statusMap).map(statusKey => ({
      status: statusMap[statusKey],
      count: counts[statusKey]
    }));
  },

  /**
   * Lấy danh sách top 5 sản phẩm bán chạy nhất dựa trên số lượng đã bán.
   * Chỉ tính các đơn hàng có trạng thái là 'paid' (đã thanh toán).
   *
   * @async
   * @param {Object} [filters={}] - Tiêu chí lọc dữ liệu.
   * @returns {Promise<Array<{name: string, sales: number}>>} Mảng chứa tên sản phẩm và số lượng bán ra.
   */
  async getTopProducts(filters = {}) {
    const { whereClause, params } = await buildOrderQueryConditions(filters, 'o');

    const rows = await prisma.$queryRawUnsafe(
      `SELECT 
        oi.product_name as name, 
        SUM(oi.quantity) as sales 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'paid' AND ${whereClause}
       GROUP BY oi.product_id, oi.product_name
       ORDER BY sales DESC
       LIMIT 5`, ...params);

    return rows.map(r => ({
      name: r.name || 'Sản phẩm không tên',
      sales: Number(r.sales || 0)
    }));
  },

  /**
   * Lấy danh sách top 5 sản phẩm mang lại doanh thu cao nhất.
   * Chỉ tính các đơn hàng có trạng thái là 'paid'.
   *
   * @async
   * @param {Object} [filters={}] - Tiêu chí lọc dữ liệu.
   * @returns {Promise<Array<{name: string, revenue: number}>>} Mảng chứa tên sản phẩm và tổng doanh thu tương ứng.
   */
  async getRevenueByProduct(filters = {}) {
    const { whereClause, params } = await buildOrderQueryConditions(filters, 'o');

    const rows = await prisma.$queryRawUnsafe(
      `SELECT 
        oi.product_name as name, 
        SUM(COALESCE(oi.total_price, oi.price * oi.quantity)) as revenue 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'paid' AND ${whereClause}
       GROUP BY oi.product_id, oi.product_name
       ORDER BY revenue DESC
       LIMIT 5`, ...params);

    return rows.map(r => ({
      name: r.name || 'Sản phẩm không tên',
      revenue: Number(r.revenue || 0)
    }));
  },

  /**
   * Lấy danh sách các hoạt động nổi bật gần đây (đơn hàng mới, khách hàng mới).
   * Kết hợp dữ liệu từ bảng `orders` và `users`, sắp xếp từ mới nhất đến cũ nhất.
   *
   * @async
   * @param {number} [limit=6] - Số lượng hoạt động tối đa cần lấy.
   * @returns {Promise<Array<{type: string, icon: string, color: string, title: string, time: Date}>>} Mảng các hoạt động được định dạng sẵn cho UI dashboard.
   */
  async getRecentActivities(limit = 6) {
    try {
      const orders = await prisma.$queryRawUnsafe(
        `SELECT id, status, created_at, 'order' as type 
         FROM orders 
         ORDER BY created_at DESC 
         LIMIT ?`, limit
      );

      const users = await prisma.$queryRawUnsafe(
        `SELECT u.id, u.username as name, u.email, u.created_at, 'user' as type 
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE LOWER(r.name) = 'customer'
         ORDER BY u.created_at DESC 
         LIMIT ?`, limit
      );

      const activities = [...orders, ...users]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
        .map(item => {
          if (item.type === 'order') {
            const statusMap = {
              'paid': 'hoàn tất',
              'pending': 'chờ duyệt',
              'failed': 'bị hủy/thất bại'
            };
            const statusStr = statusMap[item.status] || item.status;
            return {
              type: 'order',
              icon: item.status === 'paid' ? 'bi-cart-check' : (item.status === 'pending' ? 'bi-cart-dash' : 'bi-cart-x'),
              color: item.status === 'paid' ? 'primary' : (item.status === 'pending' ? 'warning' : 'danger'),
              title: `Đơn hàng #${item.id} ${statusStr}`,
              time: item.created_at
            };
          } else {
            return {
              type: 'user',
              icon: 'bi-person-plus',
              color: 'success',
              title: `Khách hàng mới: ${item.name || item.email}`,
              time: item.created_at
            };
          }
        });

      return activities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }
};

module.exports = ReportRepository;
