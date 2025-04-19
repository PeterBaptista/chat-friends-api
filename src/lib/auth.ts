import "dotenv/config";
import { db } from "@/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { schema } from "../db";


export const auth = betterAuth({
	trustedOrigins: [process.env.CORS_ORIGIN ?? ""],
	database: drizzleAdapter(db, {
	  provider: "pg",
	  schema: schema,
	}),
	advanced: {
	  defaultCookieAttributes: {
		secure: true,
		httpOnly: true,
		sameSite: "none",
		partitioned: true, // bom deixar por padrão pra navegadores mais novos
	  },
	},
	baseURL: process.env.BASE_URL,
  
	emailAndPassword: {
	  enabled: true,
	},
  });
 