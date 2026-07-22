<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=NexBlog%20CMS&fontSize=50&fontAlignY=38&desc=N%E1%BB%81n%20T%E1%BA%A3ng%20Blog%20v%C3%A0%20Qu%E1%BA%A3n%20Tr%E1%BB%8B%20N%E1%BB%99i%20Dung%20Chuy%C3%AAn%20Nghi%E1%BB%87p&descAlignY=60&descAlign=60" width="100%" />
</div>

---

## 📖 Giới thiệu dự án (Overview)

**NexBlog CMS** là một nền tảng quản trị nội dung (CMS) mạnh mẽ kết hợp blog thương hiệu cá nhân, được thiết kế chuyên biệt cho lập trình viên và các nhà sáng tạo nội dung. Xây dựng hoàn toàn trên nền tảng **Next.js 15+** và **PostgreSQL**, dự án mang đến trải nghiệm viết bài tối ưu, quản lý danh mục sâu, cùng trải nghiệm đọc mượt mà.

> **[TODO: Thêm Link Live Preview của Blog]**
> **[TODO: Bổ sung hình ảnh giao diện Admin CMS và giao diện người dùng]**

---

## 🚀 Tính năng nổi bật (Key Features)

### 🖋️ Hệ thống Quản trị Nội dung (CMS)
- **Soạn thảo mạnh mẽ:** Giao diện Admin đầy đủ chức năng quản lý, tạo, sửa bài viết, chuẩn SEO.
- **Phân cấp danh mục (Taxonomy):** Thuật toán xử lý danh mục đa cấp (Recursive Tree), cho phép tạo hệ thống phân loại sâu và linh hoạt.
- **Dashboard Thống kê:** Bảng theo dõi lượt xem, hiệu suất bài viết và các số liệu hệ thống quan trọng.

### 📖 Trải nghiệm người dùng (Reader Experience)
- **Tốc độ cực nhanh:** Ứng dụng Server Components giúp tốc độ phản hồi gần như ngay lập tức.
- **Tối ưu hóa SEO:** Đầy đủ Semantic HTML, Dynamic Meta Tags đảm bảo điểm SEO tuyệt đối.
- **Giao diện hiện đại:** UI/UX tập trung vào trải nghiệm đọc, loại bỏ sự xao nhãng, kết hợp cùng TailwindCSS hiện đại.

### 🏗️ Kiến trúc Kỹ thuật (Technical Architecture)
- **Server-Side Rendering (SSR):** Đảm bảo Google dễ dàng thu thập dữ liệu nội dung bài viết ngay lập tức.
- **Service Layer Pattern:** Tách biệt hoàn toàn Business Logic ra khỏi UI Components để code "clean" và dễ bảo trì.
- **Kết nối Database Trực tiếp:** Tối ưu hóa truy vấn PostgreSQL bằng Connection Pooling trực tiếp từ Server Components, bỏ qua độ trễ của API middleware.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Framework:** Next.js (App Router, Server Actions)
- **UI & Styling:** TailwindCSS
- **Database:** PostgreSQL
- **Caching (Tuỳ chọn):** Redis
- **Kiến trúc:** Service Layer Pattern, RESTful API
- **Triển khai (Deployment):** Vercel

---

## 📂 Cấu trúc thư mục (Project Structure)

```text
├── src/
│   ├── app/           # App Router (Pages, Layouts, API Routes)
│   ├── services/      # Backend logic & Truy vấn CSDL (Service Layer)
│   ├── components/    # Modular UI Components
│   ├── lib/           # Cấu hình lõi (PostgreSQL connection)
│   └── utils/         # Helper functions & Thuật toán đệ quy
```

---

## 📈 Dấu ấn Kỹ thuật (Engineering Highlights)

- **Chuyển đổi công nghệ:** Tự thực hiện Migration từ hệ thống cũ (Express/Pug/MongoDB) sang hệ sinh thái Next.js hiện đại, giữ nguyên toàn vẹn dữ liệu.
- **Thuật toán Đệ quy (Recursive Tree):** Áp dụng linh hoạt để xử lý cấu trúc dữ liệu đa tầng trong danh mục bài viết.
- **Trực tiếp truy xuất DB:** Tận dụng tối đa Next.js Server Components.

---

## ⚙️ Cài đặt & Khởi chạy (Getting Started)

### Yêu cầu hệ thống:
- Node.js 18.x trở lên
- PostgreSQL Database

### Cài đặt:
1. Chạy `npm install`.
2. Tạo file `.env.local` với cấu hình PostgreSQL:
   ```env
   POSTGRES_USER=your_user
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=your_db
   ```
3. Chạy môi trường Dev bằng lệnh `npm run dev`.

---

## 👨‍💻 Thông tin liên hệ (Contact)

- **Tác giả:** Đặng Thanh Tiến
- **Email:** td2812009@gmail.com
- **Số điện thoại:** 0363226094
- **LinkedIn:** [Thanh Tien Dang](https://www.linkedin.com/in/thanh-tien-dang/)
