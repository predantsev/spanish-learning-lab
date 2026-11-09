// A2-01-L5 — plans with ir a + infinitive; place vs plan after ir a; plan vs wish.
import { EX, LINK, LIST_UK, TABLE_ES, UK, choice, lesson as mkLesson, material, open, step } from '../lib.mjs';

const L = 'A2-01-L5';
const FUT = 'future-ir.ir-a-inf/construction-use';
const FUT_R = 'future-ir.ir-a-inf/reading-meaning';
const IR = 'present.ir/written-form';
const CPV_C = 'contrast.ir-a-place-vs-plan/context-choice';
const CPV_R = 'contrast.ir-a-place-vs-plan/reading-meaning';
const CPW_C = 'contrast.plan-vs-wish/context-choice';
const CPW_R = 'contrast.plan-vs-wish/reading-meaning';

const R = {
  fut: 'Ir у теперішньому часі + a + інфінітив виражає план чи намір: Mañana voy a estudiar. Змінюється лише ir (voy, vas, va, vamos, vais, van); a обов’язкове; друге дієслово — в інфінітиві.',
  cpv: 'Після ir a назва місця означає, куди ви йдете: Voy a la playa (a + el = al: Vamos al cine). Інфінітив означає план дії: Voy a nadar.',
  cpw: 'Ir a + інфінітив — план чи намір: Voy a comprar un coche. Querer + інфінітив — лише бажання: Quiero comprar un coche. Теперішній час із вказівкою часу теж може описувати домовленість: El sábado ceno con Ana.',
};

/** ir a + infinitive in one short answer; the construction and the ir form are attributed separately. */
function fut(id, role, family, es, uk, ir, inf, extra = {}) {
  const answer = `${ir} a ${inf}`;
  const err = [[`${ir} ${inf}`, { [FUT]: 'incorrect', [IR]: 'correct' }, `Після ir потрібне a: ${answer}.`]];
  if (extra.conj) err.push([`${ir} a ${extra.conj}`, { [FUT]: 'incorrect', [IR]: 'correct' }, `Після ir a друге дієслово стоїть в інфінітиві: ${answer}.`]);
  if (extra.person) err.push([`${extra.person} a ${inf}`, { [FUT]: 'correct', [IR]: 'incorrect' }, extra.personUk ?? `${extra.person} — форма іншої особи; тут потрібно ${ir}.`]);
  if (extra.accent) err.push([`${extra.accent} a ${inf}`, { [FUT]: 'correct', [IR]: 'incorrect' }, `${ir} — один склад, тому пишемо без знака наголосу.`]);
  return open(L, {
    id,
    role,
    family,
    ts: [FUT, IR],
    ask: extra.ask ?? 'Утворіть ir a + інфінітив і впишіть пропущені слова.',
    model: extra.model,
    es,
    uk,
    a: [answer],
    err,
    rule: R.fut,
    full: extra.full,
    ok: `Правильно: ${answer}.`,
    no: `Правильна відповідь: ${answer}.`,
  });
}

export const tasks = [
  fut('T01', 'supported', 'routine', 'Esta noche ___ (ir a + cenar, nosotros) en casa.', 'Сьогодні ввечері ми збираємося вечеряти вдома.', 'vamos', 'cenar', { ask: 'Подивіться на зразок, утворіть ir a + інфінітив і впишіть пропущені слова.', model: [['Mañana voy a estudiar.', 'Завтра я збираюся вчитися.']], conj: 'cenamos', full: 'Esta noche vamos a cenar en casa.' }),
  fut('T02', 'supported', 'plans', 'El domingo ___ (ir a + descansar, yo).', 'У неділю я збираюся відпочивати.', 'voy', 'descansar', { ask: 'Подивіться на зразок, утворіть ir a + інфінітив і впишіть пропущені слова.', model: [['El sábado vamos a comer con mis padres.', 'У суботу ми збираємося обідати з батьками.']], person: 'va', full: 'El domingo voy a descansar.' }),
  fut('T03', 'independent', 'family-home', 'Mi hermana ___ (ir a + cocinar) esta noche.', 'Моя сестра збирається готувати сьогодні ввечері.', 'va', 'cocinar', { conj: 'cocina', full: 'Mi hermana va a cocinar esta noche.' }),
  fut('T04', 'independent', 'free-time', '¿Qué ___ (ir a + hacer, tú) este fin de semana?', 'Що ти збираєшся робити на цих вихідних?', 'vas', 'hacer', { conj: 'haces', full: '¿Qué vas a hacer este fin de semana?' }),
  fut('T05', 'independent', 'family-home', 'Mis padres ___ (ir a + comprar) un piso nuevo.', 'Мої батьки збираються купити нову квартиру.', 'van', 'comprar', { person: 'va', personUk: 'Va — форма однини. Для «mis padres» потрібна форма множини: van.', full: 'Mis padres van a comprar un piso nuevo.' }),
  fut('T06', 'independent', 'plans', 'En verano ___ (ir a + viajar, nosotros) a España.', 'Улітку ми збираємося поїхати до Іспанії.', 'vamos', 'viajar', { conj: 'viajamos', full: 'En verano vamos a viajar a España.' }),
  fut('T07', 'delayed', 'work-study', 'Dentro de dos días ___ (ir a + empezar, yo) un trabajo nuevo.', 'Через два дні я починаю нову роботу.', 'voy', 'empezar', { conj: 'empiezo', full: 'Dentro de dos días voy a empezar un trabajo nuevo.' }),
  fut('T08', 'delayed', 'free-time', '¿___ (ir a + salir, vosotros) esta noche?', 'Ви збираєтеся кудись піти сьогодні ввечері?', 'vais', 'salir', { accent: 'váis', full: '¿Vais a salir esta noche?' }),
  fut('T09', 'transfer', 'messages', '¡Hola, Pablo! Mañana ___ (ir a + estar, yo) en Madrid. ¿Tomamos un café?', 'Привіт, Пабло! Завтра я буду в Мадриді. Вип’ємо кави?', 'voy', 'estar', { ask: 'Допишіть повідомлення: утворіть ir a + інфінітив і впишіть пропущені слова.', conj: 'estoy', full: '¡Hola, Pablo! Mañana voy a estar en Madrid. ¿Tomamos un café?' }),
  fut('T10', 'transfer', 'shop', 'Esta tarde ___ (ir a + hacer, nosotros) la compra.', 'Сьогодні по обіді ми збираємося зробити покупки.', 'vamos', 'hacer', { conj: 'hacemos', full: 'Esta tarde vamos a hacer la compra.' }),

  choice(L, { id: 'T11', role: 'independent', family: 'work-study', ts: [FUT_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Ana va a estudiar en Madrid el año que viene.', opts: [['Ана планує вчитися в Мадриді наступного року.', 'c'], ['Ана зараз учиться в Мадриді.', 'x', 'Ir a + інфінітив — план на майбутнє, а не те, що відбувається зараз.'], ['Ана мріє про Мадрид, але ще нічого не вирішила.', 'x', 'Ir a + інфінітив подає дію як план, а не лише бажання.']], rule: R.fut, ok: 'Правильно: ir a + інфінітив — план.', no: 'Va a estudiar — план: Ана збирається вчитися в Мадриді наступного року.' }),
  choice(L, { id: 'T12', role: 'delayed', family: 'free-time', ts: [FUT_R], ask: 'Друга запитали, які у вас із ним плани на вечір. Прочитайте його відповідь. Що вона означає?', es: 'Vamos a ver una película esta noche.', opts: [['Сьогодні ввечері ми збираємося подивитися фільм.', 'c'], ['Ми зараз дивимося фільм.', 'x', 'Дію зараз описали б так: Estamos viendo una película.'], ['Ми щовечора дивимося фільми.', 'x', 'Про звичку в реченні не йдеться.']], rule: R.fut, ok: 'Правильно: vamos a ver — план на сьогоднішній вечір.', no: 'Vamos a ver una película esta noche — ми збираємося подивитися фільм сьогодні ввечері.' }),

  choice(L, { id: 'T21', role: 'supported', family: 'free-time', ts: [CPV_C], ask: 'Як сказати, що ви збираєтеся ПЛАВАТИ (дія), а не просто йдете кудись? Підказка: після ir a інфінітив — це план дії.', opts: [['Voy a nadar.', 'c'], ['Voy a la playa.', 'x', 'Після ir a назва місця означає, куди ви йдете, а не що робитимете.']], rule: R.cpv, ok: 'Правильно: ir a + інфінітив — план дії.', no: 'План дії — ir a + інфінітив: Voy a nadar.' }),
  choice(L, { id: 'T22', role: 'independent', family: 'free-time', ts: [CPV_C], ask: 'Як сказати, КУДИ ви йдете?', opts: [['Vamos al cine.', 'c'], ['Vamos a ver una película.', 'x', 'Це план дії (подивитися фільм), а питали, куди ви йдете.']], rule: R.cpv, ok: 'Правильно: ir a + місце — куди ви йдете (a + el = al).', no: 'Куди ви йдете — ir a + місце: Vamos al cine.' }),
  choice(L, { id: 'T23', role: 'transfer', family: 'messages', ts: [CPV_C], ask: 'Допишіть повідомлення: оберіть пару слів для двох пропусків.', es: '¡Hola, Ana! Esta tarde voy ___ supermercado y después voy ___ cocinar.', opts: [['al … a', 'c'], ['a … al', 'x', 'Перед назвою місця з артиклем el — al (al supermercado), перед інфінітивом — просто a (a cocinar).'], ['al … al', 'x', 'Перед інфінітивом артикля немає: a cocinar.']], rule: R.cpv, ref: '¡Hola, Ana! Esta tarde voy al supermercado y después voy a cocinar.', ok: 'Правильно: al supermercado (місце), a cocinar (план дії).', no: 'Правильно: voy al supermercado (місце) і voy a cocinar (план дії).' }),
  choice(L, { id: 'T24', role: 'independent', family: 'plans', ts: [CPV_R], ask: 'Яке речення про план дії, а не про те, куди людина йде?', opts: [['Vamos a cenar.', 'c'], ['Vamos al restaurante.', 'x', 'Тут назва місця: куди ми йдемо.'], ['Vamos a casa de Ana.', 'x', 'Тут місце: куди ми йдемо.']], rule: R.cpv, ok: 'Правильно: після ir a стоїть інфінітив — це план дії.', no: 'План дії — Vamos a cenar: після ir a стоїть інфінітив.' }),
  choice(L, { id: 'T25', role: 'delayed', family: 'plans', ts: [CPV_R], ask: 'Прочитайте речення. Що людина робитиме після кіно?', es: 'Voy al cine a las ocho y después voy a cenar con Ana.', opts: [['Вечерятиме з Аною.', 'c'], ['Піде в кіно ще раз.', 'x', 'Після кіно — voy a cenar: план повечеряти.'], ['Піде до Ани додому.', 'x', 'Про дім Ани в реченні не йдеться.']], rule: R.cpv, ok: 'Правильно: voy a cenar con Ana — план повечеряти з Аною.', no: 'Після кіно людина збирається вечеряти з Аною: voy a cenar con Ana.' }),
  choice(L, { id: 'T26', role: 'transfer', family: 'transport', ts: [CPV_R], ask: 'Прочитайте діалог. Куди людина йде і навіщо?', es: '—¿Qué haces esta tarde? —Voy a la estación: voy a comprar un billete de tren.', opts: [['На вокзал, щоб купити квиток на потяг.', 'c'], ['На вокзал, щоб сісти на потяг.', 'x', 'Людина каже voy a comprar un billete — купити квиток.'], ['До крамниці, щоб купити хліб.', 'x', 'Людина йде на вокзал (la estación).']], rule: R.cpv, ok: 'Правильно: voy a la estación (місце) і voy a comprar un billete (план).', no: 'Людина йде на вокзал (voy a la estación), щоб купити квиток (voy a comprar un billete).' }),

  choice(L, { id: 'T31', role: 'supported', family: 'work-study', ts: [CPW_C], ask: 'Ви вже вирішили й розповідаєте про ПЛАН. Оберіть речення. Підказка: план — ir a + інфінітив, бажання — querer + інфінітив.', opts: [['Voy a estudiar en Madrid.', 'c'], ['Quiero estudiar en Madrid.', 'x', 'Querer + інфінітив — бажання, а не план.']], rule: R.cpw, ok: 'Правильно: ir a + інфінітив — план.', no: 'План — ir a + інфінітив: Voy a estudiar en Madrid.' }),
  choice(L, { id: 'T32', role: 'independent', family: 'travel', ts: [CPW_C], ask: 'Ви розповідаєте лише про БАЖАННЯ: ще нічого не вирішили. Оберіть речення.', opts: [['Quiero viajar a Valencia.', 'c'], ['Voy a viajar a Valencia.', 'x', 'Ir a + інфінітив подає дію як план.']], rule: R.cpw, ok: 'Правильно: querer + інфінітив — бажання.', no: 'Бажання — querer + інфінітив: Quiero viajar a Valencia.' }),
  choice(L, { id: 'T33', role: 'delayed', family: 'plans', ts: [CPW_C], ask: 'Ви вже домовилися з Аною повечеряти в суботу. Оберіть речення, яке це передає.', opts: [['El sábado ceno con Ana.', 'c', 'Так: теперішній час із вказівкою часу описує домовленість.'], ['El sábado voy a cenar con Ana.', 'c', 'Так: ir a + інфінітив теж передає план.'], ['Quiero cenar con Ana.', 'x', 'Це лише бажання, а ви вже домовилися.']], rule: R.cpw, ok: 'Правильно: домовленість передає і теперішній час із вказівкою часу, і ir a + інфінітив.', no: 'Домовленість передає El sábado ceno con Ana або El sábado voy a cenar con Ana; quiero — лише бажання.' }),
  choice(L, { id: 'T34', role: 'transfer', family: 'messages', ts: [CPW_C], ask: 'Допишіть повідомлення: ви вже вирішили, що поїдете з дітьми на пляж.', es: '¡Hola, Marta! El domingo ___ a la playa con mis hijos. ¿Venís?', opts: [['vamos a ir', 'c'], ['vamos', 'c', 'Так: теперішній час із вказівкою часу теж описує домовленість.'], ['queremos ir', 'x', 'Querer — лише бажання, а ви вже вирішили.']], rule: R.cpw, ref: '¡Hola, Marta! El domingo vamos a ir a la playa con mis hijos. ¿Venís?', ok: 'Правильно: план чи домовленість.', no: 'Ви вже вирішили, тому підходить vamos a ir або vamos; queremos — лише бажання.' }),
  choice(L, { id: 'T35', role: 'independent', family: 'work-study', ts: [CPW_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Quiero aprender alemán, pero ahora no tengo tiempo.', opts: [['Людина хоче вивчати німецьку, але зараз не має часу.', 'c'], ['Людина вже вирішила вивчати німецьку цього року.', 'x', 'Quiero — лише бажання, і людина каже, що не має часу.'], ['Людина зараз вивчає німецьку.', 'x', 'У реченні сказано, що зараз часу немає.']], rule: R.cpw, ok: 'Правильно: quiero + інфінітив — бажання.', no: 'Quiero aprender — бажання: людина хоче вивчати німецьку, але зараз не має часу.' }),
  choice(L, { id: 'T36', role: 'delayed', family: 'travel', ts: [CPW_R], ask: 'Прочитайте текст. Що ми знаємо про брата?', es: 'Mi hermano va a vivir en Valencia: el lunes empieza un trabajo nuevo allí.', opts: [['Він житиме у Валенсії, а в понеділок почне там нову роботу.', 'c'], ['Він тільки мріє про Валенсію.', 'x', 'Va a vivir і робота з понеділка — це вже план.'], ['Він давно живе у Валенсії.', 'x', 'Va a vivir — це майбутнє, а не теперішнє.']], rule: R.cpw, ok: 'Правильно: va a vivir — план: брат житиме у Валенсії.', no: 'Va a vivir en Valencia — план: брат житиме у Валенсії, а з понеділка почне там нову роботу.' }),
];

const T_IRA = TABLE_ES(['persona', 'ir', 'a + infinitivo'], [
  ['yo', 'voy', 'a estudiar'], ['tú', 'vas', 'a venir'], ['él / ella / usted', 'va', 'a cocinar'],
  ['nosotros / nosotras', 'vamos', 'a cenar'], ['vosotros / vosotras', 'vais', 'a salir'], ['ellos / ellas / ustedes', 'van', 'a comprar'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Плани: ir a + інфінітив',
  termEs: 'ir a + infinitivo',
  summaryUk: 'Розповідаємо про плани за допомогою ir a + інфінітив (voy a estudiar), відрізняємо план від руху до місця (voy a la playa) і від простого бажання (quiero).',
  objectives: ['A2-01-O6'],
  situations: ['time-appointments-transport', 'routine-study-leisure', 'personal-messages'],
  estimatedMinutes: 14,
  introduces: ['future-ir.ir-a-inf', 'contrast.ir-a-place-vs-plan', 'contrast.plan-vs-wish'],
  revisits: ['present.ir', 'prep.a.destination', 'article.contraction-al', 'querer.infinitive', 'contrast.wish-plan', 'time.future-expressions', 'time.plan.present-for-future'],
  steps: [
    s('s1', 'explanation', 'ir a + інфінітив: що ви збираєтеся робити', true, {
      blocks: [
        UK('Щоб розповісти про план чи намір, уживаємо ir у теперішньому часі + a + інфінітив. Змінюється лише ir; a обов’язкове.'),
        T_IRA,
        UK('Час уточнюємо словами mañana, esta noche, el sábado, la semana que viene, dentro de dos días («через два дні»). Простий майбутній час тут не потрібен.'),
        EX('Mañana voy a estudiar en casa.', 'Завтра я збираюся вчитися вдома.'),
        EX('¿Qué vas a hacer este fin de semana?', 'Що ти збираєшся робити на цих вихідних?'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Побудуйте ir a + інфінітив', true, { tasks: ['T01', 'T02'] }),
    s('s3', 'explanation', 'Місце чи план? План чи бажання?', true, {
      blocks: [
        UK('Після ir a назва місця означає, куди ви йдете: Voy a la playa. Vamos al cine (a + el = al). Інфінітив означає план дії: Voy a nadar. Vamos a ver una película. Можна й поєднати: Voy al cine a las ocho y después voy a cenar.'),
        UK('Querer + інфінітив — лише бажання: Quiero comprar un coche. Ir a + інфінітив — уже план: Voy a comprar un coche. Про домовленість можна сказати й теперішнім часом із вказівкою часу: El sábado ceno con Ana.'),
        UK('Vamos a + інфінітив буває ще й пропозицією «давайте»: ¡Vamos a comer! Що саме мається на увазі, видно з контексту.'),
        EX('Quiero viajar a Valencia, pero este año no tengo vacaciones.', 'Я хочу поїхати до Валенсії, але цього року в мене немає відпустки.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Місце, план, бажання', true, { tasks: ['T21', 'T31'] }),
    s('s5', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T04', 'T11', 'T22', 'T32', 'T35'] }),
    s('s6', 'independent-practice', 'Додаткова практика', false, { tasks: ['T05', 'T06', 'T24'] }),
    s('s7', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'План чи намір: ir (voy, vas, va, vamos, vais, van) + a + інфінітив.',
          'Ir a + місце — куди ви йдете (al cine); ir a + інфінітив — що робитимете (a ver una película).',
          'Querer + інфінітив — бажання; ir a + інфінітив — план; теперішній час + вказівка часу — домовленість.',
        ]),
        LINK('Потренувати плани з ir a', [FUT, FUT_R, CPV_C, CPV_R, CPW_C, CPW_R], 'written', 8),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-01.ir-a-plans',
    topicId: L,
    titleUk: 'Плани: ir a + інфінітив',
    blocks: [
      T_IRA,
      UK('Ir a + місце — куди ви йдете; ir a + інфінітив — план дії. Querer + інфінітив — бажання; теперішній час + вказівка часу — домовленість.'),
      EX('El sábado vamos a ir a la playa.', 'У суботу ми збираємося поїхати на пляж.'),
      LINK('Практика: плани', [FUT, CPV_C, CPW_C], 'written', 8),
    ],
    linkedTargets: [FUT, FUT_R, CPV_C, CPW_C],
  }),
];
