import type { Server } from "node:http";
import { logger } from "@/server";
import { v4 as uuidv4 } from "uuid";
import { type WebSocket, WebSocketServer } from "ws";

import { handleInvite, handleInviteConfirm } from "@/api/invites/handleInvite";
import { handleMessage } from "@/api/messages/handleMessage";
import { and, eq, or } from "drizzle-orm";
import { friendsTable, invitesTable, messages } from "../db/schemas/schema";
import { db } from "../drizzle";

// Extend the WebSocket type from 'ws' package, not from 'node:http'
export type ExtendedWebSocket = WebSocket & { userId?: string };

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

			if (messageParsed.type === "invite") {
				handleInvite(messageParsed, wss, ws);
				return;
			}

			if (messageParsed.type === "invite-confirm") {
				handleInviteConfirm(messageParsed, wss, ws);
				return;
			}

			if (messageParsed.type === "message") {
				handleMessage(messageParsed, wss, ws);
				return;
			}

			// Send to the intended recipient only
		});

		ws.on("close", () => {
			logger.info("❌ WebSocket client disconnected");
		});
	});

	logger.info("🟢 WebSocket server initialized");
};
