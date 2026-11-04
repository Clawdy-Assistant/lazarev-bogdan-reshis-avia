import * as React from 'react';
import { Alert, Calendar, Check, Chevron } from './icons';
import { num, parseDay, formatDay, rub, type RouteInfo } from './forecast';

export const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(' ');

/* Button */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  block?: boolean;
  loading?: boolean;
}
export function Button({ variant = 'secondary', block, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx('ra-btn', `ra-btn-${variant}`, block && 'ra-btn-block', className)}
    >
      {loading ? <span className="ra-spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}

/* Field */
export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}
export function Field({ label, hint, error, id, className, ...rest }: FieldProps) {
  const auto = React.useId();
  const fid = id ?? auto;
  const note = `${fid}-note`;
  return (
    <div className={cx('ra-field', error && 'ra-field-error', className)}>
      <label className="ra-label" htmlFor={fid}>{label}</label>
      <input {...rest} id={fid} className="ra-input" aria-invalid={error ? true : undefined} aria-describedby={error || hint ? note : undefined} />
      {(error || hint) && (
        <p id={note} className={error ? 'ra-note ra-note-error' : 'ra-note'}>
          {error && <Alert width={16} height={16} />}
          <span>{error ?? hint}</span>
        </p>
      )}
    </div>
  );
}

/* Всплывающие окна поиска */
export function usePopover(initial = false) {
  const [open, setOpen] = React.useState(initial);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return { open, setOpen, root, trigger, close };
}

/* RouteSelect */
export interface RouteSelectProps {
  routes: RouteInfo[];
  value: string;
  onChange: (code: string) => void;
}
export function RouteSelect({ routes, value, onChange }: RouteSelectProps) {
  const pop = usePopover();
  const current = routes.find((r) => r.code === value)!;
  return (
    <div className="ra-seg-wrap" ref={pop.root}>
      <button ref={pop.trigger} type="button" className="ra-seg" aria-expanded={pop.open} aria-haspopup="listbox" onClick={() => pop.setOpen(!pop.open)}>
        <span className="ra-seg-label">Куда</span>
        <span className="ra-seg-value">{current.city}</span>
        <span className="ra-seg-code">{value.split('-')[1]}</span>
      </button>
      {pop.open && (
        <ul className="ra-pop ra-list" role="listbox" aria-label="Куда">
          {routes.map((r) => (
            <li key={r.code} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={r.code === value}
                className="ra-option"
                onClick={() => { onChange(r.code); pop.close(); }}
              >
                <span>{r.city}</span>
                <span className="ra-seg-code">{r.code.split('-')[1]}</span>
                {r.code === value && <Check width={18} height={18} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* DateSelect */
export interface CalendarDay {
  date: string;
  /** доля занятых мест при выбранной цене, от 0 до 1 */
  load: number;
  /** спрос выше числа мест */
  full?: boolean;
}
export interface FlightCalendarProps {
  days: CalendarDay[];
  value: string;
  onChange: (date: string) => void;
}
const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export function FlightCalendar({ days, value, onChange }: FlightCalendarProps) {
  const first = parseDay(days[0].date);
  const offset = (first.weekday + 6) % 7;
  return (
    <div className="ra-cal-box">
      <p className="ra-cal-title">Июнь 2026</p>
      <div className="ra-cal" role="group" aria-label="Дата вылета">
        {WEEK.map((w) => <span key={w} className="ra-cal-head" aria-hidden="true">{w}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`gap-${i}`} />)}
        {days.map((day) => {
          const p = parseDay(day.date);
          const share = Math.round(Math.min(1, day.load) * 100);
          const next = p.m !== first.m;
          return (
            <button
              key={day.date}
              type="button"
              className={cx('ra-day', day.full && 'ra-day-full')}
              aria-pressed={day.date === value}
              aria-label={`${formatDay(day.date).short}, загрузка ${share} %${day.full ? ', мест не хватит' : ''}`}
              onClick={() => onChange(day.date)}
            >
              <span className="ra-day-num">{p.d}{next && <small>.07</small>}</span>
              <span className="ra-day-load">{day.full ? 'полон' : `${share} %`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface DateSelectProps extends FlightCalendarProps {}
export function DateSelect({ days, value, onChange }: DateSelectProps) {
  const pop = usePopover();
  const d = formatDay(value);
  return (
    <div className="ra-seg-wrap" ref={pop.root}>
      <button ref={pop.trigger} type="button" className="ra-seg" aria-expanded={pop.open} aria-haspopup="dialog" onClick={() => pop.setOpen(!pop.open)}>
        <span className="ra-seg-label">Когда</span>
        <span className="ra-seg-value">{d.short}, {d.weekdayShort}</span>
        <Calendar className="ra-seg-icon" />
      </button>
      {pop.open && (
        <div className="ra-pop ra-pop-cal" role="dialog" aria-label="Выбор даты">
          <FlightCalendar days={days} value={value} onChange={(v) => { onChange(v); pop.close(); }} />
        </div>
      )}
    </div>
  );
}

/* PriceField */
export interface PriceFieldProps {
  value: number;
  onChange: (price: number) => void;
  invalid?: boolean;
}
export function PriceField({ value, onChange, invalid }: PriceFieldProps) {
  const id = React.useId();
  const [draft, setDraft] = React.useState<string | null>(null);
  return (
    <label className={cx('ra-seg ra-seg-input', invalid && 'ra-seg-invalid')} htmlFor={id}>
      <span className="ra-seg-label">Цена билета</span>
      <input
        id={id}
        className="ra-seg-value"
        inputMode="numeric"
        aria-invalid={invalid || undefined}
        value={draft ?? `${num(value)} ₽`}
        onFocus={(e) => { setDraft(String(Math.round(value))); const t = e.currentTarget; requestAnimationFrame(() => t.select()); }}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          setDraft(v);
          if (v !== '') onChange(Number(v));
        }}
        onBlur={() => setDraft(null)}
      />
    </label>
  );
}

/* Static «Откуда» */
export function OriginField() {
  return (
    <div className="ra-seg ra-seg-static">
      <span className="ra-seg-label">Откуда</span>
      <span className="ra-seg-value">Москва</span>
      <span className="ra-seg-code">MOW</span>
    </div>
  );
}

/* Chip */
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}
export function Chip({ active, className, children, ...rest }: ChipProps) {
  return <button type="button" {...rest} aria-pressed={active ?? false} className={cx('ra-chip', className)}>{children}</button>;
}

/* PriceSlider */
export interface PriceSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (price: number) => void;
}
export function PriceSlider({ value, min, max, step = 50, onChange }: PriceSliderProps) {
  const safe = Math.min(max, Math.max(min, value));
  return (
    <div className="ra-slider">
      <input
        className="ra-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={safe}
        aria-label="Цена билета"
        aria-valuetext={rub(value)}
        style={{ '--fill': `${((safe - min) / (max - min)) * 100}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="ra-range-ends" aria-hidden="true"><span>{rub(min)}</span><span>{rub(max)}</span></div>
    </div>
  );
}

/* Badge */
export interface BadgeProps {
  tone?: 'neutral' | 'brand' | 'capacity';
  children?: React.ReactNode;
}
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span className={`ra-badge ra-badge-${tone}`}>
      {tone === 'brand' && <Check width={16} height={16} />}
      {tone === 'capacity' && <Alert width={16} height={16} />}
      {children}
    </span>
  );
}

/* Notice */
export interface NoticeProps {
  tone?: 'brand' | 'capacity';
  children?: React.ReactNode;
}
export function Notice({ tone = 'brand', children }: NoticeProps) {
  return (
    <div className={`ra-notice ra-notice-${tone}`} role={tone === 'capacity' ? 'alert' : 'status'}>
      {tone === 'capacity' ? <Alert /> : <Check />}
      <div>{children}</div>
    </div>
  );
}

/* OtpInput: на сайте поведение даёт input-otp, здесь задан внешний вид */
export interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  label?: string;
  error?: string;
}
export function OtpInput({ value, onChange, length = 6, label = 'Код из письма', error }: OtpInputProps) {
  const id = React.useId();
  const chars = Array.from({ length }, (_, i) => value[i] ?? '');
  const active = Math.min(value.length, length - 1);
  return (
    <div className={cx('ra-field', error && 'ra-field-error')}>
      <label className="ra-label" htmlFor={id}>{label}</label>
      <div className="ra-otp">
        <input
          id={id}
          className="ra-otp-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        />
        {chars.map((c, i) => <span key={i} className="ra-otp-cell" data-active={i === active || undefined}>{c}</span>)}
      </div>
      {error && <p className="ra-note ra-note-error"><Alert width={16} height={16} /><span>{error}</span></p>}
    </div>
  );
}

export { Chevron };
