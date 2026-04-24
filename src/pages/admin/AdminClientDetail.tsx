import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  ExternalLink,
  FileText,
  FolderOpen,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  StickyNote,
  TicketIcon,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

const projectStatusColors: Record<string, string> = {
  inquiry: "bg-gray-500/10 text-gray-400",
  proposal: "bg-purple-500/10 text-purple-400",
  in_progress: "bg-blue-500/10 text-blue-400",
  review: "bg-amber-500/10 text-amber-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  sent: "bg-blue-500/10 text-blue-400",
  viewed: "bg-purple-500/10 text-purple-400",
  paid: "bg-emerald-500/10 text-emerald-400",
  overdue: "bg-red-500/10 text-red-400",
  cancelled: "bg-gray-500/10 text-gray-400",
};

const ticketStatusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400",
  in_progress: "bg-amber-500/10 text-amber-400",
  awaiting_response: "bg-purple-500/10 text-purple-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-gray-500/10 text-gray-400",
};

const activityIcons: Record<string, string> = {
  client_created: "👤",
  project_created: "📁",
  project_updated: "🔄",
  ticket_created: "🎫",
  ticket_resolved: "✅",
  invoice_created: "📄",
  invoice_sent: "📤",
  payment_received: "💰",
  contact_submitted: "📬",
  note_added: "📝",
  communication: "💬",
  revision_requested: "✏️",
};

export default function AdminClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const client = useQuery(api.admin.getClient, { clientId: clientId ?? "" });
  const projects = useQuery(api.admin.getClientProjects, {
    clientId: clientId ?? "",
  });
  const invoices = useQuery(api.admin.getClientInvoices, {
    clientId: clientId ?? "",
  });
  const tickets = useQuery(api.admin.getClientTickets, {
    clientId: clientId ?? "",
  });
  const activity = useQuery(api.admin.getClientActivity, {
    clientId: clientId ?? "",
  });
  const addNote = useMutation(api.admin.addNote);

  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [tab, setTab] = useState<
    "overview" | "projects" | "invoices" | "tickets" | "activity"
  >("overview");

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: User },
    {
      key: "projects" as const,
      label: `Projects (${projects?.length ?? 0})`,
      icon: FolderOpen,
    },
    {
      key: "invoices" as const,
      label: `Invoices (${invoices?.length ?? 0})`,
      icon: FileText,
    },
    {
      key: "tickets" as const,
      label: `Tickets (${tickets?.length ?? 0})`,
      icon: TicketIcon,
    },
    { key: "activity" as const, label: "Activity", icon: Calendar },
  ];

  const totalPaid =
    invoices
      ?.filter((i) => i.status === "paid")
      .reduce((s, i) => s + i.total, 0) ?? 0;
  const totalPending =
    invoices
      ?.filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((s, i) => s + i.total, 0) ?? 0;

  async function handleAddNote() {
    if (!noteText.trim() || !clientId) return;
    setAddingNote(true);
    try {
      await addNote({
        clientId,
        title: noteText.trim(),
      });
      setNoteText("");
      toast.success("Note added");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/admin/clients"
        className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-white transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Clients
      </Link>

      {/* Client Header */}
      <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="size-16 rounded-xl bg-[#00b4ff10] border border-[#00b4ff20] flex items-center justify-center text-[#00b4ff] font-bold text-lg shrink-0">
            {client.clientId.replace("PN-", "#")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-xs uppercase font-semibold tracking-wider ${
                  client.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : client.status === "prospect"
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-gray-500/10 text-gray-400"
                }`}
              >
                {client.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#64748b]">
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" /> {client.email}
              </span>
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {client.phone}
                </span>
              )}
              {client.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5" /> {client.company}
                </span>
              )}
              {client.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {client.address}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-emerald-400">
                ${(totalPaid / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[#475569]">Total Paid</p>
            </div>
            {totalPending > 0 && (
              <div>
                <p className="text-lg font-bold text-amber-400">
                  ${(totalPending / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-[#475569]">Pending</p>
              </div>
            )}
          </div>
        </div>
        {client.notes && (
          <p className="mt-4 text-sm text-[#64748b] border-t border-[#1e293b] pt-4">
            <StickyNote className="size-3.5 inline mr-1.5" />
            {client.notes}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e293b] overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === key
                ? "border-[#00b4ff] text-[#00b4ff]"
                : "border-transparent text-[#64748b] hover:text-white"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick stats */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
              Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-[#0a1628] border border-[#1e293b]">
                <FolderOpen className="size-4 text-[#8b5cf6] mb-1" />
                <p className="text-xl font-bold text-white">
                  {projects?.length ?? 0}
                </p>
                <p className="text-xs text-[#64748b]">Projects</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0a1628] border border-[#1e293b]">
                <FileText className="size-4 text-[#00b4ff] mb-1" />
                <p className="text-xl font-bold text-white">
                  {invoices?.length ?? 0}
                </p>
                <p className="text-xs text-[#64748b]">Invoices</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0a1628] border border-[#1e293b]">
                <TicketIcon className="size-4 text-[#f59e0b] mb-1" />
                <p className="text-xl font-bold text-white">
                  {tickets?.length ?? 0}
                </p>
                <p className="text-xs text-[#64748b]">Tickets</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0a1628] border border-[#1e293b]">
                <DollarSign className="size-4 text-[#10b981] mb-1" />
                <p className="text-xl font-bold text-white">
                  ${(totalPaid / 100).toFixed(2)}
                </p>
                <p className="text-xs text-[#64748b]">Revenue</p>
              </div>
            </div>
          </div>

          {/* Add note */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
              Quick Note
            </h3>
            <div className="p-4 rounded-lg bg-[#0a1628] border border-[#1e293b]">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note about this client..."
                className="bg-[#020817] border-[#1e293b] text-white min-h-[80px] mb-3"
              />
              <Button
                size="sm"
                disabled={!noteText.trim() || addingNote}
                onClick={handleAddNote}
                className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] text-xs"
              >
                <MessageSquare className="size-3" />
                {addingNote ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === "projects" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link to={`/admin/projects/new?client=${clientId}`}>
              <Button
                size="sm"
                className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd]"
              >
                <Plus className="size-4" />
                New Project
              </Button>
            </Link>
          </div>
          {!projects || projects.length === 0 ? (
            <p className="text-center text-[#64748b] py-12">
              No projects yet
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="p-4 rounded-xl bg-[#0a1628]/60 border border-[#1e293b] hover:border-[#00b4ff20] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold">{p.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${projectStatusColors[p.status]}`}
                        >
                          {p.status.replace("_", " ")}
                        </span>
                      </div>
                      {p.description && (
                        <p className="text-sm text-[#64748b] line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-[#475569]">
                        {p.projectType && <span>{p.projectType}</span>}
                        {p.startDate && <span>Started: {p.startDate}</span>}
                        {p.dueDate && <span>Due: {p.dueDate}</span>}
                        {p.totalValue && (
                          <span className="text-emerald-400">
                            ${(p.totalValue / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00b4ff]"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "invoices" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link to={`/admin/invoices/new?client=${clientId}`}>
              <Button
                size="sm"
                className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd]"
              >
                <Plus className="size-4" />
                New Invoice
              </Button>
            </Link>
          </div>
          {!invoices || invoices.length === 0 ? (
            <p className="text-center text-[#64748b] py-12">
              No invoices yet
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <Link
                  key={inv._id}
                  to={`/admin/invoices/${inv._id}`}
                  className="block p-4 rounded-xl bg-[#0a1628]/60 border border-[#1e293b] hover:border-[#00b4ff20] transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-mono font-semibold">
                          {inv.quoteNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${invoiceStatusColors[inv.status]}`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b]">
                        {inv.lineItems.length} item
                        {inv.lineItems.length !== 1 ? "s" : ""} · Issued{" "}
                        {inv.issueDate}
                        {inv.dueDate && ` · Due ${inv.dueDate}`}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-white">
                      ${(inv.total / 100).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "tickets" && (
        <div className="space-y-3">
          {!tickets || tickets.length === 0 ? (
            <p className="text-center text-[#64748b] py-12">No tickets yet</p>
          ) : (
            tickets.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-xl bg-[#0a1628]/60 border border-[#1e293b]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{t.subject}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${ticketStatusColors[t.status]}`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b]">
                      {t.category.replace("_", " ")} · {t.priority} priority
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-3">
          {!activity || activity.length === 0 ? (
            <p className="text-center text-[#64748b] py-12">
              No activity yet
            </p>
          ) : (
            activity.map((item) => (
              <div
                key={item._id}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#0a1628]/40"
              >
                <span className="text-lg mt-0.5">
                  {activityIcons[item.type] ?? "📌"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-[#475569] whitespace-nowrap">
                  {item._creationTime
                    ? new Date(item._creationTime).toLocaleString()
                    : ""}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
