import { Router } from "express";
import {
  createOrder,
  getAllOrdersAdmin,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { protect } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";

const router = Router();

// Admin routes MUST come before /:id
router.get(
  "/admin/all",
  protect,
  requireAdmin,
  getAllOrdersAdmin,
);

router.patch(
  "/admin/:id/status",
  protect,
  requireAdmin,
  updateOrderStatus,
);

// Customer routes
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);

export default router;