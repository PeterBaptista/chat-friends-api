import { Router } from "express";
import { getInvites, respondInvite } from "./invitesController";

export const inviteRouter = Router();

inviteRouter.get("/", getInvites);

inviteRouter.post("/:inviteId/respond", respondInvite);
