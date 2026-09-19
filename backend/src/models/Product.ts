import mongoose, { Document, Schema } from "mongoose";

export type ProductGender =
  | "men"
  | "women"
  | "boys"
  | "girls"
  | "kids"
  | "unisex";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;

  // Product classification
  gender: ProductGender;
  category: string;
  subcategory?: string;

  // Product attributes
  brand?: string;
  colors: string[];
  fabric?: string;
  sizes: string[];

  images: string[];
  stock: number;
  rating: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    // Product gender
    gender: {
      type: String,
      enum: ["men", "women", "boys", "girls", "kids", "unisex"],
      default: "unisex",
      index: true,
    },

    // Main category
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // Example: shirts, t-shirts, running-shoes
    subcategory: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
      index: true,
    },

    // Example: black, white, blue
    colors: {
      type: [String],
      default: [],
    },

    // Example: cotton, denim, polyester
    fabric: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    // Example: XS, S, M, L, XL
    sizes: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Search
productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
});

// Filtering / sorting indexes
productSchema.index({ gender: 1, category: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
