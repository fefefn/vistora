import { Router } from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getCart);

router.post("/items", protect, addToCart);

router.patch("/items/:productId", protect, updateCartItem);

router.delete("/items/:productId", protect, removeFromCart);

router.delete("/", protect, clearCart);

export default router;