import dotenv from "dotenv";

// Load variables from .env into process.env
dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";

/** Single, typed source of truth for environment configuration. */
export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  NODE_ENV: nodeEnv,
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? "",
  RAZORPAY_WEBHOOK_SECRET:
    process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
};

const requiredProductionEnv = [
  ["MONGODB_URI", env.MONGODB_URI],
  ["JWT_SECRET", env.JWT_SECRET],
  ["FRONTEND_URL", env.FRONTEND_URL],
  ["RAZORPAY_KEY_ID", env.RAZORPAY_KEY_ID],
  ["RAZORPAY_KEY_SECRET", env.RAZORPAY_KEY_SECRET],
  ["RAZORPAY_WEBHOOK_SECRET", env.RAZORPAY_WEBHOOK_SECRET],
] as const;

if (env.NODE_ENV === "production") {
  const missing = requiredProductionEnv
    .filter(([, value]) => !value.trim())
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }
}
