const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

const VOUCHERS = [
  {
    code: 'NEWYEAR2026',
    discount_percent: 15,
    max_uses: 100,
    min_order_value: 0,
    max_discount_amount: 500000,
    expiry_date: new Date('2026-01-31T23:59:59Z'),
    is_active: false
  },
  {
    code: 'NEWYEAR2027',
    discount_percent: 15,
    max_uses: 100,
    min_order_value: 0,
    max_discount_amount: 500000,
    expiry_date: new Date('2027-01-31T23:59:59Z'),
    is_active: true
  },
  {
    code: 'TETBINHNGO',
    discount_percent: 25,
    max_uses: 200,
    min_order_value: 100000,
    max_discount_amount: 1000000,
    expiry_date: new Date('2026-02-28T23:59:59Z'),
    is_active: false
  },
  {
    code: 'TETDINHMUI',
    discount_percent: 25,
    max_uses: 500,
    min_order_value: 100000,
    max_discount_amount: 1000000,
    expiry_date: new Date('2027-02-28T23:59:59Z'),
    is_active: true
  },
  {
    code: 'HUNGVUONG2026',
    discount_percent: 10,
    max_uses: 50,
    min_order_value: 0,
    max_discount_amount: 200000,
    expiry_date: new Date('2026-04-30T23:59:59Z'),
    is_active: false
  },
  {
    code: 'GIAIPHONG304',
    discount_percent: 20,
    max_uses: 150,
    min_order_value: 50000,
    max_discount_amount: 300000,
    expiry_date: new Date('2027-05-02T23:59:59Z'),
    is_active: true
  },
  {
    code: 'QUOCTELAODONG',
    discount_percent: 20,
    max_uses: 150,
    min_order_value: 50000,
    max_discount_amount: 300000,
    expiry_date: new Date('2027-05-03T23:59:59Z'),
    is_active: true
  },
  {
    code: 'QUOCKHANH29',
    discount_percent: 20,
    max_uses: 200,
    min_order_value: 50000,
    max_discount_amount: 500000,
    expiry_date: new Date('2026-09-05T23:59:59Z'),
    is_active: true
  }
];

const REVIEW_COMMENTS = [
  "Sản phẩm rất chất lượng, đúng như mô tả.",
  "Khóa học hữu ích, giảng viên nhiệt tình, dễ hiểu.",
  "Giao diện đẹp, dễ sử dụng, mình rất thích.",
  "Giá cả hợp lý so với giá trị nhận được.",
  "Hỗ trợ khách hàng rất nhanh chóng và chuyên nghiệp.",
  "Nội dung chi tiết, bài bản. Đáng đồng tiền bát gạo.",
  "Tuyệt vời! Sẽ ủng hộ shop tiếp trong tương lai.",
  "Tài liệu phong phú, giúp ích nhiều cho công việc của mình.",
  "Khá ổn, nhưng hy vọng có thêm nhiều bài tập thực hành hơn.",
  "Chất lượng sản phẩm tốt, tải về nhanh chóng."
];

async function seedVouchers() {
  console.log('Seeding Vouchers...');
  for (const voucher of VOUCHERS) {
    await prisma.vouchers.upsert({
      where: { code: voucher.code },
      update: voucher,
      create: voucher
    });
  }
  console.log('Vouchers seeded successfully.');
}

async function seedReviews() {
  console.log('Seeding Reviews...');
  
  // Lấy danh sách users (trừ admin)
  const users = await prisma.users.findMany({
    where: {
      roles: {
        name: {
          not: 'Admin'
        }
      }
    }
  });

  // Lấy danh sách sản phẩm (chỉ các sản phẩm published)
  const products = await prisma.products.findMany({
    where: {
      status: 'published'
    }
  });

  if (users.length === 0 || products.length === 0) {
    console.log('Không đủ dữ liệu users hoặc products để tạo review.');
    return;
  }

  // Duyệt qua từng sản phẩm để tạo 2-5 đánh giá
  for (const product of products) {
    const numReviews = faker.number.int({ min: 2, max: 5 });
    
    // Chọn ngẫu nhiên users để đánh giá (tránh trùng lặp 1 user review 2 lần cho 1 product)
    const shuffledUsers = faker.helpers.shuffle(users).slice(0, numReviews);

    for (const user of shuffledUsers) {
      // Kiểm tra xem user này đã review sản phẩm này chưa
      const existingReview = await prisma.reviews.findUnique({
        where: {
          user_id_product_id: {
            user_id: user.id,
            product_id: product.id
          }
        }
      });

      if (!existingReview) {
        const rating = faker.helpers.weightedArrayElement([
          { weight: 6, value: 5 }, // 60% tỉ lệ 5 sao
          { weight: 3, value: 4 }, // 30% tỉ lệ 4 sao
          { weight: 1, value: 3 }, // 10% tỉ lệ 3 sao
        ]);
        
        const comment = faker.helpers.arrayElement(REVIEW_COMMENTS);
        
        await prisma.reviews.create({
          data: {
            user_id: user.id,
            product_id: product.id,
            rating: rating,
            comment: comment,
            created_at: faker.date.past({ years: 1 }) // Random date trong vòng 1 năm
          }
        });
      }
    }
  }

  console.log('Reviews seeded successfully.');
}

async function main() {
  try {
    await seedVouchers();
    await seedReviews();
    console.log('--- Seed Demo Data Completed ---');
  } catch (error) {
    console.error('Lỗi khi seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
