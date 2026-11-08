// A2-08-L2 — read a message and respond (O2/O6): who writes to whom, why, what is asked and what
// is missing; then a short written reply suited to the recipient and purpose. Reading meaning and
// writing are separate targets; writing is rubric-reviewed (no single key).
import { ex, table, ul, uk } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-08-L2';
const RM = 'reading.message-purpose/reading-meaning';
const WM = 'writing.message-recipient-purpose/construction-use';

const D = {
  [RM]: {
    rule: 'Визначте автора й адресата (звертання і підпис), мету повідомлення (запрошує, просить, повідомляє про зміну, відповідає) і яку інформацію ще треба уточнити.',
    ok: 'Правильно! Ви зрозуміли повідомлення.',
    bad: 'Ні. Перечитайте звертання, підпис і питання в повідомленні.',
  },
  [WM]: {
    rule: 'Відповідаючи, відповідайте на кожне питання адресата, додайте потрібні деталі (коли, де, що), доречне звертання і прощання. Зв’язки: y, pero, porque, primero, después.',
    ok: 'Ваша відповідь збігається зі зразком.',
    bad: 'Перевірте відповідь за критеріями.',
    unres: 'Вільний текст не перевіряється автоматично. Порівняйте відповідь із критеріями і зразком: зразок — лише один із можливих варіантів.',
  },
};
const k = kit(L, D);

// ---- messages ----
const BIRTHDAY = 'Hola, Irene: El sábado es mi cumpleaños y hago una cena en casa con unos amigos. ¿Quieres venir? ¿Puedes traer una botella de agua? Confírmame antes del jueves, por favor. Un beso, Lucía';
const CHANGE = 'Hola, Marcos: Lo siento, mañana no puedo quedar a las seis porque tengo que trabajar hasta las siete. ¿Quedamos a las ocho en el mismo bar? Un abrazo, Dani';
const ACADEMY = 'Estimada señora Ruiz: Le escribo de la academia de idiomas Sol. Su clase de español empieza el lunes, 3 de octubre, a las 18:00, en el aula 4. ¿Puede confirmar su matrícula antes del viernes? Un saludo, Pedro Gómez';
const CAT = 'Hola, Jorge: Soy Ana, la vecina del tercero. Este fin de semana estoy fuera. ¿Puedes dar de comer a mi gato el sábado y el domingo? Te dejo la llave el viernes por la noche. ¡Muchas gracias!';
const BIKE = 'Hola, Sergio: ¿Me dejas tu bicicleta el domingo? Quiero ir al parque con mi hermano. Te la devuelvo el lunes por la mañana. Un abrazo, Raúl';

const G = {
  academy: 'la academia de idiomas — мовна школа; el aula — аудиторія; la matrícula — запис на курс',
  cat: 'estar fuera — бути не вдома, у від’їзді; dar de comer — годувати',
  bike: 'devolver — повертати: te la devuelvo — я тобі його поверну',
};

const tasks = [
  // ---- reading.message-purpose ----
  k.ch(1, 'supported', 'fam.msg-invitation', RM, {
    instr: 'Прочитайте повідомлення. Хто пише, кому і навіщо?',
    pre: uk('Підказка: автора видно з підпису в кінці, адресата — зі звертання на початку.'),
    es: BIRTHDAY,
    opts: [
      ['Лусія пише Ірені: запрошує її на вечерю на день народження.', 'c'],
      ['Ірена пише Лусії: запрошує її на день народження.', 'x', 'Hola, Irene — звертання до Ірени; підпис — Lucía. Пише Лусія.'],
      ['Лусія пише Ірені: просить купити подарунок.', 'x', 'Лусія запрошує (¿Quieres venir?) і просить принести пляшку води, а не подарунок.'],
    ],
  }),
  k.ch(2, 'independent', 'fam.msg-invitation', RM, {
    instr: 'Прочитайте повідомлення Лусії ще раз. Якої інформації бракує, щоб прийти на вечерю?',
    es: BIRTHDAY,
    opts: [
      ['О котрій починається вечеря.', 'c'],
      ['Який день.', 'x', 'День є: el sábado — у суботу.'],
      ['Що принести.', 'x', 'Це сказано: una botella de agua.'],
    ],
  }),
  k.ch(3, 'independent', 'fam.msg-change', RM, {
    instr: 'Прочитайте повідомлення. Що Дані пропонує Маркосу?',
    es: CHANGE,
    opts: [
      ['Зустрітися завтра о восьмій у тому самому барі.', 'c'],
      ['Зустрітися завтра о шостій у барі.', 'x', 'О шостій Дані не може: він працює до сьомої. Він пропонує a las ocho.'],
      ['Скасувати зустріч і не бачитися.', 'x', 'Дані не скасовує зустріч, а переносить її: ¿Quedamos a las ocho…?'],
    ],
  }),
  k.ch(4, 'independent', 'fam.msg-formal', RM, {
    instr: 'Прочитайте лист. Що пан Гомес просить зробити пані Руїс?',
    es: ACADEMY,
    tr: G.academy,
    opts: [
      ['Підтвердити запис на курс до п’ятниці.', 'c'],
      ['Прийти в аудиторію 4 у п’ятницю.', 'x', 'Заняття — у понеділок; до п’ятниці треба лише підтвердити запис.'],
      ['Заплатити за курс у понеділок.', 'x', 'Про оплату в листі нічого не сказано. ¿Puede confirmar su matrícula…? — підтвердити запис.'],
    ],
  }),
  k.ch(5, 'independent', 'fam.msg-formal', RM, {
    instr: 'Прочитайте лист ще раз. Який це лист і як це видно?',
    es: ACADEMY,
    tr: G.academy,
    opts: [
      ['Офіційний: Estimada señora…, звертання на usted, Un saludo.', 'c'],
      ['Дружній: автор і адресатка — друзі.', 'x', 'Estimada señora Ruiz, ¿Puede…?, Un saludo — ознаки офіційного листа.'],
      ['Реклама мовної школи для всіх.', 'x', 'Лист адресований конкретній людині: Estimada señora Ruiz.'],
    ],
  }),
  k.ch(6, 'delayed', 'fam.msg-neighbour', RM, {
    instr: 'Прочитайте записку. Що Ана просить Хорхе зробити і коли?',
    es: CAT,
    tr: G.cat,
    opts: [
      ['Погодувати її кота в суботу й неділю.', 'c'],
      ['Забрати її ключ у п’ятницю ввечері.', 'x', 'Ключ Ана сама залишить у п’ятницю. Просить вона погодувати кота.'],
      ['Поїхати разом із нею на вихідні.', 'x', 'Estoy fuera — Ана їде; вона просить погодувати кота.'],
    ],
  }),
  k.ch(7, 'delayed', 'fam.msg-change', RM, {
    instr: 'Прочитайте повідомлення Дані. Чому він не може о шостій?',
    es: CHANGE,
    opts: [
      ['Він працює до сьомої.', 'c'],
      ['Він хоче піти в інший бар.', 'x', 'En el mismo bar — у тому самому барі.'],
      ['У нього заняття о шостій.', 'x', 'Porque tengo que trabajar hasta las siete — він працює до сьомої.'],
    ],
  }),
  k.ch(8, 'transfer', 'fam.msg-borrow', RM, {
    instr: 'Прочитайте повідомлення. Що просить Рауль і коли він поверне річ?',
    es: BIKE,
    tr: G.bike,
    opts: [
      ['Позичити велосипед на неділю; поверне в понеділок уранці.', 'c'],
      ['Піти разом у парк у неділю.', 'x', 'У парк Рауль іде з братом; у Серхіо він просить велосипед.'],
      ['Позичити велосипед на понеділок; поверне в неділю.', 'x', 'El domingo — коли потрібен; el lunes por la mañana — коли поверне.'],
    ],
  }),

  // ---- writing.message-recipient-purpose ----
  k.rb(9, 'supported', 'fam.msg-invitation', WM, {
    instr: 'Ви — Ірена. Дайте відповідь Лусії: погодьтеся прийти, підтвердьте, що принесете воду, і запитайте, о котрій вечеря. 2–4 речення.',
    pre: [
      uk('Зразок структури: звертання → відповідь на кожне питання → ваше питання про те, чого бракує → прощання.'),
      ex('Hola, Pablo: ¡Claro que voy! Llevo el pan. ¿A qué hora es la comida? Un abrazo.', 'Привіт, Пабло! Звісно, прийду! Я принесу хліб. О котрій обід? Обіймаю.'),
    ],
    es: BIRTHDAY,
    criteria: [
      'Є дружнє звертання до Лусії.',
      'Ясно, що ви приходите (Sí, voy / Claro que voy…).',
      'Є відповідь про воду (Llevo / Traigo el agua…).',
      'Є питання про час (¿A qué hora…?).',
      'Є прощання.',
    ],
    tr: 'llevar — приносити з собою',
    exemplars: ['Hola, Lucía: ¡Muchas gracias! Sí, voy a tu cena. Llevo una botella de agua. ¿A qué hora es la cena? Un beso, Irene'],
  }),
  k.rb(10, 'independent', 'fam.msg-change', WM, {
    instr: 'Ви — Маркос. Дайте відповідь Дані: о восьмій вам підходить, але попросіть зустрітися не в барі, а перед кінотеатром, і поясніть чому (після бару ви йдете в кіно). 2–4 речення.',
    es: CHANGE,
    criteria: [
      'Є дружнє звертання до Дані.',
      'Ясно, що о восьмій вам підходить.',
      'Є пропозиція іншого місця (delante del cine…).',
      'Є коротка причина (porque…, es que…).',
      'Є прощання.',
    ],
    exemplars: ['Hola, Dani: Vale, a las ocho está bien. ¿Quedamos delante del cine? Es que después vamos a ver una película. Un abrazo, Marcos'],
  }),
  k.rb(11, 'independent', 'fam.msg-formal', WM, {
    instr: 'Ви — пані Руїс. Дайте відповідь панові Гомесу (офіційно, на usted): підтвердьте запис і запитайте, чи потрібна книжка для заняття. 2–4 речення.',
    es: ACADEMY,
    tr: G.academy,
    criteria: [
      'Є офіційне звертання (Estimado señor Gómez: / Buenos días:).',
      'Ясно, що ви підтверджуєте запис (Confirmo mi matrícula…).',
      'Є питання про книжку (¿Necesito un libro…?).',
      'Є офіційне прощання (Un saludo / Atentamente).',
    ],
    exemplars: ['Estimado señor Gómez: Confirmo mi matrícula para la clase de español del lunes. ¿Necesito un libro para la clase? Un saludo, Carmen Ruiz'],
  }),
  k.rb(12, 'delayed', 'fam.msg-neighbour', WM, {
    instr: 'Ви — Хорхе. Дайте відповідь сусідці Ані (на «ти»): ви погодуєте кота в суботу, але в неділю не можете, і поясніть чому. 2–4 речення.',
    es: CAT,
    tr: G.cat,
    criteria: [
      'Є звертання до Ани.',
      'Ясно, що в суботу ви погодуєте кота.',
      'Ясно, що в неділю не можете, і є причина (porque…, es que…).',
      'Є прощання чи побажання.',
    ],
    exemplars: ['Hola, Ana: El sábado sí, puedo dar de comer a tu gato. Pero el domingo no puedo, es que voy a casa de mis padres. Lo siento. Un saludo, Jorge'],
  }),
  k.rb(13, 'transfer', 'fam.msg-borrow', WM, {
    instr: 'Ви — Серхіо. Дайте відповідь Раулю: погодьтеся позичити велосипед і скажіть, де і коли його забрати (у суботу ввечері, у вас удома). 2–4 речення.',
    es: BIKE,
    tr: G.bike,
    criteria: [
      'Є дружнє звертання до Рауля.',
      'Ясно, що ви погоджуєтеся (Sí, claro…).',
      'Є деталі: коли і де забрати велосипед.',
      'Є прощання.',
    ],
    exemplars: ['Hola, Raúl: Sí, claro, te dejo la bicicleta. Puedes venir a mi casa el sábado por la noche. Un abrazo, Sergio'],
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-08',
  titleUk: 'Читаємо повідомлення і відповідаємо',
  termEs: 'leer un mensaje y responder',
  summaryUk: 'Читаємо коротке повідомлення: хто пише, кому, навіщо, що просить і чого бракує. Потім пишемо відповідь, доречну для адресата: відповідаємо на кожне питання й уточнюємо те, чого бракує.',
  objectives: ['A2-08-O2', 'A2-08-O6'],
  cv: ['CV-06'],
  situations: ['personal-messages', 'time-appointments-transport', 'people-family-home'],
  estimatedMinutes: 18,
  introduces: ['reading.message-purpose', 'writing.message-recipient-purpose'],
  revisits: ['formula.message-formal-informal', 'formula.message-opening-closing', 'formula.invitation', 'contrast.permission-vs-request', 'formula.request-puedes', 'formula.response-accept', 'formula.response-refuse-reason', 'writing.practical-message-reason', 'link.porque', 'link.pero'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Чотири питання до повідомлення',
      required: true,
      blocks: [
        uk('Перш ніж відповідати, з’ясуйте чотири речі.'),
        ul([
          'Хто пише і кому? Підпис у кінці, звертання на початку.',
          'Навіщо? Запрошує (¿Quieres venir?), просить (¿Puedes…?), переносить зустріч (no puedo… ¿Quedamos…?), повідомляє.',
          'Що треба відповісти? Кожне питання адресата.',
          'Чого бракує? Дня, години, місця — про це можна запитати у відповіді.',
        ]),
        table(['Іспанською', 'Українською'], [
          ['quedar', 'домовлятися про зустріч, зустрічатися'],
          ['¿Quedamos a las ocho?', 'Зустрінемося о восьмій?'],
          ['confirmar', 'підтверджувати'],
          ['Confírmame antes del jueves.', 'Підтверди мені до четверга.'],
          ['llevar', 'нести, приносити (з собою): Llevo el pan. — Я принесу хліб.'],
        ], 'uk'),
      ],
    },
    {
      id: 's2',
      kind: 'examples',
      titleUk: 'Повідомлення і відповідь',
      required: true,
      blocks: [
        ex(CHANGE, 'Привіт, Маркосе! Вибач, завтра я не можу зустрітися о шостій, бо маю працювати до сьомої. Зустрінемося о восьмій у тому самому барі? Обіймаю, Дані.'),
        ex('Hola, Dani: Vale, a las ocho en el bar. ¡Hasta mañana! Marcos', 'Привіт, Дані! Гаразд, о восьмій у барі. До завтра! Маркос.'),
        uk('Відповідь коротка, але відповідає на питання (a las ocho — так) і має звертання та прощання.'),
      ],
    },
    { id: 's3', kind: 'supported-practice', titleUk: 'Читаємо з підказкою', required: true, taskIds: [1].map(T) },
    { id: 's4', kind: 'reading', titleUk: 'Хто, кому, навіщо', required: true, blocks: [uk('Кожне завдання має своє повідомлення. Шукайте звертання, підпис і питання.')], taskIds: [2, 3, 4, 5].map(T) },
    { id: 's5', kind: 'writing', titleUk: 'Пишемо відповідь', required: true, blocks: [uk('Спершу відповідь із підказкою, потім — самостійно.')], taskIds: [9, 10].map(T) },
    { id: 's6', kind: 'writing', titleUk: 'Офіційна відповідь (за бажанням)', required: false, blocks: [uk('Відповідь у мовну школу: офіційне звертання й прощання.')], taskIds: [11].map(T) },
    {
      id: 's7',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Хто пише, кому, навіщо і чого бракує — чотири питання до повідомлення.',
          'У відповіді: звертання → відповідь на кожне питання → ваше питання чи деталі → прощання.',
          'Quedar — домовитися про зустріч; confirmar — підтвердити.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
