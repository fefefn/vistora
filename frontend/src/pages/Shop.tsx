import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
  Loader2,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import {
  getProducts,
  type Product,
  type ProductFilters,
  type ProductSort,
} from '@/services/product.service'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '@/services/wishlist.service'

const genderOptions = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'kids', label: 'Kids' },
  { value: 'unisex', label: 'Unisex' },
]

const categoryOptions = [
  { value: 'clothing', label: 'Clothing' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'watches', label: 'Watches' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'lifestyle', label: 'Lifestyle' },
]

const colorOptions = [
  'black',
  'white',
  'blue',
  'red',
  'green',
  'yellow',
  'pink',
  'grey',
  'brown',
]

const fabricOptions = [
  'cotton',
  'polyester',
  'linen',
  'denim',
  'wool',
  'silk',
]

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

const Shop = () => {
  const [searchParams] = useSearchParams()
  const dealsOnly = searchParams.get('deals') === 'true'
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [search])
  const [gender, setGender] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [color, setColor] = useState('')
  const [fabric, setFabric] = useState('')
  const [size, setSize] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sort, setSort] = useState<ProductSort>('newest')
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(null)

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const response = await getWishlist()

        const ids = new Set(
          (response.data?.items ?? []).map((product) => product._id),
        )

        setWishlistIds(ids)
      } catch {
        // Wishlist is optional on the Shop page.
        // Authentication errors are handled when the user clicks the heart.
      }
    }

    loadWishlist()
  }, [])

  const handleWishlistToggle = async (productId: string) => {
    const isWishlisted = wishlistIds.has(productId)

    try {
      setWishlistLoadingId(productId)

      if (isWishlisted) {
        await removeFromWishlist(productId)

        setWishlistIds((current) => {
          const next = new Set(current)
          next.delete(productId)
          return next
        })
      } else {
        await addToWishlist(productId)

        setWishlistIds((current) => {
          const next = new Set(current)
          next.add(productId)
          return next
        })
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Please login to manage your wishlist."

      window.alert(message)
    } finally {
      setWishlistLoadingId(null)
    }
  }

  const filters: ProductFilters = {
    page,
    limit: 12,
    sort,
    ...(dealsOnly ? { deals: true } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(gender ? { gender } : {}),
    ...(category ? { category } : {}),
    ...(brand.trim() ? { brand: brand.trim() } : {}),
    ...(color ? { color } : {}),
    ...(fabric ? { fabric } : {}),
    ...(size ? { size } : {}),
    ...(minPrice && Number(minPrice) > 0
  ? { minPrice: Number(minPrice) }
  : {}),
    ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
    ...(minRating ? { minRating: Number(minRating) } : {}),
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  })

  const products = data?.data ?? []
  const pagination = data?.pagination

  const resetPage = () => {
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setGender('')
    setCategory('')
    setBrand('')
    setColor('')
    setFabric('')
    setSize('')
    setMinPrice('')
    setMaxPrice('')
    setMinRating('')
    setSort('newest')
    setPage(1)
  }

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(gender) ||
    Boolean(category) ||
    Boolean(brand) ||
    Boolean(color) ||
    Boolean(fabric) ||
    Boolean(size) ||
    (Number(minPrice) > 0) ||
    Boolean(maxPrice) ||
    Boolean(minRating) ||
    sort !== 'newest'

  return (
    <main className="min-h-screen bg-[#f8f8fc]">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-sm font-bold text-violet-700">
                <ShoppingBag className="h-4 w-4" />
                Vistora Shop
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {dealsOnly ? "Big savings, better shopping." : "Explore Products"}
              </h1>

              <p className="mt-3 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                {dealsOnly
                  ? "Discover selected products with 20% or more savings."
                  : "Discover quality products at great prices."}
              </p>
            </div>

            {pagination && (
              <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                {pagination.total} product
                {pagination.total === 1 ? '' : 's'} found
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Search + Sort */}
      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-md shadow-slate-200/40 lg:flex-row lg:p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                resetPage()
              }}
              placeholder="Search products, brands..."
              className="w-full rounded-xl border border-transparent bg-slate-100 py-3.5 pl-11 pr-10 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  resetPage()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 lg:hidden"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as ProductSort)
              resetPage()
            }}
            className="rounded-xl border border-transparent bg-slate-100 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 lg:w-60"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto flex max-w-7xl gap-6 px-4 py-6 pb-20 sm:px-6 lg:px-8">
        {/* Desktop Filters */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterPanel
            gender={gender}
            category={category}
            brand={brand}
            color={color}
            fabric={fabric}
            size={size}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
            setGender={(value) => {
              setGender(value)
              resetPage()
            }}
            setCategory={(value) => {
  setCategory(value)
  resetPage()
}}
            setBrand={(value) => {
              setBrand(value)
              resetPage()
            }}
            setColor={(value) => {
              setColor(value)
              resetPage()
            }}
            setFabric={(value) => {
              setFabric(value)
              resetPage()
            }}
            setSize={(value) => {
              setSize(value)
              resetPage()
            }}
            setMinPrice={(value) => {
              setMinPrice(value)
              resetPage()
            }}
            setMaxPrice={(value) => {
              setMaxPrice(value)
              resetPage()
            }}
            setMinRating={(value) => {
              setMinRating(value)
              resetPage()
            }}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Products */}
        <div className="min-w-0 flex-1">
          {hasActiveFilters && (
            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-violet-100 bg-white p-3 shadow-sm">
              <span className="mr-1 text-sm font-semibold text-slate-500">
                Filters:
              </span>

              {gender && <FilterChip label={gender} onRemove={() => setGender('')} />}
              {category && (
                <FilterChip label={category} onRemove={() => setCategory('')} />
              )}
              {brand && <FilterChip label={brand} onRemove={() => setBrand('')} />}
              {color && <FilterChip label={color} onRemove={() => setColor('')} />}
              {fabric && <FilterChip label={fabric} onRemove={() => setFabric('')} />}
              {size && <FilterChip label={size} onRemove={() => setSize('')} />}
              {minPrice && Number(minPrice) > 0 && (
                <FilterChip
                  label={`${String.fromCharCode(0x20B9)}${minPrice}+`}
                  onRemove={() => setMinPrice('')}
                />
              )}
              {maxPrice && (
                <FilterChip
                  label={`Up to ${String.fromCharCode(0x20B9)}${maxPrice}`}
                  onRemove={() => setMaxPrice('')}
                />
              )}
              {minRating && (
                <FilterChip
                  label={`${minRating}+ ${String.fromCharCode(0x2605)}`}
                  onRemove={() => setMinRating('')}
                />
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Clear all
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex min-h-72 items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                <span className="font-medium">Loading products...</span>
              </div>
            </div>
          )}

          {isError && (
            <div className="flex min-h-72 items-center justify-center">
              <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

                <h2 className="mt-3 text-lg font-bold text-red-900">
                  Unable to load products
                </h2>

                <p className="mt-2 text-sm text-red-700">
                  Please make sure the Vistora backend is running.
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <div className="flex min-h-72 items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    isWishlisted={wishlistIds.has(product._id)}
                    isWishlistLoading={wishlistLoadingId === product._id}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setPage((current) => current - 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <span className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white">
                    {page} / {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />

          <div className="absolute right-0 top-0 h-full w-[min(90%,380px)] overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-extrabold text-slate-900">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FilterPanel
              gender={gender}
              category={category}
              brand={brand}
              color={color}
              fabric={fabric}
              size={size}
              minPrice={minPrice}
              maxPrice={maxPrice}
              minRating={minRating}
              setGender={(value) => {
                setGender(value)
                resetPage()
              }}
              setCategory={(value) => {
  setCategory(value)
  resetPage()
}}
              setBrand={(value) => {
                setBrand(value)
                resetPage()
              }}
              setColor={(value) => {
                setColor(value)
                resetPage()
              }}
              setFabric={(value) => {
                setFabric(value)
                resetPage()
              }}
              setSize={(value) => {
                setSize(value)
                resetPage()
              }}
              setMinPrice={(value) => {
                setMinPrice(value)
                resetPage()
              }}
              setMaxPrice={(value) => {
                setMaxPrice(value)
                resetPage()
              }}
              setMinRating={(value) => {
                setMinRating(value)
                resetPage()
              }}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
            >
              Show {pagination?.total ?? 0} Products
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

interface FilterPanelProps {
  gender: string
  category: string
  brand: string
  color: string
  fabric: string
  size: string
  minPrice: string
  maxPrice: string
  minRating: string
  setGender: (value: string) => void
  setCategory: (value: string) => void
  setBrand: (value: string) => void
  setColor: (value: string) => void
  setFabric: (value: string) => void
  setSize: (value: string) => void
  setMinPrice: (value: string) => void
  setMaxPrice: (value: string) => void
  setMinRating: (value: string) => void
  onClear: () => void
  hasActiveFilters: boolean
}

const FilterPanel = ({
  gender,
  category,
  brand,
  color,
  fabric,
  size,
  minPrice,
  maxPrice,
  minRating,
  setGender,
  setCategory,
  setBrand,
  setColor,
  setFabric,
  setSize,
  setMinPrice,
  setMaxPrice,
  setMinRating,
  onClear,
  hasActiveFilters,
}: FilterPanelProps) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/40">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-violet-600" />
          <h2 className="font-black text-slate-950">Filters</h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-violet-600 transition-colors hover:text-violet-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Gender */}
      <FilterSection title="Gender">
        <div className="space-y-2">
          {genderOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
            >
              <input
                type="radio"
                name="gender"
                checked={gender === option.value}
                onChange={() => setGender(option.value)}
                className="h-4 w-4 accent-brand-600"
              />
              {option.label}
            </label>
          ))}

          {gender && (
            <button
              type="button"
              onClick={() => setGender('')}
              className="text-xs font-semibold text-brand-600"
            >
              Clear gender
            </button>
          )}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
        >
          <option value="">All Categories</option>

          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        <input
          type="text"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          placeholder="e.g. Nike"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
        />
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <select
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
        >
          <option value="">All Colors</option>

          {colorOptions.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Fabric */}
      <FilterSection title="Fabric">
        <select
          value={fabric}
          onChange={(event) => setFabric(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
        >
          <option value="">All Fabrics</option>

          {fabricOptions.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSize(size === item ? '' : item)}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                size === item
                  ? 'border-violet-600 bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder={`Min ${String.fromCharCode(0x20B9)}`}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
          />

          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder={`Max ${String.fromCharCode(0x20B9)}`}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
          />
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <select
          value={minRating}
          onChange={(event) => setMinRating(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
        >
          <option value="">Any Rating</option>
          <option value="4">4{String.fromCharCode(0x2605)} & above</option>
          <option value="3">3{String.fromCharCode(0x2605)} & above</option>
          <option value="2">2{String.fromCharCode(0x2605)} & above</option>
          <option value="1">1{String.fromCharCode(0x2605)} & above</option>
        </select>
      </FilterSection>
    </div>
  )
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
}

const FilterSection = ({ title, children }: FilterSectionProps) => {
  return (
    <div className="border-t border-slate-100 py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">{title}</h3>
      {children}
    </div>
  )
}

interface FilterChipProps {
  label: string
  onRemove: () => void
}

const FilterChip = ({ label, onRemove }: FilterChipProps) => {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold capitalize text-violet-700 transition hover:bg-violet-100"
    >
      {label}
      <X className="h-3.5 w-3.5" />
    </button>
  )
}

interface ProductCardProps {
  product: Product
  index: number
  isWishlisted: boolean
  isWishlistLoading: boolean
  onWishlistToggle: (productId: string) => void
}

const ProductCard = memo(
  ({
    product,
    index,
    isWishlisted,
    isWishlistLoading,
    onWishlistToggle,
  }: ProductCardProps) => {
    const [imageError, setImageError] = useState(false)

    const image =
      product.images?.[0] ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
  const compareAtPrice = product.compareAtPrice ?? 0

  const hasDiscount =
    compareAtPrice > product.price

  const discountPercent = hasDiscount
    ? Math.round(
        ((compareAtPrice - product.price) /
          compareAtPrice) *
          100,
      )
    : 0

    const rating = Number(product.rating || 0)
    const isOutOfStock = product.stock <= 0
    const isLowStock = product.stock > 0 && product.stock <= 5

    return (
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
        className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50"
      >
        <div className="relative">
          <Link to={`/product/${product.slug}`} className="block">
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-violet-50/70" />

              {!imageError ? (
                <img
                  src={image}
                  alt={product.name}
                  className="relative h-full w-full object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-110 sm:p-7"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="relative flex h-full w-full flex-col items-center justify-center px-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <ShoppingBag className="h-8 w-8" />
                  </div>

                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Vistora
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-600">
                    {product.name}
                  </p>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </Link>

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="rounded-full bg-violet-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-violet-600/20">
                {discountPercent}% OFF
              </span>
            )}

            {isOutOfStock && (
              <span className="rounded-full bg-slate-950/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                Out of Stock
              </span>
            )}

            {isLowStock && (
              <span className="rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-lg">
                Only {product.stock} left
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onWishlistToggle(product._id)
            }}
            disabled={isWishlistLoading}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 ${
              isWishlisted
                ? 'border-red-100 bg-white text-red-500'
                : 'border-white/80 bg-white/90 text-slate-600 hover:border-violet-100 hover:bg-violet-50 hover:text-violet-600'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isWishlistLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart
                className={`h-5 w-5 ${
                  isWishlisted ? 'fill-current' : ''
                }`}
              />
            )}
          </motion.button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 sm:text-[11px]">
              {product.brand || product.category}
            </p>

            {rating > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">
                {String.fromCharCode(0x2605)} {rating.toFixed(1)}
              </span>
            )}
          </div>

          <Link to={`/product/${product.slug}`}>
            <h2 className="mt-2 line-clamp-2 min-h-11 text-sm font-extrabold leading-5 text-slate-900 transition-colors duration-200 group-hover:text-violet-600 sm:text-base">
              {product.name}
            </h2>
          </Link>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              {String.fromCharCode(0x20B9)}
              {product.price.toLocaleString('en-IN')}
            </span>

            {hasDiscount && (
              <span className="text-xs font-semibold text-slate-400 line-through sm:text-sm">
                {String.fromCharCode(0x20B9)}
                {product.compareAtPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span
              className={`text-[11px] font-bold ${
                isOutOfStock
                  ? 'text-red-500'
                  : isLowStock
                    ? 'text-amber-600'
                    : 'text-emerald-600'
              }`}
            >
              {isOutOfStock
                ? 'Currently unavailable'
                : isLowStock
                  ? 'Limited stock'
                  : 'In stock'}
            </span>

            {hasDiscount && (
              <span className="text-[10px] font-black uppercase tracking-wider text-violet-600">
                Deal
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-200"
          >
            <ShoppingBag className="h-4 w-4" />
            View Product
          </Link>
        </div>
      </motion.article>
    )
  },
)
export default Shop






















