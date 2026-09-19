import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "customer" | "admin";
  };
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select("_id role isActive");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
      return;
    }

    // Use the current role from the database instead of trusting
    // the role stored in the JWT.
    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
