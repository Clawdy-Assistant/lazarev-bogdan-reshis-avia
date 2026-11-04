import { currentUser } from '@/lib/auth';
import { fail, ok, serverError } from '@/lib/http';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return fail(401, 'unauthorized', 'Войдите в аккаунт.');
    return ok({ user: { firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    return serverError('me', error);
  }
}
