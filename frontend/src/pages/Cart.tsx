import { ShoppingCart } from 'lucide-react'
import PagePlaceholder from '@/components/PagePlaceholder'

const Cart = () => (
  <PagePlaceholder
    title="Your Cart"
    description="Items you add to the cart will appear here, ready for checkout."
    icon={ShoppingCart}
  />
)

export default Cart
