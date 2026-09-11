import type { NextFunction, Request, Response } from 'express'

/**
 * Central error handler. Express recognises it as error middleware because it
 * has four parameters. Keeps error responses in one consistent JSON shape.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('💥 Error:', err.message)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
}
