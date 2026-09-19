import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getWishlist);

router.post("/items", protect, addToWishlist);

router.delete("/items/:productId", protect, removeFromWishlist);

export default router;
