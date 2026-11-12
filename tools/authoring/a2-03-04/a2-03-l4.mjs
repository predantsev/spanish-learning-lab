// A2-03-L4 — written accent in -ído participles (A2-03-O4): leído, traído, oído, creído, caído.
// Two extra boundary tasks (T11, T12) revisit participle.regular-er-ir so the mark is not
// over-applied to comido / vivido.
import { choice, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-03-L4';
const ACC = ['participle.ido-accent', 'written-form'];
const ERIR = ['participle.regular-er-ir', 'written-form'];
const INSTR = 'Впишіть дієприкметник дієслова в дужках. Стежте за знаком наголосу.';
const RULE = 'Якщо основа дієслова закінчується на a, e або o, у закінченні -ido над i пишемо знак наголосу: leer → leído, traer → traído, oír → oído, creer → creído, caer → caído. Знак показує, що í — окремий склад: le-í-do.';
const ERIR_RULE = 'Якщо основа закінчується на приголосну, знак наголосу в -ido не потрібен: comer → comido, vivir → vivido. Знак пишемо тільки після a, e, o: leído.';
const NO_MARK = (p) => `Майже: над i потрібен знак наголосу — ${p}. Інакше голосні злилися б в один склад.`;
const GERUND = (g, p) => `${g} — форма gerundio (на -ando / -iendo), вона йде після estar. Після haber потрібен дієприкметник: ${p}.`;
const AGREE = (p) => `Після haber дієприкметник не змінюється і завжди закінчується на -o: ${p}.`;

function gap(id, role, family, target, rule, sentence, answer, errors, full, fullUk, extra = {}) {
  const prompt = [uk(extra.instr ?? (extra.model ? `${INSTR} Зразок нижче.` : INSTR))];
  if (extra.model) prompt.push(ex(...extra.model));
  prompt.push(es(sentence));
  return exact({
    id, lesson: L, role, family, target, prompt, answers: [answer], closed: true, errors,
    rule, clue: extra.clue, glosses: extra.glosses, full, fullUk,
    ok: extra.ok ?? `Правильно: ${answer}.`,
    bad: extra.bad ?? `Правильна форма — ${answer}: ${full}`,
  });
}

const MODEL = ['Hoy he leído el periódico. (leer)', 'Сьогодні я прочитав(-ла) газету.'];

const tasks = [
  gap('T01', 'supported', 'home', ACC, RULE, '¿Has ___ (leer) mi mensaje?', 'leído',
    [['leido', NO_MARK('leído')], ['leyendo', GERUND('Leyendo', 'leído')], ['leída', AGREE('leído')]],
    '¿Has leído mi mensaje?', 'Ти прочитав(-ла) моє повідомлення?', { model: MODEL, clue: 'Основа le- закінчується на e.' }),
  gap('T02', 'supported', 'shopping', ACC, RULE, 'Ana ha ___ (traer) pan y fruta.', 'traído',
    [['traido', NO_MARK('traído')], ['trayendo', GERUND('Trayendo', 'traído')]],
    'Ana ha traído pan y fruta.', 'Ана принесла хліб і фрукти.', { model: MODEL, clue: 'Основа tra- закінчується на a.' }),
  gap('T03', 'independent', 'home', ACC, RULE, 'Hoy (nosotros) no hemos ___ (oír) el móvil.', 'oído',
    [['oido', NO_MARK('oído')], ['oyendo', GERUND('Oyendo', 'oído')]],
    'Hoy no hemos oído el móvil.', 'Сьогодні ми не почули мобільного.'),
  gap('T04', 'independent', 'shopping', ACC, RULE, '¿Qué habéis ___ (traer) del supermercado?', 'traído',
    [['traido', NO_MARK('traído')], ['trayendo', GERUND('Trayendo', 'traído')]],
    '¿Qué habéis traído del supermercado?', 'Що ви принесли із супермаркету?'),
  gap('T05', 'independent', 'home', ACC, RULE, 'Hoy he ___ (leer) un libro muy interesante.', 'leído',
    [['leido', NO_MARK('leído')], ['leyendo', GERUND('Leyendo', 'leído')]],
    'Hoy he leído un libro muy interesante.', 'Сьогодні я прочитав(-ла) дуже цікаву книжку.'),
  choice({
    id: 'T06', lesson: L, role: 'independent', family: 'home', target: ACC,
    prompt: [uk('Оберіть правильно написаний дієприкметник.'), es('Hoy el niño se ha ___ en el parque.')],
    options: [
      ['caído', true],
      ['caido', false, NO_MARK('caído')],
      ['cayendo', false, GERUND('Cayendo', 'caído')],
      ['caída', false, AGREE('caído')],
    ],
    rule: RULE, glosses: ['se ha caído — упав (дієслово caerse, «падати»).'],
    full: 'Hoy el niño se ha caído en el parque.', fullUk: 'Сьогодні хлопчик упав у парку.',
    ok: 'Правильно: caído, зі знаком наголосу.', bad: 'Правильно — caído: Hoy el niño se ha caído en el parque.',
  }),
  gap('T07', 'delayed', 'home', ACC, RULE, 'Nadie ha ___ (creer) a Pedro.', 'creído',
    [['creido', NO_MARK('creído')], ['creyendo', GERUND('Creyendo', 'creído')]],
    'Nadie ha creído a Pedro.', 'Ніхто не повірив Педро.', { glosses: ['creer a alguien — вірити комусь.'] }),
  gap('T08', 'delayed', 'shopping', ACC, RULE, '¿Has ___ (traer) la leche?', 'traído',
    [['traido', NO_MARK('traído')], ['trayendo', GERUND('Trayendo', 'traído')]],
    '¿Has traído la leche?', 'Ти приніс(-ла) молоко?'),
  gap('T09', 'transfer', 'messages', ACC, RULE, '¡Hola, Luis! ¿Has ___ (leer) mi correo electrónico?', 'leído',
    [['leido', NO_MARK('leído')], ['leyendo', GERUND('Leyendo', 'leído')]],
    '¡Hola, Luis! ¿Has leído mi correo electrónico?', 'Привіт, Луїсе! Ти прочитав мій електронний лист?', { instr: `Повідомлення. ${INSTR}` }),
  gap('T10', 'transfer', 'work-study', ACC, RULE, 'Hoy en la oficina no hemos ___ (oír) nada.', 'oído',
    [['oido', NO_MARK('oído')], ['oyendo', GERUND('Oyendo', 'oído')]],
    'Hoy en la oficina no hemos oído nada.', 'Сьогодні в офісі ми нічого не чули.'),
  // Boundary: no mark after a consonant (revisits participle.regular-er-ir).
  gap('T11', 'independent', 'home', ERIR, ERIR_RULE, 'Hoy (yo) he ___ (comer) en casa.', 'comido',
    [['comído', 'Тут знак наголосу не потрібен: основа com- закінчується на приголосну. Правильно — comido.'], ['comiendo', GERUND('Comiendo', 'comido')]],
    'Hoy he comido en casa.', 'Сьогодні я обідав(-ла) вдома.'),
  gap('T12', 'independent', 'home', ERIR, ERIR_RULE, 'Mis padres han ___ (vivir) aquí muchos años.', 'vivido',
    [['vivído', 'Тут знак наголосу не потрібен: основа viv- закінчується на приголосну. Правильно — vivido.'], ['viviendo', GERUND('Viviendo', 'vivido')]],
    'Mis padres han vivido aquí muchos años.', 'Мої батьки прожили тут багато років.'),
];

const ids = (...n) => n.map((x) => `${L}-T${String(x).padStart(2, '0')}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Знак наголосу в дієприкметниках: leído, traído, oído',
    termEs: 'participios en -ído',
    summaryUk:
      'Чому в leído, traído, oído, creído, caído над i пишемо знак наголосу, а в comido чи vivido — ні.',
    objectives: ['A2-03-O4'],
    situations: ['routine-study-leisure', 'food-shopping'],
    estimatedMinutes: 10,
    introduces: ['participle.ido-accent'],
    revisits: ['participle.regular-er-ir', 'ortho.written-accent.familiar-words', 'ortho.accented-vowels', 'perfecto.haber-forms'],
    steps: [
      step('s1', 'explanation', 'Коли пишемо -ído', true, {
        blocks: [
          uk('Деякі дієслова на -er / -ir мають основу, що закінчується на голосну a, e чи o: le-er, tra-er, o-ír. У їхньому дієприкметнику над i пишемо знак наголосу: -ído.'),
          esTable(['infinitivo', 'participio'], [['leer', 'leído'], ['traer', 'traído'], ['oír', 'oído'], ['creer', 'creído'], ['caer', 'caído']]),
          uk('Знак показує, що í вимовляється окремим наголошеним складом: le-í-do, tra-í-do, o-í-do. Без нього голосні злилися б в один склад.'),
          uk('Якщо основа закінчується на приголосну, знак не потрібен: comer → comido, vivir → vivido, salir → salido.'),
        ],
      }),
      step('s2', 'examples', 'Приклади', true, {
        blocks: [
          ex('Hoy he leído el periódico.', 'Сьогодні я прочитав(-ла) газету.'),
          ex('¿Has traído el pan?', 'Ти приніс(-ла) хліб?'),
          ex('No hemos oído el móvil.', 'Ми не почули мобільного.'),
          ex('Hoy el niño se ha caído en la calle.', 'Сьогодні хлопчик упав на вулиці.'),
          ex('Hoy he comido en casa.', 'Сьогодні я обідав(-ла) вдома. (без знака наголосу)'),
        ],
      }),
      step('s3', 'supported-practice', 'Практика зі зразком', true, { taskIds: ids(1, 2) }),
      step('s4', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(3, 4, 5, 6, 11, 12) }),
      step('s5', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'Основа на a, e, o → -ído: leído, traído, oído, creído, caído.',
            'Основа на приголосну → -ido без знака: comido, vivido.',
            'Знак наголосу тут обов’язковий: *leido — помилка.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
