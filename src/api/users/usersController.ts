import { user } from "@/db/schemas";
import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq, ne } from "drizzle-orm";

import type { Request, Response } from "express";

export async function getUsers(req: Request, res: Response) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    const filters = [];
    if (session?.user.id) {
      filters.push(ne(user.id, session.user.id));
    }

    const result = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(and(...filters));

    res.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Invalid user ID" });
    }

    const result = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, id));

    res.json(result?.[0] ?? null);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
