import { useQuery } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  TicketIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: "Open", color: "text-[#00b4ff] bg-[#00b4ff15] border-[#00b4ff30]", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "text-[#f59e0b] bg-[#f59e0b15] border-[#f59e0b30]", icon: Loader2 },
  awaiting_response: { label: "Awaiting Response", color: "text-[#a78bfa] bg-[#a78bfa15] border-[#a78bfa30]", icon: MessageSquare },
  resolved: { label: "Resolved", color: "text-[#22c55e] bg-[#22c55e15] border-[#22c55e30]", icon: CheckCircle2 },
  closed: { label: "Closed", color: "text-[#64748b] bg-[#64748b15] border-[#64748b30]", icon: CheckCircle2 },
};

const priorityColors: Record<string, string> = {
  low: "text-[#64748b]",
  medium: "text-[#00b4ff]",
  high: "text-[#f59e0b]",
  urgent: "text-[#ef4444]",
};

const categoryLabels: Record<string, string> = {
  bug_fix: "Bug Fix",
  feature_request: "Feature Request",
  general_support: "General Support",
  billing: "Billing",
  design_change: "Design Change",
  hosting: "Hosting",
  other: "Other",
};

export function DashboardPage() {
  const tickets = useQuery(api.tickets.list);

  const openCount = tickets?.filter((t) => t.status === "open" || t.status === "in_progress").length ?? 0;
  const resolvedCount = tickets?.filter((t) => t.status === "resolved" || t.status === "closed").length ?? 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Dashboard</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Manage your support tickets and get help with your projects.
          </p>
        </div>
        <Button
          asChild
          className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] glow-btn"
        >
          <Link to="/tickets/new">
            <Plus className="size-4" />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl glow-border bg-[#0a1628]/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[#00b4ff10] border border-[#00b4ff20] flex items-center justify-center">
              <TicketIcon className="size-5 text-[#00b4ff]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{tickets?.length ?? "—"}</div>
              <div className="text-xs text-[#64748b]">Total Tickets</div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl glow-border bg-[#0a1628]/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[#f59e0b10] border border-[#f59e0b20] flex items-center justify-center">
              <Clock className="size-5 text-[#f59e0b]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{openCount}</div>
              <div className="text-xs text-[#64748b]">Active</div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl glow-border bg-[#0a1628]/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[#22c55e10] border border-[#22c55e20] flex items-center justify-center">
              <CheckCircle2 className="size-5 text-[#22c55e]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{resolvedCount}</div>
              <div className="text-xs text-[#64748b]">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="rounded-xl glow-border bg-[#0a1628]/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
          <h2 className="font-semibold text-white">Your Tickets</h2>
        </div>

        {tickets === undefined ? (
          <div className="p-12 text-center">
            <Loader2 className="size-6 text-[#00b4ff] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#64748b]">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="size-14 rounded-xl bg-[#111d33] border border-[#1e293b] flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="size-6 text-[#475569]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No tickets yet</h3>
            <p className="text-sm text-[#64748b] mb-4">
              Create your first support ticket to get help with your project.
            </p>
            <Button
              asChild
              size="sm"
              className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd]"
            >
              <Link to="/tickets/new">
                <Plus className="size-4" />
                Create Ticket
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status] ?? statusConfig.open;
              const StatusIcon = status.icon;
              return (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="block px-6 py-4 hover:bg-[#111d33]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white truncate">
                          {ticket.subject}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                          <StatusIcon className="size-3" />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#64748b]">
                        <span>{categoryLabels[ticket.category] ?? ticket.category}</span>
                        <span>·</span>
                        <span className={priorityColors[ticket.priority]}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} priority
                        </span>
                        <span>·</span>
                        <span>{new Date(ticket._creationTime).toLocaleDateString()}</span>
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
