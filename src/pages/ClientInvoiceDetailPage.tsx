import { useQuery } from "convex/react";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  sent: { label: "Pending", color: "text-blue-400", bg: "bg-blue-500/10" },
  viewed: { label: "Viewed", color: "text-purple-400", bg: "bg-purple-500/10" },
  paid: { label: "Paid", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  overdue: { label: "Overdue", color: "text-red-400", bg: "bg-red-500/10" },
};

export function ClientInvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const invoice = useQuery(
    api.clientPortal.getMyInvoice,
    invoiceId ? { invoiceId: invoiceId as Id<"invoices"> } : "skip"
  );

  if (invoice === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (invoice === null) {
    return (
      <div className="p-6 text-center">
        <FileText className="size-12 text-[#475569] mx-auto mb-4" />
        <h2 className="text-lg font-medium text-white mb-2">Invoice not found</h2>
        <Link to="/invoices" className="text-[#00b4ff] hover:underline text-sm">
          Back to invoices
        </Link>
      </div>
    );
  }

  const sc = statusConfig[invoice.status] ?? statusConfig.sent;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Invoices
        </Link>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-[#1e293b] text-[#94a3b8] hover:text-white hover:bg-[#111d33]"
        >
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>

      {/* Invoice Card — also used for print */}
      <div id="invoice-print" className="p-6 rounded-xl glow-border bg-[#0a1628]/60 print:bg-white print:text-black print:shadow-none print:border print:border-gray-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#00b4ff] print:text-blue-600 mb-1">
              PromoNexus LLC
            </h1>
            <p className="text-xs text-[#64748b] print:text-gray-500">
              Web Development for Commercial Businesses
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 justify-end mb-1">
              <h2 className="text-xl font-bold text-white print:text-black font-mono">
                {invoice.quoteNumber}
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-xs uppercase font-semibold ${sc.bg} ${sc.color} print:border print:border-gray-300`}>
                {sc.label}
              </span>
            </div>
            <p className="text-sm text-[#64748b] print:text-gray-500">
              Issued: {invoice.issueDate}
            </p>
            {invoice.dueDate && (
              <p className="text-sm text-[#f59e0b] print:text-orange-600">
                Due: {invoice.dueDate}
              </p>
            )}
            {invoice.paidDate && (
              <p className="text-sm text-emerald-400 print:text-green-600">
                Paid: {invoice.paidDate}
              </p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-[#1e293b] print:border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#020817] print:bg-gray-100 text-[#64748b] print:text-gray-600">
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-right px-4 py-3 font-medium w-20">Qty</th>
                <th className="text-right px-4 py-3 font-medium w-28">Unit Price</th>
                <th className="text-right px-4 py-3 font-medium w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-t border-[#1e293b] print:border-gray-200 text-[#cbd5e1] print:text-gray-800"
                >
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${(item.unitPrice / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${(item.total / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 ml-auto w-72 space-y-2">
          <div className="flex justify-between text-sm text-[#94a3b8] print:text-gray-600">
            <span>Subtotal</span>
            <span className="font-mono">${(invoice.subtotal / 100).toFixed(2)}</span>
          </div>
          {invoice.taxRate && invoice.taxAmount ? (
            <div className="flex justify-between text-sm text-[#94a3b8] print:text-gray-600">
              <span>Tax ({invoice.taxRate}%)</span>
              <span className="font-mono">${(invoice.taxAmount / 100).toFixed(2)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-lg font-bold text-white print:text-black border-t border-[#1e293b] print:border-gray-200 pt-2">
            <span>Total</span>
            <span className="text-[#00b4ff] print:text-blue-600 font-mono">
              ${(invoice.total / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 p-4 rounded-lg bg-[#020817] print:bg-gray-50 border border-[#1e293b] print:border-gray-200">
            <p className="text-xs text-[#64748b] print:text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-[#94a3b8] print:text-gray-700 whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mt-6 p-4 rounded-lg bg-[#020817] print:bg-gray-50 border border-[#1e293b] print:border-gray-200">
          <p className="text-xs text-[#64748b] print:text-gray-500 mb-3 uppercase tracking-wider font-medium">
            Payment Methods
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#94a3b8] print:text-gray-600">CashApp</span>
              <span className="text-white print:text-black font-medium">$promonexuswebdesign</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8] print:text-gray-600">PayPal</span>
              <span className="text-white print:text-black font-medium">@EricTomchik</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8] print:text-gray-600">Venmo</span>
              <span className="text-white print:text-black font-medium">@PromoNexusLLC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8] print:text-gray-600">Zelle</span>
              <span className="text-white print:text-black font-medium">(228) 344-5724</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8] print:text-gray-600">Apple Cash</span>
              <span className="text-white print:text-black font-medium">(228) 344-5724</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
