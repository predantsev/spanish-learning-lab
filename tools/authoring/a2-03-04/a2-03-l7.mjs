// A2-03-L7 — a short account or message (A2-03-O8/O9): reading, listening (connected clips) and
// free writing with a rubric. Reading/listening evidence is meaning only; spelling is assessed only
// in the separate dictation task. Free writing is never auto-failed: anything but an exact exemplar
// is unresolved and shown next to the example answer.
import { FREE_TEXT, SENTENCE, choice, clip, es, ex, exact, lesson, rubric, step, uk, ukList } from './lib.mjs';

const L = 'A2-03-L7';
const RD = ['reading.perfecto-account', 'reading-meaning'];
const LM = ['listening.perfecto-account', 'listening-meaning'];
const LD = ['listening.perfecto-account', 'dictation'];
const WR = ['writing.perfecto-account', 'construction-use'];

const TEXT_A = '¡Hola, Marta! ¿Qué tal? Hoy ha sido un día muy largo. Esta mañana he ido a la universidad y he tenido un examen. Después he comido con Pablo en un restaurante del centro. Por la tarde he vuelto a casa, pero todavía no he hecho la compra y no hay nada en la nevera. ¿Y tú? ¿Has terminado el trabajo? Un abrazo, Lucía.';
const UK_A = 'Привіт, Марто! Як справи? Сьогодні був дуже довгий день. Зранку я ходила до університету й писала іспит. Потім обідала з Пабло в ресторані в центрі. Пообіді повернулася додому, але ще не купила продуктів, і в холодильнику нічого немає. А ти? Ти закінчила роботу? Обіймаю, Лусія.';
const TEXT_B = 'Me llamo Andrés y vivo en Valencia. Me gusta mucho viajar. He estado en Madrid, en Barcelona y en Sevilla, pero nunca he estado en Toledo. Este año he aprendido un poco de inglés y este mes he leído tres libros. Todavía no he ido a Ucrania, pero quiero ir el año que viene.';
const UK_B = 'Мене звати Андрес, я живу у Валенсії. Я дуже люблю подорожувати. Я бував у Мадриді, Барселоні та Севільї, але ніколи не був у Толедо. Цього року я трохи вивчив англійську, а цього місяця прочитав три книжки. В Україні я ще не був, але хочу поїхати туди наступного року.';
const TEXT_C = 'Mamá: he hecho la compra y he puesto la fruta en la cocina. Los niños ya han comido y ahora están en el parque con Marta. Todavía no he hecho la cena: vuelvo a las ocho. Un beso, Luis.';
const UK_C = 'Мамо, я купив продукти й поклав фрукти на кухні. Діти вже поїли й зараз гуляють у парку з Мартою. Вечерю я ще не приготував: повернуся о восьмій. Цілую, Луїс.';

const CLIP_DAY = 'clip.a2-03.l7.day-message';
const CLIP_TRAVEL = 'clip.a2-03.l7.travel-profile';
const T_DAY = 'Hola, Ana, soy Pablo. ¿Qué tal? Yo estoy muy cansado: hoy he trabajado diez horas y he comido muy tarde. Después he ido al supermercado y he hecho la compra. Ahora estoy en casa con mis padres. Y tú, ¿has terminado el examen? Un beso. Hasta mañana.';
const U_DAY = 'Привіт, Ано, це Пабло. Як справи? Я дуже втомився: сьогодні я працював десять годин і обідав дуже пізно. Потім сходив у супермаркет і купив продукти. Зараз я вдома з батьками. А ти закінчила іспит? Цілую. До завтра.';
const T_TRAVEL = 'Me llamo Carmen y vivo en Madrid. He viajado mucho: he estado en Sevilla, en Valencia y en Barcelona, pero nunca he estado en Toledo. Este año he trabajado mucho y todavía no he tenido vacaciones. Y este verano todavía no he ido a la playa.';
const U_TRAVEL = 'Мене звати Кармен, я живу в Мадриді. Я багато подорожувала: була в Севільї, Валенсії та Барселоні, але ніколи не була в Толедо. Цього року я багато працювала і ще не мала відпустки. І цього літа я ще не була на пляжі.';
const DICTATION = 'Este año he trabajado mucho y todavía no he tenido vacaciones.';

const clips = [
  clip({ id: CLIP_DAY, lesson: L, kind: 'text', transcript: T_DAY, translationUk: U_DAY, targets: [LM], family: 'day-message' }),
  clip({ id: CLIP_TRAVEL, lesson: L, kind: 'text', transcript: T_TRAVEL, translationUk: U_TRAVEL, targets: [LM, LD], family: 'travel-profile' }),
];

const RD_RULE = 'Читаючи, шукаємо, що людина вже зробила (perfecto з hoy, esta mañana…), чого ще не зробила (todavía no) і який має досвід (nunca, alguna vez).';
const transcriptHint = (keys, text) => ({ kind: 'transcript', targets: keys, blocks: [es(text)] });
const translationHint = (keys, text) => ({ kind: 'translation', targets: keys, blocks: [uk(text)] });

function read(id, role, family, text, translation, question, options, revealEs, revealUk) {
  return choice({
    id, lesson: L, role, family, target: RD,
    prompt: [uk('Прочитайте текст і дайте відповідь.'), es(text), uk(question)],
    options, rule: RD_RULE,
    extraHints: [translationHint(['reading.perfecto-account/reading-meaning'], translation)],
    full: revealEs, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. У тексті: «${revealEs}» — ${revealUk}`,
  });
}

function listen(id, role, clipId, transcript, translation, question, options, revealEs, revealUk) {
  const k = ['listening.perfecto-account/listening-meaning'];
  return choice({
    id, lesson: L, role, family: clipId === CLIP_DAY ? 'day-message' : 'travel-profile', target: LM, clipIds: [clipId],
    prompt: [uk('Прослухайте запис і дайте відповідь.'), uk(question)],
    options,
    extraHints: [transcriptHint(k, transcript), translationHint(k, translation)],
    full: revealEs, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. У записі: «${revealEs}» — ${revealUk}`,
  });
}

const CRITERIA = [
  'Зміст: відповідь стосується теми завдання.',
  'Форми haber відповідають особі (he, has, ha, hemos, habéis, han).',
  'Дієприкметники правильні, зокрема особливі (hecho, visto, escrito, puesto, vuelto…).',
  'Perfecto вжито доречно: про сьогодні, цей тиждень чи досвід; є слова часу (hoy, esta mañana, ya, todavía no, nunca…).',
  'Довжина — орієнтир, а не вимога: приблизно 3–4 речення.',
];
const W_UNRES = 'Вільний текст автоматично не оцінюємо: порівняйте свою відповідь з критеріями і зразком. Зразок — лише один із можливих варіантів.';
const PHRASES = ukList([
  'Hoy he… / Esta mañana he… — що зроблено сьогодні',
  'Todavía no he… — чого ще не зроблено',
  'Ya he… — що вже зроблено',
  'He estado en… / Nunca he… — досвід',
]);

const tasks = [
  // ---------- reading.perfecto-account ----------
  read('T01', 'independent', 'message-day', TEXT_A, UK_A, 'Що Лусія робила зранку?',
    [['Ходила до університету й писала іспит.', true], ['Обідала з Пабло в ресторані.', false], ['Купувала продукти.', false], ['Працювала вдома.', false]],
    'Esta mañana he ido a la universidad y he tenido un examen.', 'Зранку я ходила до університету й писала іспит.'),
  read('T02', 'independent', 'message-day', TEXT_A, UK_A, 'Чого Лусія ще не зробила?',
    [['Не купила продуктів.', true], ['Не писала іспиту.', false], ['Не обідала.', false]],
    'Todavía no he hecho la compra.', 'Я ще не купила продуктів.'),
  read('T03', 'delayed', 'message-day', TEXT_A, UK_A, 'Про що Лусія питає Марту?',
    [['Чи закінчила Марта роботу.', true], ['Чи писала Марта іспит.', false], ['Чи купила Марта продукти.', false]],
    '¿Has terminado el trabajo?', 'Ти закінчила роботу?'),
  read('T04', 'independent', 'profile', TEXT_B, UK_B, 'Де Андрес ніколи не був?',
    [['У Толедо.', true], ['У Мадриді.', false], ['У Севільї.', false]],
    'Nunca he estado en Toledo.', 'Я ніколи не був у Толедо.'),
  read('T05', 'delayed', 'profile', TEXT_B, UK_B, 'Що Андрес зробив цього місяця?',
    [['Прочитав три книжки.', true], ['Поїхав в Україну.', false], ['Побував у Толедо.', false]],
    'Este mes he leído tres libros.', 'Цього місяця я прочитав три книжки.'),
  read('T06', 'transfer', 'home-note', TEXT_C, UK_C, 'Чого Луїс ще не зробив?',
    [['Не приготував вечерю.', true], ['Не купив продуктів.', false], ['Не нагодував дітей.', false]],
    'Todavía no he hecho la cena.', 'Вечерю я ще не приготував.'),

  // ---------- listening.perfecto-account ----------
  listen('T07', 'independent', CLIP_DAY, T_DAY, U_DAY, 'Чому Пабло втомився?',
    [['Сьогодні він працював десять годин.', true], ['Він погано спав.', false], ['Він писав іспит.', false]],
    'Hoy he trabajado diez horas.', 'Сьогодні я працював десять годин.'),
  listen('T08', 'delayed', CLIP_DAY, T_DAY, U_DAY, 'Що Пабло зробив після роботи?',
    [['Сходив у супермаркет і купив продукти.', true], ['Пішов у кіно.', false], ['Приготував вечерю для батьків.', false]],
    'Después he ido al supermercado y he hecho la compra.', 'Потім я сходив у супермаркет і купив продукти.'),
  listen('T09', 'independent', CLIP_TRAVEL, T_TRAVEL, U_TRAVEL, 'Де Кармен ніколи не була?',
    [['У Толедо.', true], ['У Севільї.', false], ['У Барселоні.', false]],
    'Nunca he estado en Toledo.', 'Я ніколи не була в Толедо.'),
  listen('T10', 'delayed', CLIP_TRAVEL, T_TRAVEL, U_TRAVEL, 'Чого в Кармен цього року ще не було?',
    [['Відпустки.', true], ['Роботи.', false, 'Навпаки: «este año he trabajado mucho» — цього року вона багато працювала.']],
    'Este año he trabajado mucho y todavía no he tenido vacaciones.', 'Цього року я багато працювала і ще не мала відпустки.'),
  exact({
    id: 'T11', lesson: L, role: 'independent', family: 'travel-profile', target: LD, clipIds: [CLIP_TRAVEL],
    input: 'short', policy: SENTENCE,
    prompt: [uk('Диктант. Прослухайте розповідь Кармен і запишіть третє речення — про роботу й відпустку.')],
    answers: [DICTATION],
    errors: [
      ['Este año e trabajado mucho y todavía no e tenido vacaciones.', 'He пишемо з h: he trabajado, he tenido.'],
      ['Este año he trabajado mucho y todavia no he tenido vacaciones.', 'У слові todavía над i пишемо знак наголосу.'],
      ['Este ano he trabajado mucho y todavía no he tenido vacaciones.', 'У слові año пишемо ñ.'],
    ],
    closed: false,
    extraHints: [transcriptHint(['listening.perfecto-account/dictation'], T_TRAVEL)],
    full: DICTATION, fullUk: 'Цього року я багато працювала і ще не мала відпустки.',
    ok: 'Правильно записано.', bad: `Порівняйте: ${DICTATION}`,
    unresolved: `Ваш запис відрізняється від перевірених варіантів. Порівняйте його з текстом: ${DICTATION}`,
  }),

  // ---------- writing.perfecto-account ----------
  rubric({
    id: 'T12', lesson: L, role: 'independent', family: 'reply-day', target: WR,
    prompt: [uk('Відповідайте на повідомлення Лусії: напишіть 3–4 речення про свій день — що ви вже зробили сьогодні і чого ще не зробили.'), es(TEXT_A), PHRASES],
    criteria: CRITERIA,
    exemplars: ['¡Hola, Lucía! Hoy he trabajado en casa. Esta mañana he escrito tres correos electrónicos y después he comido con mi hermana. Todavía no he hecho la compra. Un abrazo.'],
    rule: 'Пишемо, що вже зробили сьогодні (Hoy he…, Esta mañana he…) і чого ще не зробили (Todavía no he…).',
    full: '¡Hola, Lucía! Hoy he trabajado en casa. Esta mañana he escrito tres correos electrónicos y después he comido con mi hermana. Todavía no he hecho la compra. Un abrazo.',
    fullUk: 'Привіт, Лусіє! Сьогодні я працював(-ла) вдома. Зранку написав(-ла) три електронні листи, а потім обідав(-ла) із сестрою. Продуктів я ще не купив(-ла). Обіймаю.',
    ok: 'Ваш текст збігається зі зразком.', bad: 'Порівняйте свій текст із критеріями і зразком.', unresolved: W_UNRES,
  }),
  rubric({
    id: 'T13', lesson: L, role: 'delayed', family: 'experience', target: WR,
    prompt: [uk('Напишіть 3–4 речення про свій досвід: де ви вже були, що робили і чого ніколи не робили.'), PHRASES],
    criteria: CRITERIA,
    exemplars: ['He estado en Madrid y en Valencia, pero nunca he estado en Sevilla. He visto muchas películas españolas. Todavía no he viajado a Barcelona.'],
    rule: 'Про досвід пишемо в perfecto: He estado en…, Nunca he…, Todavía no he…',
    full: 'He estado en Madrid y en Valencia, pero nunca he estado en Sevilla. He visto muchas películas españolas. Todavía no he viajado a Barcelona.',
    fullUk: 'Я бував(-ла) у Мадриді й Валенсії, але ніколи не був(-ла) у Севільї. Я бачив(-ла) багато іспанських фільмів. До Барселони я ще не їздив(-ла).',
    ok: 'Ваш текст збігається зі зразком.', bad: 'Порівняйте свій текст із критеріями і зразком.', unresolved: W_UNRES,
  }),
  rubric({
    id: 'T14', lesson: L, role: 'transfer', family: 'week-message', target: WR,
    prompt: [uk('Друг пише вам: «¿Qué tal la semana?» Напишіть відповідь — 3–4 речення про цей тиждень.'), PHRASES],
    criteria: CRITERIA,
    exemplars: ['¡Hola, Pablo! Esta semana he trabajado mucho y he dormido poco. He ido al gimnasio dos veces y he visto una película muy interesante. Todavía no he hecho la compra. ¿Y tú?'],
    rule: 'Про цей тиждень, який ще триває, пишемо в perfecto: Esta semana he…',
    full: '¡Hola, Pablo! Esta semana he trabajado mucho y he dormido poco. He ido al gimnasio dos veces y he visto una película muy interesante. Todavía no he hecho la compra. ¿Y tú?',
    fullUk: 'Привіт, Пабло! Цього тижня я багато працював(-ла) і мало спав(-ла). Двічі ходив(-ла) у спортзал і подивився(-лася) дуже цікавий фільм. Продуктів ще не купив(-ла). А ти?',
    ok: 'Ваш текст збігається зі зразком.', bad: 'Порівняйте свій текст із критеріями і зразком.', unresolved: W_UNRES,
  }),
];

const ids = (...n) => n.map((x) => `${L}-T${String(x).padStart(2, '0')}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Розповідь про день і досвід: читаємо, слухаємо, пишемо',
    termEs: 'relato breve en pretérito perfecto compuesto',
    summaryUk:
      'Короткі повідомлення й розповіді в perfecto: розуміємо, що людина вже зробила, чого ще не зробила і який має досвід, а потім пишемо власну відповідь.',
    objectives: ['A2-03-O8', 'A2-03-O9'],
    situations: ['personal-messages', 'routine-study-leisure', 'places-accommodation'],
    estimatedMinutes: 20,
    introduces: ['reading.perfecto-account', 'listening.perfecto-account', 'writing.perfecto-account'],
    revisits: ['perfecto.use-current-period', 'perfecto.use-experience', 'perfecto.choice-context', 'perfecto.pronoun-placement', 'listening.perfecto-sentences', 'participle.hecho', 'participle.vuelto', 'participle.puesto', 'participle.ido-accent', 'formula.message-opening-closing', 'reading.personal-message'],
    steps: [
      step('s1', 'reading', 'Читаємо: повідомлення Лусії', true, {
        blocks: [uk('Прочитайте повідомлення. Шукайте, що Лусія вже зробила і чого ще ні.'), es(TEXT_A)],
        taskIds: ids(1, 2),
      }),
      step('s2', 'reading', 'Читаємо: Андрес про себе', true, {
        blocks: [uk('Прочитайте, що Андрес розповідає про свій досвід.'), es(TEXT_B)],
        taskIds: ids(4),
      }),
      step('s3', 'listening', 'Слухаємо: два голосові повідомлення', true, {
        blocks: [uk('Слухайте стільки разів, скільки потрібно; текст і переклад можна відкрити як підказку. Диктант — окреме завдання: помилка в написанні не означає, що ви не зрозуміли змісту.')],
        clipIds: [CLIP_DAY, CLIP_TRAVEL],
        taskIds: ids(7, 9, 11),
      }),
      step('s4', 'writing', 'Пишемо відповідь', true, {
        blocks: [
          uk('Напишіть кілька речень про свій день. Корисні вирази:'),
          PHRASES,
          uk('Зразок у підказці — лише приклад. Змістовна відповідь, що відрізняється від зразка, не вважається помилкою: її можна перевірити за критеріями.'),
        ],
        taskIds: ids(12),
      }),
      step('s5', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'У розповіді про день шукаємо hoy / esta mañana + perfecto: що вже зроблено.',
            'Todavía no + perfecto — чого ще не зроблено; nunca / alguna vez — досвід.',
            'У власному тексті: правильна форма haber, правильний дієприкметник і доречний час.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
  clips,
};
