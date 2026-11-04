import { z } from 'zod';
import { issueCode } from '@/lib/codes';
import { query } from '@/lib/db';
import { clientIp, fail, limited, ok, parseBody, sameOrigin, serverError } from '@/lib/http';

const Body = z.object({ email: z.email('Проверьте адрес почты').transform((v) => v.trim().toLowerCase()) });

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail(403, 'forbidden', 'Запрос отклонён.');
    if (await limited(`resend:${clientIp(req)}`, 10, 3600)) return fail(429, 'too_many_requests', 'Слишком много попыток. Попробуйте через час.');
    const body = await parseBody(req, Body);
    if ('response' in body) return body.response;
    const rows = await query<{ id: string; first_name: string; email: string }>(
      'select id, first_name, email from users where email = $1 and verified_at is null',
      [body.data.email],
    );
    // Ответ одинаковый, чтобы по нему нельзя было узнать, есть ли аккаунт
    if (rows[0] && !(await issueCode(rows[0]))) return fail(429, 'cooldown', 'Новый код можно запросить через минуту.');
    return ok({ status: 'code_sent' });
  } catch (error) {
    return serverError('resend', error);
  }
}
