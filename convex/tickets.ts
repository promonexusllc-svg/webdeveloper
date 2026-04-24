import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("tickets"),
      _creationTime: v.number(),
      userId: v.id("users"),
      subject: v.string(),
      category: v.string(),
      priority: v.string(),
      description: v.string(),
      status: v.string(),
      projectUrl: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return tickets;
  },
});

export const get = query({
  args: { ticketId: v.id("tickets") },
  returns: v.union(
    v.object({
      _id: v.id("tickets"),
      _creationTime: v.number(),
      userId: v.id("users"),
      subject: v.string(),
      category: v.string(),
      priority: v.string(),
      description: v.string(),
      status: v.string(),
      projectUrl: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userId) return null;
    return ticket;
  },
});

export const getMessages = query({
  args: { ticketId: v.id("tickets") },
  returns: v.array(
    v.object({
      _id: v.id("ticketMessages"),
      _creationTime: v.number(),
      ticketId: v.id("tickets"),
      userId: v.id("users"),
      message: v.string(),
      isStaff: v.boolean(),
      userName: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userId) return [];
    const messages = await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return { ...msg, userName: user?.name ?? "Unknown" };
      }),
    );
    return enriched;
  },
});

export const create = mutation({
  args: {
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
    projectUrl: v.optional(v.string()),
  },
  returns: v.id("tickets"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const ticketId = await ctx.db.insert("tickets", {
      userId,
      subject: args.subject,
      category: args.category,
      priority: args.priority,
      description: args.description,
      status: "open",
      projectUrl: args.projectUrl,
    });
    // Add initial message
    await ctx.db.insert("ticketMessages", {
      ticketId,
      userId,
      message: args.description,
      isStaff: false,
    });
    return ticketId;
  },
});

export const addMessage = mutation({
  args: {
    ticketId: v.id("tickets"),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userId) throw new Error("Not authorized");
    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      userId,
      message: args.message,
      isStaff: false,
    });
    // Re-open ticket if it was awaiting response
    if (ticket.status === "awaiting_response" || ticket.status === "resolved") {
      await ctx.db.patch(args.ticketId, { status: "open" });
    }
    return null;
  },
});

export const closeTicket = mutation({
  args: { ticketId: v.id("tickets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userId) throw new Error("Not authorized");
    await ctx.db.patch(args.ticketId, { status: "closed" });
    return null;
  },
});
