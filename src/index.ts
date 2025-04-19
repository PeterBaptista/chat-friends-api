import http from "node:http";
import { env } from "@/common/utils/envConfig";
import { setupWebSocketServer } from "@/lib/ws"; // new websocket module
import { app, logger } from "@/server";

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server to HTTP server
setupWebSocketServer(server);

// Start HTTP server
server.listen(env.PORT, () => {
	const { NODE_ENV, HOST, PORT } = env;
	logger.info(`Server (${NODE_ENV}) running at http://${HOST}:${PORT}`);
});

// Graceful shutdown
const onCloseSignal = () => {
	logger.info("SIGINT/SIGTERM received, shutting down");
	server.close(() => {
		logger.info("Server closed");
		process.exit();
	});
	setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
