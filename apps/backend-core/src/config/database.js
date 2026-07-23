/**
 * @fileoverview Module quản lý kết nối cơ sở dữ liệu sử dụng Prisma ORM.
 * Cung cấp đối tượng Prisma client và cấu hình kết nối, đồng thời tự động
 * đồng bộ hóa một số thay đổi trong schema với cơ sở dữ liệu.
 */
const { PrismaClient } = require('@prisma/client');

/**
 * Khởi tạo đối tượng Prisma client để thao tác với cơ sở dữ liệu.
 * @type {PrismaClient}
 */
const prisma = new PrismaClient({});

// Override $queryRawUnsafe để xử lý placeholder cho PostgreSQL ($1, $2, ...) thay vì '?'
const originalQueryRawUnsafe = prisma.$queryRawUnsafe.bind(prisma);
prisma.$queryRawUnsafe = async function(query, ...values) {
  if (typeof query === 'string') {
    let counter = 1;
    query = query.replace(/\?/g, () => `\$${counter++}`);
    values = values.map(v => {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}(T.*|\s.*)?$/.test(v)) {
        return new Date(v);
      }
      return v;
    });
  }
  return await originalQueryRawUnsafe(query, ...values);
};

/**
 * Kiểm tra và đồng bộ hóa cấu trúc bảng trong cơ sở dữ liệu.
 * Cụ thể hàm này kiểm tra sự tồn tại của cột `voucher_code` trong bảng `orders`
 * và tự động thêm vào nếu chưa có.
 * 
 * @async
 * @function syncSchema
 * @returns {Promise<void>} Không có giá trị trả về.
 */
async function syncSchema() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'voucher_code'
    `;

    if (!columns.length) {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "orders" ADD COLUMN "voucher_code" VARCHAR(50) NULL'
      );
      console.log('Schema sync: added orders.voucher_code column');
    }

    const postColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'posts'
        AND column_name IN ('tags', 'seo_title', 'seo_description', 'seo_keywords')
    `;

    const existingPostColumns = postColumns.map((row) => row.column_name);
    if (!existingPostColumns.includes('tags')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "posts" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::text[]');
      console.log('Schema sync: added posts.tags column');
    }
    if (!existingPostColumns.includes('seo_title')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "posts" ADD COLUMN "seo_title" VARCHAR(255) NULL');
      console.log('Schema sync: added posts.seo_title column');
    }
    if (!existingPostColumns.includes('seo_description')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "posts" ADD COLUMN "seo_description" TEXT NULL');
      console.log('Schema sync: added posts.seo_description column');
    }
    if (!existingPostColumns.includes('seo_keywords')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "posts" ADD COLUMN "seo_keywords" TEXT NULL');
      console.log('Schema sync: added posts.seo_keywords column');
    }
  } catch (error) {
    console.warn('Schema sync skipped:', error.message);
  }
}

/**
 * Kết nối tới cơ sở dữ liệu thông qua Prisma và thực hiện đồng bộ schema.
 * Nếu quá trình kết nối thất bại, tiến trình Node.js sẽ bị dừng lại.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Không có giá trị trả về.
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    await syncSchema();
    console.log(`Prisma Connected successfully to database`);
  } catch (error) {
    console.error(`Error connecting to MySQL via Prisma: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Đối tượng xuất chứa prisma client và hàm kết nối database.
 * @module config/database
 */
module.exports = { prisma, connectDB };
