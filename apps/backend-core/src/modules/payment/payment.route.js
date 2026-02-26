const express = require("express");
const router = express.Router();
const PaymentController = require("./payment.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.post("/vnpay/create", protect, PaymentController.createPaymentUrl);
router.get("/vnpay/ipn", PaymentController.vnpayIpn);

router.post("/stripe/create-checkout-session", protect, PaymentController.createStripeSession);

// Webhook requires raw body parsing, but app.js applies express.json() globally.
// To fix this, we'll parse raw body specific to this route by overriding or reading req.body if it's converted.
// Since express.json() might have parsed it, `stripe.service` needs the raw string, or we map it properly in a middleware.
// For now, we will add the route. You may need a custom middleware in app.js or here to handle express.raw()
router.post("/stripe/webhook", express.raw({ type: 'application/json' }), PaymentController.stripeWebhook);

module.exports = router;
