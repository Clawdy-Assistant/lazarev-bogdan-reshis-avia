import { currentUser } from '@/lib/auth';
import { calendar, findRoute } from '@/lib/flights';
import { fail, ok, serverError } from '@/lib/http';

export async function GET(req: Request) {
  try {
    if (!(await currentUser())) return fail(401, 'unauthorized', 'Войдите в аккаунт.');
    const url = new URL(req.url);
    const route = findRoute(url.searchParams.get('route') ?? '');
    if (!route) return fail(404, 'route_not_found', 'Такого маршрута нет.');
    const price = Number(url.searchParams.get('price'));
    if (!Number.isFinite(price) || price <= 0) return fail(422, 'validation_error', 'Укажите цену числом.');
    return ok(calendar(route, price));
  } catch (error) {
    return serverError('calendar', error);
  }
}
