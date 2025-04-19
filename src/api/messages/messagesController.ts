import { messages } from "@/db/schemas";
import { db } from "@/drizzle";
import type { Request, Response } from "express";

export async function getMessages(req: Request, res: Response) {
	const result = await db.select().from(messages);

	res.json(result);
}
