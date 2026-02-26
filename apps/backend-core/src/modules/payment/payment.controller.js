const VNPayService = require("../../shared/vnpay.service");
const StripeService = require("../../shared/stripe.service");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ResponseHelper = require("../../utils/response.helper");
const { sendInvoiceEmail } = require("../../utils/mailer");

const PaymentController = {
  async createPaymentUrl(req, res, next) {
    try {
      const { orderId, amount, orderInfo } = req.body;
      
      if (!orderId || !amount) {
        return res.status(400).json({ success: false, message: "Missing orderId or amount" });
      }

      const url = VNPayService.createPaymentUrl(req, orderId, amount, orderInfo || `Thanh toan don hang ${orderId}`);
      return ResponseHelper.success(res, { paymentUrl: url });
    } catch (error) {
      next(error);
    }
  },

  async vnpayIpn(req, res, next) {
    try {
      const vnpayResult = VNPayService.verifyIpn(req.query);
      
      if (vnpayResult.isValid) {
        if (vnpayResult.responseCode === "00") {
          // Success payment
          const orderId = parseInt(vnpayResult.orderId, 10);
          if (!isNaN(orderId)) {
            await prisma.$transaction(async (tx) => {
              const order = await tx.orders.update({
                where: { id: orderId },
                data: {
                  status: 'paid',
                  payment_status: 'success'
                },
                include: { 
                  order_items: true,
                  users_orders_customer_idTousers: true
                }
              });

              await tx.payments.create({
                data: {
                  order_id: orderId,
                  amount: vnpayResult.amount,
                  status: 'success',
                  payment_method: 'vnpay',
                  transaction_code: req.query["vnp_TransactionNo"]
                }
              });

              if (order.customer_id) {
                for (const item of order.order_items) {
                  await tx.owned_products.upsert({
                    where: {
                      user_id_product_id: { user_id: order.customer_id, product_id: item.product_id }
                    },
                    update: { status: 'active' },
                    create: {
                      user_id: order.customer_id,
                      product_id: item.product_id,
                      order_id: orderId,
                      status: 'active'
                    }
                  });
                }

                // Gửi email hóa đơn & xác nhận
                if (order.users_orders_customer_idTousers && order.users_orders_customer_idTousers.email) {
                  const orderDetails = {
                    id: order.id,
                    customer_name: order.billing_name || order.users_orders_customer_idTousers.full_name || 'Khách hàng',
                    final_amount: order.final_amount,
                    payment_method: 'vnpay',
                    items: order.order_items.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.price }))
                  };
                  // Không dùng await để tránh block webhook
                  sendInvoiceEmail(order.users_orders_customer_idTousers.email, orderDetails).catch(err => console.error("Email send failed:", err));
                }
              }
            });
          }
          return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
          return res.status(200).json({ RspCode: '00', Message: 'Payment failed' });
        }
      } else {
        return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
      }
    } catch (error) {
      console.error("IPN Error:", error);
      return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
  },

  async createStripeSession(req, res, next) {
    try {
      const { orderId, successUrl, cancelUrl } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ success: false, message: "Missing orderId" });
      }

      // Lấy thông tin order và items
      const order = await prisma.orders.findUnique({
        where: { id: parseInt(orderId) },
        include: { order_items: true }
      });

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      const items = order.order_items.map(item => ({
        name: item.product_name,
        price: item.price,
        quantity: item.quantity
      }));

      const session = await StripeService.createCheckoutSession(order, items, successUrl, cancelUrl);
      
      return ResponseHelper.success(res, { sessionId: session.id, url: session.url });
    } catch (error) {
      next(error);
    }
  },

  async stripeWebhook(req, res, next) {
    const signature = req.headers['stripe-signature'];
    
    let event;
    try {
      // Note: express.raw({type: 'application/json'}) is required for the webhook route
      event = StripeService.constructEvent(req.body, signature);
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = parseInt(session.client_reference_id || session.metadata.orderId, 10);
        
        if (!isNaN(orderId)) {
          await prisma.$transaction(async (tx) => {
            const order = await tx.orders.update({
              where: { id: orderId },
              data: {
                status: 'paid',
                payment_status: 'success'
              },
              include: { 
                order_items: true,
                users_orders_customer_idTousers: true
              }
            });

            await tx.payments.create({
              data: {
                order_id: orderId,
                amount: session.amount_total,
                status: 'success',
                payment_method: 'stripe',
                transaction_code: session.payment_intent
              }
            });
            
            if (order.customer_id) {
              for (const item of order.order_items) {
                await tx.owned_products.upsert({
                  where: {
                    user_id_product_id: { user_id: order.customer_id, product_id: item.product_id }
                  },
                  update: { status: 'active' },
                  create: {
                    user_id: order.customer_id,
                    product_id: item.product_id,
                    order_id: orderId,
                    status: 'active'
                  }
                });
              }

              // Gửi email hóa đơn & xác nhận
              if (order.users_orders_customer_idTousers && order.users_orders_customer_idTousers.email) {
                const orderDetails = {
                  id: order.id,
                  customer_name: order.billing_name || order.users_orders_customer_idTousers.full_name || 'Khách hàng',
                  final_amount: order.final_amount,
                  payment_method: 'stripe',
                  items: order.order_items.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.price }))
                };
                sendInvoiceEmail(order.users_orders_customer_idTousers.email, orderDetails).catch(err => console.error("Email send failed:", err));
              }
            }
          });
        }
      }
      res.status(200).send('Event received');
    } catch (error) {
      console.error("Stripe Webhook Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
};

module.exports = PaymentController;
