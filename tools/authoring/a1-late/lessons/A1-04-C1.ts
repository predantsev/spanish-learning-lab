// A1-04-C1 — optional mixed check: delayed independent return to the A1-04 targets.
// It samples the held-out (delayed/transfer) tasks of A1-04-L1…L6 by reference and adds a few
// integrated held-out tasks of its own; no new teaching, no locks, no whole-tense pass/fail.
import { Kit, S, es, hTranscript, uk, vslot } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-04-C1', RULES);

const RP = 'reflexive.pronouns/written-form';
const IR = 'present.ir/written-form';
const HA = 'present.hacer/written-form';
const ERP = 'present.regular-er.plural/written-form';
const RR = 'reading.routine-text/reading-meaning';
const WR = 'writing.routine/construction-use';
const LR = 'listening.routine/listening-meaning';

const PRON_ERR: Array<[string, string]> = [
  ['me', '«Me» — займенник для yo. Pablo — це él, тож se.'],
  ['te', '«Te» — займенник для tú. Pablo — це él, тож se.'],
  ['nos', '«Nos» — займенник для nosotros. Pablo — це él, тож se.'],
];

k.slots({
  n: 1,
  role: 'transfer',
  fam: 'a104c.workday',
  t: [RP, IR],
  ins: 'Перепиши речення повністю: встав займенник і форму дієслова ir.',
  p: ['Pablo ___ levanta temprano y ___ al trabajo. (ir)'],
  tpl: ['Pablo ', S('s1'), ' levanta temprano y ', S('s2'), ' al trabajo.'],
  slots: [{ id: 's1', t: RP, acc: ['se'], err: PRON_ERR }, vslot('s2', IR, 'ir', 2)],
  tr: 'Пабло встає рано й іде на роботу.',
});
k.slots({
  n: 2,
  role: 'transfer',
  fam: 'a104c.weekend',
  t: [HA, ERP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслів у дужках.',
  p: ['Los sábados yo ___ deporte y nosotros ___ el periódico en casa. (hacer, leer)'],
  tpl: ['Los sábados yo ', S('s1'), ' deporte y nosotros ', S('s2'), ' el periódico en casa.'],
  slots: [vslot('s1', HA, 'hacer', 0, [['haco', 'Форма yo в дієслова hacer неправильна: hago.']]), vslot('s2', ERP, 'leer', 3)],
  tr: 'Щосуботи я займаюся спортом, а ми читаємо газету вдома.',
});

const TEXT = 'Pablo es profesor y vive en Bilbao. Siempre se levanta temprano. Primero desayuna con su hija y después va a la escuela en autobús. Por la tarde corre en el parque. Los domingos nunca trabaja.';
k.choice({
  n: 3,
  role: 'transfer',
  fam: 'a104c.text-pablo',
  t: [RR],
  ins: 'Прочитай текст. Що Пабло робить після сніданку?',
  p: [TEXT],
  o: [
    ['Бігає в парку.', false],
    ['Їде до школи автобусом.', true],
    ['Відпочиває вдома.', false],
  ],
});
k.choice({
  n: 4,
  role: 'transfer',
  fam: 'a104c.text-pablo',
  t: [RR],
  ins: 'Прочитай текст. Що правда про неділю?',
  p: [TEXT],
  o: [
    ['Пабло ніколи не працює в неділю.', true],
    ['Пабло завжди працює в неділю.', false],
    ['Пабло встає пізно щонеділі.', false],
  ],
});

const SCRIPT = 'Mi padre nunca desayuna en casa. Primero va al trabajo y después toma un café con sus amigos.';
const c = k.clip({
  id: 'clip.a1-04.routine.padre',
  kind: 'text',
  es: SCRIPT,
  uk: 'Мій тато ніколи не снідає вдома. Спочатку він іде на роботу, а потім п’є каву з друзями.',
  t: [LR],
  fam: 'a104c.l-father',
});
k.choice({
  n: 5,
  role: 'transfer',
  fam: 'a104c.l-father',
  t: [LR],
  clips: [c],
  ins: 'Послухай запис. Що тато робить після того, як приходить на роботу?',
  o: [
    ['Снідає вдома.', false],
    ['П’є каву з друзями.', true],
    ['Іде додому.', false],
  ],
  hints: [hTranscript([LR], SCRIPT)],
});
k.rubric({
  n: 6,
  role: 'transfer',
  fam: 'a104c.write-morning',
  t: [WR],
  ins: 'Напиши 3 речення іспанською про свій ранок: що ти робиш і в якій послідовності. Зразок у підказці — лише приклад.',
  crit: [
    'Є 3 речення про ранок.',
    'Дієслова в теперішньому часі узгоджені з особою; у зворотних дієсловах є займенник (me levanto).',
    'Є слова послідовності (primero, después, luego, por último).',
    'Відповідь може відрізнятися від прикладу: перевіряється зміст і вивчені форми.',
  ],
  exm: ['Me levanto temprano. Primero me ducho y después desayuno. Luego voy al trabajo.'],
});

const ref = (lesson: string, ...nums: number[]): string[] => nums.map((n) => `${lesson}-T${String(n).padStart(2, '0')}`);

export default k.build({
  kind: 'optional-check',
  title: 'Перевір себе: дії та розпорядок дня',
  termEs: 'repaso: presente y rutina',
  summary:
    'Необов’язкова змішана перевірка блоку: форми дієслів на -ar, -er, -ir, ir і hacer, зворотні дієслова, частотність і послідовність — на нових прикладах. Кожна навичка отримує окремий результат; спільної оцінки «пройдено / не пройдено» немає.',
  objectives: ['A1-04-O1', 'A1-04-O2', 'A1-04-O3', 'A1-04-O4', 'A1-04-O5', 'A1-04-O6', 'A1-04-O7'],
  situations: ['routine-study-leisure'],
  minutes: 18,
  introduces: [],
  revisits: [
    'present.regular-ar',
    'present.regular-ar.plural',
    'prep.con.company',
    'present.regular-er',
    'present.regular-er.plural',
    'present.regular-ir',
    'present.regular-ir.plural',
    'contrast.er-ir-endings',
    'present.ir',
    'present.hacer',
    'prep.a.destination',
    'article.contraction-al',
    'reflexive.pronouns',
    'reflexive.placement',
    'time.parts-of-day',
    'time.frequency.adverbs',
    'neg.nunca',
    'time.frequency.expressions',
    'link.sequence',
    'reading.routine-text',
    'writing.routine',
    'listening.routine',
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Як працює перевірка',
      blocks: [
        uk('Це необов’язкова перевірка без нових правил. Завдання — нові, яких не було в уроках. Підказки доступні, але завдання з підказкою зараховується як виконане з підтримкою.'),
        uk('Кожна навичка отримує окремий результат. Помилка в одній формі не означає, що весь теперішній час «не вивчено»: після перевірки ти побачиш, що варто повторити.'),
      ],
    },
    { kind: 'self-check', title: 'Частина 1. Дієслова на -ar, -er, -ir', tasks: [...ref('A1-04-L1', 11, 12, 26), ...ref('A1-04-L2', 11, 12, 26, 27, 37)] },
    { kind: 'self-check', title: 'Частина 2. Ir, hacer, куди і зворотні дієслова', tasks: [...ref('A1-04-L3', 7, 17, 27, 37), ...ref('A1-04-L4', 7, 18), k.id(1), k.id(2)] },
    { kind: 'self-check', title: 'Частина 3. Як часто і в якій послідовності', tasks: [...ref('A1-04-L5', 7, 19, 32, 44), ...ref('A1-04-L6', 7)] },
    { kind: 'reading', title: 'Частина 4. Читання', blocks: [es(TEXT)], tasks: [k.id(3), k.id(4)] },
    { kind: 'listening', title: 'Частина 5. Слухання', required: false, clips: [c], tasks: [k.id(5)] },
    { kind: 'writing', title: 'Частина 6. Письмо', required: false, tasks: [k.id(6)] },
  ],
});
