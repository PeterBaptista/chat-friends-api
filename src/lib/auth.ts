import { db } from "@/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "../db";

export const auth = betterAuth({
	trustedOrigins: [process.env.BASE_URL ?? ""],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	baseURL: process.env.BASE_URL,

	emailAndPassword: {
		enabled: true,
	},
});
