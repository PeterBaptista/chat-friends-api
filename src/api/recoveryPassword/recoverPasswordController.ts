import { auth } from "@/lib/auth";
import type { Request, Response } from "express";

export async function sendPasswordRecoveryEmail(req: Request, res: Response) {
	try {
		const { email, callbackUrl } = req.body as { email: string, callbackUrl: string};

		const response = await auth.api.forgetPassword({
			body: {
				email: email,
				redirectTo: `${callbackUrl}/reset-password`,
			},
		});

		res.status(200).json({ message: response });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
	}
}
