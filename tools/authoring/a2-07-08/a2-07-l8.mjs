// A2-07-L8 — a useful short message with a request/instruction and a reason (O8); para + infinitive
// (CV-03); formal/informal openings and closings; reuse of hay que (CV-05).
import { ex, table, ul, uk } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-07-L8';
const PP = 'prep.para-purpose/construction-use';
const MC = 'formula.message-formal-informal/construction-use';
const MX = 'formula.message-formal-informal/context-choice';
const WR = 'writing.practical-message-reason/construction-use';
const unres = 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.';

const D = {
  [PP]: {
    rule: 'Мету дії називаємо через para + інфінітив («щоб…»): Te llamo para preguntar la hora. Причину («бо…») передає porque + речення: Te llamo porque no entiendo.',
    ok: 'Правильно! Para + інфінітив називає мету.',
    bad: 'Ще ні. Мета: para + інфінітив.',
    unres,
  },
  [MC]: {
    rule: 'Другові: Hola, Marta: … Un abrazo / Un beso. В установу чи незнайомій людині: Buenos días: … або Estimado señor López: / Estimada señora López: … Un saludo / Atentamente. Після звертання в листі ставимо двокрапку.',
    ok: 'Правильно! Формула відповідає адресатові.',
    bad: 'Ще ні. Оберіть формулу за адресатом: дружню чи офіційну.',
    unres,
  },
  [MX]: {
    rule: 'Hola + ім’я, Un abrazo, Un beso — для друзів і родини. Estimado / Estimada + señor / señora + прізвище, Buenos días, Un saludo, Atentamente — для установ і незнайомих людей.',
    ok: 'Так, ця формула доречна для такого адресата.',
    bad: 'Ні. Подумайте, кому ви пишете: другові чи в установу.',
  },
  [WR]: {
    rule: 'Добре практичне повідомлення має звертання, прохання чи інструкцію, потрібні деталі (коли, де, що) і коротку причину (porque…, es que…, para…), а наприкінці — подяку чи прощання.',
    ok: 'Ваша відповідь збігається зі зразком.',
    bad: 'Перевірте повідомлення за критеріями.',
    unres: 'Вільний текст не перевіряється автоматично. Порівняйте своє повідомлення з критеріями і зразком: зразок — лише один із можливих варіантів.',
  },
};
const k = kit(L, D);

const ppErr = (frame, inf) => [
  [frame.replace('___', `por ${inf}`), 'Мету передає para: para + інфінітив.'],
  [frame.replace('___', `porque ${inf}`), 'Porque вимагає речення з дієсловом у формі. Для мети з інфінітивом — para.'],
];
const ppTask = (n, role, fam, frame, inf, tr) =>
  k.ev(n, role, fam, PP, {
    instr: 'Допишіть мету: вставте para + інфінітив у дужках і запишіть усе речення.',
    es: `${frame} (${inf})`,
    acc: [frame.replace('___', `para ${inf}`)],
    err: ppErr(frame, inf),
    tr,
  });
const ppJoin = (n, role, fam, a, b, acc, tr) =>
  k.ev(n, role, fam, PP, {
    instr: 'Об’єднайте два речення в одне: друге речення — це мета (para + інфінітив).',
    es: [a, b],
    acc,
    err: [[acc[0].replace(' para ', ' por '), 'Мету передає para, а не por.']],
    tr,
  });

const tasks = [
  // ---- prep.para-purpose (T01–T10) ----
  k.ch(1, 'supported', 'fam.message', PP, {
    instr: 'Оберіть речення, яке називає мету: «Пишу тобі, щоб перенести зустріч».',
    pre: uk('Нагадування: мета — para + інфінітив; причина — porque + речення.'),
    opts: [
      ['Te escribo para cambiar la cita.', 'c'],
      ['Te escribo por cambiar la cita.', 'x', 'Мету передає para: para cambiar.'],
      ['Te escribo porque cambiar la cita.', 'x', 'Після porque потрібне речення з дієсловом у формі. Для мети — para + інфінітив.'],
    ],
  }),
  k.ev(2, 'supported', 'fam.message', PP, {
    instr: 'За зразком допишіть мету: вставте para + інфінітив і запишіть усе речення.',
    model: ['Te llamo para preguntar la hora.', 'Телефоную тобі, щоб запитати час.'],
    es: 'Te escribo ___ la hora de la clase. (saber)',
    acc: ['Te escribo para saber la hora de la clase.'],
    err: ppErr('Te escribo ___ la hora de la clase.', 'saber'),
    tr: 'Пишу тобі, щоб дізнатися, о котрій заняття.',
  }),
  ppTask(3, 'independent', 'fam.message', 'Te llamo ___ el número de Ana.', 'preguntar', 'Телефоную тобі, щоб запитати номер Ани.'),
  ppJoin(4, 'independent', 'fam.home', 'Necesito el coche.', 'Voy al médico.', ['Necesito el coche para ir al médico.'], 'Мені потрібна машина, щоб поїхати до лікаря.'),
  ppTask(5, 'independent', 'fam.shop', 'Voy al supermercado ___ leche.', 'comprar', 'Я йду в супермаркет, щоб купити молока.'),
  ppJoin(6, 'independent', 'fam.home', 'Estudio español.', 'Quiero vivir en Madrid.', ['Estudio español para vivir en Madrid.'], 'Я вивчаю іспанську, щоб жити в Мадриді.'),
  ppTask(7, 'delayed', 'fam.message', 'Te escribo ___ a cenar el sábado.', 'invitarte', 'Пишу тобі, щоб запросити тебе на вечерю в суботу.'),
  ppJoin(8, 'delayed', 'fam.shop', 'Voy al banco.', 'Saco dinero.', ['Voy al banco para sacar dinero.'], 'Я йду в банк, щоб зняти гроші.'),
  ppTask(9, 'transfer', 'fam.office', 'Llamo a la clínica ___ una cita.', 'pedir', 'Я телефоную в клініку, щоб записатися на прийом.'),
  ppTask(10, 'transfer', 'fam.office', 'Quería hablar con usted ___ el horario.', 'cambiar', 'Я хотів би поговорити з вами, щоб змінити розклад.'),

  // ---- formula.message-formal-informal construction-use (T11–T20) ----
  k.ev(11, 'supported', 'fam.friend-msg', MC, {
    instr: 'За зразком почніть повідомлення подрузі Марті: привітання й ім’я.',
    model: ['Hola, Pablo:', 'Привіт, Пабло! (початок повідомлення)'],
    acc: ['Hola, Marta:', 'Hola, Marta,', '¡Hola, Marta!'],
    err: [['Estimada Marta:', 'Estimada — офіційне звертання. Подрузі: Hola, Marta:'], ['Hola Marta:', 'Після hola перед ім’ям ставимо кому: Hola, Marta:', { [MC]: 'unresolved' }]],
  }),
  k.ch(12, 'supported', 'fam.formal-msg', MC, {
    instr: 'Ви пишете в установу пану Лопесу, якого не знаєте. Оберіть початок листа.',
    pre: uk('Нагадування: офіційно — Estimado señor + прізвище, двокрапка.'),
    opts: [
      ['Estimado señor López:', 'c'],
      ['Hola, López:', 'x', 'Hola + прізвище звучить фамільярно. Незнайомій людині: Estimado señor López:'],
      ['Querido señor López:', 'x', 'Querido — для близьких людей. Офіційно: Estimado señor López:'],
    ],
  }),
  k.ev(13, 'independent', 'fam.friend-msg', MC, {
    instr: 'Закінчіть повідомлення другові дружньою формулою: «Обіймаю».',
    acc: ['Un abrazo', 'Un abrazo.', 'Un abrazo,'],
    err: [['Atentamente', 'Atentamente — офіційна формула. Другові: Un abrazo.']],
  }),
  k.ev(14, 'independent', 'fam.formal-msg', MC, {
    instr: 'Закінчіть лист в установу офіційною формулою: «З повагою».',
    acc: ['Atentamente', 'Atentamente.', 'Atentamente,', 'Un saludo', 'Un saludo.', 'Un saludo,'],
    err: [['Un beso', 'Un beso — для друзів і родини. Офіційно: Atentamente або Un saludo.'], ['Un abrazo', 'Un abrazo — для друзів. Офіційно: Atentamente або Un saludo.']],
  }),
  k.ev(15, 'independent', 'fam.formal-msg', MC, {
    instr: 'Почніть лист незнайомій пані Гарсії з установи: офіційне звертання з прізвищем.',
    acc: ['Estimada señora García:', 'Estimada señora García,'],
    err: [
      ['Estimado señora García:', 'Señora — жіночого роду, тому estimada.'],
      ['Hola, señora García:', 'Hola звучить менш офіційно. Для листа в установу: Estimada señora García:', { [MC]: 'unresolved' }],
    ],
  }),
  k.ev(16, 'independent', 'fam.formal-msg', MC, {
    instr: 'Почніть офіційне повідомлення в поліклініку без імені: «Доброго дня».',
    acc: ['Buenos días:', 'Buenos días,', 'Buenos días.'],
    err: [['Hola:', 'Hola — дружнє привітання. Офіційно: Buenos días:']],
  }),
  k.ev(17, 'delayed', 'fam.friend-msg', MC, {
    instr: 'Почніть повідомлення другові Луїсу.',
    acc: ['Hola, Luis:', 'Hola, Luis,', '¡Hola, Luis!'],
    err: [['Estimado Luis:', 'Estimado — офіційне звертання. Другові: Hola, Luis:']],
  }),
  k.ev(18, 'delayed', 'fam.formal-msg', MC, {
    instr: 'Почніть лист незнайомому пану Ортісу з банку.',
    acc: ['Estimado señor Ortiz:', 'Estimado señor Ortiz,'],
    err: [['Querido señor Ortiz:', 'Querido — для близьких людей. Офіційно: Estimado señor Ortiz:'], ['Estimada señor Ortiz:', 'Señor — чоловічого роду, тому estimado.']],
  }),
  k.ev(19, 'transfer', 'fam.family-msg', MC, {
    instr: 'Закінчіть повідомлення сестрі дружньою формулою: «Цілую».',
    acc: ['Un beso', 'Un beso.', 'Un beso,', 'Besos', 'Besos.', 'Besos,'],
    err: [['Atentamente', 'Atentamente — офіційна формула. Сестрі: Un beso.']],
  }),
  k.ev(20, 'transfer', 'fam.family-msg', MC, {
    instr: 'Почніть повідомлення своєму братові Пабло.',
    acc: ['Hola, Pablo:', 'Hola, Pablo,', '¡Hola, Pablo!'],
    err: [['Estimado Pablo:', 'Estimado — офіційне звертання. Братові: Hola, Pablo:']],
  }),

  // ---- formula.message-formal-informal context-choice (T21–T24) ----
  k.ch(21, 'supported', 'fam.formal-msg', MX, {
    instr: 'Ви пишете в мерію, щоб перенести запис. Який кінець листа доречний?',
    opts: [['Un saludo', 'c'], ['Un beso', 'x', 'Un beso — для друзів і родини.']],
  }),
  k.ch(22, 'independent', 'fam.friend-msg', MX, {
    instr: 'Ви пишете подрузі, щоб запросити її в кіно. Який початок доречний?',
    opts: [['Hola, Ana:', 'c'], ['Estimada señora Ana:', 'x', 'Це офіційне звертання. Подрузі: Hola, Ana:']],
  }),
  k.ch(23, 'delayed', 'fam.formal-msg', MX, {
    instr: 'Ви пишете власникові квартири, якого ще не знаєте, про проблему з опаленням. Який початок доречний?',
    opts: [['Estimado señor Ruiz:', 'c'], ['Hola, guapo:', 'x', 'Це дуже фамільярно. Незнайомій людині: Estimado señor Ruiz:']],
  }),
  k.ch(24, 'transfer', 'fam.family-msg', MX, {
    instr: 'Ви пишете мамі, що прийдете пізно. Який кінець повідомлення доречний?',
    opts: [['Un beso', 'c'], ['Atentamente', 'x', 'Atentamente — для офіційних листів.']],
  }),

  // ---- writing.practical-message-reason (T25–T29) ----
  k.rb(25, 'supported', 'fam.home-problem', WR, {
    instr: 'Напишіть коротке повідомлення сусідові Луїсу (на «ти»): у вас удома не працює кран на кухні (el grifo no funciona); попросіть його допомогти сьогодні ввечері й поясніть чому. 2–4 речення.',
    pre: [uk('Зразок структури: звертання → проблема → прохання → причина → подяка.'), ex('Hola, Ana: La luz de la cocina no funciona. ¿Puedes ayudarme mañana? Es que no veo nada. ¡Gracias!', 'Привіт, Ано! Світло на кухні не працює. Можеш допомогти мені завтра? Справа в тому, що я нічого не бачу. Дякую!')],
    criteria: [
      'Є дружнє звертання до Луїса.',
      'Названо проблему: кран на кухні не працює.',
      'Є прохання допомогти з часом (сьогодні ввечері).',
      'Є коротка причина або мета (porque…, es que…, para…).',
      'Є подяка чи прощання.',
    ],
    exemplars: ['Hola, Luis: El grifo de la cocina no funciona. ¿Puedes ayudarme esta noche? Es que mañana vienen mis padres. ¡Muchas gracias! Un abrazo.'],
  }),
  k.rb(26, 'independent', 'fam.home-problem', WR, {
    instr: 'Напишіть коротке повідомлення власниці квартири, пані Мартін (на usted): не працює опалення (la calefacción no funciona). Попросіть прислати когось завтра вранці й поясніть чому. 2–4 речення.',
    criteria: [
      'Є офіційне звертання (Estimada señora Martín: / Buenos días:).',
      'Названо проблему: не працює опалення.',
      'Є ввічливе прохання на usted з часом (завтра вранці).',
      'Є причина (porque…, es que…).',
      'Є офіційне прощання (Un saludo / Atentamente).',
    ],
    exemplars: ['Estimada señora Martín: La calefacción del piso no funciona. ¿Puede enviar a alguien mañana por la mañana? Es que hace mucho frío. Un saludo.'],
  }),
  k.rb(27, 'independent', 'fam.appointment', WR, {
    instr: 'Напишіть другові Пабло, що не зможете прийти в суботу о шостій, і запропонуйте неділю. Поясніть причину. 2–4 речення.',
    criteria: [
      'Є дружнє звертання.',
      'Ясно сказано, що в суботу ви не можете.',
      'Є причина (porque…, es que…).',
      'Є пропозиція іншого дня (неділя) — прохання чи питання.',
      'Є прощання.',
    ],
    exemplars: ['Hola, Pablo: Lo siento, el sábado a las seis no puedo porque tengo que trabajar. ¿Puedes venir el domingo? Un abrazo.'],
  }),
  k.rb(28, 'delayed', 'fam.shop', WR, {
    instr: 'Напишіть повідомлення сестрі: попросіть її купити хліб і молоко після роботи, бо ви сьогодні працюєте до дев’ятої. 2–3 речення, накази або прохання.',
    criteria: [
      'Є звертання до сестри.',
      'Є прохання чи наказ для tú: купити хліб і молоко.',
      'Є час (після роботи).',
      'Є причина (porque… / es que…).',
    ],
    exemplars: ['Hola, Ana: Compra pan y leche después del trabajo, por favor. Es que hoy trabajo hasta las nueve. Un beso.'],
  }),
  k.rb(29, 'transfer', 'fam.clinic-msg', WR, {
    instr: 'Напишіть коротке повідомлення в поліклініку (на usted): ви хочете перенести запис із вівторка на четвер, бо у вівторок працюєте. 2–4 речення.',
    criteria: [
      'Є офіційне звертання (Buenos días: / Estimados señores:).',
      'Ясно, що ви хочете перенести запис (Quería cambiar la cita…).',
      'Названо дні: з вівторка на четвер.',
      'Є причина (porque… / es que…).',
      'Є офіційне прощання.',
    ],
    exemplars: ['Buenos días: Quería cambiar mi cita del martes al jueves porque el martes trabajo. Un saludo.'],
  }),
];


const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-07',
  titleUk: 'Коротке практичне повідомлення з причиною',
  termEs: 'un mensaje práctico con un motivo',
  summaryUk: 'Пишемо коротке повідомлення з проханням чи інструкцією, деталями й причиною: para + інфінітив, porque, es que; доречний початок і кінець для друга чи установи.',
  objectives: ['A2-07-O8'],
  cv: ['CV-01', 'CV-03', 'CV-05', 'CV-06'],
  situations: ['personal-messages', 'people-family-home', 'conditions-weather-problems', 'time-appointments-transport', 'food-shopping', 'greetings-introductions'],
  estimatedMinutes: 18,
  introduces: ['prep.para-purpose', 'formula.message-formal-informal', 'writing.practical-message-reason'],
  revisits: ['formula.request-puedes', 'formula.request-queria', 'formula.response-refuse-reason', 'imperative.tu.regular', 'contrast.tu-usted-register', 'formula.message-opening-closing', 'link.porque', 'obligation.hay-que'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Мета: para + інфінітив',
      required: true,
      blocks: [
        uk('Мету дії називаємо через para + інфінітив — як українське «щоб…», коли дію виконує та сама особа. Причину («бо…») передає porque або es que + речення.'),
        ex('Te escribo para cambiar la cita.', 'Пишу тобі, щоб перенести зустріч.'),
        ex('Necesito el coche para ir al médico.', 'Мені потрібна машина, щоб поїхати до лікаря.'),
        ex('Te llamo porque no entiendo el mensaje.', 'Телефоную, бо не розумію повідомлення.'),
      ],
    },
    {
      id: 's2',
      kind: 'explanation',
      titleUk: 'Початок і кінець: другові чи в установу',
      required: true,
      blocks: [
        uk('Початок і кінець повідомлення обираємо за адресатом. Після звертання в листі іспанською зазвичай ставлять двокрапку.'),
        table(
          ['Кому', 'Початок', 'Кінець'],
          [
            ['другові, родині', 'Hola, Marta:', 'Un abrazo / Un beso'],
            ['в установу, незнайомій людині', 'Buenos días: / Estimado señor López: / Estimada señora García:', 'Un saludo / Atentamente'],
          ],
          'uk',
        ),
      ],
    },
    {
      id: 's3',
      kind: 'examples',
      titleUk: 'Зразки повідомлень',
      required: true,
      blocks: [
        uk('Добре практичне повідомлення: звертання → прохання чи інструкція → деталі (коли, де, що) → причина → подяка чи прощання. Нові слова: el grifo — кран, funcionar — працювати (про пристрій), la calefacción — опалення.'),
        ex('Hola, Luis: El grifo de la cocina no funciona. ¿Puedes ayudarme esta tarde? Es que mañana vienen mis padres. ¡Gracias! Un abrazo.', 'Привіт, Луїсе! Кран на кухні не працює. Можеш допомогти мені сьогодні по обіді? Справа в тому, що завтра приїжджають мої батьки. Дякую! Обіймаю.'),
        ex('Estimada señora Martín: La calefacción no funciona. ¿Puede enviar a alguien mañana? Es que hace mucho frío. Un saludo.', 'Шановна пані Мартін! Опалення не працює. Чи можете Ви прислати когось завтра? Справа в тому, що дуже холодно. З повагою.'),
      ],
    },
    { id: 's4', kind: 'supported-practice', titleUk: 'Практика зі зразком', required: true, taskIds: [1, 2, 11, 12, 21].map(T) },
    { id: 's5', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: [3, 4, 13, 14, 22].map(T) },
    { id: 's6', kind: 'writing', titleUk: 'Пишемо повідомлення', required: true, taskIds: [25, 26].map(T) },
    { id: 's7', kind: 'independent-practice', titleUk: 'Додаткова практика (за бажанням)', required: false, taskIds: [5, 6, 15, 16, 27].map(T) },
    {
      id: 's8',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Мета: para + інфінітив; причина: porque / es que + речення.',
          'Другові: Hola, Marta: … Un abrazo / Un beso.',
          'Офіційно: Buenos días: / Estimado(a)… … Un saludo / Atentamente.',
          'Повідомлення: звертання, прохання, деталі, причина, прощання.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
