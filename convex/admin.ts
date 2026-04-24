import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ─── Admin email(s) — only these accounts can access the admin dashboard ─── */
const ADMIN_EMAILS = ["promonexusllc@gmail.com"];

/* ─── Helper: Admin check ─── */
async function requireAdmin(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  // Check if user's email is in admin list
  const email = user.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) {
    throw new Error("Admin access required");
  }
  return { userId, user };
}

/* ─── Generate next client ID ─── */
async function generateClientId(ctx: { db: any }) {
  const allClients = await ctx.db.query("clients").collect();
  const maxNum = allClients.reduce((max: number, c: any) => {
    const num = parseInt(c.clientId.replace("PN-", ""), 10);
    return num > max ? num : max;
  }, 0);
  return `PN-${String(maxNum + 1).padStart(4, "0")}`;
}

/* ─── Generate next invoice number ─── */
async function generateQuoteNumber(ctx: { db: any }) {
  const year = new Date().getFullYear();
  const allInvoices = await ctx.db.query("invoices").collect();
  const yearInvoices = allInvoices.filter((inv: any) =>
    inv.quoteNumber.startsWith(`INV-${year}`)
  );
  const maxNum = yearInvoices.reduce((max: number, inv: any) => {
    const num = parseInt(inv.quoteNumber.split("-")[2], 10);
    return num > max ? num : max;
  }, 0);
  return `INV-${year}-${String(maxNum + 1).padStart(4, "0")}`;
}

/* ═══════════════════════════════════════════
   CLIENTS
   ═══════════════════════════════════════════ */

export const listClients = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let clients = await ctx.db.query("clients").collect();
    if (args.status) {
      clients = clients.filter((c) => c.status === args.status);
    }
    if (args.search) {
      const q = args.search.toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.clientId.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q))
      );
    }
    return clients.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

export const getClient = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
    return clients[0] ?? null;
  },
});

export const getClientProjects = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("projects")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const getClientInvoices = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("invoices")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const getClientTickets = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("tickets")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const getClientActivity = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return (
      await ctx.db
        .query("activityLog")
        .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
        .collect()
    ).sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
  },
});

export const createClient = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("prospect"),
        v.literal("inactive"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    const clientId = await generateClientId(ctx);
    const id = await ctx.db.insert("clients", {
      clientId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
      address: args.address,
      notes: args.notes,
      status: args.status ?? "active",
    });
    await ctx.db.insert("activityLog", {
      clientId,
      userId,
      type: "client_created",
      title: `Client ${args.name} created`,
      description: `Assigned ID: ${clientId}`,
    });
    return { id, clientId };
  },
});

export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("prospect"),
        v.literal("inactive"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

/* ═══════════════════════════════════════════
   PROJECTS
   ═══════════════════════════════════════════ */

export const listProjects = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let projects = await ctx.db.query("projects").collect();
    if (args.status) {
      projects = projects.filter((p) => p.status === args.status);
    }
    return projects.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const getProjectRevisions = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("projectRevisions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    clientId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    projectType: v.optional(v.string()),
    startDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    totalValue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    const id = await ctx.db.insert("projects", {
      ...args,
      status: "inquiry",
    });
    await ctx.db.insert("activityLog", {
      clientId: args.clientId,
      userId,
      type: "project_created",
      title: `Project "${args.name}" created`,
      referenceId: id,
    });
    return id;
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("inquiry"),
        v.literal("proposal"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    projectType: v.optional(v.string()),
    startDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    completedDate: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    totalValue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    const { id, ...updates } = args;
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
    if (args.status) {
      await ctx.db.insert("activityLog", {
        clientId: project.clientId,
        userId,
        type: "project_updated",
        title: `Project "${project.name}" status → ${args.status}`,
        referenceId: id,
      });
    }
  },
});

/* ═══════════════════════════════════════════
   INVOICES
   ═══════════════════════════════════════════ */

export const listInvoices = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let invoices = await ctx.db.query("invoices").collect();
    if (args.status) {
      invoices = invoices.filter((i) => i.status === args.status);
    }
    return invoices.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

export const getInvoice = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const getInvoiceByQuoteNumber = query({
  args: { quoteNumber: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const results = await ctx.db
      .query("invoices")
      .withIndex("by_quoteNumber", (q) => q.eq("quoteNumber", args.quoteNumber))
      .collect();
    return results[0] ?? null;
  },
});

export const createInvoice = mutation({
  args: {
    clientId: v.string(),
    projectId: v.optional(v.id("projects")),
    dueDate: v.optional(v.string()),
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
      })
    ),
    subtotal: v.number(),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    total: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    const quoteNumber = await generateQuoteNumber(ctx);
    const today = new Date().toISOString().split("T")[0];
    const id = await ctx.db.insert("invoices", {
      quoteNumber,
      clientId: args.clientId,
      projectId: args.projectId,
      status: "draft",
      issueDate: today,
      dueDate: args.dueDate,
      lineItems: args.lineItems,
      subtotal: args.subtotal,
      taxRate: args.taxRate,
      taxAmount: args.taxAmount,
      total: args.total,
      notes: args.notes,
    });
    await ctx.db.insert("activityLog", {
      clientId: args.clientId,
      userId,
      type: "invoice_created",
      title: `Invoice ${quoteNumber} created — $${(args.total / 100).toFixed(2)}`,
      referenceId: quoteNumber,
    });
    return { id, quoteNumber };
  },
});

export const updateInvoiceStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    paidDate: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    const invoice = await ctx.db.get(args.id);
    if (!invoice) throw new Error("Invoice not found");
    const updates: any = { status: args.status };
    if (args.paidDate) updates.paidDate = args.paidDate;
    if (args.paymentMethod) updates.paymentMethod = args.paymentMethod;
    await ctx.db.patch(args.id, updates);

    const logType =
      args.status === "paid" ? "payment_received" as const :
      args.status === "sent" ? "invoice_sent" as const :
      "invoice_created" as const;

    await ctx.db.insert("activityLog", {
      clientId: invoice.clientId,
      userId,
      type: logType,
      title:
        args.status === "paid"
          ? `Payment received for ${invoice.quoteNumber} — $${(invoice.total / 100).toFixed(2)}${args.paymentMethod ? ` via ${args.paymentMethod}` : ""}`
          : `Invoice ${invoice.quoteNumber} marked as ${args.status}`,
      referenceId: invoice.quoteNumber,
    });
  },
});

/* ═══════════════════════════════════════════
   ACTIVITY LOG
   ═══════════════════════════════════════════ */

export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("activityLog").collect();
    return all
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .slice(0, args.limit ?? 50);
  },
});

export const addNote = mutation({
  args: {
    clientId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    await ctx.db.insert("activityLog", {
      clientId: args.clientId,
      userId,
      type: "note_added",
      title: args.title,
      description: args.description,
    });
  },
});

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD STATS
   ═══════════════════════════════════════════ */

export const getDashboardStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const clients = await ctx.db.query("clients").collect();
    const projects = await ctx.db.query("projects").collect();
    const invoices = await ctx.db.query("invoices").collect();
    const tickets = await ctx.db.query("tickets").collect();

    const activeClients = clients.filter((c) => c.status === "active").length;
    const activeProjects = projects.filter(
      (p) => p.status === "in_progress" || p.status === "review"
    ).length;
    const openTickets = tickets.filter(
      (t) => t.status === "open" || t.status === "in_progress"
    ).length;
    const totalRevenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0);
    const pendingInvoices = invoices.filter(
      (i) => i.status === "sent" || i.status === "viewed" || i.status === "overdue"
    );
    const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

    return {
      totalClients: clients.length,
      activeClients,
      totalProjects: projects.length,
      activeProjects,
      openTickets,
      totalRevenue,
      pendingAmount,
      pendingInvoiceCount: pendingInvoices.length,
    };
  },
});

/* ─── Check if current user is admin ─── */
export const isAdmin = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
  },
});

/* ═══════════════════════════════════════════
   MESSAGES (Contact Submissions)
   ═══════════════════════════════════════════ */

export const listMessages = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let messages = await ctx.db.query("contacts").collect();
    if (args.unreadOnly) {
      messages = messages.filter((m) => !m.read);
    }
    return messages.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

export const getMessage = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const markMessageRead = mutation({
  args: { id: v.id("contacts"), read: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { read: args.read });
  },
});

export const getUnreadMessageCount = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const messages = await ctx.db
      .query("contacts")
      .withIndex("by_read", (q) => q.eq("read", false))
      .collect();
    return messages.length;
  },
});
