import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async (
  input: RegisterInput
): Promise<IUser> => {
  const { name, email, password } = input;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("User with this email already exists") as Error & {
      statusCode?: number;
    };
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  return user;
};

export interface LoginInput {
  email: string;
  password: string;
}

export const loginUser = async (
  input: LoginInput
): Promise<IUser> => {
  const { email, password } = input;

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password") as Error & {
      statusCode?: number;
    };
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account has been deactivated") as Error & {
      statusCode?: number;
    };
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password") as Error & {
      statusCode?: number;
    };
    error.statusCode = 401;
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  return user;
};
