import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { generateToken } from "../utils/jwt";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
    return;
  }

  const user = await registerUser({
    name,
    email,
    password,
  });

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
    return;
  }

  const user = await loginUser({
    email,
    password,
  });

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
};

export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as Request & {
    user?: {
      userId: string;
      role: "customer" | "admin";
    };
  };

  res.status(200).json({
    success: true,
    data: {
      userId: authReq.user?.userId,
      role: authReq.user?.role,
    },
  });
};
