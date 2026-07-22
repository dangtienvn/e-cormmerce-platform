const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock data...');

  // 1. Roles
  const adminRole = await prisma.roles.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });
  
  const customerRole = await prisma.roles.upsert({
    where: { name: 'customer' },
    update: {},
    create: { name: 'customer' },
  });

  // 2. Users
  const passwordHash = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.users.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: passwordHash,
      full_name: 'Admin User',
      role_id: adminRole.id,
      status: 'active'
    },
  });

  // 3. Product Categories & Products
  const ebookCat = await prisma.categories.upsert({
    where: { name: 'E-books' },
    update: {},
    create: { name: 'E-books' }
  });

  await prisma.products.createMany({
    skipDuplicates: true,
    data: [
      {
        sku: 'EBOOK-NEXTJS',
        name: 'Mastering Next.js 15',
        description: 'The ultimate guide to building scalable React applications.',
        price: 49.99,
        category_id: ebookCat.id,
        status: 'published',
        created_by: admin.id
      },
      {
        sku: 'EBOOK-PRISMA',
        name: 'Prisma ORM in Practice',
        description: 'Learn how to model data like a pro.',
        price: 29.99,
        category_id: ebookCat.id,
        status: 'published',
        created_by: admin.id
      }
    ]
  });

  // 4. Post Categories & Posts
  const techCat = await prisma.post_categories.upsert({
    where: { slug: 'technology' },
    update: {},
    create: { name: 'Công nghệ', slug: 'technology' }
  });

  await prisma.posts.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Tại sao tôi lại chọn Next.js cho dự án mới thay vì React SPA?',
        slug: 'tai-sao-chon-nextjs',
        content: '<p>Phân tích chi tiết về Server Components, SEO và trải nghiệm Developer khi chuyển từ Vite sang Next.js App Router.</p>',
        status: 'PUBLISHED',
        author_id: admin.id,
        category_id: techCat.id
      },
      {
        title: 'Microservices cho người mới bắt đầu: Đừng over-engineering!',
        slug: 'microservices-cho-nguoi-moi',
        content: '<p>Khi nào nên dùng Microservices? Monolith vẫn là lựa chọn tuyệt vời cho 90% dự án khởi nghiệp.</p>',
        status: 'PUBLISHED',
        author_id: admin.id,
        category_id: techCat.id
      }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
