import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  XCircle,
} from 'lucide-react'
import { useHealthCheck } from '@/hooks/useHealthCheck'

const features = [
  { icon: Truck, title: 'Fast Delivery', text: 'Reliable shipping with real-time order tracking.' },
  { icon: ShieldCheck, title: 'Secure Payments', text: 'Industry-standard encryption on every transaction.' },
  { icon: RefreshCw, title: 'Easy Returns', text: 'Hassle-free 7-day return and refund policy.' },
  { icon: Sparkles, title: 'Curated Picks', text: 'Handpicked products across every category.' },
]

/** Live badge that reflects whether the backend /api/health endpoint is reachable. */
const ApiStatus = () => {
  const { data, isLoading, isError } = useHealthCheck()

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking API…
      </span>
    )
  }

  if (isError || !data?.success) {
    return (
      <span className="inline-flex items-center gap-1.5 text-red-600">
        <XCircle className="h-3.5 w-3.5" /> API offline
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-emerald-600">
      <CheckCircle2 className="h-3.5 w-3.5" /> API connected
    </span>
  )
}

const Home = () => (
  <>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Welcome to NexCart
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl"
          >
            Shop smarter with{' '}
            <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
              NexCart
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-xl text-lg text-slate-600"
          >
            A modern full-stack e-commerce experience built with the MERN stack,
            TypeScript, Redux Toolkit and TanStack Query.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
            >
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Create Account
            </Link>
          </motion.div>

          <div className="mt-6 text-xs font-medium">
            <ApiStatus />
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-violet-600 px-8 py-14 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to explore the catalog?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-brand-100">
          Browse products, build your cart and check out — all coming together
          phase by phase.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Visit the Shop <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  </>
)

export default Home
