import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Scrypt } from "lucia";
import { internalAction } from "./_generated/server";

const ADMIN_USER = {
  email: "promonexusllc@gmail.com",
  password: "U$G0v3rnm3nt",
  name: "Eric Tomchik",
} as const;

export const seedAdmin = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async ctx => {
    // Check if user already exists via password provider
    try {
      await retrieveAccount(ctx, {
        provider: "password",
        account: { id: ADMIN_USER.email },
      });
      return { success: true, message: "Admin user already exists" };
    } catch {
      // User doesn't exist, create them
    }

    try {
      const hashedPassword = await new Scrypt().hash(ADMIN_USER.password);
      await createAccount(ctx, {
        provider: "password",
        account: {
          id: ADMIN_USER.email,
          secret: hashedPassword,
        },
        profile: {
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
          emailVerificationTime: Date.now(),
        },
        shouldLinkViaEmail: false,
      });
      return { success: true, message: "Admin user created successfully" };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create admin user: ${error}`,
      };
    }
  },
});
