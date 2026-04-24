import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Check,
  DollarSign,
  Send,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const statusConfig: Record<string, { color: string; bg: string }> = {
  draft: { color: "text-gray-400", bg: "bg-gray-500/10" },
  sent: { color: "text-blue-400", bg: "bg-blue-500/10" },
  viewed: { color: "text-purple-400", bg: "bg-purple-500/10" },
  paid: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  overdue: { color: "text-red-400", bg: "bg-red-500/10" },
  cancelled: { color: "text-gray-400", bg: "bg-gray-500/10" },
};

export default function AdminInvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const invoice = useQuery(
    api.admin.getInvoice,
    invoiceId ? { id: invoiceId as Id<"invoices"> } : "skip"
  );
  const client = useQuery(
    api.admin.getClient,
    invoice ? { clientId: invoice.clientId } : "skip"
  );
  const updateStatus = useMutation(api.admin.updateInvoiceStatus);
  const sendToClient = useMutation(api.admin.sendInvoice);

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sc = statusConfig[invoice.status] ?? statusConfig.draft;

  async function markAs(
    status: "sent" | "paid" | "cancelled",
    paymentMethod?: string
  ) {
    try {
      await updateStatus({
        id: invoice!._id,
        status,
        paidDate:
          status === "paid"
            ? new Date().toISOString().split("T")[0]
            : undefined,
        paymentMethod,
      });
      toast.success(`Invoice marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/admin/invoices"
        className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-white transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Invoices
      </Link>

      {/* Invoice Header */}
      <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white font-mono">
                {invoice.quoteNumber}
              </h1>
              <span
                className={`px-2.5 py-1 rounded-full text-xs uppercase font-semibold ${sc.bg} ${sc.color}`}
              >
                {invoice.status}
              </span>
            </div>
            {client && (
              <Link
                to={`/admin/clients/${client.clientId}`}
                className="text-sm text-[#00b4ff] hover:underline"
              >
                {client.name} ({client.clientId})
              </Link>
            )}
          </div>
          <div className="text-right text-sm text-[#64748b]">
            <p>Issued: {invoice.issueDate}</p>
            {invoice.dueDate && <p>Due: {invoice.dueDate}</p>}
            {invoice.paidDate && (
              <p className="text-emerald-400">Paid: {invoice.paidDate}</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-[#1e293b] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#020817] text-[#64748b]">
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-right px-4 py-3 font-medium w-20">Qty</th>
                <th className="text-right px-4 py-3 font-medium w-28">
                  Unit Price
                </th>
                <th className="text-right px-4 py-3 font-medium w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-t border-[#1e293b] text-[#cbd5e1]"
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
          <div className="flex justify-between text-sm text-[#94a3b8]">
            <span>Subtotal</span>
            <span className="font-mono">
              ${(invoice.subtotal / 100).toFixed(2)}
            </span>
          </div>
          {invoice.taxRate && invoice.taxAmount ? (
            <div className="flex justify-between text-sm text-[#94a3b8]">
              <span>Tax ({invoice.taxRate}%)</span>
              <span className="font-mono">
                ${(invoice.taxAmount / 100).toFixed(2)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between text-lg font-bold text-white border-t border-[#1e293b] pt-2">
            <span>Total</span>
            <span className="text-[#00b4ff] font-mono">
              ${(invoice.total / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 p-4 rounded-lg bg-[#020817] border border-[#1e293b]">
            <p className="text-xs text-[#64748b] mb-1">Notes</p>
            <p className="text-sm text-[#94a3b8] whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {invoice.status !== "paid" && invoice.status !== "cancelled" && (
        <div className="flex flex-wrap gap-3">
          {invoice.status === "draft" && (
            <Button
              onClick={async () => {
                try {
                  await sendToClient({ id: invoice!._id });
                  toast.success("Invoice sent to client! Email will be delivered shortly.");
                } catch (err: any) {
                  toast.error(err.message ?? "Failed to send invoice");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="size-4" />
              Send to Client
            </Button>
          )}
          <Button
            onClick={() => {
              const method = prompt(
                "Payment method? (CashApp, PayPal, Venmo, Zelle, Other)"
              );
              if (method !== null) markAs("paid", method || undefined);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="size-4" />
            Mark as Paid
          </Button>
          <Button
            variant="outline"
            onClick={() => markAs("cancelled")}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <XCircle className="size-4" />
            Cancel Invoice
          </Button>
        </div>
      )}

      {invoice.paymentMethod && (
        <p className="text-sm text-[#64748b]">
          <DollarSign className="size-3.5 inline" /> Payment method:{" "}
          <span className="text-white">{invoice.paymentMethod}</span>
        </p>
      )}
    </div>
  );
}
