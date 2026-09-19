import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from '@/services/cart.service'

const Cart = () => {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string
      quantity: number
    }) => updateCartItem(productId, quantity),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart'],
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (productId: string) =>
      removeFromCart(productId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart'],
      })
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearCart,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart'],
      })
    },
  })

  if (isLoading) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
            <span className="font-medium">
              Loading your cart...
            </span>
          </div>
        </div>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
              <ShoppingCart className="h-10 w-10 text-red-500" />
            </div>

            <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
              Unable to load cart
            </h1>

            <p className="mt-2 text-slate-500">
              Please login and try again.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => refetch()}
                className="rounded-xl bg-brand-600 px-5 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Try Again
              </button>

              <Link
                to="/shop"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Shop
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const cart = data?.data
  const items = cart?.items ?? []

  const subtotal = items.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0,
  )

  const shipping = subtotal > 0 ? 0 : 0
  const total = subtotal + shipping

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const isUpdating =
    updateMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending

  // Empty Cart
  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg text-center"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-50">
              <ShoppingCart className="h-12 w-12 text-brand-600" />
            </div>

            <h1 className="mt-7 text-3xl font-extrabold text-slate-900">
              Your Cart is Empty
            </h1>

            <p className="mt-3 leading-7 text-slate-500">
              Looks like you haven't added anything to your
              cart yet. Explore our products and find something
              you love.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
            >
              <ShoppingCart className="h-5 w-5" />
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
                Shopping Bag
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Your Cart
              </h1>

              <p className="mt-2 text-slate-500">
                {totalItems}{' '}
                {totalItems === 1 ? 'item' : 'items'} in your
                cart
              </p>
            </div>

            <button
              onClick={() => clearMutation.mutate()}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              {clearMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear Cart
            </button>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const product = item.product
              const image =
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30'

              const itemTotal =
                product.price * item.quantity

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      to={`/product/${product.slug}`}
                      className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-36"
                    >
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                            {product.brand ||
                              product.category}
                          </p>

                          <Link
                            to={`/product/${product.slug}`}
                            className="mt-1 block text-lg font-bold text-slate-900 transition hover:text-brand-600"
                          >
                            {product.name}
                          </Link>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() =>
                            removeMutation.mutate(
                              product._id,
                            )
                          }
                          disabled={isUpdating}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Remove item"
                        >
                          {removeMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-base font-extrabold text-slate-900">
                        {String.fromCharCode(0x20B9)}                        {product.price.toLocaleString(
                          'en-IN',
                        )}
                      </p>

                      {/* Quantity + Total */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                productId: product._id,
                                quantity: Math.max(
                                  1,
                                  item.quantity - 1,
                                ),
                              })
                            }
                            disabled={
                              item.quantity <= 1 ||
                              isUpdating
                            }
                            className="rounded-lg p-2 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="min-w-10 text-center text-sm font-extrabold text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                productId: product._id,
                                quantity: Math.min(
                                  product.stock,
                                  item.quantity + 1,
                                ),
                              })
                            }
                            disabled={
                              item.quantity >=
                                product.stock ||
                              isUpdating
                            }
                            className="rounded-lg p-2 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            Item total
                          </p>

                          <p className="text-lg font-extrabold text-slate-900">
                            {String.fromCharCode(0x20B9)}                            {itemTotal.toLocaleString(
                              'en-IN',
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Order Summary */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24"
          >
            <h2 className="text-xl font-extrabold text-slate-900">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Subtotal ({totalItems}{' '}
                  {totalItems === 1 ? 'item' : 'items'})
                </span>

                <span className="font-bold text-slate-900">
                  {String.fromCharCode(8377)}{total.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping</span>

                <span className="font-bold text-emerald-600">
                  FREE
                </span>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-extrabold text-slate-900">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-brand-600">
                  {String.fromCharCode(8377)}{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout */}
            <Link
              to="/checkout"
              className="mt-7 block w-full rounded-xl bg-brand-600 px-6 py-3.5 text-center font-bold text-white transition hover:bg-brand-700"
            >
              Checkout
            </Link>

            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              Secure checkout and payment integration will be
              added in the next phase.
            </p>

            <Link
              to="/shop"
              className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 transition hover:text-brand-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </motion.aside>
        </div>
      </div>
    </main>
  )
}

export default Cart



