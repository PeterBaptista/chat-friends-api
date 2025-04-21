import { messages, user } from "@/db/schemas";
import { db } from "@/drizzle";
import { eq } from "drizzle-orm";

import type { Request, Response } from "express";

export async function getUsers(req: Request, res: Response) {
	const result = await db.select().from(user);

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
