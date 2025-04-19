import { messages, user } from "@/db/schemas";
import { db } from "@/drizzle";

import type { Request, Response } from "express";

export async function getUsers(req: Request, res: Response) {
	const result = await db.select().from(user);

	res.json(result);
}
