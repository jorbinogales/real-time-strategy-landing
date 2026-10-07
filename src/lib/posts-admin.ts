// CRUD de posts para el admin (sin filtros de publicación). Validación aquí; la BD tiene los mismos CHECK.
import { desc, eq } from 'drizzle-orm';
import { getDb } from '@db/client';
import { newsPosts, type NewsPost } from '@db/schema';
import { isKind } from './news';

export type PostInput = {
  slug: string; title: string; excerpt: string; bodyMd: string; coverImageUrl: string | null;
  kind: string; gameVersion: string | null; status: 'draft' | 'published';
  publishedAt: Date | null; authorName: string;
};

export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);

export function parsePostForm(fd: FormData): { ok: true; data: PostInput } | { ok: false; error: string } {
  const s = (k: string) => String(fd.get(k) ?? '').trim();
  const title = s('title'), excerpt = s('excerpt'), bodyMd = s('body_md'), authorName = s('author_name');
  const slug = slugify(s('slug') || title);
  const kind = s('kind'), status = s('status');
  if (!title || title.length > 200) return { ok: false, error: 'El título es obligatorio (máx. 200).' };
  if (!slug) return { ok: false, error: 'No se pudo generar el slug.' };
  if (!excerpt || excerpt.length > 300) return { ok: false, error: 'El extracto es obligatorio (máx. 300).' };
  if (!bodyMd) return { ok: false, error: 'El contenido es obligatorio.' };
  if (!authorName || authorName.length > 80) return { ok: false, error: 'El autor es obligatorio (máx. 80).' };
  if (!isKind(kind)) return { ok: false, error: 'Tipo no válido.' };
  if (status !== 'draft' && status !== 'published') return { ok: false, error: 'Estado no válido.' };
  const cover = s('cover_image_url'), version = s('game_version');
  if (cover.length > 500) return { ok: false, error: 'La URL de portada es demasiado larga.' };
  if (cover && !/^(\/|https?:\/\/)/.test(cover)) return { ok: false, error: 'La portada debe empezar por / o http(s)://.' };
  if (version.length > 32) return { ok: false, error: 'La versión es demasiado larga (máx. 32).' };

  let publishedAt: Date | null = null;
  if (status === 'published') {
    const raw = s('published_at');
    // datetime-local no lleva zona: se interpreta como UTC. Vacío = ahora.
    publishedAt = raw ? new Date(raw.length === 16 ? `${raw}:00Z` : raw) : new Date();
    if (Number.isNaN(publishedAt.getTime())) return { ok: false, error: 'Fecha de publicación no válida.' };
  }
  return { ok: true, data: { slug, title, excerpt, bodyMd, coverImageUrl: cover || null, kind, gameVersion: version || null, status, publishedAt, authorName } };
}

type Res<T> = { ok: true; value: T } | { ok: false; error: string };

// Traduce la violación del UNIQUE de slug a un mensaje; el resto se propaga.
async function wrap<T>(fn: () => Promise<T>): Promise<Res<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (e) {
    const err = e as { code?: string; cause?: { code?: string } };
    if ((err.code ?? err.cause?.code) === '23505') return { ok: false, error: 'Ya existe un post con ese slug.' };
    throw e;
  }
}

export async function createPost(d: PostInput) {
  const db = await getDb();
  return wrap(async () => (await db.insert(newsPosts).values(d).returning({ id: newsPosts.id }))[0].id);
}

export async function updatePost(id: number, d: PostInput) {
  const db = await getDb();
  return wrap(async () => { await db.update(newsPosts).set(d).where(eq(newsPosts.id, id)); });
}

export async function setPostStatus(id: number, status: 'draft' | 'published') {
  const db = await getDb();
  const cur = await getPostById(id);
  if (!cur) return;
  const publishedAt = status === 'published' ? (cur.publishedAt ?? new Date()) : cur.publishedAt;
  await db.update(newsPosts).set({ status, publishedAt }).where(eq(newsPosts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  await db.delete(newsPosts).where(eq(newsPosts.id, id));
}

export async function listAllPosts() {
  const db = await getDb();
  return db.select().from(newsPosts).orderBy(desc(newsPosts.createdAt), desc(newsPosts.id));
}

export async function getPostById(id: number): Promise<NewsPost | null> {
  const db = await getDb();
  return (await db.select().from(newsPosts).where(eq(newsPosts.id, id)))[0] ?? null;
}
