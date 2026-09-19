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

const categories = [
  {
    name: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Shoes',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Watches',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Lifestyle',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
  },
]

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    text: 'On orders above ₹999',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    text: '100% safe & secure checkout',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    text: '7-day hassle-free returns',
  },
]

const ApiStatus = () => {
  const { data, isLoading, isError } = useHealthCheck()

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking store...
      </span>
    )
  }

  if (isError || !data?.success) {
    return (
      <span className="inline-flex items-center gap-1.5 text-red-500">
        <XCircle className="h-3.5 w-3.5" />
        Store connection unavailable
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-emerald-600">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Store online
    </span>
  )
}

const Home = () => {
  return (
    <div className="bg-white text-slate-900">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-[#f7f4ff]">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              New season collection
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Style for
              <span className="block bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                Every You
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Discover fashion, footwear, electronics, accessories and
              everyday essentials — all in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 transition hover:border-purple-300 hover:bg-purple-50"
              >
                Explore Collections
              </Link>
            </div>

            {/* Benefits */}
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon

                return (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {feature.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -right-5 top-10 z-10 hidden rounded-2xl border border-white bg-white/95 p-4 shadow-xl sm:block">
              <p className="text-sm font-bold text-slate-900">
                Trending Looks
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Fresh styles for every occasion
              </p>
              <ArrowRight className="mt-3 h-4 w-4 text-violet-600" />
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-white p-2 shadow-2xl shadow-purple-900/10">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1100&q=85"
                alt="Vistora fashion collection"
                className="h-[430px] w-full rounded-[1.6rem] object-cover sm:h-[520px]"
              />

              <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                      Vistora Edit
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-900">
                      Good style. Better days.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
              Shop by category
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Find what fits you
            </h2>
          </div>

          <Link
            to="/shop"
            className="hidden items-center gap-1 text-sm font-bold text-slate-700 transition hover:text-violet-600 sm:flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Link
                to="/shop"
                className="group block text-center"
              >
                <div className="mx-auto aspect-square max-w-[150px] overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md ring-1 ring-slate-200 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-purple-200">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-800 transition group-hover:text-violet-600">
                  {category.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          to="/shop"
          className="mt-8 flex items-center justify-center gap-1 text-sm font-bold text-slate-700 sm:hidden"
        >
          View all categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ================= VALUE PROPS ================= */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: ShoppingBag,
              title: 'Top Brands',
              text: 'Latest styles from trusted brands',
            },
            {
              icon: Sparkles,
              title: 'Best Prices',
              text: 'Great products at great prices',
            },
            {
              icon: ShieldCheck,
              title: 'Secure Shopping',
              text: 'Your payments and data stay protected',
            },
          ].map((item, index) => {
            const Icon = item.icon

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-violet-600">
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ================= COLLECTION BANNERS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Men's */}
          <Link
            to="/shop"
            className="group relative min-h-[280px] overflow-hidden rounded-3xl bg-slate-900"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
              alt="Men's fashion"
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="relative flex h-full min-h-[280px] flex-col justify-end p-7">
              <p className="text-sm font-semibold text-white/70">
                NEW ARRIVALS
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                Men's Fashion
              </h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                Explore
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Women's */}
          <Link
            to="/shop"
            className="group relative min-h-[280px] overflow-hidden rounded-3xl bg-purple-100"
          >
            <img
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
              alt="Women's fashion"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            <div className="relative flex h-full min-h-[280px] flex-col justify-end p-7">
              <p className="text-sm font-semibold text-white/75">
                CURATED FOR YOU
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                Women's Collection
              </h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                Explore
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Shoes */}
          <Link
            to="/shop"
            className="group relative min-h-[280px] overflow-hidden rounded-3xl bg-blue-100"
          >
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
              alt="Footwear collection"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

            <div className="relative flex h-full min-h-[280px] flex-col justify-end p-7">
              <p className="text-sm font-semibold text-white/75">
                STEP INTO STYLE
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                Footwear Deals
              </h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                Shop Shoes
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-600 px-6 py-14 text-center shadow-xl sm:px-10">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
              <ShoppingBag className="h-7 w-7" />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Your next favourite thing is waiting.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-purple-100">
              Explore our latest collection and discover products made for
              your everyday style.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-50"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= API STATUS ================= */}
      <div className="pb-8 text-center text-xs font-medium">
        <ApiStatus />
      </div>
    </div>
  )
}

export default Home