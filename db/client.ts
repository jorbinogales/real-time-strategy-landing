// DATABASE_URL vacía -> PGlite local (./.data/pg); con valor -> Postgres (pg).
// getDb() aplica las migraciones pendientes una sola vez por proceso.
import type { SQL } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';
import { applyMigrations } from './migrate';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const g = globalThis as unknown as { __rtsDb?: Promise<Db> };

async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const { Pool } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const pool = new Pool({ connectionString: url, max: 5 });
    await applyMigrations((s) => pool.query(s), (s) => pool.query(s));
    return drizzle(pool, { schema }) as unknown as Db;
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { mkdirSync } = await import('node:fs');
  mkdirSync('./.data', { recursive: true });   // PGlite no crea carpetas intermedias
  const client = new PGlite('./.data/pg');
  await client.waitReady;
  await applyMigrations((s) => client.exec(s), (s) => client.query(s));
  return drizzle(client, { schema }) as unknown as Db;
}

export function getDb(): Promise<Db> {
  // Se cachea en globalThis para sobrevivir al HMR de `next dev`.
  return (g.__rtsDb ??= open().catch((e) => { g.__rtsDb = undefined; throw e; }));
}

// Ejecuta SQL crudo y devuelve las filas (pg y PGlite devuelven { rows } en ambos drivers).
export async function rows<T = Record<string, unknown>>(query: SQL): Promise<T[]> {
  const db = await getDb();
  return ((await db.execute(query)) as unknown as { rows: T[] }).rows;
}
