// Refleja db/migrations/*.sql solo para tipar consultas. La fuente de verdad es el SQL.
import { bigint, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const emailSignups = pgTable('email_signups', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').notNull().unique(),
  source: text('source').notNull().default('play_online'),
  campaign: text('campaign'),
  policyVersion: text('policy_version').notNull(),
  marketingOptInAt: timestamp('marketing_opt_in_at', { withTimezone: true }),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('email_signups_ip_recent_idx').on(t.ipHash, t.createdAt)]);

export const newsPosts = pgTable('news_posts', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  bodyMd: text('body_md').notNull(),
  coverImageUrl: text('cover_image_url'),
  kind: text('kind').notNull().default('update'),
  gameVersion: text('game_version'),
  status: text('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  authorName: text('author_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type NewsPost = typeof newsPosts.$inferSelect;
