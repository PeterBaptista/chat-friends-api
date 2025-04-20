import "dotenv/config";
import { db } from "@/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { schema } from "../db";

console.log("settings", {
	secure: process.env.NODE_ENV === "production" ? true : false,
	httpOnly: process.env.NODE_ENV === "production" ? true : false,
	sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
	partitioned:false, // bom deixar por padrão pra navegadores mais novos
  },)

export const auth = betterAuth({
	trustedOrigins: [process.env.CORS_ORIGIN ?? "", process.env.CORS_ORIGIN2 ?? ""],
	database: drizzleAdapter(db, {
	  provider: "pg",
	  schema: schema,
	}),
	advanced: {
		useSecureCookies: true,

	  defaultCookieAttributes: {
		secure: process.env.NODE_ENV === "production" ? true : false,
		httpOnly: process.env.NODE_ENV === "production" ? true : false,
		sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		partitioned: process.env.NODE_ENV === "production" ? true : false, // bom deixar por padrão pra navegadores mais novos
	  },
	},
	baseURL: process.env.BASE_URL,
  
	emailAndPassword: {
	  enabled: true,
	},
  });
 