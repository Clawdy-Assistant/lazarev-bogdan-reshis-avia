/* Запросы браузера к backend. Сам расчёт идёт только на сервере. */
import type { CalendarInfo, Forecast, ForecastQuery } from '../../design-system/src/forecast';

export const IMAGES = {
  landing: '/media/landing.webp',
  hero: '/media/hero.webp',
  step1: '/media/step-1.webp',
  step2: '/media/step-2.webp',
  step3: '/media/step-3.webp',
  'MOW-AER': '/media/aer.webp',
  'MOW-LED': '/media/led.webp',
  'MOW-KGD': '/media/kgd.webp',
  'MOW-OVB': '/media/ovb.webp',
  'MOW-MRV': '/media/mrv.webp',
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/v1/${path}`, body === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error?.message ?? 'Не удалось связаться с сервером.', res.status);
  return data as T;
}

export const loadForecast = ({ code, date, price }: ForecastQuery) => {
  const [from, to] = code.split('-');
  return api<Forecast>('forecast', { from, to, date, price });
};
export const loadCalendar = (code: string, price: number) => api<CalendarInfo>(`calendar?route=${code}&price=${price}`);
export const loadDemo = (code: string, price: number) => api<Forecast>('demo/forecast', { code, price });
