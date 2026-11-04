import { z } from 'zod';
import { currentUser } from '@/lib/auth';
import { calculate, findFlight, findRoute } from '@/lib/flights';
import { fail, ok, parseBody, serverError } from '@/lib/http';

const Body = z.object({
  from: z.string().trim().toUpperCase().length(3, 'Укажите код аэропорта вылета'),
  to: z.string().trim().toUpperCase().length(3, 'Укажите код аэропорта прилёта'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Укажите дату в формате ГГГГ-ММ-ДД'),
  price: z.number({ error: 'Укажите цену числом' }).finite().positive('Цена должна быть больше нуля'),
});

export async function POST(req: Request) {
  try {
    if (!(await currentUser())) return fail(401, 'unauthorized', 'Войдите в аккаунт.');
    const body = await parseBody(req, Body);
    if ('response' in body) return body.response;
    const { from, to, date, price } = body.data;
    const route = findRoute(`${from}-${to}`);
    const flight = route && findFlight(route.code, date);
    if (!route || !flight) return fail(404, 'flight_not_found', 'Такого рейса нет в прогнозе.');
    if (price < route.priceMin || price > route.priceMax) {
      return fail(422, 'price_out_of_range', `Цена на этом маршруте от ${route.priceMin} до ${route.priceMax} ₽.`);
    }
    return ok(calculate(route, flight, price));
  } catch (error) {
    return serverError('forecast', error);
  }
}
