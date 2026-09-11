import type { NextFunction, Request, Response } from 'express'

/** Standard response shape returned by every NexCart endpoint. */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

/** Signature of an async Express route handler (used by asyncHandler). */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>
