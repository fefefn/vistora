import { Request, Response } from "express";
import Wallet from "../models/Wallet";
import WalletTransaction from "../models/WalletTransaction";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: "customer" | "admin";
  };
};

export const getWallet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  let wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      currency: "INR",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: wallet._id,
      balance: wallet.balance,
      currency: wallet.currency,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    },
  });
};

export const getWalletTransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const page = Math.max(
    1,
    Number.parseInt(String(req.query.page || "1"), 10) || 1,
  );

  const limit = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(String(req.query.limit || "20"), 10) || 20,
    ),
  );

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    WalletTransaction.countDocuments({ user: userId }),
  ]);

  res.status(200).json({
    success: true,
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  });
};
