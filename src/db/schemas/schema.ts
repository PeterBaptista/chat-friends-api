import { integer, pgTable, text, timestamp, } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const friendsTable = pgTable("users", {
  id: text('id').primaryKey(),
  user_id1: text('user_id1').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  user_id2: text('user_id2').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
});

export const invitesTable = pgTable("invites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userFromId: text('user_from_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  userToId: text('user_to_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  status: text({ enum: ["pending", "accepted", "rejected"] }).notNull(),
  createdAt: timestamp('created_at').notNull(),
  responseAt: timestamp('response_at'),
});

export const messages = pgTable("messages", {
  id: text('id').primaryKey(),
  userFromId: text('user_from_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  userToId: text('user_to_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  sendAt : timestamp('send_at').notNull(),
});
