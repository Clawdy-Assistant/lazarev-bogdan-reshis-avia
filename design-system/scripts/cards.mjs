// Карточки и описания компонентов. Запуск: node scripts/cards.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'project', 'components');
const blobs = readFileSync(join(out, '..', '..', 'media', 'web', 'blobs.json'), 'utf8').trim();

const card = (name, group, height, subtitle, wrap, body) => `<!-- @dsCard group="${group}" height=${height} subtitle="${subtitle}" -->
<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>${name}</title></head>
<body>
<div id="root" class="${wrap}"></div>
<script>
  var R = window.ReshisAvia, h = React.createElement, S = React.useState;
  var ROUTES = [
    {code:'MOW-AER',city:'Сочи',basePrice:9000,sensitivity:.141,priceMin:5400,priceMax:18000},
    {code:'MOW-LED',city:'Санкт-Петербург',basePrice:5500,sensitivity:.294,priceMin:3300,priceMax:11000},
    {code:'MOW-KGD',city:'Калининград',basePrice:7500,sensitivity:.0957,priceMin:4500,priceMax:15000},
    {code:'MOW-OVB',city:'Новосибирск',basePrice:12000,sensitivity:.0312,priceMin:7200,priceMax:24000},
    {code:'MOW-MRV',city:'Минеральные Воды',basePrice:8000,sensitivity:.0653,priceMin:4800,priceMax:16000}];
  // прогноз MOW-AER на 1 июня и MOW-KGD на 26 июня при базовой цене
  var FIT = [712,738,763,784,803,821,839,870,913], OVER = [415,434,449,459,468,476,484,505,532];
  var IMG = ${blobs};
  function Demo() { ${body} }
  ReactDOM.createRoot(document.getElementById('root')).render(h(Demo));
</script>
</body>
</html>
`;

const C = {
  Button: ['Действия', 124, 'Главная, вторичная, тихая, загрузка', 'ra-preview',
    `return h(React.Fragment,null,h(R.Button,{variant:'primary'},'Рассчитать'),h(R.Button,null,'Отмена'),h(R.Button,{variant:'ghost'},'Запросить код ещё раз'),h(R.Button,{variant:'primary',loading:true},'Считаем'));`,
    `Запускает действие. **Главная** оранжевая кнопка (\`cta\`) одна на экран, остальные \`secondary\` или \`ghost\`.

Подпись начинается с глагола и говорит, что произойдёт: «Рассчитать», «Создать аккаунт». Передайте \`loading\` на время запроса: кнопка блокируется и показывает индикатор.

Потребитель передаёт: \`variant\`, \`block\`, \`loading\` и обычные свойства кнопки.`],
  Field: ['Формы', 300, 'Обычное, с подсказкой, с ошибкой', 'ra-preview-col',
    `return h(React.Fragment,null,h(R.Field,{label:'Почта',type:'email',placeholder:'name@example.ru'}),h(R.Field,{label:'Пароль',type:'password',hint:'Не короче 8 символов'}),h(R.Field,{label:'Почта',defaultValue:'name@',error:'Проверьте адрес: после @ нужен домен'}));`,
    `Текстовое поле формы входа и регистрации. Подпись всегда над полем, placeholder её не заменяет.

Текст ошибки говорит, что не так и как исправить, и отмечен значком, а не только цветом. Размер шрифта 16 px, поэтому iOS не приближает страницу при фокусе.

Потребитель передаёт: \`label\`, \`hint\`, \`error\` и обычные свойства input.`],
  SearchBar: ['Поиск', 340, 'Строка поиска целиком', 'ra-preview-hero',
    `var a=S('MOW-AER'),d=S('2026-06-05'),p=S(9000);var days=[];for(var i=1;i<=30;i++){days.push({date:'2026-06-'+(i<10?'0'+i:i),load:.7+((i*7)%10)/30,full:i%7===3});}days.push({date:'2026-07-01',load:.8});return h('form',{className:'ra-search',onSubmit:function(e){e.preventDefault();}},h('div',{className:'ra-search-row'},h(R.OriginField),h(R.RouteSelect,{routes:ROUTES,value:a[0],onChange:a[1]}),h(R.DateSelect,{days:days,value:d[0],onChange:d[1]}),h(R.PriceField,{value:p[0],onChange:p[1]})),h(R.Button,{type:'submit',variant:'primary',className:'ra-search-go'},'Рассчитать'));`,
    `Главная форма продукта: одна строка из склеенных белых полей и оранжевая кнопка справа. Лежит только на \`hero\`.

Поля идут в порядке, в котором человек думает: откуда, куда, когда, почём. «Откуда» зафиксировано, потому что все рейсы вылетают из Москвы. Куда и когда открываются во всплывающем окне, цена вводится прямо в поле. На телефоне поля выстраиваются сеткой два на два, кнопка уходит вниз.

Состоит из \`OriginField\`, \`RouteSelect\`, \`DateSelect\`, \`PriceField\` и \`Button\`.`],
  FlightCalendar: ['Поиск', 420, 'Месяц с загрузкой каждого дня', 'ra-preview-col',
    `var s=S('2026-06-05');var days=[];for(var i=1;i<=30;i++){days.push({date:'2026-06-'+(i<10?'0'+i:i),load:.7+((i*7)%10)/30,full:i%7===3});}days.push({date:'2026-07-01',load:.8});return h('div',{className:'ra-card'},h(R.FlightCalendar,{days:days,value:s[0],onChange:s[1]}));`,
    `Календарь вылетов. Под числом вместо цены показана загрузка рейса при текущей цене, поэтому пиковые дни видны ещё до выбора. Слово «полон» и цвет \`capacity\` значат, что спрос выше числа мест.

В календарь входит 1 июля, оно подписано как .07. Сетка начинается с понедельника.

Потребитель передаёт: \`days\` с полями \`date\`, \`load\` от 0 до 1 и \`full\`, а также \`value\` и \`onChange\`.`],
  Chip: ['Поиск', 110, 'Готовые цены под строкой поиска', 'ra-preview-hero',
    `var s=S(0);return h('div',{className:'ra-search-extra'},h(R.Chip,{active:s[0]===0,onClick:function(){s[1](0);}},'Базовая 9 000 ₽'),h(R.Chip,{active:s[0]===1,onClick:function(){s[1](1);}},'Лучшая по прогнозу 9 447 ₽'));`,
    `Быстрый выбор значения под строкой поиска. Лежит только на \`hero\`, выбранный чип становится белым.

Потребитель передаёт: \`active\`, \`onClick\`, подпись.`],
  PriceSlider: ['Поиск', 120, 'Примерка другой цены', 'ra-preview-col',
    `var s=S(9000);return h(R.PriceSlider,{value:s[0],min:5400,max:18000,onChange:s[1]});`,
    `Ползунок для быстрой примерки цены рядом с результатом. Считает сразу, без кнопки, потому что человек сравнивает варианты. Значение совпадает с полем цены в строке поиска.

Потребитель передаёт: \`value\`, \`min\`, \`max\`, \`step\`, \`onChange\`.`],
  Badge: ['Статусы', 88, 'Места есть, мест нет, нейтральный', 'ra-preview',
    `return h(React.Fragment,null,h(R.Badge,{tone:'brand'},'Места остаются'),h(R.Badge,{tone:'capacity'},'Мест не хватит: 18 чел.'),h(R.Badge,null,'Билеты не купят'));`,
    `Короткий статус рейса. \`brand\` значит, что места есть, \`capacity\` значит, что спрос упёрся в предел.

Статус всегда содержит слова и значок, цвет только усиливает смысл. Потребитель передаёт: \`tone\`, текст.`],
  Notice: ['Статусы', 180, 'Подтверждение и ошибка', 'ra-preview-col',
    `return h(React.Fragment,null,h(R.Notice,null,'Отправили код на name@example.ru. Если письма нет, проверьте спам.'),h(R.Notice,{tone:'capacity'},'Код не подошёл. Проверьте цифры или запросите новый.'));`,
    `Сообщение на всю ширину формы. Используйте для итога действия: отправили письмо, не удалось войти.

\`capacity\` объявляется как \`role="alert"\`, поэтому экранный диктор прочитает ошибку сразу. Потребитель передаёт: \`tone\`, содержимое.`],
  OtpInput: ['Формы', 180, 'Шесть цифр из письма', 'ra-preview-col',
    `var s=S('48');return h(R.OtpInput,{value:s[0],onChange:s[1]});`,
    `Ввод шестизначного кода подтверждения почты. Код удобнее ссылки: человек остаётся на странице, и письмо не откроется в другом браузере.

Внутри одно поле с \`autocomplete="one-time-code"\`, поэтому телефон предложит код сам. Потребитель передаёт: \`value\`, \`onChange\`, \`error\`.`],
  StatRow: ['Результат', 150, 'Три карточки с показателями', 'ra-preview-wide',
    `return h(R.StatRow,{result:{seats:900,want:817,free:83,fillChance:.17}});`,
    `Три вторичных показателя под графиком: сколько хотят купить, сколько мест свободно, какой шанс заполнить рейс.

Шанс оценивается по квантилям. Вне диапазона от 0,1 до 0,9 точного значения нет, поэтому показывается «меньше 10 %» или «больше 90 %». Потребитель передаёт: \`result\`.`],
  Ticket: ['Результат', 240, 'Рассчитанный рейс в виде посадочного талона', 'ra-preview-col',
    `return h(R.Ticket,{to:'AER',city:'Сочи',date:'2026-06-05',price:9000});`,
    `Рассчитанный рейс в виде посадочного талона: синяя полоса с названием, маршрут, дата и отрывной корешок с ценой и штрихкодом. Показывает то, что было отправлено формой, поэтому человек сверяет запрос рядом с ответом.

На широком экране корешок стоит справа, на телефоне уходит вниз. Вырезы на линии отрыва прозрачные, поэтому талон можно класть на любой фон. Штрихкод декоративный: его рисунок зависит от маршрута и даты.

Потребитель передаёт: \`to\`, \`city\`, \`date\`, \`price\`.`],
  LoadBar: ['Результат', 90, 'Загрузка рейса', 'ra-preview-wide',
    `return h(R.LoadBar,{seats:900,sold:817});`,
    `Шкала загрузки рейса: один взгляд отвечает, полон самолёт или нет.

Потребитель передаёт: \`seats\`, \`sold\`.`],
  DemandChart: ['Результат', 440, 'Распределение спроса', 'ra-preview-wide',
    `return h('div',{className:'ra-card'},h(R.DemandChart,{scenarios:OVER,seats:450}));`,
    `График распределения спроса при введённой цене. Девять квантилей делят спрос на десять столбцов по 10 % вероятности. Площадь столбцов равна, поэтому высота показывает, какой спрос вероятнее.

Чёрная линия: медиана, она совпадает с числом «Хотят купить». Пунктир \`capacity\`: число мест. Всё, что правее, закрашено оранжевым: столько людей не поместится. Крайние столбцы светлее, потому что точных границ у них нет.

При наведении или касании столбца строка под графиком показывает его границы. Для экранных дикторов рядом лежит таблица с девятью значениями. График не анимируется: при движении ползунка он должен успевать за рукой.

Потребитель передаёт: \`scenarios\` (девять чисел по возрастанию) и \`seats\`.`],
  ResultCard: ['Результат', 260, 'Главный ответ экрана', 'ra-preview-col',
    `return h(R.ResultCard,{result:{seats:450,want:468,sold:450,free:0,overflow:18,scenarios:OVER,fillChance:.65}});`,
    `Главный ответ: сколько купят и из скольких мест. Самое важное число стоит первым и набрано \`number-xl\`.

Потребитель передаёт: \`result\` с полями \`seats\`, \`sold\`, \`overflow\`.`],
  Destinations: ['Результат', 300, 'Карточки маршрутов с картинками', 'ra-preview-wide',
    `var s=S('MOW-AER');return h(R.Destinations,{routes:ROUTES,images:IMG,value:s[0],onSelect:s[1]});`,
    `Пять направлений с картинками под результатом. Нажатие сразу выбирает маршрут, ставит его базовую цену и пересчитывает прогноз. Выбранное направление обведено \`brand\`.

На широком экране карточки занимают пять колонок общей сетки, на телефоне и планшете листаются пальцем. Картинки сгенерированы для этого проекта.

Потребитель передаёт: \`routes\`, \`images\` по коду маршрута, \`value\`, \`onSelect\`.`],
  TopBar: ['Каркас', 100, 'Шапка на синем фоне', 'ra-preview-hero',
    `return h(R.TopBar,null,h(R.ProfileMenu,{user:{firstName:'Иван',lastName:'Петров'}}));`,
    `Шапка поверх синего блока с логотипом: белая плашка с самолётом и название «Решись Авиа».

Почту в шапке не показывайте, для этого есть \`ProfileMenu\`. Потребитель передаёт элементы справа через \`children\`.`],
  ProfileMenu: ['Каркас', 240, 'Профиль с открытым окном', 'ra-preview-hero',
    `return h('div',{style:{display:'flex',justifyContent:'flex-end'}},h(R.ProfileMenu,{user:{firstName:'Иван',lastName:'Петров'},defaultOpen:true}));`,
    `Кнопка «Профиль» в шапке. По нажатию открывает окно с аватаром, именем и фамилией и красной кнопкой «Выйти» со значком.

Аватар строится из первых букв имени и фамилии, загрузка фото не нужна. Окно закрывается по Esc и нажатию мимо, фокус возвращается на кнопку.

Потребитель передаёт: \`user\` с полями \`firstName\` и \`lastName\`, \`onLogout\`.`],
  Card: ['Каркас', 160, 'Белая карточка с заголовком', 'ra-preview-wide',
    `return h(R.Card,{title:'Как распределён спрос'},h('p',null,'Карточка группирует один смысловой блок экрана.'));`,
    `Основная поверхность. Не вкладывайте карточки друг в друга: внутри разделяйте блоки отступом.

Потребитель передаёт: \`title\`, содержимое.`],
};
for (const [name, [group, height, subtitle, wrap, body, readme]] of Object.entries(C)) {
  const dir = join(out, name); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'preview.html'), card(name, group, height, subtitle, wrap, body));
  writeFileSync(join(dir, 'README.md'), readme + '\n');
}
mkdirSync(join(out, 'AuthScreen'), { recursive: true });
writeFileSync(join(out, 'AuthScreen', 'preview.html'), `<!-- @dsCard group="Экраны" height=760 width=1280 page subtitle="Регистрация, код из письма, вход" -->
<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Вход и регистрация</title></head>
<body>
<div id="root"></div>
<script>
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.ReshisAvia.AuthScreen, { heroImage: '/_blob/08db49c2899f61b5591c42b95ff74f38' }));
</script>
</body>
</html>
`);
writeFileSync(join(out, 'AuthScreen', 'README.md'), `Регистрация, подтверждение почты и вход на синем фоне. Заголовок над карточкой меняется вместе с шагом: «Добро пожаловать в Решись Авиа», «Почти готово», «С возвращением». В карточке всегда одно простое действие.

Шаги идут так: имя, фамилия, почта и пароль, затем код из письма и рабочий экран. Имя и фамилия нужны для окна профиля. После ввода кода не просите входить ещё раз. Запросы к серверу приходят через \`actions\`. Без них кнопки только переключают шаги.
`);
writeFileSync(join(out, 'WorkspaceScreen', 'README.md'), `Главный экран. Сверху синий блок с заголовком и поиском, ниже на той же сетке белые карточки с ответом. Карточка работает на настоящем прогнозе: 155 рейсов из my_forecast.csv.

Данные приходят через \`loadForecast\` и \`loadCalendar\`: на сайте это запросы к API. Запрос уходит по кнопке «Рассчитать». Ползунок «Примерить другую цену» считает сразу и меняет цену в строке поиска. На телефоне после нажатия экран сам прокручивается к результату.

При смене маршрута цена возвращается к базовой: диапазоны цен у маршрутов разные.
`);
mkdirSync(join(out, 'LandingScreen'), { recursive: true });
writeFileSync(join(out, 'LandingScreen', 'README.md'), `Лендинг: первая страница сайта для тех, кто ещё не вошёл. Ведёт к регистрации и даёт попробовать прогноз без аккаунта.

Порядок разделов: первый экран с большим самолётом, числа о данных, три шага, живой пример, направления, финальный баннер. Все числа настоящие: 5 маршрутов, 155 рейсов, 9 сценариев, 31 день. Не добавляйте выдуманные отзывы и показатели.

Живой пример использует тот же \`ResultBoard\`, что и рабочий экран. Карточки направлений переключают рейс в примере. Разделы стоят в общих границах страницы, числа и шаги делят её на равные части.

Потребитель передаёт: \`routes\`, \`loadDemo\`, \`demoStart\`, \`images\`, \`onRegister\`, \`onLogin\`.
`);
mkdirSync(join(out, 'Cover'), { recursive: true });
writeFileSync(join(out, 'Cover', 'preview.html'), `<!-- @dsCard height=288 -->
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Решись Авиа</title>
<style>
  html, body { margin:0; height:100%; }
  body { background:var(--surface); color:var(--ink); font-family:var(--font-sans); overflow:hidden; }
  .cover { position:relative; height:288px; overflow:hidden; }
  .art { position:absolute; top:0; left:480px; width:480px; height:288px; overflow:hidden; }
  .art svg { display:block; }
  .blue { fill:var(--hero); }
  .orange { fill:var(--cta); }
  .soft { fill:var(--brand-soft); }
  .white { fill:var(--on-hero); }
  .sky { fill:var(--brand); }
  .blk { rx:var(--radius-xl); }
  .words { position:absolute; left:var(--space-5); right:var(--space-5); bottom:var(--space-5); max-width:440px; }
  .name { margin:0; font-size:88px; line-height:.95; font-weight:800; letter-spacing:-.03em; color:var(--ink); }
  .tag { margin:var(--space-2) 0 0 2px; font-size:14px; line-height:20px; color:var(--ink-muted); }
</style>
</head>
<body>
<div class="cover">
<div class="art" aria-hidden="true">
<svg viewBox="0 0 480 288" width="480" height="288">
<!--
  blocks      hero 300×312 в полный рост (цвет, по которому узнают продукт) · cta 128×116 (главная кнопка) · brand-soft 128×96 · surface-raised внутри hero как строка поиска
  arrangement большая синяя плита и два спутника справа, зазоры space-3, правый край уходит за границу
  pattern     скругления и столбики: строка «мягкие формы» плюс столбцы графика спроса, 8 штук шагом space-5 на плите
  scales      стороны кратны space-1, зазор space-3, шаг space-5, углы radius-xl
-->
<rect class="blue blk" x="12" y="-12" width="300" height="312" rx="20"/>
<rect class="orange blk" x="324" y="24" width="168" height="116" rx="20"/>
<rect class="soft blk" x="324" y="152" width="168" height="112" rx="20"/>
<rect class="white" x="36" y="44" width="252" height="48" rx="16"/>
<rect class="sky" x="52" y="60" width="72" height="16" rx="8"/>
<rect class="white" x="44" y="212" width="20" height="52" rx="6"/>
<rect class="white" x="68" y="188" width="20" height="76" rx="6"/>
<rect class="white" x="92" y="164" width="20" height="100" rx="6"/>
<rect class="white" x="116" y="140" width="20" height="124" rx="6"/>
<rect class="white" x="140" y="124" width="20" height="140" rx="6"/>
<rect class="white" x="164" y="148" width="20" height="116" rx="6"/>
<rect class="white" x="188" y="180" width="20" height="84" rx="6"/>
<rect class="orange" x="212" y="212" width="20" height="52" rx="6"/>
<rect class="orange" x="236" y="232" width="20" height="32" rx="6"/>
</svg>
</div>
<div class="words">
<h1 class="name">Решись<br>Авиа</h1>
<p class="tag">Просто узнать, сколько билетов купят.</p>
</div>
</div>
</body>
</html>
`);
console.log('cards', Object.keys(C).length + 3);
