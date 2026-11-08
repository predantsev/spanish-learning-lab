// A2-08-C1 — optional cumulative check in short resumable parts (reading, listening, writing) with
// a delayed return through practice-links to the held-out banks; no new teaching, no locks.
// Also the block's "Materials in topic".
import { ex, link, table, ul, uk } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-08-C1';
const PI = 'reading.practical-information/reading-meaning';
const RA = 'reading.required-actions/reading-meaning';
const RM = 'reading.message-purpose/reading-meaning';
const WM = 'writing.message-recipient-purpose/construction-use';
const RP = 'reading.past-account/reading-meaning';
const WP = 'writing.past-account-reply/construction-use';
const OC = 'formula.opinion-choice/construction-use';
const WC = 'writing.compare-choose-reason/construction-use';
const LV = 'listening.voice-message/listening-meaning';
const DV = 'listening.voice-message/dictation';
const LP = 'listening.public-announcement/listening-meaning';
const DP = 'listening.public-announcement/dictation';
const PX = 'writing.phrase-reuse-exact/phrase-recall';
const PV = 'writing.phrase-reuse-variation/construction-use';
const RD = 'writing.revise-draft/construction-use';

const unres = 'Вільний текст не перевіряється автоматично. Порівняйте відповідь із критеріями і зразком: зразок — лише один із можливих варіантів.';
const read = { ok: 'Правильно! Ви зрозуміли текст.', bad: 'Ні. Перечитайте текст і знайдіть потрібне місце.' };
const listen = { ok: 'Правильно! Ви зрозуміли запис.', bad: 'Ні. Прослухайте ще раз; за потреби відкрийте текст запису (це врахується як допомога).' };
const write = (rule) => ({ rule, ok: 'Ваша відповідь збігається зі зразком.', bad: 'Перевірте відповідь за критеріями.', unres });
const dict = { rule: 'Запишіть речення так, як чуєте: зі знаками наголосу.', ok: 'Правильно записано!', bad: 'Є помилка в написанні. Порівняйте із записом.' };

const D = {
  [PI]: { rule: 'Спершу питання, потім пошук потрібної деталі: дня, години, ціни, місця.', ...read },
  [RA]: { rule: 'Шукайте hay que, prohibido, накази й слова порядку.', ...read },
  [RM]: { rule: 'Хто пише, кому, навіщо і чого бракує?', ...read },
  [RP]: { rule: 'Подія — індефінідо, тло і звичка — імперфект; стежте за словами порядку.', ...read },
  [LV]: { rule: 'Спершу хто телефонує і навіщо, потім деталі.', ...listen },
  [LP]: { rule: 'Куди, о котрій, яка колія чи платформа, що зробити.', ...listen },
  [DV]: dict,
  [DP]: dict,
  [WM]: write('Звертання, відповідь на кожне питання, потрібні деталі, прощання.'),
  [WP]: write('Коментар, питання або свій схожий досвід у формах минулого.'),
  [WC]: write('Порівняння за однією-двома ознаками, ваш вибір і причина з porque.'),
  [OC]: {
    rule: 'Creo que + речення або Para mí, + речення.',
    ok: 'Правильно! Думку висловлено природно.',
    bad: 'Ще ні. Схема: Creo que + речення або Para mí, + речення.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.',
  },
  [PX]: { rule: 'Пригадайте готову фразу з добірки і запишіть її повністю.', ok: 'Правильно! Фразу відтворено точно.', bad: 'Ще ні. Пригадайте готову фразу.', unres: 'Ваша відповідь відрізняється від фрази з добірки. Порівняйте зі зразком.' },
  [PV]: { rule: 'Змініть лише одну частину знайомої фрази.', ok: 'Правильно!', bad: 'Ще ні. Змініть лише одну частину фрази.', unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.' },
  [RD]: { rule: 'Виправте лише позначене місце.', ok: 'Правильно! Позначене місце виправлено.', bad: 'Ще ні. Перечитайте відгук до позначеного місця.', unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.' },
};
const k = kit(L, D);

export const clips = [
  {
    id: 'clip.a2-08.cambio-plan-nuria',
    lessonId: L,
    kind: 'text',
    transcript: 'Hola, Pablo, soy Nuria. Mira, el domingo no puedo ir a la playa porque tengo que trabajar. ¿Vamos el sábado? Podemos coger el tren de las diez. Llámame esta tarde, por favor. ¡Hasta luego!',
    translationUk: 'Привіт, Пабло, це Нурія. Слухай, у неділю я не можу поїхати на пляж, бо маю працювати. Поїдемо в суботу? Можемо сісти на потяг о десятій. Подзвони мені сьогодні після обіду, будь ласка. До зустрічі!',
    targets: [
      { skillId: 'listening.voice-message', modality: 'listening-meaning' },
      { skillId: 'listening.voice-message', modality: 'dictation' },
    ],
    family: 'fam.clip-cambio-plan',
    reviewStatus: 'draft',
  },
  {
    id: 'clip.a2-08.autobus-sevilla',
    lessonId: L,
    kind: 'text',
    transcript: 'Atención, por favor. El autobús con destino a Sevilla de las cuatro y media sale del andén número siete. Hay que tener el billete en la mano. Gracias.',
    translationUk: 'Увага, будь ласка. Автобус до Севільї о пів на п’яту відправляється з платформи номер сім. Треба тримати квиток у руці. Дякуємо.',
    targets: [
      { skillId: 'listening.public-announcement', modality: 'listening-meaning' },
      { skillId: 'listening.public-announcement', modality: 'dictation' },
    ],
    family: 'fam.clip-autobus-sevilla',
    reviewStatus: 'draft',
  },
];
const [cN, cB] = clips;

const GYM = 'Gimnasio Activo. Horario: de lunes a viernes, de 7:00 a 22:00; sábados, de 9:00 a 14:00. Precio: 35 euros al mes. Clases de yoga: martes y jueves, a las 19:00. Hay que traer una toalla. Prohibido entrar con comida.';
const INVITE = 'Hola, Teresa: El viernes es la fiesta de despedida de Juan en el bar La Plaza. ¿Vienes? Es una sorpresa: Juan no sabe nada. Confírmame mañana. Un abrazo, Clara';
const ACCOUNT = 'El año pasado estuve una semana en Granada. El primer día llovía y hacía frío, así que vi muchos museos. Después hizo sol y subí a la Alhambra. ¡Fue increíble!';

const tasks = [
  // ---- part 1: reading ----
  k.ch(1, 'independent', 'fam.check-gym', PI, {
    instr: 'Прочитайте оголошення спортзалу. О котрій у суботу зачиняється спортзал?',
    es: GYM,
    tr: 'el gimnasio — спортзал; la toalla — рушник',
    opts: [
      ['о 14:00', 'c'],
      ['о 22:00', 'x', 'О 22:00 — з понеділка по п’ятницю. Sábados, de 9:00 a 14:00.'],
      ['о 19:00', 'x', 'О 19:00 — заняття йогою у вівторок і четвер.'],
    ],
  }),
  k.ch(2, 'independent', 'fam.check-gym', RA, {
    instr: 'Прочитайте оголошення ще раз. Що з цього правда?',
    es: GYM,
    tr: 'el gimnasio — спортзал; la toalla — рушник',
    opts: [
      ['Треба мати з собою рушник, а заходити з їжею не можна.', 'c'],
      ['Рушник не потрібен, а їжу можна приносити.', 'x', 'Hay que traer una toalla — треба принести рушник; prohibido entrar con comida — з їжею заходити заборонено.'],
      ['Треба приносити їжу на заняття йогою.', 'x', 'Prohibido entrar con comida — з їжею заходити заборонено.'],
    ],
  }),
  k.ch(3, 'independent', 'fam.check-invite', RM, {
    instr: 'Прочитайте повідомлення. Хто пише, кому і навіщо?',
    es: INVITE,
    tr: 'la fiesta de despedida — прощальна вечірка; la sorpresa — сюрприз',
    opts: [
      ['Клара пише Терезі: запрошує на прощальну вечірку Хуана.', 'c'],
      ['Тереза пише Кларі: запрошує на свою вечірку.', 'x', 'Hola, Teresa — звертання до Терези; підпис — Clara.'],
      ['Хуан пише Терезі: розповідає про свою вечірку.', 'x', 'Пише Клара (підпис), а для Хуана вечірка — сюрприз.'],
    ],
  }),
  k.ch(4, 'independent', 'fam.check-account', RP, {
    instr: 'Прочитайте розповідь. Чому першого дня автор ходив по музеях?',
    es: ACCOUNT,
    tr: 'así que — тож; subir a la Alhambra — піднятися до Альгамбри (палац у Гранаді); increíble — неймовірний',
    opts: [
      ['Бо йшов дощ і було холодно.', 'c'],
      ['Бо Альгамбру того дня зачинили.', 'x', 'Про це в тексті нічого немає. Llovía y hacía frío, así que vi muchos museos.'],
      ['Бо було дуже сонячно.', 'x', 'Сонце було пізніше: después hizo sol.'],
    ],
  }),

  // ---- part 2: listening ----
  k.lm(5, 'independent', cN, LV, {
    instr: 'Прослухайте голосове повідомлення. Навіщо телефонує Нурія?',
    opts: [
      ['Запропонувати поїхати на пляж у суботу замість неділі.', 'c'],
      ['Скасувати поїздку на пляж зовсім.', 'x', 'Нурія не скасовує поїздку, а пропонує інший день: ¿Vamos el sábado?'],
      ['Попросити Пабло купити квитки на потяг.', 'x', 'Нурія лише каже, що можна сісти на потяг о десятій, і просить подзвонити їй.'],
    ],
  }),
  k.lm(6, 'independent', cB, LP, {
    instr: 'Прослухайте оголошення на автовокзалі. З якої платформи відправляється автобус до Севільї і що треба мати в руці?',
    opts: [
      ['З сьомої платформи; квиток у руці.', 'c'],
      ['З четвертої платформи; квиток у руці.', 'x', 'Las cuatro y media — це час. Платформа — el andén número siete.'],
      ['З сьомої платформи; паспорт.', 'x', 'Con el billete en la mano — з квитком у руці.'],
    ],
  }),
  k.dict(7, 'independent', cN, DV, {
    instr: 'Прослухайте повідомлення Нурії і запишіть її питання до Пабло.',
    acc: ['¿Vamos el sábado?'],
    err: [['¿Vamos el sabado?', 'Sábado пишеться зі знаком наголосу: SÁ-ba-do.']],
  }),
  k.dict(8, 'independent', cB, DP, {
    instr: 'Прослухайте оголошення і запишіть речення про квиток.',
    acc: ['Hay que tener el billete en la mano.'],
    err: [['Ay que tener el billete en la mano.', 'Hay пишеться з h.']],
  }),

  // ---- part 3: writing ----
  k.ev(9, 'independent', 'fam.check-opinion', OC, {
    instr: 'Висловіть думку: спортзал дорогий (el gimnasio, caro). Почніть із Creo que… або Para mí, …',
    acc: ['Creo que el gimnasio es caro.', 'Yo creo que el gimnasio es caro.', 'Para mí, el gimnasio es caro.', 'Para mí el gimnasio es caro.'],
    err: [['Creo el gimnasio es caro.', 'Після creo потрібне que.']],
  }),
  k.ev(10, 'independent', 'fam.check-phrase', PX, {
    instr: 'Друг просить вас прийти просто зараз, але ви не можете. Запишіть готову фразу з добірки: «Вибач, але зараз я не можу».',
    acc: ['Lo siento, pero ahora no puedo.'],
  }),
  k.ev(11, 'independent', 'fam.check-vary', PV, {
    instr: 'Змініть одну частину знайомої фрази: ви хочете квиток не до Толедо, а до Севільї.',
    es: 'Quería un billete para Toledo.',
    acc: ['Quería un billete para Sevilla.', 'Quería un billete para Sevilla, por favor.'],
    err: [['Queria un billete para Sevilla.', 'Quería пишеться зі знаком наголосу на í.', { [PV]: 'unresolved' }]],
  }),
  k.ev(12, 'independent', 'fam.check-draft', RD, {
    instr: 'У чернетці позначено помилку. Перепишіть речення правильно.',
    pre: uk('Відгук: [час дієслова] ідеться про завершену подію вчора.'),
    es: ['Ayer [como] en casa de mis padres.'],
    acc: ['Ayer comí en casa de mis padres.'],
    err: [['Ayer como en casa de mis padres.', 'Позначене місце не виправлено: вчора, одна подія — comí.']],
  }),
  k.rb(13, 'independent', 'fam.check-invite', WM, {
    instr: 'Ви — Тереза. Дайте відповідь Кларі: ви прийдете, але трохи пізніше (о десятій), бо до дев’ятої працюєте. Запитайте, чи купувати подарунок (un regalo). 2–4 речення.',
    es: INVITE,
    tr: 'un regalo — подарунок',
    criteria: [
      'Є звертання до Клари і прощання.',
      'Ясно, що ви прийдете о десятій, і є причина.',
      'Є питання про подарунок (¿Compro un regalo?).',
    ],
    exemplars: ['Hola, Clara: Sí, voy a la fiesta, pero llego a las diez porque trabajo hasta las nueve. ¿Compro un regalo para Juan? Un abrazo, Teresa'],
  }),
  k.rb(14, 'independent', 'fam.check-account', WP, {
    instr: 'Дайте відповідь на розповідь про Гранаду: прокоментуйте її і коротко розкажіть, де ви були минулого року (1–2 події). 2–4 речення.',
    es: ACCOUNT,
    criteria: [
      'Є коментар до розповіді.',
      'Є 1–2 ваші події минулого року у формах індефінідо (estuve, fui, vi…).',
      'Відповідь пов’язана з розповіддю.',
    ],
    exemplars: ['¡Qué bien! Yo el año pasado fui a Valencia con mi familia. Comimos en la playa y vimos el centro.'],
  }),
  k.rb(15, 'independent', 'fam.check-compare', WC, {
    instr: 'Порівняйте два спортзали і поясніть свій вибір: «Activo» (35 євро на місяць, біля вашої роботи) чи «Forma» (25 євро на місяць, далеко від дому). 2–3 речення.',
    criteria: ['Є порівняння (más barato, más cerca…).', 'Ясно названо ваш вибір.', 'Є причина (porque…).'],
    exemplars: ['El gimnasio Forma es más barato, pero el gimnasio Activo está más cerca de mi trabajo. Prefiero el gimnasio Activo porque no tengo coche.'],
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'optional-check',
  blockId: 'A2-08',
  titleUk: 'Перевірка: читання, аудіювання, письмо (необов’язково)',
  termEs: 'lectura, audición y escritura: comprobación',
  summaryUk: 'Необов’язкова підсумкова перевірка короткими частинами: читання практичних текстів, повідомлень і розповіді, аудіювання, коротке письмо. Частини можна проходити окремо, з перервами. Без блокувань і загальної оцінки: результат показує, що варто повторити.',
  objectives: ['A2-08-O1', 'A2-08-O2', 'A2-08-O3', 'A2-08-O4', 'A2-08-O5', 'A2-08-O6', 'A2-08-O7', 'A2-08-O8'],
  situations: ['time-appointments-transport', 'personal-messages', 'routine-study-leisure', 'places-accommodation'],
  estimatedMinutes: 20,
  introduces: [],
  revisits: [
    'reading.practical-information', 'reading.required-actions', 'reading.message-purpose', 'writing.message-recipient-purpose',
    'reading.past-account', 'writing.past-account-reply', 'formula.opinion-choice', 'writing.compare-choose-reason',
    'listening.voice-message', 'listening.public-announcement', 'writing.phrase-reuse-exact', 'writing.phrase-reuse-variation', 'writing.revise-draft',
  ],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Про перевірку',
      required: false,
      blocks: [uk('Перевірка необов’язкова і складається з трьох коротких частин: читання, аудіювання, письмо. Кожну частину можна пройти окремо, перервати й продовжити пізніше. Підказки доступні, але враховуються як допомога. Ідеального результату не потрібно: помилка лише покаже, що варто повторити.')],
    },
    { id: 's2', kind: 'reading', titleUk: 'Частина 1: читання', required: false, blocks: [uk('Оголошення, повідомлення і коротка розповідь.')], taskIds: [1, 2, 3, 4].map(T) },
    { id: 's3', kind: 'listening', titleUk: 'Частина 2: аудіювання', required: false, blocks: [uk('Спершу відповідайте без тексту; диктант — окреме завдання.')], clipIds: [cN.id, cB.id], taskIds: [5, 6, 7, 8].map(T) },
    { id: 's4', kind: 'writing', titleUk: 'Частина 3: письмо', required: false, blocks: [uk('Короткі речення і три невеликі тексти.')], taskIds: [9, 10, 11, 12, 13, 14, 15].map(T) },
    {
      id: 's5',
      kind: 'self-check',
      titleUk: 'Повернення пізніше: завдання з банку',
      required: false,
      blocks: [
        uk('Через кілька днів поверніться до завдань, яких не було в уроках: застосунок добирає їх із відкладеного банку цього блоку.'),
        link('Повторення: читання й аудіювання', [PI, RA, RM, RP, LV, LP]),
        link('Повторення: письмо', [WM, WP, OC, WC, PX, PV, RD]),
      ],
    },
    {
      id: 's6',
      kind: 'summary',
      titleUk: 'Що повторити',
      required: false,
      blocks: [
        ul([
          'Помилка в читанні чи аудіюванні — повторіть стратегію: спершу питання, потім потрібна деталь.',
          'Помилка в конкретній формі (наприклад, comí чи quería) — повторіть саме цю форму в її темі.',
          'Вільні тексти перевіряються за критеріями; відповідь, що відрізняється від зразка, не є помилкою.',
          'Одна перевірка не доводить, що все вивчено назавжди: повертайтеся до повторення.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

// ---------------- Materials in topic (A2-08) ----------------
const mat = (slug, topicId, titleUk, blocks, linkedTargets) => ({ id: `material.a2-08.${slug}`, topicId, titleUk, blocks, linkedTargets, reviewStatus: 'draft' });

export const materials = [
  mat('reading-strategy', 'A2-08-L3', 'Як читати практичний текст, повідомлення і розповідь', [
    table(['Текст', 'Що шукаємо'], [
      ['оголошення, графік, меню', 'день, годину, ціну, місце; hay que, prohibido'],
      ['інструкція', 'дії та слова порядку: primero, luego, por último'],
      ['повідомлення', 'хто пише, кому, навіщо, чого бракує'],
      ['розповідь про минуле', 'події (індефінідо), тло і звички (імперфект), порядок'],
    ], 'uk'),
    link('Потренувати читання', [PI, RA, RM, RP]),
  ], [PI, RA, RM, RP]),
  mat('opinion-choice', 'A2-08-L4', 'Думка і вибір: Creo que… / Para mí, …', [
    ex('Creo que el tren es más cómodo.', 'Думаю, що потяг зручніший.'),
    ex('Para mí, el piso A es mejor porque está cerca del trabajo.', 'Як на мене, квартира A краща, бо вона близько до роботи.'),
    uk('Порівняння → вибір → причина. Будь-який обґрунтований вибір правильний.'),
    link('Потренувати думку і вибір', [OC, WC]),
  ], [OC, WC]),
  mat('listening-recordings', 'A2-08-L5', 'Голосові повідомлення й оголошення', [
    ul([
      'Повідомлення: хто телефонує → навіщо → коли, де → що зробити.',
      'Оголошення: con destino a… — куди; la vía / el andén — колія / платформа; retraso — запізнення.',
      'Повтор і текст запису — на прохання; вони враховуються як допомога.',
    ]),
    link('Потренувати аудіювання', [LV, LP, DV, DP]),
  ], [LV, LP, DV, DP]),
  mat('message-checklist', 'A2-08-L6', 'Повідомлення: структура і список перевірки', [
    uk('Звертання → відповідь на кожне питання або ваше прохання → деталі (коли, де, що) → причина → прощання.'),
    ul(['Чи є звертання і прощання, доречні для адресата?', 'Чи відповідь на кожне питання?', 'Чи правильні форми дієслів і узгодження?', 'Чи на місці знаки наголосу та ¿? ¡!?']),
    link('Потренувати повідомлення й фрази', [WM, PX, PV, RD]),
  ], [WM, PX, PV, RD]),
];

export default { lesson, tasks, clips, materials };
