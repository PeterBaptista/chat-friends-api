import "dotenv/config";
import { db } from "@/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { schema } from "../db";
console.log(process.env.BASE_URL);

export const auth = betterAuth({
	trustedOrigins: [process.env.BASE_URL ?? "", process.env.BASE_URL_TUNNELLING ?? "", process.env.CORS_ORIGIN ?? "", process.env.CORS_ORIGIN2 ?? ""],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	advanced: {
        crossSubDomainCookies: {
            enabled: true,
            domain: ".example.com", // Domain with a leading period
        },
        defaultCookieAttributes: {
            secure: true,
            httpOnly: true,
            sameSite: "none",  // Allows CORS-based cookie sharing across subdomains
            partitioned: true, // New browser standards will mandate this for foreign cookies
        },
    },
	baseURL: process.env.BASE_URL,

	
	emailAndPassword: {
		enabled: true,
	},
});
