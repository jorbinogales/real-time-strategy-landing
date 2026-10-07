import { and, desc, eq, lte, sql } from 'drizzle-orm';
import { getDb } from '@db/client';
import { newsPosts, type NewsPost } from '@db/schema';
import { KIND_LABEL, NEWS_PAGE_SIZE, POST_KINDS, type PostKind } from './config';

const card = {
  slug: newsPosts.slug, title: newsPosts.title, excerpt: newsPosts.excerpt, coverImageUrl: newsPosts.coverImageUrl,
  kind: newsPosts.kind, gameVersion: newsPosts.gameVersion, publishedAt: newsPosts.publishedAt, authorName: newsPosts.authorName,
};
export type NewsCard = { [K in keyof typeof card]: NewsPost[K] };

const visible = () => and(eq(newsPosts.status, 'published'), lte(newsPosts.publishedAt, sql`now()`));

// Q2 de docs/schema.md.
export async function listPublished(page: number, pageSize = NEWS_PAGE_SIZE): Promise<{ items: NewsCard[]; total: number; pages: number }> {
  const db = await getDb();
  const [items, [{ n }]] = await Promise.all([
    db.select(card).from(newsPosts).where(visible())
      .orderBy(desc(newsPosts.publishedAt), desc(newsPosts.id)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ n: sql<number>`count(*)::int` }).from(newsPosts).where(visible()),
  ]);
  return { items, total: n, pages: Math.max(1, Math.ceil(n / pageSize)) };
}

export const latestPublished = async (n = 3) => (await listPublished(1, n)).items;

// Q3.
export async function getPublishedBySlug(slug: string): Promise<NewsPost | null> {
  const db = await getDb();
  const [row] = await db.select().from(newsPosts).where(and(eq(newsPosts.slug, slug), visible())).limit(1);
  return row ?? null;
}

export const isKind = (v: unknown): v is PostKind => POST_KINDS.includes(v as PostKind);
export const kindLabel = (k: string) => (isKind(k) ? KIND_LABEL[k] : k);
