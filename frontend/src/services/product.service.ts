import api from './api'

export type ProductGender =
  | 'men'
  | 'women'
  | 'boys'
  | 'girls'
  | 'kids'
  | 'unisex'

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  gender: ProductGender
  category: string
  subcategory?: string
  brand?: string
  colors: string[]
  fabric?: string
  sizes: string[]
  images: string[]
  stock: number
  rating: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ProductResponse {
  success: boolean
  data: Product[]
  pagination: ProductPagination
}

export type ProductSort =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'popular'

export interface ProductFilters {
  deals?: boolean
  gender?: string
  category?: string
  subcategory?: string
  brand?: string
  color?: string
  fabric?: string
  size?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sort?: ProductSort
  page?: number
  limit?: number
}

export const getProducts = async (
  filters: ProductFilters = {},
): Promise<ProductResponse> => {
  const response = await api.get<ProductResponse>('/products', {
    params: filters,
  })

  return response.data
}

export const getProductBySlug = async (
  slug: string,
): Promise<{ success: boolean; data: Product }> => {
  const response = await api.get<{ success: boolean; data: Product }>(
    `/products/${slug}`,
  )

  return response.data
}

