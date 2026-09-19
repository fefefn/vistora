import { Response } from "express";
import { Types } from "mongoose";
import Wishlist from "../models/Wishlist";
import Product from "../models/Product";
import { AuthenticatedRequest } from "../middleware/auth";

const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.userId || "";
};

// GET /api/wishlist
export const getWishlist = async (
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

    let wishlist = await Wishlist.findOne({
      user: userId,
    }).populate({
      path: "items",
      match: { isActive: true },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [],
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get wishlist",
    });
  }
};

// POST /api/wishlist/items
export const addToWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { productId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!productId || !Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
      return;
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      {
        $addToSet: {
          items: new Types.ObjectId(productId),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).populate({
      path: "items",
      match: { isActive: true },
    });

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

// DELETE /api/wishlist/items/:productId
export const removeFromWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const productId = String(req.params.productId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
      return;
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          items: new Types.ObjectId(productId),
        },
      },
      {
        new: true,
      },
    ).populate({
      path: "items",
      match: { isActive: true },
    });

    if (!wishlist) {
      res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};
