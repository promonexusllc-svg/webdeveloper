import { useQuery } from "convex/react";
import {
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  sent: { label: "Pending", color: "text-blue-400", bg: "bg-blue-500/10" },
  viewed: { label: "Viewed", color: "text-purple-400", bg: "bg-purple-500/10" },
  paid: { label: "Paid", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  overdue: { label: "Overdue", color: "text-red-400", bg: "bg-red-500/10" },
};

export function ClientInvoicesPage() {
  const invoices = useQuery(api.clientPortal.getMyInvoices);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-sm text-[#64748b] mt-1">
          View and track your invoices and payments.
        </p>
      </div>

      {/* Summary Cards */}
      {invoices && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl glow-border bg-[#0a1628]/60">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#00b4ff10] border border-[#00b4ff20] flex items-center justify-center">
                <FileText className="size-5 text-[#00b4ff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{invoices.length}</div>
                <div className="text-xs text-[#64748b]">Total Invoices</div>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl glow-border bg-[#0a1628]/60">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#f59e0b10] border border-[#f59e0b20] flex items-center justify-center">
                <DollarSign className="size-5 text-[#f59e0b]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  ${(invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.total, 0) / 100).toFixed(2)}
                </div>
                <div className="text-xs text-[#64748b]">Outstanding</div>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl glow-border bg-[#0a1628]/60">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#22c55e10] border border-[#22c55e20] flex items-center justify-center">
                <DollarSign className="size-5 text-[#22c55e]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  ${(invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0) / 100).toFixed(2)}
                </div>
                <div className="text-xs text-[#64748b]">Paid</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="rounded-xl glow-border bg-[#0a1628]/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e293b]">
          <h2 className="font-semibold text-white">Your Invoices</h2>
        </div>

        {invoices === undefined ? (
          <div className="p-12 text-center">
            <Loader2 className="size-6 text-[#00b4ff] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#64748b]">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="size-14 rounded-xl bg-[#111d33] border border-[#1e293b] flex items-center justify-center mx-auto mb-4">
              <FileText className="size-6 text-[#475569]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No invoices yet</h3>
            <p className="text-sm text-[#64748b]">
              Invoices will appear here when they're sent to you.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {invoices.map((invoice) => {
              const sc = statusConfig[invoice.status] ?? statusConfig.sent;
              return (
                <Link
                  key={invoice._id}
                  to={`/invoices/${invoice._id}`}
                  className="block px-6 py-4 hover:bg-[#111d33]/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white font-mono">
                          {invoice.quoteNumber}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#64748b]">
                        <span>Issued: {invoice.issueDate}</span>
                        {invoice.dueDate && (
                          <>
                            <span>·</span>
                            <span>Due: {invoice.dueDate}</span>
                          </>
                        )}
                        {invoice.paidDate && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-400">Paid: {invoice.paidDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#00b4ff] font-mono">
                        ${(invoice.total / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
