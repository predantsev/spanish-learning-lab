// A2-08-L4 — compare options and explain a choice (O4/O6): the opinion frame Creo que… / Para mí, …
// (productive bank, 10 instances) and a short written comparison with a reason (rubric, any
// reasoned choice is valid). Also returns to practical-information reading and recipient/purpose
// messages (skill returns.practice).
import { ex, table, ul, uk } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-08-L4';
const OC = 'formula.opinion-choice/construction-use';
const WC = 'writing.compare-choose-reason/construction-use';
const PI = 'reading.practical-information/reading-meaning';
const WM = 'writing.message-recipient-purpose/construction-use';
const unresText = 'Вільний текст не перевіряється автоматично. Порівняйте відповідь із критеріями і зразком: зразок — лише один із можливих варіантів.';

const D = {
  [OC]: {
    rule: 'Свою думку можна почати з Creo que + звичайне речення (Creo que el autobús es más barato) або з Para mí, … (Para mí, el tren es mejor). Que після creo не пропускаємо. Потім можна додати причину з porque.',
    ok: 'Правильно! Думку висловлено природно.',
    bad: 'Ще ні. Схема: Creo que + речення або Para mí, + речення.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком: Creo que… / Para mí, …',
  },
  [WC]: {
    rule: 'Порівняйте варіанти за однією-двома ознаками (más barato, más cerca, mejor), назвіть свій вибір і причину: Prefiero el piso A porque está más cerca del trabajo.',
    ok: 'Ваша відповідь збігається зі зразком.',
    bad: 'Перевірте відповідь за критеріями.',
    unres: unresText,
  },
  [PI]: {
    rule: 'Спершу прочитайте питання, потім знайдіть у тексті саме ту деталь, яку треба порівняти: ціну, час, місце.',
    ok: 'Правильно! Ви знайшли й порівняли потрібну інформацію.',
    bad: 'Ні. Знайдіть у тексті потрібні числа й порівняйте їх ще раз.',
  },
  [WM]: {
    rule: 'Повідомлення другові: звертання, ваша думка чи вибір, причина, пропозиція (¿Vamos…?, ¿Quedamos…?), прощання.',
    ok: 'Ваша відповідь збігається зі зразком.',
    bad: 'Перевірте повідомлення за критеріями.',
    unres: unresText,
  },
};
const k = kit(L, D);

/** Accepted variants of one opinion clause: Creo que / Yo creo que / Para mí(,) . */
const op = (clause, frames = ['creo', 'para']) => {
  const out = [];
  const lower = clause[0].toLowerCase() + clause.slice(1);
  if (frames.includes('creo')) out.push(`Creo que ${lower}`, `Yo creo que ${lower}`);
  if (frames.includes('para')) out.push(`Para mí, ${lower}`, `Para mí ${lower}`);
  return out;
};
const noQue = (clause) => [`Creo ${clause[0].toLowerCase() + clause.slice(1)}`, 'Після creo потрібне que: Creo que + речення.'];

// ---- information texts ----
const FLATS = 'Piso A: en el centro, cerca del trabajo. 800 euros al mes, gastos incluidos. Dos habitaciones. Piso B: a treinta minutos del centro en autobús. 650 euros al mes, gastos no incluidos (unos 100 euros). Tres habitaciones y terraza.';
const TRIPS = 'Madrid – Sevilla. Tren: 2 horas y 30 minutos, 60 euros. Autobús: 6 horas, 25 euros.';

const tasks = [
  // ---- formula.opinion-choice (T01–T10) ----
  k.ch(1, 'supported', 'fam.opinion-transport', OC, {
    instr: 'Оберіть правильно побудовану думку: «Думаю, що потяг зручніший».',
    pre: uk('Нагадування: Creo que + речення; que не пропускаємо.'),
    opts: [
      ['Creo que el tren es más cómodo.', 'c'],
      ['Creo el tren es más cómodo.', 'x', 'Після creo потрібне que: Creo que el tren…'],
      ['Creo que el tren más cómodo.', 'x', 'У реченні після que потрібне дієслово: el tren es más cómodo.'],
    ],
  }),
  k.ev(2, 'supported', 'fam.opinion-transport', OC, {
    instr: 'За зразком висловіть думку: автобус дешевший (más barato). Можна почати з Creo que… або Para mí, …',
    model: ['Creo que el tren es más rápido.', 'Думаю, що потяг швидший.'],
    acc: op('El autobús es más barato.'),
    err: [noQue('El autobús es más barato.')],
  }),
  k.ev(3, 'independent', 'fam.opinion-housing', OC, {
    instr: 'Висловіть думку: квартира в центрі краща (el piso del centro, mejor). Почніть із Creo que… або Para mí, …',
    acc: op('El piso del centro es mejor.'),
    err: [noQue('El piso del centro es mejor.'), ['Creo que el piso del centro es más mejor.', 'Mejor уже означає «кращий»; más не додаємо.', { [OC]: 'unresolved' }]],
  }),
  k.ev(4, 'independent', 'fam.opinion-food', OC, {
    instr: 'Об’єднайте в одне речення думку і факт: Creo que… + Este restaurante es muy bueno.',
    es: ['Creo que…', 'Este restaurante es muy bueno.'],
    acc: ['Creo que este restaurante es muy bueno.', 'Yo creo que este restaurante es muy bueno.'],
    err: [noQue('Este restaurante es muy bueno.')],
  }),
  k.ev(5, 'independent', 'fam.opinion-leisure', OC, {
    instr: 'Перепишіть речення як свою думку з Para mí, …',
    es: 'El museo es más interesante que el parque.',
    acc: ['Para mí, el museo es más interesante que el parque.', 'Para mí el museo es más interesante que el parque.'],
    err: [['Para mí el museo más interesante que el parque.', 'У реченні потрібне дієслово: el museo es más interesante.']],
  }),
  k.ev(6, 'independent', 'fam.opinion-transport', OC, {
    instr: 'Висловіть думку з Creo que і додайте причину з porque: потяг кращий, бо він швидший (más rápido).',
    acc: [
      'Creo que el tren es mejor porque es más rápido.',
      'Yo creo que el tren es mejor porque es más rápido.',
      'Creo que el tren es mejor, porque es más rápido.',
    ],
    err: [['Creo el tren es mejor porque es más rápido.', 'Після creo потрібне que: Creo que el tren…']],
  }),
  k.ev(7, 'delayed', 'fam.opinion-housing', OC, {
    instr: 'Висловіть думку: квартира B більша (el piso B, más grande). Почніть із Creo que… або Para mí, …',
    acc: op('El piso B es más grande.'),
    err: [noQue('El piso B es más grande.')],
  }),
  k.ev(8, 'delayed', 'fam.opinion-food', OC, {
    instr: 'Перепишіть речення як свою думку з Creo que…',
    es: 'La comida del bar es más barata.',
    acc: ['Creo que la comida del bar es más barata.', 'Yo creo que la comida del bar es más barata.'],
    err: [noQue('La comida del bar es más barata.')],
  }),
  k.ev(9, 'transfer', 'fam.opinion-shopping', OC, {
    instr: 'У магазині ви обираєте між двома телефонами. Висловіть думку: чорний телефон кращий (el móvil negro, mejor). Почніть із Creo que… або Para mí, …',
    acc: op('El móvil negro es mejor.'),
    err: [noQue('El móvil negro es mejor.')],
  }),
  k.ev(10, 'transfer', 'fam.opinion-study', OC, {
    instr: 'Ви обираєте курс іспанської. Висловіть думку з Para mí, …: вечірній курс зручніший (el curso de la tarde, más cómodo).',
    acc: ['Para mí, el curso de la tarde es más cómodo.', 'Para mí el curso de la tarde es más cómodo.'],
    tr: 'el curso — курс',
    err: [['Para mí el curso de la tarde más cómodo.', 'У реченні потрібне дієслово: el curso de la tarde es más cómodo.']],
  }),

  // ---- reading.practical-information (return) ----
  k.ch(11, 'independent', 'fam.compare-flats', PI, {
    instr: 'Прочитайте два оголошення. Скільки насправді коштує на місяць квартира B разом із комунальними?',
    es: FLATS,
    opts: [
      ['приблизно 750 євро', 'c'],
      ['650 євро', 'x', 'Gastos no incluidos (unos 100 euros) — комунальні не включено, це ще близько 100 євро.'],
      ['800 євро', 'x', '800 — ціна квартири A з комунальними.'],
    ],
  }),

  // ---- writing.compare-choose-reason ----
  k.rb(12, 'supported', 'fam.compare-flats', WC, {
    instr: 'Прочитайте два оголошення. Яку квартиру ви обрали б? Напишіть 2–3 речення: порівняйте їх за однією-двома ознаками, назвіть свій вибір і причину.',
    pre: [
      uk('Зразок структури: порівняння (más… que) → вибір (Prefiero… / Para mí, … es mejor) → причина (porque…).'),
      ex('El hotel A es más caro que el hotel B, pero está más cerca de la playa. Prefiero el hotel A porque no tengo coche.', 'Готель A дорожчий за готель B, але ближче до пляжу. Я обираю готель A, бо в мене немає машини.'),
    ],
    es: FLATS,
    criteria: [
      'Є порівняння за однією-двома ознаками (más barato, más cerca, más grande…).',
      'Ясно названо ваш вибір (Prefiero el piso A… / Para mí, el piso B es mejor…).',
      'Є причина (porque…).',
      'Будь-який обґрунтований вибір правильний.',
    ],
    exemplars: ['El piso A es más caro que el piso B, pero está en el centro. Prefiero el piso A porque está cerca del trabajo.', 'El piso B es más grande que el piso A y tiene terraza. Creo que el piso B es mejor porque es más barato.'],
  }),
  k.rb(13, 'independent', 'fam.compare-trips', WC, {
    instr: 'Ви їдете з Мадрида до Севільї. Порівняйте потяг і автобус та напишіть, що ви обираєте і чому. 2–3 речення.',
    es: TRIPS,
    criteria: [
      'Є порівняння (más rápido, más barato, más cómodo…).',
      'Ясно названо ваш вибір.',
      'Є причина (porque…).',
    ],
    exemplars: ['El tren es más rápido que el autobús, pero es más caro. Prefiero el autobús porque no tengo mucho dinero.', 'Creo que el tren es mejor porque es mucho más rápido.'],
  }),
  k.rb(14, 'independent', 'fam.compare-weekend', WC, {
    instr: 'У суботу можна піти в кіно (о 20:00, 9 євро) або на концерт у парку (о 21:00, безкоштовно — gratis). Що ви обираєте і чому? 2–3 речення.',
    tr: 'gratis — безкоштовно',
    criteria: [
      'Є порівняння двох планів (más barato, más tarde, más interesante…).',
      'Ясно названо ваш вибір.',
      'Є причина (porque…).',
    ],
    exemplars: ['El concierto es más barato que el cine: es gratis. Prefiero el concierto porque me gusta la música.', 'Para mí, el cine es mejor porque el concierto es muy tarde.'],
  }),
  k.rb(15, 'delayed', 'fam.compare-restaurants', WC, {
    instr: 'Ви обираєте, де пообідати з другом: ресторан «Sol» (комплексний обід за 15 євро, у центрі) чи бар «Luna» (комплексний обід за 10 євро, біля вашого дому). Порівняйте й поясніть свій вибір. 2–3 речення.',
    criteria: [
      'Є порівняння (más barato, más cerca…).',
      'Ясно названо ваш вибір.',
      'Є причина (porque…).',
    ],
    exemplars: ['El bar Luna es más barato que el restaurante Sol y está más cerca de mi casa. Prefiero el bar Luna porque es más barato.'],
  }),
  k.rb(16, 'transfer', 'fam.compare-courses', WC, {
    instr: 'Ви обираєте курс іспанської: ранковий (з 9:00, 120 євро на місяць) чи вечірній (з 19:00, 100 євро на місяць). Порівняйте й поясніть свій вибір. 2–3 речення.',
    tr: 'el curso de la mañana / de la tarde — ранковий / вечірній курс',
    criteria: [
      'Є порівняння (más barato, más temprano, más cómodo…).',
      'Ясно названо ваш вибір.',
      'Є причина (porque…).',
    ],
    exemplars: ['El curso de la tarde es más barato que el curso de la mañana. Prefiero el curso de la tarde porque por la mañana trabajo.'],
  }),

  // ---- writing.message-recipient-purpose (return) ----
  k.rb(17, 'independent', 'fam.compare-message', WM, {
    tr: '¿Te parece bien? — Тобі підходить? / Як тобі?',
    instr: 'Напишіть повідомлення подрузі Ані: у суботу ви пропонуєте піти на концерт у парку, а не в кіно, і поясніть чому. Запитайте, чи їй підходить. 3–4 речення.',
    criteria: [
      'Є дружнє звертання до Ани.',
      'Є пропозиція (¿Vamos al concierto…?) і ваша причина (porque…).',
      'Є питання, чи їй підходить (¿Te parece bien? / ¿Vale?).',
      'Є прощання.',
    ],
    exemplars: ['Hola, Ana: ¿Vamos al concierto del parque el sábado? Creo que es mejor que el cine porque es gratis. ¿Te parece bien? Un beso.'],
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-08',
  titleUk: 'Порівняти варіанти й пояснити вибір',
  termEs: 'comparar opciones y explicar una elección',
  summaryUk: 'Порівнюємо два знайомі варіанти — житло, транспорт, плани — і пояснюємо свій вибір: Creo que… / Para mí, … + причина з porque. Правильної «єдиної» відповіді немає: важливі порівняння і причина.',
  objectives: ['A2-08-O4', 'A2-08-O6'],
  cv: ['CV-06'],
  situations: ['places-accommodation', 'food-shopping', 'time-appointments-transport', 'routine-study-leisure'],
  estimatedMinutes: 19,
  introduces: ['formula.opinion-choice', 'writing.compare-choose-reason'],
  revisits: ['compare.mas-menos-que', 'compare.tan-como', 'compare.mejor', 'preferir.choice', 'link.porque', 'link.pero', 'reading.practical-information', 'writing.message-recipient-purpose'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Думка і вибір: Creo que… / Para mí, …',
      required: true,
      blocks: [
        uk('Думку починаємо з Creo que + звичайне речення в теперішньому часі або з Para mí, … Після creo обов’язково que. Причину додаємо з porque.'),
        ex('Creo que el autobús es más barato.', 'Думаю, що автобус дешевший.'),
        ex('Para mí, el tren es mejor porque es más rápido.', 'Як на мене, потяг кращий, бо він швидший.'),
        table(['Іспанською', 'Українською'], [
          ['la opción', 'варіант: la opción A, la opción B'],
          ['la ventaja', 'перевага: La ventaja del tren es que es rápido.'],
          ['el inconveniente', 'недолік: El inconveniente es el precio.'],
          ['rápido / lento', 'швидкий / повільний'],
        ], 'uk'),
      ],
    },
    {
      id: 's2',
      kind: 'examples',
      titleUk: 'Порівняння з причиною',
      required: true,
      blocks: [
        uk('Добра відповідь: порівняння за однією-двома ознаками → ваш вибір → причина. Будь-який обґрунтований вибір правильний.'),
        ex('El piso A es más caro que el piso B, pero está en el centro. Prefiero el piso A porque está cerca del trabajo.', 'Квартира A дорожча за квартиру B, але вона в центрі. Я обираю квартиру A, бо вона близько до роботи.'),
        ex('La ventaja del autobús es el precio. El inconveniente es que es más lento.', 'Перевага автобуса — ціна. Недолік у тому, що він повільніший.'),
      ],
    },
    { id: 's3', kind: 'supported-practice', titleUk: 'Практика зі зразком', required: true, taskIds: [1, 2].map(T) },
    { id: 's4', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: [3, 4, 5, 6].map(T) },
    { id: 's5', kind: 'reading', titleUk: 'Читаємо два оголошення', required: true, blocks: [uk('Дві квартири: порівняйте ціни разом із комунальними.')], taskIds: [11].map(T) },
    { id: 's6', kind: 'writing', titleUk: 'Пишемо свій вибір', required: true, blocks: [uk('Спершу з підказкою, потім самостійно.')], taskIds: [12, 13].map(T) },
    { id: 's7', kind: 'writing', titleUk: 'Ще вибір і повідомлення (за бажанням)', required: false, blocks: [uk('Субота: кіно чи концерт? Потім — повідомлення подрузі.')], taskIds: [14, 17].map(T) },
    {
      id: 's8',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Creo que + речення; Para mí, + речення. Que після creo не пропускаємо.',
          'Порівняння: más / menos … que, mejor, tan … como.',
          'Вибір + причина: Prefiero… porque…',
          'La opción — варіант, la ventaja — перевага, el inconveniente — недолік.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
