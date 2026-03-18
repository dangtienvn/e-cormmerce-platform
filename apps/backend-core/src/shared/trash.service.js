const cron = require('node-cron');
const { prisma } = require('../config/database');
const LogService = require('../modules/log/log.service');

const TrashService = {
  init() {
    // Run every day at 02:00 AM
    cron.schedule('0 2 * * *', async () => {
      console.log("[CRON] Bắt đầu dọn dẹp dữ liệu thùng rác (Hard delete)...");
      await this.cleanUpOldTrash();
    });
    console.log("[TrashService] Đã khởi tạo lịch dọn rác tự động (02:00 sáng mỗi ngày).");
  },

  async cleanUpOldTrash() {
    const tables = ['categories', 'products', 'orders', 'users', 'expenses', 'vouchers'];
    let totalDeleted = 0;

    for (const table of tables) {
      try {
        const query = `
          DELETE FROM ${table} 
          WHERE deleted_at IS NOT NULL 
          AND deleted_at < NOW() - INTERVAL 30 DAY
        `;
        const affectedRows = await prisma.$executeRawUnsafe(query);
        
        if (affectedRows > 0) {
          console.log(`[CRON] Đã xóa vĩnh viễn ${affectedRows} dòng từ bảng ${table}.`);
          totalDeleted += affectedRows;
        }
      } catch (error) {
        console.error(`[CRON] Lỗi khi dọn dẹp bảng ${table}:`, error.message);
      }
    }

    if (totalDeleted > 0) {
      try {
        // ID 1 is usually the System admin, or we can just save with user_id = null if DB allows.
        // Assuming user_id can be null or we pass 1.
        await LogService.logAction(1, "Hệ thống tự động dọn rác", "system", null, `Đã xóa cứng ${totalDeleted} bản ghi quá 30 ngày.`);
      } catch(e) {}
    }
  }
};

module.exports = TrashService;
