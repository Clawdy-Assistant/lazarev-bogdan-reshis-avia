import { z } from 'zod';
import { calculate, DEMO_DATE, findFlight, findRoute } from '@/lib/flights';
import { fail, ok, parseBody, serverError } from '@/lib/http';

/* Открытый расчёт для примера на лендинге: только один день, без входа. */
const Body = z.object({ code: z.string().max(10), price: z.number().finite().positive() });

export async function POST(req: Request) {
  try {
    const body = await parseBody(req, Body);
    if ('response' in body) return body.response;
    const route = findRoute(body.data.code);
    const flight = route && findFlight(route.code, DEMO_DATE);
    if (!route || !flight) return fail(404, 'flight_not_found', 'Такого рейса нет в примере.');
    const price = Math.min(route.priceMax, Math.max(route.priceMin, body.data.price));
    return ok(calculate(route, flight, price));
  } catch (error) {
    return serverError('demo', error);
  }
}
