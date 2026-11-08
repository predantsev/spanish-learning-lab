// A1-05-C1 — optional mixed check: delayed independent return to the A1-05 targets (numbers,
// prices, clock time, dates, places, questions). It samples held-out (delayed/transfer) tasks of
// A1-05-L1…L6 by reference and adds a small integrated practical situation of its own; no new
// teaching, no locks, no whole-block pass/fail.
import { Kit, S, es, hTranscript, uk } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-05-C1', RULES);

const DL = 'article.contraction-del/written-form';
const EAW = 'time.event.a-las/written-form';
const MU = 'question.choice-missing-info/construction-use';
const RN = 'reading.practical-notice/reading-meaning';
const WA = 'writing.info-answer/construction-use';
const LD = 'listening.dates/listening-meaning';

k.exact({
  n: 1,
  role: 'transfer',
  fam: 'a105c.concert-question',
  t: [MU],
  ins: 'Ти знаєш, що концерт у суботу і квиток коштує 8 €, але не знаєш, де він. Запитай іспанською.',
  acc: ['¿Dónde es el concierto?', '¿Dónde es el concierto el sábado?'],
  err: [['¿Cuándo es el concierto?', 'День ти вже знаєш. Бракує місця: ¿Dónde…?']],
});
k.slots({
  n: 2,
  role: 'transfer',
  fam: 'a105c.museum-plan',
  t: [DL, EAW],
  ins: 'Перепиши речення повністю, щоб воно означало «Музей близько від готелю й відчиняється о десятій».',
  p: ['El museo está cerca ___ hotel y abre ___ diez.'],
  tpl: ['El museo está cerca ', S('s1'), ' hotel y abre ', S('s2'), ' diez.'],
  slots: [
    { id: 's1', t: DL, acc: ['del'], err: [['de el', 'De + el завжди зливаються: del hotel.'], ['de la', 'Hotel — чоловічого роду: el hotel → del hotel.']] },
    { id: 's2', t: EAW, acc: ['a las'], err: [['las', 'Година події — з a: a las diez.']] },
  ],
});

const NOTICE = 'CONCIERTO DE PRIMAVERA — sábado 12 de abril, 20:00. Plaza Mayor, al lado de la estación. Entrada: 8 €.';
k.choice({
  n: 3,
  role: 'transfer',
  fam: 'a105c.n-concert',
  t: [RN],
  ins: 'Прочитай оголошення. Коли концерт?',
  p: [NOTICE],
  o: [
    ['У суботу, 12 квітня, о 20:00.', true],
    ['У неділю, 12 квітня, о 20:00.', false],
    ['У суботу, 2 квітня, о 8:00.', false],
  ],
});
k.choice({
  n: 4,
  role: 'transfer',
  fam: 'a105c.n-concert',
  t: [RN],
  ins: 'Прочитай оголошення. Де концерт?',
  p: [NOTICE],
  o: [
    ['Навпроти станції.', false],
    ['На площі Майор, поруч зі станцією.', true],
    ['На станції.', false],
  ],
});

const SCRIPT = 'La clase de español es el lunes a las seis, en la sala cuatro.';
const c = k.clip({ id: 'clip.a1-05.check.clase', kind: 'sentence', es: SCRIPT, uk: 'Заняття з іспанської в понеділок о шостій, у залі чотири.', t: [LD], fam: 'a105c.l-class' });
k.choice({
  n: 5,
  role: 'transfer',
  fam: 'a105c.l-class',
  t: [LD],
  clips: [c],
  ins: 'Послухай. Коли заняття з іспанської?',
  o: [
    ['У понеділок о шостій.', true],
    ['У четвер о шостій.', false],
    ['У понеділок о четвертій.', false],
  ],
  hints: [hTranscript([LD], SCRIPT)],
});
k.exact({
  n: 6,
  role: 'transfer',
  fam: 'a105c.a-concert',
  t: [WA],
  ins: `Прочитай оголошення: «${NOTICE}» Друг питає: «¿Cuánto cuesta la entrada?» Відповідай коротко іспанською.`,
  acc: ['Cuesta ocho euros.', 'Ocho euros.', 'La entrada cuesta ocho euros.', 'Cuesta 8 €.', '8 €.', 'Cuesta 8 euros.'],
  err: [['Cuestan ocho euros.', 'Entrada — одна річ, тож cuesta: Cuesta ocho euros.']],
});

const ref = (lesson: string, ...nums: number[]): string[] => nums.map((n) => `${lesson}-T${String(n).padStart(2, '0')}`);

export default k.build({
  kind: 'optional-check',
  title: 'Перевір себе: числа, ціни, час і місця',
  termEs: 'repaso: números, precios, horas y lugares',
  summary:
    'Необов’язкова змішана перевірка блоку: числа й кількість, ціни, котра година й години роботи, дати, де що знаходиться і питання про потрібну інформацію — на нових прикладах. Кожна навичка отримує окремий результат; спільної оцінки «пройдено / не пройдено» немає.',
  objectives: ['A1-05-O1', 'A1-05-O2', 'A1-05-O3', 'A1-05-O4', 'A1-05-O5', 'A1-05-O6', 'A1-05-O7'],
  situations: ['food-shopping', 'time-appointments-transport', 'places-accommodation'],
  minutes: 20,
  introduces: [],
  revisits: [
    'number.0-15',
    'number.16-29',
    'number.30-99',
    'number.100-1000',
    'number.uno-un-una',
    'tener.age',
    'question.word.cuanto',
    'number.ordinal',
    'quant.mucho',
    'contrast.muy-mucho',
    'quant.containers',
    'price.amount-wording',
    'price.ask-answer',
    'formula.shop',
    'reading.price-label',
    'time.clock.hours',
    'time.clock.es-la-una',
    'time.clock.minutes',
    'time.clock.de-la-manana',
    'time.event.a-las',
    'time.range.de-a',
    'time.abre-cierra',
    'reading.opening-hours',
    'date.days-of-week',
    'date.el-lunes',
    'date.months',
    'date.full-date',
    'question.word.cuando',
    'date.appointment',
    'reading.calendar-appointment',
    'listening.dates',
    'prep.spatial.object',
    'prep.spatial.place',
    'article.contraction-del',
    'question.word.cual',
    'question.choice-missing-info',
    'reading.practical-notice',
    'writing.info-answer',
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Як працює перевірка',
      blocks: [
        uk('Це необов’язкова перевірка без нових правил. Завдання — нові, яких не було в уроках. Її поділено на частини: можна зупинитися після будь-якої й повернутися пізніше.'),
        uk('Кожна навичка отримує окремий результат. Помилка в одному завданні не означає, що всю тему «не вивчено»: після перевірки ти побачиш, що варто повторити.'),
      ],
    },
    { kind: 'self-check', title: 'Частина 1. Числа й кількість', tasks: ref('A1-05-L1', 7, 15, 26, 34, 43, 54, 65, 76, 96, 107, 118) },
    { kind: 'self-check', title: 'Частина 2. Ціни й покупки', tasks: ref('A1-05-L2', 7, 21, 30, 47) },
    { kind: 'self-check', title: 'Частина 3. Котра година і коли відчинено', tasks: ref('A1-05-L3', 7, 16, 26, 38, 49, 63, 74, 85) },
    { kind: 'self-check', title: 'Частина 4. Дати й місця', tasks: [...ref('A1-05-L4', 7, 17, 27, 37, 47, 57, 67), ...ref('A1-05-L5', 7, 27, 47), k.id(2)] },
    { kind: 'self-check', title: 'Частина 5. Питання й оголошення', tasks: [...ref('A1-05-L6', 7, 27, 47, 54), k.id(1)] },
    { kind: 'reading', title: 'Частина 6. Оголошення про концерт', blocks: [es(NOTICE)], tasks: [k.id(3), k.id(4)] },
    { kind: 'writing', title: 'Частина 7. Коротка відповідь', required: false, tasks: [k.id(6)] },
    { kind: 'listening', title: 'Частина 8. Слухання', required: false, clips: [c], tasks: [k.id(5)] },
  ],
});
