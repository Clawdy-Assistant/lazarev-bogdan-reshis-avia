import * as React from 'react';
import { fillChanceLabel, formatDay, num, rub, type Forecast, type RouteInfo } from './forecast';
import { Badge } from './controls';
import { Plane } from './icons';

/* Stat */
export interface StatProps {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
}
export function Stat({ label, value, note }: StatProps) {
  return (
    <div className="ra-stat">
      <dt className="ra-label">{label}</dt>
      <dd className="ra-stat-value">{value}</dd>
      {note && <dd className="ra-note">{note}</dd>}
    </div>
  );
}

/* Ticket */
export interface TicketProps {
  to: string;
  city: string;
  date: string;
  price: number;
}

/** Рисунок штрихкода зависит от рейса, поэтому у каждого талона свой. */
function Barcode({ seed }: { seed: string }) {
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const bars: Array<{ x: number; w: number }> = [];
  let x = 0;
  while (x < 118) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const w = 1 + (h >>> 24) % 3;
    const gap = 1 + (h >>> 16) % 3;
    bars.push({ x, w });
    x += w + gap;
  }
  return (
    <svg className="ra-barcode" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b) => <rect key={b.x} x={b.x} y={0} width={b.w} height={36} />)}
    </svg>
  );
}

export function Ticket({ to, city, date, price }: TicketProps) {
  const day = formatDay(date);
  return (
    <section className="ra-ticket" aria-label={`Посадочный талон: Москва — ${city}, ${day.short}, ${rub(price)}`}>
      <div className="ra-ticket-sheet">
        <div className="ra-ticket-band">
          <span className="ra-ticket-brand">Решись Авиа</span>
          <span>Посадочный талон</span>
        </div>
        <div className="ra-ticket-band ra-ticket-band-stub"><Plane width={18} height={18} /></div>
        <div className="ra-ticket-main">
          <div className="ra-ticket-route">
            <div className="ra-ticket-point"><b>MOW</b><span>Москва</span></div>
            <div className="ra-ticket-line" aria-hidden="true"><i /><Plane /><i /></div>
            <div className="ra-ticket-point ra-ticket-point-end"><b>{to}</b><span>{city}</span></div>
          </div>
          <dl className="ra-ticket-fields">
            <div><dt>Вылет</dt><dd>{day.short}</dd></div>
            <div><dt>День</dt><dd>{day.weekday}</dd></div>
          </dl>
        </div>
        <div className="ra-ticket-stub">
          <div className="ra-ticket-fare"><span>Цена</span><b>{rub(price)}</b></div>
          <Barcode seed={`${to}${date}`} />
        </div>
      </div>
    </section>
  );
}

/* LoadBar */
export interface LoadBarProps {
  seats: number;
  sold: number;
}
export function LoadBar({ seats, sold }: LoadBarProps) {
  const share = seats > 0 ? Math.min(1, sold / seats) : 0;
  return (
    <div className="ra-load" role="img" aria-label={`Занято ${Math.round(share * 100)} % мест: ${num(sold)} из ${num(seats)}`}>
      <div className="ra-load-track"><i style={{ transform: `scaleX(${share})` }} /></div>
      <div className="ra-load-caption"><span>Загрузка рейса</span><b>{Math.round(share * 100)} %</b></div>
    </div>
  );
}

/* DemandChart */
export interface DemandChartProps {
  /** спрос при введённой цене для квантилей 0.1 … 0.9 */
  scenarios: number[];
  seats: number;
}

const niceStep = (span: number) => {
  const raw = span / 5;
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow;
};

export function DemandChart({ scenarios, seats }: DemandChartProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ width, height }, setSize] = React.useState({ width: 640, height: 260 });
  const [hover, setHover] = React.useState<number | null>(null);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth || 640, height: el.clientHeight || 260 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const q = scenarios;
  if (q[8] < 1) {
    return (
      <div className="ra-chart-empty">
        <p className="ra-chart-readout">При такой цене билеты не купят</p>
        <p className="ra-note">Даже в удачном сценарии спрос равен нулю. Снизьте цену, чтобы увидеть распределение.</p>
      </div>
    );
  }

  const tailL = Math.max(q[1] - q[0], 1) * 1.6;
  const tailR = Math.max(q[8] - q[7], 1) * 1.6;
  const lo = Math.max(0, Math.min(q[0] - tailL, seats) - 2);
  const hi = Math.max(q[8] + tailR, seats) * 1.02;

  const pad = { top: 56, bottom: 30, left: 2, right: 2 };
  const inner = height - pad.top - pad.bottom;
  const x = (v: number) => pad.left + ((v - lo) / (hi - lo || 1)) * (width - pad.left - pad.right);
  const base = pad.top + inner;

  // Десять столбцов по 10 %: площадь одинакова, поэтому узкий столбец выше.
  const bands = [
    { from: Math.max(lo, q[0] - tailL), to: q[0], tail: true, pct: 0 },
    ...q.slice(0, 8).map((from, i) => ({ from, to: q[i + 1], tail: false, pct: i + 1 })),
    { from: q[8], to: q[8] + tailR, tail: true, pct: 9 },
  ];
  const minWidth = (hi - lo) / 80;
  const density = (b: (typeof bands)[number]) => 1 / Math.max(b.to - b.from, minWidth);
  const peak = Math.max(...bands.filter((b) => b.to > b.from).map(density), 1e-9);
  const heightOf = (b: (typeof bands)[number]) => (density(b) / peak) * inner;

  const step = niceStep(hi - lo);
  const ticks: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push(t);

  const median = q[4];
  const mx = x(median);
  const sx = x(seats);
  const flagsClose = Math.abs(mx - sx) < 150;
  const seatsOver = seats < q[8];
  const anchor = (px: number) => (px < 80 ? 'start' : px > width - 80 ? 'end' : 'middle');

  const shown = hover != null ? bands[hover] : null;
  const readout = shown
    ? shown.tail
      ? shown.pct === 0
        ? `С вероятностью 10 % спрос ниже ${num(q[0])}`
        : `С вероятностью 10 % спрос выше ${num(q[8])}`
      : `С вероятностью 10 % спрос от ${num(shown.from)} до ${num(shown.to)}`
    : `С вероятностью 80 % спрос от ${num(q[0])} до ${num(q[8])}`;

  return (
    <figure className="ra-chart">
      <div ref={ref} className="ra-chart-plot" onPointerLeave={() => setHover(null)}>
        <svg width={width} height={height} role="img" aria-label={`Распределение спроса: медиана ${num(median)}, мест ${num(seats)}`}>
          <defs>
            <clipPath id={`${uid}-fit`}><rect x={0} y={0} width={Math.max(0, sx - 1)} height={base} /></clipPath>
            <clipPath id={`${uid}-over`}><rect x={sx + 1} y={0} width={Math.max(0, width - sx)} height={base} /></clipPath>
          </defs>

          {(['fit', 'over'] as const).map((layer) => (
            <g key={layer} clipPath={`url(#${uid}-${layer})`}>
              {bands.map((b, i) => {
                const w = x(b.to) - x(b.from);
                if (w <= 0) return null;
                const h = heightOf(b);
                return (
                  <rect
                    key={i}
                    x={x(b.from) + 1}
                    y={base - h}
                    width={Math.max(0.5, w - 2)}
                    height={h + 8}
                    rx={Math.min(6, Math.max(0, (w - 2) / 2))}
                    className={`${layer === 'fit' ? 'ra-c-fit' : 'ra-c-over'}${b.tail ? ' ra-c-tail' : ''}`}
                    opacity={hover == null || hover === i ? undefined : 0.4}
                  />
                );
              })}
            </g>
          ))}

          <line x1={0} x2={width} y1={base + 0.5} y2={base + 0.5} className="ra-c-axis" />
          {ticks.map((t) => (
            <text key={t} x={x(t)} y={base + 21} textAnchor="middle" className="ra-c-tick">{num(t)}</text>
          ))}

          <line x1={mx} x2={mx} y1={30} y2={base} className="ra-c-median" />
          <text x={mx} y={20} textAnchor={anchor(mx)} className="ra-c-flag">Хотят купить: {num(median)}</text>

          <line x1={sx} x2={sx} y1={flagsClose ? 50 : 30} y2={base} className="ra-c-seats" />
          <text x={sx} y={flagsClose ? 44 : 20} textAnchor={anchor(sx)} className="ra-c-flag ra-c-flag-seats">Мест: {num(seats)}</text>

          {bands.map((b, i) => {
            const w = x(b.to) - x(b.from);
            return w > 0 ? (
              <rect key={i} x={x(b.from)} y={pad.top} width={w} height={inner} fill="transparent" onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} />
            ) : null;
          })}
        </svg>
      </div>
      <figcaption className="ra-chart-caption">
        <p className="ra-chart-readout" aria-live="polite">{readout}</p>
        <p className="ra-note">
          Каждый столбец означает 10 % вероятности. Чем выше столбец, тем вероятнее такой спрос.
          {seatsOver ? ' Оранжевая часть не поместится в самолёт.' : ' Весь вероятный спрос помещается в самолёт.'}
        </p>
      </figcaption>
      <table className="ra-sr">
        <caption>Девять сценариев спроса при введённой цене</caption>
        <thead><tr><th>Квантиль</th><th>Спрос</th></tr></thead>
        <tbody>{q.map((v, i) => <tr key={i}><td>0,{i + 1}</td><td>{num(v)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/* Destinations */
export interface DestinationsProps {
  routes: RouteInfo[];
  /** картинка для каждого кода маршрута */
  images: Record<string, string>;
  value: string;
  onSelect: (code: string) => void;
}
export function Destinations({ routes, images, value, onSelect }: DestinationsProps) {
  return (
    <section className="ra-dest" aria-label="Направления">
      <h2 className="ra-section-title">Направления</h2>
      <div className="ra-dest-grid">
        {routes.map((r) => (
          <button key={r.code} type="button" className="ra-dest-card" aria-pressed={r.code === value} onClick={() => onSelect(r.code)}>
            <span className="ra-dest-pic"><img src={images[r.code]} alt="" loading="lazy" width={720} height={540} /></span>
            <span className="ra-dest-text">
              <b>{r.city}</b>
              <span>базовая цена {rub(r.basePrice)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ResultCard */
export interface ResultCardProps {
  result: Forecast;
}
export function ResultCard({ result }: ResultCardProps) {
  const { seats, sold, overflow } = result;
  return (
    <section className="ra-card ra-result" aria-label="Прогноз продаж" aria-live="polite">
      <div className="ra-result-top">
        <p className="ra-label">Купят билетов</p>
        {overflow >= 1
          ? <Badge tone="capacity">Мест не хватит: {num(overflow)} чел.</Badge>
          : sold < 1
            ? <Badge>Билеты не купят</Badge>
            : <Badge tone="brand">Места остаются</Badge>}
      </div>
      <p className="ra-big"><span>{num(sold)}</span><small>из {num(seats)}</small></p>
      <LoadBar seats={seats} sold={sold} />
    </section>
  );
}

/* StatRow */
export function StatRow({ result }: ResultCardProps) {
  const { seats, want, free, fillChance } = result;
  return (
    <dl className="ra-stats">
      <Stat label="Хотят купить" value={num(want)} note="медиана прогноза" />
      <Stat label="Свободно мест" value={num(free)} note={`всего ${num(seats)}`} />
      <Stat label="Шанс заполнить рейс" value={fillChanceLabel(fillChance)} note="оценка по прогнозу" />
    </dl>
  );
}
