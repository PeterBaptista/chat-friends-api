import { Router } from "express";

import { getUserById, getUsers } from "./usersController";

export const usersRouter = Router();

usersRouter.get("/", getUsers);

usersRouter.get("/:id", getUserById);
