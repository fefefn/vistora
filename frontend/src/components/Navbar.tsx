import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from 'lucide-react'
import { NAV_ITEMS } from '@/utils/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  setMobileMenu,
  toggleMobileMenu,
} from '@/redux/slices/uiSlice'
import { logout } from '@/redux/slices/authSlice'

const Navbar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const isOpen = useAppSelector(
    (state) => state.ui.isMobileMenuOpen,
  )

  const { isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  )

  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    dispatch(logout())
    dispatch(setMobileMenu(false))
    navigate('/')
  }

  const closeMobileMenu = () => {
    dispatch(setMobileMenu(false))
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 transition duration-300 group-hover:scale-105">
            <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
          </span>

          <span className="text-[22px] font-black tracking-tight text-slate-950">
            Vistora
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <ul className="flex items-center gap-7 lg:gap-9">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `relative py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-violet-600'
                        : 'text-slate-600 hover:text-slate-950'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <span
                        className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-violet-600 transition-all duration-300 ${
                          isActive ? 'w-full' : 'w-0'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}

            <li>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `relative py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-violet-600'
                      : 'text-slate-600 hover:text-slate-950'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Categories
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-violet-600 transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/shop?deals=true"
                className="relative py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-violet-600"
              >
                Deals
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="hidden h-10 w-[190px] items-center gap-2.5 rounded-full bg-slate-100 px-4 text-left text-sm text-slate-500 transition hover:bg-slate-200 lg:flex xl:w-[250px]"
            aria-label="Search products"
          >
            <Search className="h-[18px] w-[18px] shrink-0 text-slate-600" />
            <span className="truncate">
              Search products, brands and more...
            </span>
          </button>

          <IconLink to="/wishlist" label="Wishlist">
            <Heart className="h-[20px] w-[20px]" strokeWidth={1.8} />
          </IconLink>

          <IconLink to="/cart" label="Cart">
            <ShoppingCart className="h-[20px] w-[20px]" strokeWidth={1.8} />
          </IconLink>

          <IconLink to="/profile" label="Profile">
            <User className="h-[20px] w-[20px]" strokeWidth={1.8} />
          </IconLink>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="ml-1 hidden rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 sm:inline-flex"
                >
                  Admin
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 hidden items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 sm:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-1 hidden rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-500/20 transition hover:bg-violet-700 sm:inline-flex"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={() => dispatch(toggleMobileMenu())}
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      <div className="border-t border-slate-100 px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => {
            closeMobileMenu()
            navigate('/shop')
          }}
          className="flex w-full items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-left text-sm text-slate-500"
        >
          <Search className="h-5 w-5 text-slate-600" />
          <span>Search products, brands and more...</span>
        </button>
      </div>

      <div
        className={`grid overflow-hidden border-t border-slate-200 bg-white transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden ${
          isOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-5 pt-2">

            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}

              <li>
                <NavLink
                  to="/shop"
                  onClick={closeMobileMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Categories
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/shop?deals=true"
                  onClick={closeMobileMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Deals
                </NavLink>
              </li>

              {isAuthenticated && isAdmin && (
                <li>
                  <NavLink
                    to="/admin"
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-sm font-bold transition ${
                        isActive
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    Admin Dashboard
                  </NavLink>
                </li>
              )}
            </ul>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
              <MobileAction
                to="/wishlist"
                label="Wishlist"
                icon={<Heart className="h-4 w-4" />}
                onClick={closeMobileMenu}
              />

              <MobileAction
                to="/cart"
                label="Cart"
                icon={<ShoppingCart className="h-4 w-4" />}
                onClick={closeMobileMenu}
              />

              <MobileAction
                to="/profile"
                label="Profile"
                icon={<User className="h-4 w-4" />}
                onClick={closeMobileMenu}
              />
            </div>

            <div className="mt-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  Login
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}

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
    title={label}
    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-all hover:bg-violet-50 hover:text-violet-600"
  >
    {children}
  </Link>
)

const MobileAction = ({
  to,
  label,
  icon,
  onClick,
}: {
  to: string
  label: string
  icon: ReactNode
  onClick: () => void
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
  >
    {icon}
    {label}
  </Link>
)

export default Navbar


