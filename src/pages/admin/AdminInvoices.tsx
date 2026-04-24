import { useQuery } from "convex/react";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  sent: "bg-blue-500/10 text-blue-400",
  viewed: "bg-purple-500/10 text-purple-400",
  paid: "bg-emerald-500/10 text-emerald-400",
  overdue: "bg-red-500/10 text-red-400",
  cancelled: "bg-gray-500/10 text-gray-500",
};

export default function AdminInvoices() {
  const [statusFilter, setStatusFilter] = useState("");
  const invoices = useQuery(api.admin.listInvoices, {
    status: statusFilter || undefined,
  });
  const clients = useQuery(api.admin.listClients, {});

  const clientMap = new Map(clients?.map((c) => [c.clientId, c]) ?? []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-[#64748b] mt-1">
            {invoices?.length ?? 0} invoice{invoices?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/admin/invoices/new">
          <Button className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] font-semibold">
            <Plus className="size-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              statusFilter === s
                ? "bg-[#00b4ff] text-[#020817] font-medium"
                : "bg-[#0a1628] text-[#64748b] border border-[#1e293b] hover:text-white"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {!invoices ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="size-12 text-[#1e293b] mx-auto mb-3" />
          <p className="text-[#64748b] text-lg mb-1">No invoices yet</p>
          <Link to="/admin/invoices/new">
            <Button className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] mt-4">
              <Plus className="size-4" />
              Create First Invoice
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const client = clientMap.get(inv.clientId);
            return (
              <Link
                key={inv._id}
                to={`/admin/invoices/${inv._id}`}
                className="block p-4 rounded-xl glow-border bg-[#0a1628]/60 hover:bg-[#0a1628]/80 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-mono font-semibold">
                        {inv.quoteNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${statusColors[inv.status]}`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748b]">
                      {client ? (
                        <>
                          {client.name}{" "}
                          <span className="text-[#475569]">
                            ({inv.clientId})
                          </span>
                        </>
                      ) : (
                        inv.clientId
                      )}{" "}
                      · {inv.lineItems.length} item
                      {inv.lineItems.length !== 1 ? "s" : ""} · {inv.issueDate}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-white shrink-0 font-mono">
                    ${(inv.total / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
