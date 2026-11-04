import data from './flights.json';
import { calendarFor, forecast, type FlightRow, type RouteInfo } from '../../design-system/src/forecast';

export const routes = data.routes as RouteInfo[];
const flights = data.flights as Record<string, FlightRow[]>;

/** День, на котором работает открытый пример на лендинге. */
export const DEMO_DATE = '2026-06-26';
export const DEMO_START = 'MOW-KGD';

export const findRoute = (code: string) => routes.find((r) => r.code === code);
export const findFlight = (code: string, date: string) => flights[code]?.find((f) => f.date === date);

export function calculate(route: RouteInfo, flight: FlightRow, price: number) {
  return forecast(flight, route, price);
}

export function calendar(route: RouteInfo, price: number) {
  return calendarFor(flights[route.code], route, price);
}
