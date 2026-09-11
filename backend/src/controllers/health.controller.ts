import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'

/** GET /api/health — confirms the API is up and responding. */
export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'NexCart API is running',
  })
})
