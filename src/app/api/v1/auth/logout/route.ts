import { endSession } from '@/lib/auth';
import { fail, ok, sameOrigin, serverError } from '@/lib/http';

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail(403, 'forbidden', 'Запрос отклонён.');
    await endSession();
    return ok({ status: 'signed_out' });
  } catch (error) {
    return serverError('logout', error);
  }
}
