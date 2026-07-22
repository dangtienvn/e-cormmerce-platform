/**
 * @fileoverview Điểm khởi chạy chính (Entry point) của ứng dụng Backend.
 * Khởi tạo Express server, cấu hình middleware, kết nối database và đăng ký các routes.
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./src/config/database");
const authRoutes = require("./src/modules/auth/auth.route");
const { createLimiter } = require("./src/middlewares/rate-limiter");
const errorHandler = require("./src/middlewares/error-handler");
const fs = require('fs');
const TrashService = require('./src/shared/trash.service');
const path = require("path");
const morgan = require('morgan');
const logger = require('./src/utils/logger');

const app = express();
// Tin tưởng proxy để lấy IP chính xác khi dùng Nginx/Render/Heroku
app.set("trust proxy", 1);

// Khởi chạy dọn rác tự động (cron job xoá dữ liệu thùng rác cũ)
TrashService.init();

// Kết nối với cơ sở dữ liệu Prisma/PostgreSQL
connectDB();

// middleware
app.use(cors());  
app.use(express.json());

// morgan logging
app.use(morgan('combined', { stream: logger.stream }));

// phục vụ các tệp tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, "uploads")));

// global rate limiter (conservative defaults)
app.use(createLimiter());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", require("./src/modules/product/product.route"));
app.use("/api/categories", require("./src/modules/category/category.route"));
app.use("/api/orders", require("./src/modules/order/order.route"));
app.use("/api/users", require("./src/modules/user/user.route"));
app.use("/api/logs", require("./src/modules/log/log.route"));
app.use("/api/reports", require("./src/modules/report/report.route"));
app.use("/api/notifications", require("./src/modules/notification/notification.route"));
app.use("/api/expenses", require("./src/modules/expense/expense.route"));
app.use("/api/vouchers", require("./src/modules/voucher/voucher.route"));
app.use("/api/tickets", require("./src/modules/ticket/ticket.route"));
app.use("/api/cart", require("./src/modules/cart/cart.routes"));
app.use("/api/payment", require("./src/modules/payment/payment.route"));
app.use("/api/posts", require("./src/modules/post/post.route"));
app.use("/api/post-comments", require("./src/modules/post_comment/post_comment.route"));
app.use("/api/post-categories", require("./src/modules/post_category/post_category.route"));
app.use("/api/files", require("./src/modules/file/file.route"));

// Fallback to serve index.html for any other requests (helps with navigation)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 
// error handler (last)
app.use(errorHandler);