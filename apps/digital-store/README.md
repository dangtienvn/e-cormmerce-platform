<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=Digital%20Store&fontSize=50&fontAlignY=38&desc=Giao%20Di%E1%BB%87n%20C%E1%BB%ADa%20H%C3%A0ng%20Th%C6%B0%C6%A1ng%20M%E1%BA%A1i%20%C4%90i%E1%BB%87n%20T%E1%BB%AD&descAlignY=60&descAlign=60" width="100%" />

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /></a>
  </p>
</div>

---

## 📖 Giới thiệu dự án (Overview)

**Digital Storefront** là ứng dụng Frontend được xây dựng dựa trên hệ sinh thái **Next.js 16** (App Router). Ứng dụng đóng vai trò là cửa hàng trực tuyến (Customer-facing), chuyên cung cấp và bán lẻ các mặt hàng/sản phẩm số (Digital Delivery). Với kiến trúc SSR/SSG của Next.js, dự án tối ưu hóa tối đa về hiệu suất tải trang và SEO.

> **[TODO: Thêm Link Live Preview / Vercel Deployment]**
> **[TODO: Thêm 2-3 hình ảnh screenshot giao diện cửa hàng]**

---

## ⚡ Các tính năng chính (Core Features)

- 🛒 **Trải nghiệm mua sắm hiện đại:** Giao diện được thiết kế tối giản, tinh tế, tối ưu UI/UX để tăng tỷ lệ chuyển đổi (Conversion Rate).
- ⚡ **Hiệu suất & SEO:** Sử dụng App Router và Server Components của Next.js để load trang cực nhanh và Index nội dung dễ dàng trên Google.
- 🔄 **Quản lý trạng thái (State Management):** Tích hợp **Zustand** giúp quản lý Giỏ hàng (Cart) và thông tin người dùng mượt mà, không giật lag.
- 🎨 **Responsive Design:** Giao diện tương thích 100% với các thiết bị di động, tablet thông qua **Tailwind CSS v4**.
- 🔌 **Tích hợp API:** Tương tác mượt mà với RESTful API bằng thư viện `Axios`.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Linting:** ESLint, Prettier

---

## ⚙️ Cài đặt & Khởi chạy (Getting Started)

### Cài đặt môi trường

1. Đảm bảo bạn đã cài đặt Node.js.
2. Tại thư mục `digital-store`, chạy lệnh để cài dependencies:
   ```bash
   npm install
   ```
3. Tạo file `.env.local` để thiết lập API URL kết nối tới Backend Core:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

### Khởi chạy môi trường Dev

```bash
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000).

---

## 🚀 Tính năng dự kiến cập nhật (Roadmap)

- [ ] Tích hợp cổng thanh toán trực tuyến (Stripe / VNPay).
- [ ] Tối ưu hóa điểm Lighthouse (PWA, Image Optimization).
- [ ] Thêm tính năng đánh giá, bình luận sản phẩm (Reviews).
