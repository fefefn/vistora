import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

type RefundStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "processing"
  | "completed";

interface RefundOrder {
  _id: string;
  orderNumber: string;
  total: number;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

interface RefundRequest {
  _id: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
  order: RefundOrder;
}

interface RefundResponse {
  success: boolean;
  data: RefundRequest[];
}

const rupee = String.fromCharCode(0x20b9);

const statusLabel: Record<RefundStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  processing: "Processing",
  completed: "Completed",
};

const statusClasses: Record<RefundStatus, string> = {
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const StatusIcon = ({ status }: { status: RefundStatus }) => {
  if (status === "completed") {
    return <CheckCircle2 size={16} />;
  }

  if (status === "rejected") {
    return <XCircle size={16} />;
  }

  if (status === "processing") {
    return <RefreshCw size={16} />;
  }

  if (status === "approved") {
    return <CheckCircle2 size={16} />;
  }

  return <Clock3 size={16} />;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Refunds = () => {
  const navigate = useNavigate();

  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<RefundResponse>("/refunds");

      setRefunds(response.data.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load refund history.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <RotateCcw size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Refunds
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Track your refund requests and refund status.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchRefunds}
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
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-brand-600"
            />
            <p className="mt-3 text-sm text-slate-500">
              Loading refunds...
            </p>
          </div>
        ) : refunds.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <RotateCcw size={26} className="text-slate-500" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No refund requests
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Your refund requests will appear here after you submit one
              for an eligible order.
            </p>

            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              View My Orders
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map((refund) => (
              <div
                key={refund._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {refund.order.orderNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Requested on {formatDate(refund.createdAt)}
                    </p>

                    <div className="mt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Reason
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {refund.reason}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {rupee}
                      {refund.amount.toLocaleString("en-IN")}
                    </p>

                    <span
                      className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[refund.status]}`}
                    >
                      <StatusIcon status={refund.status} />
                      {statusLabel[refund.status]}
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">
                        Payment Method
                      </p>

                      <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                        {refund.order.paymentMethod === "razorpay"
                          ? "Razorpay"
                          : "Cash on Delivery"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Order Total
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {rupee}
                        {refund.order.total.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {refund.adminNote && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Admin Note
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {refund.adminNote}
                    </p>
                  </div>
                )}

                {refund.processedAt && (
                  <p className="mt-4 text-xs text-slate-500">
                    Processed on {formatDate(refund.processedAt)}
                  </p>
                )}

                <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
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

export default Refunds;
