import { useQuery } from "convex/react";
import { ExternalLink, FolderOpen } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

const statusColors: Record<string, string> = {
  inquiry: "bg-gray-500/10 text-gray-400",
  proposal: "bg-purple-500/10 text-purple-400",
  in_progress: "bg-blue-500/10 text-blue-400",
  review: "bg-amber-500/10 text-amber-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export default function AdminProjects() {
  const [statusFilter, setStatusFilter] = useState("");
  const projects = useQuery(api.admin.listProjects, {
    status: statusFilter || undefined,
  });
  const clients = useQuery(api.admin.listClients, {});
  const clientMap = new Map(clients?.map((c) => [c.clientId, c]) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="text-[#64748b] mt-1">
          {projects?.length ?? 0} project{projects?.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          "",
          "inquiry",
          "proposal",
          "in_progress",
          "review",
          "completed",
        ].map((s) => (
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
              : s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {!projects ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="size-12 text-[#1e293b] mx-auto mb-3" />
          <p className="text-[#64748b] text-lg">No projects yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const client = clientMap.get(p.clientId);
            return (
              <div
                key={p._id}
                className="p-4 rounded-xl glow-border bg-[#0a1628]/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{p.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${statusColors[p.status]}`}
                      >
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748b]">
                      {client ? client.name : p.clientId}
                      {p.projectType && ` · ${p.projectType}`}
                      {p.startDate && ` · Started ${p.startDate}`}
                      {p.totalValue != null && (
                        <span className="text-emerald-400">
                          {" "}
                          · ${(p.totalValue / 100).toFixed(2)}
                        </span>
                      )}
                    </p>
                    {p.description && (
                      <p className="text-xs text-[#475569] mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00b4ff] shrink-0"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
