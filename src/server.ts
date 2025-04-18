import "dotenv/config";
import cors from "cors";

import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import { requestLogger } from "@/common/middleware/requestLogger";
import { toNodeHandler } from "better-auth/node";
import { messagesRouter } from "./api/messages/messagesRouter";
import { usersRouter } from "./api/users/usersRouter";
import { auth } from "./lib/auth";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.use(cors({
  origin: (origin, callback) =>{ 
	console.log(origin);
	return callback(null, origin)
	},
  credentials: true,
}));
  
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
app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json());

app.use("/messages", messagesRouter);
app.use("/users", usersRouter);

// // Swagger UI
// app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
