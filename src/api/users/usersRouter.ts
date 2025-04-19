import { Router } from "express";

import { getUsers } from "./usersController";

export const usersRouter = Router();

usersRouter.get("/", getUsers);
