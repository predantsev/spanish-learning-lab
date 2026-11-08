// A2-04-C1 — optional mixed check (no new teaching, no locks). Its steps reuse held-out
// (delayed/transfer) tasks of A2-04-L1…L8, one or more per skill, plus four check-owned transfer
// items in a new context family. Validator warnings lesson.foreign-task / lesson.held-out-in-step are
// expected here by design. The module also carries the block's topic material (Materials in topic).
import { choice, es, esTable, exact, lesson, link, material, step, uk, ukList } from './lib.mjs';
import { AR_TABLE } from './a2-04-l1.mjs';
import { ERIR_TABLE } from './a2-04-l2.mjs';
import { SER_IR_TABLE } from './a2-04-l6.mjs';

const L = 'A2-04-C1';
const t = (lessonNo, n) => `A2-04-L${lessonNo}-T${String(n).padStart(2, '0')}`;
const own = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const tasks = [
  exact({
    id: 'T01', lesson: L, role: 'transfer', family: 'c1-mixed', target: ['indefinido.regular-ar', 'written-form'],
    prompt: [uk('Повідомлення в груповому чаті. Впишіть дієслово в дужках у простому минулому часі.'), es('¡Hola, chicos! ¿(vosotros, hablar) ___ ayer con la profesora?')],
    answers: ['hablasteis'], closed: true,
    errors: [
      ['hablastes', 'Для vosotros — hablasteis.'],
      ['hablásteis', 'Майже: hablasteis пишемо без знака наголосу.'],
      ['habláis', 'Habláis — теперішній час. Ідеться про вчора: hablasteis.'],
    ],
    rule: 'Простий минулий час дієслів на -ar: -é, -aste, -ó, -amos, -asteis, -aron. Vosotros — hablasteis.',
    full: '¡Hola, chicos! ¿Hablasteis ayer con la profesora?', fullUk: 'Привіт усім! Ви вчора говорили з викладачкою?',
    ok: 'Правильно: hablasteis.', bad: 'Для vosotros потрібна форма hablasteis: ¿Hablasteis ayer con la profesora?',
  }),
  choice({
    id: 'T02', lesson: L, role: 'transfer', family: 'c1-mixed', target: ['contrast.perfecto-indefinido', 'context-choice'],
    prompt: [uk('Сьогодні понеділок. Оберіть форму, природну для мовлення більшої частини Іспанії.'), es('—¿Qué tal el fin de semana? —Muy bien: el domingo ___ con mis padres en un restaurante.')],
    options: [
      ['comí', true],
      ['he comido', false, 'Неділя вже минула, і вихідні закінчилися: comí.'],
      ['voy a comer', false, 'Voy a comer — план. Питають про минулі вихідні: comí.'],
    ],
    rule: 'Період, що ще триває (hoy, esta semana), — perfecto; період, що вже закінчився (el domingo, la semana pasada), — простий минулий час.',
    full: '—¿Qué tal el fin de semana? —Muy bien: el domingo comí con mis padres en un restaurante.',
    fullUk: '—Як минули вихідні? —Дуже добре: у неділю я обідав(-ла) з батьками в ресторані.',
    ok: 'Правильно: el domingo comí.', bad: 'Неділя вже минула: el domingo comí.',
  }),
  exact({
    id: 'T03', lesson: L, role: 'transfer', family: 'c1-mixed', target: ['indefinido.ser-ir', 'written-form'],
    prompt: [uk('Впишіть дієслово в дужках у простому минулому часі.'), es('Anoche mis amigos y yo (ir) ___ a un concierto.')],
    answers: ['fuimos'], closed: true,
    errors: [
      ['fueron', 'Підмет — mis amigos y yo, тобто «ми»: fuimos.'],
      ['vamos', 'Vamos — теперішній час. Anoche — «учора ввечері»: fuimos.'],
      ['fuímos', 'Майже: fuimos пишемо без знака наголосу.'],
    ],
    rule: 'Ser та ir у простому минулому: fui, fuiste, fue, fuimos, fuisteis, fueron.',
    full: 'Anoche mis amigos y yo fuimos a un concierto.', fullUk: 'Учора ввечері ми з друзями ходили на концерт.',
    ok: 'Правильно: fuimos.', bad: 'Mis amigos y yo = «ми»: fuimos.',
  }),
  choice({
    id: 'T04', lesson: L, role: 'transfer', family: 'c1-mixed', target: ['reading.past-sequence', 'reading-meaning'],
    prompt: [
      uk('Прочитайте повідомлення і дайте відповідь.'),
      es('¡Hola, Ana! Ayer fue un día muy largo. Primero fui al médico y después tuve clase. Por la tarde hice la compra y al final cené con Pablo. Un beso, Marta.'),
      uk('Що Марта зробила після заняття?'),
    ],
    options: [
      ['Купила продукти.', true],
      ['Ходила до лікаря.', false],
      ['Повечеряла з Пабло.', false],
    ],
    rule: 'Читаючи, стежимо за словами послідовності: primero, después, por la tarde, al final.',
    full: 'Por la tarde hice la compra.', fullUk: 'По обіді я купила продукти.',
    ok: 'Правильно.', bad: 'Ні. Після заняття, по обіді, вона купила продукти: «Por la tarde hice la compra».',
  }),
];

const BLOCK_SKILLS = [
  'indefinido.regular-ar', 'time.past-markers', 'indefinido.regular-er-ir', 'indefinido.nosotros-syncretism', 'listening.past-events',
  'indefinido.spelling-car', 'indefinido.spelling-gar', 'indefinido.spelling-zar', 'ortho.indefinido-accent', 'indefinido.stem-e-i',
  'indefinido.stem-o-u', 'indefinido.stem-change-boundary', 'indefinido.y-alternation', 'indefinido.strong-endings', 'indefinido.tener',
  'indefinido.estar', 'indefinido.poder', 'indefinido.poner', 'indefinido.hacer', 'indefinido.venir', 'indefinido.querer',
  'indefinido.decir', 'indefinido.dar', 'indefinido.ver', 'indefinido.ser-ir', 'contrast.fue-ser-ir', 'indefinido.use-completed-event',
  'time.hace-ago', 'contrast.perfecto-indefinido', 'link.past-sequence', 'reading.past-sequence', 'listening.past-sequence', 'writing.past-sequence',
];

const materials = [
  material({
    id: 'material.a2-04.indefinido-reference',
    topicId: 'A2-04',
    titleUk: 'Pretérito indefinido: довідка',
    blocks: [
      uk('Простий минулий час (pretérito indefinido) описує завершені події в минулому моменті або періоді, який уже закінчився: ayer, anoche, el sábado pasado, en 2020, hace dos días.'),
      uk('Правильні дієслова. У формах yo і él / ella / usted — знак наголосу.'),
      AR_TABLE,
      ERIR_TABLE,
      uk('Зміни в написанні — лише у формі yo:'),
      esTable(['infinitivo', 'yo', 'él / ella'], [['sacar', 'saqué', 'sacó'], ['llegar', 'llegué', 'llegó'], ['empezar', 'empecé', 'empezó']]),
      uk('Зміни в основі дієслів на -ir і форми з y — лише в 3-й особі однини й множини:'),
      esTable(['infinitivo', 'él / ella', 'ellos / ellas'], [['pedir', 'pidió', 'pidieron'], ['dormir', 'durmió', 'durmieron'], ['leer', 'leyó', 'leyeron']]),
      uk('Особливі основи. Закінчення -e, -iste, -o, -imos, -isteis, -ieron; форми yo і él / ella — без знака наголосу:'),
      esTable(['infinitivo', 'yo', 'él / ella'], [
        ['tener', 'tuve', 'tuvo'], ['estar', 'estuve', 'estuvo'], ['poder', 'pude', 'pudo'], ['poner', 'puse', 'puso'],
        ['hacer', 'hice', 'hizo'], ['venir', 'vine', 'vino'], ['querer', 'quise', 'quiso'], ['decir', 'dije', 'dijo'],
        ['dar', 'di', 'dio'], ['ver', 'vi', 'vio'],
      ]),
      uk('Ser та ir мають однакові форми; значення показує контекст (a + місце — ir):'),
      SER_IR_TABLE,
      ukList([
        'Hace + проміжок часу — «тому»: Llegué hace dos días.',
        'Perfecto — період, що ще триває (hoy, esta semana), або досвід без дати; простий минулий — період, що закінчився (ayer, la semana pasada).',
        'Події по черзі: primero, después, luego, al final, al día siguiente, por fin.',
      ]),
      link('Потренувати правильні форми', [
        ['indefinido.regular-ar', 'written-form'], ['indefinido.regular-er-ir', 'written-form'], ['ortho.indefinido-accent', 'written-form'],
        ['indefinido.spelling-car', 'written-form'], ['indefinido.spelling-gar', 'written-form'], ['indefinido.spelling-zar', 'written-form'],
      ]),
      link('Потренувати особливі форми', [
        ['indefinido.stem-e-i', 'written-form'], ['indefinido.stem-o-u', 'written-form'], ['indefinido.y-alternation', 'written-form'],
        ['indefinido.tener', 'written-form'], ['indefinido.estar', 'written-form'], ['indefinido.poder', 'written-form'],
        ['indefinido.poner', 'written-form'], ['indefinido.hacer', 'written-form'], ['indefinido.venir', 'written-form'],
        ['indefinido.querer', 'written-form'], ['indefinido.decir', 'written-form'], ['indefinido.dar', 'written-form'],
        ['indefinido.ver', 'written-form'], ['indefinido.ser-ir', 'written-form'],
      ], 'written', 14),
      link('Потренувати вживання', [
        ['indefinido.use-completed-event', 'construction-use'], ['time.hace-ago', 'construction-use'],
        ['contrast.perfecto-indefinido', 'context-choice'], ['contrast.fue-ser-ir', 'context-choice'], ['link.past-sequence', 'construction-use'],
      ]),
    ],
    linkedTargets: [
      'indefinido.regular-ar/written-form', 'indefinido.regular-er-ir/written-form', 'ortho.indefinido-accent/written-form',
      'indefinido.spelling-car/written-form', 'indefinido.spelling-gar/written-form', 'indefinido.spelling-zar/written-form',
      'indefinido.stem-e-i/written-form', 'indefinido.stem-o-u/written-form', 'indefinido.y-alternation/written-form',
      'indefinido.strong-endings/written-form', 'indefinido.tener/written-form', 'indefinido.estar/written-form', 'indefinido.poder/written-form',
      'indefinido.poner/written-form', 'indefinido.hacer/written-form', 'indefinido.venir/written-form', 'indefinido.querer/written-form',
      'indefinido.decir/written-form', 'indefinido.dar/written-form', 'indefinido.ver/written-form', 'indefinido.ser-ir/written-form',
      'indefinido.use-completed-event/construction-use', 'time.hace-ago/construction-use', 'contrast.perfecto-indefinido/context-choice',
      'contrast.fue-ser-ir/context-choice', 'link.past-sequence/construction-use',
    ],
  }),
];

export default {
  lesson: lesson({
    id: L,
    kind: 'optional-check',
    titleUk: 'Перевірка за бажанням: pretérito indefinido',
    termEs: 'pretérito indefinido: repaso',
    summaryUk:
      'Необов’язкова змішана перевірка блоку: правильні форми, зміни в написанні, особливі дієслова, ser та ir, вживання часу, hace, читання, слухання і письмо. Нового матеріалу немає; кожну частину можна пройти окремо і будь-коли.',
    objectives: ['A2-04-O1', 'A2-04-O2', 'A2-04-O3', 'A2-04-O4', 'A2-04-O5', 'A2-04-O6', 'A2-04-O7', 'A2-04-O8', 'A2-04-O9', 'A2-04-O10'],
    situations: ['routine-study-leisure', 'personal-messages', 'time-appointments-transport', 'places-accommodation'],
    estimatedMinutes: 20,
    introduces: [],
    revisits: BLOCK_SKILLS,
    steps: [
      step('s1', 'self-check', 'Правильні форми і знак наголосу', false, {
        blocks: [uk('Ця перевірка необов’язкова і нічого не блокує. Відповідайте без підказок, якщо можете; підказки й відповідь можна відкрити будь-коли.')],
        taskIds: [own(1), t(1, 7), t(1, 15), t(2, 9), t(3, 35), t(3, 39)],
      }),
      step('s2', 'self-check', 'Зміни в написанні та основі', false, {
        taskIds: [t(3, 8), t(3, 18), t(3, 28), t(4, 8), t(4, 18), t(4, 28), t(4, 38)],
      }),
      step('s3', 'self-check', 'Особливі дієслова', false, {
        taskIds: [t(5, 7), t(5, 17), t(5, 27), t(5, 37), t(5, 47), t(5, 57), t(5, 67), t(5, 77), t(5, 87), t(5, 97), t(5, 107), own(3)],
      }),
      step('s4', 'self-check', 'Fue: ser чи ir; коли вживаємо простий минулий', false, {
        taskIds: [t(6, 8), t(6, 15), t(6, 19), t(7, 3), t(7, 7), t(7, 11), t(7, 15), t(7, 19), t(7, 23), own(2)],
      }),
      step('s5', 'self-check', 'Читання, слухання, письмо', false, {
        taskIds: [t(8, 3), t(8, 7), own(4), t(8, 12), t(2, 12), t(8, 14), t(8, 16), t(8, 20)],
      }),
      step('s6', 'summary', 'Що далі', false, {
        blocks: [
          uk('Результати кожного завдання зберігаються окремо для своєї навички: помилка в одній формі не скасовує інших успіхів. Те, що далося важко, повернеться в повтореннях.'),
          uk('Далі — pretérito imperfecto: як описувати минуле і звички в минулому.'),
        ],
      }),
    ],
  }),
  tasks,
  materials,
};
