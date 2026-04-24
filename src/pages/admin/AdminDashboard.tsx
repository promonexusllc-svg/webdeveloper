import { useQuery } from "convex/react";
import {
  BarChart3,
  DollarSign,
  FolderOpen,
  TicketIcon,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "#00b4ff",
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="p-5 rounded-xl glow-border bg-[#0a1628]/60 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div
          className="size-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon className="size-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-[#64748b]">{label}</p>
      {sub && <p className="text-xs text-[#475569] mt-1">{sub}</p>}
    </div>
  );
}

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

export default function AdminDashboard() {
  const stats = useQuery(api.admin.getDashboardStats);
  const activity = useQuery(api.admin.getRecentActivity, { limit: 20 });

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-[#64748b] mt-1">
          Overview of clients, projects, and revenue
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Clients"
          value={stats.activeClients}
          sub={`${stats.totalClients} total`}
          color="#00b4ff"
        />
        <StatCard
          icon={FolderOpen}
          label="Active Projects"
          value={stats.activeProjects}
          sub={`${stats.totalProjects} total`}
          color="#8b5cf6"
        />
        <StatCard
          icon={TicketIcon}
          label="Open Tickets"
          value={stats.openTickets}
          color="#f59e0b"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${(stats.totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          sub={
            stats.pendingInvoiceCount > 0
              ? `$${(stats.pendingAmount / 100).toFixed(2)} pending (${stats.pendingInvoiceCount} invoices)`
              : undefined
          }
          color="#10b981"
        />
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60">
          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link
              to="/admin/clients/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-[#94a3b8] hover:text-white"
            >
              <Users className="size-4 text-[#00b4ff]" />
              New Client
            </Link>
            <Link
              to="/admin/invoices/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-[#94a3b8] hover:text-white"
            >
              <DollarSign className="size-4 text-[#10b981]" />
              Create Invoice
            </Link>
            <Link
              to="/admin/clients"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-[#94a3b8] hover:text-white"
            >
              <BarChart3 className="size-4 text-[#8b5cf6]" />
              View All Clients
            </Link>
            <Link
              to="/admin/projects"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-[#94a3b8] hover:text-white"
            >
              <FolderOpen className="size-4 text-[#f59e0b]" />
              View Projects
            </Link>
            <Link
              to="/admin/invoices"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-[#94a3b8] hover:text-white"
            >
              <TrendingUp className="size-4 text-[#00b4ff]" />
              View Invoices
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 p-6 rounded-xl glow-border bg-[#0a1628]/60">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h2>
          {!activity || activity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="size-8 text-[#334155] mx-auto mb-2" />
              <p className="text-[#64748b]">No activity yet</p>
              <p className="text-sm text-[#475569]">
                Activity will appear here as you manage clients and projects
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {activity.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg">
                    {activityIcons[item.type] ?? "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-[#64748b] truncate">
                        {item.description}
                      </p>
                    )}
                    {item.clientId && (
                      <span className="text-xs text-[#00b4ff80]">
                        {item.clientId}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#475569] whitespace-nowrap">
                    {item._creationTime
                      ? new Date(item._creationTime).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
