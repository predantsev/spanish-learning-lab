// A2-04-L8 — put past events in sequence (A2-04-O9/O10): sequence links with the indefinido
// (link.past-sequence; the A1 links are reused per CV-04, new: al día siguiente, por fin), reading a
// short account, listening to two connected clips (meaning + one separate dictation) and free writing
// with a rubric. Reading/listening evidence is meaning only; free writing is never auto-failed.
import { SENTENCE, choice, clip, es, ex, exact, lesson, rubric, step, uk, ukList } from './lib.mjs';

const L = 'A2-04-L8';
const LK_C = ['link.past-sequence', 'construction-use'];
const LK_R = ['link.past-sequence', 'reading-meaning'];
const RD = ['reading.past-sequence', 'reading-meaning'];
const LM = ['listening.past-sequence', 'listening-meaning'];
const LD = ['listening.past-sequence', 'dictation'];
const WR = ['writing.past-sequence', 'construction-use'];
const num = (n) => `T${String(n).padStart(2, '0')}`;

const LK_RULE = 'Події по черзі: primero — «спочатку», después / luego — «потім», más tarde — «пізніше», al final — «наприкінці», al día siguiente — «наступного дня», por fin — «нарешті». Після después de / antes de — інфінітив: después de comer.';
const UNRES = 'Такого варіанта немає серед перевірених відповідей, тому автоматично ми його не оцінюємо. Порівняйте зі зразком.';

const TEXT_A = 'El sábado pasado fui a Toledo con mi hermana. Primero vimos el museo y después comimos en un restaurante del centro. Por la tarde paseamos por la ciudad. Al final volvimos a Madrid en tren a las nueve. Fue un día muy bonito.';
const UK_A = 'Минулої суботи я їздив(-ла) до Толедо із сестрою. Спочатку ми подивилися музей, а потім пообідали в ресторані в центрі. По обіді гуляли містом. Наприкінці о дев’ятій повернулися до Мадрида потягом. Це був дуже гарний день.';
const TEXT_B = 'En 2010 Carmen terminó la universidad en Valencia. Después trabajó dos años en un banco. En 2013 fue a vivir a Madrid y empezó a trabajar en un hotel. Hace un año volvió a Valencia.';
const UK_B = 'У 2010 році Кармен закінчила університет у Валенсії. Потім два роки працювала в банку. У 2013 році переїхала до Мадрида й почала працювати в готелі. Рік тому вона повернулася до Валенсії.';

const CLIP_WKND = 'clip.a2-04.l8.weekend-message';
const CLIP_DAY = 'clip.a2-04.l8.long-day';
const T_WKND = 'Hola, Marta, soy Luis. ¿Qué tal? El fin de semana pasado fui a Valencia con mis padres. El sábado por la mañana llegamos en tren y primero fuimos a la playa. Después comimos en un restaurante y por la tarde vimos el centro. Al día siguiente volvimos a Madrid. ¡Fue genial! Un beso.';
const U_WKND = 'Привіт, Марто, це Луїс. Як справи? Минулих вихідних я їздив до Валенсії з батьками. У суботу вранці ми приїхали потягом і спочатку пішли на пляж. Потім пообідали в ресторані, а по обіді подивилися центр. Наступного дня ми повернулися до Мадрида. Було чудово! Цілую.';
const T_DAY = 'Ayer tuve un día muy largo. Me levanté a las seis y fui a la oficina en autobús. Por la mañana tuve dos reuniones. Después de comer, escribí muchos correos electrónicos. A las ocho volví a casa, hice la cena y por fin descansé un poco.';
const U_DAY = 'Учора в мене був дуже довгий день. Я встав(-ла) о шостій і поїхав(-ла) в офіс автобусом. Зранку в мене було дві наради. Після обіду я написав(-ла) багато електронних листів. О восьмій я повернувся(-лася) додому, приготував(-ла) вечерю й нарешті трохи відпочив(-ла).';
const DICTATION = 'A las ocho volví a casa, hice la cena y por fin descansé un poco.';

const clips = [
  clip({ id: CLIP_WKND, lesson: L, kind: 'text', transcript: T_WKND, translationUk: U_WKND, targets: [LM], family: 'weekend-message' }),
  clip({ id: CLIP_DAY, lesson: L, kind: 'text', transcript: T_DAY, translationUk: U_DAY, targets: [LM, LD], family: 'long-day' }),
];

const transcriptHint = (keys, text) => ({ kind: 'transcript', targets: keys, blocks: [es(text)] });
const translationHint = (keys, text) => ({ kind: 'translation', targets: keys, blocks: [uk(text)] });

function linkRead(n, role, family, text, question, options, revealUk, supported = false) {
  return choice({
    id: num(n), lesson: L, role, family, target: LK_R,
    prompt: [uk(`${family === 'messages' ? 'Прочитайте повідомлення' : 'Прочитайте'} і дайте відповідь.${supported ? ' Підказка: primero — «спочатку», después — «потім», al final — «наприкінці».' : ''}`), es(text), uk(question)],
    options, rule: LK_RULE, full: text, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. ${revealUk}`,
  });
}

function linkWrite(n, role, family, instr, sentence, answers, errors, full, fullUk, extra = {}) {
  return exact({
    id: num(n), lesson: L, role, family, target: LK_C, policy: SENTENCE,
    prompt: [uk(instr), ...(extra.model ? [ex(...extra.model)] : []), ...(sentence ? [es(sentence)] : [])],
    answers, errors, closed: false, rule: LK_RULE, full, fullUk,
    ok: `Правильно: ${full}`, bad: `Порівняйте: ${full}`, unresolved: UNRES,
  });
}

function read(n, role, family, text, translation, question, options, revealEs, revealUk) {
  return choice({
    id: num(n), lesson: L, role, family, target: RD,
    prompt: [uk('Прочитайте текст і дайте відповідь.'), es(text), uk(question)],
    options, rule: 'Читаючи, з’ясовуємо, що сталося, у якому порядку, коли і з ким.',
    extraHints: [translationHint(['reading.past-sequence/reading-meaning'], translation)],
    full: revealEs, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. У тексті: «${revealEs}» — ${revealUk}`,
  });
}

function listen(n, role, clipId, question, options, revealEs, revealUk) {
  const k = ['listening.past-sequence/listening-meaning'];
  const wknd = clipId === CLIP_WKND;
  return choice({
    id: num(n), lesson: L, role, family: wknd ? 'weekend-message' : 'long-day', target: LM, clipIds: [clipId],
    prompt: [uk('Прослухайте запис і дайте відповідь.'), uk(question)],
    options,
    extraHints: [transcriptHint(k, wknd ? T_WKND : T_DAY), translationHint(k, wknd ? U_WKND : U_DAY)],
    full: revealEs, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. У записі: «${revealEs}» — ${revealUk}`,
  });
}

const CRITERIA = [
  'Зміст: текст відповідає завданню.',
  'Події йдуть по черзі, і це видно зі слів послідовності (primero, después, luego, al final, al día siguiente…).',
  'Форми простого минулого часу правильні, зокрема особливі (fui, hice, tuve, estuve, vi…).',
  'Час доречний: завершені події з указівкою часу (ayer, el sábado pasado…).',
  'Довжина — орієнтир, а не вимога: приблизно 3–5 речень.',
];
const W_UNRES = 'Вільний текст автоматично не оцінюємо: порівняйте свою відповідь з критеріями і зразком. Зразок — лише один із можливих варіантів.';
const PHRASES = ukList([
  'El sábado pasado… / Ayer… — коли',
  'Primero… y después… / Luego… — по черзі',
  'Al día siguiente… — наступного дня',
  'Al final… / Por fin… — наприкінці, нарешті',
]);
function write(n, role, family, instr, extraPrompt, exemplar, exemplarUk, rule) {
  return rubric({
    id: num(n), lesson: L, role, family, target: WR,
    prompt: [uk(instr), ...extraPrompt, PHRASES],
    criteria: CRITERIA, exemplars: [exemplar], rule,
    full: exemplar, fullUk: exemplarUk,
    ok: 'Ваш текст збігається зі зразком.', bad: 'Порівняйте свій текст із критеріями і зразком.', unresolved: W_UNRES,
  });
}

const tasks = [
  // ---------- link.past-sequence: construction ----------
  linkWrite(1, 'supported', 'routine', 'Впишіть дієслово в дужках у правильній формі. Зразок нижче.', 'Después de ___ (comer), dormí un poco.',
    ['comer'],
    [['comí', 'Після después de ставимо інфінітив: después de comer.'], ['comiendo', 'Після después de ставимо інфінітив, а не герундій: después de comer.']],
    'Después de comer, dormí un poco.', 'Після обіду я трохи поспав(-ла).',
    { model: ['Después de cenar, vimos una película.', 'Після вечері ми подивилися фільм.'] }),
  linkWrite(2, 'independent', 'travel', 'Впишіть вираз, що означає «наступного дня».', 'Llegué a Toledo el sábado. ___ vi el museo.',
    ['Al día siguiente', 'El día siguiente'],
    [['Al siguiente día', 'Звичний порядок слів: al día siguiente.'], ['Después día', '«Наступного дня» — al día siguiente.']],
    'Llegué a Toledo el sábado. Al día siguiente vi el museo.', 'Я приїхав(-ла) до Толедо в суботу. Наступного дня я подивився(-лася) музей.'),
  linkWrite(3, 'delayed', 'leisure', 'Перекладіть іспанською: «Спочатку ми пообідали, а потім пішли в кіно».', null,
    ['Primero comimos y después fuimos al cine.', 'Primero comimos y luego fuimos al cine.', 'Primero comimos, después fuimos al cine.', 'Primero comimos, luego fuimos al cine.', 'Primero comimos y más tarde fuimos al cine.'],
    [['Primero comemos y después vamos al cine.', 'Це теперішній час. Ідеться про минулі події: comimos, fuimos.'], ['Primero comimos y después fueron al cine.', 'Fueron — «вони». Ми пішли — fuimos.']],
    'Primero comimos y después fuimos al cine.', 'Спочатку ми пообідали, а потім пішли в кіно.'),
  linkWrite(4, 'transfer', 'messages', 'Повідомлення. Впишіть вираз, що означає «наступного дня».', '¡Hola, Ana! El viernes llegué muy tarde a casa. ___ me levanté a las diez.',
    ['Al día siguiente', 'El día siguiente'],
    [['Al siguiente día', 'Звичний порядок слів: al día siguiente.']],
    '¡Hola, Ana! El viernes llegué muy tarde a casa. Al día siguiente me levanté a las diez.', 'Привіт, Ано! У п’ятницю я дуже пізно повернувся(-лася) додому. Наступного дня встав(-ла) о десятій.'),

  // ---------- link.past-sequence: reading ----------
  linkRead(5, 'supported', 'routine', 'Primero fui al supermercado, después hice la comida y al final dormí un poco.', 'Що людина зробила спочатку?',
    [['Пішла в супермаркет.', true], ['Приготувала обід.', false, 'Це було потім: después hice la comida.'], ['Трохи поспала.', false, 'Це було наприкінці: al final dormí un poco.']],
    'Спочатку я сходив(-ла) в супермаркет, потім приготував(-ла) обід, а наприкінці трохи поспав(-ла).', true),
  linkRead(6, 'independent', 'home', 'Antes de salir de casa, Luis cerró las ventanas.', 'Що Луїс зробив раніше?',
    [['Зачинив вікна.', true], ['Вийшов з дому.', false, 'Antes de salir — «перед тим як вийти»: спочатку він зачинив вікна.']],
    'Перед тим як вийти з дому, Луїс зачинив вікна.'),
  linkRead(7, 'delayed', 'travel', 'Llegamos a Sevilla el lunes. Al día siguiente vimos el museo.', 'Коли вони були в музеї?',
    [['У вівторок.', true], ['У понеділок.', false, 'У понеділок вони приїхали; al día siguiente — «наступного дня», тобто у вівторок.'], ['У неділю.', false, 'Al día siguiente — день після понеділка.']],
    'Ми приїхали до Севільї в понеділок. Наступного дня подивилися музей.'),
  linkRead(8, 'transfer', 'messages', '¡Hola, Pablo! Ayer esperé el autobús una hora. Por fin llegué a casa a las diez.', 'Що тут означає «por fin»?',
    [['Нарешті.', true], ['Спочатку.', false, 'Спочатку — primero.'], ['Наступного дня.', false, 'Наступного дня — al día siguiente.']],
    'Привіт, Пабло! Учора я годину чекав(-ла) автобус. Нарешті о десятій я дістався(-лася) додому.'),

  // ---------- reading.past-sequence ----------
  read(9, 'independent', 'weekend-account', TEXT_A, UK_A, 'Що вони зробили спочатку?',
    [['Подивилися музей.', true], ['Пообідали в ресторані.', false], ['Гуляли містом.', false]],
    'Primero vimos el museo.', 'Спочатку ми подивилися музей.'),
  read(10, 'independent', 'weekend-account', TEXT_A, UK_A, 'Як і коли вони повернулися до Мадрида?',
    [['Потягом о дев’ятій.', true], ['Автобусом о дев’ятій.', false], ['Потягом наступного дня.', false]],
    'Al final volvimos a Madrid en tren a las nueve.', 'Наприкінці о дев’ятій ми повернулися до Мадрида потягом.'),
  read(11, 'delayed', 'weekend-account', TEXT_A, UK_A, 'Що вони робили по обіді?',
    [['Гуляли містом.', true], ['Дивилися музей.', false], ['Їхали потягом до Толедо.', false]],
    'Por la tarde paseamos por la ciudad.', 'По обіді ми гуляли містом.'),
  read(12, 'transfer', 'biography', TEXT_B, UK_B, 'Що Кармен робила після університету?',
    [['Два роки працювала в банку.', true], ['Одразу переїхала до Мадрида.', false], ['Почала працювати в готелі у Валенсії.', false]],
    'Después trabajó dos años en un banco.', 'Потім вона два роки працювала в банку.'),

  // ---------- listening.past-sequence ----------
  listen(13, 'independent', CLIP_WKND, 'Куди Луїс із батьками пішли спочатку у Валенсії?',
    [['На пляж.', true], ['У ресторан.', false], ['У центр міста.', false]],
    'Primero fuimos a la playa.', 'Спочатку ми пішли на пляж.'),
  listen(14, 'delayed', CLIP_WKND, 'Коли вони повернулися до Мадрида?',
    [['Наступного дня.', true], ['У суботу ввечері.', false], ['Через тиждень.', false]],
    'Al día siguiente volvimos a Madrid.', 'Наступного дня ми повернулися до Мадрида.'),
  listen(15, 'independent', CLIP_DAY, 'Як автор їхав в офіс?',
    [['Автобусом.', true], ['Потягом.', false], ['Машиною.', false]],
    'Fui a la oficina en autobús.', 'Я поїхав(-ла) в офіс автобусом.'),
  listen(16, 'delayed', CLIP_DAY, 'Що автор зробив, коли повернувся додому?',
    [['Приготував вечерю й нарешті трохи відпочив.', true], ['Написав багато електронних листів.', false], ['Пішов на нараду.', false]],
    'Hice la cena y por fin descansé un poco.', 'Я приготував(-ла) вечерю й нарешті трохи відпочив(-ла).'),
  exact({
    id: num(17), lesson: L, role: 'independent', family: 'long-day', target: LD, clipIds: [CLIP_DAY],
    input: 'short', policy: SENTENCE,
    prompt: [uk('Диктант. Прослухайте запис і запишіть останнє речення — про вечір удома.')],
    answers: [DICTATION],
    errors: [
      ['A las ocho volvi a casa, hice la cena y por fin descanse un poco.', 'У формах volví і descansé обов’язковий знак наголосу.'],
      ['A las ocho volví a casa, ice la cena y por fin descansé un poco.', 'Hice пишемо з h.'],
    ],
    closed: false,
    extraHints: [transcriptHint(['listening.past-sequence/dictation'], T_DAY)],
    full: DICTATION, fullUk: 'О восьмій я повернувся(-лася) додому, приготував(-ла) вечерю й нарешті трохи відпочив(-ла).',
    ok: 'Правильно записано.', bad: `Порівняйте: ${DICTATION}`,
    unresolved: `Ваш запис відрізняється від перевірених варіантів. Порівняйте його з текстом: ${DICTATION}`,
  }),

  // ---------- writing.past-sequence ----------
  write(18, 'independent', 'weekend', 'Напишіть 3–5 речень про свої минулі вихідні: що ви робили і в якому порядку.', [],
    'El sábado pasado me levanté tarde. Primero desayuné con mi familia y después fui al parque. Por la tarde vi una película con mis amigos. Al día siguiente hice la compra y por fin descansé.',
    'Минулої суботи я пізно встав(-ла). Спочатку поснідав(-ла) з родиною, а потім пішов (пішла) в парк. По обіді подивився(-лася) фільм із друзями. Наступного дня купив(-ла) продукти й нарешті відпочив(-ла).',
    'Пишемо про завершені події в простому минулому часі й показуємо порядок: Primero…, después…, al día siguiente…'),
  write(19, 'delayed', 'yesterday', 'Напишіть 3–5 речень про свій учорашній день: що ви робили зранку, удень і ввечері.', [],
    'Ayer me levanté a las siete. Primero fui a clase y después comí con Ana. Por la tarde estudié en casa. Al final cené con mis padres y vi una película.',
    'Учора я встав(-ла) о сьомій. Спочатку пішов (пішла) на заняття, а потім пообідав(-ла) з Аною. По обіді вчився(-лася) вдома. Наприкінці повечеряв(-ла) з батьками й подивився(-лася) фільм.',
    'Про вчорашній день пишемо в простому минулому часі: Ayer me levanté…, Primero fui…'),
  write(20, 'transfer', 'reply-message', 'Подруга пише вам повідомлення. Ви справді були в суботу в Толедо. Напишіть відповідь: що ви робили і в якому порядку.', [es('¡Hola! ¿Qué tal el sábado en Toledo?')],
    '¡Hola, Marta! El sábado fue genial. Primero vimos el museo y después comimos en un restaurante muy bonito. Por la tarde paseamos por el centro. Volvimos a Madrid en tren a las ocho. ¡Un beso!',
    'Привіт, Марто! Субота була чудова. Спочатку ми подивилися музей, а потім пообідали в дуже гарному ресторані. По обіді гуляли центром. До Мадрида повернулися потягом о восьмій. Цілую!',
    'Відповідаємо про завершені події в простому минулому часі: Primero vimos…, después comimos…'),
];

const ids = (...n) => n.map((x) => `${L}-${num(x)}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Розповідь про минулі події: по черзі',
    termEs: 'relato de hechos pasados',
    summaryUk:
      'Поєднуємо простий минулий час зі словами послідовності (primero, después, al final, al día siguiente, por fin): читаємо і слухаємо короткі розповіді, а потім пишемо власну.',
    objectives: ['A2-04-O9', 'A2-04-O10'],
    cv: ['CV-04', 'CV-06'],
    situations: ['routine-study-leisure', 'personal-messages', 'time-appointments-transport'],
    estimatedMinutes: 20,
    introduces: ['link.past-sequence', 'reading.past-sequence', 'listening.past-sequence', 'writing.past-sequence'],
    revisits: ['link.sequence', 'link.sequence.antes-despues-de', 'listening.past-events', 'indefinido.use-completed-event', 'indefinido.ser-ir', 'time.hace-ago', 'indefinido.hacer', 'indefinido.tener'],
    steps: [
      step('s1', 'explanation', 'Події по черзі', true, {
        blocks: [
          uk('Слова послідовності ви вже знаєте: primero, después, luego, más tarde, al final, después de + інфінітив. Тепер поєднуємо їх із простим минулим часом. Нові вирази: al día siguiente — «наступного дня», por fin — «нарешті».'),
          ex('Primero desayuné y después salí de casa.', 'Спочатку я поснідав(-ла), а потім вийшов (вийшла) з дому.'),
          ex('Después de comer, dormí un poco.', 'Після обіду я трохи поспав(-ла).'),
          ex('Llegamos el sábado. Al día siguiente vimos el museo.', 'Ми приїхали в суботу. Наступного дня подивилися музей.'),
          ex('Esperé una hora. Por fin llegó el autobús.', 'Я чекав(-ла) годину. Нарешті приїхав автобус.'),
        ],
      }),
      step('s2', 'supported-practice', 'Практика зі зразком', true, { taskIds: ids(1, 5) }),
      step('s3', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(2, 6) }),
      step('s4', 'reading', 'Читаємо: субота в Толедо', true, {
        blocks: [uk('Прочитайте розповідь. Стежте, що сталося спочатку, потім і наприкінці.'), es(TEXT_A)],
        taskIds: ids(9, 10),
      }),
      step('s5', 'listening', 'Слухаємо: два повідомлення', true, {
        blocks: [uk('Слухайте стільки разів, скільки потрібно; текст і переклад можна відкрити як підказку. Диктант — окреме завдання: помилка в написанні не означає, що ви не зрозуміли змісту.')],
        clipIds: [CLIP_WKND, CLIP_DAY],
        taskIds: ids(13, 15, 17),
      }),
      step('s6', 'writing', 'Пишемо свою розповідь', true, {
        blocks: [
          uk('Напишіть кілька речень про минулі події. Корисні вирази:'),
          PHRASES,
          uk('Зразок у підказці — лише приклад. Змістовна відповідь, що відрізняється від зразка, не вважається помилкою: її можна перевірити за критеріями.'),
        ],
        taskIds: ids(18),
      }),
      step('s7', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'Простий минулий час + слова послідовності: primero, después, luego, al final.',
            'Al día siguiente — «наступного дня»; por fin — «нарешті».',
            'Після después de / antes de — інфінітив: después de comer.',
            'Читаючи й слухаючи, стежимо, що сталося, у якому порядку і коли.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
  clips,
};
