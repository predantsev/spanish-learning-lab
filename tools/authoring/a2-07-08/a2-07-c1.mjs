// A2-07-C1 — optional mixed check of the block (no new teaching, no locks) + the block's
// "Materials in topic" (one reference item per lesson topic).
// The check owns a few new independent prompts; the held-out delayed/transfer banks of L1–L8 are
// reached through a practice-link, never placed in steps.
import { ex, link, table, ul, uk } from './lib.mjs';
import { kit, withPF } from './kit.mjs';

const L = 'A2-07-C1';
const P = 'formula.request-puedes/construction-use';
const O = 'formula.request-object/construction-use';
const Q = 'formula.request-queria/construction-use';
const R = 'contrast.tu-usted-register/context-choice';
const PM = 'formula.permission-puedo/construction-use';
const REF = 'formula.response-refuse-reason/construction-use';
const TR = 'imperative.tu.regular/written-form';
const TV = 'imperative.vosotros.regular/written-form';
const SAL = 'imperative.tu.salir/written-form';
const UR = 'imperative.usted.regular/written-form';
const UG = 'imperative.usted.yo-g/written-form';
const PL = 'imperative.pronoun-placement/construction-use';
const PA = 'imperative.pronoun-accent/written-form';
const RO = 'reading.instructions-order/reading-meaning';
const HR = 'obligation.hay-que/reading-meaning';
const NP = 'formula.notice-prohibido/reading-meaning';
const MX = 'formula.message-formal-informal/context-choice';
const WR = 'writing.practical-message-reason/construction-use';

const unres = 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.';
const read = { ok: 'Правильно! Ви зрозуміли текст.', bad: 'Ні. Прочитайте ще раз і знайдіть потрібне місце в тексті.' };
const form = (rule) => ({ rule, ok: 'Правильно!', bad: 'Ще ні. Перевірте форму наказу.', unres });

const D = {
  [P]: { rule: 'Прохання: ¿Puedes / Puede / Podéis / Pueden + інфінітив…? Займенник — перед poder або в кінці інфінітива: ¿Me puedes llamar? = ¿Puedes llamarme?', ok: 'Правильно! Це прохання з poder + інфінітив.', bad: 'Ще ні. Прохання: ¿Puedes…? + інфінітив.', unres },
  [O]: { rule: 'Річ просимо коротким питанням з me: ¿Me das…?, ¿Me pasas…?, ¿Me dejas…?; у барі до офіціанта — ¿Me pone…?', ok: 'Правильно! Коротке прохання з me.', bad: 'Ще ні. Схема: ¿Me + дієслово + річ?', unres },
  [Q]: { rule: 'Ввічливе прохання в магазині, на вокзалі чи в установі: Quería + іменник або інфінітив (зі знаком наголосу на í).', ok: 'Правильно! Quería звучить ввічливо.', bad: 'Ще ні. Почніть із Quería + те, чого ви хочете.', unres },
  [R]: { rule: 'Tú — друзям, родині, дітям; usted — офіційно або коли ви домовилися говорити на «ви».', ok: 'Так, це звертання відповідає ситуації.', bad: 'Ні, у цій ситуації потрібне інше звертання.' },
  [PM]: { rule: 'Дозвіл для себе: ¿Puedo + інфінітив…? Для себе й інших: ¿Podemos + інфінітив…?', ok: 'Правильно! Ви запитали дозволу.', bad: 'Ще ні. Дозвіл для себе: ¿Puedo…? + інфінітив.', unres },
  [REF]: { rule: 'Ввічлива відмова: Lo siento, es que… / Lo siento, pero… + коротка причина.', ok: 'Правильно! Ввічлива відмова з причиною.', bad: 'Ще ні. Почніть із Lo siento і додайте причину: es que…', unres },
  [TR]: form('Наказ для tú у правильних дієсловах = форма «він/вона» теперішнього часу: abre, compra, escribe.'),
  [TV]: form('Наказ для vosotros: замість -r інфінітива ставимо -d: escuchar → escuchad, comer → comed, abrir → abrid.'),
  [SAL]: form('Salir — неправильний наказ для tú: sal.'),
  [UR]: form('Наказ для usted: -ar → -e (firmar → firme), -er/-ir → -a (escribir → escriba).'),
  [UG]: form('Дієслова з -go в «я» утворюють наказ для usted від цієї форми: traigo → traiga, pongo → ponga, digo → diga.'),
  [PL]: { rule: 'У ствердному наказі займенник стоїть після дієслова й пишеться разом із ним: Abre la puerta → Ábrela.', ok: 'Правильно! Займенник приєднано, знак наголосу на місці.', bad: 'Ще ні. Займенник пишемо після наказу разом із ним і перевіряємо знак наголосу.', unres },
  [RO]: { rule: 'Шукайте дієслова дії і слова порядку: primero, luego, después, a continuación, por último.', ...read },
  [HR]: { rule: 'Hay que — «треба»; no hay que — «не потрібно».', ...read },
  [NP]: { rule: 'Prohibido + інфінітив або іменник — заборона.', ...read },
  [MX]: { rule: 'Hola + ім’я, Un abrazo, Un beso — друзям і родині. Buenos días, Estimado / Estimada…, Un saludo, Atentamente — в установу.', ok: 'Так, ця формула доречна.', bad: 'Ні. Подумайте, кому ви пишете.' },
  [WR]: {
    rule: 'Практичне повідомлення: звертання, прохання чи інструкція, деталі (коли, де, що), коротка причина, подяка чи прощання.',
    ok: 'Ваша відповідь збігається зі зразком.',
    bad: 'Перевірте повідомлення за критеріями.',
    unres: 'Вільний текст не перевіряється автоматично. Порівняйте його з критеріями і зразком: зразок — лише один із можливих варіантів.',
  },
};
D[PA] = D[PL];

const k = kit(L, D);
const ONE = 'Напишіть лише пропущене слово.';

const NOTE = 'Hola, Pablo: Mañana no estoy en casa. Primero, saca al perro a las ocho. Luego, compra pan en la tienda de la esquina. Por último, deja la llave al vecino del segundo. ¡Gracias! Ana';
const POOL = 'Piscina municipal. Horario: de 10:00 a 20:00. Hay que ducharse antes de entrar en el agua. Prohibido comer en la piscina. Los niños pequeños tienen que estar con un adulto.';

const tasks = [
  // ---- requests and responses ----
  k.ev(1, 'independent', 'fam.check-friend', P, {
    instr: 'Попросіть подругу (на tú) зателефонувати вам сьогодні ввечері (llamar esta noche).',
    acc: [...withPF('¿Puedes llamarme esta noche?'), ...withPF('¿Me puedes llamar esta noche?')],
    err: [
      ['¿Puede llamarme esta noche?', 'Ви звертаєтеся до подруги на tú: ¿Puedes…?'],
      ['¿Puedo llamarte esta noche?', '¿Puedo…? — «Можна мені…?». Ви просите подругу: ¿Puedes llamarme…?'],
      ['¿Puedes llamar esta noche?', 'Прохання зрозуміле, але не сказано, кому зателефонувати: llamarme / me puedes llamar.', { [P]: 'unresolved' }],
    ],
  }),
  k.ev(2, 'independent', 'fam.check-bar', O, {
    instr: 'У барі попросіть офіціанта (usted) принести вам сік (un zumo). Коротке прохання з me.',
    acc: [...withPF('¿Me pone un zumo?'), ...withPF('¿Me pone un zumo de naranja?')],
    err: [['¿Me pones un zumo?', 'До офіціанта в цьому завданні — на usted: ¿Me pone…?']],
    tr: 'un zumo — сік',
  }),
  k.ev(3, 'independent', 'fam.check-station', Q, {
    instr: 'У касі вокзалу ввічливо скажіть, що хочете два квитки до Валенсії (dos billetes para Valencia).',
    acc: withPF('Quería dos billetes para Valencia.'),
    err: [
      ['Queria dos billetes para Valencia.', 'Конструкцію вжито правильно, але quería пишеться зі знаком наголосу на í.', { [Q]: 'unresolved' }],
      ['Quiero dos billetes para Valencia.', 'Quiero теж зрозуміло, але тут потренуйте ввічливе quería.', { [Q]: 'unresolved' }],
    ],
  }),
  k.ch(4, 'independent', 'fam.check-school', R, {
    instr: 'Ви пишете вчительці своєї дитини й звертаєтеся до неї на «ви» (usted). Яке прохання відповідає цьому звертанню?',
    opts: [
      ['¿Puede llamarme mañana, por favor?', 'c'],
      ['¿Puedes llamarme mañana, por favor?', 'x', 'Ви обрали звертання usted, тому потрібно ¿Puede…? ¿Puedes…? — звертання на tú.'],
    ],
  }),
  k.ev(5, 'independent', 'fam.check-home', PM, {
    instr: 'Ви в гостях у друга. Запитайте дозволу скористатися його телефоном (usar tu teléfono).',
    acc: withPF('¿Puedo usar tu teléfono?'),
    err: [
      ['¿Puedes usar tu teléfono?', '¿Puedes…? — прохання до друга. Дозвіл для себе: ¿Puedo usar…?'],
      ['¿Puedo uso tu teléfono?', 'Після puedo ставимо інфінітив: usar.'],
    ],
  }),
  k.ev(6, 'independent', 'fam.check-friend', REF, {
    instr: 'Друг запрошує вас у кіно сьогодні ввечері. Ввічливо відмовтеся: вибачтеся й поясніть, що сьогодні працюєте до десятої (trabajar hasta las diez).',
    acc: [
      'Lo siento, es que hoy trabajo hasta las diez.',
      'Lo siento, pero hoy trabajo hasta las diez.',
      'Lo siento, es que trabajo hasta las diez.',
      'Lo siento, hoy trabajo hasta las diez.',
      'Lo siento, es que hoy tengo que trabajar hasta las diez.',
      'Lo siento, pero hoy tengo que trabajar hasta las diez.',
    ],
    err: [['Lo siento, es que hoy trabajar hasta las diez.', 'Після es que потрібне дієслово у формі: trabajo.']],
  }),

  // ---- instruction forms ----
  k.ev(7, 'independent', 'fam.check-home', TR, {
    instr: `Утворіть наказ для tú від abrir. ${ONE}`,
    es: '___ la ventana, por favor, hace calor.',
    acc: ['Abre'],
    err: [['Abra', 'Abra — наказ для usted. Для tú: abre.'], ['Abres', 'Abres — «ти відчиняєш». Наказ для tú: abre.']],
    closed: true,
  }),
  k.ev(8, 'independent', 'fam.check-class', TV, {
    instr: `Учителька звертається до класу. Утворіть наказ для vosotros від escuchar. ${ONE}`,
    es: 'Chicos, ___ bien, por favor.',
    acc: ['escuchad'],
    err: [['escuchar', 'Наказ для vosotros: -r → -d: escuchad.'], ['escuchen', 'Escuchen — для ustedes. Для vosotros: escuchad.']],
    closed: true,
  }),
  k.ev(9, 'independent', 'fam.check-home', SAL, {
    instr: `Утворіть наказ для tú від salir. ${ONE}`,
    es: '___ ya, la película empieza a las ocho.',
    acc: ['Sal'],
    err: [['Sale', 'Sale — «він виходить». Наказ для tú: sal.'], ['Salga', 'Salga — для usted. Для tú: sal.']],
    closed: true,
  }),
  k.ev(10, 'independent', 'fam.check-office', UR, {
    instr: `Працівниця банку звертається до клієнта на usted. Утворіть наказ від firmar. ${ONE}`,
    es: 'Señor, ___ aquí, por favor.',
    acc: ['firme'],
    err: [['firma', 'Firma — наказ для tú. Для usted: firme.'], ['firmé', 'Firmé — «я підписав». Наказ для usted: firme.']],
    closed: true,
  }),
  k.ev(11, 'independent', 'fam.check-office', UG, {
    instr: `Утворіть наказ для usted від traer (я — traigo). ${ONE}`,
    es: '___ el DNI mañana, por favor.',
    acc: ['Traiga'],
    err: [['Trae', 'Trae — наказ для tú. Для usted: traiga (від traigo).'], ['Traga', 'Форма для usted будується від traigo: traiga.']],
    closed: true,
  }),
  k.ev(12, 'independent', 'fam.check-home', [PL, PA], {
    instr: 'Замініть la ventana займенником і запишіть наказ одним словом разом із займенником.',
    es: 'Abre la ventana.',
    acc: withPF('Ábrela.'),
    err: [
      ['Abrela.', 'Займенник на місці, але треба знак наголосу: á-bre-la.', { [PL]: 'correct', [PA]: 'incorrect' }],
      ['La abre.', 'La abre — «він її відчиняє». У наказі займенник після дієслова: ábrela.', { [PL]: 'incorrect' }],
      ['Ábrelo.', 'La ventana — жіночого роду, тому la: ábrela.', { [PL]: 'unresolved', [PA]: 'correct' }],
    ],
    ruleKeys: [PL],
    extraHints: [{ kind: 'rule', targets: [PA], blocks: [uk('Якщо після приєднання займенника наголошений склад стає третім від кінця, пишемо знак наголосу: á-bre-la.')] }],
    tr: 'Відчини вікно. → Відчини його.',
  }),

  // ---- reading ----
  k.ch(13, 'independent', 'fam.check-note', RO, {
    instr: 'Прочитайте записку. Що Пабло має зробити другим кроком?',
    es: NOTE,
    opts: [
      ['купити хліб у крамниці на розі', 'c'],
      ['вивести собаку о восьмій', 'x', 'Це перший крок (primero).'],
      ['залишити ключ сусідові', 'x', 'Це останній крок (por último).'],
    ],
    tr: 'sacar al perro — вивести собаку на прогулянку; el vecino del segundo — сусід із другого поверху',
  }),
  k.ch(14, 'independent', 'fam.check-notice', [HR, NP], {
    instr: 'Прочитайте оголошення в басейні. Що з цього правда?',
    es: POOL,
    opts: [
      ['Перед тим як зайти у воду, треба прийняти душ, а їсти в басейні не можна.', 'c'],
      ['Душ приймати не потрібно, а їсти в басейні можна.', { [HR]: 'incorrect', [NP]: 'incorrect' }, 'Hay que ducharse — треба прийняти душ; prohibido comer — їсти заборонено.'],
      ['Треба прийняти душ, і в басейні можна їсти.', { [HR]: 'correct', [NP]: 'incorrect' }, 'Prohibido comer — їсти заборонено.'],
    ],
    ruleKeys: [HR],
    extraHints: [{ kind: 'rule', targets: [NP], blocks: [uk(D[NP].rule)] }],
    tr: 'la piscina municipal — міський басейн; entrar en el agua — заходити у воду; un adulto — дорослий',
  }),

  // ---- messages ----
  k.ch(15, 'independent', 'fam.check-formal', MX, {
    instr: 'Ви пишете в мерію незнайомому працівникові. Яке закінчення листа доречне?',
    opts: [['Atentamente', 'c'], ['Un beso', 'x', 'Un beso — для друзів і родини. В установу: Atentamente або Un saludo.']],
  }),
  k.rb(16, 'independent', 'fam.check-message', WR, {
    instr: 'Напишіть коротке повідомлення сусідці Кармен (на «ти»): завтра вас не буде вдома; попросіть її забрати ваш пакунок (recoger mi paquete) і поясніть чому. 2–4 речення.',
    criteria: [
      'Є дружнє звертання до Кармен.',
      'Є прохання забрати пакунок (¿Puedes recoger…? або наказ recoge…).',
      'Є час (завтра).',
      'Є коротка причина (porque…, es que…).',
      'Є подяка чи прощання.',
    ],
    exemplars: ['Hola, Carmen: ¿Puedes recoger mi paquete mañana? Es que mañana no estoy en casa. ¡Muchas gracias! Un abrazo.'],
    tr: 'recoger un paquete — забрати пакунок (посилку)',
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'optional-check',
  blockId: 'A2-07',
  titleUk: 'Перевірка: прохання, накази й повідомлення (необов’язково)',
  termEs: 'peticiones, instrucciones y mensajes: comprobación',
  summaryUk: 'Необов’язкова змішана перевірка блоку: прохання й відповіді, звертання tú/usted, форми наказу, займенник у наказі, інструкції й оголошення, коротке повідомлення. Без блокувань і загальної оцінки: результат показує, що варто повторити.',
  objectives: ['A2-07-O1', 'A2-07-O2', 'A2-07-O3', 'A2-07-O4', 'A2-07-O5', 'A2-07-O6', 'A2-07-O7', 'A2-07-O8'],
  situations: ['people-family-home', 'food-shopping', 'time-appointments-transport', 'instructions-notices', 'personal-messages'],
  estimatedMinutes: 15,
  introduces: [],
  revisits: [
    'formula.request-puedes', 'formula.request-object', 'formula.request-queria', 'contrast.tu-usted-register',
    'formula.permission-puedo', 'contrast.permission-vs-request', 'formula.response-accept', 'formula.response-refuse-reason',
    'imperative.tu.regular', 'imperative.tu.stem-change', 'imperative.vosotros.regular', 'imperative.addressee',
    'imperative.tu.decir', 'imperative.tu.hacer', 'imperative.tu.poner', 'imperative.tu.salir', 'imperative.tu.tener', 'imperative.tu.venir', 'imperative.tu.ir',
    'imperative.usted.regular', 'imperative.usted.yo-g', 'imperative.usted.stem-change', 'imperative.usted.spelling', 'imperative.usted.ir',
    'imperative.pronoun-placement', 'imperative.pronoun-accent',
    'reading.instructions-order', 'formula.directions', 'obligation.hay-que', 'formula.notice-prohibido', 'formula.notice-infinitive', 'formula.notice-se',
    'listening.requests-responses', 'listening.directions-instructions',
    'prep.para-purpose', 'formula.message-formal-informal', 'writing.practical-message-reason',
  ],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Про перевірку',
      required: false,
      blocks: [uk('Ця перевірка необов’язкова: вона не блокує наступних уроків і не ставить загальної оцінки за тему. Її можна перервати й продовжити пізніше. Підказки доступні, але враховуються як допомога. Помилка лише покаже, яку конкретну форму чи навичку варто повторити.')],
    },
    { id: 's2', kind: 'self-check', titleUk: 'Прохання й відповіді', required: false, taskIds: [1, 2, 3, 4, 5, 6].map(T) },
    { id: 's3', kind: 'self-check', titleUk: 'Форми наказу й займенник', required: false, taskIds: [7, 8, 9, 10, 11, 12].map(T) },
    { id: 's4', kind: 'self-check', titleUk: 'Інструкції, оголошення й повідомлення', required: false, taskIds: [13, 14, 15, 16].map(T) },
    {
      id: 's5',
      kind: 'self-check',
      titleUk: 'Ще завдання з банку повторення',
      required: false,
      blocks: [
        uk('Ще кілька завдань, яких не було в уроках: застосунок добирає їх із відкладеного банку цього блоку, зокрема аудіювання.'),
        link('Змішане повторення: прохання й відповіді', [P, O, Q, R, PM, 'contrast.permission-vs-request/context-choice', 'formula.response-accept/context-choice', REF, 'listening.requests-responses/listening-meaning']),
        link('Змішане повторення: форми наказу', [TR, 'imperative.tu.stem-change/written-form', TV, 'imperative.tu.decir/written-form', 'imperative.tu.hacer/written-form', 'imperative.tu.poner/written-form', SAL, 'imperative.tu.tener/written-form', 'imperative.tu.venir/written-form', 'imperative.tu.ir/written-form', UR, UG, 'imperative.usted.stem-change/written-form', 'imperative.usted.spelling/written-form', 'imperative.usted.ir/written-form', PL, PA]),
        link('Змішане повторення: інструкції й повідомлення', [RO, 'formula.directions/reading-meaning', 'formula.directions/construction-use', 'obligation.hay-que/construction-use', 'obligation.hay-que/context-choice', NP, 'formula.notice-infinitive/reading-meaning', 'formula.notice-se/reading-meaning', 'listening.directions-instructions/listening-meaning', 'prep.para-purpose/construction-use', 'formula.message-formal-informal/construction-use', MX]),
      ],
    },
    {
      id: 's6',
      kind: 'summary',
      titleUk: 'Що повторити',
      required: false,
      blocks: [
        ul([
          'Помилка в одній формі (наприклад, sal чи traiga) — повторіть саме цю форму, а не всю тему наказу.',
          'Прохання й дозвіл: ¿Puedes…? — просимо іншу людину; ¿Puedo…? — питаємо дозволу для себе.',
          'Звертання tú / usted обираємо за ситуацією і за тим, як ви домовилися говорити.',
          'Читаючи інструкцію, шукайте слова порядку й заборони: primero, luego, por último, hay que, prohibido.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

// ---------------- Materials in topic (A2-07) ----------------
const mat = (slug, topicId, titleUk, blocks, linkedTargets) => ({ id: `material.a2-07.${slug}`, topicId, titleUk, blocks, linkedTargets, reviewStatus: 'draft' });

export const materials = [
  mat('requests-permission', 'A2-07-L2', 'Прохання й дозвіл: шпаргалка', [
    uk('Кого ми просимо і хто діятиме — від цього залежить форма.'),
    table(['Що потрібно', 'Конструкція', 'Приклад'], [
      ['попросити когось щось зробити', '¿Puedes / Puede + інфінітив?', '¿Puedes ayudarme?'],
      ['попросити річ', '¿Me das / Me pasas / Me dejas…?', '¿Me pasas el agua?'],
      ['ввічливо замовити чи попросити в установі', 'Quería + іменник / інфінітив', 'Quería un billete para Toledo.'],
      ['запитати дозволу для себе', '¿Puedo + інфінітив?', '¿Puedo abrir la ventana?'],
      ['погодитися', 'Sí, claro. / Claro que sí. / Vale.', '—¿Puedo pasar? —Sí, claro.'],
      ['відмовити з причиною', 'Lo siento, es que… / Lo siento, pero…', 'Lo siento, es que el sábado trabajo.'],
    ], 'uk'),
    link('Потренувати прохання й відповіді', [P, O, Q, PM, REF, R]),
  ], [P, O, Q, PM, REF, R]),
  mat('imperative-tu-vosotros', 'A2-07-L4', 'Наказ для tú і vosotros: таблиця', [
    uk('Tú: форма «він/вона» теперішнього часу (зі зміною голосної, якщо вона є). Vosotros: -r інфінітива → -d. Сім частих дієслів мають коротку форму для tú.'),
    table(['infinitivo', 'tú', 'vosotros'], [
      ['hablar', 'habla', 'hablad'],
      ['comer', 'come', 'comed'],
      ['escribir', 'escribe', 'escribid'],
      ['cerrar', 'cierra', 'cerrad'],
      ['volver', 'vuelve', 'volved'],
      ['pedir', 'pide', 'pedid'],
    ]),
    table(['infinitivo', 'tú (imperativo)'], [['decir', 'di'], ['hacer', 'haz'], ['poner', 'pon'], ['salir', 'sal'], ['tener', 'ten'], ['venir', 'ven'], ['ir', 've']]),
    link('Потренувати накази для tú і vosotros', [TR, 'imperative.tu.stem-change/written-form', TV, 'imperative.tu.decir/written-form', 'imperative.tu.hacer/written-form', 'imperative.tu.poner/written-form', SAL, 'imperative.tu.tener/written-form', 'imperative.tu.venir/written-form', 'imperative.tu.ir/written-form']),
  ], [TR, 'imperative.tu.stem-change/written-form', TV, 'imperative.tu.decir/written-form', 'imperative.tu.hacer/written-form', 'imperative.tu.poner/written-form', SAL, 'imperative.tu.tener/written-form', 'imperative.tu.venir/written-form', 'imperative.tu.ir/written-form']),
  mat('imperative-usted', 'A2-07-L5', 'Наказ для usted і ustedes: таблиця', [
    uk('Usted / ustedes: голосна закінчення «міняється»: -ar → -e / -en, -er та -ir → -a / -an. Основу беремо від форми «я»: digo → diga, vuelvo → vuelva. Написання зберігає звук: busque, llegue, pague, cruce, coja. Ir → vaya.'),
    table(['infinitivo', 'usted', 'ustedes'], [
      ['esperar', 'espere', 'esperen'],
      ['escribir', 'escriba', 'escriban'],
      ['decir (digo)', 'diga', 'digan'],
      ['poner (pongo)', 'ponga', 'pongan'],
      ['cerrar (cierro)', 'cierre', 'cierren'],
      ['seguir (sigo)', 'siga', 'sigan'],
      ['pagar', 'pague', 'paguen'],
      ['ir', 'vaya', 'vayan'],
    ]),
    link('Потренувати накази для usted', [UR, UG, 'imperative.usted.stem-change/written-form', 'imperative.usted.spelling/written-form', 'imperative.usted.ir/written-form']),
  ], [UR, UG, 'imperative.usted.stem-change/written-form', 'imperative.usted.spelling/written-form', 'imperative.usted.ir/written-form']),
  mat('pronoun-attached', 'A2-07-L6', 'Займенник у наказі', [
    uk('У ствердному наказі займенник пишемо після дієслова разом із ним. Наголос не переміщується: якщо він стає третім складом від кінця — ставимо знак наголосу.'),
    ex('Compra el pan. → Cómpralo.', 'Купи хліб. → Купи його.'),
    ex('Llame a la señora García. → Llámela.', 'Зателефонуйте пані Гарсії. → Зателефонуйте їй.'),
    ex('Pon el vaso aquí. → Ponlo aquí.', 'Постав склянку тут. → Постав її тут. (без знака: PON-lo)'),
    link('Потренувати займенник у наказі', [PL, PA]),
  ], [PL, PA]),
  mat('notices-instructions', 'A2-07-L7', 'Інструкції, маршрут і оголошення', [
    table(['Іспанською', 'Що означає'], [
      ['primero, luego, después, a continuación, por último', 'спочатку, потім, далі, наостанок'],
      ['Sigue / Siga todo recto. Gira / Gire a la derecha.', 'Іди(ть) прямо. Поверни(ть) праворуч.'],
      ['Hay que reservar mesa. / No hay que pagar.', 'Треба забронювати столик. / Платити не потрібно.'],
      ['Prohibido fumar. / Prohibido el paso.', 'Палити заборонено. / Прохід заборонено.'],
      ['Empujar. / Tirar. / Pulsar el botón.', 'Від себе. / До себе. / Натисніть кнопку.'],
      ['Se alquila piso. / Se vende bicicleta.', 'Здається квартира. / Продається велосипед.'],
    ], 'uk'),
    link('Потренувати інструкції й оголошення', [RO, 'formula.directions/reading-meaning', 'formula.directions/construction-use', 'obligation.hay-que/construction-use', HR, NP, 'formula.notice-infinitive/reading-meaning', 'formula.notice-se/reading-meaning']),
  ], [RO, 'formula.directions/reading-meaning', 'formula.directions/construction-use', 'obligation.hay-que/construction-use', HR, NP, 'formula.notice-infinitive/reading-meaning', 'formula.notice-se/reading-meaning']),
  mat('practical-message', 'A2-07-L8', 'Практичне повідомлення: структура', [
    uk('Звертання → прохання чи інструкція → деталі (коли, де, що) → причина (porque…, es que…) або мета (para + інфінітив) → подяка чи прощання.'),
    table(['Кому', 'Початок', 'Кінець'], [
      ['другові, родині', 'Hola, Marta:', 'Un abrazo / Un beso'],
      ['в установу', 'Buenos días: / Estimado señor López:', 'Un saludo / Atentamente'],
    ], 'uk'),
    ex('Hola, Luis: El grifo de la cocina no funciona. ¿Puedes ayudarme esta tarde? Es que mañana vienen mis padres. ¡Gracias! Un abrazo.', 'Привіт, Луїсе! Кран на кухні не працює. Можеш допомогти мені сьогодні по обіді? Справа в тому, що завтра приїжджають мої батьки. Дякую! Обіймаю.'),
    link('Потренувати повідомлення', ['prep.para-purpose/construction-use', 'formula.message-formal-informal/construction-use', MX, WR]),
  ], ['prep.para-purpose/construction-use', 'formula.message-formal-informal/construction-use', MX, WR]),
];

export default { lesson, tasks, materials };
