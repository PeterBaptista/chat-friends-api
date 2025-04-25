import { auth } from "@/lib/auth";
import { app } from "@/server";
import { fromNodeHeaders } from "better-auth/node";
import type { User } from "better-auth/types";
import nodemailer from "nodemailer";
import request from "supertest";

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




	export async function getAuthCookie() {
		const response = await request(app)
			.post("/api/auth/sign-in/email")
			.set("Origin", process.env.BASE_URL || "http://localhost:3000")
			.send({ email: "pedrolk2012@gmail.com", password: "wasd12345" }); // Include any needed fields

			console.log("Response:", response.body);
		const cookies = response.headers["set-cookie"];
		return cookies;
	}

