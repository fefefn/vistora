import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface PagePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
}

/** Consistent, polished placeholder used by pages whose features arrive later. */
const PagePlaceholder = ({ title, description, icon: Icon }: PagePlaceholderProps) => (
  <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center"
    >
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-8 w-8" />
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 max-w-md text-slate-500">{description}</p>
      <span className="mt-6 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
        Coming in a future phase
      </span>
    </motion.div>
  </section>
)

export default PagePlaceholder
