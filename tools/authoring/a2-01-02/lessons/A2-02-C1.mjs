// A2-02-C1 — optional mixed check: new-context transfer prompts mixing A2-02 targets + links to the held-out bank.
// Held-out tasks (this check's own included) are reached only through practice links, never as fixed steps.
import { LINK, LIST_UK, UK, choice, gap, lesson as mkLesson, open, step } from '../lib.mjs';

const L = 'A2-02-C1';
const DEM = 'pron.demonstrative-agreement/written-form';
const STAND = 'poss.tonic-standalone/construction-use';
const D3 = 'object-pron.direct-3/written-form';
const PIC = 'object-pron.placement-infinitive/construction-use';
const PP = 'pron.prepositional/written-form';
const SEC = 'object-pron.se-replacement/construction-use';
const MQW = 'compare.mas-menos-que/written-form';
const MJ = 'compare.mejor/written-form';
const RQ = 'relative.que/construction-use';
const DNW = 'neg.double-negation/written-form';
const AQ_C = 'ortho.accent-pair.que/context-choice';

export const tasks = [
  gap(L, { id: 'T01', role: 'transfer', family: 'c1-market', t: DEM, ask: 'Впишіть правильну форму вказівного слова з дужок.', es: '¿Cuánto cuestan ___ (este) manzanas?', uk: 'Скільки коштують ці яблука?', a: 'estas', err: [['estos', 'Manzanas — жіночого роду: estas.']], rule: 'Вказівне слово узгоджується з іменником у роді й числі: estas manzanas.' }),
  open(L, { id: 'T02', role: 'transfer', family: 'c1-gym', ts: [STAND], ask: 'Впишіть артикль + присвійне слово, щоб не повторювати іменник.', es: 'Mi mochila es azul. ¿Y ___ (tú)?', uk: 'Мій рюкзак синій. А твій?', a: ['la tuya'], err: [['tuya', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: la tuya.'], ['el tuyo', { [STAND]: 'incorrect' }, 'Mochila — жіночого роду: la tuya.']], rule: 'Артикль + наголошена форма замість іменника: la tuya.', closed: true, full: 'Mi mochila es azul. ¿Y la tuya?' }),
  gap(L, { id: 'T03', role: 'transfer', family: 'c1-market', t: D3, ask: 'Замініть названий предмет займенником lo, la, los або las. Впишіть займенник.', es: '¿Las manzanas? ___ compro aquí todos los sábados.', uk: 'Апельсини? Я купую їх тут щосуботи.', a: 'Las', err: [['Los', 'Manzanas — жіночого роду: las.'], ['La', 'Manzanas — множина: las.']], rule: 'Lo, la, los, las узгоджуються з названим іменником.' }),
  open(L, { id: 'T04', role: 'transfer', family: 'c1-gym', ts: [PIC], ask: 'Дайте відповідь: замініть названий предмет займенником. Впишіть пропущені слова.', es: '—¿Vas a coger el coche hoy? —No, no ___ (ir a + coger).', uk: '— Ти сьогодні поїдеш машиною? — Ні, не поїду.', a: ['voy a cogerlo', 'lo voy a coger'], err: [['voy a lo coger', { [PIC]: 'incorrect' }, 'Займенник не ставимо між дієсловами.'], ['voy a cogerla', { [PIC]: 'incorrect' }, 'Coche — чоловічого роду: lo.']], rule: 'Lo voy a coger = Voy a cogerlo: обидва варіанти правильні.', full: '—¿Vas a coger el coche hoy? —No, no voy a cogerlo.' }),
  gap(L, { id: 'T05', role: 'transfer', family: 'c1-gym', t: PP, ask: 'Впишіть займенник для особи з дужок.', es: 'Esta mochila es para ___ (yo), ¿verdad?', uk: 'Цей рюкзак для мене, так?', a: 'mí', err: [['mi', 'Після прийменника — займенник зі знаком наголосу: mí.']], rule: 'Після прийменника: mí, ti, él, ella…' }),
  open(L, { id: 'T06', role: 'transfer', family: 'c1-market', ts: [SEC], ask: 'Дайте відповідь: замініть обидва додатки займенниками. Впишіть пропущені слова.', es: '—¿Le das las manzanas a la vecina? —Sí, ___ (dar, yo) ahora.', uk: '— Даси яблука сусідці? — Так, зараз дам їй.', a: ['se las doy'], err: [['le las doy', { [SEC]: 'incorrect' }, 'Le перед las стає se: se las doy.'], ['se los doy', { [SEC]: 'incorrect' }, 'Manzanas — жіночого роду: las.']], rule: 'Перед lo, la, los, las займенники le, les стають se: se lo, se la, se los, se las.', full: '—¿Le das las manzanas a la vecina? —Sí, se las doy ahora.' }),
  gap(L, { id: 'T07', role: 'transfer', family: 'c1-gym', t: MQW, ask: 'Впишіть порівняння за підказкою в дужках. (+) — більше, (−) — менше.', es: 'Este gimnasio es ___ (− caro) el del centro.', uk: 'Цей спортзал дешевший, ніж той, що в центрі.', a: 'menos caro que', err: [['menos caro de', 'Порівнюємо з іншим спортзалом: que.']], rule: 'Más / menos + прикметник + que.' }),
  gap(L, { id: 'T08', role: 'transfer', family: 'c1-market', t: MJ, ask: 'Впишіть порівняння за підказкою в дужках. (+) — більше.', es: 'La fruta de esta tienda es ___ (+ bueno) la del supermercado.', uk: 'Фрукти в цій крамниці кращі, ніж у супермаркеті.', a: 'mejor que', err: [['más buena que', 'Від bueno — mejor.']], rule: 'Від bueno і bien — mejor.' }),
  open(L, { id: 'T09', role: 'transfer', family: 'c1-gym', ts: [RQ], ask: 'Поєднайте два речення в одне за допомогою que.', es: 'Tengo un amigo. El amigo va al gimnasio todos los días.', uk: 'У мене є друг, який ходить у спортзал щодня.', a: ['Tengo un amigo que va al gimnasio todos los días.'], err: [['Tengo un amigo qué va al gimnasio todos los días.', { [RQ]: 'incorrect' }, 'Тут que пояснює іменник — без знака наголосу.']], rule: 'Que приєднує деталь до іменника.', full: 'Tengo un amigo que va al gimnasio todos los días.' }),
  gap(L, { id: 'T10', role: 'transfer', family: 'c1-gym', t: DNW, ask: 'Впишіть no, nada або nadie.', es: 'Son las siete de la mañana y en el gimnasio no hay ___.', uk: 'Сьома ранку, і в спортзалі нікого немає.', a: 'nadie', err: [['nada', 'Про людей — nadie.']], rule: 'No + дієслово + nadie.' }),
  choice(L, { id: 'T11', role: 'transfer', family: 'c1-market', ts: [AQ_C], ask: 'Оберіть правильне написання.', es: 'No sé ___ fruta comprar.', opts: [['qué', 'c'], ['que', 'x', 'Непряме питання («яку саме») — qué.']], rule: 'Qué — у прямих і непрямих питаннях.', ref: 'No sé qué fruta comprar.', ok: 'Правильно: непряме питання — qué.', no: 'Непряме питання — qué.' }),
];

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Необов’язкова перевірка: займенники, порівняння, опис',
  summaryUk: 'Коротка змішана перевірка без нових правил: вказівні й присвійні слова, займенники та їхнє місце, порівняння, que і заперечення. Результат показує окремі навички, а не одну оцінку за блок; перевірку можна перервати й продовжити.',
  objectives: ['A2-02-O1', 'A2-02-O2', 'A2-02-O3', 'A2-02-O4', 'A2-02-O5', 'A2-02-O6', 'A2-02-O7', 'A2-02-O8', 'A2-02-O9', 'A2-02-O10'],
  situations: ['food-shopping', 'places-accommodation', 'people-family-home'],
  estimatedMinutes: 15,
  introduces: [],
  revisits: ['pron.demonstrative-agreement', 'poss.tonic-standalone', 'object-pron.direct-3', 'object-pron.placement-infinitive', 'pron.prepositional', 'object-pron.se-replacement', 'compare.mas-menos-que', 'compare.mejor', 'relative.que', 'neg.double-negation', 'ortho.accent-pair.que'],
  steps: [
    s('s1', 'explanation', 'Як працює перевірка', true, { blocks: [UK('Це необов’язкова перевірка: нових правил тут немає. Відповідайте без підказок; якщо підказка знадобиться, вона позначиться лише на тій навичці, до якої стосується. Перевірку можна пропустити, а результат не блокує наступних уроків.')] }),
    s('s2', 'self-check', 'Частина 1. Вказівні й присвійні слова, займенники', true, {
      blocks: [
        LINK('Цей, той; мій, твій', ['pron.demonstrative-agreement/written-form', 'pron.demonstrative-neuter/written-form', 'ortho.demonstrative-no-accent/written-form', 'poss.tonic-forms/written-form', 'poss.tonic-standalone/construction-use', 'contrast.poss-mi-mio/written-form'], 'written', 6),
        LINK('Займенники та їхнє місце', ['object-pron.direct-1-2/written-form', 'object-pron.direct-3/written-form', 'object-pron.placement-finite/construction-use', 'object-pron.indirect-recipient/construction-use', 'object-pron.indirect-doubling/construction-use', 'pron.prepositional/written-form', 'pron.conmigo-contigo/written-form', 'object-pron.placement-infinitive/construction-use', 'object-pron.placement-gerund/construction-use', 'ortho.gerund-pronoun-accent/written-form', 'object-pron.combination-order/construction-use', 'object-pron.se-replacement/construction-use'], 'written', 8),
      ],
    }),
    s('s3', 'self-check', 'Частина 2. Порівняння, опис, заперечення', true, {
      blocks: [
        LINK('Порівняння', ['compare.mas-menos-que/written-form', 'compare.mas-menos-que/construction-use', 'compare.tan-como/written-form', 'compare.tanto-como/written-form', 'compare.mas-de-number/written-form', 'compare.mejor/written-form', 'compare.peor/written-form', 'compare.mayor-menor/written-form'], 'written', 8),
        LINK('Опис і заперечення', ['relative.que/construction-use', 'ortho.accent-pair.que/written-form', 'ortho.accent-pair.que/context-choice', 'writing.description-detail/construction-use', 'neg.double-negation/written-form', 'neg.double-negation/construction-use', 'poss.su-clarification/construction-use', 'ortho.accent-pair.mi/written-form'], 'written', 6),
      ],
    }),
    s('s4', 'self-check', 'Частина 3. Читання і слухання', false, {
      blocks: [
        LINK('Читання', ['reading.description-comparison/reading-meaning', 'object-pron.direct-referent/reading-meaning', 'pron.demonstrative-distance/reading-meaning', 'pron.algo-alguien/context-choice'], 'written', 5),
        LINK('Слухання', ['listening.pronoun-reference/listening-meaning', 'listening.description-comparison/listening-meaning'], 'listening', 4),
      ],
    }),
    s('s5', 'summary', 'Підсумок', true, { blocks: [LIST_UK(['Результати записуються для кожної навички окремо.', 'Навички з помилками повернуться в повторенні наступного дня; підсумкової оцінки за блок немає.'])] }),
  ],
});
