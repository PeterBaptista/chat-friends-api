import { Router } from "express";
import { getMessagesFromUser } from "./messagesController";

export const messagesRouter = Router();

messagesRouter.get("/:userToId", getMessagesFromUser);
