import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentHistory,
} from "../controllers/payment.controller";
import { protect } from "../middleware/auth";
import { paymentRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Create Razorpay order
router.post(
  "/razorpay/order",
  protect,
  paymentRateLimiter,
  createRazorpayOrder,
);

// Verify Razorpay payment and create Vistora order
router.post(
  "/razorpay/verify",
  protect,
  paymentRateLimiter,
  verifyRazorpayPayment,
);

// Customer payment history
router.get(
  "/history",
  protect,
  getPaymentHistory,
);

export default router;
