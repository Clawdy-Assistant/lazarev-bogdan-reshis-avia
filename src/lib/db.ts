import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { neon } from '@neondatabase/serverless';

type Local = { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> };
const store = globalThis as unknown as { __localDb?: Promise<Local> };

/* Без DATABASE_URL на компьютере разработчика работает база в памяти. */
async function localDb(): Promise<Local> {
  store.__localDb ??= (async () => {
    const { PGlite } = await import('@electric-sql/pglite');
    const db = new PGlite();
    await db.exec(readFileSync(join(process.cwd(), 'db/schema.sql'), 'utf8'));
    return db as unknown as Local;
  })();
  return store.__localDb;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const url = process.env.DATABASE_URL;
  if (url) return (await neon(url).query(text, params)) as T[];
  if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL is not set');
  return (await (await localDb()).query(text, params)).rows as T[];
}
