import { query } from './db';
import { hashCode, newCode } from './auth';
import { sendCode } from './mail';

const COOLDOWN_SECONDS = 60;

/** Создаёт код и отправляет письмо. Возвращает false, если письмо уже недавно уходило. */
export async function issueCode(user: { id: string; first_name: string; email: string }) {
  const recent = await query(
    `select 1 from email_codes where user_id = $1 and sent_at > now() - make_interval(secs => $2::double precision)`,
    [user.id, COOLDOWN_SECONDS],
  );
  if (recent.length) return false;
  const code = newCode();
  await query(
    `insert into email_codes (user_id, code_hash, expires_at, attempts, sent_at)
     values ($1, $2, now() + interval '10 minutes', 0, now())
     on conflict (user_id) do update set code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, sent_at = now()`,
    [user.id, hashCode(user.id, code)],
  );
  try {
    await sendCode(user.email, user.first_name, code);
  } catch (error) {
    // Письмо не ушло: убираем код, чтобы можно было сразу попробовать снова
    await query('delete from email_codes where user_id = $1', [user.id]);
    throw error;
  }
  return true;
}
