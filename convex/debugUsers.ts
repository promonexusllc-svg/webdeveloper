import { query } from "./_generated/server";

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({ id: u._id, email: u.email, name: u.name }));
  },
});

export const listAuthAccounts = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    return accounts.map(a => ({ id: a._id, provider: a.provider, providerId: a.providerAccountId, userId: a.userId }));
  },
});
