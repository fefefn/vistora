import { Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home'
import Shop from '@/pages/Shop'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Cart from '@/pages/Cart'
import Wishlist from '@/pages/Wishlist'
import Profile from '@/pages/Profile'
import Orders from '@/pages/Orders'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

/** Route table. Every page renders inside MainLayout; unknown paths hit NotFound. */
const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
)

export default App
