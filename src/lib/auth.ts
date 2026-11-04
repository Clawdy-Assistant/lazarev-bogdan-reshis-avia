import { createHash, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { query } from './db';

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number, options: object) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const COOKIE = 'ra_session';
const SESSION_DAYS = 30;

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 32, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function checkPassword(password: string, stored: string) {
  const [, salt, key] = stored.split('$');
  const expected = Buffer.from(key, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length, SCRYPT);
  return timingSafeEqual(actual, expected);
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export const hashCode = (userId: string, code: string) => sha256(`${userId}:${code}`);

export function newCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function sameHash(a: string, b: string) {
  return a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function startSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await query('insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)', [sha256(token), userId, expires.toISOString()]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await query('delete from sessions where token_hash = $1', [sha256(token)]);
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await query<{ id: string; first_name: string; last_name: string; email: string }>(
    `select u.id, u.first_name, u.last_name, u.email from sessions s
     join users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [sha256(token)],
  );
  const row = rows[0];
  return row ? { id: row.id, firstName: row.first_name, lastName: row.last_name, email: row.email } : null;
}
