import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, ShoppingBag, ShoppingCart, User, X } from 'lucide-react'
import { NAV_ITEMS } from '@/utils/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setMobileMenu, toggleMobileMenu } from '@/redux/slices/uiSlice'

const Navbar = () => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.ui.isMobileMenuOpen)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Nex<span className="text-brand-600">Cart</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <IconLink to="/wishlist" label="Wishlist">
            <Heart className="h-5 w-5" />
          </IconLink>
          <IconLink to="/cart" label="Cart">
            <ShoppingCart className="h-5 w-5" />
          </IconLink>
          <IconLink to="/profile" label="Profile">
            <User className="h-5 w-5" />
          </IconLink>
          <Link
            to="/login"
            className="ml-1 hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:inline-block"
          >
            Login
          </Link>
          <button
            type="button"
            onClick={() => dispatch(toggleMobileMenu())}
            className="ml-1 inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <ul className="space-y-1 px-4 py-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => dispatch(setMobileMenu(false))}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  onClick={() => dispatch(setMobileMenu(false))}
                  className="block rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Login
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/** Small round icon button that links somewhere. */
const IconLink = ({
  to,
  label,
  children,
}: {
  to: string
  label: string
  children: ReactNode
}) => (
  <Link
    to={to}
    aria-label={label}
    className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
  >
    {children}
  </Link>
)

export default Navbar
