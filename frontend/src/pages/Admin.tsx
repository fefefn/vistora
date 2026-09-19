import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  IndianRupee,
  LayoutDashboard,
  Package,
  RefreshCw,
  Save,
  ShoppingBag,
  X,
} from 'lucide-react'
import api from '@/services/api'

interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  category: string
  brand?: string
  images: string[]
  stock: number
  rating: number
  isActive: boolean
  createdAt: string
}

interface OrderItem {
  product:
    | {
        _id: string
        name: string
        price: number
        images?: string[]
      }
    | string
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderNumber: string
  user:
    | {
        _id: string
        name?: string
        email?: string
      }
    | string
  items: OrderItem[]
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
  createdAt: string
}

interface AdminRefund {
  _id: string
  user: { _id: string; name?: string; email?: string } | string
  order: { _id: string; orderNumber: string; total: number; paymentMethod: string; paymentStatus: string; createdAt: string } | string
  amount: number
  reason: string
  status: 'requested' | 'approved' | 'rejected' | 'processing' | 'completed'
  adminNote?: string
  processedAt?: string
  createdAt: string
  updatedAt: string
}

type RefundFilter = 'all' | 'requested' | 'approved' | 'processing' | 'completed' | 'rejected'

interface ProductForm {
  name: string
  slug: string
  description: string
  price: string
  compareAtPrice: string
  category: string
  brand: string
  image: string
  stock: string
}

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: '',
  brand: '',
  image: '',
  stock: '',
}

const formatCurrency = (value: number) =>
  `${String.fromCharCode(0x20b9)}${value.toLocaleString('en-IN')}`

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const isValidImageUrl = (value: string) => {
  if (!value.trim()) return true

  try {
    const url = new URL(value.trim())

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    )
  } catch {
    return false
  }
}

const getProductName = (product: OrderItem['product']) => {
  if (typeof product === 'string') {
    return 'Product'
  }

  return product?.name || 'Product'
}

const getCustomerName = (user: Order['user']) => {
  if (typeof user === 'string') {
    return 'Customer'
  }

  return user?.name || 'Customer'
}

const getCustomerEmail = (user: Order['user']) => {
  if (typeof user === 'string') {
    return ''
  }

  return user?.email || ''
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [activeSection, setActiveSection] = useState<
    'overview' | 'products' | 'orders' | 'refunds'
  >('overview')

  const [refunds, setRefunds] = useState<AdminRefund[]>([])
  const [loadingRefunds, setLoadingRefunds] = useState(false)
  const [updatingRefundId, setUpdatingRefundId] = useState<string | null>(null)
  const [refundFilter, setRefundFilter] = useState<RefundFilter>('all')
  const [refundNotes, setRefundNotes] = useState<Record<string, string>>({})

  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null)

  const [productForm, setProductForm] =
    useState<ProductForm>(emptyForm)

  const [savingProduct, setSavingProduct] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [productStockFilter, setProductStockFilter] = useState<
    'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  >('all')

  const [productSort, setProductSort] = useState<
    'default' | 'stock_high' | 'stock_low' | 'name_az'
  >('default')

  const [productStatusFilter, setProductStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all')

  const [productPage, setProductPage] = useState(1)

  const productsPerPage = 10

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null)

  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'all' | Order['orderStatus']
  >('all')

  const [orderPaymentFilter, setOrderPaymentFilter] = useState<
    'all' | 'pending' | 'paid' | 'failed' | 'refunded'
  >('all')

  const [orderPaymentMethodFilter, setOrderPaymentMethodFilter] =
    useState<'all' | 'cod' | 'razorpay'>('all')

  const [orderSort, setOrderSort] = useState<
    'default' | 'newest' | 'oldest' | 'highest' | 'lowest'
  >('default')

  const [orderPage, setOrderPage] = useState(1)
  const [totalOrderCount, setTotalOrderCount] = useState(0)
  const [totalOrderPages, setTotalOrderPages] = useState(1)

  const ordersPerPage = 10

  const loadDashboard = async () => {
    try {
      setError('')

      const [productsResponse, ordersResponse] =
        await Promise.all([
          api.get('/products/admin/all'),
          api.get('/orders/admin/all', {
            params: {
              page: orderPage,
              limit: ordersPerPage,
              search: orderSearch.trim() || undefined,
              status: orderStatusFilter,
              paymentStatus: orderPaymentFilter,
              paymentMethod: orderPaymentMethodFilter,
              sort: orderSort === 'default' ? 'newest' : orderSort,
            },
          }),
        ])

      setProducts(productsResponse.data?.data || [])
      setOrders(ordersResponse.data?.data || [])

      const pagination = ordersResponse.data?.pagination

      setTotalOrderCount(pagination?.total || 0)
      setTotalOrderPages(Math.max(1, pagination?.totalPages || 1))

      if (pagination?.page && pagination.page !== orderPage) {
        setOrderPage(pagination.page)
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load admin dashboard.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [
    orderPage,
    orderSearch,
    orderStatusFilter,
    orderPaymentFilter,
    orderPaymentMethodFilter,
    orderSort,
  ])

  const refreshDashboard = async () => {
    setRefreshing(true)
    await loadDashboard()
  }

  const loadRefunds = async () => {
    try {
      setLoadingRefunds(true)
      setError('')
      const response = await api.get('/refunds/admin/all')
      const data: AdminRefund[] = response.data?.data || []
      setRefunds(data)
      setRefundNotes(Object.fromEntries(data.map((refund) => [refund._id, refund.adminNote || ''])))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load refund requests.')
    } finally {
      setLoadingRefunds(false)
    }
  }

  const updateRefundStatus = async (refundId: string, status: AdminRefund['status']) => {
    try {
      setUpdatingRefundId(refundId)
      setError('')
      setSuccess('')
      const response = await api.patch(`/refunds/admin/${refundId}/status`, {
        status,
        adminNote: refundNotes[refundId]?.trim() || undefined,
      })
      const updated = response.data?.data
      setRefunds((current) => current.map((refund) => refund._id === refundId ? { ...refund, ...(updated || {}), status: updated?.status || status, adminNote: updated?.adminNote ?? refundNotes[refundId] ?? refund.adminNote } : refund))
      setSuccess(response.data?.message || 'Refund request updated successfully.')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update refund request.')
    } finally {
      setUpdatingRefundId(null)
    }
  }

  const refundCounts = useMemo(() => ({
    all: refunds.length,
    requested: refunds.filter((r) => r.status === 'requested').length,
    approved: refunds.filter((r) => r.status === 'approved').length,
    processing: refunds.filter((r) => r.status === 'processing').length,
    completed: refunds.filter((r) => r.status === 'completed').length,
    rejected: refunds.filter((r) => r.status === 'rejected').length,
  }), [refunds])

  const filteredRefunds = useMemo(() => refundFilter === 'all' ? refunds : refunds.filter((r) => r.status === refundFilter), [refundFilter, refunds])

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((order) => order.orderStatus !== 'cancelled')
        .reduce((total, order) => total + order.total, 0),
    [orders],
  )

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.orderStatus === 'pending',
      ).length,
    [orders],
  )

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive).length,
    [products],
  )

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) => product.isActive && product.stock <= 5,
      ).length,
    [products],
  )

  const deliveredOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.orderStatus === 'delivered',
      ).length,
    [orders],
  )

  const cancelledOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.orderStatus === 'cancelled',
      ).length,
    [orders],
  )

  const paidOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.paymentStatus === 'paid',
      ).length,
    [orders],
  )

  const averageOrderValue = useMemo(
    () => (orders.length > 0 ? totalRevenue / orders.filter(
      (order) => order.orderStatus !== 'cancelled',
    ).length : 0),
    [orders, totalRevenue],
  )

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase()

    const filtered = products.filter((product) => {
      const matchesStatus =
        productStatusFilter === 'all' ||
        (productStatusFilter === 'active' && product.isActive) ||
        (productStatusFilter === 'inactive' && !product.isActive)

      if (!matchesStatus) {
        return false
      }

      const matchesStock =
        productStockFilter === 'all' ||
        (productStockFilter === 'in_stock' && product.stock > 5) ||
        (productStockFilter === 'low_stock' &&
          product.stock > 0 &&
          product.stock <= 5) ||
        (productStockFilter === 'out_of_stock' &&
          product.stock === 0)

      if (!matchesStock) {
        return false
      }

      if (!search) {
        return true
      }

      const name = product.name?.toLowerCase() || ''
      const category = product.category?.toLowerCase() || ''
      const brand = product.brand?.toLowerCase() || ''

      return (
        name.includes(search) ||
        category.includes(search) ||
        brand.includes(search)
      )
    })

    return [...filtered].sort((a, b) => {
      if (productSort === 'stock_high') {
        return b.stock - a.stock
      }

      if (productSort === 'stock_low') {
        return a.stock - b.stock
      }

      if (productSort === 'name_az') {
        return a.name.localeCompare(b.name)
      }

      return 0
    })
  }, [
    products,
    productSearch,
    productStockFilter,
    productSort,
    productStatusFilter,
  ])


  const totalProductPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  )

  const paginatedProducts = useMemo(() => {
    const startIndex = (productPage - 1) * productsPerPage

    return filteredProducts.slice(
      startIndex,
      startIndex + productsPerPage,
    )
  }, [
    filteredProducts,
    productPage,
    productsPerPage,
  ])

  useEffect(() => {
    if (productPage > totalProductPages) {
      setProductPage(totalProductPages)
    }
  }, [productPage, totalProductPages])




  const filteredOrders = orders
  const paginatedOrders = orders


  const openCreateProduct = () => {
    setEditingProduct(null)
    setProductForm(emptyForm)
    setError('')
    setShowProductModal(true)
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)

    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice
        ? String(product.compareAtPrice)
        : '',
      category: product.category,
      brand: product.brand || '',
      image: product.images?.[0] || '',
      stock: String(product.stock),
    })

    setError('')
    setShowProductModal(true)
  }

  const closeProductModal = () => {
    if (savingProduct) return

    setShowProductModal(false)
    setEditingProduct(null)
    setProductForm(emptyForm)
  }

  const handleProductChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target

    setProductForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleProductSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault()

    const name = productForm.name.trim()
    const slug = productForm.slug.trim().toLowerCase()
    const description = productForm.description.trim()
    const category = productForm.category.trim().toLowerCase()
    const price = Number(productForm.price)
    const compareAtPrice = productForm.compareAtPrice
      ? Number(productForm.compareAtPrice)
      : undefined
    const stock = Number(productForm.stock)

    if (!name) {
      setError('Product name is required.')
      return
    }

    if (!slug) {
      setError('Product slug is required.')
      return
    }

    if (!description) {
      setError('Product description is required.')
      return
    }

    if (!category) {
      setError('Product category is required.')
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Product price must be greater than 0.')
      return
    }

    if (
      compareAtPrice !== undefined &&
      (!Number.isFinite(compareAtPrice) ||
        compareAtPrice < price)
    ) {
      setError(
        'Compare-at price must be greater than or equal to the selling price.',
      )
      return
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a whole number greater than or equal to 0.')
      return
    }

    const imageUrl = productForm.image.trim()

    if (!isValidImageUrl(imageUrl)) {
      setError('Image URL must be a valid HTTP or HTTPS URL.')
      return
    }

    setSavingProduct(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        name,
        slug,
        description,
        price,
        compareAtPrice,
        category,
        brand: productForm.brand.trim() || undefined,
        images: imageUrl
          ? [productForm.image.trim()]
          : [],
        stock,
      }

      if (editingProduct) {
        const response = await api.patch(
          `/products/${editingProduct._id}`,
          payload,
        )

        setSuccess(
          response.data?.message ||
            'Product updated successfully.',
        )
      } else {
        const response = await api.post(
          '/products',
          payload,
        )

        setSuccess(
          response.data?.message ||
            'Product created successfully.',
        )
      }

      setShowProductModal(false)
      setEditingProduct(null)
      setProductForm(emptyForm)

      await loadDashboard()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to save product.',
      )
    } finally {
      setSavingProduct(false)
    }
  }

  const deactivateProduct = async (product: Product) => {
    const nextIsActive = !product.isActive

    const confirmed = window.confirm(
      nextIsActive
        ? `Activate "${product.name}"?`
        : `Deactivate "${product.name}"?`,
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      const response = await api.patch(
        `/products/${product._id}`,
        {
          isActive: nextIsActive,
        },
      )

      setSuccess(
        response.data?.message ||
          (nextIsActive
            ? 'Product activated successfully.'
            : 'Product deactivated successfully.'),
      )

      await loadDashboard()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (nextIsActive
            ? 'Unable to activate product.'
            : 'Unable to deactivate product.'),
      )
    }
  }

  const getAllowedNextOrderStatuses = (
    status: Order['orderStatus'],
  ): Order['orderStatus'][] => {
    switch (status) {
      case 'pending':
        return ['processing', 'cancelled']
      case 'processing':
        return ['shipped', 'cancelled']
      case 'shipped':
        return ['delivered']
      case 'delivered':
        return []
      case 'cancelled':
        return []
      default:
        return []
    }
  }
  const updateOrderStatus = async (
    orderId: string,
    status: Order['orderStatus'],
  ) => {
    const currentOrder = orders.find(
      (order) => order._id === orderId,
    )

    if (!currentOrder) {
      setError('Order not found.')
      return
    }

    if (
      status === 'cancelled' &&
      currentOrder.orderStatus !== 'cancelled'
    ) {
      const confirmed = window.confirm(
        `Cancel order "${currentOrder.orderNumber}"? This action will restore the purchased product stock.`,
      )

      if (!confirmed) {
        return
      }
    }

    if (status === currentOrder.orderStatus) {
      return
    }

    try {
      setUpdatingOrderId(orderId)
      setError('')
      setSuccess('')

      const response = await api.patch(
        `/orders/admin/${orderId}/status`,
        {
          status,
        },
      )

      const updatedOrder = response.data?.data

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId
            ? {
                ...order,
                ...(updatedOrder || {}),
                orderStatus:
                  updatedOrder?.orderStatus || status,
                paymentStatus:
                  updatedOrder?.paymentStatus || order.paymentStatus,
              }
            : order,
        ),
      )

      setSuccess(
        response.data?.message ||
          'Order status updated successfully.',
      )
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to update order status.',
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="font-semibold">
            Loading admin dashboard...
          </span>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
              <LayoutDashboard className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900">
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your Vistora store.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={refreshDashboard}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {[
          {
            key: 'overview' as const,
            label: 'Overview',
            icon: LayoutDashboard,
          },
          {
            key: 'products' as const,
            label: 'Products',
            icon: Package,
          },
          {
            key: 'orders' as const,
            label: 'Orders',
            icon: ShoppingBag,
          },
          {
            key: 'refunds' as const,
            label: 'Refunds',
            icon: RefreshCw,
          },
        ].map((item) => {
          const Icon = item.icon
          const active = activeSection === item.key

          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key)
                if (item.key === 'refunds') loadRefunds()
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Overview */}
      {activeSection === 'overview' && (
        <section>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  PRODUCTS
                </span>
              </div>

              <p className="mt-5 text-3xl font-black text-slate-900">
                {activeProducts}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Active products
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  ORDERS
                </span>
              </div>

              <p className="mt-5 text-3xl font-black text-slate-900">
                {orders.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Total orders
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  PENDING
                </span>
              </div>

              <p className="mt-5 text-3xl font-black text-slate-900">
                {pendingOrders}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Orders awaiting processing
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-green-50 p-3 text-green-600">
                  <IndianRupee className="h-5 w-5" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  REVENUE
                </span>
              </div>

              <p className="mt-5 text-3xl font-black text-slate-900">
                {formatCurrency(totalRevenue)}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Non-cancelled orders
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400">
                DELIVERED
              </p>
              <p className="mt-3 text-2xl font-black text-slate-900">
                {deliveredOrders}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Successfully delivered
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400">
                PAID ORDERS
              </p>
              <p className="mt-3 text-2xl font-black text-slate-900">
                {paidOrders}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Payments collected
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400">
                CANCELLED
              </p>
              <p className="mt-3 text-2xl font-black text-slate-900">
                {cancelledOrders}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Cancelled orders
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400">
                AVG. ORDER VALUE
              </p>
              <p className="mt-3 text-2xl font-black text-slate-900">
                {formatCurrency(averageOrderValue)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Per non-cancelled order
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Recent Orders
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest customer orders
                  </p>
                </div>

                <button
                  onClick={() => setActiveSection('orders')}
                  className="text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  View all
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No orders yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {getCustomerName(order.user)} ·{' '}
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-slate-900">
                          {formatCurrency(order.total)}
                        </p>

                        <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                          {order.orderStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-900">
                  Inventory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Products that need attention
                </p>
              </div>

              {lowStockProducts === 0 ? (
                <div className="rounded-xl bg-green-50 p-5 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />

                  <p className="mt-2 font-bold text-green-700">
                    Inventory looks healthy
                  </p>

                  <p className="mt-1 text-sm text-green-600">
                    No active products have 5 or fewer units.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products
                    .filter(
                      (product) =>
                        product.isActive &&
                        product.stock <= 5,
                    )
                    .map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between rounded-xl bg-red-50 p-4"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-red-600">
                            Low stock
                          </p>
                        </div>

                        <span className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-black text-red-700">
                          {product.stock} left
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {activeSection === 'products' && (
        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage products and inventory.
              </p>
            </div>

            <button
              onClick={openCreateProduct}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              <Package className="h-4 w-4" />
              Add Product
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total Orders
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {orders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Pending Orders
              </p>
              <p className="mt-2 text-2xl font-black text-amber-600">
                {orders.filter(
                  (order) => order.orderStatus === 'pending',
                ).length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Paid Orders
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-600">
                {orders.filter(
                  (order) => order.paymentStatus === 'paid',
                ).length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Delivered Orders
              </p>
              <p className="mt-2 text-2xl font-black text-blue-600">
                {orders.filter(
                  (order) => order.orderStatus === 'delivered',
                ).length}
              </p>
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_200px_200px_200px]">
            <div>
              <label
                htmlFor="admin-product-search"
                className="sr-only"
              >
                Search products
              </label>
              <input
                id="admin-product-search"
                type="search"
                value={productSearch}
                onChange={(event) =>
                  setProductSearch(event.target.value)
                }
                placeholder="Search by product, category or brand..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label
                htmlFor="admin-product-stock"
                className="sr-only"
              >
                Filter products by stock
              </label>
              <select
                id="admin-product-stock"
                value={productStockFilter}
                onChange={(event) =>
                  setProductStockFilter(
                    event.target.value as
                      | 'all'
                      | 'in_stock'
                      | 'low_stock'
                      | 'out_of_stock',
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All stock</option>
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-product-status"
                className="sr-only"
              >
                Filter products by status
              </label>

              <select
                id="admin-product-status"
                value={productStatusFilter}
                onChange={(event) => {
                  setProductStatusFilter(
                    event.target.value as
                      | 'all'
                      | 'active'
                      | 'inactive',
                  )
                  setProductPage(1)
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-product-sort"
                className="sr-only"
              >
                Sort products
              </label>
              <select
                id="admin-product-sort"
                value={productSort}
                onChange={(event) =>
                  setProductSort(
                    event.target.value as
                      | 'default'
                      | 'stock_high'
                      | 'stock_low'
                      | 'name_az',
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="default">Sort: Default</option>
                <option value="stock_high">Stock: High to Low</option>
                <option value="stock_low">Stock: Low to High</option>
                <option value="name_az">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">
              Showing {filteredProducts.length} of {products.length} products
            </p>

            {(productSearch ||
              productStockFilter !== 'all' ||
              productStatusFilter !== 'all' ||
              productSort !== 'default') && (
              <button
                type="button"
                onClick={() => {
                  setProductSearch('')
                  setProductStockFilter('all')
                  setProductStatusFilter('all')
                  setProductSort('default')
                  setProductPage(1)
                }}
                className="text-sm font-bold text-brand-600 transition hover:text-brand-700"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 font-bold text-slate-700">
                  No products found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Product
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Category
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Price
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Stock
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <Package className="m-auto mt-3 h-6 w-6 text-slate-400" />
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-slate-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {product.brand || 'No brand'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-700">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-black text-slate-900">
                          {formatCurrency(product.price)}
                        </td>

                                                <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                                                        <span
                              className={'rounded-lg px-3 py-1.5 text-xs font-black ' +
                                (product.stock === 0
                                  ? 'bg-red-50 text-red-700'
                                  : product.stock <= 5
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700')}
                            >
                              {product.stock === 0
                                ? 'Out of stock'
                                : product.stock <= 5
                                  ? 'Low stock'
                                  : 'In stock'}
                            </span>

                            <span className="text-xs font-bold text-slate-500">
                              {product.stock} units
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                              product.isActive
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {product.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                openEditProduct(product)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deactivateProduct(product)
                              }
                              className={
                                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ' +
                                (product.isActive
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50')
                              }
                            >
                              {product.isActive ? (
                                <>
                                  <X className="h-3.5 w-3.5" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Activate
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    {filteredProducts.length === 0
                      ? 'No products found'
                      : `Showing ${
                          (productPage - 1) * productsPerPage + 1
                        }–${Math.min(
                          productPage * productsPerPage,
                          filteredProducts.length,
                        )} of ${filteredProducts.length} products`}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={productPage === 1}
                      onClick={() =>
                        setProductPage((page) => Math.max(1, page - 1))
                      }
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                      Page {productPage} of {totalProductPages}
                    </span>

                    <button
                      type="button"
                      disabled={productPage === totalProductPages}
                      onClick={() =>
                        setProductPage((page) =>
                          Math.min(totalProductPages, page + 1),
                        )
                      }
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Orders */}
      {activeSection === 'orders' && (
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-900">
              Orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer orders and delivery status.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total Orders
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {orders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Pending Orders
              </p>
              <p className="mt-2 text-2xl font-black text-amber-600">
                {orders.filter(
                  (order) => order.orderStatus === 'pending',
                ).length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Paid Orders
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-600">
                {orders.filter(
                  (order) => order.paymentStatus === 'paid',
                ).length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Delivered Orders
              </p>
              <p className="mt-2 text-2xl font-black text-blue-600">
                {orders.filter(
                  (order) => order.orderStatus === 'delivered',
                ).length}
              </p>
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_180px_180px_180px]">
            <div>
              <label
                htmlFor="admin-order-search"
                className="sr-only"
              >
                Search orders
              </label>
              <input
                id="admin-order-search"
                type="search"
                value={orderSearch}
                onChange={(event) => {
                  setOrderSearch(event.target.value)
                  setOrderPage(1)
                }}
                placeholder="Search by order number, customer name or email..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label
                htmlFor="admin-order-status"
                className="sr-only"
              >
                Filter orders by status
              </label>
              <select
                id="admin-order-status"
                value={orderStatusFilter}
                onChange={(event) => {
                  setOrderStatusFilter(
                    event.target.value as
                      | 'all'
                      | Order['orderStatus'],
                  )
                  setOrderPage(1)
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-order-payment"
                className="sr-only"
              >
                Filter orders by payment status
              </label>
              <select
                id="admin-order-payment"
                value={orderPaymentFilter}
                onChange={(event) => {
                  setOrderPaymentFilter(
                    event.target.value as
                      | 'all'
                      | 'pending'
                      | 'paid'
                      | 'failed'
                      | 'refunded',
                  )
                  setOrderPage(1)
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All payments</option>
                <option value="pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Payment Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-order-method"
                className="sr-only"
              >
                Filter orders by payment method
              </label>
              <select
                id="admin-order-method"
                value={orderPaymentMethodFilter}
                onChange={(event) => {
                  setOrderPaymentMethodFilter(
                    event.target.value as
                      | 'all'
                      | 'cod'
                      | 'razorpay',
                  )
                  setOrderPage(1)
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All methods</option>
                <option value="cod">COD</option>
                <option value="razorpay">Razorpay</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-order-sort"
                className="sr-only"
              >
                Sort orders
              </label>
              <select
                id="admin-order-sort"
                value={orderSort}
                onChange={(event) => {
                  setOrderSort(
                    event.target.value as
                      | 'default'
                      | 'newest'
                      | 'oldest'
                      | 'highest'
                      | 'lowest',
                  )
                  setOrderPage(1)
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="default">Sort: Default</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Value</option>
                <option value="lowest">Lowest Value</option>
              </select>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">
              Showing {orders.length === 0 ? 0 : (orderPage - 1) * ordersPerPage + 1}-{Math.min(orderPage * ordersPerPage, totalOrderCount)} of {totalOrderCount} orders
            </p>

            {(orderSearch ||
              orderStatusFilter !== 'all' ||
              orderPaymentFilter !== 'all' ||
              orderPaymentMethodFilter !== 'all' ||
              orderSort !== 'default') && (
              <button
                type="button"
                onClick={() => {
                  setOrderSearch('')
                  setOrderStatusFilter('all')
                  setOrderPaymentFilter('all')
                  setOrderPaymentMethodFilter('all')
                  setOrderSort('default')
                  setOrderPage(1)
                }}
                className="text-sm font-bold text-brand-600 transition hover:text-brand-700"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="space-y-5">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 font-bold text-slate-700">
                  No orders yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Orders will appear here when customers place them.
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 font-bold text-slate-700">
                  No matching orders
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setOrderSearch('')
                    setOrderStatusFilter('all')
                    setOrderPaymentFilter('all')
                    setOrderPaymentMethodFilter('all')
                    setOrderSort('default')
                    setOrderPage(1)
                  }}
                  className="mt-4 text-sm font-bold text-brand-600 transition hover:text-brand-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              paginatedOrders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-black text-slate-900">
                          {order.orderNumber}
                        </h3>

                        <span
                          className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase ${
                            order.orderStatus === 'pending'
                              ? 'bg-yellow-50 text-yellow-700'
                              : order.orderStatus ===
                                  'processing'
                                ? 'bg-blue-50 text-blue-700'
                                : order.orderStatus ===
                                    'shipped'
                                  ? 'bg-purple-50 text-purple-700'
                                  : order.orderStatus ===
                                      'delivered'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Ordered on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xl font-black text-slate-900">
                        {formatCurrency(order.total)}
                      </p>

                      <div className="mt-2 flex flex-wrap justify-start gap-2 md:justify-end">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black uppercase text-slate-600">
                          {order.paymentMethod}
                        </span>

                        <span
                          className={
                            'rounded-lg px-2.5 py-1 text-xs font-black uppercase ' +
                            (order.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.paymentStatus === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : order.paymentStatus === 'refunded'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-red-50 text-red-700')
                          }
                        >
                          Payment {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 py-5 lg:grid-cols-[1fr_280px]">
                    <div>
                      <p className="mb-3 text-sm font-black text-slate-800">
                        Customer & Shipping
                      </p>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-bold text-slate-900">
                          {getCustomerName(order.user)}
                        </p>

                        {getCustomerEmail(order.user) && (
                          <p className="mt-1 text-sm text-slate-500">
                            {getCustomerEmail(order.user)}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-slate-500">
                          {order.shippingAddress.phone}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {order.shippingAddress.address},{' '}
                          {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} -{' '}
                          {order.shippingAddress.pincode}
                        </p>
                      </div>

                      <p className="mb-3 mt-5 text-sm font-black text-slate-800">
                        Items
                      </p>

                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={`${order._id}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                          >
                            <div>
                              <p className="font-bold text-slate-800">
                                {getProductName(item.product)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Qty: {item.quantity} ·{' '}
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
                    </div>

                    <div className="h-fit rounded-xl bg-slate-50 p-5">
                      <p className="text-sm font-black text-slate-800">
                        Update Order Status
                      </p>

                      {order.orderStatus !== 'cancelled' && (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wide text-slate-400">
                            <span>Order Progress</span>
                            <span className="text-slate-600">
                              {order.orderStatus === 'pending'
                                ? 'Pending · 1 of 4'
                                : order.orderStatus === 'processing'
                                  ? 'Processing · 2 of 4'
                                  : order.orderStatus === 'shipped'
                                    ? 'Shipped · 3 of 4'
                                    : 'Delivered · 4 of 4'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {['pending', 'processing', 'shipped', 'delivered'].map(
                              (step, index) => {
                                const statusOrder = [
                                  'pending',
                                  'processing',
                                  'shipped',
                                  'delivered',
                                ]

                                const currentIndex =
                                  statusOrder.indexOf(order.orderStatus)

                                const isCompleted = index <= currentIndex

                                return (
                                  <div
                                    key={step}
                                    className="flex flex-1 items-center gap-1.5"
                                  >
                                    <div
                                      className={`h-2 flex-1 rounded-full transition ${
                                        isCompleted
                                          ? 'bg-brand-500'
                                          : 'bg-slate-200'
                                      }`}
                                    />

                                    {index < statusOrder.length - 1 && (
                                      <div className="hidden w-0.5 sm:block" />
                                    )}
                                  </div>
                                )
                              },
                            )}
                          </div>

                          <div className="mt-2 grid grid-cols-4 text-center text-[10px] font-bold text-slate-400">
                            <span>Pending</span>
                            <span>Processing</span>
                            <span>Shipped</span>
                            <span>Delivered</span>
                          </div>
                        </div>
                      )}

                      {order.orderStatus === 'cancelled' && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                          This order has been cancelled. No further status changes are available.
                        </div>
                      )}                      <select
                        value={order.orderStatus}
                        disabled={
                          updatingOrderId === order._id ||
                          order.orderStatus === 'delivered' ||
                          order.orderStatus === 'cancelled'
                        }
                        onChange={(event) =>
                          updateOrderStatus(
                            order._id,
                            event.target.value as Order['orderStatus'],
                          )
                        }
                        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                      >
                        <option value={order.orderStatus}>
                          Current: {order.orderStatus.replace('_', ' ')}
                        </option>

                        {getAllowedNextOrderStatuses(order.orderStatus).map(
                          (nextStatus) => (
                            <option key={nextStatus} value={nextStatus}>
                              Change to: {nextStatus.replace('_', ' ')}
                            </option>
                          ),
                        )}
                      </select>

                      {updatingOrderId === order._id && (
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          Updating status...
                        </p>
                      )}

                      <div className="my-5 border-t border-slate-200" />

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal</span>

                          <span>
                            {formatCurrency(order.subtotal)}
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-600">
                          <span>Shipping</span>

                          <span className="font-bold text-green-600">
                            FREE
                          </span>
                        </div>

                        <div className="border-t border-slate-200 pt-3" />

                        <div className="flex justify-between text-base font-black text-slate-900">
                          <span>Total</span>

                          <span>
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              {filteredOrders.length === 0
                ? 'No orders match the current filters'
                : `Showing ${
                    (orderPage - 1) * ordersPerPage + 1
                  }–${Math.min(
                    orderPage * ordersPerPage,
                    filteredOrders.length,
                  )} of ${filteredOrders.length} orders`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={orderPage === 1}
                onClick={() =>
                  setOrderPage((page) => Math.max(1, page - 1))
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                Page {orderPage} of {totalOrderPages}
              </span>

              <button
                type="button"
                disabled={orderPage === totalOrderPages}
                onClick={() =>
                  setOrderPage((page) =>
                    Math.min(totalOrderPages, page + 1),
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Refunds */}
      {activeSection === 'refunds' && (
        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Refund Management</h2>
              <p className="mt-1 text-sm text-slate-500">Review customer refund requests and update their workflow status.</p>
            </div>
            <button onClick={loadRefunds} disabled={loadingRefunds} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${loadingRefunds ? 'animate-spin' : ''}`} /> Refresh Refunds
            </button>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {([['all','All'],['requested','Requested'],['approved','Approved'],['processing','Processing'],['completed','Completed'],['rejected','Rejected']] as const).map(([key,label]) => (
              <button key={key} onClick={() => setRefundFilter(key)} className={`rounded-xl border px-4 py-4 text-left transition ${refundFilter === key ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <p className={`text-2xl font-black ${refundFilter === key ? 'text-brand-700' : 'text-slate-900'}`}>{refundCounts[key]}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
              </button>
            ))}
          </div>

          {loadingRefunds ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm"><RefreshCw className="mx-auto h-8 w-8 animate-spin text-brand-600" /><p className="mt-3 font-bold text-slate-700">Loading refund requests...</p></div>
          ) : filteredRefunds.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm"><RefreshCw className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No refund requests found</p><p className="mt-1 text-sm text-slate-500">Refund requests matching this filter will appear here.</p></div>
          ) : (
            <div className="space-y-5">
              {filteredRefunds.map((refund) => {
                const customerName = typeof refund.user === 'string' ? 'Customer' : refund.user?.name || 'Customer'
                const customerEmail = typeof refund.user === 'string' ? '' : refund.user?.email || ''
                const orderNumber = typeof refund.order === 'string' ? 'Order' : refund.order?.orderNumber || 'Order'
                const statusClass = refund.status === 'completed' ? 'bg-green-50 text-green-700' : refund.status === 'rejected' ? 'bg-red-50 text-red-700' : refund.status === 'processing' ? 'bg-purple-50 text-purple-700' : refund.status === 'approved' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                return (
                  <div key={refund._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start">
                      <div><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-black text-slate-900">{orderNumber}</h3><span className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase ${statusClass}`}>{refund.status}</span></div><p className="mt-2 text-sm text-slate-500">Requested on {formatDate(refund.createdAt)}</p></div>
                      <div className="text-left md:text-right"><p className="text-xl font-black text-slate-900">{formatCurrency(refund.amount)}</p><p className="mt-1 text-xs font-semibold uppercase text-slate-500">Refund amount</p></div>
                    </div>
                    <div className="grid gap-6 py-5 lg:grid-cols-[1fr_300px]">
                      <div>
                        <p className="mb-3 text-sm font-black text-slate-800">Customer</p>
                        <div className="rounded-xl bg-slate-50 p-4"><p className="font-bold text-slate-900">{customerName}</p>{customerEmail && <p className="mt-1 text-sm text-slate-500">{customerEmail}</p>}</div>
                        <p className="mb-3 mt-5 text-sm font-black text-slate-800">Refund Reason</p>
                        <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">{refund.reason}</div>
                        {refund.processedAt && <p className="mt-3 text-xs font-semibold text-slate-500">Processed on {formatDate(refund.processedAt)}</p>}
                      </div>
                      <div className="h-fit rounded-xl bg-slate-50 p-5">
                        <p className="text-sm font-black text-slate-800">Update Refund</p>
                        <select value={refund.status} disabled={updatingRefundId === refund._id} onChange={(e) => updateRefundStatus(refund._id, e.target.value as AdminRefund['status'])} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60">
                          <option value="requested">Requested</option><option value="approved">Approved</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="rejected">Rejected</option>
                        </select>
                        <label className="mb-2 mt-5 block text-sm font-black text-slate-800">Admin Note</label>
                        <textarea value={refundNotes[refund._id] ?? ''} onChange={(e) => setRefundNotes((current) => ({ ...current, [refund._id]: e.target.value }))} rows={4} maxLength={500} placeholder="Add an internal note..." className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                        <button type="button" onClick={() => updateRefundStatus(refund._id, refund.status)} disabled={updatingRefundId === refund._id} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" /> Save Note</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {editingProduct
                    ? 'Edit Product'
                    : 'Add Product'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingProduct
                    ? 'Update product details and inventory.'
                    : 'Add a new product to your store.'}
                </p>
              </div>

              <button
                onClick={closeProductModal}
                disabled={savingProduct}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleProductSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Product Name
                </label>

                <input
                  required
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  placeholder="e.g. Nike Air Max 270"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Slug
                </label>

                <input
                  required
                  name="slug"
                  value={productForm.slug}
                  onChange={handleProductChange}
                  placeholder="nike-air-max-270"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  required
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  rows={4}
                  placeholder="Product description..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Price
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductChange}
                    placeholder="5499"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Compare At Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="compareAtPrice"
                    value={productForm.compareAtPrice}
                    onChange={handleProductChange}
                    placeholder="6999"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Category
                  </label>

                  <input
                    required
                    name="category"
                    value={productForm.category}
                    onChange={handleProductChange}
                    placeholder="shoes"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Brand
                  </label>

                  <input
                    name="brand"
                    value={productForm.brand}
                    onChange={handleProductChange}
                    placeholder="Nike"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Stock
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    name="stock"
                    value={productForm.stock}
                    onChange={handleProductChange}
                    placeholder="25"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Image URL
                  </label>

                  <input
                    name="image"
                    value={productForm.image}
                    onChange={handleProductChange}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />

                  {productForm.image.trim() &&
                    isValidImageUrl(productForm.image) && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={productForm.image.trim()}
                          alt="Product preview"
                          className="h-40 w-full object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeProductModal}
                  disabled={savingProduct}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProduct}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProduct ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingProduct
                        ? 'Save Changes'
                        : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Admin





























































