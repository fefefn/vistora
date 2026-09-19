import { Document, Model, Schema, model, Types } from "mongoose";

export type WalletTransactionType =
  | "credit"
  | "debit"
  | "refund"
  | "referral"
  | "cashback"
  | "adjustment";

export interface IWallet extends Document {
  user: Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    balance: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },
  },
  {
    timestamps: true,
  },
);

const Wallet: Model<IWallet> = model<IWallet>("Wallet", walletSchema);

export default Wallet;
