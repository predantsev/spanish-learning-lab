// A2-08-L5 — understand a short recording (O5): audio-only meaning questions first (transcript as
// help on request), separate optional dictation, then an optional separate written reply.
// Four single-speaker clips: two voice messages, two public announcements.
import { ex, table, ul, uk } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-08-L5';
const LV = 'listening.voice-message/listening-meaning';
const DV = 'listening.voice-message/dictation';
const LP = 'listening.public-announcement/listening-meaning';
const DP = 'listening.public-announcement/dictation';
const RA = 'reading.required-actions/reading-meaning';
const WM = 'writing.message-recipient-purpose/construction-use';

const listenBad = 'Ні. Прослухайте ще раз; за потреби відкрийте текст запису (це врахується як допомога).';
const D = {
  [LV]: {
    rule: 'Спершу визначте головне: хто телефонує і навіщо. Потім деталі: день, годину, місце, що треба зробити.',
    ok: 'Правильно! Ви зрозуміли повідомлення.',
    bad: listenBad,
  },
  [LP]: {
    rule: 'В оголошенні шукайте ключові факти: куди, о котрій, яка колія чи платформа, що потрібно зробити.',
    ok: 'Правильно! Ви зрозуміли оголошення.',
    bad: listenBad,
  },
  [DV]: { rule: 'Запишіть речення так, як чуєте: зі знаками наголосу і розділовими знаками.', ok: 'Правильно записано!', bad: 'Є помилка в написанні. Порівняйте із записом.' },
  [RA]: {
    rule: 'Шукайте слова обов’язку й заборони (hay que, prohibido, cerrado) і те, куди треба йти.',
    ok: 'Правильно! Ви зрозуміли, що треба зробити.',
    bad: 'Ні. Перечитайте оголошення і знайдіть hay que.',
  },
  [WM]: {
    rule: 'Відповідаючи на голосове повідомлення письмово: звертання, відповідь на питання, потрібні деталі, прощання.',
    ok: 'Ваша відповідь збігається зі зразком.',
    bad: 'Перевірте відповідь за критеріями.',
    unres: 'Вільний текст не перевіряється автоматично. Порівняйте відповідь із критеріями і зразком: зразок — лише один із можливих варіантів.',
  },
};
D[DP] = D[DV];
const k = kit(L, D);

const VM = 'listening.voice-message';
const PA = 'listening.public-announcement';
const both = (skill) => [
  { skillId: skill, modality: 'listening-meaning' },
  { skillId: skill, modality: 'dictation' },
];

export const clips = [
  {
    id: 'clip.a2-08.cena-javier',
    lessonId: L,
    kind: 'text',
    transcript: 'Hola, Elena, soy Javier. Te llamo por la cena del viernes. Al final no es en mi casa: es en el restaurante Mar Azul, en la calle Mayor, número doce. Quedamos a las nueve y media. ¿Puedes confirmarme mañana si vienes? Un beso.',
    translationUk: 'Привіт, Олено, це Хав’єр. Телефоную щодо вечері в п’ятницю. Зрештою вона буде не в мене вдома, а в ресторані «Мар Асуль» на вулиці Майор, номер дванадцять. Зустрічаємося о пів на десяту. Можеш підтвердити мені завтра, чи прийдеш? Цілую.',
    targets: both(VM),
    family: 'fam.clip-cena-javier',
    reviewStatus: 'draft',
  },
  {
    id: 'clip.a2-08.cita-centro-salud',
    lessonId: L,
    kind: 'text',
    transcript: 'Buenos días, le llamo del centro de salud Las Rosas. Su cita con el doctor Martín es el jueves, día veinte, a las diez y cuarto. Por favor, traiga la tarjeta sanitaria. Hay que llegar diez minutos antes. Si no puede venir, llame al centro. Gracias.',
    translationUk: 'Доброго дня, вам телефонують із поліклініки «Лас Росас». Ваш прийом у лікаря Мартіна — у четвер, двадцятого, о чверть на одинадцяту (о 10:15). Будь ласка, візьміть медичну картку. Треба прийти на десять хвилин раніше. Якщо не можете прийти, зателефонуйте в поліклініку. Дякуємо.',
    targets: both(VM),
    family: 'fam.clip-cita-salud',
    reviewStatus: 'draft',
  },
  {
    id: 'clip.a2-08.tren-valencia',
    lessonId: L,
    kind: 'text',
    transcript: 'Atención, por favor. El tren con destino a Valencia de las once y cuarto tiene un retraso de veinte minutos. El tren sale a las once y treinta y cinco de la vía cinco. Repetimos: el tren con destino a Valencia sale de la vía cinco.',
    translationUk: 'Увага, будь ласка. Потяг до Валенсії, що мав відправитися об 11:15, запізнюється на двадцять хвилин. Потяг відправляється об 11:35 з п’ятої колії. Повторюємо: потяг до Валенсії відправляється з п’ятої колії.',
    targets: both(PA),
    family: 'fam.clip-tren-valencia',
    reviewStatus: 'draft',
  },
  {
    id: 'clip.a2-08.supermercado-cierra',
    lessonId: L,
    kind: 'text',
    transcript: 'Atención, señores clientes. El supermercado cierra en quince minutos. Por favor, vayan a las cajas. Hoy las naranjas están a un euro el kilo. Gracias por su visita y hasta mañana.',
    translationUk: 'Увага, шановні покупці. Супермаркет зачиняється через п’ятнадцять хвилин. Будь ласка, пройдіть до кас. Сьогодні апельсини коштують один євро за кілограм. Дякуємо за візит і до завтра.',
    targets: both(PA),
    family: 'fam.clip-supermercado',
    reviewStatus: 'draft',
  },
];
const [cJ, cS, cT, cM] = clips;

const tasks = [
  // ---- listening.voice-message: meaning ----
  k.lm(1, 'supported', cJ, LV, {
    instr: 'Прослухайте голосове повідомлення. Навіщо телефонує Хав’єр?',
    pre: uk('Підказка: спершу головне — що змінилося щодо вечері.'),
    opts: [
      ['Повідомити, що вечеря буде в ресторані, а не в нього вдома.', 'c'],
      ['Скасувати вечерю в п’ятницю.', 'x', 'Вечерю не скасовано: al final… es en el restaurante — вона просто в іншому місці.'],
      ['Запросити Олену до себе додому.', 'x', 'No es en mi casa — вечеря не в нього вдома.'],
    ],
  }),
  k.lm(2, 'independent', cJ, LV, {
    instr: 'Прослухайте ще раз. О котрій зустріч і що Олена має зробити?',
    opts: [
      ['О 21:30; завтра підтвердити, чи прийде.', 'c'],
      ['О 21:00; завтра зателефонувати в ресторан.', 'x', 'A las nueve y media — о 21:30. Confirmarme… si vienes — підтвердити Хав’єрові, чи прийде.'],
      ['О 12:00; прийти на вулицю Майор.', 'x', 'Doce — номер будинку. Зустріч — a las nueve y media.'],
    ],
  }),
  k.lm(3, 'independent', cS, LV, {
    instr: 'Прослухайте повідомлення. Хто телефонує і навіщо?',
    opts: [
      ['Поліклініка: нагадує про прийом у лікаря.', 'c'],
      ['Лікар Мартін: скасовує прийом.', 'x', 'Телефонують із центру здоров’я (del centro de salud) і повідомляють дату прийому; його не скасовано.'],
      ['Аптека: просить забрати ліки.', 'x', 'Le llamo del centro de salud — це поліклініка, і йдеться про прийом (su cita).'],
    ],
  }),
  k.lm(4, 'delayed', cS, LV, {
    instr: 'Прослухайте повідомлення з поліклініки. Коли прийом і що треба взяти?',
    opts: [
      ['У четвер, 20-го, о 10:15; медичну картку.', 'c'],
      ['У вівторок, 20-го, о 10:15; посвідчення особи.', 'x', 'El jueves — у четвер; traiga la tarjeta sanitaria — медичну картку.'],
      ['У четвер, 10-го, о 20:15; медичну картку.', 'x', 'Día veinte — двадцятого; a las diez y cuarto — о 10:15.'],
    ],
  }),
  // ---- listening.voice-message: dictation ----
  k.dict(5, 'independent', cJ, DV, {
    instr: 'Прослухайте повідомлення Хав’єра і запишіть речення про час зустрічі.',
    acc: ['Quedamos a las nueve y media.'],
    err: [['Quedamos a las nueve i media.', 'Сполучник «і» іспанською — y.']],
  }),
  k.dict(6, 'delayed', cS, DV, {
    instr: 'Прослухайте повідомлення з поліклініки і запишіть речення, яке починається з Hay que.',
    acc: ['Hay que llegar diez minutos antes.'],
    err: [['Ay que llegar diez minutos antes.', 'Hay пишеться з h.']],
  }),

  // ---- listening.public-announcement: meaning ----
  k.lm(7, 'supported', cT, LP, {
    instr: 'Прослухайте оголошення на вокзалі. Що сталося з потягом до Валенсії?',
    pre: uk('Підказка: слухайте слово retraso.'),
    opts: [
      ['Він запізнюється на двадцять хвилин.', 'c'],
      ['Його скасували.', 'x', 'Потяг не скасовано: tiene un retraso de veinte minutos — він запізнюється.'],
      ['Він відправляється раніше.', 'x', 'Retraso — запізнення: потяг відправляється пізніше, об 11:35.'],
    ],
  }),
  k.lm(8, 'independent', cT, LP, {
    instr: 'Прослухайте ще раз. О котрій і з якої колії відправляється потяг?',
    opts: [
      ['Об 11:35 з п’ятої колії.', 'c'],
      ['Об 11:15 з п’ятої колії.', 'x', 'Об 11:15 потяг мав відправитися за розкладом; тепер — a las once y treinta y cinco.'],
      ['Об 11:35 з двадцятої колії.', 'x', 'Veinte — це хвилини запізнення. Колія — la vía cinco.'],
    ],
  }),
  k.lm(9, 'independent', cM, LP, {
    instr: 'Прослухайте оголошення в супермаркеті. Що треба зробити покупцям?',
    opts: [
      ['Пройти до кас: супермаркет зачиняється через 15 хвилин.', 'c'],
      ['Купити апельсини до кінця дня.', 'x', 'Про апельсини — лише інформація про ціну. Прохання: vayan a las cajas.'],
      ['Прийти завтра о 15:00.', 'x', 'En quince minutos — через 15 хвилин супермаркет зачиняється.'],
    ],
  }),
  k.lm(10, 'delayed', cM, LP, {
    instr: 'Прослухайте оголошення в супермаркеті. Скільки сьогодні коштують апельсини?',
    opts: [
      ['Один євро за кілограм.', 'c'],
      ['П’ятнадцять євро за кілограм.', 'x', 'Quince — це хвилини до закриття. Ціна: a un euro el kilo.'],
      ['Один євро за штуку.', 'x', 'A un euro el kilo — за кілограм.'],
    ],
  }),
  // ---- listening.public-announcement: dictation ----
  k.dict(11, 'independent', cT, DP, {
    instr: 'Прослухайте оголошення на вокзалі і запишіть останнє речення без слова Repetimos: «el tren con destino a Valencia…».',
    acc: ['El tren con destino a Valencia sale de la vía cinco.'],
    err: [['El tren con destino a Valencia sale de la via cinco.', 'Vía пишеться зі знаком наголосу: VÍ-a.']],
  }),
  k.dict(12, 'delayed', cM, DP, {
    instr: 'Прослухайте оголошення в супермаркеті і запишіть друге речення.',
    acc: ['El supermercado cierra en quince minutos.'],
    err: [['El supermercado cierra en cince minutos.', 'Quince пишеться через qu: quince.']],
  }),

  // ---- reading.required-actions (return) ----
  k.ch(13, 'independent', 'fam.notice-station', RA, {
    instr: 'Прочитайте оголошення на вокзалі. Що треба зробити, щоб сісти на потяг до Толедо?',
    es: 'Aviso: Por obras, el andén 2 está cerrado. Para el tren con destino a Toledo, hay que ir al andén 4.',
    tr: 'por obras — через ремонтні роботи',
    opts: [
      ['Піти на четверту платформу.', 'c'],
      ['Піти на другу платформу.', 'x', 'El andén 2 está cerrado — друга платформа зачинена.'],
      ['Чекати, поки відкриють другу платформу.', 'x', 'Hay que ir al andén 4 — треба йти на четверту платформу.'],
    ],
  }),

  // ---- writing.message-recipient-purpose (separate reply task) ----
  k.rb(14, 'independent', 'fam.reply-voice', WM, {
    instr: 'Ви — Олена. Напишіть Хав’єрові коротке повідомлення у відповідь на його голосове: підтвердьте, що прийдете, і запитайте одну деталь (наприклад, чи треба щось принести). 2–3 речення.',
    clips: [cJ.id],
    criteria: [
      'Є звертання до Хав’єра.',
      'Ясно, що ви прийдете (Sí, voy / Confirmo…).',
      'Є одне доречне питання (¿Llevo algo? / ¿Necesitas algo?).',
      'Є прощання.',
    ],
    exemplars: ['Hola, Javier: Sí, voy a la cena del viernes. ¿Llevo algo? Un beso, Elena'],
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-08',
  titleUk: 'Розуміємо короткий запис',
  termEs: 'entender una grabación breve',
  summaryUk: 'Слухаємо голосові повідомлення й оголошення на вокзалі та в магазині: спершу головне без тексту, потім деталі. Текст запису й повтор — на прохання. Диктант і письмова відповідь — окремі завдання.',
  objectives: ['A2-08-O5'],
  cv: ['CV-06'],
  situations: ['personal-messages', 'time-appointments-transport', 'food-shopping'],
  estimatedMinutes: 17,
  introduces: ['listening.voice-message', 'listening.public-announcement'],
  revisits: ['listening.requests-responses', 'listening.directions-instructions', 'time.clock.minutes', 'reading.required-actions', 'writing.message-recipient-purpose'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Як слухати',
      required: true,
      blocks: [
        uk('Спершу відповідайте на питання без тексту. Якщо важко — прослухайте ще раз або відкрийте текст запису: це нормально, просто таке завдання враховується як виконане з допомогою.'),
        ul([
          'Голосове повідомлення: хто телефонує → навіщо → день, година, місце → що треба зробити.',
          'Оголошення: куди → о котрій → яка колія чи платформа → що треба зробити.',
        ]),
        table(['Іспанською', 'Українською'], [
          ['el andén', 'перон, платформа'],
          ['la vía', 'колія: Sale de la vía 5. — Відправляється з п’ятої колії.'],
          ['el destino', 'пункт призначення: el tren con destino a Valencia — потяг до Валенсії'],
          ['al final', 'зрештою, у підсумку'],
          ['la caja', 'каса (у магазині)'],
          ['Atención, señores clientes.', 'Увага, шановні покупці.'],
          ['la naranja', 'апельсин'],
          ['el doctor / la doctora', 'лікар / лікарка'],
        ], 'uk'),
      ],
    },
    {
      id: 's2',
      kind: 'listening',
      titleUk: 'Голосові повідомлення',
      required: true,
      blocks: [uk('Два голосові повідомлення: від друга і з поліклініки.')],
      clipIds: [cJ.id, cS.id],
      taskIds: [1, 2, 3].map(T),
    },
    {
      id: 's3',
      kind: 'listening',
      titleUk: 'Оголошення',
      required: true,
      blocks: [uk('Два оголошення: на вокзалі і в супермаркеті.')],
      clipIds: [cT.id, cM.id],
      taskIds: [7, 8, 9].map(T),
    },
    { id: 's4', kind: 'independent-practice', titleUk: 'Диктант (за бажанням)', required: false, blocks: [uk('Запишіть почуте речення. Диктант оцінюється окремо від розуміння.')], clipIds: [cJ.id, cT.id], taskIds: [5, 11].map(T) },
    { id: 's5', kind: 'reading', titleUk: 'Оголошення на вокзалі', required: true, blocks: [uk('Те саме, але написане: знайдіть, куди треба йти.')], taskIds: [13].map(T) },
    { id: 's6', kind: 'writing', titleUk: 'Відповідь на голосове (за бажанням)', required: false, blocks: [uk('Окреме завдання: письмова відповідь Хав’єрові.')], clipIds: [cJ.id], taskIds: [14].map(T) },
    {
      id: 's7',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Спершу головне (хто і навіщо), потім деталі (коли, де, що зробити).',
          'Повтор і текст запису — на прохання; вони враховуються як допомога.',
          'El andén — платформа, la vía — колія, con destino a… — до (куди).',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks, clips };
