import type { Request, Response } from 'express'

/** Catch-all for routes that don't exist → 404 JSON response. */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}
