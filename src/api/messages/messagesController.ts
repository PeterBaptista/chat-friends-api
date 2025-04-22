import { messages } from "@/db/schemas";
import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq, or } from "drizzle-orm";
import type { Request, Response } from "express";

export async function getMessages(req: Request, res: Response) {
	const result = await db.select().from(messages);

	res.json(result);
}

export async function getMessagesFromUser(req: Request, res: Response) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	const { userToId } = req.params;

	const result = await db
		.select()
		.from(messages)
		.where(
			or(
				and(eq(messages.userToId, userToId), eq(messages.userFromId, session?.user.id ?? "")),
				and(eq(messages.userFromId, userToId), eq(messages.userToId, session?.user.id ?? "")),
			),
		);

	res.json(result);
}
