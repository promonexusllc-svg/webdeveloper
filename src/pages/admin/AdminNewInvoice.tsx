import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, DollarSign, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number; // dollars (display) — stored as cents
  total: number; // dollars
}

export default function AdminNewInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClient = searchParams.get("client") ?? "";
  const clients = useQuery(api.admin.listClients, {});
  const createInvoice = useMutation(api.admin.createInvoice);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(preselectedClient);
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    setLineItems((prev) => {
      const items = [...prev];
      const item = { ...items[index] };
      if (field === "description") {
        item.description = value;
      } else if (field === "quantity") {
        item.quantity = Math.max(1, parseInt(value) || 1);
      } else if (field === "unitPrice") {
        item.unitPrice = parseFloat(value) || 0;
      }
      item.total = item.quantity * item.unitPrice;
      items[index] = item;
      return items;
    });
  }

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = taxRate > 0 ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + taxAmount;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }
    if (lineItems.length === 0 || lineItems.some((i) => !i.description)) {
      toast.error("Please fill out all line items");
      return;
    }
    setLoading(true);
    try {
      const result = await createInvoice({
        clientId,
        dueDate: dueDate || undefined,
        lineItems: lineItems.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: Math.round(i.unitPrice * 100),
          total: Math.round(i.total * 100),
        })),
        subtotal: Math.round(subtotal * 100),
        taxRate: taxRate > 0 ? taxRate : undefined,
        taxAmount: taxRate > 0 ? Math.round(taxAmount * 100) : undefined,
        total: Math.round(total * 100),
        notes: notes || undefined,
      });
      toast.success(`Invoice ${result.quoteNumber} created!`);
      navigate(`/admin/invoices/${result.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create invoice");
    } finally {
      setLoading(false);
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

      <div>
        <h1 className="text-2xl font-bold text-white">Create Invoice</h1>
        <p className="text-[#64748b] mt-1">
          A unique quote number will be auto-generated (INV-YYYY-XXXX)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client & Due Date */}
        <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">
                Client *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-md px-3 py-2 bg-[#020817] border border-[#1e293b] text-white text-sm"
                required
              >
                <option value="">Select client...</option>
                {clients?.map((c) => (
                  <option key={c._id} value={c.clientId}>
                    {c.clientId} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[#020817] border-[#1e293b] text-white"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60 space-y-4">
          <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
            Line Items
          </h3>

          <div className="space-y-3">
            {/* Header row */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_120px_100px_40px] gap-2 text-xs text-[#475569] px-1">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit Price</span>
              <span>Total</span>
              <span />
            </div>

            {lineItems.map((item, idx) => (
              <div
                key={idx}
                className="grid sm:grid-cols-[1fr_80px_120px_100px_40px] gap-2 items-start"
              >
                <Input
                  placeholder="Service description..."
                  value={item.description}
                  onChange={(e) =>
                    updateLineItem(idx, "description", e.target.value)
                  }
                  className="bg-[#020817] border-[#1e293b] text-white text-sm"
                />
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(idx, "quantity", e.target.value)
                  }
                  className="bg-[#020817] border-[#1e293b] text-white text-sm"
                />
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#475569]" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice || ""}
                    onChange={(e) =>
                      updateLineItem(idx, "unitPrice", e.target.value)
                    }
                    className="bg-[#020817] border-[#1e293b] text-white text-sm pl-7"
                    placeholder="0.00"
                  />
                </div>
                <p className="flex items-center h-9 text-sm text-white font-mono">
                  ${item.total.toFixed(2)}
                </p>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(idx)}
                    className="flex items-center justify-center h-9 text-red-400/60 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineItem}
            className="border-[#1e293b] text-[#94a3b8] hover:border-[#00b4ff40] hover:text-white"
          >
            <Plus className="size-4" />
            Add Line Item
          </Button>

          {/* Totals */}
          <div className="border-t border-[#1e293b] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#64748b]">Subtotal</span>
              <span className="text-white font-mono">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#64748b] flex items-center gap-2">
                Tax Rate
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={taxRate || ""}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-[#020817] border-[#1e293b] text-white text-sm h-7"
                  placeholder="0"
                />
                %
              </span>
              <span className="text-white font-mono">
                ${taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#1e293b]">
              <span className="text-white">Total</span>
              <span className="text-[#00b4ff]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60">
          <label className="block text-sm text-[#94a3b8] mb-1.5">Notes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-[#020817] border-[#1e293b] text-white min-h-[80px]"
            placeholder="Payment terms, project milestones, etc."
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] font-semibold h-11"
        >
          <DollarSign className="size-4" />
          {loading ? "Creating..." : "Create Invoice"}
        </Button>
      </form>
    </div>
  );
}
