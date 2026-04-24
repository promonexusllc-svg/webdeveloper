import { useQuery } from "convex/react";
import { Plus, Search, Users, Mail, Phone, Building2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../../../convex/_generated/api";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  prospect: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  archived: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const clients = useQuery(api.admin.listClients, {
    search: search || undefined,
    status: statusFilter || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-[#64748b] mt-1">
            {clients?.length ?? 0} client{clients?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/admin/clients/new">
          <Button className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] font-semibold">
            <Plus className="size-4" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#475569]" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0a1628] border-[#1e293b] text-white placeholder:text-[#475569]"
          />
        </div>
        <div className="flex gap-2">
          {["", "active", "prospect", "inactive"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === s
                  ? "bg-[#00b4ff] text-[#020817] font-medium"
                  : "bg-[#0a1628] text-[#64748b] border border-[#1e293b] hover:border-[#00b4ff40] hover:text-white"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards */}
      {!clients ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20">
          <Users className="size-12 text-[#1e293b] mx-auto mb-3" />
          <p className="text-[#64748b] text-lg mb-1">No clients yet</p>
          <p className="text-[#475569] text-sm mb-4">
            Add your first client to start tracking projects and invoices
          </p>
          <Link to="/admin/clients/new">
            <Button className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd]">
              <Plus className="size-4" />
              Add First Client
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link
              key={client._id}
              to={`/admin/clients/${client.clientId}`}
              className="p-4 rounded-xl glow-border bg-[#0a1628]/60 hover:bg-[#0a1628]/80 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-[#00b4ff10] border border-[#00b4ff20] flex items-center justify-center text-[#00b4ff] font-bold text-sm shrink-0">
                  {client.clientId.replace("PN-", "#")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold group-hover:text-[#00b4ff] transition-colors truncate">
                      {client.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider border ${statusColors[client.status]}`}
                    >
                      {client.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {client.email}
                    </span>
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" />
                        {client.phone}
                      </span>
                    )}
                    {client.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        {client.company}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[#00b4ff40] text-sm font-mono">
                  {client.clientId}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
