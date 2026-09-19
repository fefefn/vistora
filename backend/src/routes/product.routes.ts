import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { protect } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";

const router = Router();

// --------------------------------------------------
// Admin routes
// MUST be before /:slug
// --------------------------------------------------

router.get(
  "/admin/all",
  protect,
  requireAdmin,
  getAllProductsAdmin,
);

router.patch(
  "/:id",
  protect,
  requireAdmin,
  updateProduct,
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteProduct,
);

// --------------------------------------------------
// Public routes
// --------------------------------------------------

router.get("/", getProducts);

router.get("/:slug", getProductBySlug);

// Create product - Admin only
router.post(
  "/",
  protect,
  requireAdmin,
  createProduct,
);

export default router;