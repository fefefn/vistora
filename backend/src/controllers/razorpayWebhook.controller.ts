import crypto from "crypto";
import type { Request, Response } from "express";
import RefundRequest from "../models/RefundRequest";
import Order from "../models/Order";
import { env } from "../config/env";

const verifyWebhookSignature = (
  rawBody: Buffer,
  signature: string,
): boolean => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
};

interface RazorpayWebhookRefundEntity {
  id?: string;
  payment_id?: string;
  amount?: number;
  status?: "pending" | "processed" | "failed";
}

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    refund?: {
      entity?: RazorpayWebhookRefundEntity;
    };
  };
}

export const razorpayWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const signature = req.header("X-Razorpay-Signature");

    if (!signature) {
      res.status(400).json({
        success: false,
        message: "Missing Razorpay webhook signature",
      });
      return;
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      res.status(400).json({
        success: false,
        message: "Invalid Razorpay webhook signature",
      });
      return;
    }

    let payload: RazorpayWebhookPayload;

    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      res.status(400).json({
        success: false,
        message: "Invalid webhook JSON payload",
      });
      return;
    }

    const event = payload.event;
    const refund = payload.payload?.refund?.entity;

    console.log(
      `Razorpay webhook received: ${event ?? "unknown event"}`,
    );

    // We currently care about refund lifecycle events.
    if (
      event !== "refund.created" &&
      event !== "refund.processed" &&
      event !== "refund.failed"
    ) {
      res.status(200).json({
        success: true,
        message: "Webhook received",
      });
      return;
    }

    if (!refund?.id) {
      res.status(400).json({
        success: false,
        message: "Refund ID missing from webhook payload",
      });
      return;
    }

    const refundRequest = await RefundRequest.findOne({
      razorpayRefundId: refund.id,
    });

    if (!refundRequest) {
      console.warn(
        `No Vistora refund request found for Razorpay refund ${refund.id}`,
      );

      // Return 200 so Razorpay does not keep retrying a webhook
      // that does not belong to a Vistora refund request.
      res.status(200).json({
        success: true,
        message: "Refund not found in Vistora",
      });
      return;
    }

    if (event === "refund.created") {
      refundRequest.razorpayRefundStatus = "pending";
      await refundRequest.save();

      res.status(200).json({
        success: true,
        message: "Refund created event processed",
      });
      return;
    }

    if (event === "refund.failed") {
      refundRequest.razorpayRefundStatus = "failed";

      // Keep the Vistora request in processing so an admin can
      // investigate/retry it without falsely marking it completed.
      if (refundRequest.status === "completed") {
        console.warn(
          `Refund ${refund.id} reported failed after Vistora marked it completed`,
        );
      } else {
        refundRequest.status = "processing";
      }

      await refundRequest.save();

      res.status(200).json({
        success: true,
        message: "Refund failed event processed",
      });
      return;
    }

    // refund.processed
    refundRequest.razorpayRefundStatus = "processed";
    refundRequest.status = "completed";
    refundRequest.processedAt =
      refundRequest.processedAt ?? new Date();

    await refundRequest.save();

    const order = await Order.findById(refundRequest.order);

    if (order) {
      order.paymentStatus = "refunded";
      order.orderStatus = "refunded";
      await order.save();
    }

    console.log(
      `Refund ${refund.id} processed successfully for Vistora refund ${refundRequest._id}`,
    );

    res.status(200).json({
      success: true,
      message: "Refund processed event handled",
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
