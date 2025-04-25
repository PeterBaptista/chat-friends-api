import cors from "cors";
import "dotenv/config";

import express, { type Express } from "express";
import { pino } from "pino";

import errorHandler from "@/common/middleware/errorHandler";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { messagesRouter } from "./api/messages/messagesRouter";

import { friendsRouter } from "./api/friends/friendsRouter";
import { inviteRouter } from "./api/invites/invitesRouter";
import { usersRouter } from "./api/users/usersRouter";
import { auth } from "./lib/auth";
import { requireAuth } from "./utils/utils";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.use(
	cors({
		origin: (origin, callback) => {
			console.log("origin", origin);
			return callback(null, origin);
		},

		credentials: true,
	}),
);

// Middlewares

// For ExpressJS v4
// app.all("/api/auth/*splat", toNodeHandler(auth)); For ExpressJS v5

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
// app.use(
// 	cors({
// 		origin: process.env.BASE_URL, // Replace with your frontend's origin
// 		methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
// 		credentials: true, // Allow credentials (cookies, authorization headers, etc.)
// 	}),
// );

app.get("/test", (req, res) => {
	res.json({ message: "Hello World" });
});

app.all("/api/auth/*", toNodeHandler(auth));

app.get("/api/me", async (req, res) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	res.json(session);
});

app.all("*", requireAuth);
app.use(express.json());

app.use("/messages", messagesRouter);
app.use("/users", usersRouter);
app.use("/invites", inviteRouter);
app.use("/friends", friendsRouter);

// // Swagger UI
// app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
