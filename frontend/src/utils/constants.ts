import type { NavItem } from "@/types";

export const APP_NAME = "Vistora";

/** Backend base URL. Falls back to localhost when the env var is missing. */
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

/** Primary navigation shown in the navbar (desktop + mobile). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Wishlist", path: "/wishlist" },
  { label: "Cart", path: "/cart" },
];
