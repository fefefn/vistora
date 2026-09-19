import mongoose from "mongoose";
import { env } from "./env";

/**
 * Connects to MongoDB via Mongoose.
 *
 * Returns true when the database connection succeeds.
 * In development, a missing/unreachable database is logged and returns false
 * so the API can still be started for early development.
 *
 * In production, the caller should stop application startup when this returns
 * false.
 */
export const connectDB = async (): Promise<boolean> => {
  if (!env.MONGODB_URI) {
    console.warn(
      "⚠️ MONGODB_URI not set — database connection unavailable.",
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      (error as Error).message,
    );
    return false;
  }
};
