const Stripe = require('stripe');

class StripeService {
  constructor() {
    // Khởi tạo Stripe với Secret Key từ môi trường
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2023-10-16', // Hoặc version mới nhất
    });
  }

  /**
   * Tạo session thanh toán Stripe Checkout
   * @param {Object} order - Thông tin đơn hàng
   * @param {Array} items - Danh sách sản phẩm [{ name, price, quantity }]
   * @param {String} successUrl - URL redirect khi thành công
   * @param {String} cancelUrl - URL redirect khi huỷ
   * @returns {Object} session
   */
  async createCheckoutSession(order, items, successUrl, cancelUrl) {
    const line_items = items.map(item => ({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price), // Stripe yêu cầu số nguyên (VND không có thập phân, nhưng cần cẩn thận nếu dùng USD thì x100)
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      client_reference_id: order.id.toString(),
      metadata: {
        orderId: order.id.toString(),
      }
    });

    return session;
  }

  /**
   * Verify Webhook Signature
   * @param {String} rawBody - raw request body
   * @param {String} signature - stripe-signature header
   */
  constructEvent(rawBody, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }
}

module.exports = new StripeService();
