import { z } from 'zod';
import { hashCode, sameHash, startSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail, ok, parseBody, sameOrigin, serverError } from '@/lib/http';

const Body = z.object({
  email: z.email('Проверьте адрес почты').transform((v) => v.trim().toLowerCase()),
  code: z.string().regex(/^\d{6}$/, 'Введите шесть цифр из письма'),
});
const WRONG = 'Код не подошёл. Проверьте цифры или запросите новый.';

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail(403, 'forbidden', 'Запрос отклонён.');
    const body = await parseBody(req, Body);
    if ('response' in body) return body.response;
    const { email, code } = body.data;

    const rows = await query<{ id: string; code_hash: string; attempts: number; expired: boolean }>(
      `select u.id, c.code_hash, c.attempts, c.expires_at < now() as expired
       from users u join email_codes c on c.user_id = u.id where u.email = $1`,
      [email],
    );
    const row = rows[0];
    if (!row) return fail(400, 'invalid_code', WRONG);
    if (row.expired) return fail(400, 'code_expired', 'Срок действия кода истёк. Запросите новый.');
    if (row.attempts >= 5) return fail(429, 'too_many_attempts', 'Слишком много попыток. Запросите новый код.');

    if (!sameHash(row.code_hash, hashCode(row.id, code))) {
      await query('update email_codes set attempts = attempts + 1 where user_id = $1', [row.id]);
      return fail(400, 'invalid_code', WRONG);
    }
    await query('update users set verified_at = coalesce(verified_at, now()), failed_logins = 0, locked_until = null where id = $1', [row.id]);
    await query('delete from email_codes where user_id = $1', [row.id]);
    await startSession(row.id);
    return ok({ status: 'verified' });
  } catch (error) {
    return serverError('verify', error);
  }
}
