import { useQuery } from "convex/react";
import { TicketIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400",
  in_progress: "bg-amber-500/10 text-amber-400",
  awaiting_response: "bg-purple-500/10 text-purple-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-gray-500/10 text-gray-400",
};

const priorityColors: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-blue-400",
  high: "text-amber-400",
  urgent: "text-red-400",
};

export default function AdminTickets() {
  const [statusFilter, setStatusFilter] = useState("");
  const tickets = useQuery(api.tickets.list);

  const filtered = tickets?.filter(
    (t) => !statusFilter || t.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <p className="text-[#64748b] mt-1">
          All tickets submitted by clients
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "open", "in_progress", "awaiting_response", "resolved", "closed"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === s
                  ? "bg-[#00b4ff] text-[#020817] font-medium"
                  : "bg-[#0a1628] text-[#64748b] border border-[#1e293b] hover:text-white"
              }`}
            >
              {s === ""
                ? "All"
                : s
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          )
        )}
      </div>

      {!filtered ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <TicketIcon className="size-12 text-[#1e293b] mx-auto mb-3" />
          <p className="text-[#64748b] text-lg">No tickets</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Link
              key={t._id}
              to={`/tickets/${t._id}`}
              className="block p-4 rounded-xl glow-border bg-[#0a1628]/60 hover:bg-[#0a1628]/80 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {t.subject}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${statusColors[t.status]}`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b]">
                    {t.category.replace("_", " ")} ·{" "}
                    <span className={priorityColors[t.priority]}>
                      {t.priority}
                    </span>{" "}
                    priority
                    {t._creationTime &&
                      ` · ${new Date(t._creationTime).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
