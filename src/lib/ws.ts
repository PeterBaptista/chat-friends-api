import type { Server } from "node:http";
import { logger } from "@/server";
import { v4 as uuidv4 } from "uuid";
import { WebSocketServer } from "ws";
import { messages } from "../db/schemas/schema";
import { db } from "../drizzle";

export const setupWebSocketServer = (server: Server) => {
	const wss = new WebSocketServer({ server });

	wss.on("connection", (ws) => {
		logger.info("🔌 New WebSocket client connected");

		ws.on("message", async (message) => {
			logger.info(`📨 Received: ${message}`);
			const messageParsed = JSON.parse(message.toString());
			// Save message to database
			await db.insert(messages).values({
				id: messageParsed.id,
				sendAt: new Date(messageParsed?.sendAt),
				userFromId: messageParsed?.userFromId,
				userToId: messageParsed?.userToId,
				content: messageParsed?.content,
			});

			// Broadcast to all connected clients
			for (const client of wss.clients) {
				if (client.readyState === ws.OPEN) {
					client.send(message.toString());
				}
			}
		});

		ws.on("close", () => {
			logger.info("❌ WebSocket client disconnected");
		});
	});

	logger.info("🟢 WebSocket server initialized");
};
