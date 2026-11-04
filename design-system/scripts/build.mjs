// Собирает bundle.js, bundle.css, tokens.css и карточку рабочего экрана с реальными данными.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'project', 'components');
const COMPONENTS = ['Button', 'Field', 'FlightCalendar', 'Chip', 'PriceSlider', 'Badge', 'Notice', 'OtpInput', 'StatRow', 'Ticket', 'LoadBar', 'DemandChart', 'ResultCard', 'Destinations', 'TopBar', 'ProfileMenu', 'Card', 'WorkspaceScreen', 'AuthScreen', 'LandingScreen'];

const res = await build({
  entryPoints: [join(root, 'src/index.ts')],
  bundle: true, format: 'iife', globalName: 'ReshisAvia', minify: true, write: false, target: 'es2020',
  jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', tsconfigRaw: '{}',
  alias: { react: join(root, 'scripts/react-shim.cjs') },
  banner: { js: `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: 'ReshisAvia', components: COMPONENTS.map((name) => ({ name })) })} */` },
});
writeFileSync(join(out, 'bundle.js'), res.outputFiles[0].text);
const logo = readFileSync(join(root, 'media/web/logo-mask.png')).toString('base64');
writeFileSync(join(out, 'bundle.css'), readFileSync(join(root, 'src/bundle.css'), 'utf8').replace('__LOGO_MASK__', `data:image/png;base64,${logo}`));

// tokens.css в том виде, в каком его компилирует страница
const t = JSON.parse(readFileSync(join(root, 'project/tokens.json'), 'utf8'));
const decl = [...t.color.tokens, ...t.shadow.tokens].map((x) => `  --${x.name}: ${x.value};`).join('\n');
const other = [...t.spacing.tokens, ...t.radius.tokens].map((x) => `  --${x.name}: ${x.value};`).join('\n');
const fams = Object.entries(t.type.families).map(([k, v]) => `  --font-${k}: ${v};`).join('\n');
const css = `/* ${t.name} — generated from tokens.json */\n:root, [data-theme="light"] {\n${decl}\n}\n:root {\n${other}\n${fams}\n}\n`;
writeFileSync(join(root, 'project', 'tokens.css'), css);

// реальные данные для рабочего экрана
const csv = (p) => { const [h, ...rows] = readFileSync(p, 'utf8').trim().split('\n').map((l) => l.split(',')); return rows.map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]]))); };
const CITY = { 'MOW-AER': 'Сочи', 'MOW-LED': 'Санкт-Петербург', 'MOW-KGD': 'Калининград', 'MOW-OVB': 'Новосибирск', 'MOW-MRV': 'Минеральные Воды' };
const routes = csv(join(root, '../data/routes.csv')).map((r) => ({ code: r.route, city: CITY[r.route], name: r.name, basePrice: +r.base_price, sensitivity: +r.price_sensitivity, priceMin: +r.price_min, priceMax: +r.price_max }));
const flights = {};
for (const r of csv(join(root, '../data/forecast.csv'))) (flights[r.route] ??= []).push({ date: r.date, seats: +r.seats, bestPrice: +r['0.5_price'], demand: [1,2,3,4,5,6,7,8,9].map((i) => +r[`0.${i}_base_demand`]) });
const dir = join(out, "WorkspaceScreen"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'preview.html'), `<!-- @dsCard group="Экраны" height=1280 width=1280 page subtitle="Рабочий экран на реальном прогнозе" -->
<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Рабочий экран</title></head>
<body>
<div id="root"></div>
<script>
  var DATA = ${JSON.stringify({ routes, flights })};
  var IMG = ${readFileSync(join(root, 'media/web/blobs.json'), 'utf8').trim()};
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.ReshisAvia.WorkspaceScreen, Object.assign(window.ReshisAvia.localApi(DATA.routes, DATA.flights), { routes: DATA.routes, user: { firstName: 'Иван', lastName: 'Петров' }, heroImage: IMG.hero, routeImages: IMG })));
</script>
</body>
</html>
`);
const landDir = join(out, 'LandingScreen'); mkdirSync(landDir, { recursive: true });
writeFileSync(join(landDir, 'preview.html'), `<!-- @dsCard group="Экраны" height=3000 width=1280 page subtitle="Лендинг с живым примером" -->
<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Лендинг</title></head>
<body>
<div id="root"></div>
<script>
  var DATA = ${JSON.stringify({ routes, flights })};
  var IMG = ${readFileSync(join(root, 'media/web/blobs.json'), 'utf8').trim()};
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.ReshisAvia.LandingScreen, { routes: DATA.routes, images: IMG, demoStart: { code: 'MOW-KGD', date: '2026-06-26' }, loadDemo: function (code, price) { return window.ReshisAvia.localApi(DATA.routes, DATA.flights).loadForecast({ code: code, date: '2026-06-26', price: price }); } }));
</script>
</body>
</html>
`);
writeFileSync(join(root, 'data.json'), JSON.stringify({ routes, flights }));
// Для сайта: те же токены и стили, шрифт подключает сам сайт
const sitePath = join(root, '../src/app');
mkdirSync(sitePath, { recursive: true });
const siteCss = readFileSync(join(out, 'bundle.css'), 'utf8').replace(/^@import url\([^)]*\);\n/m, '');
writeFileSync(join(sitePath, 'design.css'), `${css.replace(/--font-sans: /, '--font-sans: var(--font-onest), ')}\n${siteCss}`);
mkdirSync(join(root, '../src/lib'), { recursive: true });
writeFileSync(join(root, '../src/lib/flights.json'), JSON.stringify({ routes, flights }));
console.log('built', (res.outputFiles[0].text.length / 1024).toFixed(1) + ' KB');
