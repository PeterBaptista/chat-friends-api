import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { User } from "better-auth/types";
import nodemailer from "nodemailer";

export async function sendResetPassword(token: string, url: string, user: User) {
	const html = `
    <p>Olá, ${user.name},</p>
    <p>Aqui está o link para a recuperação da senha</p>
    <a href="${url}">Redefinir senha</a>
    <p>Atenciosamente, Chat Amigo</p>`;

	const transporter = nodemailer.createTransport({
		service: "gmail",
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: process.env.GOOGLE_ACCOUNT_USER,
			pass: process.env.GOOGLE_ACCOUNT_PASS,
		},
	});

	const info = await transporter.sendMail({
		from: "chatamigo10@gmail.com",
		to: user.email,
		subject: "Redefinir senha",
		html: html,
	});
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const requireAuth: any = async (req: any, res: any, next: any) => {
	console.log("path", req.path);
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	if (!session?.user.id) {
		console.log("Unauthorized");
		return res.status(401).json({ error: "Unauthorized" });
	}

	next();
};
