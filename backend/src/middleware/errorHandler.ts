import type { NextFunction, Request, Response } from "express";

type AppError = Error & {
  statusCode?: number;
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("💥 Error:", err.message);

  const statusCode =
    err.statusCode ??
    (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
