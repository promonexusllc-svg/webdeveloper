import { useQuery } from "convex/react";
import {
  BarChart3,
  DollarSign,
  FolderOpen,
  Globe,
  LogOut,
  Menu,
  MessageSquare,
  TicketIcon,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderOpen },
  { to: "/admin/invoices", label: "Invoices", icon: DollarSign },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/tickets", label: "Tickets", icon: TicketIcon },
];

export default function AdminLayout() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unreadCount = useQuery(api.admin.getUnreadMessageCount);

  function handleSignOut() {
    void signOut();
    navigate("/");
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#1e293b]">
        <Link to="/admin" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="PromoNexus" className="h-8 w-auto" />
          <div>
            <span className="font-semibold text-white text-sm">
              PromoNexus
            </span>
            <span className="block text-[10px] text-[#00b4ff] uppercase tracking-widest">
              Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#00b4ff10] text-[#00b4ff] border border-[#00b4ff20]"
                  : "text-[#64748b] hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon className="size-4" />
            {label}
            {label === "Messages" && unreadCount && unreadCount > 0 ? (
              <span className="ml-auto bg-[#00b4ff] text-[#020817] text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e293b] space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748b] hover:text-white hover:bg-white/5 transition-colors"
        >
          <Globe className="size-4" />
          Back to Website
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748b] hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#020817] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 flex-col border-r border-[#1e293b] bg-[#0a1628]/80 backdrop-blur-sm fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-60 flex flex-col h-full bg-[#0a1628] border-r border-[#1e293b]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-[#64748b] hover:text-white"
            >
              <X className="size-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-[#1e293b] bg-[#020817]/90 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#94a3b8] hover:text-white"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-semibold text-white text-sm">
            Admin Dashboard
          </span>
        </div>

        <div className="p-6 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
