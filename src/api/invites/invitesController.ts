import { friendsTable, invitesTable, user } from "@/db/schemas";
import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export async function getInvites(req: Request, res: Response) {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		if (!session?.user.id) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const result = await db
			.select()
			.from(invitesTable)
			.innerJoin(user, eq(invitesTable.userFromId, user.id))
			.where(and(eq(invitesTable.status, "pending"), eq(invitesTable.userToId, session.user.id)));

		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
	}
}
export async function respondInvite(req: Request, res: Response) {
	try {
		const { inviteId } = req.params;
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		if (!session?.user.id) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		const result = await db
			.update(invitesTable)
			.set({
				status: req.body.status,
				responseAt: new Date(),
			})
			.where(eq(invitesTable.id, inviteId));

		if (req.body.status === "rejected") {
			res.json(result);
			return;
		}

		const invite = await db.select().from(invitesTable).where(eq(invitesTable.id, inviteId));

		if (invite.length === 0) {
			res.status(404).json({ error: "Invite not found" });
			return;
		}

		await db.insert(friendsTable).values({
			id: inviteId,
			user_id1: invite[0].userFromId,
			user_id2: invite[0].userToId,
			createdAt: new Date(),
		});

		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
	}
}
