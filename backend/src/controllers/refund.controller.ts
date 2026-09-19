import { Response } from "express";
import { randomUUID } from "crypto";
import { Types } from "mongoose";
import RefundRequest from "../models/RefundRequest";
import Order from "../models/Order";
import { AuthenticatedRequest } from "../middleware/auth";
import { env } from "../config/env";

const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.userId || "";
};

// ============================================================
// RAZORPAY REFUND HELPER
// ============================================================

interface RazorpayRefundResponse {
  id?: string;
  entity?: string;
  amount?: number;
  currency?: string;
  payment_id?: string;
  notes?: Record<string, unknown>;
  receipt?: string;
  acquirer_data?: Record<string, unknown>;
  created_at?: number;
  batch_id?: string | null;
  status?: "pending" | "processed" | "failed";
  speed_requested?: string;
  speed_processed?: string;
}

export const createRazorpayRefund = async (
  paymentId: string,
  amountInPaise: number,
  idempotencyKey: string,
): Promise<RazorpayRefundResponse> => {
  const auth = Buffer.from(
    `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "X-Refund-Idempotency": idempotencyKey,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        speed: "normal",
      }),
    },
  );

  const responseText = await response.text();

  let data: RazorpayRefundResponse & {
    error?: {
      code?: string;
      description?: string;
      field?: string;
      source?: string;
      step?: string;
      reason?: string;
    };
  };

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Razorpay returned an invalid response. HTTP ${response.status}`,
    );
  }

  if (!response.ok) {
    const razorpayMessage =
      data.error?.description ||
      data.error?.reason ||
      "Razorpay refund request failed";

    throw new Error(
      `Razorpay refund failed (${response.status}): ${razorpayMessage}`,
    );
  }

  return data;
};


// ============================================================
// CUSTOMER
// ============================================================

// POST /api/refunds
// Customer requests a refund for an eligible delivered paid order.
export const createRefundRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const orderId = String(req.body.orderId || "");
    const reason = String(req.body.reason || "").trim();

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: "Valid order ID is required",
      });
      return;
    }

    if (!reason) {
      res.status(400).json({
        success: false,
        message: "Refund reason is required",
      });
      return;
    }

    if (reason.length > 500) {
      res.status(400).json({
        success: false,
        message: "Refund reason must be 500 characters or less",
      });
      return;
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (order.orderStatus !== "delivered") {
      res.status(400).json({
        success: false,
        message: "Refund can only be requested for delivered orders",
      });
      return;
    }

    if (order.paymentStatus !== "paid") {
      res.status(400).json({
        success: false,
        message: "Only paid orders are eligible for a refund",
      });
      return;
    }

    if (
      order.paymentMethod === "razorpay" &&
      !order.razorpayPaymentId
    ) {
      res.status(400).json({
        success: false,
        message: "Razorpay payment ID is missing for this order",
      });
      return;
    }

    const existingRefund = await RefundRequest.findOne({
      order: order._id,
      user: userId,
      status: {
        $in: [
          "requested",
          "approved",
          "processing",
          "completed",
        ],
      },
    });

    if (existingRefund) {
      res.status(409).json({
        success: false,
        message: "A refund request already exists for this order",
        data: existingRefund,
      });
      return;
    }

    const refundRequest = await RefundRequest.create({
      user: new Types.ObjectId(userId),
      order: order._id,
      amount: order.total,
      reason,
      status: "requested",
    });

    const populatedRefund = await refundRequest.populate([
      {
        path: "order",
        select:
          "orderNumber total paymentMethod paymentStatus orderStatus createdAt",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Refund request submitted successfully",
      data: populatedRefund,
    });
  } catch (error) {
    console.error("Create refund request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create refund request",
    });
  }
};


// GET /api/refunds
// Customer gets only their own refund requests.
export const getRefundRequests = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const refunds = await RefundRequest.find({
      user: userId,
    })
      .populate(
        "order",
        "orderNumber total paymentMethod paymentStatus orderStatus createdAt",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: refunds,
    });
  } catch (error) {
    console.error("Get refund requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get refund requests",
    });
  }
};


// GET /api/refunds/:id
// Customer gets one of their own refund requests.
export const getRefundRequestById = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const refundId = String(req.params.id);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!Types.ObjectId.isValid(refundId)) {
      res.status(400).json({
        success: false,
        message: "Invalid refund request ID",
      });
      return;
    }

    const refundRequest = await RefundRequest.findOne({
      _id: refundId,
      user: userId,
    }).populate(
      "order",
      "orderNumber total paymentMethod paymentStatus orderStatus createdAt",
    );

    if (!refundRequest) {
      res.status(404).json({
        success: false,
        message: "Refund request not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: refundRequest,
    });
  } catch (error) {
    console.error("Get refund request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get refund request",
    });
  }
};


// ============================================================
// ADMIN
// ============================================================

// GET /api/refunds/admin/all
// Admin gets all refund requests.
export const getAllRefundRequestsAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const refunds = await RefundRequest.find()
      .populate("user", "name email")
      .populate(
        "order",
        "orderNumber total paymentMethod paymentStatus orderStatus createdAt razorpayPaymentId",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: refunds,
    });
  } catch (error) {
    console.error("Get all refund requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get refund requests",
    });
  }
};


// PATCH /api/refunds/admin/:id/status
// Admin updates refund request status.
export const updateRefundStatusAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const refundId = String(req.params.id);
    const { status, adminNote } = req.body;

    if (!Types.ObjectId.isValid(refundId)) {
      res.status(400).json({
        success: false,
        message: "Invalid refund request ID",
      });
      return;
    }

    const allowedStatuses = [
      "requested",
      "approved",
      "rejected",
      "processing",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid refund status",
      });
      return;
    }

    if (
      adminNote !== undefined &&
      (typeof adminNote !== "string" || adminNote.trim().length > 500)
    ) {
      res.status(400).json({
        success: false,
        message: "Admin note must be 500 characters or less",
      });
      return;
    }

    const refundRequest = await RefundRequest.findById(refundId);

    if (!refundRequest) {
      res.status(404).json({
        success: false,
        message: "Refund request not found",
      });
      return;
    }

    // Do not allow changes after completion or rejection.
    if (
      refundRequest.status === "completed" ||
      refundRequest.status === "rejected"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Completed or rejected refund requests cannot be changed",
      });
      return;
    }

    // --------------------------------------------------------
    // NORMAL STATUS CHANGES
    // --------------------------------------------------------

    if (status !== "completed") {
      refundRequest.status = status;

      if (adminNote !== undefined) {
        refundRequest.adminNote = adminNote.trim() || undefined;
      }

      await refundRequest.save();

      const populatedRefund = await refundRequest.populate([
        {
          path: "user",
          select: "name email",
        },
        {
          path: "order",
          select:
            "orderNumber total paymentMethod paymentStatus orderStatus createdAt razorpayPaymentId",
        },
      ]);

      res.status(200).json({
        success: true,
        message: "Refund status updated successfully",
        data: populatedRefund,
      });

      return;
    }


    // --------------------------------------------------------
    // ACTUAL RAZORPAY REFUND
    // --------------------------------------------------------

    const order = await Order.findById(refundRequest.order);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Associated order not found",
      });
      return;
    }

    if (order.paymentMethod !== "razorpay") {
      res.status(400).json({
        success: false,
        message:
          "Automatic Razorpay refund is only available for Razorpay payments",
      });
      return;
    }

    if (order.paymentStatus !== "paid") {
      res.status(400).json({
        success: false,
        message:
          "Order payment must be in paid status before processing a refund",
      });
      return;
    }

    if (!order.razorpayPaymentId) {
      res.status(400).json({
        success: false,
        message: "Razorpay payment ID is missing for this order",
      });
      return;
    }

    if (refundRequest.status !== "processing") {
      res.status(400).json({
        success: false,
        message:
          "Refund must be in processing status before completing it",
      });
      return;
    }

    if (refundRequest.razorpayRefundId) {
      res.status(409).json({
        success: false,
        message:
          "A Razorpay refund has already been created for this request",
        data: refundRequest,
      });
      return;
    }


    // Amount stored by Vistora is INR.
    // Razorpay expects the smallest currency unit: paise.
    const amountInPaise = Math.round(refundRequest.amount * 100);

    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid refund amount",
      });
      return;
    }


    // Create the idempotency key once and persist it BEFORE calling
    // Razorpay. If the network fails after Razorpay receives the request,
    // a retry will reuse the same key instead of creating another refund.
    if (!refundRequest.refundIdempotencyKey) {
      refundRequest.refundIdempotencyKey =
        `vistora-refund-${randomUUID()}`;

      await refundRequest.save();
    }

    const idempotencyKey = refundRequest.refundIdempotencyKey;

    console.log(
      `Creating Razorpay refund for order ${order.orderNumber}`,
    );

    let razorpayRefund: RazorpayRefundResponse;

    try {
      razorpayRefund = await createRazorpayRefund(
        order.razorpayPaymentId,
        amountInPaise,
        idempotencyKey,
      );
    } catch (error) {
      console.error("Razorpay refund API error:", error);

      refundRequest.razorpayRefundStatus = "failed";

      if (adminNote !== undefined) {
        refundRequest.adminNote = adminNote.trim() || undefined;
      }

      await refundRequest.save();

      res.status(502).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Razorpay refund request failed",
        data: refundRequest,
      });

      return;
    }


    // Save Razorpay's refund ID and status.
    if (razorpayRefund.id) {
      refundRequest.razorpayRefundId = razorpayRefund.id;
    }

    const razorpayStatus = razorpayRefund.status;

    if (
      razorpayStatus !== "pending" &&
      razorpayStatus !== "processed" &&
      razorpayStatus !== "failed"
    ) {
      res.status(502).json({
        success: false,
        message:
          "Razorpay returned an unexpected refund status",
        data: razorpayRefund,
      });

      return;
    }

    refundRequest.razorpayRefundStatus = razorpayStatus;

    if (adminNote !== undefined) {
      refundRequest.adminNote = adminNote.trim() || undefined;
    }


    // --------------------------------------------------------
    // PROCESSED = ACTUAL REFUND COMPLETED
    // --------------------------------------------------------

    if (razorpayStatus === "processed") {
      refundRequest.status = "completed";
      refundRequest.processedAt = new Date();

      await refundRequest.save();

      await Order.findByIdAndUpdate(
        refundRequest.order,
        {
          $set: {
            orderStatus: "refunded",
            paymentStatus: "refunded",
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      const populatedRefund = await refundRequest.populate([
        {
          path: "user",
          select: "name email",
        },
        {
          path: "order",
          select:
            "orderNumber total paymentMethod paymentStatus orderStatus createdAt razorpayPaymentId",
        },
      ]);

      res.status(200).json({
        success: true,
        message:
          "Refund processed successfully through Razorpay",
        data: populatedRefund,
      });

      return;
    }


    // --------------------------------------------------------
    // PENDING = RAZORPAY ACCEPTED THE REFUND BUT PROCESSING
    // --------------------------------------------------------

    if (razorpayStatus === "pending") {
      refundRequest.status = "processing";

      await refundRequest.save();

      const populatedRefund = await refundRequest.populate([
        {
          path: "user",
          select: "name email",
        },
        {
          path: "order",
          select:
            "orderNumber total paymentMethod paymentStatus orderStatus createdAt razorpayPaymentId",
        },
      ]);

      res.status(200).json({
        success: true,
        message:
          "Refund initiated through Razorpay and is currently pending",
        data: populatedRefund,
      });

      return;
    }


    // --------------------------------------------------------
    // FAILED = DO NOT MARK ORDER AS REFUNDED
    // --------------------------------------------------------

    refundRequest.status = "processing";

    await refundRequest.save();

    const populatedRefund = await refundRequest.populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "order",
        select:
          "orderNumber total paymentMethod paymentStatus orderStatus createdAt razorpayPaymentId",
      },
    ]);

    res.status(502).json({
      success: false,
      message:
        "Razorpay rejected the refund request. The refund remains in processing status and can be investigated/retried.",
      data: populatedRefund,
    });
  } catch (error) {
    console.error("Update refund status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update refund status",
    });
  }
};

