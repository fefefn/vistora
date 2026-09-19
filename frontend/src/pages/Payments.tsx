import { useEffect, useState } from "react";
import { ArrowRight, CreditCard, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

type PaymentMethod = "cod" | "razorpay";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface Payment {
  id: string;
  orderNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: string;
  createdAt: string;
}

interface PaymentResponse {
  success: boolean;
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const rupee = String.fromCharCode(0x20b9);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const statusClasses: Record<PaymentStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-blue-50 text-blue-700 border-blue-200",
};

const statusLabel: Record<PaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

const Payments = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<PaymentResponse>(
        "/payments/history?limit=20",
      );

      setPayments(response.data.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load payment history.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Payments
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View your payment history and transaction details.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-brand-600"
            />
            <p className="mt-3 text-sm text-slate-500">
              Loading payment history...
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <CreditCard size={26} className="text-slate-500" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No payments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Your payment history will appear here after you place an order.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Start Shopping
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <CreditCard
                        size={21}
                        className="text-slate-700"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {payment.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(payment.createdAt)}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        {payment.paymentMethod === "razorpay"
                          ? "Razorpay"
                          : "Cash on Delivery"}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {rupee}
                      {payment.amount.toLocaleString("en-IN")}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[payment.paymentStatus]}`}
                    >
                      {statusLabel[payment.paymentStatus]}
                    </span>
                  </div>
                </div>

                {payment.paymentMethod === "razorpay" &&
                  payment.razorpayPaymentId && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs text-slate-500">
                        Transaction ID
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-700">
                        {payment.razorpayPaymentId}
                      </p>
                    </div>
                  )}

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Order status:{" "}
                    <span className="font-semibold capitalize text-slate-700">
                      {payment.orderStatus.replaceAll("_", " ")}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Order
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
