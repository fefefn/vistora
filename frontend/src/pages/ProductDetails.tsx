import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { useState } from 'react'
import { getProductBySlug } from '@/services/product.service'
import { addToCart } from '@/services/cart.service'

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>()

  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  // Cart states
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug as string),
    enabled: Boolean(slug),
  })

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
          <span className="font-medium">Loading product...</span>
        </div>
      </main>
    )
  }

  if (isError || !data?.data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Product not found
          </h1>

          <p className="mt-2 text-slate-500">
            The product you're looking for doesn't exist.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </div>
      </main>
    )
  }

  const product = data.data

  const image =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30'

  const hasDiscount =
    Boolean(product.compareAtPrice) &&
    product.compareAtPrice! > product.price

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) /
          product.compareAtPrice!) *
          100,
      )
    : 0

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((current) => current + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1)
    }
  }

  // Add product to real backend cart
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      setCartMessage('')
      setCartError('')

      await addToCart(product._id, quantity)

      setCartMessage(
        `${quantity} × ${product.name} added to cart.`,
      )
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Unable to add product to cart.'

      setCartError(message)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back to Shop */}
        <Link
          to="/shop"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid lg:grid-cols-2">
            {/* Product Image */}
            <div className="bg-slate-100 p-6 sm:p-10">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                <img
                  src={image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />

                {/* Discount */}
                {hasDiscount && (
                  <span className="absolute left-4 top-4 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
                    {discountPercent}% OFF
                  </span>
                )}

                {/* Out of Stock */}
                {product.stock <= 0 && (
                  <span className="absolute right-4 top-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                    OUT OF STOCK
                  </span>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
              {/* Brand */}
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
                {product.brand || product.category}
              </p>

              {/* Product Name */}
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                  <span className="text-sm font-bold text-amber-700">
                    {product.rating.toFixed(1)}
                  </span>
                </div>

                <span className="text-sm text-slate-500">
                  Customer rating
                </span>
              </div>

              {/* Price */}
              <div className="mt-7 flex items-end gap-3">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>

                {hasDiscount && (
                  <span className="mb-1 text-lg text-slate-400 line-through">
                    ₹
                    {product.compareAtPrice?.toLocaleString(
                      'en-IN',
                    )}
                  </span>
                )}
              </div>

              <div className="mt-6 h-px bg-slate-200" />

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Description
                </h2>

                <p className="mt-2 leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>

              {/* Stock */}
              <div className="mt-6 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    product.stock > 0
                      ? 'bg-emerald-500'
                      : 'bg-red-500'
                  }`}
                />

                <span
                  className={`text-sm font-semibold ${
                    product.stock > 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} items available`
                    : 'Currently out of stock'}
                </span>
              </div>

              {/* Cart Section */}
              {product.stock > 0 && (
                <div className="mt-8">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Quantity */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 sm:w-36">
                      <button
                        onClick={decreaseQuantity}
                        disabled={
                          quantity <= 1 || isAddingToCart
                        }
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="font-bold text-slate-900">
                        {quantity}
                      </span>

                      <button
                        onClick={increaseQuantity}
                        disabled={
                          quantity >= product.stock ||
                          isAddingToCart
                        }
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAddingToCart ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </button>

                    {/* Wishlist */}
                    <button
                      onClick={() =>
                        setIsWishlisted((current) => !current)
                      }
                      disabled={isAddingToCart}
                      className={`flex items-center justify-center rounded-xl border px-5 py-3.5 transition ${
                        isWishlisted
                          ? 'border-red-200 bg-red-50 text-red-500'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isWishlisted ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Cart Success Message */}
                  {cartMessage && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-sm font-semibold text-emerald-700">
                        âœ“ {cartMessage}
                      </p>

                      <Link
                        to="/cart"
                        className="mt-1 inline-block text-sm font-bold text-emerald-800 underline"
                      >
                        View Cart
                      </Link>
                    </div>
                  )}

                  {/* Cart Error Message */}
                  {cartError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-sm font-semibold text-red-700">
                        {cartError}
                      </p>

                      {cartError
                        .toLowerCase()
                        .includes('authentication') && (
                        <Link
                          to="/login"
                          className="mt-1 inline-block text-sm font-bold text-red-800 underline"
                        >
                          Login to continue
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Product Details */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-bold capitalize text-slate-800">
                    {product.category}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Brand
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {product.brand || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}

export default ProductDetails



