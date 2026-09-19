import mongoose from "mongoose";
import Product from "../models/Product";
import { env } from "../config/env";

const run = async () => {
  await mongoose.connect(env.MONGODB_URI);

  const total = await Product.countDocuments({
    isActive: true,
    $expr: {
      $gt: ["$compareAtPrice", "$price"],
    },
  });

  console.log("✅ Deals count:", total);

  const products = await Product.find({
    isActive: true,
    $expr: {
      $gt: ["$compareAtPrice", "$price"],
    },
  })
    .select("name price compareAtPrice")
    .limit(5)
    .lean();

  console.log(products);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("❌", error);
  await mongoose.disconnect();
  process.exit(1);
});

