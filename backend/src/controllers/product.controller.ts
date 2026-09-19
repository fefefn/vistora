import { Request, Response } from "express";
import Product from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";

const parseList = (value: unknown): string[] => {
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const parsePositiveNumber = (value: unknown): number | undefined => {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
};

const validateProductNumbers = (
  price: unknown,
  compareAtPrice: unknown,
  stock: unknown,
) => {
  const parsedPrice = Number(price);
  const parsedCompareAtPrice =
    compareAtPrice !== undefined && compareAtPrice !== ""
      ? Number(compareAtPrice)
      : undefined;
  const parsedStock = Number(stock);

  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return "Price must be greater than 0";
  }

  if (
    parsedCompareAtPrice !== undefined &&
    (!Number.isFinite(parsedCompareAtPrice) ||
      parsedCompareAtPrice < parsedPrice)
  ) {
    return "Compare-at price must be greater than or equal to price";
  }

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return "Stock must be a whole number greater than or equal to 0";
  }

  return null;
};

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      gender,
      category,
      subcategory,
      brand,
      colors,
      fabric,
      sizes,
      images,
      stock,
    } = req.body;

    if (!name || !slug || !description || !category) {
      res.status(400);
      throw new Error(
        "Name, slug, description and category are required"
      );
    }

    const numberValidationError = validateProductNumbers(
      price,
      compareAtPrice,
      stock,
    );

    if (numberValidationError) {
      res.status(400);
      throw new Error(numberValidationError);
    }

    const normalizedColors = Array.isArray(colors)
      ? colors.map((color) => String(color).trim().toLowerCase()).filter(Boolean)
      : typeof colors === "string"
        ? parseList(colors)
        : [];

    const normalizedSizes = Array.isArray(sizes)
      ? sizes.map((size) => String(size).trim().toUpperCase()).filter(Boolean)
      : typeof sizes === "string"
        ? sizes
            .split(",")
            .map((size) => size.trim().toUpperCase())
            .filter(Boolean)
        : [];

    const product = await Product.create({
      name: String(name).trim(),
      slug: String(slug).trim().toLowerCase(),
      description: String(description).trim(),
      price: Number(price),
      compareAtPrice:
        compareAtPrice !== undefined && compareAtPrice !== ""
          ? Number(compareAtPrice)
          : undefined,
      gender: gender || "unisex",
      category: String(category).trim().toLowerCase(),
      subcategory: subcategory
        ? String(subcategory).trim().toLowerCase()
        : undefined,
      brand: brand ? String(brand).trim() : undefined,
      colors: normalizedColors,
      fabric: fabric
        ? String(fabric).trim().toLowerCase()
        : undefined,
      sizes: normalizedSizes,
      images: Array.isArray(images) ? images : [],
      stock: Number(stock) || 0,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  }
);

export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      category,
      subcategory,
      gender,
      brand,
      color,
      fabric,
      size,
      search,
      minPrice,
      maxPrice,
      minRating,      deals,
      sort = "newest",
      page = "1",
      limit = "20",
    } = req.query;

    const filter: Record<string, unknown> = {
      isActive: true,
    };

    // Multiple values supported:
    // ?gender=men,women
    // ?category=shirts,t-shirts
    // ?brand=nike,adidas
    const genders = parseList(gender);
    const categories = parseList(category);
    const subcategories = parseList(subcategory);
    const brands = parseList(brand);
    const colors = parseList(color);
    const fabrics = parseList(fabric);
    const sizes =
  typeof size === "string"
    ? size
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean)
    : [];

    if (genders.length > 0) {
      filter.gender = { $in: genders };
    }

    if (categories.length > 0) {
      filter.category = { $in: categories };
    }

    if (subcategories.length > 0) {
      filter.subcategory = { $in: subcategories };
    }

    if (brands.length > 0) {
      filter.brand = { $in: brands };
    }

    if (colors.length > 0) {
      filter.colors = { $in: colors };
    }

    if (fabrics.length > 0) {
      filter.fabric = { $in: fabrics };
    }

    if (sizes.length > 0) {
      filter.sizes = { $in: sizes };
    }

    if (typeof search === "string" && search.trim()) {
      filter.$text = {
        $search: search.trim(),
      };
    }

    if (deals === "true") {
      filter.$expr = {
        $gte: [
          {
            $multiply: [
              {
                $divide: [
                  { $subtract: ["$compareAtPrice", "$price"] },
                  "$compareAtPrice",
                ],
              },
              100,
            ],
          },
          20,
        ],
      };
    }

    const parsedMinPrice = parsePositiveNumber(minPrice);
    const parsedMaxPrice = parsePositiveNumber(maxPrice);

    if (
      parsedMinPrice !== undefined &&
      parsedMinPrice < 0
    ) {
      res.status(400);
      throw new Error("minPrice cannot be negative");
    }

    if (
      parsedMaxPrice !== undefined &&
      parsedMaxPrice < 0
    ) {
      res.status(400);
      throw new Error("maxPrice cannot be negative");
    }

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      res.status(400);
      throw new Error("minPrice cannot be greater than maxPrice");
    }

    if (
      parsedMinPrice !== undefined ||
      parsedMaxPrice !== undefined
    ) {
      filter.price = {
        ...(parsedMinPrice !== undefined
          ? { $gte: parsedMinPrice }
          : {}),
        ...(parsedMaxPrice !== undefined
          ? { $lte: parsedMaxPrice }
          : {}),
      };
    }

    const parsedMinRating = parsePositiveNumber(minRating);

    if (parsedMinRating !== undefined) {
      if (parsedMinRating < 0 || parsedMinRating > 5) {
        res.status(400);
        throw new Error("minRating must be between 0 and 5");
      }

      filter.rating = {
        $gte: parsedMinRating,
      };
    }

    const currentPage = Math.max(
      1,
      Number.parseInt(String(page), 10) || 1
    );

    const perPage = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(String(limit), 10) || 20
      )
    );

    const skip = (currentPage - 1) * perPage;

    let sortOption: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;

      case "price_desc":
        sortOption = { price: -1 };
        break;

      case "rating":
        sortOption = {
          rating: -1,
          createdAt: -1,
        };
        break;

      case "newest":
        sortOption = {
          createdAt: -1,
        };
        break;

      case "popular":
        // Until soldCount/popularity tracking is added,
        // use rating + newest as the popularity approximation.
        sortOption = {
          rating: -1,
          createdAt: -1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(perPage),

      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        hasNextPage: currentPage * perPage < total,
        hasPreviousPage: currentPage > 1,
      },
    });
  }
);

export const getAllProductsAdmin = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  }
);

export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const allowedFields = [
      "name",
      "slug",
      "description",
      "price",
      "compareAtPrice",
      "gender",
      "category",
      "subcategory",
      "brand",
      "colors",
      "fabric",
      "sizes",
      "images",
      "stock",
      "isActive",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.slug !== undefined) {
      updates.slug = String(updates.slug)
        .trim()
        .toLowerCase();
    }

    if (updates.category !== undefined) {
      updates.category = String(updates.category)
        .trim()
        .toLowerCase();
    }

    if (updates.subcategory !== undefined) {
      updates.subcategory = String(updates.subcategory)
        .trim()
        .toLowerCase();
    }

    if (updates.fabric !== undefined) {
      updates.fabric = String(updates.fabric)
        .trim()
        .toLowerCase();
    }

    if (updates.brand !== undefined) {
      updates.brand = String(updates.brand).trim();
    }

    if (updates.colors !== undefined) {
      updates.colors = Array.isArray(updates.colors)
        ? (updates.colors as unknown[])
            .map((color) => String(color).trim().toLowerCase())
            .filter(Boolean)
        : parseList(updates.colors);
    }

    if (updates.sizes !== undefined) {
      updates.sizes = Array.isArray(updates.sizes)
        ? (updates.sizes as unknown[])
            .map((size) => String(size).trim().toUpperCase())
            .filter(Boolean)
        : String(updates.sizes)
            .split(",")
            .map((size) => size.trim().toUpperCase())
            .filter(Boolean);
    }

    if (updates.gender !== undefined) {
      updates.gender = String(updates.gender)
        .trim()
        .toLowerCase();
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }

    if (
      updates.compareAtPrice !== undefined &&
      updates.compareAtPrice !== ""
    ) {
      updates.compareAtPrice = Number(updates.compareAtPrice);
    }

    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock);
    }

    if (
      updates.price !== undefined ||
      updates.compareAtPrice !== undefined ||
      updates.stock !== undefined
    ) {
      const currentProduct = await Product.findById(req.params.id);

      if (!currentProduct) {
        res.status(404);
        throw new Error("Product not found");
      }

      const numberValidationError = validateProductNumbers(
        updates.price !== undefined
          ? updates.price
          : currentProduct.price,
        updates.compareAtPrice !== undefined
          ? updates.compareAtPrice
          : currentProduct.compareAtPrice,
        updates.stock !== undefined
          ? updates.stock
          : currentProduct.stock,
      );

      if (numberValidationError) {
        res.status(400);
        throw new Error(numberValidationError);
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      res.status(200).json({
        success: true,
        message: "Product is already inactive",
        data: product,
      });
      return;
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      data: product,
    });
  }
);








