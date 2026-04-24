import { useConvexAuth, useQuery } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../../convex/_generated/api";

/**
 * Protects /admin routes:
 * - Not authenticated → /login
 * - Authenticated but not admin → /dashboard (no access)
 * - Admin → render admin pages
 */
export function AdminRoute() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const isAdmin = useQuery(api.admin.isAdmin);

  // Still loading auth state
  if (authLoading || isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="size-8 border-2 border-[#00b4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Non-admin users get sent to regular client dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
