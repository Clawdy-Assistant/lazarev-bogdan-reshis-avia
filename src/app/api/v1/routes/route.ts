import { ok } from '@/lib/http';
import { routes } from '@/lib/flights';

export function GET() {
  return ok({ routes: routes.map(({ code, city, name, basePrice, priceMin, priceMax }) => ({ code, city, name, basePrice, priceMin, priceMax })) });
}
