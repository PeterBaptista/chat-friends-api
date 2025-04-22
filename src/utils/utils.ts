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
