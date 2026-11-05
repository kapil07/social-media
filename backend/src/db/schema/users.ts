import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 30 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 50 }).notNull(),
    bio: text("bio"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_username_unique").on(sql`lower(${table.username})`),

    uniqueIndex("users_email_unique").on(sql`lower(${table.email})`),

    check(
      "users_username_format_check",
      sql`${table.username} ~ '^[a-z0-9_]{3,30}$'`,
    ),

    check(
      "users_display_name_length_check",
      sql`char_length(${table.displayName}) BETWEEN 1 AND 50`,
    ),

    check(
      "users_bio_length_check",
      sql`${table.bio} IS NULL OR char_length(${table.bio}) <= 160`,
    ),
  ],
);
