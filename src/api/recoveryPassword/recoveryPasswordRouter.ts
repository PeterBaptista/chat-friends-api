import { Router } from "express";
import { sendPasswordRecoveryEmail } from "./recoverPasswordController";

export const PasswordRecoveryEmail = Router()


PasswordRecoveryEmail.post("/", async (req, res) => {
    await sendPasswordRecoveryEmail(req, res);
});

