import { z } from 'zod';
import { hashPassword } from '@/lib/auth';
import { issueCode } from '@/lib/codes';
import { query } from '@/lib/db';
import { clientIp, fail, limited, ok, parseBody, sameOrigin, serverError } from '@/lib/http';

const Body = z.object({
  firstName: z.string().trim().min(1, 'Укажите имя').max(60, 'Имя слишком длинное'),
  lastName: z.string().trim().min(1, 'Укажите фамилию').max(60, 'Фамилия слишком длинная'),
  email: z.email('Проверьте адрес почты').max(254).transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8, 'Пароль должен быть не короче 8 символов').max(200, 'Пароль слишком длинный'),
});

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail(403, 'forbidden', 'Запрос отклонён.');
    if (await limited(`register:${clientIp(req)}`, 10, 3600)) return fail(429, 'too_many_requests', 'Слишком много попыток. Попробуйте через час.');
    const body = await parseBody(req, Body);
    if ('response' in body) return body.response;
    const { firstName, lastName, email, password } = body.data;

    const existing = await query<{ id: string; verified_at: string | null }>('select id, verified_at from users where email = $1', [email]);
    if (existing[0]?.verified_at) return fail(409, 'email_taken', 'Этот адрес уже зарегистрирован. Войдите в аккаунт.');

    const passwordHash = await hashPassword(password);
    const rows = await query<{ id: string; first_name: string; email: string }>(
      `insert into users (first_name, last_name, email, password_hash) values ($1, $2, $3, $4)
       on conflict (email) do update set first_name = excluded.first_name, last_name = excluded.last_name, password_hash = excluded.password_hash
       returning id, first_name, email`,
      [firstName, lastName, email, passwordHash],
    );
    await issueCode(rows[0]);
    return ok({ status: 'code_sent' }, 201);
  } catch (error) {
    return serverError('register', error);
  }
}
