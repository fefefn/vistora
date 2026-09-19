import { Router } from "express";
import { razorpayWebhook } from "../controllers/razorpayWebhook.controller";

const router = Router();

router.post("/", razorpayWebhook);

export default router;
