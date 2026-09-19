import { Document, Model, Schema, model, Types } from "mongoose";

export type RefundRequestStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "processing"
  | "completed";

export type RazorpayRefundStatus =
  | "pending"
  | "processed"
  | "failed";

export interface IRefundRequest extends Document {
  user: Types.ObjectId;
  order: Types.ObjectId;
  amount: number;
  reason: string;
  status: RefundRequestStatus;
  adminNote?: string;

  // Razorpay refund details
  razorpayRefundId?: string;
  razorpayRefundStatus?: RazorpayRefundStatus;

  // Used to safely retry the same Razorpay refund request
  refundIdempotencyKey?: string;

  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refundRequestSchema = new Schema<IRefundRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: [
        "requested",
        "approved",
        "rejected",
        "processing",
        "completed",
      ],
      default: "requested",
      index: true,
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    razorpayRefundId: {
      type: String,
      sparse: true,
      index: true,
    },

    razorpayRefundStatus: {
      type: String,
      enum: ["pending", "processed", "failed"],
    },

    refundIdempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },

    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

refundRequestSchema.index({ user: 1, createdAt: -1 });
refundRequestSchema.index({ order: 1, createdAt: -1 });

const RefundRequest: Model<IRefundRequest> =
  model<IRefundRequest>("RefundRequest", refundRequestSchema);

export default RefundRequest;
