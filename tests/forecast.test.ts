import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buys, chanceOfFilling, forecast, wants, type FlightRow, type RouteInfo } from '../design-system/src/forecast.ts';

const csv = (path: string) => {
  const [head, ...rows] = readFileSync(new URL(path, import.meta.url), 'utf8').trim().split('\n').map((l) => l.split(','));
  return rows.map((r) => Object.fromEntries(head.map((k, i) => [k, r[i]])));
};
const routes = csv('../data/routes.csv');
const rows = csv('../data/forecast.csv');
const route = (code: string): RouteInfo => {
  const r = routes.find((x) => x.route === code)!;
  return { code, city: '', name: r.name, basePrice: +r.base_price, sensitivity: +r.price_sensitivity, priceMin: +r.price_min, priceMax: +r.price_max };
};
const flight = (r: Record<string, string>): FlightRow => ({
  date: r.date, seats: +r.seats, bestPrice: +r['0.5_price'],
  demand: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => +r[`0.${i}_base_demand`]),
});

test('формула из ТЗ: при базовой цене желают ровно столько, сколько в медиане', () => {
  for (const r of rows) {
    const info = route(r.route);
    const f = forecast(flight(r), info, info.basePrice);
    assert.equal(f.want, Math.max(0, +r['0.5_base_demand']));
    assert.equal(f.sold, Math.min(+r.seats, f.want));
    assert.equal(f.free, +r.seats - f.sold);
  }
});

test('желают = base_demand − price_sensitivity × (цена − base_price)', () => {
  const info = route('MOW-AER');
  assert.ok(Math.abs(wants(803, 9447, info) - (803 - 0.141 * 447)) < 1e-9);
});

test('совпадает с прогнозом продаж из CSV для лучшей цены всех 155 рейсов', () => {
  assert.equal(rows.length, 155);
  for (const r of rows) {
    const info = route(r.route);
    const f = forecast(flight(r), info, +r['0.5_price']);
    assert.ok(Math.abs(f.sold - Math.min(+r.seats, +r['0.5_price_demand'])) <= 1.5, `${r.route} ${r.date}: ${f.sold} и ${r['0.5_price_demand']}`);
  }
});

test('продажи не бывают отрицательными и не превышают число мест', () => {
  assert.equal(buys(-50, 100), 0);
  assert.equal(buys(150, 100), 100);
  assert.equal(buys(70, 100), 70);
});

test('медиана на графике совпадает с числом «желают»', () => {
  const r = rows[0];
  const f = forecast(flight(r), route(r.route), 9000);
  assert.equal(f.scenarios[4], f.want);
  assert.equal(f.scenarios.length, 9);
});

test('шанс заполнить рейс считается по квантилям и остаётся в границах', () => {
  const q = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  assert.equal(chanceOfFilling(q, 50), 0.9);
  assert.equal(chanceOfFilling(q, 1000), 0.1);
  assert.ok(Math.abs(chanceOfFilling(q, 500) - 0.5) < 1e-9);
});
