/**
 * @fileoverview Cung cấp tiện ích để thực thi các thao tác cơ sở dữ liệu bên trong một transaction của Prisma.
 */
const { prisma } = require("../config/database");

/**
 * @function withTransaction
 * @description Thực thi một hàm callback bên trong một transaction của Prisma. Giúp đảm bảo tính toàn vẹn dữ liệu (tất cả truy vấn thành công hoặc rollback toàn bộ khi có lỗi).
 * 
 * @async
 * @param {Function} callback - Hàm callback nhận vào đối tượng transaction của Prisma (`tx`) để thực hiện các truy vấn cơ sở dữ liệu.
 * @returns {Promise<any>} Kết quả trả về từ hàm callback.
 */
async function withTransaction(callback) {
  return await prisma.$transaction(async (tx) => {
    return await callback(tx);
  }, {
    maxWait: 10000,
    timeout: 30000
  });
}

module.exports = { withTransaction };
