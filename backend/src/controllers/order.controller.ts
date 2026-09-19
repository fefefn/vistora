import { Response } from "express";
import { Types } from "mongoose";
import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { AuthenticatedRequest } from "../middleware/auth";

const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.userId || "";
};

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `VST-${timestamp}-${random}`;
};

// POST /api/orders
export const createOrder = async (
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
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

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

    const orderItems: {
      product: Types.ObjectId;
      quantity: number;
      price: number;
    }[] = [];

    // --------------------------------------------------
    // 1. Validate products and stock
    // --------------------------------------------------

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

      const itemTotal = product.price * item.quantity;

      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const shipping = 0;
    const total = subtotal + shipping;

    // --------------------------------------------------
    // 2. Deduct stock
    // --------------------------------------------------

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
        // Safety rollback for products already updated
        for (const rollbackItem of orderItems) {
          if (rollbackItem.product.equals(item.product)) {
            break;
          }

          await Product.findByIdAndUpdate(
            rollbackItem.product,
            {
              $inc: {
                stock: rollbackItem.quantity,
              },
            },
          );
        }

        res.status(400).json({
          success: false,
          message:
            "Stock changed while placing the order. Please try again.",
        });
        return;
      }
    }

    // --------------------------------------------------
    // 3. Create order
    // --------------------------------------------------

    let order;

    try {
      order = await Order.create({
        orderNumber: generateOrderNumber(),
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

        paymentMethod: "cod",
        paymentStatus: "pending",
        orderStatus: "pending",
      });
    } catch (orderError) {
      // Roll stock back if order creation fails
      for (const item of orderItems) {
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
    // 4. Clear cart
    // --------------------------------------------------

    cart.items = [];
    await cart.save();

    const populatedOrder = await order.populate("items.product");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// GET /api/orders
export const getOrders = async (
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

    const orders = await Order.find({
      user: userId,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};

// GET /api/orders/:id
export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const orderId = String(req.params.id);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("items.product");

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get order",
    });
  }
};  
// GET /api/orders/admin/all
// Admin only
export const getAllOrdersAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const requestedPage = Number(req.query.page);
    const requestedLimit = Number(req.query.limit);

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : "all";

    const paymentStatus =
      typeof req.query.paymentStatus === "string"
        ? req.query.paymentStatus
        : "all";

    const paymentMethod =
      typeof req.query.paymentMethod === "string"
        ? req.query.paymentMethod
        : "all";

    const sort =
      typeof req.query.sort === "string"
        ? req.query.sort
        : "newest";

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    const allowedPaymentMethods = [
      "cod",
      "razorpay",
    ];

    const filter: Record<string, unknown> = {};

    if (
      status !== "all" &&
      allowedStatuses.includes(status)
    ) {
      filter.orderStatus = status;
    }

    if (
      paymentStatus !== "all" &&
      allowedPaymentStatuses.includes(paymentStatus)
    ) {
      filter.paymentStatus = paymentStatus;
    }

    if (
      paymentMethod !== "all" &&
      allowedPaymentMethods.includes(paymentMethod)
    ) {
      filter.paymentMethod = paymentMethod;
    }

    if (search) {
      filter.orderNumber = {
        $regex: search,
        $options: "i",
      };
    }

    let sortQuery: Record<string, 1 | -1>;

    switch (sort) {
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;

      case "highest":
        sortQuery = {
          total: -1,
          createdAt: -1,
        };
        break;

      case "lowest":
        sortQuery = {
          total: 1,
          createdAt: -1,
        };
        break;

      case "newest":
      default:
        sortQuery = {
          createdAt: -1,
        };
        break;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .populate("items.product")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit),

      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get all orders",
    });
  }
};
// PATCH /api/orders/admin/:id/status
// Admin only
export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const orderId = String(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ] as const;

    type RequestedOrderStatus = (typeof allowedStatuses)[number];

    type CurrentOrderStatus =
      | RequestedOrderStatus
      | "refunded";

    if (!Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status as RequestedOrderStatus)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
      return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    const currentStatus = order.orderStatus as CurrentOrderStatus;
    const requestedStatus = status as RequestedOrderStatus;

    const allowedTransitions: Record<
      CurrentOrderStatus,
      RequestedOrderStatus[]
    > = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
      refunded: [],
    };

    // Idempotent request: same status is already applied.
    if (currentStatus === requestedStatus) {
      const populatedOrder = await order.populate([
        { path: "user", select: "name email" },
        { path: "items.product" },
      ]);

      res.status(200).json({
        success: true,
        message: "Order status is already up to date",
        data: populatedOrder,
      });
      return;
    }

    if (!allowedTransitions[currentStatus].includes(requestedStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid order status transition: ${currentStatus} → ${requestedStatus}`,
      });
      return;
    }

    /*
     * Cancellation hardening:
     *
     * Change the order status atomically before restoring stock.
     * This prevents two simultaneous cancellation requests from both
     * restoring the same stock.
     */
    if (requestedStatus === "cancelled") {
      const cancelledOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          orderStatus: currentStatus,
        },
        {
          $set: {
            orderStatus: "cancelled",
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!cancelledOrder) {
        res.status(409).json({
          success: false,
          message:
            "Order status changed by another request. Please refresh and try again.",
        });
        return;
      }

      const restoredItems: Array<{
        productId: Types.ObjectId;
        quantity: number;
      }> = [];

      try {
        for (const item of cancelledOrder.items) {
          const productId = item.product as Types.ObjectId;
          const quantity = Number(item.quantity);

          if (!Types.ObjectId.isValid(productId) || quantity <= 0) {
            throw new Error(
              "Invalid product or quantity found in cancelled order",
            );
          }

          const result = await Product.updateOne(
            { _id: productId },
            { $inc: { stock: quantity } },
          );

          if (result.matchedCount !== 1) {
            throw new Error(
              `Product ${productId.toString()} not found while restoring stock`,
            );
          }

          restoredItems.push({
            productId,
            quantity,
          });
        }
      } catch (stockError) {
        console.error(
          "Stock restoration failed during order cancellation:",
          stockError,
        );

        // Roll back stock changes already made.
        for (const restoredItem of restoredItems) {
          try {
            await Product.updateOne(
              { _id: restoredItem.productId },
              { $inc: { stock: -restoredItem.quantity } },
            );
          } catch (rollbackError) {
            console.error(
              "CRITICAL: Failed to roll back restored stock:",
              rollbackError,
            );
          }
        }

        // Roll the order back only if it is still cancelled.
        await Order.updateOne(
          {
            _id: orderId,
            orderStatus: "cancelled",
          },
          {
            $set: {
              orderStatus: currentStatus,
            },
          },
        );

        res.status(500).json({
          success: false,
          message: "Failed to restore product stock. Order was not cancelled.",
        });
        return;
      }

      const populatedOrder = await cancelledOrder.populate([
        { path: "user", select: "name email" },
        { path: "items.product" },
      ]);

      res.status(200).json({
        success: true,
        message: "Order cancelled and product stock restored successfully",
        data: populatedOrder,
      });
      return;
    }

    // Normal forward status transition.
    // Update atomically so concurrent admin requests cannot both transition
    // the order from the same previous status.
    const updateFields: {
      orderStatus: RequestedOrderStatus;
      paymentStatus?: "pending" | "paid" | "failed" | "refunded";
    } = {
      orderStatus: requestedStatus,
    };

    // COD payment is collected when the order is delivered.
    // Never change Razorpay payment status here.
    if (
      requestedStatus === "delivered" &&
      order.paymentMethod === "cod"
    ) {
      updateFields.paymentStatus = "paid";
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        orderStatus: currentStatus,
      },
      {
        $set: updateFields,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedOrder) {
      res.status(409).json({
        success: false,
        message:
          "Order status changed by another request. Please refresh and try again.",
      });
      return;
    }

    const populatedOrder = await updatedOrder.populate([
      { path: "user", select: "name email" },
      { path: "items.product" },
    ]);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};






