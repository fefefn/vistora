import { LayoutDashboard } from 'lucide-react'
import PagePlaceholder from '@/components/PagePlaceholder'

const Admin = () => (
  <PagePlaceholder
    title="Admin Dashboard"
    description="Manage products, orders and users. Access will be role-protected later."
    icon={LayoutDashboard}
  />
)

export default Admin
