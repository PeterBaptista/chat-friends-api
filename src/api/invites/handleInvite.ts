import { logger } from "@/server";
import { v4 as uuidv4 } from "uuid";

import { friendsTable, invitesTable } from "@/db/schemas";
import { db } from "@/drizzle";
import type { ExtendedWebSocket } from "@/lib/ws";
import { and, eq } from "drizzle-orm";
import type { WebSocketServer } from "ws";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function handleInvite(messageParsed: any, wss: WebSocketServer, ws: ExtendedWebSocket) {
	const existingFriendship = await db
		.select()
		.from(friendsTable)
		.where(
			and(eq(friendsTable.user_id1, messageParsed?.userFromId), eq(friendsTable.user_id2, messageParsed?.userToId)),
		)
		.limit(1);

	if (existingFriendship.length > 0) {
		logger.info(`❌ User ${messageParsed?.userToId} is already friends with user ${messageParsed?.userFromId}`);
		return;
	}

	const pendingInvite = await db
		.select()
		.from(invitesTable)
		.where(
			and(
				eq(invitesTable.userToId, messageParsed?.userToId),
				eq(invitesTable.userFromId, messageParsed.userFromId),
				eq(invitesTable.status, "pending"),
			),
		)
		.limit(1);

	if (pendingInvite.length > 0) {
		logger.info(`❌ User ${messageParsed?.userToId} already has a pending invite`);
		return;
	}

	await db.insert(invitesTable).values({
		id: uuidv4(),
		userFromId: messageParsed?.userFromId,
		userToId: messageParsed?.userToId,
		status: messageParsed?.status,
		createdAt: new Date(messageParsed?.createdAt),
	});
	logger.info(`✅ Client invited user ${messageParsed?.userToId}`);

	for (const client of wss.clients) {
		const c = client as ExtendedWebSocket;

		if (c.readyState === ws.OPEN && (c.userId === messageParsed.userToId || c.userId === messageParsed.userFromId)) {
			logger.info("sending invite confirmation: ", c.userId, messageParsed.userToId, messageParsed);
			c.send(JSON.stringify(messageParsed));
		}
	}
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function handleInviteConfirm(messageParsed: any, wss: WebSocketServer, ws: ExtendedWebSocket) {
	const invite = await db.select().from(invitesTable).where(eq(invitesTable.id, messageParsed.inviteId));
	if (invite.length === 0) {
		logger.info(`❌ Invite ${messageParsed.inviteId} not found`);
		return;
	}

	if (messageParsed.status === "rejected") {
		logger.info(`❌ Invite ${messageParsed.inviteId} rejected`);
		return;
	}

	for (const client of wss.clients) {
		const c = client as ExtendedWebSocket;

		if (c.readyState === ws.OPEN && (c.userId === invite[0].userFromId || c.userId === invite[0].userToId)) {
			logger.info("sending invite-confirmed: ", c.userId, invite[0].userFromId);
			c.send(JSON.stringify(messageParsed));
		}
	}
}
