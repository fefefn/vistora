import api from "./api";
import type { Product } from "./product.service";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
  message?: string;
}

export const getCart = async (): Promise<CartResponse> => {
  const response = await api.get<CartResponse>("/cart");

  return response.data;
};

export const addToCart = async (
  productId: string,
  quantity: number,
): Promise<CartResponse> => {
  const response = await api.post<CartResponse>("/cart/items", {
    productId,
    quantity,
  });

  return response.data;
};

export const updateCartItem = async (
  productId: string,
  quantity: number,
): Promise<CartResponse> => {
  const response = await api.patch<CartResponse>(
    `/cart/items/${productId}`,
    {
      quantity,
    },
  );

  return response.data;
};

export const removeFromCart = async (
  productId: string,
): Promise<CartResponse> => {
  const response = await api.delete<CartResponse>(
    `/cart/items/${productId}`,
  );

  return response.data;
};

export const clearCart = async (): Promise<CartResponse> => {
  const response = await api.delete<CartResponse>("/cart");

  return response.data;
};