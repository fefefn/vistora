import { Router } from "express";
import {
  createRefundRequest,
  getRefundRequests,
  getRefundRequestById,
  getAllRefundRequestsAdmin,
  updateRefundStatusAdmin,
} from "../controllers/refund.controller";
import { protect } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";

const router = Router();

// ============================================================
// Admin routes MUST come before /:id
// ============================================================

router.get(
  "/admin/all",
  protect,
  requireAdmin,
  getAllRefundRequestsAdmin,
);

router.patch(
  "/admin/:id/status",
  protect,
  requireAdmin,
  updateRefundStatusAdmin,
);

// ============================================================
// Customer routes
// ============================================================

router.post("/", protect, createRefundRequest);
router.get("/", protect, getRefundRequests);
router.get("/:id", protect, getRefundRequestById);

export default router;
