/**
 * @fileoverview Cấu hình nodemailer và các hàm tiện ích để gửi email thông báo (đặt lại mật khẩu, hóa đơn, xác nhận thanh toán).
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    // Đây là tài khoản test miễn phí của Ethereal (dùng để test gửi mail khi chưa có Gmail thật)
    user: process.env.SMTP_USER || 'jaleel.runolfsdottir58@ethereal.email',
    pass: process.env.SMTP_PASS || 'TTrN59J1H14W8a5BwK'
  }
});

/**
 * @function sendResetPasswordEmail
 * @description Gửi email chứa liên kết đặt lại mật khẩu an toàn đến người dùng.
 * 
 * @async
 * @param {string} toEmail - Địa chỉ email nhận liên kết đặt lại mật khẩu.
 * @param {string} token - Mã token an toàn dùng để xác thực đặt lại mật khẩu.
 * @returns {Promise<Object>} Kết quả phản hồi từ máy chủ SMTP sau khi gửi.
 */
async function sendResetPasswordEmail(toEmail, token) {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  // link to static reset page
  const resetLink = `${frontend.replace(/\/$/, '')}/reset-password.html?token=${token}`;

  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'no-reply@example.com',
    to: toEmail,
    subject: 'Đặt lại mật khẩu',
    text: `Bạn hoặc ai đó đã yêu cầu đặt lại mật khẩu. Mở liên kết sau để đặt lại mật khẩu: ${resetLink}`,
    html: `<p>Bạn hoặc ai đó đã yêu cầu đặt lại mật khẩu.</p><p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu (hết hạn sau 1 giờ):</p><p><a href="${resetLink}">${resetLink}</a></p>`
  });

  return info;
}

/**
 * @function paymentMethodLabel
 * @description Hàm tiện ích giúp chuyển đổi mã phương thức thanh toán (tiếng Anh) sang tên hiển thị (tiếng Việt).
 * 
 * @param {string} method - Mã phương thức thanh toán (ví dụ: 'bank_transfer', 'momo', 'card').
 * @returns {string} Tên phương thức thanh toán tiếng Việt.
 */
function paymentMethodLabel(method) {
  const m = String(method || '').toLowerCase();
  if (m === 'bank_transfer' || m === 'transfer' || m === 'qr') return 'Chuyển khoản';
  if (m === 'e_wallet' || m === 'momo' || m === 'cash') return 'Ví điện tử';
  if (m === 'card') return 'Thẻ tín dụng';
  return method || 'Khác';
}

/**
 * @function sendSetPasswordInviteEmail
 * @description Gửi email mời tạo mật khẩu cho người dùng mới được tạo trên hệ thống bởi quản trị viên.
 * 
 * @async
 * @param {string} toEmail - Email của người dùng mới.
 * @param {string} token - Mã token xác thực dùng để tạo mật khẩu.
 * @param {string} name - Tên khách hàng/người dùng.
 * @returns {Promise<Object>} Kết quả phản hồi từ máy chủ SMTP sau khi gửi.
 */
async function sendSetPasswordInviteEmail(toEmail, token, name) {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  const setPasswordLink = `${frontend.replace(/\/$/, '')}/reset-password.html?token=${token}`;

  const html = `
    <h2>Xin chào ${name || 'bạn'}!</h2>
    <p>Tài khoản của bạn đã được tạo trên hệ thống Digital Store.</p>
    <p>Vui lòng đặt mật khẩu để đăng nhập và truy cập sản phẩm đã mua:</p>
    <p><a href="${setPasswordLink}">${setPasswordLink}</a></p>
    <p><em>Liên kết có hiệu lực trong 7 ngày.</em></p>
  `;

  return transporter.sendMail({
    from: process.env.FROM_EMAIL || 'no-reply@example.com',
    to: toEmail,
    subject: 'Thiết lập mật khẩu tài khoản Digital Store',
    html,
    text: `Đặt mật khẩu tại: ${setPasswordLink}`,
  });
}

/**
 * Gửi email xác thực địa chỉ email sau khi đăng ký.
 * @async
 * @param {string} toEmail
 * @param {string} token
 */
async function sendEmailVerification(toEmail, token) {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyLink = `${frontend.replace(/\/$/, '')}/verify-email?token=${token}`;

  const info = await transporter.sendMail({
  from: process.env.FROM_EMAIL || 'no-reply@example.com',
  to: toEmail,
  subject: 'Xác thực địa chỉ email',
  html: `<p>Xin chào,</p><p>Nhấn vào liên kết sau để xác thực email của bạn:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>Liên kết có hiệu lực trong 7 ngày.</p>`,
  text: `Mở liên kết để xác thực email: ${verifyLink}`
  });

  return info;
}

/**
 * @function sendInvoiceEmail
 * @description Gửi email chứa thông tin chi tiết đơn hàng (hóa đơn) và hướng dẫn thanh toán cho khách hàng.
 * 
 * @async
 * @param {string} toEmail - Địa chỉ email của khách hàng.
 * @param {Object} orderDetails - Thông tin chi tiết của đơn hàng.
 * @param {number|string} orderDetails.id - Mã đơn hàng.
 * @param {string} orderDetails.customer_name - Tên của khách hàng.
 * @param {number|string} orderDetails.final_amount - Số tiền cuối cùng cần thanh toán.
 * @param {string} orderDetails.payment_method - Phương thức thanh toán khách hàng chọn.
 * @param {Array<Object>} orderDetails.items - Danh sách các sản phẩm có trong đơn hàng.
 * @returns {Promise<Object>} Kết quả phản hồi từ máy chủ SMTP sau khi gửi.
 */
async function sendInvoiceEmail(toEmail, orderDetails) {
  const { id, customer_name, final_amount, payment_method, items } = orderDetails;
  let paymentInstructions = '';
  
  const pm = String(payment_method || '').toLowerCase();
  if (pm === 'transfer' || pm === 'bank_transfer' || pm === 'qr') {
    paymentInstructions = `
      <h3>Hướng dẫn thanh toán chuyển khoản:</h3>
      <p>Ngân hàng: <strong>Vietcombank</strong></p>
      <p>Số tài khoản: <strong>123456789</strong></p>
      <p>Chủ tài khoản: <strong>ADMIN CRM</strong></p>
      <p>Nội dung chuyển khoản: <strong>THANHTOAN DH${id}</strong></p>
    `;
  }

  let itemsHtml = (items || []).map(i => `<li>${i.name || i.product_name} - Số lượng: ${i.quantity}</li>`).join('');

  const html = `
    <h2>Xin chào ${customer_name},</h2>
    <p>Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng <strong>#${id}</strong> của bạn:</p>
    <ul>${itemsHtml}</ul>
    <p>Tổng thanh toán: <strong>${Number(final_amount).toLocaleString()} VNĐ</strong></p>
    <p>Phương thức thanh toán: <strong>${paymentMethodLabel(payment_method)}</strong></p>
    ${paymentInstructions}
    <p>Vui lòng hoàn tất thanh toán để chúng tôi có thể xử lý đơn hàng cho bạn sớm nhất.</p>
  `;

  return await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'no-reply@example.com',
    to: toEmail,
    subject: `Thông tin đơn hàng #${id}`,
    html
  });
}

/**
 * @function sendPaymentSuccessEmail
 * @description Gửi email xác nhận thanh toán thành công và cung cấp liên kết truy cập vào sản phẩm hoặc khóa học đã mua.
 * 
 * @async
 * @param {string} toEmail - Địa chỉ email của khách hàng.
 * @param {Object} orderDetails - Chi tiết về đơn hàng đã thanh toán.
 * @param {number|string} orderDetails.id - Mã đơn hàng.
 * @param {string} orderDetails.customer_name - Tên của khách hàng.
 * @param {Array<Object>} orderDetails.items - Danh sách các sản phẩm/khóa học trong đơn hàng.
 * @returns {Promise<Object>} Kết quả phản hồi từ máy chủ SMTP sau khi gửi.
 */
async function sendPaymentSuccessEmail(toEmail, orderDetails) {
  const { id, customer_name, items } = orderDetails;
  
  let itemsHtml = (items || []).map(i => `<li>${i.name || i.product_name}</li>`).join('');
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  const learnLink = `${frontend.replace(/\/$/, '')}/my-learning.html`;

  const html = `
    <h2>Thanh toán thành công!</h2>
    <p>Xin chào ${customer_name},</p>
    <p>Đơn hàng <strong>#${id}</strong> của bạn đã được thanh toán thành công.</p>
    <p>Bạn đã được cấp quyền truy cập vào các sản phẩm sau:</p>
    <ul>${itemsHtml}</ul>
    <p>Hãy đăng nhập và truy cập vào trang <a href="${learnLink}">Khóa học của tôi</a> để bắt đầu học ngay nhé!</p>
  `;

  return await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'no-reply@example.com',
    to: toEmail,
    subject: `Xác nhận thanh toán thành công đơn hàng #${id}`,
    html
  });
}

module.exports = {
  sendResetPasswordEmail,
  sendSetPasswordInviteEmail,
  sendInvoiceEmail,
  sendPaymentSuccessEmail,
  sendEmailVerification,
  paymentMethodLabel,
};
