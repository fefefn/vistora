import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  MapPin,
  Package,
  RefreshCcw,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react'
import api from '@/services/api'

interface Product {
  _id: string
  name: string
  price: number
  images?: string[]
}

interface OrderItem {
  product: Product
  quantity: number
  price: number
}

interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

type StatusFilter = 'all' | OrderStatus

const statusOptions: {
  value: StatusFilter
  label: string
}[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Order Placed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

const statusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Order Placed'
    case 'processing':
      return 'Processing'
    case 'shipped':
      return 'Shipped'
    case 'out_for_delivery':
      return 'Out for Delivery'
    case 'delivered':
      return 'Delivered'
    case 'cancelled':
      return 'Cancelled'
    case 'refunded':
      return 'Refunded'
    default:
      return status.replace(/_/g, ' ')
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-700'
    case 'shipped':
      return 'bg-blue-100 text-blue-700'
    case 'out_for_delivery':
      return 'bg-indigo-100 text-indigo-700'
    case 'processing':
      return 'bg-yellow-100 text-yellow-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    case 'refunded':
      return 'bg-purple-100 text-purple-700'
    case 'pending':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const formatCurrency = (amount: number) => {
  return `${String.fromCharCode(0x20b9)}${amount.toLocaleString('en-IN')}`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatPaymentMethod = (method: string) => {
  if (method === 'cod') return 'Cash on Delivery'
  if (method === 'razorpay') return 'Razorpay'
  return method
}

// Protect the UI from legacy/malformed orderStatus values such as `refunded"`.
const normalizeOrderStatus = (status: string): OrderStatus => {
  const normalized = status
    .trim()
    .replace(/^["']+|["']+$/g, '') as OrderStatus

  return normalized
}

const timelineStatuses: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
]

const getTimelineIndex = (status: string) => {
  return timelineStatuses.indexOf(status as OrderStatus)
}

const Timeline = ({ status }: { status: string }) => {
  if (status === 'cancelled' || status === 'refunded') {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              status === 'cancelled'
                ? 'bg-red-100 text-red-600'
                : 'bg-purple-100 text-purple-600'
            }`}
          >
            {status === 'cancelled' ? (
              <X className="h-5 w-5" />
            ) : (
              <RefreshCcw className="h-5 w-5" />
            )}
          </div>

          <div>
            <p className="font-bold text-slate-900">
              {statusLabel(status)}
            </p>
            <p className="text-sm text-slate-500">
              {status === 'cancelled'
                ? 'This order has been cancelled.'
                : 'This order has been refunded.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentIndex = getTimelineIndex(status)

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Order Progress
          </p>
          <p className="mt-1 font-black text-slate-900">
            {statusLabel(status)}
          </p>
        </div>

        {status === 'delivered' ? (
          <div className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
            Delivered
          </div>
        ) : (
          <Truck className="h-5 w-5 text-brand-600" />
        )}
      </div>

      <div className="grid grid-cols-5 gap-1">
        {timelineStatuses.map((timelineStatus, index) => {
          const completed = index <= currentIndex
          const active = index === currentIndex

          return (
            <div key={timelineStatus} className="relative">
              {index < timelineStatuses.length - 1 && (
                <div
                  className={`absolute left-1/2 top-4 h-0.5 w-full ${
                    index < currentIndex
                      ? 'bg-brand-500'
                      : 'bg-slate-200'
                  }`}
                />
              )}

              <div className="relative z-10 flex justify-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    completed
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-300 bg-white text-slate-300'
                  } ${
                    active ? 'ring-4 ring-brand-100' : ''
                  }`}
                >
                  {completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>
              </div>

              <p
                className={`mt-2 text-center text-[10px] font-bold leading-4 sm:text-xs ${
                  completed
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {statusLabel(timelineStatus)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] =
    useState<StatusFilter>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [refundOrder, setRefundOrder] = useState<Order | null>(null)
  const [refundReason, setRefundReason] = useState("")
  const [refundDetails, setRefundDetails] = useState("")
  const [refundSubmitting, setRefundSubmitting] = useState(false)
  const [refundError, setRefundError] = useState("")
  const [refundSuccess, setRefundSuccess] = useState("")

  const loadOrders = async () => {
    try {
      setError('')

      const response = await api.get('/orders')

      const rawOrders = response.data?.data || []

      setOrders(
        rawOrders.map((order: Order) => ({
          ...order,
          orderStatus: normalizeOrderStatus(order.orderStatus),
        })),
      )
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load your orders.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const submitRefundRequest = async () => {
    if (!refundOrder) return

    if (!refundReason) {
      setRefundError("Please select a refund reason.")
      return
    }

    setRefundSubmitting(true)
    setRefundError("")
    setRefundSuccess("")

    try {
      const reasonText = refundDetails.trim()
        ? `${refundReason}: ${refundDetails.trim()}`
        : refundReason

      await api.post("/refunds", {
        orderId: refundOrder._id,
        reason: reasonText,
      })

      setRefundSuccess(
        "Refund request submitted successfully.",
      )

      setRefundReason("")
      setRefundDetails("")

      setTimeout(() => {
        setRefundOrder(null)
        setRefundSuccess("")
      }, 1800)
    } catch (err: any) {
      setRefundError(
        err?.response?.data?.message ||
          "Unable to submit refund request.",
      )
    } finally {
      setRefundSubmitting(false)
    }
  }
  useEffect(() => {
    loadOrders()
  }, [])

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(
        (order) => order.orderStatus === 'pending',
      ).length,
      processing: orders.filter(
        (order) => order.orderStatus === 'processing',
      ).length,
      shipped: orders.filter(
        (order) => order.orderStatus === 'shipped',
      ).length,
      out_for_delivery: orders.filter(
        (order) => order.orderStatus === 'out_for_delivery',
      ).length,
      delivered: orders.filter(
        (order) => order.orderStatus === 'delivered',
      ).length,
      cancelled: orders.filter(
        (order) => order.orderStatus === 'cancelled',
      ).length,
      refunded: orders.filter(
        (order) => order.orderStatus === 'refunded',
      ).length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return orders
    }

    return orders.filter(
      (order) => order.orderStatus === activeFilter,
    )
  }, [orders, activeFilter])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto h-10 w-10 animate-pulse text-brand-500" />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading your orders...
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/shop"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
                <Package className="h-4 w-4" />
                My Orders
              </div>

              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
                Your Orders
              </h1>

              <p className="mt-2 text-slate-500">
                Track your purchases and delivery status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true)
                loadOrders()
              }}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                className={`h-4 w-4 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Status Tabs */}
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2">
            {statusOptions.map((option) => {
              const active = activeFilter === option.value
              const count =
                counts[option.value as keyof typeof counts]

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveFilter(option.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Empty state */}
        {!error && filteredOrders.length === 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <ShoppingBag className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              {activeFilter === 'all'
                ? 'No orders yet'
                : `No ${statusLabel(activeFilter).toLowerCase()} orders`}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {activeFilter === 'all'
                ? "You haven't placed any orders yet. Start shopping and your orders will appear here."
                : 'Orders matching this status will appear here.'}
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-xl bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-700"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders */}
        <div className="mt-4 space-y-6">
          {filteredOrders.map((order) => (
            <article
              key={order._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Header */}
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Order Number
                    </p>

                    <p className="mt-1 text-base font-black text-slate-900">
                      {order.orderNumber}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Ordered on {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusClass(
                      order.orderStatus,
                    )}`}
                  >
                    {statusLabel(order.orderStatus)}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* Timeline */}
                <Timeline status={order.orderStatus} />

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
                  {/* Products */}
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order._id}-${item.product?._id || index}`}
                        className="flex gap-4"
                      >
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <Package className="h-7 w-7" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900">
                            {item.product?.name || 'Product'}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Quantity: {item.quantity}
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>

                        <p className="font-black text-slate-900">
                          {formatCurrency(
                            item.price * item.quantity,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      Order total
                    </div>

                    <div className="my-4 border-t border-slate-200" />

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-bold text-slate-900">
                          {formatCurrency(order.subtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Shipping
                        </span>

                        <span className="font-bold text-green-600">
                          {order.shipping === 0
                            ? 'FREE'
                            : formatCurrency(order.shipping)}
                        </span>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between">
                          <span className="font-black text-slate-900">
                            Total
                          </span>

                          <span className="text-lg font-black text-brand-600">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Payment
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {formatPaymentMethod(order.paymentMethod)}
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold capitalize ${
                          order.paymentStatus === 'paid'
                            ? 'text-green-600'
                            : order.paymentStatus === 'failed'
                              ? 'text-red-600'
                              : 'text-slate-500'
                        }`}
                      >
                        Payment status: {order.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Delivery Address
                      </p>

                      <p className="mt-2 font-bold text-slate-800">
                        {order.shippingAddress.fullName}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {order.shippingAddress.address},{' '}
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} -{' '}
                        {order.shippingAddress.pincode}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Action */}
                {order.orderStatus === 'delivered' &&
                  order.paymentStatus === 'paid' && (
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setRefundOrder(order)
                          setRefundReason("")
                          setRefundDetails("")
                          setRefundError("")
                          setRefundSuccess("")
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Request Refund
                      </button>
                    </div>
                  )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Refund Request Modal */}
      {refundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                    Refund Request
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    Request a refund
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Order {refundOrder.orderNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!refundSubmitting) {
                      setRefundOrder(null)
                      setRefundError("")
                      setRefundSuccess("")
                    }
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close refund dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Refund amount
                  </span>

                  <span className="text-lg font-black text-slate-900">
                    {formatCurrency(refundOrder.total)}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="refund-reason"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Why are you requesting a refund?
                </label>

                <select
                  id="refund-reason"
                  value={refundReason}
                  onChange={(event) => setRefundReason(event.target.value)}
                  disabled={refundSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
                >
                  <option value="">Select a reason</option>
                  <option value="Product is damaged">
                    Product is damaged
                  </option>
                  <option value="Product is defective">
                    Product is defective
                  </option>
                  <option value="Wrong product received">
                    Wrong product received
                  </option>
                  <option value="Product does not match description">
                    Product does not match description
                  </option>
                  <option value="Changed my mind">
                    Changed my mind
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="refund-details"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Additional details
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="refund-details"
                  value={refundDetails}
                  onChange={(event) =>
                    setRefundDetails(event.target.value)
                  }
                  disabled={refundSubmitting}
                  rows={4}
                  maxLength={400}
                  placeholder="Tell us more about the issue..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {refundDetails.length}/400
                </p>
              </div>

              {refundError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {refundError}
                </div>
              )}

              {refundSuccess && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  {refundSuccess}
                </div>
              )}

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                Your request will be reviewed by the Vistora team.
                Refunds are processed after approval.
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => {
                  if (!refundSubmitting) {
                    setRefundOrder(null)
                    setRefundError("")
                    setRefundSuccess("")
                  }
                }}
                disabled={refundSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitRefundRequest}
                disabled={refundSubmitting || !!refundSuccess}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refundSubmitting ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4" />
                    Submit Refund Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default Orders



