import type { NextFunction, Request, Response } from 'express'
import type { AsyncRequestHandler } from '../types'

/**
 * Wraps an async controller so rejected promises are passed to Express's
 * error middleware instead of crashing the process. Saves try/catch everywhere.
 */
export const asyncHandler =
  (fn: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
