import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { calculate, calendar, findFlight, routes } from '@/lib/flights';
import { Workspace } from './workspace';

export const metadata = { title: 'Прогноз продаж: Решись Авиа' };

export default async function ForecastPage() {
  const user = await currentUser();
  if (!user) redirect('/auth?mode=login');
  const route = routes[0];
  const query = { code: route.code, date: '2026-06-05', price: route.basePrice };
  return (
    <Workspace
      routes={routes}
      user={{ firstName: user.firstName, lastName: user.lastName }}
      initialQuery={query}
      initialResult={calculate(route, findFlight(query.code, query.date)!, query.price)}
      initialCalendar={calendar(route, query.price)}
    />
  );
}
