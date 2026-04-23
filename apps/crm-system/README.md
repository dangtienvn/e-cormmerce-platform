<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=CRM%20System&fontSize=50&fontAlignY=38&desc=H%E1%BB%87%20Th%E1%BB%91ng%20Qu%E1%BA%A3n%20L%C3%BD%20B%C3%A1n%20H%C3%A0ng%20%26%20Ch%C4%83m%20S%C3%B3c%20Kh%C3%A1ch%20H%C3%A0ng&descAlignY=60&descAlign=60" width="100%" />

  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /></a>
  </p>

  <p>
    <em>Một giải pháp toàn diện giúp số hóa và tự động hóa quy trình quản lý khách hàng, theo dõi sản phẩm, xử lý đơn đặt hàng, tự động cấp quyền truy cập sản phẩm số, đến việc thống kê doanh thu và quản lý dòng tiền.</em>
  </p>
</div>

> **[TODO: Thêm Link Live Demo CRM sau khi triển khai]**
> **[TODO: Thêm Video hướng dẫn/Demo tính năng (Youtube/Loom link)]**

---

## 📑 Mục lục (Table of Contents)

1. [Giới thiệu dự án (Overview)](#-1-giới-thiệu-dự-án-overview)
2. [Hệ thống phân quyền & Luồng nghiệp vụ (Actors & Workflow)](#-2-hệ-thống-phân-quyền--luồng-nghiệp-vụ-actors--workflow)
3. [Tính năng hệ thống (System Features)](#-3-tính-năng-hệ-thống-system-features)
4. [Công nghệ sử dụng (Tech Stack)](#-4-công-nghệ-sử-dụng-tech-stack)
5. [Cấu trúc cơ sở dữ liệu (Database Schema)](#️-5-cấu-trúc-cơ-sở-dữ-liệu-database-schema)
6. [Hướng dẫn cài đặt & Chạy dự án (Getting Started)](#-6-hướng-dẫn-cài-đặt--chạy-dự-án-getting-started)
7. [Hình ảnh hệ thống (Screenshots)](#-7-hình-ảnh-hệ-thống-screenshots)
8. [License & Liên hệ (Contact)](#️-8-nguồn-gốc--bản-quyền-license--author)

---

## 📖 1. Giới thiệu dự án (Overview)

**E-Commerce CRM System** là một hệ thống phần mềm quản lý bán hàng nội bộ dành cho các cửa hàng kinh doanh online sản phẩm số và bán lẻ. Dự án được thiết kế theo kiến trúc **RESTful API** kết hợp giao diện Web Client tương tác trực tiếp, tối ưu hóa trải nghiệm người dùng (UX) và hiệu năng hệ thống.

**Mục tiêu giải quyết cốt lõi:**

- ✅ **Số hóa và tự động hóa** quy trình bán hàng (Đặc biệt phù hợp cho Sản phẩm số / Digital Delivery).
- ✅ **Theo dõi chính xác** tình trạng đơn hàng, thanh toán và chuyển giao sản phẩm nhanh chóng.
- ✅ **Tối ưu hóa** việc chăm sóc khách hàng (CRM) và lưu trữ lịch sử mua hàng an toàn.
- ✅ **Báo cáo và thống kê** doanh thu, lợi nhuận, chi phí một cách minh bạch, trực quan với Dashboard hiện đại.

---

## 🎭 2. Hệ thống phân quyền & Luồng nghiệp vụ (Actors & Workflow)

Hệ thống được thiết kế bảo mật chặt chẽ với **3 vai trò (Roles)** chính. Việc phân chia này giúp đảm bảo tính chuyên môn hóa và an toàn dữ liệu:

### 👑 ADMIN (Quản trị viên / Vận hành hệ thống)

_Người nắm quyền kiểm soát toàn diện và đánh giá hiệu quả kinh doanh._

- **Quản lý sản phẩm (Product Management):** Kiểm duyệt, thêm, sửa, hoặc **xóa mềm (Soft Delete)** toàn bộ sản phẩm.
- **Quản lý đơn hàng (Order Management):** Theo dõi trạng thái, chi tiết đơn hàng, doanh thu thực tế.
- **Quản lý người dùng (User Management):** Phân quyền hệ thống (chuyển đổi Customer thành Editor/Admin).
- **Thống kê & Báo cáo (Dashboard):** Xem tổng quan doanh thu (chỉ tính đơn PAID), tổng số đơn, Top sản phẩm bán chạy nhất. Lọc đơn hàng theo trạng thái, doanh thu theo thời gian.

### ✍️ EDITOR (Quản lý nội dung sản phẩm)

_Vai trò tập trung vào việc tạo và quản lý nội dung số._

- **Đăng tải sản phẩm:** Thêm sản phẩm mới và quản lý kho nội dung.
- **Chỉnh sửa cá nhân hóa:** Chỉ được quyền chỉnh sửa các sản phẩm do chính mình tạo ra (Cơ chế Ownership Authorization).
- ❌ _Không có quyền truy cập:_ Doanh thu, dữ liệu khách hàng, quản trị nhân sự.

### 👤 CUSTOMER (Khách hàng)

_Luồng trải nghiệm e-commerce mượt mà._

- **Shopping:** Xem danh sách, tìm kiếm và xem chi tiết sản phẩm.
- **Xác thực (Authentication):** Đăng ký, Đăng nhập an toàn.
- **Giỏ hàng & Thanh toán (Cart & Checkout):** Quản lý giỏ hàng, đặt hàng, thanh toán (Hỗ trợ retry payment).
- **Tài sản số (My Products):** Quản lý, tải xuống hoặc truy cập trực tiếp các sản phẩm số đã mua thành công.

---

## ⚡ 3. Tính năng hệ thống (System Features)

Dự án được module hóa để dễ dàng mở rộng và bảo trì:

| Module                           | Mô tả chi tiết chức năng                                                                       |
| :------------------------------- | :--------------------------------------------------------------------------------------------- |
| 🔐 **Authentication & Security** | Đăng ký, đăng nhập, bảo mật với JWT, mã hóa mật khẩu bcrypt, Rate Limiting (Chống Spam API).   |
| 👥 **Customer Relationship**     | Quản lý thông tin, lưu trữ lịch sử giao dịch khách hàng, phân loại khách hàng.                 |
| 📦 **Product & Inventory**       | Quản lý danh mục, kho sản phẩm số. Hỗ trợ Upload ảnh linh hoạt với Multer & Cloudinary.        |
| 🛒 **Order Management (Core)**   | Xử lý logic đặt hàng, tính toán chiết khấu, khóa đơn hàng khi đã thanh toán (Paid).            |
| 💳 **Payment Processing**        | Ghi nhận thanh toán an toàn, tự động cập nhật trạng thái đơn sang Success/Failed.              |
| 🚀 **Digital Delivery**          | Cấp quyền tự động, tạo link tải xuống/truy cập an toàn cho người dùng ngay sau khi thanh toán. |
| 📊 **Analytics Dashboard**       | Thống kê số lượng đơn hàng, doanh thu, lợi nhuận hiển thị trực quan cho Admin.                 |
| 🧾 **Activity Auditing (Log)**   | Lưu vết lịch sử thao tác quan trọng (Create/Update/Delete) để dễ dàng tracking.                |
| ⏱️ **Background Jobs**           | Tích hợp `node-cron` để tự động hóa các tác vụ hệ thống.                                       |
| 📧 **Email Notifications**       | Gửi email tự động thông qua `Nodemailer`.                                                      |

---

## 💻 4. Công nghệ sử dụng (Tech Stack)

Hệ thống áp dụng các công nghệ hiện đại, tiêu chuẩn công nghiệp nhằm đảm bảo **Bảo mật, Hiệu suất và Khả năng mở rộng**:

<details open>
<summary><b>Phần Backend (Máy chủ & API)</b></summary>

- **Runtime Environment:** Node.js
- **Framework:** Express.js (Xây dựng RESTful API)
- **ORM / Database Tool:** Prisma (Type-safe database client)
- **Database:** PostgreSQL (Cơ sở dữ liệu quan hệ)
- **Bảo mật & Middleware:**
  - `jsonwebtoken` (JWT) & `bcryptjs` (Xác thực & Mã hóa)
  - `cors` & `helmet` (Bảo mật HTTP headers)
  - `express-validator` (Validate dữ liệu đầu vào)
  - `express-rate-limit` (Phòng chống DDOS/Brute force)
- **Lưu trữ Media:** Cloudinary & Multer (Xử lý upload file/hình ảnh)
- **Tiện ích khác:** `Nodemailer` (Gửi Email), `node-cron` (Lập lịch tác vụ).

</details>

<details open>
<summary><b>Phần Frontend (Giao diện người dùng)</b></summary>

- **Cấu trúc & Giao diện:** ReactJS
- **Tương tác API:** Fetch API thuần, xử lý bất đồng bộ (Async/Await)

</details>

---

## 🗄️ 5. Cấu trúc cơ sở dữ liệu (Database Schema)

Hệ thống được chuẩn hóa dữ liệu với các bảng cốt lõi (Quản lý bởi **Prisma ORM**):

- `User`: Quản lý tài khoản và Role (Admin/Editor/Customer).
- `Product` & `Category`: Thông tin chi tiết sản phẩm và danh mục phân loại.
- `Order` & `OrderItem`: Hóa đơn lưu trữ thông tin giao dịch tổng và chi tiết từng mặt hàng.
- `Payment` & `Expense`: Bảng ghi nhận lịch sử dòng tiền vào (doanh thu) và dòng tiền ra (chi phí).
- `DigitalDelivery`: Quản lý việc cấp quyền truy cập các mặt hàng số cho khách hàng sau khi thanh toán thành công.

---

## 🚀 6. Hướng dẫn cài đặt & Chạy dự án (Getting Started)

Dự án được tối ưu để quá trình khởi chạy diễn ra nhanh gọn chỉ với một lệnh duy nhất.

### Yêu cầu tiên quyết (Prerequisites)

- [Node.js](https://nodejs.org/en/) (phiên bản v16 trở lên)
- [PostgreSQL Server](https://www.postgresql.org/)
- Editor: [Visual Studio Code](https://code.visualstudio.com/)

### Các bước cài đặt chi tiết

**1. Cài đặt thư viện**

```bash
npm install
```

**2. Cấu hình biến môi trường**
Tạo file `.env` (hoặc `.env.local`) và cấu hình API endpoint:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**3. Khởi động dự án (Development Mode)**

```bash
npm run dev
```

🎉 **Kết quả:**

- Giao diện CRM Frontend sẽ hoạt động tại cổng mặc định của Vite (ví dụ: `http://localhost:5173`). Giao diện sẽ tự động cập nhật (HMR) khi bạn chỉnh sửa mã nguồn.

---

## 📸 7. Hình ảnh hệ thống (Screenshots)

> _(Cập nhật ảnh chụp màn hình dự án của bạn tại đây để tăng tính trực quan cho Đồ án/CV)_

<div align="center">
  <img src="./src/assets/img/admin-dashboard.png" alt="Dashboard Screenshot" width="80%">
  <br>
  <em>Giao diện Dashboard Quản trị</em>
</div>

<br>

<div align="center">
  <img src="./src/assets/img/digital-store.png" alt="Shop Screenshot" width="80%">
  <br>
  <em>Giao diện Cửa hàng (Client-site)</em>
</div>

---

## 🛡️ 8. Nguồn gốc & Bản quyền (License & Author)

Dự án được xây dựng với mục đích học thuật, nghiên cứu cấu trúc thiết kế phần mềm.

**© 2026 E-Commerce CRM System.** All Rights Reserved.

<p align="center">
  <a href="mailto:td2812009@gmail.com"><img src="https://img.shields.io/badge/Contact_Support-td2812009%40gmail.com-blue?style=for-the-badge&logo=gmail" alt="Contact Support" /></a>
  <a href="tel:0363226094"><img src="https://img.shields.io/badge/Phone_Support-0363226094-green?style=for-the-badge&logo=whatsapp" alt="Phone Support" /></a>
</p>
