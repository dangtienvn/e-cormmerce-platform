/**
 * @fileoverview Tiện ích xử lý tải lên tệp tin, hỗ trợ tải ảnh dưới dạng chuỗi base64 lên Cloudinary hoặc lưu trữ cục bộ.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary nếu có biến môi trường
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

/**
 * @function ensureUploadsDir
 * @description Đảm bảo thư mục lưu trữ ảnh tải lên (uploads) cục bộ luôn tồn tại, tạo mới nếu cần thiết.
 * @returns {void} Không trả về giá trị.
 */
function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * @namespace FileUploadUtils
 * @description Tập hợp các hàm tiện ích hỗ trợ xử lý và lưu trữ tệp tin.
 */
const FileUploadUtils = {
  /**
   * Lưu ảnh từ chuỗi base64. Nếu dự án có cấu hình Cloudinary, ảnh sẽ được tải lên Cloudinary. Ngược lại, sẽ được lưu trữ cục bộ tại server.
   * 
   * @async
   * @param {string|Object} base64String - Chuỗi định dạng base64 của ảnh hoặc một object chứa thuộc tính lưu URL ảnh (`image_url` hoặc `url`).
   * @returns {Promise<string>} Đường dẫn URL an toàn (HTTPS/HTTP) của ảnh đã được lưu, hoặc trả về nguyên gốc chuỗi truyền vào nếu không hợp lệ.
   */
  async saveBase64Image(base64String) {
    if (typeof base64String === 'object' && base64String !== null) {
      base64String = base64String.image_url || base64String.url || '';
    }
    
    if (typeof base64String !== 'string') {
      return base64String;
    }

    if (!base64String || !base64String.startsWith('data:image')) {
      return base64String; // Return as is if not a base64 image (maybe already a URL)
    }

    try {
      // Cloudinary Upload
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const uploadResponse = await cloudinary.uploader.upload(base64String, {
          folder: 'shopflow_crm_products'
        });
        return uploadResponse.secure_url;
      }

      // Local Upload Fallback
      ensureUploadsDir();
      
      const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return base64String;
      }

      const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      
      const filename = `${crypto.randomUUID()}.${extension}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      
      fs.writeFileSync(filepath, buffer);
      
      return `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${filename}`;
    } catch (error) {
      console.error('Error saving base64 image:', error);
      return base64String;
    }
  }
};

module.exports = FileUploadUtils;
