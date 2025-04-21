import { messages } from "@/db/schemas";
import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { eq, ne } from "drizzle-orm";
import type { Request, Response } from "express";

export async function getMessages(req: Request, res: Response) {
	const result = await db.select().from(messages);

	res.json(result);
}

export async function getMessagesFromUser(req: Request, res: Response) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	const filters = [];
	if (session?.user.id) {
		filters.push(eq(messages.userFromId, session.user.id));
	}

	const result = await db.select().from(messages);

	res.json(result);
}
