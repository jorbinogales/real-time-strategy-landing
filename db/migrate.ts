// Aplicador mínimo: ejecuta en orden db/migrations/*.sql que falten en schema_migrations.
// Cada archivo + su fila de registro se envían en una sola consulta simple = una transacción implícita.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export type SqlExec = (sql: string) => Promise<unknown>;
export type SqlQuery = (sql: string) => Promise<{ rows: Record<string, unknown>[] }>;

const DIR = path.join(process.cwd(), 'db', 'migrations');

// ponytail: sin advisory lock; si dos instancias arrancan a la vez contra Postgres, una falla por PK y reintenta al siguiente arranque.
export async function applyMigrations(exec: SqlExec, query: SqlQuery): Promise<string[]> {
  await exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const done = new Set((await query('SELECT name FROM schema_migrations')).rows.map((r) => String(r.name)));
  const files = (await readdir(DIR)).filter((f) => /^[\w.-]+\.sql$/.test(f)).sort();
  const applied: string[] = [];
  for (const f of files) {
    if (done.has(f)) continue;
    const sql = await readFile(path.join(DIR, f), 'utf8');
    await exec(`BEGIN;\n${sql}\n;INSERT INTO schema_migrations (name) VALUES ('${f}');\nCOMMIT;`);
    applied.push(f);
  }
  return applied;
}
