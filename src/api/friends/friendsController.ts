import { friendsTable, user } from "@/db/schemas";
import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq, inArray, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export function getDefaultFriends() {
  const defaultFriendsEmail = process.env.DEFAULT_FRIEND_EMAIL;
  const defaultFriendsEmail2 = process.env.DEFAULT_FRIEND_EMAIL2;

  return [defaultFriendsEmail ?? "", defaultFriendsEmail2 ?? ""];
}

export async function createDefaultFriends(email: string) {
  const defaultFriends = getDefaultFriends();

  console.log("defaultFriends", defaultFriends);

  if (!email) {
    return;
  }

  const userResponse = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));

  const userId = userResponse?.[0]?.id;
  if (!userId) {
    return;
  }
  if (!defaultFriends) {
    return;
  }

  const defaultFriendsIds = await db
    .select({ id: user.id })
    .from(user)
    .where(inArray(user.email, defaultFriends));

  await db.insert(friendsTable).values(
    defaultFriendsIds.map((friend) => ({
      id: uuidv4(),
      user_id1: userId,
      user_id2: friend.id,
      createdAt: new Date(),
    }))
  );
}

export async function getFriends(req: Request, res: Response) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = session.user.id;

    const friends = await db
      .selectDistinct({
        id: user.id,
        name: user.name,

        image: user.image,
      })
      .from(friendsTable)
      .innerJoin(
        user,
        or(
          and(
            eq(friendsTable.user_id1, userId),
            eq(user.id, friendsTable.user_id2)
          ),
          and(
            eq(friendsTable.user_id2, userId),
            eq(user.id, friendsTable.user_id1)
          )
        )
      )

      .where(
        or(eq(friendsTable.user_id1, userId), eq(friendsTable.user_id2, userId))
      );

    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
}
