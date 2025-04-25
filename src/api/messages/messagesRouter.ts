import { Router } from "express";
import { getMessages, getMessagesFromUser } from "./messagesController";

export const messagesRouter = Router();


messagesRouter.get("/", getMessages)

messagesRouter.get("/:userToId", getMessagesFromUser);
