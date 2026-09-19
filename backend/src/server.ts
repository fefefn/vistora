import express from "express";
import type { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import routes from "./routes";
import { razorpayWebhook } from "./controllers/razorpayWebhook.controller";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

/* ----------------------------- Core middleware ---------------------------- */
app.use(helmet()); // secure HTTP headers
app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
); // allow only the configured frontend

/*
 * Razorpay webhook MUST receive the raw request body.
 * Signature verification is performed against the exact raw payload.
 *
 * This route is intentionally registered BEFORE express.json().
 */
app.post(
  "/api/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook,
);

// Normal API requests can use parsed JSON after the webhook route.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev")); // concise request logging
}

/* --------------------------------- Routes --------------------------------- */
app.use("/api", routes);

/* ------------------------------- Fallbacks -------------------------------- */
app.use(notFound); // unknown route -> 404
app.use(errorHandler); // any thrown error -> 500 JSON

/* ------------------------------ Start server ------------------------------ */
const startServer = (): void => {
  app.listen(env.PORT, () => {
    console.log(`?? Vistora API running on http://localhost:${env.PORT}`);
    console.log(
      `   Health check:   http://localhost:${env.PORT}/api/health`,
    );
    console.log(`   Environment:    ${env.NODE_ENV}`);
  });

  // Connect to the database in the background so the API is available immediately.
  void connectDB();
};

startServer();

export default app;


