// A2-08-L6 — a useful text with personal constructions (O6/O7/O8): exact recall of a reviewed
// course phrase, variation of one familiar part, revision of a marked draft, and a short message.
// Answer models are reviewed course phrases only (prepared alternative to private learner phrases,
// which stay private drafts until reviewed). Exact recall, variation and revision are separate targets.
import { ex, table, ul, uk } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-08-L6';
const PX = 'writing.phrase-reuse-exact/phrase-recall';
const PV = 'writing.phrase-reuse-variation/construction-use';
const RD = 'writing.revise-draft/construction-use';
const WM = 'writing.message-recipient-purpose/construction-use';
const unres = 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.';

const D = {
  [PX]: {
    rule: 'Деякі фрази зручно відтворювати точно, як готовий блок. Пригадайте фразу з добірки, яка підходить до ситуації, і запишіть її повністю.',
    ok: 'Правильно! Фразу відтворено точно.',
    bad: 'Ще ні. Пригадайте готову фразу з добірки.',
    unres: 'Ваша відповідь відрізняється від фрази з добірки. Можливо, вона теж доречна, але тут тренуємо точне відтворення. Порівняйте зі зразком.',
  },
  [PV]: {
    rule: 'Візьміть знайому фразу і замініть лише одну частину відповідно до нової ситуації: ¿Me dejas tu boli? → ¿Me dejas tu cargador? Решта фрази не змінюється.',
    ok: 'Правильно! Ви змінили потрібну частину, решта фрази на місці.',
    bad: 'Ще ні. Змініть лише одну частину фрази, решту залиште.',
    unres,
  },
  [RD]: {
    rule: 'Перечитайте позначене місце і виправте лише його: форму дієслова, порядок слів, знак наголосу чи узгодження. Решту речення залиште.',
    ok: 'Правильно! Позначене місце виправлено.',
    bad: 'Ще ні. Перечитайте позначене місце і відгук до нього.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Перевірте, чи виправлено позначене місце, і порівняйте зі зразком.',
  },
  [WM]: {
    rule: 'Коротке повідомлення: звертання, мета (прохання, відповідь, зміна плану), потрібні деталі, прощання. Готові фрази з добірки допомагають.',
    ok: 'Ваша відповідь збігається зі зразком.',
    bad: 'Перевірте повідомлення за критеріями.',
    unres: 'Вільний текст не перевіряється автоматично. Перечитайте його за списком перевірки і порівняйте зі зразком: зразок — лише один із можливих варіантів.',
  },
};
const k = kit(L, D);

/** Exact recall of one course phrase: accepted = its recall variants; other answers stay open. */
const recall = (n, role, fam, instr, accepted, o = {}) => k.ev(n, role, fam, PX, { instr, acc: accepted, ...o });

const tasks = [
  // ---- writing.phrase-reuse-exact (phrase recall) ----
  recall(1, 'supported', 'fam.phrase-office', 'Ви в установі й не розчули, що сказала працівниця. Запишіть готову фразу з добірки: ввічливо (usted) попросіть повторити.', ['¿Puede repetir, por favor?', 'Por favor, ¿puede repetir?'], {
    pre: uk('Нагадування: у добірці є фраза «Можете повторити, будь ласка?» (до usted).'),
    err: [['¿Puedes repetir, por favor?', 'До працівниці установи в цій фразі — usted: ¿Puede repetir…?']],
  }),
  recall(2, 'independent', 'fam.phrase-home', 'Ви не можете самі пересунути шафу. Запишіть готову фразу з добірки: попросіть сусіда (на «ти») допомогти вам.', ['¿Puedes ayudarme?', '¿Me puedes ayudar?'], {
    err: [['¿Puedes me ayudar?', 'Me стоїть або перед poder (¿Me puedes ayudar?), або в кінці інфінітива (¿Puedes ayudarme?).']],
  }),
  recall(3, 'independent', 'fam.phrase-friend', 'Друг просить вас прийти просто зараз, але ви не можете. Запишіть готову фразу з добірки: «Вибач, але зараз я не можу».', ['Lo siento, pero ahora no puedo.']),
  recall(4, 'independent', 'fam.phrase-home', 'У гостях дуже душно. Запишіть готову фразу з добірки: запитайте дозволу відчинити вікно.', ['¿Puedo abrir la ventana?'], {
    err: [['¿Puedes abrir la ventana?', '¿Puedes…? — ви просите господаря. Дозвіл для себе: ¿Puedo abrir la ventana?']],
  }),
  recall(5, 'delayed', 'fam.phrase-office', 'Ви телефонуєте в поліклініку. Запишіть готову фразу з добірки: ввічливо скажіть, що хотіли б перенести запис.', ['Quería cambiar la cita.'], {
    err: [['Queria cambiar la cita.', 'Quería пишеться зі знаком наголосу на í.', { [PX]: 'incorrect' }]],
  }),
  recall(6, 'transfer', 'fam.phrase-street', 'Ви на вулиці з другом, і вам треба на хвилинку зайти в аптеку. Запишіть готову фразу з добірки: попросіть друга зачекати.', ['Espera un momento, por favor.', 'Espera un momento.'], {
    err: [['Espere un momento, por favor.', 'Espere — для usted. Другові: Espera un momento, por favor.']],
  }),

  // ---- writing.phrase-reuse-variation ----
  k.ev(7, 'supported', 'fam.vary-borrow', PV, {
    instr: 'Змініть одну частину знайомої фрази: попросіть у колеги не ручку, а зарядку (el cargador).',
    model: ['¿Me dejas tu boli? → ¿Me dejas tu móvil?', 'Позичиш свою ручку? → Позичиш свій телефон?'],
    es: '¿Me dejas tu boli?',
    acc: ['¿Me dejas tu cargador?', '¿Me dejas tu cargador, por favor?'],
    err: [['¿Me dejas tú cargador?', 'Tu («твій») пишеться без знака наголосу.']],
  }),
  k.ev(8, 'independent', 'fam.vary-station', PV, {
    instr: 'Змініть одну частину знайомої фрази: ви їдете не до Толедо, а до Гранади (Granada).',
    es: 'Quería un billete para Toledo.',
    acc: ['Quería un billete para Granada.', 'Quería un billete para Granada, por favor.'],
    err: [['Queria un billete para Granada.', 'Quería пишеться зі знаком наголосу на í.', { [PV]: 'unresolved' }]],
  }),
  k.ev(9, 'independent', 'fam.vary-refuse', PV, {
    instr: 'Змініть причину у знайомій фразі: у вас немає часу (no tengo tiempo).',
    es: 'Lo siento, es que no tengo coche.',
    acc: ['Lo siento, es que no tengo tiempo.'],
    err: [['Lo siento, es que no tiempo.', 'Потрібне дієслово: no tengo tiempo.']],
  }),
  k.ev(10, 'independent', 'fam.vary-permission', PV, {
    instr: 'Змініть дію у знайомій фразі: запитайте дозволу увімкнути світло (encender la luz).',
    es: '¿Puedo abrir la ventana?',
    acc: ['¿Puedo encender la luz?', '¿Puedo encender la luz, por favor?'],
    err: [['¿Puedo enciendo la luz?', 'Після puedo — інфінітив: encender.']],
  }),
  k.ev(11, 'delayed', 'fam.vary-office', PV, {
    instr: 'Доповніть знайому фразу: попросіть повторити не все, а номер (el número).',
    es: '¿Puede repetir, por favor?',
    acc: ['¿Puede repetir el número, por favor?', 'Por favor, ¿puede repetir el número?', '¿Puede repetir el número?'],
    err: [['¿Puede repetir la número, por favor?', 'Número — чоловічого роду: el número.']],
  }),
  k.ev(12, 'transfer', 'fam.vary-group', PV, {
    instr: 'Змініть адресата у знайомій фразі: ви просите зачекати не одного друга, а кількох друзів (vosotros).',
    es: 'Espera un momento, por favor.',
    acc: ['Esperad un momento, por favor.', 'Esperad un momento.'],
    err: [['Esperen un momento, por favor.', 'Esperen — для ustedes. Друзям в Іспанії — vosotros: esperad.']],
  }),

  // ---- writing.revise-draft ----
  k.ev(13, 'supported', 'fam.draft-friend', RD, {
    instr: 'У чернетці позначено помилку. Перепишіть позначене речення правильно (решту не змінюйте).',
    pre: uk('Відгук: [порядок слів] займенник me стоїть або перед poder, або в кінці інфінітива.'),
    es: ['Hola, Ana: ¿Puedes [me ayudar] mañana? Un beso.'],
    acc: ['¿Puedes ayudarme mañana?', '¿Me puedes ayudar mañana?'],
    err: [['¿Puedes me ayudar mañana?', 'Позначене місце не виправлено: me — перед poder або в кінці інфінітива.']],
    ref: '¿Puedes ayudarme mañana?',
  }),
  k.ev(14, 'independent', 'fam.draft-account', RD, {
    instr: 'У чернетці позначено помилку. Перепишіть речення правильно.',
    pre: uk('Відгук: [знак наголосу] у слові despues.'),
    es: ['Ayer fui al cine y [despues] cené con Pablo.'],
    acc: ['Ayer fui al cine y después cené con Pablo.'],
    err: [['Ayer fui al cine y despues cené con Pablo.', 'Позначене місце не виправлено: después пишеться зі знаком наголосу на e.']],
  }),
  k.ev(15, 'independent', 'fam.draft-opinion', RD, {
    instr: 'У чернетці позначено помилку. Перепишіть речення правильно.',
    pre: uk('Відгук: [бракує слова] після creo.'),
    es: ['[Creo el tren] es más rápido.'],
    acc: ['Creo que el tren es más rápido.'],
    err: [['Creo el tren es más rápido.', 'Позначене місце не виправлено: після creo потрібне que.']],
  }),
  k.ev(16, 'delayed', 'fam.draft-formal', RD, {
    instr: 'У чернетці офіційного листа позначено помилку. Перепишіть звертання правильно.',
    pre: uk('Відгук: [узгодження] señora — жіночого роду.'),
    es: ['[Estimado] señora García:'],
    acc: ['Estimada señora García:', 'Estimada señora García,'],
    err: [['Estimado señora García:', 'Позначене місце не виправлено: señora — жіночого роду, тому estimada.']],
  }),
  k.ev(17, 'transfer', 'fam.draft-weekend', RD, {
    instr: 'У чернетці позначено помилку. Перепишіть речення правильно.',
    pre: uk('Відгук: [час дієслова] ідеться про завершену подію минулої суботи.'),
    es: ['El sábado pasado [vamos] a la playa.'],
    acc: ['El sábado pasado fuimos a la playa.'],
    err: [
      ['El sábado pasado vamos a la playa.', 'Позначене місце не виправлено: минула завершена подія — fuimos.'],
      ['El sábado pasado íbamos a la playa.', 'Íbamos — звичка або тло. Тут одна завершена подія: fuimos.'],
    ],
  }),

  // ---- writing.message-recipient-purpose (final message, with self-revision) ----
  k.rb(18, 'independent', 'fam.final-message', WM, {
    instr: 'Напишіть сусідові Луїсу (на «ти») коротке повідомлення: ви не вдома до восьмої; попросіть його забрати ваш пакунок (recoger mi paquete). Використайте хоча б одну готову фразу з добірки. Потім перечитайте текст за списком перевірки і виправте, якщо треба. 2–4 речення.',
    pre: ul(['Чи є звертання і прощання?', 'Чи ясно, що ви просите і коли?', 'Чи правильні форми дієслів?', 'Чи на місці знаки наголосу та ¿?']),
    criteria: [
      'Є звертання до Луїса і прощання.',
      'Є прохання забрати пакунок (¿Puedes recoger…?).',
      'Є деталь часу і причина (no estoy en casa hasta las ocho…).',
      'Використано хоча б одну готову фразу з добірки (наприклад, ¿Puedes ayudarme?, Muchas gracias).',
    ],
    exemplars: ['Hola, Luis: ¿Puedes ayudarme? Hoy no estoy en casa hasta las ocho. ¿Puedes recoger mi paquete? ¡Muchas gracias! Un abrazo.'],
    tr: 'recoger un paquete — забрати пакунок',
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-08',
  titleUk: 'Корисний текст із готовими фразами',
  termEs: 'un texto útil con frases aprendidas',
  summaryUk: 'Пригадуємо готові фрази з добірок точно, змінюємо в них одну частину для нової ситуації, виправляємо позначені помилки в чернетці і пишемо коротке повідомлення, перечитавши його за списком перевірки.',
  objectives: ['A2-08-O6', 'A2-08-O7', 'A2-08-O8'],
  cv: ['CV-06'],
  situations: ['personal-messages', 'food-shopping', 'people-family-home', 'time-appointments-transport'],
  estimatedMinutes: 18,
  introduces: ['writing.phrase-reuse-exact', 'writing.phrase-reuse-variation', 'writing.revise-draft'],
  revisits: ['formula.request-puedes', 'formula.request-queria', 'formula.permission-puedo', 'formula.response-refuse-reason', 'imperative.vosotros.regular', 'formula.message-formal-informal', 'formula.opinion-choice', 'writing.message-recipient-purpose'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Точно, з варіацією, з виправленням',
      required: true,
      blocks: [
        uk('Готову фразу можна використати по-різному. Це різні навички, і застосунок рахує їх окремо.'),
        table(['Що робимо', 'Приклад'], [
          ['пригадуємо точно', '¿Puede repetir, por favor?'],
          ['змінюємо одну частину', '¿Me dejas tu boli? → ¿Me dejas tu cargador?'],
          ['виправляємо позначене місце', '¿Puedes [me ayudar]? → ¿Puedes ayudarme?'],
        ], 'uk'),
        uk('Зразками відповідей бувають лише перевірені фрази курсу. Ваші власні фрази залишаються приватними чернетками, доки їх не перевірено; якщо власних фраз ще немає, беремо підготовлені фрази курсу.'),
      ],
    },
    {
      id: 's2',
      kind: 'examples',
      titleUk: 'Фраза і її варіації',
      required: true,
      blocks: [
        ex('¿Puedes ayudarme?', 'Можеш мені допомогти?'),
        ex('¿Puedes ayudarme mañana?', 'Можеш мені допомогти завтра? (додали час)'),
        ex('Quería un billete para Toledo. → Quería un billete para Granada.', 'Я хотів би квиток до Толедо. → …до Гранади. (змінили місто)'),
      ],
    },
    { id: 's3', kind: 'supported-practice', titleUk: 'Пригадуємо і змінюємо', required: true, taskIds: [1, 7, 13].map(T) },
    { id: 's4', kind: 'independent-practice', titleUk: 'Самостійно', required: true, taskIds: [2, 3, 8, 9, 14, 15].map(T) },
    { id: 's5', kind: 'writing', titleUk: 'Повідомлення з перевіркою', required: true, blocks: [uk('Напишіть повідомлення, потім перечитайте його за списком перевірки і виправте.')], taskIds: [18].map(T) },
    { id: 's6', kind: 'independent-practice', titleUk: 'Ще практика (за бажанням)', required: false, taskIds: [4, 10].map(T) },
    {
      id: 's7',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Точне відтворення і варіація — різні навички.',
          'Варіація: змінюємо одну частину (річ, місто, адресата), решта фрази та сама.',
          'Виправляємо по одному пункту: форма, порядок слів, знак наголосу, узгодження.',
          'Виправлена чернетка — це допомога, а не доказ, що ви вже пам’ятаєте форму без підказки.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
