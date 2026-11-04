import { z } from 'zod';
import { checkPassword, startSession } from '@/lib/auth';
import { issueCode } from '@/lib/codes';
import { query } from '@/lib/db';
import { clientIp, fail, limited, ok, parseBody, sameOrigin, serverError } from '@/lib/http';

const Body = z.object({
  email: z.email('Проверьте адрес почты').transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, 'Введите пароль').max(200),
});
const WRONG = 'Неверная почта или пароль.';

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail(403, 'forbidden', 'Запрос отклонён.');
    if (await limited(`login:${clientIp(req)}`, 30, 600)) return fail(429, 'too_many_requests', 'Слишком много попыток. Попробуйте через 10 минут.');
    const body = await parseBody(req, Body);
    if ('response' in body) return body.response;
    const { email, password } = body.data;

    const rows = await query<{ id: string; first_name: string; email: string; password_hash: string; verified_at: string | null; locked: boolean }>(
      `select id, first_name, email, password_hash, verified_at, coalesce(locked_until > now(), false) as locked from users where email = $1`,
      [email],
    );
    const user = rows[0];
    if (!user) return fail(401, 'invalid_credentials', WRONG);
    if (user.locked) return fail(429, 'locked', 'Слишком много неудачных попыток. Попробуйте через 15 минут.');

    if (!(await checkPassword(password, user.password_hash))) {
      await query(
        `update users set failed_logins = case when failed_logins >= 4 then 0 else failed_logins + 1 end,
           locked_until = case when failed_logins >= 4 then now() + interval '15 minutes' else null end
         where id = $1`,
        [user.id],
      );
      return fail(401, 'invalid_credentials', WRONG);
    }
    await query('update users set failed_logins = 0, locked_until = null where id = $1', [user.id]);
    if (!user.verified_at) {
      await issueCode(user);
      return ok({ status: 'needs_code' });
    }
    await startSession(user.id);
    return ok({ status: 'signed_in' });
  } catch (error) {
    return serverError('login', error);
  }
}
