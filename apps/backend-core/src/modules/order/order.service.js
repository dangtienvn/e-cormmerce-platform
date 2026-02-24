
const AppError = require("../../utils/app-error");
const OrderRepository = require("./order.repository");
const ProductRepository = require("../product/product.repository");
const NotificationService = require("../notification/notification.service");
const { withTransaction } = require("../../utils/transaction.helper");
const mailer = require("../../utils/mailer");
const { prisma } = require("../../config/database");
const { ORDER_STATUS } = require("./order.constants");
const {
  normalizePaymentMethod,
  normalizeOrderStatus,
  recordPayment,
  findOrderByIdempotency,
  createCustomerWithSetPasswordInvite,
  applyStatusSideEffects,
  grantOrderAccess,
} = require("./order.helpers");

/**
 * @fileoverview Lớp Service xử lý các logic nghiệp vụ (business logic) liên quan đến đơn hàng, bao gồm tạo, sửa, xóa, thanh toán và gửi email.
 * @module modules/order/service
 */

/**
 * Đối tượng cung cấp các dịch vụ quản lý đơn hàng.
 */
const OrderService = {
  /**
   * Lấy danh sách tất cả các đơn hàng.
   * 
   * @param {Object} filters - Các điều kiện lọc.
   * @returns {Promise<Array<Object>>} Danh sách đơn hàng.
   */
  async getAllOrders(filters = {}) {
    return await OrderRepository.findAll(filters);
  },

  /**
   * Lấy chi tiết một đơn hàng bằng ID, có kiểm tra quyền truy cập.
   * 
   * @param {number|string} id - ID của đơn hàng.
   * @param {Object|null} actor - Thông tin người dùng đang thực hiện yêu cầu (để kiểm tra quyền).
   * @returns {Promise<Object>} Thông tin chi tiết đơn hàng.
   * @throws {AppError} Lỗi nếu không tìm thấy đơn hàng hoặc người dùng không có quyền xem.
   */
  async getOrderById(id, actor = null) {
    const bill = await OrderRepository.findById(id);
    if (!bill) throw new AppError("Không tìm thấy hóa đơn", 400);

    if (actor) {
       const role = String(actor.role_name || '').toLowerCase();
       if (role !== 'admin' && role !== 'sale' && Number(bill.customer_id) !== Number(actor.id)) {
          throw new AppError("Bạn không có quyền xem đơn hàng này", 400);
       }
    }

    return bill;
  },

  /**
   * Tạo một đơn hàng mới từ phía quản trị viên. Có hỗ trợ tạo tự động tài khoản cho khách mới qua email.
   * 
   * @param {Object} data - Thông tin khởi tạo đơn hàng.
   * @returns {Promise<Object>} Thông tin đơn hàng vừa được tạo.
   * @throws {AppError} Lỗi nếu dữ liệu đầu vào không hợp lệ hoặc thiếu thông tin cần thiết.
   */
  async createOrder(data) {
    if (!data.items || data.items.length === 0) {
      throw new AppError("Hóa đơn phải có ít nhất một sản phẩm", 400);
    }

    return await withTransaction(async (tx) => {
      let final_customer_id = data.customer_id;
      
      if (!final_customer_id && data.customer_email) {
        const existing = await tx.users.findFirst({
          where: { email: data.customer_email }
        });
        if (existing) {
          final_customer_id = existing.id;
        } else {
          final_customer_id = await createCustomerWithSetPasswordInvite(tx, {
            email: data.customer_email,
            full_name: data.customer_name || "Khách vãng lai",
            phone: data.customer_phone,
          });
        }
      } else if (!final_customer_id) {
          throw new AppError("Thiếu thông tin khách hàng (cần chọn khách cũ hoặc nhập Email khách mới, 400)");
      }

      if (data.customer_phone && final_customer_id) {
        await tx.users.update({
          where: { id: parseInt(final_customer_id) },
          data: { phone: data.customer_phone }
        });
      }

      let total_amount = 0;
      const enrichedItems = [];
      for (const item of data.items) {
        const product = await tx.products.findFirst({
          where: { id: parseInt(item.product_id), deleted_at: null },
          select: { id: true, name: true, price: true, cost_price: true }
        });
        if (!product) throw new AppError(`Sản phẩm ${item.product_id} không tồn tại hoặc đã bị xóa`, 400);
        const price = Number(product.price || 0);
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const amount = price * quantity;
        total_amount += amount;
        enrichedItems.push({ 
          product_id: product.id,
          name: product.name,
          cost_price: Number(product.cost_price || 0),
          quantity, 
          price,
          total_price: amount
        });
      }

      const discount_amount = Number(data.discount_amount) || 0;
      const final_amount = Math.max(0, total_amount - discount_amount);
      const normalizedPayment = normalizePaymentMethod(data.payment_method);
      const normalizedStatus = normalizeOrderStatus(data.status);

      const orderId = await OrderRepository.createOrderRecord(tx, {
        customer_id: final_customer_id,
        created_by: data.user_id,
        total_amount,
        discount: discount_amount,
        final_amount,
        payment_method: normalizedPayment,
        status: ORDER_STATUS.PENDING
      });

      await OrderRepository.createOrderItems(tx, orderId, enrichedItems);

      const orderRow = {
        id: orderId,
        customer_id: final_customer_id,
        final_amount,
        payment_method: normalizedPayment,
        status: ORDER_STATUS.PENDING,
      };
      
      const effectiveStatus = await applyStatusSideEffects(
        tx,
        orderRow,
        normalizedStatus,
        normalizedPayment
      );
      
      await OrderRepository.updateOrderInfo(tx, orderId, { status: effectiveStatus });

      if (final_customer_id) {
        NotificationService.notifyUser(final_customer_id, `Đơn hàng #${orderId} vừa được tạo cho bạn.`, `/src/pages/client/profile.html?tab=history&orderId=${orderId}`).catch(console.error);
      }

      try {
        const userRow = await tx.users.findFirst({
          where: { id: parseInt(final_customer_id) },
          select: { email: true, full_name: true, username: true }
        });
        if (userRow && userRow.email) {
          const userEmail = userRow.email;
          const custName = userRow.full_name || userRow.username || data.customer_name;
          const orderDetailsForEmail = {
            id: orderId,
            customer_name: custName,
            final_amount,
            payment_method: normalizedPayment,
            items: enrichedItems,
          };

          if (effectiveStatus === ORDER_STATUS.PENDING) {
            mailer.sendInvoiceEmail(userEmail, orderDetailsForEmail).catch((e) => console.error("Email err:", e));
          } else if (effectiveStatus === ORDER_STATUS.PAID) {
            mailer.sendPaymentSuccessEmail(userEmail, orderDetailsForEmail).catch((e) => console.error("Email err:", e));
          }
        }
      } catch (e) {
        console.error("Lỗi gửi email:", e);
      }

      return { id: orderId, customer_id: final_customer_id, user_id: data.user_id, total_amount, status: effectiveStatus, items: enrichedItems };
    });
  },

  /**
   * Cập nhật thông tin của một đơn hàng, bao gồm danh sách sản phẩm, trạng thái và giảm giá.
   * 
   * @param {number|string} id - ID của đơn hàng cần cập nhật.
   * @param {Object} data - Dữ liệu cập nhật.
   * @returns {Promise<Object>} Trạng thái mới của đơn hàng.
   * @throws {AppError} Lỗi nếu đơn hàng không tồn tại hoặc cập nhật không hợp lệ theo quy định nghiệp vụ.
   */
  async updateOrder(id, data) {
    const { status, discount_amount = 0, payment_method = "", items = [] } = data;
    const normalizedPayment = normalizePaymentMethod(payment_method);
    const normalizedStatus = normalizeOrderStatus(status);

    return await withTransaction(async (tx) => {
      const oldOrder = await tx.orders.findFirst({
        where: { id: parseInt(id) }
      });
      if (!oldOrder) throw new AppError("Đơn hàng không tồn tại", 400);

      if (normalizeOrderStatus(oldOrder.status) !== ORDER_STATUS.PENDING) {
          if (items && items.length > 0) {
              throw new AppError(`Đơn hàng đang ở trạng thái "${oldOrder.status}", không thể thay đổi danh sách sản phẩm.`, 400);
          }
          if (discount_amount !== undefined && Number(discount_amount) !== Number(oldOrder.discount)) {
              throw new AppError(`Đơn hàng đang ở trạng thái "${oldOrder.status}", không thể thay đổi giảm giá.`, 400);
          }
      }

      let total_amount = Number(oldOrder.total_amount) || 0;
      let final_amount = Number(oldOrder.final_amount) || 0;
      let enrichedItems = [];

      if (items && items.length > 0) {
        total_amount = 0;
        for (const item of items) {
          const product = await tx.products.findFirst({
            where: { id: parseInt(item.product_id), deleted_at: null },
            select: { id: true, name: true, price: true, cost_price: true, status: true }
          });
          if (!product) throw new AppError(`Sản phẩm ${item.product_id} không tồn tại hoặc đã bị xóa`, 400);
          const price = Number(product.price || 0);
          const quantity = Math.max(1, Number(item.quantity) || 1);
          const amount = price * quantity;
          total_amount += amount;
          enrichedItems.push({
            product_id: product.id,
            name: product.name,
            cost_price: Number(product.cost_price || 0),
            quantity,
            price,
            total_price: amount,
          });
        }

        final_amount = Math.max(0, total_amount - (Number(discount_amount) || 0));
        await OrderRepository.clearOrderItems(tx, id);
        await OrderRepository.createOrderItems(tx, id, enrichedItems);

        await OrderRepository.updateOrderInfo(tx, id, {
          discount: discount_amount,
          final_amount,
          total_amount,
          payment_method: normalizedPayment
        });
        oldOrder.final_amount = final_amount;
      } else if (discount_amount !== undefined) {
        final_amount = Math.max(0, total_amount - (Number(discount_amount) || 0));
        await OrderRepository.updateOrderInfo(tx, id, {
          discount: discount_amount,
          final_amount,
          payment_method: normalizedPayment
        });
        oldOrder.final_amount = final_amount;
      }

      const nextStatus = await applyStatusSideEffects(tx, oldOrder, normalizedStatus, normalizedPayment);
      await OrderRepository.updateOrderInfo(tx, id, { status: nextStatus });

      if (nextStatus === ORDER_STATUS.PAID && normalizeOrderStatus(oldOrder.status) !== ORDER_STATUS.PAID) {
        try {
          const userRow = await tx.users.findFirst({
            where: { id: parseInt(oldOrder.customer_id) },
            select: { email: true, full_name: true, username: true }
          });
          if (userRow && userRow.email) {
            const finalItems = await tx.order_items.findMany({
              where: { order_id: parseInt(id) },
              select: { product_name: true, quantity: true }
            });
            mailer
              .sendPaymentSuccessEmail(userRow.email, {
                id,
                customer_name: userRow.full_name || userRow.username,
                items: finalItems.map(x => ({ name: x.product_name, quantity: x.quantity })),
              })
              .catch((e) => console.error("Email err:", e));
          }
        } catch (e) {
          console.error("Lỗi gửi email:", e);
        }
      }

      return { id, status: nextStatus };
    });
  },

  /**
   * Xóa mềm một đơn hàng. Chỉ cho phép xóa khi đơn hàng đang chờ thanh toán (pending).
   * 
   * @param {number|string} id - ID của đơn hàng cần xóa.
   * @returns {Promise<boolean>} True nếu xóa thành công.
   * @throws {AppError} Lỗi nếu đơn hàng không tồn tại hoặc không ở trạng thái pending.
   */
  async deleteOrder(id) {
    const bill = await OrderRepository.findById(id);
    if (!bill) throw new AppError("Không tìm thấy hóa đơn", 400);
    if (normalizeOrderStatus(bill.status) !== ORDER_STATUS.PENDING) {
        throw new AppError("Chỉ có thể xóa đơn hàng đang chờ thanh toán (pending, 400).");
    }
    return await OrderRepository.delete(id);
  },

  /**
   * Lấy danh sách các đơn hàng đã bị xóa mềm (thùng rác).
   * 
   * @param {Object} filters - Các điều kiện lọc.
   * @returns {Promise<Array<Object>>} Danh sách đơn hàng trong thùng rác.
   */
  async getTrash(filters = {}) {
    return await OrderRepository.findTrash(filters);
  },

  /**
   * Phục hồi lại một đơn hàng đã bị xóa mềm.
   * 
   * @param {number|string} id - ID của đơn hàng.
   * @returns {Promise<boolean>} True nếu phục hồi thành công.
   */
  async restoreOrder(id) {
    return await OrderRepository.restore(id);
  },

  /**
   * Thực hiện quy trình thanh toán (checkout) do người dùng (khách hàng) yêu cầu.
   * Áp dụng mã giảm giá, kiểm tra trùng lặp đơn hàng, khởi tạo đơn, gửi email và sinh thông báo.
   * 
   * @param {number|string} userId - ID của khách hàng đang thực hiện checkout.
   * @param {Object} data - Dữ liệu giỏ hàng và thông tin thanh toán.
   * @returns {Promise<Object>} Thông tin đơn hàng vừa được tạo hoặc đã có.
   * @throws {AppError} Lỗi nếu không có quyền, thiếu sản phẩm, sản phẩm lỗi, hoặc sai mã giảm giá.
   */
  async checkout(userId, data) {
    if (!userId) throw new AppError("Bạn cần đăng nhập để thanh toán", 400);
    if (!data?.items?.length) throw new AppError("Vui lòng chọn ít nhất một sản phẩm", 400);

    const order = await withTransaction(async (tx) => {
      const {
        items = [],
        payment_method = "bank_transfer",
        idempotency_key,
        billing_name,
        billing_phone,
        billing_email,
        voucher_code,
      } = data;
      const normalizedPayment = normalizePaymentMethod(payment_method);

      const existingOrderId = await findOrderByIdempotency(tx, userId, idempotency_key);
      if (existingOrderId) {
        return await OrderRepository.findById(existingOrderId);
      }

      if (billing_name || billing_phone) {
        const updateData = {};
        if (billing_name) updateData.full_name = billing_name;
        if (billing_phone) {
          const dupPhone = await tx.users.findFirst({
            where: { phone: billing_phone, id: { not: parseInt(userId) } }
          });
          if (dupPhone) throw new AppError("Số điện thoại thanh toán đã được dùng bởi tài khoản khác", 400);
          updateData.phone = billing_phone;
        }
        await tx.users.update({
          where: { id: parseInt(userId) },
          data: updateData
        });
      }
      if (billing_email) {
        const dup = await tx.users.findFirst({
          where: { email: billing_email, id: { not: parseInt(userId) } }
        });
        if (dup) throw new AppError("Email thanh toán đã được dùng bởi tài khoản khác", 400);
        await tx.users.update({
          where: { id: parseInt(userId) },
          data: { email: billing_email }
        });
      }

      const normalizedItems = items
        .map((item) => ({
          product_id: Number(item.product_id),
          quantity: Math.max(1, Number(item.quantity) || 1),
        }))
        .filter((item) => item.product_id);

      let totalAmount = 0;
      const orderItems = [];

      for (const item of normalizedItems) {
        const owned = await tx.owned_products.findFirst({
          where: { user_id: parseInt(userId), product_id: item.product_id, status: 'active' }
        });
        if (owned) throw new AppError(`Bạn đã sở hữu sản phẩm #${item.product_id}`, 400);

        const product = await tx.products.findFirst({
          where: { id: item.product_id, deleted_at: null },
          select: { id: true, name: true, price: true, cost_price: true, status: true }
        });

        if (!product) throw new AppError(`Sản phẩm #${item.product_id} không tồn tại`, 400);
        if (product.status && product.status !== "published") {
          throw new AppError(`Sản phẩm "${product.name}" chưa được phát hành`, 400);
        }

        const lineTotal = Number(product.price || 0) * item.quantity;
        totalAmount += lineTotal;
        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          price: Number(product.price || 0),
          cost_price: Number(product.cost_price || 0),
          total_price: lineTotal,
        });
      }

      let finalAmount = totalAmount;
      let discountAmount = 0;
      let usedVoucherCode = null;

      if (voucher_code) {
        const voucher = await tx.vouchers.findFirst({
          where: { code: voucher_code }
        });
        if (!voucher) {
            throw new AppError(`Mã giảm giá "${voucher_code}" không tồn tại.`, 400);
        }
        if (!voucher.is_active) {
            throw new AppError(`Mã giảm giá "${voucher_code}" đã bị khóa.`, 400);
        }
        if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
            throw new AppError(`Mã giảm giá "${voucher_code}" đã hết hạn.`, 400);
        }
        if (voucher.max_uses > 0 && voucher.used_count >= voucher.max_uses) {
            throw new AppError(`Mã giảm giá "${voucher_code}" đã hết lượt sử dụng.`, 400);
        }
        if (voucher.min_order_value && totalAmount < Number(voucher.min_order_value)) {
            throw new AppError(`Mã giảm giá "${voucher_code}" yêu cầu đơn hàng tối thiểu ${Number(voucher.min_order_value).toLocaleString('vi-VN')}đ.`, 400);
        }
        if (voucher.usage_per_user > 0) {
            const userUsedCount = await tx.orders.count({
                where: {
                    customer_id: parseInt(userId),
                    voucher_code: voucher_code,
                    status: { not: 'revoked' }
                }
            });
            if (userUsedCount >= voucher.usage_per_user) {
                throw new AppError(`Bạn đã hết lượt sử dụng mã giảm giá "${voucher_code}" này.`, 400);
            }
        }
        
        discountAmount = (totalAmount * Number(voucher.discount_percent)) / 100;
        if (voucher.max_discount_amount && discountAmount > Number(voucher.max_discount_amount)) {
            discountAmount = Number(voucher.max_discount_amount);
        }
        
        finalAmount = Math.max(0, totalAmount - discountAmount);
        usedVoucherCode = voucher_code;
      }

      let initialStatus = ORDER_STATUS.PENDING;
      if (finalAmount === 0) {
          initialStatus = ORDER_STATUS.PAID;
      }

      const orderDataToCreate = {
        customer_id: parseInt(userId),
        billing_name,
        billing_email,
        billing_phone,
        total_amount: totalAmount,
        discount: discountAmount,
        final_amount: finalAmount,
        payment_method: normalizedPayment,
        status: initialStatus,
        created_by: parseInt(userId),
        voucher_code: usedVoucherCode
      };

      const db = tx || prisma;
      const newOrder = await db.orders.create({
        data: orderDataToCreate
      });
      const orderId = newOrder.id;

      await OrderRepository.createOrderItems(tx, orderId, orderItems);

      await recordPayment(tx, {
        orderId,
        amount: finalAmount,
        paymentMethod: normalizedPayment,
        status: initialStatus === ORDER_STATUS.PAID ? "success" : "pending",
        transactionCode: idempotency_key ? `IDEM-${idempotency_key}` : (initialStatus === ORDER_STATUS.PAID ? `FREE-${orderId}` : `PENDING-${orderId}`),
      });

      if (initialStatus === ORDER_STATUS.PAID) {
          await grantOrderAccess(tx, userId, orderId);
          if (usedVoucherCode) {
              await db.vouchers.update({
                  where: { code: usedVoucherCode },
                  data: { used_count: { increment: 1 } }
              });
          }
      }

      try {
        const userRow = await tx.users.findFirst({
          where: { id: parseInt(userId) },
          select: { email: true, full_name: true, username: true }
        });
        if (userRow?.email) {
          if (initialStatus === ORDER_STATUS.PAID) {
              mailer.sendPaymentSuccessEmail(userRow.email, {
                  id: orderId,
                  customer_name: userRow.full_name || userRow.username,
                  items: orderItems.map(x => ({ name: x.product_name, quantity: x.quantity })),
              }).catch((e) => console.error("Payment email err:", e));
          } else {
              mailer.sendInvoiceEmail(userRow.email, {
                  id: orderId,
                  customer_name: userRow.full_name || userRow.username,
                  final_amount: finalAmount,
                  payment_method: normalizedPayment,
                  items: orderItems,
                }).catch((e) => console.error("Invoice email err:", e));
          }
        }
      } catch (e) {
        console.error("Lỗi gửi email hóa đơn:", e);
      }

      return {
        id: orderId,
        total_amount: totalAmount,
        final_amount: finalAmount,
        status: initialStatus,
        payment_method: normalizedPayment,
        items: orderItems,
        needs_payment_confirmation: initialStatus === ORDER_STATUS.PENDING,
      };
    });
    
    await NotificationService.notifyUser(userId, `Đơn hàng mới đã được ghi nhận. Mã đơn: #${order.id}`, `/src/pages/client/profile.html?tab=history&orderId=${order.id}`).catch(console.error);
    const productIds = order.items ? order.items.map(i => i.product_id) : [];
    await NotificationService.notifyAdminsAndProductOwners(`Có đơn hàng mới #${order.id}.`, `/src/pages/admin/orders/details.html?id=${order.id}`, productIds).catch(console.error);
    
    return order;
  },

  /**
   * Xác nhận thanh toán thành công cho một đơn hàng từ quản trị viên hoặc hệ thống.
   * Sẽ cấp quyền sử dụng sản phẩm và gửi thông báo, email tới khách hàng.
   * 
   * @param {number|string} orderId - ID của đơn hàng.
   * @param {Object} actor - Thông tin người thực hiện xác nhận.
   * @returns {Promise<Object>} Chi tiết đơn hàng sau khi xác nhận.
   * @throws {AppError} Lỗi nếu thiếu thông tin, không đủ quyền, hoặc đơn hàng ở trạng thái không cho phép.
   */
  async confirmPayment(orderId, actor) {
    if (!orderId) throw new AppError("Thiếu mã đơn hàng", 400);
    if (!actor?.id) throw new AppError("Bạn cần đăng nhập", 400);
    
    const order = await withTransaction(async (tx) => {
      const orderData = await tx.orders.findFirst({
        where: { id: parseInt(orderId) }
      });
      if (!orderData) throw new AppError("Không tìm thấy đơn hàng", 400);

      const role = String(actor.role_name || "").toLowerCase();
      if (role !== "admin" && role !== "sale" && actor.username !== "System Auto") {
        throw new AppError("Bạn không có quyền xác nhận thanh toán đơn này", 400);
      }

      const current = normalizeOrderStatus(orderData.status);
      if (current === ORDER_STATUS.PAID) {
        return await OrderRepository.findById(orderId);
      }
      if (current !== ORDER_STATUS.PENDING) {
        throw new AppError(`Đơn hàng đang ở trạng thái "${current}", không thể xác nhận thanh toán`, 400);
      }

      const nextStatus = await applyStatusSideEffects(tx, orderData, ORDER_STATUS.PAID, orderData.payment_method);
      await OrderRepository.updateOrderInfo(tx, orderId, { status: nextStatus });

      try {
        const userRow = await tx.users.findFirst({
          where: { id: parseInt(orderData.customer_id) },
          select: { email: true, full_name: true, username: true }
        });
        const finalItems = await tx.order_items.findMany({
          where: { order_id: parseInt(orderId) },
          select: { product_name: true, quantity: true }
        });
        if (userRow?.email) {
          mailer.sendPaymentSuccessEmail(userRow.email, {
              id: orderId,
              customer_name: userRow.full_name || userRow.username,
              items: finalItems.map(x => ({ name: x.product_name, quantity: x.quantity })),
            }).catch((e) => console.error("Email err:", e));
        }
      } catch (e) {
        console.error("Lỗi gửi email:", e);
      }

      return await OrderRepository.findById(orderId);
    });
    
    if (order && order.customer_id) {
      await NotificationService.notifyUser(order.customer_id, `Thanh toán thành công cho đơn hàng #${order.id}.`, `/src/pages/client/my-products.html?orderId=${order.id}`).catch(console.error);
    }
    const productIds = (order && order.items) ? order.items.map(i => i.product_id) : [];
    await NotificationService.notifyAdminsAndProductOwners(`Đơn hàng #${order.id} đã được khách hàng thanh toán thành công.`, `/src/pages/admin/orders/details.html?id=${order.id}`, productIds).catch(console.error);
    
    return order;
  },

  /**
   * Xử lý webhook thanh toán trả về từ SePay. Phân tích nội dung chuyển khoản để tự động duyệt đơn.
   * 
   * @param {Object} data - Dữ liệu webhook từ hệ thống SePay.
   * @returns {Promise<void>}
   * @throws {AppError} Lỗi nếu số tiền không đủ, sai cú pháp mã đơn hàng.
   */
  async processSepayWebhook(data) {
    const content = (data.transactionContent || "").toUpperCase();
    const amount = Number(data.transferAmount || 0);

    const match = content.match(/THANHTOANDH(\d+)/) || content.match(/ORD(\d+)/) || content.match(/DH(\d+)/);
    if (!match) {
      throw new AppError("Không tìm thấy mã đơn hàng trong nội dung chuyển khoản: " + content, 400);
    }
    
    const orderId = match[1];
    const bill = await OrderRepository.findById(orderId);
    if (!bill) throw new AppError(`Đơn hàng #${orderId} không tồn tại`, 400);
    
    if (normalizeOrderStatus(bill.status) === ORDER_STATUS.PAID) {
      const productIds = bill.items ? bill.items.map(i => i.product_id) : [];
      await NotificationService.notifyAdminsAndProductOwners(`Cảnh báo: Khách hàng vừa chuyển khoản ${amount.toLocaleString('vi-VN')}đ vào mã đơn hàng #${orderId} đã được thanh toán trước đó.`, `/src/pages/admin/orders/details.html?id=${orderId}`, productIds).catch(console.error);
      return;
    }
    
    if (amount < Number(bill.final_amount)) {
      throw new AppError(`Số tiền chuyển khoản (${amount}, 400) nhỏ hơn giá trị đơn hàng (${bill.final_amount})`);
    } else if (amount > Number(bill.final_amount)) {
      const productIds = bill.items ? bill.items.map(i => i.product_id) : [];
      await NotificationService.notifyAdminsAndProductOwners(`Cảnh báo: Đơn hàng #${orderId} thanh toán dư (Yêu cầu ${Number(bill.final_amount).toLocaleString('vi-VN')}đ, nhận được ${amount.toLocaleString('vi-VN')}đ).`, `/src/pages/admin/orders/details.html?id=${orderId}`, productIds).catch(console.error);
    }

    const systemActor = { id: -1, role_name: 'admin', username: 'System Auto' };
    await this.confirmPayment(orderId, systemActor);
  },

  /**
   * Lấy danh sách các sản phẩm mà người dùng đã mua và sở hữu.
   * 
   * @param {number|string} userId - ID của khách hàng.
   * @returns {Promise<Array<Object>>} Danh sách sản phẩm.
   */
  async getMyProducts(userId) {
    if (!userId) throw new AppError("Bạn cần đăng nhập để xem sản phẩm đã mua", 400);
    return await OrderRepository.findMyProducts(userId);
  },

  /**
   * Lấy danh sách các đơn hàng (lịch sử mua hàng) của một khách hàng cụ thể.
   * 
   * @param {number|string} userId - ID của khách hàng.
   * @returns {Promise<Array<Object>>} Danh sách đơn hàng.
   */
  async getMyOrders(userId) {
    if (!userId) throw new AppError("Bạn cần đăng nhập để xem lịch sử mua hàng", 400);
    return await OrderRepository.findMyOrders(userId);
  },

  /**
   * Thu hồi một đơn hàng đã được thanh toán. Thu hồi quyền sử dụng sản phẩm và gửi thông báo tới khách hàng.
   * 
   * @param {number|string} orderId - ID của đơn hàng.
   * @returns {Promise<boolean>} True nếu thực hiện thành công.
   * @throws {AppError} Lỗi nếu đơn hàng không tồn tại hoặc chưa thanh toán.
   */
  async revokeOrder(orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw new AppError("Đơn hàng không tồn tại", 400);
    if (String(order.status).trim().toLowerCase() !== 'paid') {
      throw new AppError("Chỉ có thể thu hồi đơn hàng đã thanh toán. Trạng thái hiện tại: " + order.status, 400);
    }
    
    await withTransaction(async (tx) => {
        await applyStatusSideEffects(tx, order, ORDER_STATUS.REVOKED, order.payment_method);
        await OrderRepository.updateOrderInfo(tx, orderId, { status: ORDER_STATUS.REVOKED });
    });
    
    await NotificationService.notifyUser(order.customer_id, `Quyền truy cập từ đơn hàng #${orderId} của bạn đã bị thu hồi.`, `/src/pages/client/profile.html?tab=history&orderId=${orderId}`).catch(console.error);
    return true;
  },

  /**
   * Gửi lại email xác nhận đơn hàng thành công cho khách hàng.
   * 
   * @param {number|string} orderId - ID của đơn hàng cần gửi lại mail.
   * @returns {Promise<boolean>} True nếu gửi mail thành công.
   * @throws {AppError} Lỗi nếu không tìm thấy đơn hàng, đơn hàng chưa thanh toán, hoặc không có email nhận.
   */
  async resendEmail(orderId) {
    const bill = await OrderRepository.findById(orderId);
    if (!bill) throw new AppError("Không tìm thấy hóa đơn", 400);
    
    if (normalizeOrderStatus(bill.status) !== ORDER_STATUS.PAID) {
      throw new AppError("Chỉ có thể gửi email xác nhận cho đơn hàng đã thanh toán (paid, 400)");
    }

    const user = await prisma.users.findFirst({
      where: { id: parseInt(bill.customer_id) },
      select: { email: true, full_name: true, username: true }
    });
    if (!user || !user.email) throw new AppError("Tài khoản khách hàng không có email để nhận", 400);

    try {
      await mailer.sendPaymentSuccessEmail(user.email, {
        id: bill.id,
        customer_name: bill.billing_name || user.full_name || user.username || "Quý khách",
        items: bill.items
      });
      return true;
    } catch (e) {
      console.error("Lỗi khi gửi lại email:", e);
      throw new AppError("Không thể gửi email lúc này. " + e.message, 400);
    }
  }
};

module.exports = OrderService;
