import type { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";

/** GET /api/health — confirms the API process is up and responding. */
export const healthCheck = asyncHandler(
  async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Vistora API is running",
    });
  },
);

/**
 * GET /api/health/ready — confirms the API and MongoDB are ready.
 */
export const readinessCheck = asyncHandler(
  async (_req: Request, res: Response) => {
    const databaseReady = mongoose.connection.readyState === 1;

    if (!databaseReady) {
      res.status(503).json({
        success: false,
        message: "Vistora API is not ready",
        checks: {
          database: "unavailable",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vistora API is ready",
      checks: {
        database: "connected",
      },
    });
  },
);
