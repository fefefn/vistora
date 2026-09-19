import mongoose from "mongoose";
import { env } from "../config/env";
import Product from "../models/Product";

const run = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("MongoDB connected.");

    // Clothing products
    await Product.updateMany(
      {
        category: "clothing",
        gender: { $exists: false },
      },
      {
        $set: { gender: "men" },
      },
    );

    // Shoes are unisex
    await Product.updateMany(
      {
        category: "shoes",
        gender: { $exists: false },
      },
      {
        $set: { gender: "unisex" },
      },
    );

    // Accessories are unisex
    await Product.updateMany(
      {
        category: "accessories",
        gender: { $exists: false },
      },
      {
        $set: { gender: "unisex" },
      },
    );

    // Watches are unisex
    await Product.updateMany(
      {
        category: "watches",
        gender: { $exists: false },
      },
      {
        $set: { gender: "unisex" },
      },
    );

    // Electronics are unisex
    await Product.updateMany(
      {
        category: "electronics",
        gender: { $exists: false },
      },
      {
        $set: { gender: "unisex" },
      },
    );

    // Lifestyle products are unisex
    await Product.updateMany(
      {
        category: "lifestyle",
        gender: { $exists: false },
      },
      {
        $set: { gender: "unisex" },
      },
    );

    console.log("Gender migration completed.");

    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    console.log("Gender distribution:");
    console.table(summary);

  } catch (error) {
    console.error("Gender migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
