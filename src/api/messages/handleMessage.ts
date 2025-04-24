import { logger } from "@/server";
import type { WebSocketServer } from "ws";

import { friendsTable, messages } from "@/db/schemas";
import { db } from "@/drizzle";
import type { ExtendedWebSocket } from "@/lib/ws";
import { and, eq, or } from "drizzle-orm";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function handleMessage(messageParsed: any, wss: WebSocketServer, ws: ExtendedWebSocket) {
	logger.info(`✅ Client sent message to user ${messageParsed?.userToId}`);

	const hasFriendship = await db
		.select()
		.from(friendsTable)
		.where(
			or(
				and(eq(friendsTable.user_id1, messageParsed?.userFromId), eq(friendsTable.user_id2, messageParsed?.userToId)),
				and(eq(friendsTable.user_id2, messageParsed?.userFromId), eq(friendsTable.user_id1, messageParsed?.userToId)),
			),
		)
		.limit(1);

	if (hasFriendship.length === 0) {
		logger.info(`❌ User ${messageParsed?.userToId} is not friends with user ${messageParsed?.userFromId}`);

		for (const client of wss.clients) {
			const c = client as ExtendedWebSocket;

			if (c.readyState === ws.OPEN && c.userId === messageParsed.userFromId) {
				logger.info("sending: ", c.userId);
				c.send(
					JSON.stringify({
						...messageParsed,
						type: "message-cancel",
					}),
				);
			}
		}
		return;
	}

	await db.insert(messages).values({
		id: messageParsed.id,
		sendAt: new Date(messageParsed?.sendAt),
		userFromId: messageParsed?.userFromId,
		userToId: messageParsed?.userToId,
		content: messageParsed?.content,
	});

	for (const client of wss.clients) {
		const c = client as ExtendedWebSocket;

		if (c.readyState === ws.OPEN && c.userId === messageParsed.userToId) {
			logger.info("sending: ", c.userId);
			c.send(JSON.stringify(messageParsed));
		}
	}
}
