import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", authRateLimiter, asyncHandler(register));
router.post("/login", authRateLimiter, asyncHandler(login));
router.get("/me", protect, asyncHandler(getMe));

export default router;
