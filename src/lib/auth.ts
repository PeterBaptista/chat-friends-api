import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "./db";


export const auth = betterAuth({
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "",
    process.env.TUNELLING ?? "",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,

  emailAndPassword: {
    enabled: true,

  },
});
