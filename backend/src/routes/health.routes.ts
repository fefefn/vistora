import { Router } from "express";
import {
  healthCheck,
  readinessCheck,
} from "../controllers/health.controller";

const router = Router();

// GET /api/health
router.get("/", healthCheck);

// GET /api/health/ready
router.get("/ready", readinessCheck);

export default router;
