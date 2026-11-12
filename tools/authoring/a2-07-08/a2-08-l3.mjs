// A2-08-L3 — a short account of the past (O3): read a familiar event/routine account (what
// happened, in which order, background and habits) and write a brief relevant reply. No new past
// construction; form/contrast targets of A2-03…A2-06 keep their own histories (only revisited).
import { ex, ul, uk, table } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-08-L3';
const RP = 'reading.past-account/reading-meaning';
const WP = 'writing.past-account-reply/construction-use';

const D = {
  [RP]: {
    rule: 'Відокремлюйте події (що сталося: fuimos, perdimos — індефінідо) від тла та звичок (якою була ситуація, що робили зазвичай: hacía frío, iba — імперфект) і стежте за словами порядку: primero, después, por la tarde.',
    ok: 'Правильно! Ви зрозуміли розповідь.',
    bad: 'Ні. Перечитайте розповідь: що сталося, у якому порядку і якими були обставини?',
  },
  [WP]: {
    rule: 'Відповідаючи на розповідь, можна розпитати про деталі, прокоментувати або коротко розповісти про свій схожий досвід, вживаючи знайомі форми минулого.',
    ok: 'Ваша відповідь збігається зі зразком.',
    bad: 'Перевірте відповідь за критеріями.',
    unres: 'Вільний текст не перевіряється автоматично. Порівняйте відповідь із критеріями і зразком: зразок — лише один із можливих варіантів.',
  },
};
const k = kit(L, D);

// ---- accounts ----
const TRIP = 'El sábado pasado fuimos de excursión a Segovia. Salimos de Madrid a las ocho, pero el tren llegó con una hora de retraso. Hacía frío y llovía un poco. Primero vimos el acueducto y después comimos en un restaurante del centro. Por la tarde perdimos el tren de las seis y volvimos en autobús. ¡Fue un día muy bonito!';
const BADDAY = 'Hola, Laura: ¿Qué tal? Ayer tuve un día muy malo. Me levanté tarde y perdí el autobús. Llegué al trabajo a las diez y mi jefe estaba muy enfadado. Por la tarde estaba muy cansada y no fui a clase de español. ¿Y tú? ¿Qué hiciste ayer? Un beso, Marta';
const SUMMERS = 'Cuando era pequeño, vivía en un pueblo cerca del mar. Todos los veranos iba a la playa con mis abuelos. Mi abuela siempre hacía una tortilla y comíamos en la playa. Un verano, mi hermano perdió sus gafas en el agua y no las encontramos.';
const WEEK = 'Hola, Pablo: Esta semana he trabajado mucho y no he ido al gimnasio. Hoy he visto a Carlos en el metro: ¡ha cambiado mucho! Ahora tiene el pelo corto. ¿Y tú? ¿Qué tal tu semana? Un abrazo, Luis';

const G = {
  trip: 'Segovia — місто біля Мадрида; el acueducto — акведук (давній римський водогін)',
  bad: 'el jefe — начальник; enfadado / enfadada — сердитий / сердита',
  summers: 'el mar — море; la tortilla — іспанський омлет із картоплею; encontrar — знаходити',
  week: 'el metro — метро; el pelo corto — коротке волосся',
};

const tasks = [
  // ---- reading.past-account ----
  k.ch(1, 'supported', 'fam.acc-trip', RP, {
    instr: 'Прочитайте розповідь. Що вони зробили спочатку в Сеговії?',
    pre: uk('Підказка: знайдіть слово primero.'),
    es: TRIP,
    tr: G.trip,
    opts: [
      ['подивилися на акведук', 'c'],
      ['пообідали в ресторані', 'x', 'Обідали вони після акведука: después comimos…'],
      ['сіли на автобус', 'x', 'Автобусом вони поверталися ввечері: por la tarde… volvimos en autobús.'],
    ],
  }),
  k.ch(2, 'independent', 'fam.acc-trip', RP, {
    instr: 'Прочитайте розповідь ще раз. Якою була погода того дня?',
    es: TRIP,
    tr: G.trip,
    opts: [
      ['було холодно й трохи йшов дощ', 'c'],
      ['було тепло й сонячно', 'x', 'Hacía frío — було холодно; llovía un poco — трохи йшов дощ.'],
      ['було холодно, але дощу не було', 'x', 'Llovía un poco — трохи йшов дощ.'],
    ],
  }),
  k.ch(3, 'independent', 'fam.acc-trip', RP, {
    instr: 'Чому вони повернулися до Мадрида автобусом?',
    es: TRIP,
    tr: G.trip,
    opts: [
      ['Бо запізнилися на потяг о шостій.', 'c'],
      ['Бо потяг запізнився на годину.', 'x', 'Потяг запізнився вранці, коли вони їхали до Сеговії. Увечері вони самі запізнилися на потяг: perdimos el tren.'],
      ['Бо автобус дешевший.', 'x', 'Про ціну в розповіді нічого немає. Perdimos el tren de las seis — вони запізнилися на потяг.'],
    ],
  }),
  k.ch(4, 'independent', 'fam.acc-message', RP, {
    instr: 'Прочитайте повідомлення Марти. Чому вона прийшла на роботу о десятій?',
    es: BADDAY,
    tr: G.bad,
    opts: [
      ['Вона пізно встала й запізнилася на автобус.', 'c'],
      ['Начальник попросив її прийти о десятій.', 'x', 'Начальник був сердитий (estaba muy enfadado), бо вона запізнилася.'],
      ['Вона була на занятті з іспанської.', 'x', 'На заняття вона того дня не пішла: no fui a clase.'],
    ],
  }),
  k.ch(5, 'independent', 'fam.acc-message', RP, {
    instr: 'Прочитайте повідомлення ще раз. Що Марта питає в Лаури?',
    es: BADDAY,
    tr: G.bad,
    opts: [
      ['Що Лаура робила вчора.', 'c'],
      ['Чи піде Лаура з нею на заняття.', 'x', '¿Qué hiciste ayer? — Що ти робила вчора?'],
      ['О котрій Лаура встала.', 'x', 'Про час Марта розповідає про себе. Питає вона: ¿Qué hiciste ayer?'],
    ],
  }),
  k.ch(6, 'delayed', 'fam.acc-memory', RP, {
    instr: 'Прочитайте спогад. Що з цього було звичкою (щоліта), а що сталося один раз?',
    es: SUMMERS,
    tr: G.summers,
    opts: [
      ['Звичка — їздити на пляж і їсти омлет; один раз — брат загубив окуляри.', 'c'],
      ['Звичка — брат губив окуляри; один раз — поїздка на пляж.', 'x', 'Todos los veranos iba… — щоліта (звичка). Un verano, mi hermano perdió… — один раз.'],
      ['Усе це сталося один раз.', 'x', 'Todos los veranos, siempre, iba, hacía — звички. Perdió — одна подія.'],
    ],
  }),
  k.ch(7, 'transfer', 'fam.acc-week', RP, {
    instr: 'Прочитайте повідомлення Луїса. Що з цього правда?',
    es: WEEK,
    tr: G.week,
    opts: [
      ['Цього тижня Луїс багато працював і не ходив у спортзал.', 'c'],
      ['Цього тижня Луїс багато ходив у спортзал.', 'x', 'No he ido al gimnasio — я не ходив у спортзал.'],
      ['Сьогодні Луїс бачив Пабло в метро.', 'x', 'У метро Луїс бачив Карлоса; лист він пише Пабло.'],
    ],
  }),

  // ---- writing.past-account-reply ----
  k.rb(8, 'supported', 'fam.acc-message', WP, {
    instr: 'Ви — Лаура. Дайте відповідь Марті: прокоментуйте її день і коротко розкажіть, що ви робили вчора (2–3 події). 3–5 речень.',
    pre: [
      uk('Зразок структури: звертання → коментар → ваш учорашній день (primero…, después…) → прощання.'),
      ex('¡Qué día! Yo ayer trabajé por la mañana y después fui al cine con Ana.', 'Оце день! А я вчора працювала зранку, а потім пішла в кіно з Аною.'),
    ],
    es: BADDAY,
    tr: G.bad,
    criteria: [
      'Є звертання до Марти.',
      'Є коментар до її дня (¡Qué día!, Lo siento…).',
      'Є 2–3 ваші події вчора у формах минулого (trabajé, fui, comí…).',
      'Події пов’язані словами порядку (primero, después, por la tarde).',
      'Є прощання.',
    ],
    exemplars: ['Hola, Marta: ¡Qué día! Lo siento. Yo ayer trabajé por la mañana. Después comí con mi hermana y por la tarde fui al cine. Un beso, Laura'],
  }),
  k.rb(9, 'independent', 'fam.acc-trip', WP, {
    instr: 'Ваш друг написав вам розповідь про поїздку до Сеговії. Дайте відповідь: прокоментуйте і поставте два питання про поїздку (наприклад, що вони їли, з ким їздили). 2–4 речення.',
    es: TRIP,
    tr: G.trip,
    criteria: [
      'Є коментар до розповіді (¡Qué bien!, ¡Qué pena lo del tren!).',
      'Є два доречні питання про поїздку у формах минулого (¿Qué comisteis? ¿Con quién fuiste?).',
      'Питання записано з ¿…?',
    ],
    exemplars: ['¡Qué bien! Segovia es muy bonita. ¿Qué comisteis en el restaurante? ¿Con quién fuiste?'],
  }),
  k.rb(10, 'independent', 'fam.acc-memory', WP, {
    instr: 'Прочитайте спогад і дайте відповідь автору: розкажіть 2–3 реченнями, що ви робили влітку, коли були малим (малою). Вживайте імперфект для звичок.',
    es: SUMMERS,
    tr: G.summers,
    criteria: [
      'Є 2–3 речення про ваші літні звички в дитинстві.',
      'Звички передано імперфектом (iba, vivía, comía, jugaba).',
      'Є слово часу (cuando era pequeño / pequeña, todos los veranos, siempre).',
    ],
    exemplars: ['Cuando era pequeña, vivía en Kyiv. Todos los veranos iba al pueblo de mis abuelos. Allí jugaba con mis amigos en el río.'],
  }),
  k.rb(11, 'delayed', 'fam.acc-weekend', WP, {
    instr: 'Подруга питає вас у повідомленні: «¿Qué tal el fin de semana? ¿Qué hiciste?» Дайте відповідь: 2–3 події минулих вихідних і якою була погода. 3–4 речення.',
    criteria: [
      'Є 2–3 події у формах індефінідо (fui, comí, vi…).',
      'Є опис погоди або обставин імперфектом (hacía calor, llovía…).',
      'Відповідь пов’язана з питанням подруги.',
    ],
    exemplars: ['¡Hola! El sábado fui a la playa con mi hermano. Hacía mucho calor. El domingo comí en casa de mis padres y por la tarde vi una película.'],
  }),
  k.rb(12, 'transfer', 'fam.acc-week', WP, {
    instr: 'Ви — Пабло. Дайте відповідь Луїсу: розкажіть, як минув ваш тиждень (2 події цього тижня), і поставте одне питання про Карлоса. 3–4 речення.',
    es: WEEK,
    tr: G.week,
    criteria: [
      'Є звертання до Луїса.',
      'Є 2 події цього тижня (he trabajado, he ido…; індефінідо теж можливе, якщо названо конкретний день).',
      'Є питання про Карлоса (¿Qué tal está Carlos?).',
      'Є прощання.',
    ],
    exemplars: ['Hola, Luis: Mi semana ha sido muy tranquila. He ido al gimnasio dos veces y he leído un libro. ¿Qué tal está Carlos? Un abrazo, Pablo'],
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-08',
  titleUk: 'Коротка розповідь про минуле',
  termEs: 'un relato breve del pasado',
  summaryUk: 'Читаємо коротку розповідь про поїздку, невдалий день чи дитинство: що сталося, у якому порядку, якими були обставини. Потім відповідаємо: коментуємо, розпитуємо або розповідаємо про свій схожий досвід.',
  objectives: ['A2-08-O3'],
  cv: ['CV-06'],
  situations: ['routine-study-leisure', 'time-appointments-transport', 'personal-messages'],
  estimatedMinutes: 18,
  introduces: ['reading.past-account', 'writing.past-account-reply'],
  revisits: [
    'reading.time-relationship', 'reading.past-routine-description', 'writing.connected-account-reply', 'indefinido.use-completed-event',
    'imperfecto.use-habit', 'imperfecto.use-background', 'imperfecto.weather', 'contrast.indefinido-imperfecto.background-event',
    'perfecto.use-current-period', 'link.past-sequence',
  ],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Події, тло і звички',
      required: true,
      blocks: [
        uk('У розповіді про минуле шукайте три речі. Нових форм тут немає — лише ті, що ви вже знаєте.'),
        table(['Що шукаємо', 'Форма', 'Приклад'], [
          ['подія: що сталося', 'індефінідо', 'Perdimos el tren. Volvimos en autobús.'],
          ['тло: якою була ситуація', 'імперфект', 'Hacía frío y llovía un poco.'],
          ['звичка: що робили зазвичай', 'імперфект', 'Todos los veranos iba a la playa.'],
          ['сьогодні / цього тижня', 'перфекто', 'Hoy he visto a Carlos.'],
        ], 'uk'),
        table(['Іспанською', 'Українською'], [
          ['la excursión', 'поїздка, екскурсія: ir de excursión — поїхати на екскурсію'],
          ['perder', 'губити; запізнитися (на потяг, автобус): Perdí el autobús.'],
          ['el retraso', 'запізнення: con una hora de retraso — з годинним запізненням'],
        ], 'uk'),
      ],
    },
    {
      id: 's2',
      kind: 'examples',
      titleUk: 'Розповідь і відповідь',
      required: true,
      blocks: [
        ex(TRIP, 'Минулої суботи ми поїхали на екскурсію до Сеговії. Ми виїхали з Мадрида о восьмій, але потяг прибув із годинним запізненням. Було холодно й трохи йшов дощ. Спочатку ми подивилися на акведук, а потім пообідали в ресторані в центрі. Увечері ми запізнилися на потяг о шостій і повернулися автобусом. Це був дуже гарний день!'),
        ex('¡Qué día! ¿Qué comisteis en el restaurante? Yo estuve en Segovia el año pasado.', 'Оце день! Що ви їли в ресторані? Я був у Сеговії минулого року.'),
      ],
    },
    { id: 's3', kind: 'supported-practice', titleUk: 'Читаємо з підказкою', required: true, taskIds: [1].map(T) },
    { id: 's4', kind: 'reading', titleUk: 'Що сталося і якими були обставини', required: true, blocks: [uk('Розповідь про поїздку і повідомлення Марти.')], taskIds: [2, 3, 4, 5].map(T) },
    { id: 's5', kind: 'writing', titleUk: 'Відповідаємо на розповідь', required: true, blocks: [uk('Спершу відповідь із підказкою, потім — самостійно.')], taskIds: [8, 9].map(T) },
    { id: 's6', kind: 'writing', titleUk: 'Ваші літні спогади (за бажанням)', required: false, blocks: [uk('Спогад про літо в дитинстві: звички — імперфект.')], taskIds: [10].map(T) },
    {
      id: 's7',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Подія — індефінідо (perdimos), тло і звичка — імперфект (hacía frío, iba), сьогодні / цього тижня — перфекто (he visto).',
          'Слова порядку: primero, después, por la tarde.',
          'Відповідь на розповідь: коментар, питання або свій схожий досвід.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
