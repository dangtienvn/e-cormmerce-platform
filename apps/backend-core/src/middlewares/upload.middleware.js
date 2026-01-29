/**
 * @fileoverview Middleware xử lý tải lên tệp tin (File Upload).
 * Sử dụng thư viện Multer để nhận tệp ảnh tải lên từ form-data, lưu trữ trên bộ nhớ đệm
 * trước khi xử lý hoặc đẩy lên dịch vụ lưu trữ đám mây.
 */

const multer = require("multer");
const path = require("path");

// Cấu hình Multer lưu file trên bộ nhớ đệm (memoryStorage) để đẩy thẳng lên Cloudinary
/**
 * Cấu hình lưu trữ bộ nhớ (Memory Storage) cho Multer.
 * Tệp tin sẽ được lưu vào RAM thay vì ghi ra ổ cứng máy chủ.
 * @type {import('multer').StorageEngine}
 */
const storage = multer.memoryStorage();

// Giới hạn chỉ cho phép upload file ảnh, tối đa 5MB
/**
 * Bộ lọc tệp tin tải lên. Kiểm tra phần mở rộng tệp để đảm bảo 
 * chỉ cho phép tải lên các định dạng ảnh hợp lệ.
 * 
 * @param {import('express').Request} req - Đối tượng request của Express.
 * @param {Express.Multer.File} file - Thông tin đối tượng tệp tin được tải lên.
 * @param {import('multer').FileFilterCallback} cb - Hàm callback gọi lại để xác nhận tệp có hợp lệ không.
 * @returns {void}
 */
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép tải lên các định dạng ảnh (jpg, jpeg, png, webp, gif)"), false);
  }
};

/**
 * Đối tượng middleware xử lý tải lên (upload) được khởi tạo bởi Multer.
 * Đã cấu hình bộ nhớ, kích thước giới hạn (5MB) và bộ lọc ảnh.
 * Dùng làm middleware trong các route cần tải file ảnh lên.
 * @type {import('multer').Multer}
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
