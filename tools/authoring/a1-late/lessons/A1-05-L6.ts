// A1-05-L6 — ask for the missing information: cuál / cuáles, qué vs cuál before es / son,
// choosing the question for missing information, practical notices and short written answers (O6/O7, CV-06).
import { Kit, S, es, ex, plink, ul, uk } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-05-L6', RULES);

const CW = 'question.word.cual/written-form';
const CC = 'question.word.cual/context-choice';
const CR = 'question.word.cual/reading-meaning';
const QC = 'contrast.que-cual/context-choice';
const MC = 'question.choice-missing-info/context-choice';
const MU = 'question.choice-missing-info/construction-use';
const RN = 'reading.practical-notice/reading-meaning';
const WA = 'writing.info-answer/construction-use';

const cualAcc = (wrongText: string, right: string): [string, string] => [wrongText, `У питанні ${right.toLowerCase()} пишеться зі знаком наголосу.`];
const queForCual: [string, string] = ['Qué', 'Перед es, коли потрібна конкретна інформація (номер, адреса, розклад), в Іспанії питаємо cuál: ¿Cuál es…?'];

// ======================= cuál / cuáles
k.exact({
  n: 1,
  role: 'supported',
  fam: 'a105.contact',
  t: [CW],
  ins: 'Впиши питальне слово, щоб дізнатися номер телефону. Зразок: ¿Cuál es tu dirección?',
  p: ['¿___ es tu número de teléfono?'],
  acc: ['Cuál'],
  err: [cualAcc('Cual', 'Cuál'), queForCual],
  tr: 'Який твій номер телефону?',
});
k.slots({
  n: 2,
  role: 'supported',
  fam: 'a105.school-things',
  t: [CW],
  ins: 'Перепиши питання повністю, вставивши питальне слово: «Які (з цих) книжки — твої?» Зразок: ¿Cuáles son tus coches?',
  p: ['¿___ son tus libros?'],
  tpl: ['¿', S('s1'), ' son tus libros?'],
  slots: [{ id: 's1', t: CW, acc: ['Cuáles'], err: [cualAcc('Cuales', 'Cuáles'), ['Cuál', 'Libros — множина, тож cuáles: ¿Cuáles son…?']] }],
});
k.exact({
  n: 3,
  role: 'independent',
  fam: 'a105.contact',
  t: [CW],
  ins: 'Запитай іспанською: «Яка твоя адреса?»',
  acc: ['¿Cuál es tu dirección?'],
  err: [cualAcc('¿Cual es tu dirección?', 'Cuál'), ['¿Qué es tu dirección?', queForCual[1]]],
});
k.exact({
  n: 4,
  role: 'independent',
  fam: 'a105.form',
  t: [CW],
  ins: 'Ти заповнюєш анкету разом з другом. Запитай іспанською: «Яке твоє прізвище?»',
  acc: ['¿Cuál es tu apellido?'],
  err: [cualAcc('¿Cual es tu apellido?', 'Cuál'), ['¿Qué es tu apellido?', queForCual[1]]],
});
k.exact({
  n: 5,
  role: 'independent',
  fam: 'a105.opening-hours',
  t: [CW],
  ins: 'Впиши питальне слово, щоб дізнатися розклад аптеки.',
  p: ['¿___ es el horario de la farmacia?'],
  acc: ['Cuál'],
  err: [cualAcc('Cual', 'Cuál'), queForCual],
  tr: 'Який розклад аптеки?',
});
k.exact({
  n: 6,
  role: 'independent',
  fam: 'a105.school-things',
  t: [CW],
  ins: 'На столі кілька зв’язок ключів. Запитай іспанською: «Які ключі — твої?»',
  acc: ['¿Cuáles son tus llaves?'],
  err: [['¿Cuál son tus llaves?', 'Llaves — множина: ¿Cuáles son…?'], cualAcc('¿Cuales son tus llaves?', 'Cuáles')],
});
k.exact({
  n: 7,
  role: 'delayed',
  fam: 'a105.shop-price',
  t: [CW],
  ins: 'Запитай іспанською: «Яка ціна?»',
  acc: ['¿Cuál es el precio?'],
  err: [cualAcc('¿Cual es el precio?', 'Cuál'), ['¿Qué es el precio?', queForCual[1]]],
});
k.slots({
  n: 8,
  role: 'delayed',
  fam: 'a105.hotel-info',
  t: [CW],
  ins: 'Перепиши питання повністю, вставивши питальне слово: «Яка адреса готелю?»',
  p: ['¿___ es la dirección del hotel?'],
  tpl: ['¿', S('s1'), ' es la dirección del hotel?'],
  slots: [{ id: 's1', t: CW, acc: ['Cuál'], err: [cualAcc('Cual', 'Cuál'), queForCual] }],
});
k.exact({
  n: 9,
  role: 'transfer',
  fam: 'a105.reception',
  t: [CW],
  ins: 'На рецепції готелю запитай іспанською: «Який номер кімнати?»',
  acc: ['¿Cuál es el número de la habitación?', '¿Cuál es el número de habitación?', '¿Cuál es el número de mi habitación?'],
  err: [cualAcc('¿Cual es el número de la habitación?', 'Cuál'), ['¿Qué es el número de la habitación?', queForCual[1]]],
});
k.exact({
  n: 10,
  role: 'transfer',
  fam: 'a105.lost-bags',
  t: [CW],
  ins: 'Біля дверей стоять кілька рюкзаків. Запитай друзів (vosotros) іспанською: «Які рюкзаки — ваші?»',
  acc: ['¿Cuáles son vuestras mochilas?'],
  err: [['¿Cuál son vuestras mochilas?', 'Mochilas — множина: ¿Cuáles son…?'], cualAcc('¿Cuales son vuestras mochilas?', 'Cuáles')],
});
k.choice({
  n: 11,
  role: 'independent',
  fam: 'a105.contact',
  t: [CR],
  ins: 'Прочитай питання. Що хоче дізнатися людина?',
  p: ['¿Cuál es tu número de teléfono?'],
  o: [
    ['Твій номер телефону.', true],
    ['Скільки в тебе телефонів.', false],
    ['Що таке телефон.', false],
  ],
});
k.choice({
  n: 12,
  role: 'delayed',
  fam: 'a105.school-things',
  t: [CC],
  ins: 'Обери питальне слово.',
  p: ['¿___ son tus llaves?'],
  o: [
    ['Cuál', CC, 'Llaves — множина: cuáles.'],
    ['Cuáles', true],
  ],
  tr: 'Які ключі — твої?',
});

// ======================= qué vs cuál before es / son
k.choice({
  n: 13,
  role: 'supported',
  fam: 'a105.contact',
  t: [QC],
  ins: 'Ти хочеш дізнатися конкретний номер. Обери питальне слово. Зразок: ¿Cuál es tu dirección?',
  p: ['¿___ es tu número de teléfono?'],
  o: [
    ['Qué', QC, 'Qué es…? питає, що це таке взагалі. Конкретний номер — ¿Cuál es…?'],
    ['Cuál', true],
  ],
});
k.choice({
  n: 14,
  role: 'independent',
  fam: 'a105.word-meaning',
  t: [QC],
  ins: 'Ти не знаєш слова aviso і хочеш дізнатися, що воно означає. Обери питальне слово.',
  p: ['¿___ es un aviso?'],
  o: [
    ['Qué', true],
    ['Cuál', QC, 'Cuál питає про конкретну інформацію. Що це таке — ¿Qué es…?'],
  ],
});
k.choice({
  n: 15,
  role: 'independent',
  fam: 'a105.car',
  t: [QC],
  ins: 'Обери питальне слово (перед іменником).',
  p: ['¿___ coche es de Ana?'],
  o: [
    ['Qué', true],
    ['Cuál', QC, 'Перед іменником в Іспанії вживають qué: ¿Qué coche…?'],
  ],
  tr: 'Яка машина — Анина?',
});
k.choice({
  n: 16,
  role: 'delayed',
  fam: 'a105.opening-hours',
  t: [QC],
  ins: 'Ти хочеш дізнатися, коли працює музей. Обери питальне слово.',
  p: ['¿___ es el horario del museo?'],
  o: [
    ['Qué', QC, 'Тобі потрібні конкретні години, а не визначення слова horario: ¿Cuál es…?'],
    ['Cuál', true],
  ],
});
k.choice({
  n: 17,
  role: 'transfer',
  fam: 'a105.street-sign',
  t: [QC],
  ins: 'Ти бачиш на вулиці табличку «farmacia de guardia» і не знаєш, що це. Обери питання.',
  o: [
    ['¿Qué es una farmacia de guardia?', true],
    ['¿Cuál es una farmacia de guardia?', QC, 'Що це таке — ¿Qué es…?'],
  ],
});

// ======================= which question for the missing information
k.choice({
  n: 21,
  role: 'supported',
  fam: 'a105.class-notice',
  t: [MC],
  ins: 'В оголошенні написано: «Clase de español: sala 3». Ти не знаєш, о котрій заняття. Обери питання.',
  o: [
    ['¿A qué hora es la clase?', true],
    ['¿Dónde es la clase?', MC, 'Де — уже відомо: sala 3. Бракує години.'],
    ['¿Cuánto cuesta la clase?', MC, 'Ти хочеш дізнатися годину, а не ціну.'],
  ],
});
k.exact({
  n: 22,
  role: 'supported',
  fam: 'a105.pharmacy',
  t: [MU],
  ins: 'Ти знаєш, що аптека відчиняється о дев’ятій, але не знаєш, де вона. Запитай іспанською. Зразок: ¿Dónde está el banco?',
  acc: ['¿Dónde está la farmacia?'],
  err: [['¿Donde está la farmacia?', 'У питанні dónde пишеться зі знаком наголосу.'], ['¿A qué hora abre la farmacia?', 'Годину ти вже знаєш. Бракує місця: ¿Dónde…?', { [MU]: 'incorrect' }]],
});
k.choice({
  n: 23,
  role: 'independent',
  fam: 'a105.market',
  t: [MC],
  ins: 'На ринку ти бачиш гарні помідори, але ціни немає. Обери питання.',
  o: [
    ['¿Dónde están los tomates?', MC, 'Помідори ти бачиш. Бракує ціни.'],
    ['¿Cuánto cuestan los tomates?', true],
    ['¿Cuándo son los tomates?', MC, 'Ти хочеш дізнатися ціну: ¿Cuánto cuestan…?'],
  ],
});
k.exact({
  n: 24,
  role: 'independent',
  fam: 'a105.meeting-info',
  t: [MU],
  ins: 'У записці: «Reunión: sala 2, a las diez». Дня немає. Запитай іспанською, коли нарада.',
  acc: ['¿Cuándo es la reunión?', '¿Qué día es la reunión?'],
  err: [['¿A qué hora es la reunión?', 'Годину ти вже знаєш. Бракує дня: ¿Cuándo…? або ¿Qué día…?']],
});
k.exact({
  n: 25,
  role: 'independent',
  fam: 'a105.new-class',
  t: [MU],
  ins: 'На першому занятті ти бачиш жінку біля дошки й не знаєш, хто вона. Запитай одногрупника іспанською: «Хто викладачка?»',
  acc: ['¿Quién es la profesora?'],
  err: [['¿Quien es la profesora?', 'У питанні quién пишеться зі знаком наголосу.']],
});
k.choice({
  n: 26,
  role: 'independent',
  fam: 'a105.pharmacy',
  t: [MC],
  ins: 'Ти в новому районі й не знаєш, чи є тут аптека. Обери питання.',
  o: [
    ['¿Hay una farmacia cerca de aquí?', true],
    ['¿Cuándo abre la farmacia?', MC, 'Ти ще не знаєш, чи є аптека. Спершу — ¿Hay…?'],
    ['¿Cuánto cuesta la farmacia?', MC, 'Ти хочеш дізнатися, чи є аптека: ¿Hay…?'],
  ],
});
k.exact({
  n: 27,
  role: 'delayed',
  fam: 'a105.museum-info',
  t: [MU],
  ins: 'Ти знаєш адресу музею, але не знаєш, о котрій він відчиняється. Запитай іспанською.',
  acc: ['¿A qué hora abre el museo?', '¿Cuándo abre el museo?'],
  err: [['¿Dónde está el museo?', 'Адресу ти вже знаєш. Бракує години: ¿A qué hora abre…?']],
});
k.choice({
  n: 28,
  role: 'delayed',
  fam: 'a105.contact',
  t: [MC],
  ins: 'Ти хочеш подзвонити новому колезі, але не маєш його номера. Обери питання.',
  o: [
    ['¿Dónde está tu teléfono?', MC, 'Тобі потрібен номер, а не місце, де лежить телефон.'],
    ['¿Cuál es tu número de teléfono?', true],
    ['¿Quién es tu teléfono?', MC, 'Quién питає про людину.'],
  ],
});
k.exact({
  n: 29,
  role: 'transfer',
  fam: 'a105.hotel-phone',
  t: [MU],
  ins: 'Ти знаєш назву й адресу готелю, але не маєш його телефону. Запитай іспанською.',
  acc: ['¿Cuál es el número de teléfono del hotel?', '¿Cuál es el teléfono del hotel?'],
  err: [['¿Qué es el número de teléfono del hotel?', queForCual[1]], ['¿Dónde está el hotel?', 'Адресу ти вже знаєш. Бракує номера телефону: ¿Cuál es…?']],
});
k.exact({
  n: 30,
  role: 'transfer',
  fam: 'a105.class-price',
  t: [MU],
  ins: 'Ти знаєш, коли й де заняття з іспанської, але не знаєш ціни. Запитай іспанською.',
  acc: ['¿Cuánto cuesta la clase?', '¿Cuánto cuesta la clase de español?', '¿Cuánto cuestan las clases?', '¿Cuánto cuestan las clases de español?'],
  err: [['¿Cuánto cuestan la clase?', 'Clase — одна, тож cuesta: ¿Cuánto cuesta la clase?']],
});

// ======================= reading: practical notices (CV-06)
const N1 = 'Cerrado por vacaciones del 1 al 15 de agosto.';
const N2 = 'Clase de español: martes y jueves, 19:00, sala 2.';
const N3 = 'Farmacia de guardia: calle Mayor, 5. Abierta 24 horas.';
const N4 = 'Museo de la Ciudad. Horario: de martes a domingo, de 10:00 a 18:00. Lunes: cerrado. Entrada: 6 €.';
const rn = (n: number, role: 'independent' | 'delayed', fam: string, text: string, q: string, o: Array<[string, boolean]>): string =>
  k.choice({ n, role, fam, t: [RN], ins: `Прочитай оголошення. ${q}`, p: [text], o });
rn(41, 'independent', 'a105.n-holiday', N1, 'Чому зачинено?', [['Через свято.', false], ['Через відпустку.', true], ['Через ремонт.', false]]);
rn(42, 'independent', 'a105.n-holiday', N1, 'До якого числа зачинено?', [['До 1 серпня.', false], ['До 15 серпня.', true], ['До 15 квітня.', false]]);
rn(43, 'independent', 'a105.n-class', N2, 'У які дні заняття?', [['У вівторок і четвер.', true], ['У понеділок і середу.', false], ['Щодня.', false]]);
rn(44, 'independent', 'a105.n-class', N2, 'Де заняття?', [['У залі 2.', true], ['У залі 19.', false], ['На вулиці.', false]]);
rn(45, 'independent', 'a105.n-pharmacy', N3, 'Де чергова аптека?', [['На вулиці Майор, 5.', true], ['На площі Майор.', false], ['На вулиці Майор, 24.', false]]);
rn(46, 'independent', 'a105.n-pharmacy', N3, 'Коли вона працює?', [['Цілодобово.', true], ['До 24 серпня.', false], ['Лише вранці.', false]]);
rn(47, 'delayed', 'a105.n-museum', N4, 'Скільки коштує вхід?', [['10 €.', false], ['6 €.', true], ['18 €.', false]]);
rn(48, 'delayed', 'a105.n-museum', N4, 'Коли музей зачинений?', [['У неділю.', false], ['У понеділок.', true], ['У вівторок.', false]]);

// ======================= short written answers after reading
k.exact({
  n: 51,
  role: 'supported',
  fam: 'a105.a-pharmacy',
  t: [WA],
  ins: 'На дверях аптеки написано: «Abre a las 9:00». Друг питає: «¿A qué hora abre la farmacia?» Відповідай коротко іспанською. Зразок: Cierra a las ocho.',
  acc: ['Abre a las nueve.', 'A las nueve.', 'La farmacia abre a las nueve.', 'Abre a las 9:00.', 'A las 9:00.'],
  err: [['Abre las nueve.', 'Годину події кажемо з a: a las nueve.']],
});
k.exact({
  n: 52,
  role: 'independent',
  fam: 'a105.a-class',
  t: [WA],
  ins: `Прочитай оголошення: «${N2}» Друг питає: «¿Dónde es la clase?» Відповідай коротко іспанською.`,
  acc: ['En la sala 2.', 'En la sala dos.', 'Es en la sala 2.', 'Es en la sala dos.', 'La clase es en la sala 2.', 'La clase es en la sala dos.'],
});
k.exact({
  n: 53,
  role: 'independent',
  fam: 'a105.a-cafe',
  t: [WA],
  ins: 'У меню: «Café: 1,50 €». Друг питає: «¿Cuánto cuesta el café?» Відповідай коротко іспанською.',
  acc: ['Cuesta un euro con cincuenta.', 'Cuesta un euro cincuenta.', 'Un euro con cincuenta.', 'Un euro cincuenta.', 'Cuesta 1,50 €.', 'El café cuesta un euro con cincuenta.', 'El café cuesta un euro cincuenta.'],
  err: [['Cuestan un euro con cincuenta.', 'Café — одна річ, тож cuesta.']],
});
k.exact({
  n: 54,
  role: 'delayed',
  fam: 'a105.a-guardia',
  t: [WA],
  ins: 'Прочитай: «Farmacia de guardia: calle Sol, 8». Друг питає: «¿Dónde está la farmacia de guardia?» Відповідай коротко іспанською.',
  acc: ['Está en la calle Sol, 8.', 'En la calle Sol, 8.', 'Está en la calle Sol, número 8.', 'En la calle Sol, número 8.', 'Está en la calle Sol, ocho.', 'En la calle Sol, ocho.', 'La farmacia de guardia está en la calle Sol, 8.'],
  err: [['Es en la calle Sol, 8.', 'Де щось знаходиться — estar: Está en la calle Sol, 8.']],
});
k.exact({
  n: 55,
  role: 'transfer',
  fam: 'a105.a-meeting',
  t: [WA],
  ins: 'У календарі колеги: «Reunión: lunes, 10:00». Тебе питають: «¿Cuándo es la reunión?» Відповідай коротко іспанською.',
  acc: ['Es el lunes a las diez.', 'El lunes a las diez.', 'La reunión es el lunes a las diez.', 'Es el lunes a las 10:00.', 'El lunes a las 10:00.'],
  err: [['Es en el lunes a las diez.', 'З днем тижня прийменник не потрібен: el lunes.']],
});

k.material({
  id: 'material.a1-05.questions',
  topic: 'A1-05-L6',
  title: 'Яке питання поставити',
  blocks: [
    ul(
      'Місце — ¿Dónde está…?',
      'День — ¿Cuándo es…? Година — ¿A qué hora…?',
      'Ціна — ¿Cuánto cuesta…?',
      'Конкретні дані — ¿Cuál es…? (номер, адреса, розклад)',
      'Людина — ¿Quién es…? Чи є — ¿Hay…?',
    ),
    plink('Потренувати питання', [CW, MU], 'written', 10),
  ],
  linked: [CW, MU, WA],
});

export default k.build({
  title: 'Чого бракує? Питаємо й відповідаємо',
  termEs: 'pedir la información que falta',
  summary: 'Читаємо коротке оголошення, визначаємо, чого бракує, і ставимо потрібне питання (cuál, dónde, cuándo, a qué hora, cuánto, quién, hay); коротко відповідаємо письмово.',
  objectives: ['A1-05-O6', 'A1-05-O7'],
  cv: ['CV-06'],
  situations: ['time-appointments-transport', 'food-shopping', 'places-accommodation'],
  minutes: 18,
  introduces: ['question.word.cual', 'contrast.que-cual', 'question.choice-missing-info', 'reading.practical-notice', 'writing.info-answer'],
  revisits: ['question.word.que', 'question.word.donde', 'question.word.quien', 'question.word.cuando', 'time.event.a-las', 'price.ask-answer', 'hay.existence', 'date.full-date', 'prep.spatial.place', 'ortho.interrogative-accent'],
  steps: [
    {
      kind: 'explanation',
      title: 'Крок 1. Cuál, cuáles; qué чи cuál',
      blocks: [
        uk('Cuál — «який (із кількох)?» або «яка інформація?»: питаємо про конкретні дані — номер, адресу, розклад. Про кілька речей — cuáles. Обидві форми пишуться зі знаком наголосу.'),
        uk('Перед es / son: ¿Qué es…? — що це таке взагалі; ¿Cuál es…? — конкретна інформація. Перед іменником в Іспанії кажуть qué: ¿Qué coche?'),
        ex('¿Cuál es tu nombre?', 'Яке твоє ім’я?'),
        ex('¿Cuáles son tus libros?', 'Які книжки — твої?'),
        ex('¿Qué es un horario?', 'Що таке horario (розклад)?'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 1: практика зі зразком', tasks: [k.id(1), k.id(2), k.id(13)] },
    { kind: 'independent-practice', title: 'Крок 1: самостійно', tasks: [k.id(11), k.id(3), k.id(4), k.id(14), k.id(5), k.id(15), k.id(6)] },
    {
      kind: 'explanation',
      title: 'Крок 2. Чого бракує?',
      blocks: [
        uk('Спершу визнач, чого бракує, потім обери питання: місце — ¿Dónde…?, день — ¿Cuándo…?, година — ¿A qué hora…?, ціна — ¿Cuánto cuesta…?, конкретні дані — ¿Cuál es…?, людина — ¿Quién…?, чи щось є — ¿Hay…?'),
        uk('У відповіді не треба повторювати все питання: досить короткого речення з потрібною інформацією.'),
        ex('¿Dónde está el banco? — Está al lado del hotel.', 'Де банк? — Поруч із готелем.'),
        ex('¿A qué hora cierra la tienda? — Cierra a las ocho.', 'О котрій зачиняється крамниця? — О восьмій.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 2: практика зі зразком', tasks: [k.id(21), k.id(22), k.id(51)] },
    { kind: 'independent-practice', title: 'Крок 2: самостійно', tasks: [k.id(23), k.id(24), k.id(25), k.id(26)] },
    { kind: 'reading', title: 'Читаємо оголошення', blocks: [es(N1), es(N2), es(N3)], tasks: [k.id(41), k.id(42), k.id(43), k.id(44), k.id(45), k.id(46)] },
    { kind: 'writing', title: 'Коротко відповідаємо', tasks: [k.id(52), k.id(53)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          '¿Cuál es…? — конкретні дані; ¿Qué es…? — що це таке.',
          'Cuáles — про кілька речей. Перед іменником — qué.',
          'Визнач, чого бракує, і постав потрібне питання.',
          'Відповідай коротко: Abre a las nueve. Está al lado del banco.',
        ),
      ],
    },
  ],
});
