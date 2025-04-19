import type { Server } from "node:http";
import { logger } from "@/server";
import { v4 as uuidv4 } from "uuid";
import { type WebSocket, WebSocketServer } from "ws";

import { messages } from "../db/schemas/schema";
import { db } from "../drizzle";

// Extend the WebSocket type from 'ws' package, not from 'node:http'
type ExtendedWebSocket = WebSocket & { userId?: string };

export const setupWebSocketServer = (server: Server) => {
	const wss = new WebSocketServer({ server });

	wss.on("connection", (ws: ExtendedWebSocket) => {
		logger.info("🔌 New WebSocket client connected");

		ws.on("message", async (data) => {
			const message = data.toString();
			logger.info(`📨 Received: ${message}`);
			const messageParsed = JSON.parse(message);

			// If it's a registration message
			if (messageParsed.type === "register") {
				ws.userId = messageParsed.userId;
				logger.info(`✅ Client registered as user ${ws.userId}`);
				return;
			}

			// Otherwise, treat it as a chat message
			await db.insert(messages).values({
				id: messageParsed.id,
				sendAt: new Date(messageParsed?.sendAt),
				userFromId: messageParsed?.userFromId,
				userToId: messageParsed?.userToId,
				content: messageParsed?.content,
			});

			// Send to the intended recipient only
			for (const client of wss.clients) {
				const c = client as ExtendedWebSocket;

				if (c.readyState === ws.OPEN && c.userId === messageParsed.userToId) {
					console.log("sending: ", c.userId, messageParsed.userToId);
					c.send(message);
				}
			}
		});

		ws.on("close", () => {
			logger.info("❌ WebSocket client disconnected");
		});
	});

	logger.info("🟢 WebSocket server initialized");
};
