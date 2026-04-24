import { useMutation, useQuery } from "convex/react";
import {
  Building2,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export default function AdminMessages() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedId, setSelectedId] = useState<Id<"contacts"> | null>(null);
  const messages = useQuery(api.admin.listMessages, {
    unreadOnly: filter === "unread" ? true : undefined,
  });
  const selectedMessage = useQuery(
    api.admin.getMessage,
    selectedId ? { id: selectedId } : "skip"
  );
  const markRead = useMutation(api.admin.markMessageRead);

  async function toggleRead(id: Id<"contacts">, currentlyRead: boolean) {
    try {
      await markRead({ id, read: !currentlyRead });
      toast.success(currentlyRead ? "Marked as unread" : "Marked as read");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-[#64748b] mt-1">
            Contact form submissions from the website
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f
                  ? "bg-[#00b4ff] text-[#020817] font-medium"
                  : "bg-[#0a1628] text-[#64748b] border border-[#1e293b] hover:text-white"
              }`}
            >
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 min-h-[60vh]">
        {/* Message list */}
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {!messages ? (
            <div className="flex items-center justify-center py-20">
              <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="size-10 text-[#1e293b] mx-auto mb-2" />
              <p className="text-[#64748b]">No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg._id}
                onClick={() => setSelectedId(msg._id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selectedId === msg._id
                    ? "bg-[#00b4ff08] border-[#00b4ff30]"
                    : "bg-[#0a1628]/60 border-[#1e293b] hover:border-[#00b4ff20]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`size-2 mt-2 rounded-full shrink-0 ${
                      msg.read ? "bg-[#334155]" : "bg-[#00b4ff]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-sm truncate ${
                          msg.read
                            ? "text-[#94a3b8]"
                            : "text-white font-semibold"
                        }`}
                      >
                        {msg.name}
                      </h4>
                      <span className="text-[10px] text-[#475569] whitespace-nowrap">
                        {msg._creationTime
                          ? new Date(msg._creationTime).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b] truncate">
                      {msg.email}
                    </p>
                    <p className="text-xs text-[#475569] truncate mt-1">
                      {msg.message}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message detail */}
        <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60 min-h-[300px]">
          {!selectedId || !selectedMessage ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <Mail className="size-10 text-[#1e293b] mb-3" />
              <p className="text-[#64748b]">
                Select a message to view details
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedMessage.name}
                  </h2>
                  <p className="text-sm text-[#64748b] mt-1">
                    {selectedMessage._creationTime
                      ? new Date(
                          selectedMessage._creationTime
                        ).toLocaleString()
                      : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggleRead(selectedMessage._id, selectedMessage.read)
                  }
                  className="border-[#1e293b] text-[#94a3b8] hover:text-white shrink-0"
                >
                  {selectedMessage.read ? (
                    <>
                      <EyeOff className="size-3" />
                      Mark Unread
                    </>
                  ) : (
                    <>
                      <Eye className="size-3" />
                      Mark Read
                    </>
                  )}
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[#020817] border border-[#1e293b]">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-[#00b4ff]" />
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-[#94a3b8] hover:text-[#00b4ff]"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-[#00b4ff]" />
                    <span className="text-[#94a3b8]">
                      {selectedMessage.phone}
                    </span>
                  </div>
                )}
                {selectedMessage.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="size-4 text-[#00b4ff]" />
                    <span className="text-[#94a3b8]">
                      {selectedMessage.company}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                  Message
                </h3>
                <div className="p-4 rounded-lg bg-[#020817] border border-[#1e293b]">
                  <p className="text-sm text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
