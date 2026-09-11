import { Link } from 'react-router-dom'
import { AtSign, Globe, Mail, ShoppingBag } from 'lucide-react'
import { APP_NAME } from '@/utils/constants'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-slate-900">
              Nex<span className="text-brand-600">Cart</span>
            </span>
          </Link>

          <p className="text-sm text-slate-500">
            A full-stack MERN e-commerce demo — built for learning &amp; portfolio.
          </p>

          <div className="flex items-center gap-3">
            <a href="#" aria-label="Website" className="text-slate-400 transition-colors hover:text-slate-900">
              <Globe className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Social" className="text-slate-400 transition-colors hover:text-slate-900">
              <AtSign className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Email" className="text-slate-400 transition-colors hover:text-slate-900">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {year} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
