<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=Backend%20Core%20Services&fontSize=50&fontAlignY=38&desc=H%E1%BB%87%20Th%E1%BB%91ng%20API%20Trung%20T%C3%A2m&descAlignY=60&descAlign=60" width="100%" />

  <p>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" /></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" /></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /></a>
  </p>
</div>

---

## 📖 Giới thiệu dự án (Overview)

**Backend Core Services** là hệ thống API trung tâm (RESTful) được xây dựng bằng **Node.js, Express.js** và **Prisma ORM**. Đây là "trái tim" của hệ sinh thái CRM & E-Commerce, chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ, quản lý cơ sở dữ liệu, xác thực bảo mật và cung cấp dữ liệu an toàn cho các ứng dụng Frontend.

> **[TODO: Thêm Link tài liệu API Postman / Swagger]**
> **[TODO: Thêm sơ đồ luồng dữ liệu Backend (Data Flow Diagram)]**

---

## ⚡ Các tính năng chính (Core Features)

- 🔐 **Authentication & Authorization:** Xác thực bảo mật với **JWT (JSON Web Token)**, phân quyền nhiều cấp độ (Admin, Editor, Customer).
- 🗄️ **Database Interaction:** Tương tác an toàn với cơ sở dữ liệu MySQL bằng **Prisma ORM**, đảm bảo type-safety và chống SQL Injection.
- 📦 **File Management:** Xử lý upload và lưu trữ hình ảnh/file hiệu quả sử dụng **Multer** kết hợp với **Cloudinary/AWS S3**.
- 🛡️ **Security:** Tích hợp `helmet` bảo vệ HTTP Headers, `express-rate-limit` chống DDoS/Brute-force, `express-validator` xác thực dữ liệu đầu vào.
- ⏱️ **Background Jobs:** Sử dụng `node-cron` cho các tác vụ lập lịch định kỳ (VD: dọn dẹp data cũ, thống kê doanh thu).
- 📧 **Mail Service:** Hệ thống gửi email tự động với `Nodemailer`.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MySQL
- **ORM:** Prisma
- **Bảo mật:** bcryptjs, jsonwebtoken, cors, helmet
- **Tiện ích:** Multer, Cloudinary, AWS SDK, Node-cron, Faker.js (tạo dữ liệu mẫu).

---

## ⚙️ Cài đặt & Khởi chạy (Getting Started)

### Yêu cầu hệ thống (Prerequisites)
- Node.js (v18+)
- MySQL Server

### Các bước cài đặt:

1. **Clone & Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường (`.env`):**
   > **[TODO: Cập nhật file .env.example để dễ tham khảo]**
   Tạo file `.env` và thêm:
   ```env
   DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DB_NAME"
   JWT_SECRET="your_secret_key"
   PORT=3000
   ```

3. **Khởi tạo cơ sở dữ liệu:**
   ```bash
   npx prisma generate
   npx prisma db push
   # Chạy seed dữ liệu mẫu (tuỳ chọn)
   npm run seed:all
   ```

4. **Chạy server (Development):**
   ```bash
   npm run dev
   ```

---

## 🚀 Tính năng dự kiến cập nhật (Roadmap)
- [ ] Triển khai Swagger UI để tạo document tự động cho API.
- [ ] Chuyển đổi sang Redis để tối ưu hóa caching.
- [ ] Bổ sung Unit Tests bằng Jest / Supertest.
