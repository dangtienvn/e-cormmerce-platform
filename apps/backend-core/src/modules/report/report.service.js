/**
 * @fileoverview Service layer xử lý logic nghiệp vụ cho module báo cáo (report).
 * Kết hợp dữ liệu từ ReportRepository để tạo ra các báo cáo tổng hợp cho Dashboard.
 */

const ReportRepository = require("./report.repository");

/**
 * Đối tượng cung cấp các dịch vụ liên quan đến báo cáo.
 * @namespace ReportService
 */
const ReportService = {
  /**
   * Lấy toàn bộ dữ liệu báo cáo để hiển thị trên màn hình Dashboard.
   * Sử dụng Promise.all để gọi đồng thời nhiều hàm từ Repository nhằm tối ưu hiệu suất.
   *
   * @async
   * @param {Object} [filters={}] - Các tiêu chí lọc dữ liệu (tùy chọn).
   * @param {string} [filters.startDate] - Ngày bắt đầu (định dạng YYYY-MM-DD).
   * @param {string} [filters.endDate] - Ngày kết thúc (định dạng YYYY-MM-DD).
   * @param {string} [filters.productType] - Loại sản phẩm để lọc (hoặc 'all').
   * @param {string} [filters.customerSource] - Nguồn khách hàng để lọc (hoặc 'all').
   * @returns {Promise<Object>} Trả về một đối tượng chứa toàn bộ dữ liệu thống kê:
   *  - `stats`: Số liệu tổng quan (doanh thu, đơn hàng, lợi nhuận,...).
   *  - `revenueByDay`: Thống kê doanh thu theo từng ngày.
   *  - `orderStatus`: Số lượng đơn hàng phân theo trạng thái.
   *  - `topProducts`: Danh sách sản phẩm bán chạy nhất.
   *  - `revenueByProduct`: Doanh thu theo từng loại sản phẩm.
   *  - `recentActivities`: Các hoạt động gần nhất (đơn hàng mới, người dùng mới).
   */
  async getDashboardReport(filters = {}) {
    const [stats, revenueByDay, orderStatus, topProducts, revenueByProduct, recentActivities] = await Promise.all([
      ReportRepository.getOverviewStats(filters),
      ReportRepository.getRevenueByDay(filters),
      ReportRepository.getOrderStatus(filters),
      ReportRepository.getTopProducts(filters),
      ReportRepository.getRevenueByProduct(filters),
      ReportRepository.getRecentActivities(6)
    ]);

    return {
      stats,
      revenueByDay,
      orderStatus,
      topProducts,
      revenueByProduct,
      recentActivities
    };
  }
};

module.exports = ReportService;
