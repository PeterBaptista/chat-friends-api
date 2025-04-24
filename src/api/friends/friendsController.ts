import { friendsTable, user } from "@/db/schemas";
import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq, inArray, or } from "drizzle-orm";
import type { Request, Response } from "express";

export async function getFriends(req: Request, res: Response) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	if (!session?.user.id) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	const userId = session.user.id;

	const friends = await db
		.selectDistinct({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
		})
		.from(friendsTable)
		.innerJoin(
			user,
			or(
				and(eq(friendsTable.user_id1, userId), eq(user.id, friendsTable.user_id2)),
				and(eq(friendsTable.user_id2, userId), eq(user.id, friendsTable.user_id1)),
			),
		)

		.where(or(eq(friendsTable.user_id1, userId), eq(friendsTable.user_id2, userId)));

	res.json(friends);
}
