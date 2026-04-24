import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  tickets: defineTable({
    userId: v.id("users"),
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
    .index("by_userId_status", ["userId", "status"]),

  ticketMessages: defineTable({
    ticketId: v.id("tickets"),
    userId: v.id("users"),
    message: v.string(),
    isStaff: v.boolean(),
  }).index("by_ticketId", ["ticketId"]),

  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    message: v.string(),
    read: v.boolean(),
  }).index("by_read", ["read"]),
});

export default schema;
