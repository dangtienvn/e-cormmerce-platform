const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const PasswordResetRepository = require("../user/password-reset.repository");
const mailer = require("../../utils/mailer");
const { prisma } = require("../../config/database");
const {
  ORDER_STATUS,
  PAYMENT_METHOD_ALIASES,
  ALLOWED_STATUS_TRANSITIONS,
} = require("./order.constants");

/**
 * Chuẩn hóa phương thức thanh toán. Chuyển đổi các giá trị không đồng nhất về định dạng chuẩn.
 * 
 * @param {string} method - Phương thức thanh toán cần chuẩn hóa.
 * @returns {string} Phương thức thanh toán đã được chuẩn hóa.
 */
function normalizePaymentMethod(method) {
  const key = String(method || "bank_transfer").toLowerCase().trim();
  return PAYMENT_METHOD_ALIASES[key] || PAYMENT_METHOD_ALIASES.bank_transfer;
}

/**
 * Chuẩn hóa trạng thái đơn hàng. Nếu trạng thái không hợp lệ sẽ mặc định là PENDING.
 * 
 * @param {string} status - Trạng thái đơn hàng đầu vào.
 * @returns {string} Trạng thái đơn hàng chuẩn hóa (PENDING, PAID, REVOKED).
 */
function normalizeOrderStatus(status) {
  const s = String(status || ORDER_STATUS.PENDING).toLowerCase().trim();
  if (s === "completed") return ORDER_STATUS.PAID;
  if (s === "processing") return ORDER_STATUS.PENDING;
  if (Object.values(ORDER_STATUS).includes(s)) return s;
  return ORDER_STATUS.PENDING;
}

/**
 * Kiểm tra xem việc chuyển đổi trạng thái đơn hàng có hợp lệ hay không.
 * Nếu không hợp lệ sẽ ném ra lỗi (Error).
 * 
 * @param {string} oldStatus - Trạng thái hiện tại của đơn hàng.
 * @param {string} newStatus - Trạng thái mới muốn chuyển sang.
 * @returns {string} Trạng thái mới nếu việc chuyển đổi là hợp lệ.
 * @throws {Error} Ném lỗi nếu chuyển đổi trạng thái không được phép.
 */
function assertStatusTransition(oldStatus, newStatus) {
  const from = normalizeOrderStatus(oldStatus);
  const to = normalizeOrderStatus(newStatus);
  if (from === to) return to;
  const allowed = ALLOWED_STATUS_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(`Không thể chuyển trạng thái từ "${from}" sang "${to}"`);
  }
  return to;
}

/**
 * Cấp quyền truy cập các sản phẩm trong đơn hàng cho khách hàng.
 * 
 * @param {Object} tx - Đối tượng Prisma transaction (nếu có) hoặc đối tượng Prisma client mặc định.
 * @param {number|string} customerId - ID của khách hàng.
 * @param {number|string} orderId - ID của đơn hàng.
 * @returns {Promise<void>}
 */
async function grantOrderAccess(tx, customerId, orderId) {
  const db = tx || prisma;
  const items = await db.order_items.findMany({
    where: { order_id: parseInt(orderId) },
    select: { product_id: true }
  });
  for (const item of items) {
    await db.owned_products.upsert({
      where: {
        user_id_product_id: {
          user_id: parseInt(customerId),
          product_id: parseInt(item.product_id)
        }
      },
      update: {
        order_id: parseInt(orderId),
        status: 'active'
      },
      create: {
        user_id: parseInt(customerId),
        product_id: parseInt(item.product_id),
        order_id: parseInt(orderId),
        status: 'active'
      }
    });
  }
}

/**
 * Thu hồi quyền truy cập sản phẩm của khách hàng khi đơn hàng bị hủy hoặc thu hồi.
 * 
 * @param {Object} tx - Đối tượng Prisma transaction (nếu có) hoặc đối tượng Prisma client mặc định.
 * @param {number|string} orderId - ID của đơn hàng cần thu hồi quyền.
 * @returns {Promise<void>}
 */
async function revokeOrderAccess(tx, orderId) {
  const db = tx || prisma;
  await db.owned_products.updateMany({
    where: { order_id: parseInt(orderId) },
    data: { status: 'revoked' }
  });
}

/**
 * Ghi nhận lịch sử thanh toán cho một đơn hàng.
 * 
 * @param {Object} tx - Đối tượng Prisma transaction.
 * @param {Object} params - Thông tin thanh toán.
 * @param {number|string} params.orderId - ID của đơn hàng.
 * @param {number} params.amount - Số tiền thanh toán.
 * @param {string} params.paymentMethod - Phương thức thanh toán (ví dụ: bank_transfer, e_wallet, card).
 * @param {string} params.status - Trạng thái thanh toán (success, pending, v.v.).
 * @param {string} [params.transactionCode] - Mã giao dịch thanh toán (nếu có).
 * @returns {Promise<string>} Mã giao dịch thanh toán đã được ghi nhận.
 */
async function recordPayment(tx, { orderId, amount, paymentMethod, status, transactionCode }) {
  const db = tx || prisma;
  const code = transactionCode || `PAY-${Date.now()}-${orderId}`;
  const finalStatus = status === "success" ? 'success' : 'pending';

  await db.payments.create({
    data: {
      order_id: parseInt(orderId),
      amount: amount,
      status: finalStatus,
      payment_method: paymentMethod,
      transaction_code: code,
      paid_at: finalStatus === "success" ? new Date() : null
    }
  });

  // Also sync the order payment_status (enum: pending | success | failed)
  await db.orders.update({
    where: { id: parseInt(orderId) },
    data: { payment_status: finalStatus }
  });

  return code;
}

/**
 * Tìm kiếm đơn hàng đã tồn tại dựa vào khóa an toàn (idempotency key) để tránh trùng lặp giao dịch.
 * 
 * @param {Object} tx - Đối tượng Prisma transaction.
 * @param {number|string} customerId - ID của khách hàng.
 * @param {string} idempotencyKey - Khóa an toàn (idempotency key).
 * @returns {Promise<number|null>} ID của đơn hàng nếu tìm thấy, hoặc null nếu không tồn tại.
 */
async function findOrderByIdempotency(tx, customerId, idempotencyKey) {
  if (!idempotencyKey) return null;
  const db = tx || prisma;
  const code = `IDEM-${idempotencyKey}`;
  const order = await db.orders.findFirst({
    where: {
      customer_id: parseInt(customerId),
      payments: {
        some: { transaction_code: code }
      }
    }
  });
  return order?.id || null;
}

/**
 * Tạo mới tài khoản khách hàng và gửi email mời thiết lập mật khẩu.
 * 
 * @param {Object} tx - Đối tượng Prisma transaction.
 * @param {Object} params - Thông tin khách hàng.
 * @param {string} params.email - Email của khách hàng.
 * @param {string} [params.full_name] - Họ và tên khách hàng.
 * @param {string} [params.phone] - Số điện thoại khách hàng.
 * @returns {Promise<number>} ID của người dùng vừa được tạo.
 * @throws {Error} Lỗi nếu vai trò 'customer' không tồn tại.
 */
async function createCustomerWithSetPasswordInvite(tx, { email, full_name, phone }) {
  const db = tx || prisma;
  const randomSecret = crypto.randomBytes(32).toString("hex");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(randomSecret, salt);

  const role = await db.roles.findFirst({
    where: { name: 'customer' }
  });
  if (!role) throw new Error("Vai trò customer chưa được cấu hình");

  const newUser = await db.users.create({
    data: {
      email,
      password: hashedPassword,
      full_name: full_name || "Khách hàng",
      phone: phone || null,
      role_id: role.id,
      customer_profiles: {
        create: {
          source: 'manual',
          status: 'lead',
          tag: 'Normal'
        }
      }
    }
  });

  const userId = newUser.id;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.password_resets.deleteMany({ where: { user_id: userId } });
  await db.password_resets.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });

  mailer.sendSetPasswordInviteEmail(email, token, full_name).catch((e) => console.error("Set-password email err:", e));

  return userId;
}

/**
 * Thực thi các hệ quả thay đổi tùy thuộc vào trạng thái mới của đơn hàng (như cấp quyền truy cập, ghi nhận thanh toán, hoàn trả voucher).
 * 
 * @param {Object} tx - Đối tượng Prisma transaction.
 * @param {Object} order - Thông tin đơn hàng hiện tại.
 * @param {string} newStatus - Trạng thái đơn hàng mới.
 * @param {string} [paymentMethod] - Phương thức thanh toán áp dụng cho trạng thái 'PAID'.
 * @returns {Promise<string>} Trạng thái đơn hàng mới đã được xác nhận và áp dụng.
 */
async function applyStatusSideEffects(tx, order, newStatus, paymentMethod) {
  const oldStatus = normalizeOrderStatus(order.status);
  const nextStatus = normalizeOrderStatus(newStatus);
  if (oldStatus === nextStatus) return nextStatus;

  assertStatusTransition(oldStatus, nextStatus);

  if (nextStatus === ORDER_STATUS.PAID && oldStatus !== ORDER_STATUS.PAID) {
    await grantOrderAccess(tx, order.customer_id, order.id);
    await recordPayment(tx, {
      orderId: order.id,
      amount: order.final_amount,
      paymentMethod: normalizePaymentMethod(paymentMethod || order.payment_method),
      status: "success",
      transactionCode: `PAY-${order.id}-${Date.now()}`,
    });
    
    if (order.voucher_code) {
        const db = tx || prisma;
        await db.vouchers.updateMany({
            where: { code: order.voucher_code },
            data: { used_count: { increment: 1 } }
        });
    }
  }

  if (
    nextStatus === ORDER_STATUS.REVOKED &&
    oldStatus === ORDER_STATUS.PAID
  ) {
    await revokeOrderAccess(tx, order.id);
    
    if (order.voucher_code) {
        const db = tx || prisma;
        await db.vouchers.updateMany({
            where: { code: order.voucher_code },
            data: { used_count: { decrement: 1 } }
        });
    }
  }

  return nextStatus;
}

module.exports = {
  normalizePaymentMethod,
  normalizeOrderStatus,
  assertStatusTransition,
  grantOrderAccess,
  revokeOrderAccess,
  recordPayment,
  findOrderByIdempotency,
  createCustomerWithSetPasswordInvite,
  applyStatusSideEffects,
};
