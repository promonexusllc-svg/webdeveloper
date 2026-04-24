import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  open: { label: "Open", color: "text-[#00b4ff]", bgColor: "bg-[#00b4ff15] border-[#00b4ff30]", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "text-[#f59e0b]", bgColor: "bg-[#f59e0b15] border-[#f59e0b30]", icon: Clock },
  awaiting_response: { label: "Awaiting Response", color: "text-[#a78bfa]", bgColor: "bg-[#a78bfa15] border-[#a78bfa30]", icon: MessageSquare },
  resolved: { label: "Resolved", color: "text-[#22c55e]", bgColor: "bg-[#22c55e15] border-[#22c55e30]", icon: CheckCircle2 },
  closed: { label: "Closed", color: "text-[#64748b]", bgColor: "bg-[#64748b15] border-[#64748b30]", icon: XCircle },
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

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-[#64748b]" },
  medium: { label: "Medium", color: "text-[#00b4ff]" },
  high: { label: "High", color: "text-[#f59e0b]" },
  urgent: { label: "Urgent", color: "text-[#ef4444]" },
};

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const ticket = useQuery(api.tickets.get, ticketId ? { ticketId: ticketId as Id<"tickets"> } : "skip");
  const messages = useQuery(api.tickets.getMessages, ticketId ? { ticketId: ticketId as Id<"tickets"> } : "skip");
  const addMessage = useMutation(api.tickets.addMessage);
  const closeTicket = useMutation(api.tickets.closeTicket);

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticketId) return;
    setSending(true);
    try {
      await addMessage({
        ticketId: ticketId as Id<"tickets">,
        message: newMessage.trim(),
      });
      setNewMessage("");
      toast.success("Message sent!");
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!ticketId) return;
    try {
      await closeTicket({ ticketId: ticketId as Id<"tickets"> });
      toast.success("Ticket closed.");
    } catch {
      toast.error("Failed to close ticket.");
    }
  };

  if (ticket === undefined) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-6 text-[#00b4ff] animate-spin" />
      </div>
    );
  }

  if (ticket === null) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold text-white mb-2">Ticket not found</h2>
        <p className="text-sm text-[#64748b] mb-4">This ticket doesn't exist or you don't have access.</p>
        <Button asChild variant="outline" className="border-[#1e293b] text-[#94a3b8]">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const status = statusConfig[ticket.status] ?? statusConfig.open;
  const StatusIcon = status.icon;
  const priority = priorityConfig[ticket.priority] ?? priorityConfig.medium;
  const isClosed = ticket.status === "closed";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#00b4ff] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      {/* Ticket header */}
      <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.bgColor} ${status.color}`}>
                <StatusIcon className="size-3" />
                {status.label}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#111d33] border border-[#1e293b] text-[#94a3b8]">
                {categoryLabels[ticket.category] ?? ticket.category}
              </span>
              <span className={`text-xs font-medium ${priority.color}`}>
                {priority.label} Priority
              </span>
            </div>
          </div>
          {!isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="border-[#1e293b] text-[#64748b] hover:text-[#ef4444] hover:border-[#ef444440]"
            >
              <XCircle className="size-4" />
              Close Ticket
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-[#475569]">
          <span>Created {new Date(ticket._creationTime).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          {ticket.projectUrl && (
            <>
              <span>·</span>
              <a
                href={ticket.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00b4ff] hover:underline"
              >
                View Project ↗
              </a>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
          Conversation
        </h2>

        {messages === undefined ? (
          <div className="p-8 text-center">
            <Loader2 className="size-5 text-[#00b4ff] animate-spin mx-auto" />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748b] rounded-xl glow-border bg-[#0a1628]/60">
            No messages yet.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-4 rounded-xl border ${
                msg.isStaff
                  ? "bg-[#00b4ff08] border-[#00b4ff20]"
                  : "bg-[#0a1628]/60 border-[#1e293b]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  msg.isStaff
                    ? "bg-[#00b4ff20] text-[#00b4ff]"
                    : "bg-[#111d33] text-[#94a3b8]"
                }`}>
                  {msg.userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white">
                  {msg.userName}
                  {msg.isStaff && (
                    <span className="ml-1.5 text-xs text-[#00b4ff] font-normal">Staff</span>
                  )}
                </span>
                <span className="text-xs text-[#475569]">
                  {new Date(msg._creationTime).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Reply form */}
      {!isClosed && (
        <form onSubmit={handleSendMessage} className="space-y-3">
          <Textarea
            rows={3}
            placeholder="Type your reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff] resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] glow-btn"
            >
              {sending ? "Sending..." : "Send Reply"}
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      )}

      {isClosed && (
        <div className="p-4 rounded-xl bg-[#111d33]/50 border border-[#1e293b] text-center text-sm text-[#64748b]">
          This ticket is closed. Create a new ticket if you need further assistance.
        </div>
      )}
    </div>
  );
}
