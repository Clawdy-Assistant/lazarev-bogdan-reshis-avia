import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { calculate, DEMO_DATE, DEMO_START, findFlight, findRoute, routes } from '@/lib/flights';
import { Landing } from './landing';

export default async function Home() {
  if (await currentUser()) redirect('/forecast');
  const route = findRoute(DEMO_START)!;
  const result = calculate(route, findFlight(DEMO_START, DEMO_DATE)!, route.basePrice);
  return <Landing routes={routes} demoStart={{ code: DEMO_START, date: DEMO_DATE, result }} />;
}
