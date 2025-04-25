import { Router } from "express";
import { getFriends } from "./friendsController";

export const friendsRouter = Router();

friendsRouter.get("/", getFriends);
