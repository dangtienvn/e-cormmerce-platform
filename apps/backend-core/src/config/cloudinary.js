/**
 * @fileoverview Module cấu hình và khởi tạo dịch vụ Cloudinary.
 * Module này nạp các biến môi trường và thiết lập thông tin xác thực 
 * cho Cloudinary SDK để sử dụng cho việc tải lên và quản lý hình ảnh/tệp tin.
 */
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

/**
 * Thiết lập cấu hình cho đối tượng Cloudinary bằng các biến môi trường.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Module xuất đối tượng cloudinary đã được cấu hình.
 * @module config/cloudinary
 */
module.exports = cloudinary;
