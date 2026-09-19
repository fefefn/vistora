import { Response } from "express";
import { Types } from "mongoose";
import razorpay from "../config/razorpay";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Order from "../models/Order";
import { AuthenticatedRequest } from "../middleware/auth";
import { env } from "../config/env";
import { createRazorpayRefund } from "./refund.controller";

const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.userId || "";
};

// POST /api/payments/razorpay/order
export const createRazorpayOrder = async (
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

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
      return;
    }

    let subtotal = 0;

    // Validate cart and calculate the authoritative server-side total.
    for (const item of cart.items) {
      const productId = item.product as unknown as Types.ObjectId;

      const product = await Product.findOne({
        _id: productId,
        isActive: true,
      });

      if (!product) {
        res.status(400).json({
          success: false,
          message: "One or more products are no longer available",
        });
        return;
      }

      if (item.quantity > product.stock) {
        res.status(400).json({
          success: false,
          message: `Only ${product.stock} units of ${product.name} are available`,
        });
        return;
      }

      subtotal += product.price * item.quantity;
    }

    const shipping = 0;
    const total = subtotal + shipping;

    // Razorpay expects the amount in the smallest currency unit.
    // INR -> paise
    const amountInPaise = Math.round(total * 100);

    if (amountInPaise <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
      return;
    }

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay environment variables are missing");

      res.status(500).json({
        success: false,
        message: "Online payment is not configured",
      });
      return;
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `vistora_${Date.now()}`,
      notes: {
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create online payment order",
    });
  }
};

// POST /api/payments/razorpay/verify
export const verifyRazorpayPayment = async (
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

    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
      return;
    }

    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      res.status(400).json({
        success: false,
        message: "All shipping address fields are required",
      });
      return;
    }

    if (!env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay secret is missing");

      res.status(500).json({
        success: false,
        message: "Online payment is not configured",
      });
      return;
    }

    // --------------------------------------------------
    // 1. Verify Razorpay signature
    // --------------------------------------------------

    const crypto = await import("crypto");

    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
      return;
    }

    // --------------------------------------------------
    // 2. Prevent duplicate order creation
    // --------------------------------------------------
    // Check this immediately after signature verification.
    // This makes repeated verification requests idempotent even
    // if the user's cart was already cleared by the first request.

    const existingOrder = await Order.findOne({
      razorpayOrderId,
    });

    if (existingOrder) {
      res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: existingOrder,
      });
      return;
    }

    // --------------------------------------------------
    // 3. Get user's cart
    // --------------------------------------------------

    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
      return;
    }

    // --------------------------------------------------
    // 4. Recalculate total from current products
    // --------------------------------------------------

    let subtotal = 0;

    const orderItems: {
      product: Types.ObjectId;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of cart.items) {
      const product = await Product.findOne({
        _id: item.product,
        isActive: true,
      });

      if (!product) {
        res.status(400).json({
          success: false,
          message: "One or more products are no longer available",
        });
        return;
      }

      if (item.quantity > product.stock) {
        res.status(400).json({
          success: false,
          message: `Only ${product.stock} units of ${product.name} are available`,
        });
        return;
      }

      subtotal += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const shipping = 0;
    const total = subtotal + shipping;
    const expectedAmount = Math.round(total * 100);

    // --------------------------------------------------
    // 5. Verify Razorpay order and payment
    // --------------------------------------------------

    const razorpayOrder = await razorpay.orders.fetch(
      razorpayOrderId,
    );

    const razorpayUserId = razorpayOrder.notes?.userId;

    if (!razorpayUserId || razorpayUserId !== userId) {
      res.status(403).json({
        success: false,
        message: "Payment order does not belong to this user",
      });
      return;
    }

    if (
      razorpayOrder.amount !== expectedAmount ||
      razorpayOrder.currency !== "INR"
    ) {
      res.status(400).json({
        success: false,
        message: "Payment amount verification failed",
      });
      return;
    }

    // Fetch the actual Razorpay payment and verify that:
    // - it belongs to this Razorpay order
    // - it is captured successfully
    // - amount and currency match the order
    const razorpayPayment = await razorpay.payments.fetch(
      razorpayPaymentId,
    );

    if (
      razorpayPayment.order_id !== razorpayOrderId ||
      razorpayPayment.amount !== expectedAmount ||
      razorpayPayment.currency !== "INR"
    ) {
      res.status(400).json({
        success: false,
        message: "Payment details verification failed",
      });
      return;
    }

    if (razorpayPayment.status !== "captured") {
      res.status(400).json({
        success: false,
        message: "Payment has not been captured",
      });
      return;
    }

    // --------------------------------------------------
    // 6. Deduct stock
    // --------------------------------------------------    // --------------------------------------------------
    // 6. Deduct stock
    // --------------------------------------------------

    const deductedItems: {
      product: Types.ObjectId;
      quantity: number;
    }[] = [];

    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          isActive: true,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedProduct) {
        // Roll back only the stock already deducted.
        for (const deductedItem of deductedItems) {
          await Product.findByIdAndUpdate(
            deductedItem.product,
            {
              $inc: {
                stock: deductedItem.quantity,
              },
            },
          );
        }

        res.status(400).json({
          success: false,
          message:
            "Stock changed while completing payment. Please contact support.",
        });
        return;
      }

      deductedItems.push({
        product: item.product,
        quantity: item.quantity,
      });
    }

    // --------------------------------------------------
    // 7. Create Vistora order
    // --------------------------------------------------

    let order;

    try {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(1000 + Math.random() * 9000);

      order = await Order.create({
        orderNumber: `VST-${timestamp}-${random}`,

        user: new Types.ObjectId(userId),

        items: orderItems,

        shippingAddress: {
          fullName: String(fullName).trim(),
          phone: String(phone).trim(),
          address: String(address).trim(),
          city: String(city).trim(),
          state: String(state).trim(),
          pincode: String(pincode).trim(),
        },

        subtotal,
        shipping,
        total,

        paymentMethod: "razorpay",
        paymentStatus: "paid",

        razorpayOrderId,
        razorpayPaymentId,

        orderStatus: "pending",
      });
    } catch (orderError) {
      // Roll back stock if order creation fails.
      for (const item of deductedItems) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
            },
          },
        );
      }

      throw orderError;
    }

    // --------------------------------------------------
    // 8. Clear cart
    // --------------------------------------------------

    cart.items = [];
    await cart.save();

    const populatedOrder = await order.populate(
      "items.product",
    );

    res.status(201).json({
      success: true,
      message: "Payment verified and order placed successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

// GET /api/payments/history
export const getPaymentHistory = async (
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

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .select(
          "_id orderNumber total paymentMethod paymentStatus razorpayOrderId razorpayPaymentId createdAt orderStatus",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments({ user: userId }),
    ]);

    const payments = orders.map((order) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get payment history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};






