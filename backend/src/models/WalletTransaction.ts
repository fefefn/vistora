import { Document, Model, Schema, model, Types } from "mongoose";

export type WalletTransactionType =
  | "credit"
  | "debit"
  | "refund"
  | "referral"
  | "cashback"
  | "adjustment";

export interface IWalletTransaction extends Document {
  wallet: Types.ObjectId;
  user: Types.ObjectId;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "credit",
        "debit",
        "refund",
        "referral",
        "cashback",
        "adjustment",
      ],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    referenceType: {
      type: String,
      trim: true,
    },

    referenceId: {
      type: String,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ wallet: 1, createdAt: -1 });

const WalletTransaction: Model<IWalletTransaction> =
  model<IWalletTransaction>(
    "WalletTransaction",
    walletTransactionSchema,
  );

export default WalletTransaction;
