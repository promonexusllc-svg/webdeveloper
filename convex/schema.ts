import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  /* ─── CLIENT PORTAL: Tickets ─── */
  tickets: defineTable({
    userId: v.id("users"),
    clientId: v.optional(v.string()), // PN-XXXX unique client ID
    subject: v.string(),
    category: v.union(
      v.literal("bug_fix"),
      v.literal("feature_request"),
      v.literal("general_support"),
      v.literal("billing"),
      v.literal("design_change"),
      v.literal("hosting"),
      v.literal("other"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    description: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("awaiting_response"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
    projectUrl: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_clientId", ["clientId"]),

  ticketMessages: defineTable({
    ticketId: v.id("tickets"),
    userId: v.id("users"),
    message: v.string(),
    isStaff: v.boolean(),
  }).index("by_ticketId", ["ticketId"]),

  /* ─── PUBLIC: Contact Form ─── */
  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    message: v.string(),
    read: v.boolean(),
  }).index("by_read", ["read"]),

  /* ─── ADMIN CRM: Clients ─── */
  clients: defineTable({
    clientId: v.string(), // Unique ID: PN-0001, PN-0002, etc.
    userId: v.optional(v.id("users")), // Linked user account (if they have portal access)
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("prospect"),
      v.literal("inactive"),
      v.literal("archived"),
    ),
  })
    .index("by_clientId", ["clientId"])
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  /* ─── ADMIN CRM: Projects ─── */
  projects: defineTable({
    clientId: v.string(), // PN-XXXX
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("inquiry"),
      v.literal("proposal"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    projectType: v.optional(v.string()), // "website", "web_app", "redesign", etc.
    startDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    completedDate: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    totalValue: v.optional(v.number()), // Total project value in cents
  })
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"]),

  /* ─── ADMIN CRM: Project Revisions ─── */
  projectRevisions: defineTable({
    projectId: v.id("projects"),
    clientId: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("requested"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("declined"),
    ),
  })
    .index("by_projectId", ["projectId"])
    .index("by_clientId", ["clientId"]),

  /* ─── ADMIN CRM: Invoices ─── */
  invoices: defineTable({
    quoteNumber: v.string(), // INV-2026-0001 unique quote/invoice number
    clientId: v.string(), // PN-XXXX
    projectId: v.optional(v.id("projects")),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled"),
    ),
    issueDate: v.string(),
    dueDate: v.optional(v.string()),
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(), // in cents
        total: v.number(), // in cents
      })
    ),
    subtotal: v.number(), // cents
    taxRate: v.optional(v.number()), // percentage
    taxAmount: v.optional(v.number()), // cents
    total: v.number(), // cents
    notes: v.optional(v.string()),
    paidDate: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  })
    .index("by_quoteNumber", ["quoteNumber"])
    .index("by_clientId", ["clientId"])
    .index("by_projectId", ["projectId"])
    .index("by_status", ["status"]),

  /* ─── ADMIN CRM: Activity Log ─── */
  activityLog: defineTable({
    clientId: v.optional(v.string()), // PN-XXXX
    userId: v.optional(v.id("users")),
    type: v.union(
      v.literal("client_created"),
      v.literal("project_created"),
      v.literal("project_updated"),
      v.literal("revision_requested"),
      v.literal("ticket_created"),
      v.literal("ticket_resolved"),
      v.literal("invoice_created"),
      v.literal("invoice_sent"),
      v.literal("payment_received"),
      v.literal("contact_submitted"),
      v.literal("note_added"),
      v.literal("communication"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    referenceId: v.optional(v.string()), // ID of related entity
  })
    .index("by_clientId", ["clientId"])
    .index("by_type", ["type"]),
});

export default schema;
