import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'

const Home = lazy(() => import('@/pages/Home'))
const Shop = lazy(() => import('@/pages/Shop'))
const ProductDetails = lazy(() => import('@/pages/ProductDetails'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Cart = lazy(() => import('@/pages/Cart'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const Wishlist = lazy(() => import('@/pages/Wishlist'))
const Profile = lazy(() => import('@/pages/Profile'))
const WalletPage = lazy(() => import('@/pages/Wallet'))
const Payments = lazy(() => import('@/pages/Payments'))
const Refunds = lazy(() => import('@/pages/Refunds'))
const Orders = lazy(() => import('@/pages/Orders'))
const Admin = lazy(() => import('@/pages/Admin'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="text-sm font-bold text-slate-500">
      Loading...
    </div>
  </div>
)

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/refunds" element={<Refunds />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<Admin />} />

        <Route path="*" element={<NotFound />} />

      </Route>
    </Routes>
  </Suspense>
)

export default App
