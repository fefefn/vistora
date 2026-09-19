import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, PackageCheck, CreditCard, Banknote } from 'lucide-react'
import { getCart } from '@/services/cart.service'
import api from '@/services/api'

interface CheckoutForm {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

interface Product {
  _id: string
  name: string
  price: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface Cart {
  items: CartItem[]
}

type PaymentMethod = 'cod' | 'razorpay'

interface RazorpayOrderResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
}

const initialForm: CheckoutForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
}

const Checkout = () => {
  const navigate = useNavigate()

  const [cart, setCart] = useState<Cart | null>(null)
  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('cod')
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await getCart()

        setCart(response.data)

        if (!response.data.items.length) {
          navigate('/cart')
        }
      } catch {
        setError('Unable to load your cart.')
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [navigate])

  const subtotal = useMemo(() => {
    if (!cart?.items) return 0

    return cart.items.reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0,
    )
  }, [cart])

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const validateShippingForm = (): boolean => {
    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      setError('Please fill in all shipping address fields.')
      return false
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError('Please enter a valid 10-digit phone number.')
      return false
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError('Please enter a valid 6-digit pincode.')
      return false
    }

    return true
  }

  const placeCodOrder = async () => {
    const response = await api.post('/orders', form)

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          'Unable to place your order.',
      )
    }

    navigate('/orders')
  }

  const createRazorpayOrder = async (): Promise<RazorpayOrderResponse> => {
    const response = await api.post(
      '/payments/razorpay/order',
    )

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          'Unable to start online payment.',
      )
    }

    return response.data.data
  }

  const verifyRazorpayPayment = async (
    paymentResponse: RazorpayPaymentResponse,
  ) => {
    const response = await api.post(
      '/payments/razorpay/verify',
      {
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpaySignature: paymentResponse.razorpay_signature,
        ...form,
      },
    )

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          'Payment verification failed.',
      )
    }

    navigate('/orders')
  }

  const openRazorpayCheckout = async () => {
    const razorpayOrder = await createRazorpayOrder()

    if (!window.Razorpay) {
      throw new Error(
        'Razorpay Checkout failed to load. Please refresh the page and try again.',
      )
    }

    const options: RazorpayOptions = {
      key: razorpayOrder.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Vistora',
      description: 'Vistora Order Payment',
      order_id: razorpayOrder.razorpayOrderId,

      handler: async (response) => {
        try {
          setError('')
          setPlacingOrder(true)

          await verifyRazorpayPayment(response)
        } catch (err: any) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              'Payment verification failed. Please contact support.',
          )
        } finally {
          setPlacingOrder(false)
        }
      },

      prefill: {
        name: form.fullName,
        contact: form.phone,
      },

      theme: {
        color: '#2563eb',
      },

      modal: {
        ondismiss: () => {
          setPlacingOrder(false)
          setError('Payment was cancelled.')
        },
      },
    }

    const razorpay = new window.Razorpay(options)

    razorpay.open()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    setError('')

    if (!validateShippingForm()) {
      return
    }

    setPlacingOrder(true)

    try {
      if (paymentMethod === 'cod') {
        await placeCodOrder()
      } else {
        await openRazorpayCheckout()
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to place your order. Please try again.',
      )

      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-slate-500">
          Loading checkout...
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
            <PackageCheck className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Checkout
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Enter your shipping details and choose your payment method.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* SHIPPING + PAYMENT FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-brand-600" />

            <h2 className="text-xl font-black text-slate-900">
              Shipping Address
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Full Name */}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Full Name
              </label>

              <input
                required
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Phone Number
              </label>

              <input
                required
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                maxLength={10}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Pincode */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Pincode
              </label>

              <input
                required
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Address */}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Address
              </label>

              <textarea
                required
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House number, street, area"
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* City */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                City
              </label>

              <input
                required
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* State */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                State
              </label>

              <input
                required
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          {/* PAYMENT */}

          <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-brand-600" />

              <h2 className="text-xl font-black text-slate-900">
                Payment Method
              </h2>
            </div>

            <div className="grid gap-3">
              {/* COD */}

              <label
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                  paymentMethod === 'cod'
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-4 w-4"
                />

                <Banknote className="h-5 w-5 text-green-600" />

                <div>
                  <p className="font-bold text-slate-800">
                    Cash on Delivery
                  </p>

                  <p className="text-sm text-slate-500">
                    Pay when your order is delivered.
                  </p>
                </div>
              </label>

              {/* RAZORPAY */}

              <label
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() =>
                    setPaymentMethod('razorpay')
                  }
                  className="h-4 w-4"
                />

                <CreditCard className="h-5 w-5 text-brand-600" />

                <div>
                  <p className="font-bold text-slate-800">
                    Online Payment
                  </p>

                  <p className="text-sm text-slate-500">
                    Pay securely using Razorpay.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* PLACE ORDER */}

          <button
            type="submit"
            disabled={placingOrder}
            className="mt-6 w-full rounded-xl bg-brand-600 px-6 py-3.5 font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder
              ? paymentMethod === 'razorpay'
                ? 'Opening Payment...'
                : 'Placing Order...'
              : paymentMethod === 'razorpay'
                ? 'Pay Online'
                : 'Place Order'}
          </button>
        </form>

        {/* ORDER SUMMARY */}

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">
            {cart?.items.map((item) => (
              <div
                key={item.product._id}
                className="flex justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    {item.product.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="font-bold text-slate-900">
                  {String.fromCharCode(0x20b9)}
                  {(item.product.price * item.quantity).toLocaleString(
                    'en-IN',
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="my-6 border-t border-slate-200" />

          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>

            <span>
              {String.fromCharCode(0x20b9)}
              {subtotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="mt-3 flex justify-between text-sm text-slate-600">
            <span>Shipping</span>

            <span className="font-bold text-green-600">
              FREE
            </span>
          </div>

          <div className="my-5 border-t border-slate-200" />

          <div className="flex justify-between text-lg font-black text-slate-900">
            <span>Total</span>

            <span>
              {String.fromCharCode(0x20b9)}
              {subtotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center text-sm text-slate-500">
            {paymentMethod === 'razorpay'
              ? 'You will be redirected to secure Razorpay Checkout.'
              : 'Cash on Delivery selected.'}
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Checkout
