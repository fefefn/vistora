import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  role: "customer" | "admin";
}

const isValidPayload = (
  payload: jwt.JwtPayload,
): payload is jwt.JwtPayload & JwtPayload => {
  return (
    typeof payload.userId === "string" &&
    payload.userId.length > 0 &&
    (payload.role === "customer" || payload.role === "admin")
  );
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  });

  if (typeof decoded === "string" || !isValidPayload(decoded)) {
    throw new Error("Invalid token payload");
  }

  return {
    userId: decoded.userId,
    role: decoded.role,
  };
};
