import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from './db';

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function serverError(where: string, error: unknown) {
  console.error(JSON.stringify({ level: 'error', where, message: error instanceof Error ? error.message : String(error) }));
  return fail(500, 'internal_error', 'Что-то пошло не так. Попробуйте ещё раз.');
}

/** Читает JSON и проверяет его схемой. Возвращает либо данные, либо готовый ответ с ошибкой. */
export async function parseBody<S extends z.ZodType>(req: Request, schema: S): Promise<{ data: z.infer<S> } | { response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { response: fail(400, 'invalid_json', 'Запрос не удалось прочитать.') };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { response: fail(422, 'validation_error', parsed.error.issues[0]?.message ?? 'Проверьте введённые данные.') };
  }
  return { data: parsed.data };
}

/** Запросы, меняющие данные, принимаются только со своего сайта. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get('x-forwarded-host') ?? req.headers.get('host'));
  } catch {
    return false;
  }
}

export function clientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

/** Счётчик запросов на окно времени. Возвращает true, если лимит превышен. */
export async function limited(key: string, limit: number, windowSeconds: number) {
  const rows = await query<{ hits: number }>(
    `insert into rate_limits (key, window_start, hits) values ($1, now(), 1)
     on conflict (key) do update set
       hits = case when rate_limits.window_start < now() - make_interval(secs => $2::double precision) then 1 else rate_limits.hits + 1 end,
       window_start = case when rate_limits.window_start < now() - make_interval(secs => $2::double precision) then now() else rate_limits.window_start end
     returning hits`,
    [key, windowSeconds],
  );
  return Number(rows[0].hits) > limit;
}
