import mongoose from "mongoose";
import Product from "../models/Product";
import { connectDB } from "../config/db";

type Gender = "men" | "women" | "boys" | "girls" | "kids" | "unisex";

type Category =
  | "clothing"
  | "shoes"
  | "accessories"
  | "watches"
  | "electronics"
  | "lifestyle";

interface ProductTemplate {
  category: Category;
  subcategory: string;
  names: string[];
  brands: string[];
  fabrics: string[];
  basePrice: number;
  image: string;
}

const genders: Gender[] = [
  "men",
  "women",
  "boys",
  "girls",
  "kids",
  "unisex",
];

const colors = [
  "black",
  "white",
  "blue",
  "red",
  "green",
  "yellow",
  "pink",
  "grey",
  "brown",
];

const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];

const shoeSizes = [
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
];

const lifestyleSizes = ["S", "M", "L"];

const clothingTemplates: ProductTemplate[] = [
  {
    category: "clothing",
    subcategory: "t-shirts",
    names: [
      "Classic Cotton T-Shirt",
      "Premium Oversized T-Shirt",
      "Essential Crew Neck T-Shirt",
      "Graphic Casual T-Shirt",
      "Slim Fit T-Shirt",
      "Everyday Comfort T-Shirt",
    ],
    brands: ["Nike", "Adidas", "Puma", "Roadster", "H&M", "Levis"],
    fabrics: ["cotton", "polyester"],
    basePrice: 799,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "clothing",
    subcategory: "shirts",
    names: [
      "Casual Oxford Shirt",
      "Premium Linen Shirt",
      "Regular Fit Casual Shirt",
      "Checked Cotton Shirt",
      "Classic Formal Shirt",
      "Relaxed Weekend Shirt",
    ],
    brands: ["Allen Solly", "Peter England", "Roadster", "H&M", "Levis"],
    fabrics: ["cotton", "linen", "polyester"],
    basePrice: 1299,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "clothing",
    subcategory: "jeans",
    names: [
      "Slim Fit Denim Jeans",
      "Classic Straight Jeans",
      "Relaxed Fit Jeans",
      "Stretch Denim Jeans",
      "Tapered Casual Jeans",
      "Premium Blue Jeans",
    ],
    brands: ["Levis", "Jack & Jones", "Wrangler", "Roadster"],
    fabrics: ["denim", "cotton"],
    basePrice: 1799,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "clothing",
    subcategory: "hoodies",
    names: [
      "Classic Fleece Hoodie",
      "Oversized Street Hoodie",
      "Premium Cotton Hoodie",
      "Everyday Pullover Hoodie",
      "Winter Comfort Hoodie",
    ],
    brands: ["Nike", "Adidas", "Puma", "H&M", "Roadster"],
    fabrics: ["cotton", "polyester", "wool"],
    basePrice: 1899,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "clothing",
    subcategory: "jackets",
    names: [
      "Classic Denim Jacket",
      "Lightweight Casual Jacket",
      "Puffer Winter Jacket",
      "Bomber Jacket",
      "Utility Casual Jacket",
    ],
    brands: ["Levis", "Nike", "Adidas", "Roadster", "Jack & Jones"],
    fabrics: ["denim", "polyester", "cotton"],
    basePrice: 2499,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "clothing",
    subcategory: "dresses",
    names: [
      "Floral Casual Dress",
      "Elegant Summer Dress",
      "Relaxed Cotton Dress",
      "Printed Midi Dress",
      "Classic Party Dress",
      "Comfort Fit Dress",
    ],
    brands: ["H&M", "Zara", "ONLY", "Roadster", "Vero Moda"],
    fabrics: ["cotton", "linen", "polyester", "silk"],
    basePrice: 1599,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
  },
];

const shoeTemplates: ProductTemplate[] = [
  {
    category: "shoes",
    subcategory: "running-shoes",
    names: [
      "Performance Running Shoes",
      "Lightweight Running Shoes",
      "Daily Trainer Running Shoes",
      "Cushion Running Shoes",
      "Active Sport Running Shoes",
      "Road Running Shoes",
    ],
    brands: ["Nike", "Adidas", "Puma", "Asics", "New Balance"],
    fabrics: ["mesh", "synthetic"],
    basePrice: 2999,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "shoes",
    subcategory: "sneakers",
    names: [
      "Classic Lifestyle Sneakers",
      "Urban Street Sneakers",
      "Premium Casual Sneakers",
      "Retro Court Sneakers",
      "Minimal White Sneakers",
      "Everyday Walking Sneakers",
    ],
    brands: ["Nike", "Adidas", "Puma", "Reebok", "Vans", "Converse"],
    fabrics: ["synthetic", "canvas", "leather"],
    basePrice: 2499,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "shoes",
    subcategory: "formal-shoes",
    names: [
      "Classic Formal Oxford",
      "Premium Leather Derby",
      "Business Formal Shoes",
      "Classic Office Loafers",
      "Elegant Leather Shoes",
    ],
    brands: ["Bata", "Red Tape", "Clarks", "Woodland"],
    fabrics: ["leather", "synthetic"],
    basePrice: 2799,
    image:
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "shoes",
    subcategory: "sandals",
    names: [
      "Comfort Casual Sandals",
      "Outdoor Walking Sandals",
      "Classic Everyday Sandals",
      "Sport Trek Sandals",
      "Lightweight Summer Sandals",
    ],
    brands: ["Puma", "Adidas", "Sparx", "Bata", "Woodland"],
    fabrics: ["synthetic", "rubber"],
    basePrice: 999,
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80",
  },
];

const accessoryTemplates: ProductTemplate[] = [
  {
    category: "accessories",
    subcategory: "bags",
    names: [
      "Classic Travel Backpack",
      "Urban Laptop Backpack",
      "Everyday Casual Backpack",
      "Premium Sling Bag",
      "Compact Crossbody Bag",
      "Weekend Travel Bag",
    ],
    brands: ["Wildcraft", "American Tourister", "Nike", "Adidas", "Puma"],
    fabrics: ["polyester", "nylon", "canvas"],
    basePrice: 1299,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "accessories",
    subcategory: "sunglasses",
    names: [
      "Classic UV Sunglasses",
      "Polarized Outdoor Sunglasses",
      "Premium Aviator Sunglasses",
      "Urban Round Sunglasses",
      "Sport Performance Sunglasses",
    ],
    brands: ["Fastrack", "Ray-Ban", "Vogue", "Titan"],
    fabrics: ["acrylic"],
    basePrice: 999,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "accessories",
    subcategory: "wallets",
    names: [
      "Classic Leather Wallet",
      "Slim Card Wallet",
      "Premium Bifold Wallet",
      "Compact Everyday Wallet",
      "Minimal Card Holder",
    ],
    brands: ["Fossil", "Wildhorn", "Tommy Hilfiger", "Levis"],
    fabrics: ["leather", "synthetic"],
    basePrice: 799,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "accessories",
    subcategory: "belts",
    names: [
      "Classic Leather Belt",
      "Casual Canvas Belt",
      "Premium Formal Belt",
      "Reversible Everyday Belt",
    ],
    brands: ["Levis", "Fossil", "Tommy Hilfiger", "Allen Solly"],
    fabrics: ["leather", "canvas"],
    basePrice: 699,
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
  },
];

const watchTemplates: ProductTemplate[] = [
  {
    category: "watches",
    subcategory: "analog",
    names: [
      "Classic Analog Watch",
      "Minimal Dial Watch",
      "Premium Steel Watch",
      "Elegant Everyday Watch",
      "Classic Leather Strap Watch",
    ],
    brands: ["Titan", "Fastrack", "Fossil", "Timex", "Casio"],
    fabrics: ["steel", "leather", "silicone"],
    basePrice: 2499,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "watches",
    subcategory: "smartwatches",
    names: [
      "Fitness Smartwatch",
      "Active Pro Smartwatch",
      "Everyday Smartwatch",
      "Health Tracking Smartwatch",
      "Sport GPS Smartwatch",
    ],
    brands: ["Fastrack", "Noise", "Boat", "Fire-Boltt", "Amazfit"],
    fabrics: ["silicone", "steel"],
    basePrice: 1999,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
  },
];

const electronicsTemplates: ProductTemplate[] = [
  {
    category: "electronics",
    subcategory: "headphones",
    names: [
      "Wireless Bluetooth Headphones",
      "Premium Noise Cancelling Headphones",
      "Bass Boost Headphones",
      "Travel Wireless Headphones",
      "Studio Sound Headphones",
    ],
    brands: ["Boat", "Sony", "JBL", "Realme", "Noise"],
    fabrics: ["plastic", "metal"],
    basePrice: 1999,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "electronics",
    subcategory: "earbuds",
    names: [
      "True Wireless Earbuds",
      "Bass Pro Earbuds",
      "Compact Wireless Earbuds",
      "Noise Cancelling Earbuds",
      "Sport Wireless Earbuds",
    ],
    brands: ["Boat", "JBL", "Sony", "Realme", "OnePlus"],
    fabrics: ["plastic"],
    basePrice: 1299,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "electronics",
    subcategory: "speakers",
    names: [
      "Portable Bluetooth Speaker",
      "Mini Wireless Speaker",
      "Bass Boost Speaker",
      "Outdoor Party Speaker",
      "Compact Smart Speaker",
    ],
    brands: ["JBL", "Boat", "Sony", "Marshall"],
    fabrics: ["plastic", "metal"],
    basePrice: 1599,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
  },
];

const lifestyleTemplates: ProductTemplate[] = [
  {
    category: "lifestyle",
    subcategory: "fitness",
    names: [
      "Premium Yoga Mat",
      "Non Slip Exercise Mat",
      "Fitness Resistance Band",
      "Adjustable Skipping Rope",
      "Workout Training Kit",
    ],
    brands: ["Boldfit", "Nike", "Adidas", "Puma", "Decathlon"],
    fabrics: ["rubber", "cotton", "silicone"],
    basePrice: 599,
    image:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "lifestyle",
    subcategory: "bottles",
    names: [
      "Stainless Steel Water Bottle",
      "Insulated Travel Bottle",
      "Premium Sports Bottle",
      "Thermal Water Bottle",
      "Everyday Steel Bottle",
    ],
    brands: ["Milton", "Puma", "Nike", "Adidas", "Borosil"],
    fabrics: ["steel", "plastic"],
    basePrice: 699,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "lifestyle",
    subcategory: "travel",
    names: [
      "Premium Travel Organizer",
      "Compact Travel Pouch",
      "Weekend Travel Kit",
      "Passport Travel Wallet",
      "Travel Essentials Kit",
    ],
    brands: ["Wildcraft", "American Tourister", "Safari", "Puma"],
    fabrics: ["polyester", "nylon", "canvas"],
    basePrice: 899,
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
  },
];

const allTemplates = [
  ...clothingTemplates,
  ...shoeTemplates,
  ...accessoryTemplates,
  ...watchTemplates,
  ...electronicsTemplates,
  ...lifestyleTemplates,
];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const pick = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const pickMany = <T>(items: T[], min: number, max: number): T[] => {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const count =
    Math.floor(Math.random() * (max - min + 1)) + min;

  return shuffled.slice(0, Math.min(count, items.length));
};

const getSizes = (category: Category): string[] => {
  if (category === "shoes") {
    return pickMany(shoeSizes, 3, 6);
  }

  if (
    category === "electronics" ||
    category === "watches" ||
    category === "accessories"
  ) {
    return [];
  }

  if (category === "lifestyle") {
    return pickMany(lifestyleSizes, 2, 3);
  }

  return pickMany(clothingSizes, 3, 6);
};

const getGenderForIndex = (index: number): Gender => {
  return genders[index % genders.length];
};

const buildProduct = (
  template: ProductTemplate,
  index: number,
): Record<string, unknown> => {
  const gender = getGenderForIndex(index);

  const nameBase = pick(template.names);
  const brand = pick(template.brands);

  const selectedColors = pickMany(colors, 2, 4);

  const priceVariation =
    Math.floor(Math.random() * 8) * 100;

  const price = template.basePrice + priceVariation;

  const discount = pick([10, 15, 20, 25, 30]);

  const compareAtPrice = Math.ceil(
    price / (1 - discount / 100),
  );

  const stock =
    Math.floor(Math.random() * 91) + 10;

  const rating =
    Math.round(
      (3.5 + Math.random() * 1.5) * 10,
    ) / 10;

  const uniqueName =
    `${brand} ${nameBase} ${gender} ${index + 1}`;

  const slug = `${slugify(uniqueName)}-${index + 1}`;

  return {
    name: uniqueName,

    slug,

    description:
      `Premium ${nameBase.toLowerCase()} from ${brand}. ` +
      `Designed for everyday comfort, style and reliable performance. ` +
      `Perfect for modern ${gender} customers.`,

    price,

    compareAtPrice,

    gender,

    category: template.category,

    subcategory: template.subcategory,

    brand,

    colors: selectedColors,

    fabric: pick(template.fabrics),

    sizes: getSizes(template.category),

    images: [template.image],

    stock,

    rating,

    isActive: true,
  };
};

const main = async (): Promise<void> => {
  try {
    console.log("\n🚀 Vistora Bulk Product Seeder\n");

    const connected = await connectDB();

    if (!connected) {
      throw new Error(
        "MongoDB connection failed. Check your MONGODB_URI.",
      );
    }

    const targetNewProducts = 240;

    const existingCount = await Product.countDocuments();

    console.log(
      `📦 Existing products: ${existingCount}`,
    );

    console.log(
      `➕ Products to generate: ${targetNewProducts}`,
    );

    const productsToInsert: Record<string, unknown>[] = [];

    for (let i = 0; i < targetNewProducts; i++) {
      const template =
        allTemplates[i % allTemplates.length];

      productsToInsert.push(
        buildProduct(template, i),
      );
    }

    /*
     * Duplicate protection:
     * Check generated slugs against existing database.
     */
    const slugs = productsToInsert.map(
      (product) => product.slug,
    );

    const existingProducts = await Product.collection.find(
      { slug: { $in: slugs } },
      { projection: { slug: 1 } },
    ).toArray()
    const existingSlugs = new Set(
      existingProducts.map(
        (product) => product.slug,
      ),
    );

    const newProducts = productsToInsert.filter(
      (product) =>
        !existingSlugs.has(product.slug as string),
    );

    if (newProducts.length === 0) {
      console.log(
        "ℹ️ All generated products already exist.",
      );
    } else {
      await Product.insertMany(newProducts, {
        ordered: false,
      });

      console.log(
        `✅ Inserted ${newProducts.length} new products.`,
      );
    }

    const finalCount = await Product.countDocuments();

    console.log(
      `\n📊 Total products now: ${finalCount}`,
    );

    /*
     * Distribution reports
     */
    const genderDistribution =
      await Product.aggregate([
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

    const categoryDistribution =
      await Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    const brandDistribution =
      await Product.aggregate([
        {
          $group: {
            _id: "$brand",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 20,
        },
      ]);

    console.log("\n👥 Gender distribution:");
    console.table(genderDistribution);

    console.log("\n🛍️ Category distribution:");
    console.table(categoryDistribution);

    console.log("\n🏷️ Top brands:");
    console.table(brandDistribution);

    console.log(
      "\n🎉 Bulk product seeding completed successfully!",
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Bulk product seeding failed:",
    );

    console.error(
      error instanceof Error
        ? error.message
        : error,
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

void main();
