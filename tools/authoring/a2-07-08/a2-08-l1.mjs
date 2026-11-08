// A2-08-L1 — a notice or practical information (O1): find facts (time, date, price, place) and
// required actions/prohibitions/order in short practical texts. Comprehension only: no Spanish
// production is assessed here (CURRICULUM A2-08-O1 boundary).
import { ex, table, ul, uk } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-08-L1';
const PI = 'reading.practical-information/reading-meaning';
const RA = 'reading.required-actions/reading-meaning';

const D = {
  [PI]: {
    rule: 'Спершу прочитайте питання: що треба знайти — день, годину, ціну, місце? Потім шукайте саме цю деталь; решту тексту не обов’язково розуміти дослівно.',
    ok: 'Правильно! Ви знайшли потрібну інформацію.',
    bad: 'Ні. Знайдіть у тексті саме ту деталь, про яку питають, і прочитайте її ще раз.',
  },
  [RA]: {
    rule: 'Шукайте слова обов’язку й заборони (hay que, tiene que, prohibido), накази й інфінітиви-інструкції та слова порядку (primero, luego, a continuación, por último). No hay que — «не потрібно», а не «заборонено».',
    ok: 'Правильно! Ви зрозуміли, що треба зробити.',
    bad: 'Ні. Знайдіть у тексті слова обов’язку, заборони чи порядку й прочитайте це місце ще раз.',
  },
};
const k = kit(L, D);

// ---- texts ----
const HOURS = 'Farmacia Central. Horario: de lunes a viernes, de 9:00 a 14:00 y de 17:00 a 20:30. Sábados, de 10:00 a 14:00. Domingos, cerrado.';
const APPT = 'Centro de salud. Su cita: martes, 14 de marzo, a las 11:20, con la doctora López. Hay que traer el DNI y la tarjeta sanitaria. Llegue diez minutos antes, por favor. Para cambiar la cita, llame al 912 345 678.';
const FLAT = 'Se alquila piso amueblado en el centro. Dos habitaciones, cocina y baño. 750 euros al mes, gastos incluidos. Fianza: un mes. Llamar por las tardes al 600 123 456.';
const LIBRARY = 'Biblioteca municipal. Normas: Hay que hablar bajo. Prohibido comer y beber en la sala. Hay que apagar el móvil. Para sacar libros, hay que tener el carné de la biblioteca. No hay que pagar: la biblioteca es gratis.';
const ONLINE = 'Cita previa en el ayuntamiento. Primero, entre en la página web del ayuntamiento. Luego, pulse el botón «Cita previa». A continuación, escriba su nombre y su DNI. Por último, busque un día y una hora libres.';
const MENU = 'Restaurante Casa Pepe. Menú del día: 12 euros. Primer plato, segundo plato, pan, bebida y postre incluidos. De lunes a viernes, de 13:00 a 16:00.';
const BUS = 'Autobuses Madrid – Toledo. Salidas cada hora, de 7:00 a 22:00. Precio: 6 euros. Los domingos, el primer autobús sale a las 9:00.';
const HOTEL = 'Hotel Sol. Información: El desayuno es de 7:30 a 10:30 en el primer piso. Hay que dejar la habitación antes de las 12:00. Hay que dejar las llaves en recepción. Prohibido fumar en las habitaciones.';

const G = {
  appt: 'el centro de salud — поліклініка; la doctora — лікарка; la tarjeta sanitaria — медична картка (полісу)',
  library: 'las normas — правила; la biblioteca — бібліотека; sacar libros — брати книжки додому; el carné — читацький квиток; gratis — безкоштовно',
  online: 'el ayuntamiento — мерія; la página web — сайт; libre — вільний',
  menu: 'el menú del día — комплексний обід; el plato — страва; la bebida — напій; el postre — десерт',
  hotel: 'la recepción — рецепція',
  flat: 'el baño — ванна кімната',
};

const tasks = [
  // ---- reading.practical-information ----
  k.ch(1, 'supported', 'fam.notice-hours', PI, {
    instr: 'Прочитайте табличку аптеки. О котрій аптека зачиняється в суботу?',
    pre: uk('Підказка: знайдіть слово sábados і подивіться, яка година стоїть після a.'),
    es: HOURS,
    opts: [
      ['о 14:00', 'c'],
      ['о 20:30', 'x', 'О 20:30 аптека зачиняється з понеділка по п’ятницю.'],
      ['у суботу аптека не працює', 'x', 'Зачинено в неділю (domingos, cerrado). У суботу — з 10:00 до 14:00.'],
    ],
  }),
  k.ch(2, 'independent', 'fam.notice-hours', PI, {
    instr: 'Прочитайте табличку аптеки ще раз. Ви хочете прийти у вівторок о 15:00. Аптека буде відчинена?',
    es: HOURS,
    opts: [
      ['Ні: у будні з 14:00 до 17:00 перерва.', 'c'],
      ['Так: у будні аптека працює з 9:00 до 20:30 без перерви.', 'x', 'Подивіться уважно: de 9:00 a 14:00 y de 17:00 a 20:30 — між 14:00 і 17:00 зачинено.'],
      ['Ні: у вівторок аптека не працює.', 'x', 'De lunes a viernes — з понеділка по п’ятницю, тож у вівторок працює, але не о 15:00.'],
    ],
  }),
  k.ch(3, 'independent', 'fam.notice-appointment', PI, {
    instr: 'Прочитайте записку з поліклініки. Коли у вас прийом?',
    es: APPT,
    tr: G.appt,
    opts: [
      ['у вівторок, 14 березня, об 11:20', 'c'],
      ['у вівторок, 14 березня, о 9:12', 'x', '912 — це початок номера телефону. Час прийому — a las 11:20.'],
      ['у четвер, 14 березня, об 11:20', 'x', 'Martes — вівторок.'],
    ],
  }),
  k.ch(4, 'independent', 'fam.advert-flat', PI, {
    instr: 'Прочитайте оголошення. Скільки коштує квартира і чи треба окремо платити за комунальні послуги?',
    es: FLAT,
    tr: G.flat,
    opts: [
      ['750 євро на місяць, комунальні вже включено', 'c'],
      ['750 євро на місяць, комунальні — окремо', 'x', 'Gastos incluidos — комунальні платежі включено в ціну.'],
      ['600 євро на місяць, комунальні включено', 'x', '600 — це початок номера телефону. Ціна — 750 euros al mes.'],
    ],
  }),
  k.ch(5, 'delayed', 'fam.advert-flat', PI, {
    instr: 'Прочитайте оголошення. Яка застава за квартиру і коли можна телефонувати?',
    es: FLAT,
    tr: G.flat,
    opts: [
      ['застава — плата за один місяць; телефонувати після обіду', 'c'],
      ['застави немає; телефонувати зранку', 'x', 'Fianza: un mes — застава в розмірі місячної плати; por las tardes — після обіду, увечері.'],
      ['застава — 750 євро на рік; телефонувати будь-коли', 'x', 'Fianza: un mes — застава за один місяць; телефонувати — por las tardes.'],
    ],
  }),
  k.ch(6, 'transfer', 'fam.notice-menu', PI, {
    instr: 'Прочитайте табличку ресторану. Що з цього правда?',
    es: MENU,
    tr: G.menu,
    opts: [
      ['Комплексний обід коштує 12 євро, напій і десерт входять у ціну.', 'c'],
      ['Комплексний обід коштує 12 євро, але напій треба оплатити окремо.', 'x', 'Bebida y postre incluidos — напій і десерт включено.'],
      ['Комплексний обід є щодня, і в суботу теж.', 'x', 'De lunes a viernes — тільки з понеділка по п’ятницю.'],
    ],
  }),
  k.ch(7, 'delayed', 'fam.notice-timetable', PI, {
    instr: 'Прочитайте розклад автобусів. О котрій у неділю відходить перший автобус до Толедо?',
    es: BUS,
    opts: [
      ['о 9:00', 'c'],
      ['о 7:00', 'x', 'О 7:00 — перший автобус в інші дні. Los domingos — о 9:00.'],
      ['о 22:00', 'x', 'О 22:00 — останній автобус дня.'],
    ],
  }),

  // ---- reading.required-actions ----
  k.ch(8, 'supported', 'fam.notice-appointment', RA, {
    instr: 'Прочитайте записку з поліклініки. Що треба взяти з собою на прийом?',
    pre: uk('Підказка: знайдіть hay que + інфінітив.'),
    es: APPT,
    tr: G.appt,
    opts: [
      ['посвідчення особи (DNI) і медичну картку', 'c'],
      ['тільки посвідчення особи', 'x', 'Hay que traer el DNI y la tarjeta sanitaria — обидва документи.'],
      ['нічого, тільки прийти вчасно', 'x', 'Hay que traer… — треба принести документи.'],
    ],
  }),
  k.ch(9, 'independent', 'fam.notice-appointment', RA, {
    instr: 'Прочитайте записку ще раз. Коли треба прийти і що робити, якщо хочете перенести прийом?',
    es: APPT,
    tr: G.appt,
    opts: [
      ['прийти на 10 хвилин раніше; щоб перенести — зателефонувати', 'c'],
      ['прийти рівно об 11:20; щоб перенести — написати лист', 'x', 'Llegue diez minutos antes — прийдіть на 10 хвилин раніше; llame — зателефонуйте.'],
      ['прийти на 10 хвилин пізніше; перенести не можна', 'x', 'Antes — раніше. Para cambiar la cita, llame… — щоб перенести, зателефонуйте.'],
    ],
  }),
  k.ch(10, 'independent', 'fam.notice-rules', RA, {
    instr: 'Прочитайте правила бібліотеки. Що в залі заборонено?',
    es: LIBRARY,
    tr: G.library,
    opts: [
      ['їсти й пити', 'c'],
      ['брати книжки додому', 'x', 'Брати книжки можна, якщо є читацький квиток.'],
      ['розмовляти', 'x', 'Розмовляти можна, але тихо: hay que hablar bajo.'],
    ],
  }),
  k.ch(11, 'independent', 'fam.notice-rules', RA, {
    instr: 'Прочитайте правила бібліотеки ще раз. Що потрібно, щоб узяти книжку додому?',
    es: LIBRARY,
    tr: G.library,
    opts: [
      ['мати читацький квиток', 'c'],
      ['заплатити', 'x', 'No hay que pagar — платити не потрібно.'],
      ['вимкнути телефон', 'x', 'Телефон треба вимкнути в бібліотеці, але для книжок потрібен carné.'],
    ],
  }),
  k.ch(12, 'independent', 'fam.instructions-online', RA, {
    instr: 'Прочитайте інструкцію. Що треба зробити після того, як натиснули кнопку «Cita previa»?',
    es: ONLINE,
    tr: G.online,
    opts: [
      ['написати своє ім’я і номер DNI', 'c'],
      ['зайти на сайт мерії', 'x', 'Це перший крок (primero), до кнопки.'],
      ['вибрати вільний день і годину', 'x', 'Це останній крок (por último).'],
    ],
  }),
  k.ch(13, 'delayed', 'fam.instructions-online', RA, {
    instr: 'Прочитайте інструкцію. Що треба зробити наприкінці?',
    es: ONLINE,
    tr: G.online,
    opts: [
      ['знайти вільний день і годину', 'c'],
      ['натиснути кнопку «Cita previa»', 'x', 'Це другий крок (luego).'],
      ['зателефонувати в мерію', 'x', 'У тексті немає такого кроку. Por último — busque un día y una hora libres.'],
    ],
  }),
  k.ch(14, 'delayed', 'fam.notice-rules', RA, {
    instr: 'Прочитайте правила бібліотеки. Що в них сказано про оплату?',
    es: LIBRARY,
    tr: G.library,
    opts: [
      ['Платити не потрібно: бібліотека безкоштовна.', 'c'],
      ['Платити заборонено.', 'x', 'No hay que pagar — «не потрібно платити», а не «заборонено».'],
      ['Треба заплатити за читацький квиток.', 'x', 'No hay que pagar: la biblioteca es gratis — платити не потрібно.'],
    ],
  }),
  k.ch(15, 'transfer', 'fam.notice-hotel', RA, {
    instr: 'Прочитайте інформацію в номері готелю. Що треба зробити до 12:00?',
    es: HOTEL,
    tr: G.hotel,
    opts: [
      ['звільнити номер', 'c'],
      ['поснідати на першому поверсі', 'x', 'Сніданок — з 7:30 до 10:30; це не обов’язок.'],
      ['забрати ключі на рецепції', 'x', 'Ключі треба залишити на рецепції (dejar las llaves en recepción).'],
    ],
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-08',
  titleUk: 'Оголошення й практична інформація',
  termEs: 'avisos e información práctica',
  summaryUk: 'Читаємо короткі практичні тексти — графік роботи, запис до лікаря, оголошення про оренду, правила, інструкцію — і знаходимо потрібні факти: день, годину, ціну, що треба зробити й що заборонено.',
  objectives: ['A2-08-O1'],
  cv: ['CV-05', 'CV-06'],
  situations: ['time-appointments-transport', 'places-accommodation', 'food-shopping', 'instructions-notices'],
  estimatedMinutes: 16,
  introduces: ['reading.practical-information', 'reading.required-actions'],
  revisits: ['time.clock.hours', 'time.clock.minutes', 'time.range.de-a', 'date.full-date', 'reading.instructions-order', 'obligation.hay-que', 'formula.notice-prohibido', 'formula.notice-infinitive', 'formula.notice-se', 'imperative.usted.regular'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Як читати практичний текст',
      required: true,
      blocks: [
        uk('Практичний текст не треба перекладати дослівно. Спершу прочитайте питання: що треба знайти? Потім шукайте в тексті саме цю деталь — день, годину, ціну, місце чи дію.'),
        ul([
          'Час і дні: de lunes a viernes — з понеділка по п’ятницю; de 9:00 a 14:00 — з 9:00 до 14:00; cerrado — зачинено.',
          'Обов’язок: hay que + інфінітив; наказ для usted (llegue, llame). Заборона: prohibido. No hay que — «не потрібно».',
          'Порядок: primero, luego, a continuación, por último.',
        ]),
        table(['Іспанською', 'Українською'], [
          ['la cita previa', 'попередній запис (на прийом)'],
          ['amueblado / amueblada', 'умебльований / умебльована'],
          ['los gastos', 'витрати; комунальні платежі'],
          ['incluido / incluida', 'включений / включена'],
          ['la fianza', 'застава (за оренду)'],
        ], 'uk'),
      ],
    },
    {
      id: 's2',
      kind: 'examples',
      titleUk: 'Приклад: оголошення про оренду',
      required: true,
      blocks: [
        ex(FLAT, 'Здається умебльована квартира в центрі. Дві кімнати, кухня і ванна. 750 євро на місяць, комунальні включено. Застава: один місяць. Телефонувати після обіду за номером 600 123 456.'),
        uk('Ціна — 750 euros al mes; gastos incluidos — за комунальні окремо платити не треба; fianza: un mes — застава дорівнює місячній платі.'),
      ],
    },
    { id: 's3', kind: 'supported-practice', titleUk: 'Читаємо з підказкою', required: true, taskIds: [1, 8].map(T) },
    { id: 's4', kind: 'reading', titleUk: 'Знаходимо факти й дії', required: true, blocks: [uk('Кожне завдання має свій короткий текст: графік аптеки, записка з поліклініки, оголошення, правила, інструкція. Перед читанням подивіться на питання.')], taskIds: [2, 3, 4, 9, 10, 12].map(T) },
    { id: 's5', kind: 'reading', titleUk: 'Ще одне питання (за бажанням)', required: false, blocks: [uk('Ще раз правила бібліотеки: тепер знайдіть, що потрібно, щоб узяти книжку.')], taskIds: [11].map(T) },
    {
      id: 's6',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Спершу питання, потім пошук потрібної деталі.',
          'Hay que — треба; prohibido — заборонено; no hay que — не потрібно.',
          'Gastos incluidos — комунальні включено; fianza — застава; cita previa — попередній запис.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
