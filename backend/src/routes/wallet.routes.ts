import { Router } from "express";
import {
  getWallet,
  getWalletTransactions,
} from "../controllers/wallet.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getWallet);
router.get("/transactions", protect, getWalletTransactions);

export default router;
