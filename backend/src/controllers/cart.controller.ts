import { Response } from "express";
import { Types } from "mongoose";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { AuthenticatedRequest } from "../middleware/auth";

const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.userId || "";
};

// GET /api/cart
export const getCart = async (
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

    let cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
    );

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get cart",
    });
  }
};

// POST /api/cart/items
export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { productId, quantity = 1 } = req.body;

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

    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
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

    if (product.stock <= 0) {
      res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
      return;
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    const newQuantity = existingItem
      ? existingItem.quantity + requestedQuantity
      : requestedQuantity;

    if (newQuantity > product.stock) {
      res.status(400).json({
        success: false,
        message: `Only ${product.stock} items are available`,
      });
      return;
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(productId),
        quantity: requestedQuantity,
      });
    }

    await cart.save();

    const populatedCart = await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

// PATCH /api/cart/items/:productId
export const updateCartItem = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const productId = String(req.params.productId);

    const { quantity } = req.body;

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

    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
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

    if (requestedQuantity > product.stock) {
      res.status(400).json({
        success: false,
        message: `Only ${product.stock} items are available`,
      });
      return;
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    const item = cart.items.find(
      (cartItem) => cartItem.product.toString() === productId,
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Product is not in cart",
      });
      return;
    }

    item.quantity = requestedQuantity;

    await cart.save();

    const populatedCart = await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

// DELETE /api/cart/items/:productId
export const removeFromCart = async (
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

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    if (cart.items.length === originalLength) {
      res.status(404).json({
        success: false,
        message: "Product is not in cart",
      });
      return;
    }

    await cart.save();

    const populatedCart = await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};

// DELETE /api/cart
export const clearCart = async (
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

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      res.status(200).json({
        success: true,
        message: "Cart is already empty",
        data: {
          user: userId,
          items: [],
        },
      });
      return;
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};