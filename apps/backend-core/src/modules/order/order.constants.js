/**
 * @fileoverview Định nghĩa các hằng số được sử dụng trong module đơn hàng (Order).
 * Bao gồm các trạng thái đơn hàng, phương thức thanh toán và các quy tắc chuyển đổi trạng thái hợp lệ.
 * @module modules/order/constants
 */

/**
 * @typedef {Object} OrderStatus
 * @property {string} PENDING - Trạng thái chờ xử lý
 * @property {string} PAID - Trạng thái đã thanh toán
 * @property {string} REVOKED - Trạng thái đã thu hồi/hủy
 */

/**
 * Hằng số định nghĩa các trạng thái của đơn hàng.
 * @type {OrderStatus}
 */
const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REVOKED: "revoked",
};

/**
 * @typedef {Object} PaymentMethod
 * @property {string} BANK_TRANSFER - Phương thức chuyển khoản ngân hàng
 * @property {string} E_WALLET - Phương thức ví điện tử
 * @property {string} CARD - Phương thức thanh toán qua thẻ
 */

/**
 * Hằng số định nghĩa các phương thức thanh toán chuẩn.
 * @type {PaymentMethod}
 */
const PAYMENT_METHOD = {
  BANK_TRANSFER: "bank_transfer",
  E_WALLET: "e_wallet",
  CARD: "card",
};

/**
 * Ánh xạ các giá trị định danh cũ hoặc từ giao diện (UI) sang phương thức thanh toán chuẩn.
 * Hỗ trợ việc đồng bộ hóa dữ liệu thanh toán từ nhiều nguồn khác nhau.
 * @type {Object.<string, string>}
 */
const PAYMENT_METHOD_ALIASES = {
  transfer: PAYMENT_METHOD.BANK_TRANSFER,
  bank_transfer: PAYMENT_METHOD.BANK_TRANSFER,
  qr: PAYMENT_METHOD.BANK_TRANSFER,
  vietqr: PAYMENT_METHOD.BANK_TRANSFER,
  e_wallet: PAYMENT_METHOD.E_WALLET,
  momo: PAYMENT_METHOD.E_WALLET,
  cash: PAYMENT_METHOD.E_WALLET,
  card: PAYMENT_METHOD.CARD,
};

/**
 * Định nghĩa các quy tắc chuyển đổi trạng thái hợp lệ của đơn hàng.
 * Từ khóa là trạng thái hiện tại, mảng giá trị chứa các trạng thái đích có thể chuyển sang.
 * @type {Object.<string, string[]>}
 */
const ALLOWED_STATUS_TRANSITIONS = {
  pending: ["paid", "revoked"],
  paid: ["revoked"],
  revoked: ["pending"],
};

module.exports = {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_ALIASES,
  ALLOWED_STATUS_TRANSITIONS,
};
