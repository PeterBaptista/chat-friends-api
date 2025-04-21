import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { RequestHandler } from "express";

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
