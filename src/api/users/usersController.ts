import { messages, user } from "@/db/schemas";
import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq, ne } from "drizzle-orm";

import type { Request, Response } from "express";

export async function getUsers(req: Request, res: Response) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	const filters = [];
	if (session?.user.id) {
		filters.push(ne(user.id, session.user.id));
	}

	const result = await db
		.select()
		.from(user)
		.where(and(...filters));

	res.json(result);
}

export async function getUserById(req: Request, res: Response) {
	const { id } = req.params;

	if (!id) {
		res.status(400).json({ error: "Invalid user ID" });
	}

	const result = await db.select().from(user).where(eq(user.id, id));

	res.json(result?.[0] ?? null);
}
