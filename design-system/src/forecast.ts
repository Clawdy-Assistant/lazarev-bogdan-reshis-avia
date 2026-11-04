// Расчёт из ТЗ. Тот же код позже уйдёт на backend.
export interface RouteInfo {
  code: string;
  city: string;
  name: string;
  basePrice: number;
  sensitivity: number;
  priceMin: number;
  priceMax: number;
}

export interface FlightRow {
  date: string;
  seats: number;
  /** base_demand для квантилей 0.1 … 0.9 */
  demand: number[];
  /** лучшая цена при медианном спросе */
  bestPrice: number;
}

/** желают = base_demand − price_sensitivity × (цена − base_price) */
export function wants(baseDemand: number, price: number, route: RouteInfo): number {
  return baseDemand - route.sensitivity * (price - route.basePrice);
}

/** купят = min(seats, max(0, желают)) */
export function buys(want: number, seats: number): number {
  return Math.min(seats, Math.max(0, want));
}

export interface Forecast {
  seats: number;
  want: number;
  sold: number;
  free: number;
  overflow: number;
  /** девять квантилей спроса при введённой цене */
  scenarios: number[];
  /** вероятность, что спрос не меньше числа мест */
  fillChance: number;
}

/** Линейная интерполяция по квантилям. За краями 0.1 и 0.9 точного значения нет. */
export function chanceOfFilling(scenarios: number[], seats: number): number {
  if (seats <= scenarios[0]) return 0.9;
  if (seats >= scenarios[8]) return 0.1;
  for (let i = 0; i < 8; i++) {
    const a = scenarios[i];
    const b = scenarios[i + 1];
    if (seats <= b) {
      const within = b === a ? 0 : (seats - a) / (b - a);
      return 1 - (0.1 * (i + 1) + 0.1 * within);
    }
  }
  return 0.1;
}

export function forecast(row: FlightRow, route: RouteInfo, price: number): Forecast {
  const scenarios = row.demand.map((d) => Math.max(0, wants(d, price, route)));
  const want = scenarios[4];
  const sold = buys(want, row.seats);
  return {
    seats: row.seats,
    want,
    sold,
    free: row.seats - sold,
    overflow: Math.max(0, want - row.seats),
    scenarios,
    fillChance: chanceOfFilling(scenarios, row.seats),
  };
}

const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
export const num = (v: number) => nf.format(Math.round(v));
export const rub = (v: number) => `${nf.format(Math.round(v))} ₽`;

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export function parseDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, weekday };
}

export function formatDay(iso: string) {
  const { m, d, weekday } = parseDay(iso);
  return { short: `${d} ${MONTHS[m - 1]}`, weekday: WEEKDAYS[weekday], weekdayShort: WEEKDAYS_SHORT[weekday] };
}

export function fillChanceLabel(p: number) {
  if (p >= 0.9) return 'больше 90 %';
  if (p <= 0.1) return 'меньше 10 %';
  return `около ${Math.round(p * 100)} %`;
}

/* Источник данных для экранов. На сайте это запросы к API, в дизайн-системе расчёт на месте. */
export interface CalendarInfo {
  days: Array<{ date: string; load: number; full?: boolean }>;
  /** лучшая цена для каждой даты */
  bestPrice: Record<string, number>;
}
export interface ForecastQuery {
  code: string;
  date: string;
  price: number;
}
export interface ForecastApi {
  loadCalendar: (code: string, price: number) => Promise<CalendarInfo>;
  loadForecast: (query: ForecastQuery) => Promise<Forecast>;
}

export function calendarFor(rows: FlightRow[], route: RouteInfo, price: number): CalendarInfo {
  const bestPrice: Record<string, number> = {};
  const days = rows.map((r) => {
    const f = forecast(r, route, price);
    bestPrice[r.date] = r.bestPrice;
    return { date: r.date, load: f.sold / f.seats, full: f.want > f.seats };
  });
  return { days, bestPrice };
}

export function localApi(routes: RouteInfo[], flights: Record<string, FlightRow[]>): ForecastApi {
  const find = (code: string) => routes.find((r) => r.code === code)!;
  return {
    loadCalendar: async (code, price) => calendarFor(flights[code], find(code), price),
    loadForecast: async ({ code, date, price }) => forecast(flights[code].find((r) => r.date === date)!, find(code), price),
  };
}
