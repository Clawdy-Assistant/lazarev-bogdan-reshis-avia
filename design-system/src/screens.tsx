import * as React from 'react';
import { Button, Chip, DateSelect, Field, Notice, OriginField, OtpInput, PriceField, PriceSlider, RouteSelect } from './controls';
import { DemandChart, Destinations, ResultCard, StatRow, Ticket } from './data';
import { Card, ProfileMenu, TopBar, type ProfileUser } from './layout';
import { rub, type CalendarInfo, type Forecast, type ForecastApi, type ForecastQuery, type RouteInfo } from './forecast';
import { Alert, Bars, Help, Login, Pin } from './icons';

/* ResultBoard: одна и та же раскладка результата на рабочем экране и на лендинге */
export interface ResultBoardProps {
  route: RouteInfo;
  date: string;
  price: number;
  result: Forecast;
  onPrice: (price: number) => void;
}
export function ResultBoard({ route, date, price, result, onPrice }: ResultBoardProps) {
  return (
    <>
      <div className="ra-col ra-col-side">
        <Ticket to={route.code.split('-')[1]} city={route.city} date={date} price={price} />
        <ResultCard result={result} />
        <Card title="Примерить другую цену">
          <PriceSlider value={price} min={route.priceMin} max={route.priceMax} onChange={onPrice} />
        </Card>
      </div>
      <div className="ra-col ra-col-main">
        <Card title="Как распределён спрос"><DemandChart scenarios={result.scenarios} seats={result.seats} /></Card>
        <StatRow result={result} />
      </div>
    </>
  );
}

export interface WorkspaceScreenProps extends ForecastApi {
  routes: RouteInfo[];
  user: ProfileUser;
  onLogout?: () => void;
  /** первый рейс и его готовый расчёт с сервера */
  initialQuery?: ForecastQuery;
  initialResult?: Forecast;
  initialCalendar?: CalendarInfo;
  /** фон синего блока */
  heroImage?: string;
  /** картинки направлений по коду маршрута */
  routeImages?: Record<string, string>;
}

const heroStyle = (url?: string) => (url ? ({ '--hero-image': `url("${url}")` } as React.CSSProperties) : undefined);
const FAILED = 'Не удалось получить прогноз. Проверьте соединение и попробуйте ещё раз.';

export function WorkspaceScreen({ routes, loadCalendar, loadForecast, user, onLogout, initialQuery, initialResult, initialCalendar, heroImage, routeImages }: WorkspaceScreenProps) {
  const first = initialQuery ?? { code: routes[0].code, date: '2026-06-05', price: routes[0].basePrice };
  const [draft, setDraft] = React.useState(first);
  const [query, setQuery] = React.useState(first);
  const [result, setResult] = React.useState<Forecast | null>(initialResult ?? null);
  const [calendar, setCalendar] = React.useState<CalendarInfo | null>(initialCalendar ?? null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const results = React.useRef<HTMLDivElement>(null);
  const lastRequest = React.useRef(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const skipCalendar = React.useRef(Boolean(initialCalendar));

  const run = React.useCallback(async (next: ForecastQuery) => {
    const id = ++lastRequest.current;
    setBusy(true);
    setError(null);
    try {
      const data = await loadForecast(next);
      if (id !== lastRequest.current) return;
      setResult(data);
      setQuery(next);
    } catch (e) {
      if (id === lastRequest.current) setError(e instanceof Error && e.message ? e.message : FAILED);
    } finally {
      if (id === lastRequest.current) setBusy(false);
    }
  }, [loadForecast]);

  React.useEffect(() => { if (!initialResult) void run(first); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Календарь показывает загрузку при текущей цене
  React.useEffect(() => {
    if (skipCalendar.current) { skipCalendar.current = false; return; }
    let live = true;
    const t = setTimeout(() => {
      loadCalendar(draft.code, draft.price).then((c) => { if (live) setCalendar(c); }).catch(() => undefined);
    }, 200);
    return () => { live = false; clearTimeout(t); };
  }, [draft.code, draft.price, loadCalendar]);

  const draftRoute = routes.find((r) => r.code === draft.code)!;
  const out = draft.price < draftRoute.priceMin || draft.price > draftRoute.priceMax;
  const best = calendar?.bestPrice[draft.date];
  const route = routes.find((r) => r.code === query.code)!;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (out) return;
    await run(draft);
    if (window.innerWidth <= 760) results.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const chooseRoute = (code: string) => {
    const next = { ...query, code, price: routes.find((r) => r.code === code)!.basePrice };
    setDraft(next);
    void run(next);
    results.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const tryPrice = (price: number) => {
    const next = { ...query, price };
    setDraft(next);
    setQuery(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void run(next), 120);
  };

  return (
    <div className="ra-app">
      <div className="ra-hero" style={heroStyle(heroImage)}>
        <TopBar>
          <ProfileMenu user={user} onLogout={onLogout} />
        </TopBar>
        <div className="ra-hero-body">
          <h1 className="ra-hero-title">Сколько билетов купят при вашей цене</h1>
          <form className="ra-search" onSubmit={submit}>
            <div className="ra-search-row">
              <OriginField />
              <RouteSelect
                routes={routes}
                value={draft.code}
                onChange={(code) => setDraft((d) => ({ ...d, code, price: routes.find((r) => r.code === code)!.basePrice }))}
              />
              <DateSelect days={calendar?.days ?? []} value={draft.date} onChange={(date) => setDraft((d) => ({ ...d, date }))} />
              <PriceField value={draft.price} invalid={out} onChange={(price) => setDraft((d) => ({ ...d, price }))} />
            </div>
            <Button type="submit" variant="primary" className="ra-search-go" loading={busy}>Рассчитать</Button>
          </form>
          <div className="ra-search-extra">
            <Chip active={draft.price === draftRoute.basePrice} onClick={() => setDraft((d) => ({ ...d, price: draftRoute.basePrice }))}>Базовая {rub(draftRoute.basePrice)}</Chip>
            {best != null && <Chip active={draft.price === best} onClick={() => setDraft((d) => ({ ...d, price: best }))}>Лучшая по прогнозу {rub(best)}</Chip>}
            {out && <p className="ra-search-error" role="alert"><Alert width={18} height={18} />Цена на этом маршруте от {rub(draftRoute.priceMin)} до {rub(draftRoute.priceMax)}</p>}
          </div>
        </div>
      </div>

      <main className="ra-work" ref={results}>
        {error && <div className="ra-work-error"><Notice tone="capacity">{error}</Notice></div>}
        {result && <ResultBoard route={route} date={query.date} price={query.price} result={result} onPrice={tryPrice} />}
        {routeImages && <Destinations routes={routes} images={routeImages} value={query.code} onSelect={chooseRoute} />}
      </main>
    </div>
  );
}

type Step = 'register' | 'code' | 'login';

export interface RegisterData { firstName: string; lastName: string; email: string; password: string }
export interface AuthActions {
  /** возвращают текст ошибки или ничего, если всё хорошо */
  register: (data: RegisterData) => Promise<string | void>;
  verify: (email: string, code: string) => Promise<string | void>;
  resend: (email: string) => Promise<string | void>;
  /** needsCode: почта не подтверждена, письмо с кодом уже отправлено */
  login: (email: string, password: string) => Promise<string | void | { needsCode: true }>;
}
export interface AuthScreenProps {
  initialStep?: Step;
  initialEmail?: string;
  heroImage?: string;
  actions?: AuthActions;
}

const DEMO_ACTIONS: AuthActions = {
  register: async () => undefined,
  verify: async () => undefined,
  resend: async () => undefined,
  login: async () => undefined,
};

export function AuthScreen({ initialStep = 'register', initialEmail = '', heroImage, actions = DEMO_ACTIONS }: AuthScreenProps) {
  const [step, setStep] = React.useState<Step>(initialStep);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState(initialEmail);
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const headlines: Record<Step, string> = {
    register: 'Добро пожаловать в Решись Авиа',
    code: 'Почти готово',
    login: 'С возвращением',
  };
  const titles: Record<Step, string> = {
    register: 'Создайте аккаунт',
    code: 'Подтвердите почту',
    login: 'Войдите в аккаунт',
  };

  const go = (next: Step) => { setStep(next); setError(null); setSent(false); setCode(''); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (step === 'register') {
        const err = await actions.register({ firstName, lastName, email, password });
        if (err) setError(err); else go('code');
      } else if (step === 'code') {
        const err = await actions.verify(email, code);
        if (err) setError(err);
      } else {
        const res = await actions.login(email, password);
        if (typeof res === 'string') setError(res);
        else if (res?.needsCode) go('code');
      }
    } catch {
      setError('Не удалось связаться с сервером. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    setError(null);
    setSent(false);
    const err = await actions.resend(email).catch(() => 'Не удалось отправить письмо. Попробуйте ещё раз.');
    if (err) setError(err); else setSent(true);
  };

  return (
    <div className="ra-auth" style={heroStyle(heroImage)}>
      <TopBar />
      <div className="ra-auth-body">
        <p className="ra-hero-title">{headlines[step]}</p>
        <div className="ra-card ra-auth-card">
          <h1 className="ra-auth-title">{titles[step]}</h1>
          {step === 'code' && !error && <Notice>{sent ? 'Отправили новый код' : 'Отправили код'} на {email || 'вашу почту'}. Если письма нет, проверьте спам.</Notice>}
          {error && <Notice tone="capacity">{error}</Notice>}
          <form className="ra-stack" onSubmit={submit}>
            {step !== 'code' && (
              <>
                {step === 'register' && (
                  <div className="ra-two">
                    <Field label="Имя" name="firstName" autoComplete="given-name" required maxLength={60} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" />
                    <Field label="Фамилия" name="lastName" autoComplete="family-name" required maxLength={60} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Петров" />
                  </div>
                )}
                <Field label="Почта" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.ru" />
                <Field
                  label="Пароль"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={200}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={step === 'login' ? 'current-password' : 'new-password'}
                  hint={step === 'register' ? 'Не короче 8 символов' : undefined}
                />
              </>
            )}
            {step === 'code' && <OtpInput value={code} onChange={setCode} />}
            <Button type="submit" variant="primary" block loading={busy} disabled={step === 'code' && code.length < 6}>
              {step === 'register' ? 'Создать аккаунт' : step === 'code' ? 'Подтвердить' : 'Войти'}
            </Button>
          </form>
          {step === 'code' && <p className="ra-auth-switch"><button type="button" onClick={resend}>Отправить код ещё раз</button></p>}
          <p className="ra-auth-switch">
            {step === 'login'
              ? <>Нет аккаунта? <button type="button" onClick={() => go('register')}>Создать</button></>
              : <>Уже есть аккаунт? <button type="button" onClick={() => go('login')}>Войти</button></>}
          </p>
        </div>
      </div>
    </div>
  );
}

/* LandingScreen */
export interface LandingImages {
  landing: string;
  hero: string;
  step1: string;
  step2: string;
  step3: string;
}
export interface LandingScreenProps {
  routes: RouteInfo[];
  /** расчёт для живого примера */
  loadDemo: (code: string, price: number) => Promise<Forecast>;
  /** готовый расчёт первого рейса примера */
  demoStart: { code: string; date: string; result?: Forecast };
  images: LandingImages & Record<string, string>;
  onRegister?: () => void;
  onLogin?: () => void;
}

const FACTS = [
  { value: '5', label: 'маршрутов из Москвы' },
  { value: '155', label: 'рейсов в прогнозе' },
  { value: '9', label: 'сценариев спроса на рейс' },
  { value: '31', label: 'день: с 1 июня по 1 июля 2026' },
];

const STEPS = [
  { key: 'step1' as const, title: 'Выберите рейс', text: 'Укажите направление и дату вылета. Календарь сразу показывает, какие дни загружены сильнее.' },
  { key: 'step2' as const, title: 'Назначьте цену', text: 'Введите цену сами или возьмите базовую и лучшую по прогнозу, а затем примерьте другие варианты.' },
  { key: 'step3' as const, title: 'Получите прогноз', text: 'Сколько билетов купят, сколько мест останется и какой шанс заполнить самолёт целиком.' },
];

export function LandingScreen({ routes, loadDemo, demoStart, images, onRegister, onLogin }: LandingScreenProps) {
  const [code, setCode] = React.useState(demoStart.code);
  const route = routes.find((r) => r.code === code)!;
  const [price, setPrice] = React.useState(route.basePrice);
  const [result, setResult] = React.useState<Forecast | null>(demoStart.result ?? null);
  const demo = React.useRef<HTMLElement>(null);
  const lastRequest = React.useRef(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const refresh = React.useCallback((nextCode: string, nextPrice: number, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const id = ++lastRequest.current;
      loadDemo(nextCode, nextPrice).then((r) => { if (id === lastRequest.current) setResult(r); }).catch(() => undefined);
    }, delay);
  }, [loadDemo]);
  React.useEffect(() => { if (!demoStart.result) refresh(code, price, 0); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (next: string) => {
    const nextPrice = routes.find((r) => r.code === next)!.basePrice;
    setCode(next);
    setPrice(nextPrice);
    refresh(next, nextPrice, 0);
    demo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const movePrice = (next: number) => { setPrice(next); refresh(code, next, 120); };

  return (
    <div className="ra-land">
      <div className="ra-land-hero" style={heroStyle(images.landing)}>
        <TopBar>
          <nav className="ra-top-nav" aria-label="Разделы">
            <a href="#how"><Help /><span>Как это работает</span></a>
            <a href="#demo"><Bars /><span>Пример</span></a>
            <a href="#routes"><Pin /><span>Направления</span></a>
          </nav>
          <button type="button" className="ra-top-btn ra-top-btn-icon" onClick={onLogin}><Login /><span>Войти</span></button>
        </TopBar>
        <div className="ra-land-copy">
          <h1 className="ra-land-title">Знайте, сколько билетов купят, ещё до вылета</h1>
          <p className="ra-land-sub">Выберите рейс и цену, а Решись Авиа покажет прогноз продаж, загрузку самолёта и шанс заполнить его целиком.</p>
          <div className="ra-land-actions">
            <Button variant="primary" onClick={onRegister}>Создать аккаунт</Button>
            <button type="button" className="ra-land-login" onClick={onLogin}>У меня есть аккаунт</button>
          </div>
        </div>
      </div>

      <main className="ra-land-main">
        <dl className="ra-facts">
          {FACTS.map((f) => (
            <div key={f.label} className="ra-fact"><dd>{f.value}</dd><dt>{f.label}</dt></div>
          ))}
        </dl>

        <section id="how" className="ra-land-section">
          <h2 className="ra-land-h2">Три шага до прогноза</h2>
          <div className="ra-steps">
            {STEPS.map((s, i) => (
              <article key={s.key} className="ra-step">
                <span className="ra-step-pic"><img src={images[s.key]} alt="" loading="lazy" width={720} height={540} /></span>
                <div className="ra-step-text">
                  <span className="ra-label">Шаг {i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="demo" className="ra-land-section" ref={demo}>
          <div className="ra-land-head">
            <h2 className="ra-land-h2">Попробуйте на настоящем прогнозе</h2>
            <p>Это рейс на 26 июня из прогноза ML-модели. Подвигайте цену и посмотрите, как меняется спрос.</p>
          </div>
          <div className="ra-board">
            {result && <ResultBoard route={route} date={demoStart.date} price={price} result={result} onPrice={movePrice} />}
          </div>
        </section>

        <div id="routes" className="ra-land-section">
          <Destinations routes={routes} images={images} value={code} onSelect={pick} />
        </div>

        <section className="ra-cta" style={heroStyle(images.hero)}>
          <h2>Откройте прогноз на все 155 рейсов</h2>
          <p>Регистрация займёт пару минут.</p>
          <Button variant="primary" onClick={onRegister}>Создать аккаунт</Button>
        </section>
      </main>

      <footer className="ra-foot">
        <span className="ra-logo ra-logo-foot"><i className="ra-logo-mark" aria-hidden="true" /><span>Решись Авиа</span></span>
        <p>Учебный проект турнира «Решись». Авиакомпания вымышленная, данные предназначены для демонстрации.</p>
      </footer>
    </div>
  );
}
