import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ClipboardList,
  LogOut,
  Mail,
  ShoppingBag,
  User,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { logout } from '@/redux/slices/authSlice'
import { getStoredUser } from '@/services/auth.service'
import api from '@/services/api'

interface Order {
  _id: string
  orderNumber: string
  total: number
  orderStatus: string
  createdAt: string
}

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [user, setUser] = useState(getStoredUser())
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()

    if (!storedUser) {
      navigate('/login')
      return
    }

    setUser(storedUser)

    const loadOrders = async () => {
      try {
        const response = await api.get<{
          success: boolean
          data: Order[]
        }>('/orders')

        if (response.data.success) {
          setOrders(response.data.data)
        }
      } catch {
        setOrders([])
      } finally {
        setLoadingOrders(false)
      }
    }

    loadOrders()
  }, [navigate])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  if (!user) {
    return null
  }

  const firstLetter = user.name.charAt(0).toUpperCase()

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
            My Account
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Welcome, {user.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your account and track your Vistora activity.
          </p>
        </div>

        {/* Profile card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-3xl font-black text-brand-600">
                {firstLetter}
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {user.name}
                </h2>

                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>

                <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                  {user.role} account
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-5 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total Orders
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {loadingOrders ? 'â€”' : orders.length}
                </p>
              </div>

              <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Account Type
                </p>

                <p className="mt-2 text-3xl font-black capitalize text-slate-900">
                  {user.role}
                </p>
              </div>

              <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
                <User className="h-6 w-6" />
              </div>
            </div>
          </div>

        </section>

        {/* Quick actions */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-black text-slate-900">
            Quick Actions
          </h2>

          <div className="grid gap-5 md:grid-cols-3">

            <Link
              to="/orders"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
                  <ClipboardList className="h-6 w-6" />
                </div>

                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                My Orders
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Track your orders and delivery status.
              </p>
            </Link>

            <Link
              to="/shop"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>

                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                Continue Shopping
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Explore products and discover something new.
              </p>
            </Link>

            <Link
              to="/cart"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>

                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                Shopping Cart
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Review your selected products and checkout.
              </p>
            </Link>

          </div>
        </section>

        {/* Account information */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your registered Vistora account details.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Full Name
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {user.name}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </p>

              <p className="mt-2 break-all font-bold text-slate-900">
                {user.email}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Account Role
              </p>

              <p className="mt-2 font-bold capitalize text-slate-900">
                {user.role}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer ID
              </p>

              <p className="mt-2 break-all font-mono text-sm font-bold text-slate-900">
                {user.id}
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}

export default Profile


