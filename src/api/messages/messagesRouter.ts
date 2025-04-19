import { Router } from "express";
import { getMessages } from "./messagesController";




export const messagesRouter = Router()


messagesRouter.get("/", getMessages)
