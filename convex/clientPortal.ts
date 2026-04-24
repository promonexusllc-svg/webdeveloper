import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Helper: get current user's linked client record ─── */
async function getMyClient(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  // Find client record linked to this user
  const clients = await ctx.db.query("clients").collect();
  return clients.find(
    (c: any) => c.userId === userId || c.email?.toLowerCase() === user.email?.toLowerCase()
  ) ?? null;
}

/* ─── Client Profile ─── */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const client = await getMyClient(ctx);
    if (!client) return null;
    return {
      clientId: client.clientId,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      status: client.status,
    };
  },
});

/* ─── Client Invoices ─── */
export const getMyInvoices = query({
  args: {},
  handler: async (ctx) => {
    const client = await getMyClient(ctx);
    if (!client) return [];
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_clientId", (q) => q.eq("clientId", client.clientId))
      .order("desc")
      .collect();
    // Only show sent/viewed/paid/overdue invoices (not drafts)
    return invoices.filter((inv) => inv.status !== "draft" && inv.status !== "cancelled");
  },
});

/* ─── Single Invoice Detail ─── */
export const getMyInvoice = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, { invoiceId }) => {
    const client = await getMyClient(ctx);
    if (!client) return null;
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.clientId !== client.clientId) return null;
    // Don't show drafts or cancelled
    if (invoice.status === "draft" || invoice.status === "cancelled") return null;
    return invoice;
  },
});

/* ─── Client Projects ─── */
export const getMyProjects = query({
  args: {},
  handler: async (ctx) => {
    const client = await getMyClient(ctx);
    if (!client) return [];
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_clientId", (q) => q.eq("clientId", client.clientId))
      .order("desc")
      .collect();
    return projects;
  },
});
