import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import refundRoutes from "./refund.routes";
import webhookRoutes from "./webhook.routes";
import wishlistRoutes from "./wishlist.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/refunds", refundRoutes);
router.use("/webhooks/razorpay", webhookRoutes);
router.use("/wishlist", wishlistRoutes);

export default router;

