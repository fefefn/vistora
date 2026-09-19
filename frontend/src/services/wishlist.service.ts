import api from "./api";
import type { Product } from "./product.service";

export interface Wishlist {
  _id: string;
  user: string;
  items: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  data: Wishlist;
  message?: string;
}

export const getWishlist = async (): Promise<WishlistResponse> => {
  const response = await api.get<WishlistResponse>("/wishlist");

  return response.data;
};

export const addToWishlist = async (
  productId: string,
): Promise<WishlistResponse> => {
  const response = await api.post<WishlistResponse>("/wishlist/items", {
    productId,
  });

  return response.data;
};

export const removeFromWishlist = async (
  productId: string,
): Promise<WishlistResponse> => {
  const response = await api.delete<WishlistResponse>(
    `/wishlist/items/${productId}`,
  );

  return response.data;
};
