import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  WalletCards,
  RefreshCcw,
  ShoppingBag,
} from 'lucide-react'
import api from '@/services/api'

interface Wallet {
  id: string
  balance: number
  currency: string
  createdAt: string
  updatedAt: string
}

interface WalletTransaction {
  _id: string
  type:
    | 'credit'
    | 'debit'
    | 'refund'
    | 'referral'
    | 'cashback'
    | 'adjustment'
  amount: number
  balanceAfter: number
  description: string
  referenceType?: string
  referenceId?: string
  createdAt: string
}

interface TransactionResponse {
  success: boolean
  data: WalletTransaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const formatCurrency = (amount: number) => {
  return `${String.fromCharCode(0x20b9)}${amount.toLocaleString('en-IN')}`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getTransactionLabel = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'credit':
      return 'Added to Balance'
    case 'debit':
      return 'Used from Balance'
    case 'refund':
      return 'Refund'
    case 'referral':
      return 'Referral Reward'
    case 'cashback':
      return 'Cashback'
    case 'adjustment':
      return 'Balance Adjustment'
    default:
      return type
  }
}

const getTransactionStyle = (type: WalletTransaction['type']) => {
  if (
    type === 'credit' ||
    type === 'refund' ||
    type === 'referral' ||
    type === 'cashback'
  ) {
    return {
      wrapper: 'bg-green-50 text-green-700',
      icon: ArrowDownLeft,
      prefix: '+',
    }
  }

  return {
    wrapper: 'bg-red-50 text-red-700',
    icon: ArrowUpRight,
    prefix: '-',
  }
}

const WalletPage = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadWallet = async () => {
    try {
      setError('')

      const [walletResponse, transactionResponse] =
        await Promise.all([
          api.get<{ success: boolean; data: Wallet }>('/wallet'),
          api.get<TransactionResponse>(
            '/wallet/transactions?limit=20',
          ),
        ])

      setWallet(walletResponse.data.data)
      setTransactions(transactionResponse.data.data || [])
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load your Vistora Balance.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadWallet()
  }, [])

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center justify-center px-4">
          <div className="text-center">
            <WalletCards className="mx-auto h-10 w-10 animate-pulse text-brand-500" />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading your Vistora Balance...
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/profile"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Account
        </Link>

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
              Vistora Wallet
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              Vistora Balance
            </h1>

            <p className="mt-2 text-slate-500">
              Use your Vistora Balance for eligible purchases,
              refunds and rewards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setRefreshing(true)
              loadWallet()
            }}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Balance Card */}
        <section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <WalletCards className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Available Balance
                  </p>

                  <p className="text-xs text-slate-400">
                    Vistora Wallet
                  </p>
                </div>
              </div>

              <p className="mt-6 text-4xl font-black sm:text-5xl">
                {formatCurrency(wallet?.balance || 0)}
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Now
            </Link>
          </div>
        </section>

        {/* Transactions */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h2 className="text-xl font-black text-slate-900">
              Transaction History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your recent Vistora Balance activity.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <WalletCards className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                No transactions yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your wallet transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((transaction) => {
                const style = getTransactionStyle(
                  transaction.type,
                )
                const Icon = style.icon

                return (
                  <div
                    key={transaction._id}
                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.wrapper}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">
                          {getTransactionLabel(
                            transaction.type,
                          )}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {transaction.description}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p
                        className={`text-base font-black ${
                          style.prefix === '+'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {style.prefix}
                        {formatCurrency(transaction.amount)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Balance:{' '}
                        {formatCurrency(
                          transaction.balanceAfter,
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default WalletPage
