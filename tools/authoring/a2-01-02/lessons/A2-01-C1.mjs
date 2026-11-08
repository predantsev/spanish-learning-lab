// A2-01-C1 — optional mixed check: new-context transfer prompts mixing A2-01 targets + links to the held-out bank.
import { LINK, LIST_UK, UK, choice, gap, lesson as mkLesson, open, step } from '../lib.mjs';

const L = 'A2-01-C1';
const EIE = 'present.stem-e-ie/written-form';
const UNCH = 'present.stem-unchanged-1p-2p/written-form';
const YOG = 'present.yo-g/written-form';
const ZCO = 'present.yo-zco/written-form';
const GJ = 'present.yo-spelling-g-j/written-form';
const PROG = 'progressive.estar-gerund/construction-use';
const EST = 'present.estar/written-form';
const OU = 'progressive.gerund-o-u/written-form';
const FUT = 'future-ir.ir-a-inf/construction-use';
const IR = 'present.ir/written-form';
const TQ = 'obligation.tener-que/construction-use';
const TEN = 'present.tener/written-form';
const WH = 'formula.weather-hace/construction-use';
const RNP = 'contrast.routine-now-plan/context-choice';
const SC = 'contrast.saber-conocer/context-choice';
const ASK = 'Впишіть правильну форму дієслова з дужок.';

export const tasks = [
  gap(L, { id: 'T01', role: 'transfer', family: 'c1-work', t: EIE, ask: ASK, es: 'La reunión ___ (empezar) a las diez y media.', uk: 'Нарада починається о пів на одинадцяту.', a: 'empieza', err: [['empeza', 'Під наголосом e змінюється на ie: empieza.']], rule: 'Під наголосом e в основі змінюється на ie: empezar → empieza.' }),
  gap(L, { id: 'T02', role: 'transfer', family: 'c1-bar', t: UNCH, ask: ASK, es: '—¿Qué ___ (pedir, vosotros)? —Yo, una caña.', uk: '— Що ви замовляєте? — Я — келих пива.', a: 'pedís', err: [['pidís', 'У формі vosotros основа не змінюється: pedís.'], ['pedis', 'Цю форму пишемо зі знаком наголосу: pedís.']], rule: 'У формах nosotros і vosotros наголос падає на закінчення, тому основа не змінюється: pedimos, pedís.' }),
  gap(L, { id: 'T03', role: 'transfer', family: 'c1-party', t: YOG, ask: ASK, es: 'Esta noche yo ___ (traer) la fruta y tú el pan.', uk: 'Сьогодні ввечері я приношу фрукти, а ти — хліб.', a: 'traigo', err: [['trao', 'У формі yo дієслова traer — -igo: traigo.']], rule: 'У poner, salir, traer і hacer форма yo закінчується на -go: traigo.' }),
  gap(L, { id: 'T04', role: 'transfer', family: 'c1-travel', t: ZCO, ask: ASK, es: 'Yo ___ (conducir) y tú duermes en el coche.', uk: 'Я за кермом, а ти спиш у машині.', a: 'conduzco', err: [['conduco', 'Форма yo дієслова conducir — conduzco.']], rule: 'У conocer, conducir і traducir форма yo закінчується на -zco: conduzco.' }),
  gap(L, { id: 'T05', role: 'transfer', family: 'c1-bar', t: GJ, ask: ASK, es: 'Siempre ___ (escoger, yo) el menú del día.', uk: 'Я завжди обираю комплексний обід.', a: 'escojo', err: [['escogo', 'Перед -o пишемо j, щоб зберегти звук [х]: escojo.']], rule: 'Перед -o буква g змінюється на j: escoger → escojo.' }),
  open(L, { id: 'T06', role: 'transfer', family: 'c1-travel', ts: [PROG, EST, OU], ask: 'Утворіть estar + gerundio і впишіть обидва слова.', es: 'Es muy tarde: todos ___ (estar + dormir) en el tren.', uk: 'Дуже пізно: у потязі всі сплять.', a: ['están durmiendo'], err: [['estan durmiendo', { [PROG]: 'correct', [EST]: 'incorrect', [OU]: 'correct' }, 'Están пишемо зі знаком наголосу.'], ['están dormiendo', { [PROG]: 'correct', [EST]: 'correct', [OU]: 'incorrect' }, 'Герундій від dormir — durmiendo.'], ['duermen', { [PROG]: 'incorrect', [EST]: 'unresolved', [OU]: 'unresolved' }, 'Тут треба побудувати estar + gerundio: están durmiendo.']], rule: 'Estar у теперішньому часі + gerundio — дія зараз. Dormir → durmiendo.', full: 'Es muy tarde: todos están durmiendo en el tren.', ok: 'Правильно: están durmiendo.', no: 'Правильна відповідь: están durmiendo.' }),
  open(L, { id: 'T07', role: 'transfer', family: 'c1-plans', ts: [FUT, IR], ask: 'Утворіть ir a + інфінітив і впишіть пропущені слова.', es: 'El año que viene ___ (ir a + aprender, yo) alemán.', uk: 'Наступного року я збираюся вивчати німецьку.', a: ['voy a aprender'], err: [['voy aprender', { [FUT]: 'incorrect', [IR]: 'correct' }, 'Після ir потрібне a: voy a aprender.'], ['voy a aprendo', { [FUT]: 'incorrect', [IR]: 'correct' }, 'Після ir a друге дієслово стоїть в інфінітиві: voy a aprender.']], rule: 'Ir у теперішньому часі + a + інфінітив — план: voy a aprender.', full: 'El año que viene voy a aprender alemán.', ok: 'Правильно: voy a aprender.', no: 'Правильна відповідь: voy a aprender.' }),
  open(L, { id: 'T08', role: 'transfer', family: 'c1-work', ts: [TQ, TEN], ask: 'Утворіть tener que + інфінітив і впишіть пропущені слова.', es: '¿___ (tener que + trabajar, tú) el domingo?', uk: 'Тобі треба працювати в неділю?', a: ['tienes que trabajar'], err: [['tienes trabajar', { [TQ]: 'incorrect', [TEN]: 'correct' }, 'Que обов’язкове: tienes que trabajar.'], ['tienes que trabajas', { [TQ]: 'incorrect', [TEN]: 'correct' }, 'Після tener que — інфінітив: tienes que trabajar.']], rule: 'Tener que + інфінітив — обов’язок; змінюється лише tener.', full: '¿Tienes que trabajar el domingo?', ok: 'Правильно: tienes que trabajar.', no: 'Правильна відповідь: tienes que trabajar.' }),
  open(L, { id: 'T09', role: 'transfer', family: 'c1-weather-plans', ts: [WH], ask: 'Як сказати «дуже вітряно»? Впишіть пропущені слова.', es: 'Hoy no salimos en bicicleta: ___.', uk: 'Сьогодні ми не їдемо кататися на велосипеді: дуже вітряно.', a: ['hace mucho viento', 'hay mucho viento'], err: [['hace muy viento', { [WH]: 'incorrect' }, 'Viento — іменник, тому mucho, а не muy: hace mucho viento.']], rule: 'Про погоду: hace + іменник; ступінь — mucho: hace mucho viento.', full: 'Hoy no salimos en bicicleta: hace mucho viento.' }),
  choice(L, { id: 'T10', role: 'transfer', family: 'c1-messages', ts: [RNP], ask: 'Допишіть повідомлення: оберіть варіант, який підходить.', es: '¡Hola, Ana! Normalmente a esta hora estoy en el gimnasio, pero hoy ___.', opts: [['estoy en casa y estoy viendo una película', 'c'], ['voy al gimnasio todos los días', 'x', 'Це звичка і суперечить слову «але сьогодні».'], ['los martes estudio inglés', 'x', 'Це звичка, а текст про сьогодні.']], rule: 'Звичка — простий теперішній; дія зараз — estar + gerundio.', ref: '¡Hola, Ana! Normalmente a esta hora estoy en el gimnasio, pero hoy estoy en casa y estoy viendo una película.', ok: 'Правильно: сьогодні, зараз — estar + gerundio.', no: 'Підходить: estoy en casa y estoy viendo una película.' }),
  choice(L, { id: 'T11', role: 'transfer', family: 'c1-travel', ts: [SC], ask: 'Оберіть дієслово.', es: 'Perdón, ¿___ dónde está la estación de autobuses?', opts: [['sabe', 'c'], ['conoce', 'x', 'Перед непрямим питанням (dónde…) уживаємо saber.']], rule: 'Saber — знати факт; conocer — бути знайомим.', ref: 'Perdón, ¿sabe dónde está la estación de autobuses?', ok: 'Правильно: перед dónde — saber.', no: 'Перед dónde — saber: ¿Sabe dónde está…?' }),
];

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Необов’язкова перевірка: теперішній час, дії зараз і плани',
  summaryUk:
    'Коротка змішана перевірка без нових правил: форми теперішнього часу, estar + gerundio, плани, можливість і обов’язок, погода. Результат показує окремі навички, а не одну оцінку за блок; перевірку можна перервати й продовжити.',
  objectives: ['A2-01-O1', 'A2-01-O2', 'A2-01-O3', 'A2-01-O4', 'A2-01-O5', 'A2-01-O6', 'A2-01-O7', 'A2-01-O8', 'A2-01-O9'],
  situations: ['routine-study-leisure', 'time-appointments-transport', 'personal-messages'],
  estimatedMinutes: 15,
  introduces: [],
  revisits: ['present.stem-e-ie', 'present.stem-unchanged-1p-2p', 'present.yo-g', 'present.yo-zco', 'present.yo-spelling-g-j', 'progressive.estar-gerund', 'progressive.gerund-o-u', 'future-ir.ir-a-inf', 'obligation.tener-que', 'formula.weather-hace', 'contrast.routine-now-plan', 'contrast.saber-conocer'],
  steps: [
    s('s1', 'explanation', 'Як працює перевірка', true, { blocks: [UK('Це необов’язкова перевірка: нових правил тут немає. Відповідайте без підказок; якщо підказка знадобиться, вона позначиться лише на тій навичці, до якої стосується. Перевірку можна пропустити, а результат не блокує наступних уроків.')] }),
    // Held-out (delayed/transfer) tasks, including this check's own T01–T11, are reached only through
    // practice links, so the check never shows a held-out task as a fixed lesson step.
    s('s2', 'self-check', 'Частина 1. Форми теперішнього часу', true, {
      blocks: [
        LINK('Форми теперішнього часу', ['present.stem-e-ie/written-form', 'present.stem-o-ue/written-form', 'present.jugar/written-form', 'present.stem-e-i/written-form', 'present.stem-unchanged-1p-2p/written-form', 'present.yo-g/written-form', 'present.venir/written-form', 'present.decir/written-form', 'present.yo-zco/written-form', 'present.saber/written-form', 'ortho.accent-pair.se/written-form', 'present.dar/written-form', 'present.ver/written-form', 'present.yo-spelling-g-j/written-form', 'prep.a.personal/written-form'], 'written', 10),
      ],
    }),
    s('s3', 'self-check', 'Частина 2. Дії зараз, плани, можливість і обов’язок', true, {
      blocks: [
        LINK('Герундій і estar + gerundio', ['progressive.gerund-regular-ar/written-form', 'progressive.gerund-regular-er-ir/written-form', 'progressive.gerund-yendo/written-form', 'progressive.gerund-e-i/written-form', 'progressive.gerund-o-u/written-form', 'progressive.estar-gerund/construction-use', 'contrast.present-progressive/context-choice'], 'written', 6),
        LINK('Плани, можливість, обов’язок', ['future-ir.ir-a-inf/construction-use', 'contrast.plan-vs-wish/context-choice', 'ability.poder-inf/construction-use', 'ability.saber-inf/construction-use', 'obligation.tener-que/construction-use', 'contrast.modal-meaning/context-choice', 'perifrasis.acabar-de/construction-use', 'perifrasis.empezar-a/construction-use', 'perifrasis.volver-a/construction-use'], 'written', 6),
      ],
    }),
    s('s4', 'self-check', 'Частина 3. Погода, ситуації та слухання', false, {
      blocks: [
        LINK('Погода й ситуації', ['formula.weather-hace/construction-use', 'present.llover-nevar/written-form', 'estar.weather/construction-use', 'contrast.hace-tener-estar/context-choice', 'contrast.routine-now-plan/context-choice', 'contrast.saber-conocer/context-choice', 'reading.routine-now-plan/reading-meaning'], 'written', 6),
        LINK('Слухання', ['listening.ongoing-actions/listening-meaning', 'listening.situation-plan/listening-meaning'], 'listening', 4),
      ],
    }),
    s('s5', 'summary', 'Підсумок', true, { blocks: [LIST_UK(['Результати записуються для кожної навички окремо.', 'Навички з помилками повернуться в повторенні наступного дня; підсумкової оцінки за блок немає.'])] }),
  ],
});
