const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding blog data...");

    // 1. Ensure user exists for author
    const author = await prisma.users.findFirst();
    if (!author) {
        console.error("No user found. Please run seed_accounts.js first.");
        return;
    }

    // 2. Create Categories
    const categoriesData = [
        { name: 'Next.js' },
        { name: 'Javascript' },
        { name: 'PostgreSQL' },
        { name: 'System Design' },
        { name: 'DevOps' }
    ];

    const createdCategories = [];
    for (const c of categoriesData) {
        const slug = slugify(c.name, { lower: true });
        const existing = await prisma.post_categories.findUnique({ where: { slug } });
        if (existing) {
            createdCategories.push(existing);
        } else {
            const cat = await prisma.post_categories.create({
                data: {
                    name: c.name,
                    slug: slug,
                }
            });
            createdCategories.push(cat);
        }
    }

    // 3. Create Posts
    const postsData = [
        { title: 'Hiểu rõ Server Components trong Next.js 14', content: 'Trong phiên bản Next.js mới nhất, Server Components đã trở thành mặc định. Đây là cách giúp cải thiện hiệu năng, giảm dung lượng bundle Javascript trên client, và mang lại trải nghiệm tối ưu SEO vượt trội. Hãy cùng đi sâu vào cách chúng hoạt động bên dưới hood nhé.', categoryName: 'Next.js' },
        { title: 'App Router vs Pages Router: Nên chọn gì?', content: 'Sự chuyển dịch từ Pages Router sang App Router trong Next.js đem lại nhiều băn khoăn. Bài viết này phân tích ưu nhược điểm, khi nào nên nâng cấp, và cách cấu trúc thư mục tối ưu cho dự án lớn.', categoryName: 'Next.js' },
        { title: 'Tối ưu hóa hình ảnh với next/image', content: 'Tìm hiểu cách next/image xử lý lazy loading, auto format (WebP/AVIF), và responsive sizing để website của bạn luôn đạt điểm tối đa trên Lighthouse.', categoryName: 'Next.js' },
        
        { title: 'Event Loop trong NodeJS hoạt động như thế nào?', content: 'Event Loop là trái tim của Node.js, giúp Node.js xử lý hàng ngàn request đồng thời dù chỉ chạy trên một thread duy nhất. Hiểu Event Loop là bắt buộc để tránh block thread.', categoryName: 'Javascript' },
        { title: 'Javascript Closures giải thích theo cách dễ hiểu nhất', content: 'Closure là một khái niệm cực kỳ mạnh mẽ nhưng cũng dễ gây bối rối cho người mới. Hãy xem các ví dụ thực tế về việc áp dụng Closure trong React Hooks và Data Privacy.', categoryName: 'Javascript' },
        { title: 'Từ Promise đến Async/Await', content: 'Lịch sử xử lý bất đồng bộ trong Javascript. Từ Callback hell đến Promise chain, và cuối cùng là cú pháp async/await thanh lịch ngày nay.', categoryName: 'Javascript' },
        
        { title: 'Tối ưu Query PostgreSQL với Index', content: 'Khi bảng dữ liệu lên đến hàng triệu dòng, truy vấn chậm là điều khó tránh khỏi. Hướng dẫn cách sử dụng B-Tree và Hash Index đúng cách để tăng tốc độ truy xuất.', categoryName: 'PostgreSQL' },
        { title: 'Prisma vs TypeORM: Chọn ORM nào cho 2024?', content: 'Đánh giá khách quan về hiệu năng, type-safety, và DX (Developer Experience) giữa 2 ORM phổ biến nhất trong hệ sinh thái Node.js/TypeScript.', categoryName: 'PostgreSQL' },
        
        { title: 'Microservices: Khi nào nên và không nên dùng?', content: 'Không phải dự án nào cũng cần Microservices. Việc lạm dụng kiến trúc này có thể dẫn đến một "Distributed Monolith" với chi phí vận hành khổng lồ.', categoryName: 'System Design' },
        { title: 'Thiết kế hệ thống Rate Limiter', content: 'Cách chống spam API hiệu quả bằng các thuật toán như Token Bucket, Leaky Bucket và Sliding Window using Redis.', categoryName: 'System Design' },
        { title: 'Load Balancing căn bản cho người mới', content: 'Làm sao để hệ thống chịu tải hàng triệu request mỗi giây? Câu trả lời bắt đầu bằng Load Balancer và các thuật toán Round-Robin, Least Connections.', categoryName: 'System Design' },
        
        { title: 'Docker hóa ứng dụng Next.js và Node.js', content: 'Hướng dẫn viết Dockerfile tối ưu multi-stage build cho dự án web để giảm dung lượng image và tăng cường bảo mật.', categoryName: 'DevOps' },
        { title: 'Triển khai CI/CD với GitHub Actions', content: 'Tự động hóa quá trình test, build và deploy lên máy chủ mỗi khi code được push lên nhánh main. Một workflow không thể thiếu cho Agile team.', categoryName: 'DevOps' }
    ];

    for (const p of postsData) {
        const slug = slugify(p.title, { lower: true });
        const existing = await prisma.posts.findUnique({ where: { slug } });
        if (!existing) {
            const category = createdCategories.find(c => c.name === p.categoryName);
            const newPost = await prisma.posts.create({
                data: {
                    title: p.title,
                    slug: slug,
                    content: p.content,
                    status: 'PUBLISHED',
                    author_id: author.id,
                    category_id: category ? category.id : null,
                }
            });

            // Create some random comments
            await prisma.post_comments.create({
                data: {
                    post_id: newPost.id,
                    user_id: author.id,
                    content: 'Bài viết rất hay, cảm ơn tác giả!'
                }
            });
        }
    }

    console.log("Seeding blog data completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
