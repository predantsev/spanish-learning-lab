// A2-03-C1 — optional mixed check (no new teaching, no locks). Its steps reuse held-out
// (delayed/transfer) tasks of L1–L7, one or more per skill, plus four check-owned transfer items in
// a new context family. Validator warnings lesson.foreign-task / lesson.held-out-in-step are expected
// here by design: the check is where the held-out bank is meant to be used.
// The module also carries the block's topic material (Materials in topic).
import { SENTENCE, choice, es, esTable, exact, lesson, link, material, step, uk, ukList } from './lib.mjs';
import { HABER_TABLE } from './a2-03-l1.mjs';

const L = 'A2-03-C1';
const t = (lessonNo, n) => `A2-03-L${lessonNo}-T${String(n).padStart(2, '0')}`;
const own = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const tasks = [
  exact({
    id: 'T01', lesson: L, role: 'transfer', family: 'c1-mixed', target: ['perfecto.haber-forms', 'written-form'],
    prompt: [uk('Повідомлення в груповому чаті. Впишіть пропущену форму дієслова haber.'), es('¡Hola, chicos! ¿___ (vosotros) visto mi mensaje?')],
    answers: ['habéis'], closed: true,
    errors: [
      ['habeis', 'Майже: habéis пишемо зі знаком наголосу на é.'],
      ['han', 'Han — для ellos / ellas / ustedes. До друзів на vosotros — habéis.'],
      ['has', 'Has — для однієї особи (tú). Звертаються до кількох друзів: habéis.'],
    ],
    rule: 'Haber у теперішньому часі: he, has, ha, hemos, habéis, han. Vosotros — habéis.',
    full: '¡Hola, chicos! ¿Habéis visto mi mensaje?', fullUk: 'Привіт усім! Ви бачили моє повідомлення?',
    ok: 'Правильно: vosotros habéis visto.', bad: 'Для vosotros потрібна форма habéis: ¿Habéis visto mi mensaje?',
  }),
  choice({
    id: 'T02', lesson: L, role: 'transfer', family: 'c1-mixed', target: ['perfecto.choice-context', 'context-choice'],
    prompt: [uk('Оберіть форму, яка підходить до контексту.'), es('—¿Vamos al museo esta tarde? —No, gracias: ya lo ___ dos veces este año.')],
    options: [
      ['he visto', true],
      ['voy a ver', false, 'Voy a ver — план. Ya і dos veces este año говорять про те, що вже відбулося: he visto.'],
      ['veo', false, 'Veo — теперішній час. Людина розповідає про свій досвід цього року: he visto.'],
    ],
    rule: 'Досвід або дія в періоді, що ще триває (este año), — perfecto; план — ir a + інфінітив; звичка — теперішній час.',
    full: '—¿Vamos al museo esta tarde? —No, gracias: ya lo he visto dos veces este año.', fullUk: '—Ходімо сьогодні по обіді в музей? —Ні, дякую: цього року я вже двічі його бачив(-ла).',
    ok: 'Правильно: ya lo he visto.', bad: 'Ідеться про досвід цього року: ya lo he visto dos veces.',
  }),
  choice({
    id: 'T03', lesson: L, role: 'transfer', family: 'c1-mixed', target: ['reading.perfecto-account', 'reading-meaning'],
    prompt: [
      uk('Прочитайте повідомлення і дайте відповідь.'),
      es('¡Hola, Ana! Esta semana ha sido muy interesante. He terminado el trabajo, he ido dos veces al cine y he cenado con mis amigos. Pero todavía no he escrito a mi madre. Un beso, Pablo.'),
      uk('Чого Пабло ще не зробив?'),
    ],
    options: [
      ['Не написав мамі.', true],
      ['Не закінчив роботу.', false],
      ['Не ходив у кіно.', false],
    ],
    rule: 'Todavía no + perfecto — чого ще не зроблено.',
    full: 'Pero todavía no he escrito a mi madre.', fullUk: 'Але я ще не написав мамі.',
    ok: 'Правильно.', bad: 'Ні. У тексті: «todavía no he escrito a mi madre» — він ще не написав мамі.',
  }),
  exact({
    id: 'T04', lesson: L, role: 'transfer', family: 'c1-mixed', target: ['perfecto.participle-invariance', 'written-form'],
    prompt: [uk('Впишіть дієприкметник дієслова в дужках.'), es('Hoy mis hermanas han ___ (hacer) la cena.')],
    answers: ['hecho'], closed: false, policy: SENTENCE,
    errors: [
      ['hechas', 'Після haber дієприкметник не узгоджується з підметом: han hecho.'],
      ['hecha', 'Після haber дієприкметник не узгоджується з додатком la cena: han hecho.'],
    ],
    rule: 'Після haber дієприкметник завжди закінчується на -o: han hecho, han comido.',
    full: 'Hoy mis hermanas han hecho la cena.', fullUk: 'Сьогодні мої сестри приготували вечерю.',
    ok: 'Правильно: han hecho.', bad: 'Після haber — hecho: Hoy mis hermanas han hecho la cena.',
    unresolved: 'Тут перевіряємо узгодження дієприкметника. Цю відповідь автоматично не оцінюємо — порівняйте зі зразком: han hecho.',
  }),
];

const BLOCK_SKILLS = [
  'perfecto.haber-forms', 'perfecto.haber-vs-hay', 'participle.regular-ar', 'participle.regular-er-ir', 'contrast.gerund-participle',
  'participle.hecho', 'participle.dicho', 'participle.escrito', 'participle.visto', 'participle.puesto', 'participle.vuelto',
  'participle.abierto', 'participle.roto', 'participle.muerto', 'participle.ido-accent', 'perfecto.word-order',
  'perfecto.pronoun-placement', 'perfecto.participle-invariance', 'listening.perfecto-sentences', 'perfecto.use-current-period',
  'perfecto.use-experience', 'perfecto.choice-context', 'reading.perfecto-account', 'listening.perfecto-account', 'writing.perfecto-account',
];

const materials = [
  material({
    id: 'material.a2-03.perfecto-reference',
    topicId: 'A2-03',
    titleUk: 'Pretérito perfecto compuesto: довідка',
    blocks: [
      uk('Pretérito perfecto compuesto = haber у теперішньому часі + дієприкметник. Особу показує лише haber.'),
      HABER_TABLE,
      uk('Правильні дієприкметники: -ar → -ado, -er / -ir → -ido. Після a, e, o — -ído зі знаком наголосу.'),
      esTable(['infinitivo', 'participio'], [
        ['hablar', 'hablado'], ['comer', 'comido'], ['vivir', 'vivido'], ['ser / ir', 'sido / ido'], ['leer / traer / oír', 'leído / traído / oído'],
      ]),
      uk('Особливі дієприкметники — кожен треба запам’ятати окремо:'),
      esTable(['infinitivo', 'participio'], [
        ['hacer', 'hecho'], ['decir', 'dicho'], ['escribir', 'escrito'], ['ver', 'visto'], ['poner', 'puesto'],
        ['volver', 'vuelto'], ['abrir', 'abierto'], ['romper', 'roto'], ['morir', 'muerto'],
      ]),
      ukList([
        'No і займенники — перед haber: No lo he visto. Me he levantado tarde.',
        'Між haber і дієприкметником нічого не ставимо.',
        'Після haber дієприкметник не змінюється: Ana ha comido, he comprado dos botellas.',
        'Perfecto: дія в періоді, що ще триває (hoy, esta semana, este año), і досвід (alguna vez, nunca, ya, todavía no).',
      ]),
      link('Потренувати форми haber', [['perfecto.haber-forms', 'written-form'], ['perfecto.haber-vs-hay', 'written-form']]),
      link('Потренувати дієприкметники', [
        ['participle.regular-ar', 'written-form'], ['participle.regular-er-ir', 'written-form'], ['participle.ido-accent', 'written-form'],
        ['participle.hecho', 'written-form'], ['participle.dicho', 'written-form'], ['participle.escrito', 'written-form'], ['participle.visto', 'written-form'],
        ['participle.puesto', 'written-form'], ['participle.vuelto', 'written-form'], ['participle.abierto', 'written-form'], ['participle.roto', 'written-form'],
        ['participle.muerto', 'written-form'],
      ], 'written', 12),
      link('Потренувати порядок слів і вживання', [
        ['perfecto.word-order', 'construction-use'], ['perfecto.pronoun-placement', 'construction-use'], ['perfecto.choice-context', 'context-choice'],
        ['perfecto.use-current-period', 'construction-use'], ['perfecto.use-experience', 'construction-use'],
      ]),
    ],
    linkedTargets: [
      'perfecto.haber-forms/written-form', 'perfecto.haber-vs-hay/written-form', 'participle.regular-ar/written-form', 'participle.regular-er-ir/written-form',
      'participle.ido-accent/written-form', 'participle.hecho/written-form', 'participle.dicho/written-form', 'participle.escrito/written-form',
      'participle.visto/written-form', 'participle.puesto/written-form', 'participle.vuelto/written-form', 'participle.abierto/written-form',
      'participle.roto/written-form', 'participle.muerto/written-form', 'perfecto.word-order/construction-use', 'perfecto.pronoun-placement/construction-use',
      'perfecto.participle-invariance/written-form', 'perfecto.choice-context/context-choice', 'perfecto.use-current-period/construction-use',
      'perfecto.use-experience/construction-use',
    ],
  }),
];

export default {
  lesson: lesson({
    id: L,
    kind: 'optional-check',
    titleUk: 'Перевірка за бажанням: pretérito perfecto compuesto',
    termEs: 'pretérito perfecto compuesto: repaso',
    summaryUk:
      'Необов’язкова змішана перевірка блоку: haber, правильні й особливі дієприкметники, знак наголосу, порядок слів, вживання часу, читання, слухання і письмо. Нового матеріалу немає; кожну частину можна пройти окремо і будь-коли.',
    objectives: ['A2-03-O1', 'A2-03-O2', 'A2-03-O3', 'A2-03-O4', 'A2-03-O5', 'A2-03-O6', 'A2-03-O7', 'A2-03-O8', 'A2-03-O9'],
    situations: ['routine-study-leisure', 'people-family-home', 'personal-messages', 'food-shopping'],
    estimatedMinutes: 20,
    introduces: [],
    revisits: BLOCK_SKILLS,
    steps: [
      step('s1', 'self-check', 'Haber і правильні дієприкметники', false, {
        blocks: [uk('Ця перевірка необов’язкова і нічого не блокує. Відповідайте без підказок, якщо можете; підказки й відповідь можна відкрити будь-коли.')],
        taskIds: [own(1), t(1, 10), t(1, 16), t(1, 20), t(2, 9), t(2, 20), t(2, 26), t(2, 30)],
      }),
      step('s2', 'self-check', 'Особливі дієприкметники', false, {
        taskIds: [t(3, 10), t(3, 19), t(3, 29), t(3, 39), t(3, 49), t(3, 59), t(3, 69), t(3, 79), t(3, 89)],
      }),
      step('s3', 'self-check', 'Знак наголосу і будова речення', false, {
        taskIds: [t(4, 9), t(5, 6), t(5, 10), t(5, 16), t(5, 20), t(5, 26), t(5, 30), own(4)],
      }),
      step('s4', 'self-check', 'Коли доречний perfecto', false, {
        taskIds: [t(6, 4), t(6, 8), t(6, 12), t(6, 16), t(6, 24), own(2)],
      }),
      step('s5', 'self-check', 'Читання, слухання, письмо', false, {
        taskIds: [own(3), t(7, 6), t(5, 34), t(7, 10), t(7, 14)],
      }),
      step('s6', 'summary', 'Що далі', false, {
        blocks: [
          uk('Результати кожного завдання зберігаються окремо для своєї навички: помилка в одному дієприкметнику не скасовує інших успіхів. Те, що далося важко, повернеться в повтореннях.'),
          uk('Далі — простий минулий час (pretérito indefinido) і його порівняння з perfecto.'),
        ],
      }),
    ],
  }),
  tasks,
  materials,
};
