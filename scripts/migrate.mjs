// Создаёт таблицы в базе Neon. Запуск: DATABASE_URL=... npm run db:migrate
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Set DATABASE_URL');
const sql = neon(url);
const statements = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8').split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
for (const statement of statements) await sql.query(statement);
console.log(`applied ${statements.length} statements`);
