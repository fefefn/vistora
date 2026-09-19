import { useEffect, useState } from "react";
import { Heart, Loader2, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getWishlist,
  removeFromWishlist,
  type Wishlist,
} from "@/services/wishlist.service";
import { addToCart } from "@/services/cart.service";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError("");
      setMessage("");

      const response = await getWishlist();
      setWishlist(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your wishlist.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      setRemovingId(productId);
      setError("");
      setMessage("");

      const response = await removeFromWishlist(productId);
      setWishlist(response.data);
      setMessage("Product removed from wishlist.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to remove product from wishlist.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (
    productId: string,
    productName: string,
  ) => {
    try {
      setAddingId(productId);
      setError("");
      setMessage("");

      await addToCart(productId, 1);

      setMessage(`${productName} added to cart.`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to add product to cart.",
      );
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
          <span className="font-medium">
            Loading your wishlist...
          </span>
        </div>
      </main>
    );
  }

  if (error && !wishlist) {
    const requiresLogin = error
      .toLowerCase()
      .includes("authentication");

    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Heart className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            {requiresLogin
              ? "Login required"
              : "Unable to load wishlist"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {requiresLogin
              ? "Please login to view and manage your wishlist."
              : error}
          </p>

          {requiresLogin ? (
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={loadWishlist}
              className="mt-6 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Try Again
            </button>
          )}
        </div>
      </main>
    );
  }

  const items = wishlist?.items ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Heart className="h-7 w-7 fill-red-500 text-red-500" />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                My Wishlist
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {items.length}{" "}
                {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-700">
              ✓ {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex min-h-[55vh] items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 shadow-sm">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <Heart className="h-10 w-10 text-red-300" />
              </div>

              <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
                Your wishlist is empty
              </h2>

              <p className="mt-2 leading-7 text-slate-500">
                Save products you love and come back to them anytime.
              </p>

              <Link
                to="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
              >
                Explore Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => {
              const image =
                product.images?.[0] ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

              const hasDiscount =
                Boolean(product.compareAtPrice) &&
                product.compareAtPrice! > product.price;

              const isRemoving = removingId === product._id;
              const isAdding = addingId === product._id;

              return (
                <article
                  key={product._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    {hasDiscount && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                        SALE
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      disabled={isRemoving || isAdding}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart className="h-5 w-5 fill-current" />
                      )}
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                      {product.brand || product.category}
                    </p>

                    <Link to={`/product/${product.slug}`}>
                      <h2 className="mt-1 line-clamp-2 min-h-12 text-base font-bold text-slate-900 transition hover:text-brand-600">
                        {product.name}
                      </h2>
                    </Link>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm font-semibold text-amber-500">
                        ★ {product.rating.toFixed(1)}
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          product.stock > 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.stock > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>

                      {hasDiscount && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹
                          {product.compareAtPrice?.toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(
                            product._id,
                            product.name,
                          )
                        }
                        disabled={
                          product.stock <= 0 ||
                          isAdding ||
                          isRemoving
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}

                        {isAdding ? "Adding..." : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(product._id)}
                        disabled={isRemoving || isAdding}
                        aria-label={`Delete ${product.name}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Wishlist;
