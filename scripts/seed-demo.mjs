// Создаёт подтверждённый демо-аккаунт для жюри. Пароль записывается в demo-account.local.txt.
// Запуск: node --env-file=.env.local scripts/seed-demo.mjs
import { randomBytes, scryptSync } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Set DATABASE_URL');
const email = 'demo@reshis-avia.ru';
const password = `Demo-${randomBytes(6).toString('base64url')}`;
const salt = randomBytes(16);
const key = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const hash = `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
await neon(url).query(
  `insert into users (first_name, last_name, email, password_hash, verified_at) values ('Иван', 'Петров', $1, $2, now())
   on conflict (email) do update set password_hash = excluded.password_hash, verified_at = now(), failed_logins = 0, locked_until = null`,
  [email, hash],
);
writeFileSync(new URL('../demo-account.local.txt', import.meta.url), `Почта: ${email}\nПароль: ${password}\n`);
console.log('demo account ready');
