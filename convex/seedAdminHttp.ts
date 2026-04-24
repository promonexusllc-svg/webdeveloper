import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const seedAdminEndpoint = httpAction(async (ctx) => {
  const result = await ctx.runAction(internal.seedAdmin.seedAdmin);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
