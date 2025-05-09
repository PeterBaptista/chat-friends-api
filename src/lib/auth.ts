import { db } from "@/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import "dotenv/config";

import { createDefaultFriends } from "@/api/friends/friendsController";
import { sendResetPassword } from "@/utils/utils";
import { schema } from "../db";

console.log("settings", {
  secure: process.env.NODE_ENV === "production",
  httpOnly: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  partitioned: process.env.NODE_ENV === "production", // bom deixar por padrão pra navegadores mais novos
});

export const auth = betterAuth({
  trustedOrigins: [
    process.env.CORS_ORIGIN ?? "",
    process.env.CORS_ORIGIN2 ?? "",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }
      console.log("ctx.body", ctx.body);
      await createDefaultFriends(ctx.body.email);
    }),
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: process.env.BETTER_AUTH_DOMAIN,
    },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      // bom deixar por padrão pra navegadores mais novos
    },
  },
  baseURL: process.env.BASE_URL,

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ token, url, user }) => {
      await sendResetPassword(token, url, user);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
