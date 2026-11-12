// A2-04-L2 — regular -er/-ir pretérito indefinido (A2-04-O2), the nosotros syncretism note
// (incidental, never assessed) and the first past-event listening clips (A2-04-O9).
// Clips use only regular forms taught in L1–L2: no yo -qué/-gué/-cé, no 3rd-person stem changes,
// no irregular stems.
import { SENTENCE, choice, clip, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-04-L2';
const ERIR = ['indefinido.regular-er-ir', 'written-form'];
const LM = ['listening.past-events', 'listening-meaning'];
const LD = ['listening.past-events', 'dictation'];

export const ERIR_TABLE = esTable(['sujeto', 'comer', 'vivir'], [
  ['yo', 'comí', 'viví'],
  ['tú', 'comiste', 'viviste'],
  ['él / ella / usted', 'comió', 'vivió'],
  ['nosotros / nosotras', 'comimos', 'vivimos'],
  ['vosotros / vosotras', 'comisteis', 'vivisteis'],
  ['ellos / ellas / ustedes', 'comieron', 'vivieron'],
]);
const RULE = 'Простий минулий час дієслів на -er та -ir (закінчення однакові): -í, -iste, -ió, -imos, -isteis, -ieron (comí, comiste, comió, comimos, comisteis, comieron). У формах yo і él / ella / usted обов’язковий знак наголосу.';
const INSTR = 'Впишіть дієслово в дужках у простому минулому часі (pretérito indefinido).';
const ACCENT = (f) => `Майже: у цій формі обов’язковий знак наголосу — ${f}.`;
const PRESENT = (wrong, f) => `${wrong} — теперішній час. Ідеться про минуле: ${f}.`;

function gap(id, role, family, sentence, answer, errors, full, fullUk, extra = {}) {
  const prompt = [uk(extra.instr ?? (extra.model ? `${INSTR} Скористайтеся таблицею.` : INSTR))];
  if (extra.model) prompt.push(extra.model);
  prompt.push(es(sentence));
  return exact({
    id, lesson: L, role, family, target: ERIR, prompt, answers: [answer], closed: true, errors,
    rule: RULE, clue: extra.clue, full, fullUk,
    ok: `Правильно: ${answer}.`, bad: `Правильна форма — ${answer}: ${full}`,
  });
}

// ---------- clips ----------
const CLIP_YDAY = 'clip.a2-04.l2.yesterday-message';
const CLIP_WKND = 'clip.a2-04.l2.weekend-story';
const T_YDAY = 'Hola, Carlos, soy Elena. Ayer trabajé mucho y cené en casa de mis padres. Después salí con Marta y bailamos un poco. Hoy estoy muy cansada. ¿Comemos mañana?';
const U_YDAY = 'Привіт, Карлосе, це Елена. Учора я багато працювала і вечеряла в батьків. Потім я пішла гуляти з Мартою, і ми трохи потанцювали. Сьогодні я дуже втомлена. Пообідаємо завтра?';
const T_WKND = 'El fin de semana pasado mis amigos y yo viajamos a Valencia. El sábado comimos en la playa y nadamos mucho. El domingo por la mañana compramos unos regalos y por la tarde volvimos a Madrid en tren.';
const U_WKND = 'Минулих вихідних ми з друзями їздили до Валенсії. У суботу ми обідали на пляжі й багато плавали. У неділю вранці купили подарунки, а ввечері повернулися до Мадрида потягом.';
const DICT = 'El sábado comimos en la playa y nadamos mucho.';

const clips = [
  clip({ id: CLIP_YDAY, lesson: L, kind: 'text', transcript: T_YDAY, translationUk: U_YDAY, targets: [LM], family: 'yesterday-message' }),
  clip({ id: CLIP_WKND, lesson: L, kind: 'text', transcript: T_WKND, translationUk: U_WKND, targets: [LM, LD], family: 'weekend-story' }),
];

const transcriptHint = (keys, text) => ({ kind: 'transcript', targets: keys, blocks: [es(text)] });
const translationHint = (keys, text) => ({ kind: 'translation', targets: keys, blocks: [uk(text)] });
function listen(id, role, clipId, transcript, translation, question, options, revealEs, revealUk) {
  const k = ['listening.past-events/listening-meaning'];
  return choice({
    id, lesson: L, role, family: clipId === CLIP_YDAY ? 'yesterday-message' : 'weekend-story', target: LM, clipIds: [clipId],
    prompt: [uk('Прослухайте запис і дайте відповідь.'), uk(question)],
    options, extraHints: [transcriptHint(k, transcript), translationHint(k, translation)],
    full: revealEs, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. У записі: «${revealEs}» — ${revealUk}`,
  });
}

const tasks = [
  gap('T01', 'supported', 'routine', 'Ayer (yo, comer) ___ con mis padres.', 'comí',
    [['comi', ACCENT('comí')], ['como', PRESENT('Como', 'comí')], ['comió', 'Comió — форма él / ella / usted. Для yo — comí.']],
    'Ayer comí con mis padres.', 'Учора я обідав(-ла) з батьками.', { model: ERIR_TABLE, clue: 'Підмет — yo; закінчення -í.' }),
  gap('T02', 'supported', 'home', 'El año pasado mis hermanos (vivir) ___ en Valencia.', 'vivieron',
    [['vivió', 'Vivió — для однієї особи. Mis hermanos — «вони»: vivieron.'], ['viven', PRESENT('Viven', 'vivieron')]],
    'El año pasado mis hermanos vivieron en Valencia.', 'Минулого року мої брати жили у Валенсії.', { model: ERIR_TABLE, clue: 'Mis hermanos — «вони»; закінчення -ieron.' }),
  gap('T03', 'independent', 'routine', 'Anoche (tú, salir) ___ con tus amigos.', 'saliste',
    [['salistes', 'Для tú — saliste, без -s у кінці.'], ['salió', 'Salió — форма él / ella / usted. Для tú — saliste.'], ['sales', PRESENT('Sales', 'saliste')]],
    'Anoche saliste con tus amigos.', 'Учора ввечері ти гуляв(-ла) з друзями.'),
  gap('T04', 'independent', 'home', 'Ayer Luis (recibir) ___ un regalo de su madre.', 'recibió',
    [['recibio', ACCENT('recibió')], ['recibe', PRESENT('Recibe', 'recibió')], ['recibieron', 'Recibieron — для кількох осіб. Luis — «він»: recibió.']],
    'Ayer Luis recibió un regalo de su madre.', 'Учора Луїс отримав подарунок від мами.'),
  gap('T05', 'independent', 'work-study', 'La semana pasada (nosotros, aprender) ___ mucho en clase.', 'aprendimos',
    [['aprendemos', 'Aprendemos — теперішній час. У дієсловах на -er форма nosotros у минулому інша: aprendimos.'], ['aprendieron', 'Aprendieron — для ellos / ellas / ustedes. Для nosotros — aprendimos.']],
    'La semana pasada aprendimos mucho en clase.', 'Минулого тижня ми багато чого навчилися на заняттях.'),
  choice({
    id: 'T06', lesson: L, role: 'independent', family: 'work-study', target: ERIR,
    prompt: [uk('Оберіть правильну форму простого минулого часу.'), es('¿Vosotros ___ (escribir) el correo electrónico ayer?')],
    options: [
      ['escribisteis', true],
      ['escribistes', false, 'Для vosotros — escribisteis (-isteis), а не *escribistes.'],
      ['escribieron', false, 'Escribieron — для ellos / ellas / ustedes. Для vosotros — escribisteis.'],
      ['escribís', false, 'Escribís — теперішній час. Ayer — «учора»: escribisteis.'],
    ],
    rule: RULE, full: '¿Vosotros escribisteis el correo electrónico ayer?', fullUk: 'Ви написали вчора електронного листа?',
    ok: 'Правильно: vosotros escribisteis.', bad: 'Для vosotros у простому минулому — escribisteis.',
  }),
  gap('T07', 'delayed', 'routine', 'Anteayer (yo, beber) ___ mucho café.', 'bebí',
    [['bebi', ACCENT('bebí')], ['bebo', PRESENT('Bebo', 'bebí')]],
    'Anteayer bebí mucho café.', 'Позавчора я випив(-ла) багато кави.'),
  gap('T08', 'delayed', 'home', 'Ayer los niños (abrir) ___ los regalos.', 'abrieron',
    [['abrió', 'Abrió — для однієї особи. Los niños — «вони»: abrieron.'], ['abren', PRESENT('Abren', 'abrieron')]],
    'Ayer los niños abrieron los regalos.', 'Учора діти відкрили подарунки.'),
  gap('T09', 'transfer', 'messages', '¡Hola, Ana! ¿(tú, recibir) ___ mi mensaje anoche?', 'recibiste',
    [['recibistes', 'Для tú — recibiste, без -s у кінці.'], ['recibió', 'Recibió — форма él / ella / usted. До Ани звертаються на tú: recibiste.'], ['recibes', PRESENT('Recibes', 'recibiste')]],
    '¡Hola, Ana! ¿Recibiste mi mensaje anoche?', 'Привіт, Ано! Ти отримала моє повідомлення вчора ввечері?', { instr: `Повідомлення. ${INSTR}` }),
  choice({
    id: 'T10', lesson: L, role: 'transfer', family: 'travel', target: ERIR,
    prompt: [uk('Оберіть правильну форму простого минулого часу.'), es('El sábado pasado el autobús ___ (salir) a las ocho.')],
    options: [
      ['salió', true],
      ['salio', false, ACCENT('salió')],
      ['sale', false, PRESENT('Sale', 'salió')],
      ['salieron', false, 'Salieron — для кількох. El autobús — однина: salió.'],
    ],
    rule: RULE, full: 'El sábado pasado el autobús salió a las ocho.', fullUk: 'Минулої суботи автобус вирушив о восьмій.',
    ok: 'Правильно: el autobús salió.', bad: 'Для él / ella (el autobús) — salió, зі знаком наголосу.',
  }),

  // ---------- listening.past-events ----------
  listen('T11', 'independent', CLIP_YDAY, T_YDAY, U_YDAY, 'Де Елена вечеряла вчора?',
    [['У своїх батьків.', true], ['Удома, сама.', false], ['У ресторані з Мартою.', false]],
    'Ayer trabajé mucho y cené en casa de mis padres.', 'Учора я багато працювала і вечеряла в батьків.'),
  listen('T12', 'delayed', CLIP_YDAY, T_YDAY, U_YDAY, 'Що Елена робила з Мартою?',
    [['Вони трохи потанцювали.', true], ['Вони разом вечеряли.', false], ['Вони разом працювали.', false]],
    'Después salí con Marta y bailamos un poco.', 'Потім я пішла гуляти з Мартою, і ми трохи потанцювали.'),
  listen('T13', 'independent', CLIP_WKND, T_WKND, U_WKND, 'Що друзі робили в суботу?',
    [['Обідали на пляжі й багато плавали.', true], ['Купували подарунки.', false], ['Поверталися до Мадрида.', false]],
    'El sábado comimos en la playa y nadamos mucho.', 'У суботу ми обідали на пляжі й багато плавали.'),
  listen('T14', 'delayed', CLIP_WKND, T_WKND, U_WKND, 'Як друзі повернулися до Мадрида?',
    [['Потягом.', true], ['Автобусом.', false], ['Машиною.', false]],
    'Por la tarde volvimos a Madrid en tren.', 'Ввечері ми повернулися до Мадрида потягом.'),
  exact({
    id: 'T15', lesson: L, role: 'independent', family: 'weekend-story', target: LD, clipIds: [CLIP_WKND],
    input: 'short', policy: SENTENCE,
    prompt: [uk('Диктант. Прослухайте розповідь про вихідні і запишіть друге речення — про суботу.')],
    answers: [DICT],
    errors: [
      ['El sabado comimos en la playa y nadamos mucho.', 'У слові sábado пишемо знак наголосу.'],
      ['El sábado comemos en la playa y nadamos mucho.', 'Послухайте ще раз: comimos — минулий час (comemos — теперішній).'],
    ],
    closed: false,
    extraHints: [transcriptHint(['listening.past-events/dictation'], T_WKND)],
    full: DICT, fullUk: 'У суботу ми обідали на пляжі й багато плавали.',
    ok: 'Правильно записано.', bad: `Порівняйте: ${DICT}`,
    unresolved: `Ваш запис відрізняється від перевірених варіантів. Порівняйте його з текстом: ${DICT}`,
  }),
];

const ids = (...n) => n.map((x) => `${L}-T${String(x).padStart(2, '0')}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Простий минулий час: дієслова на -er та -ir',
    termEs: 'pretérito indefinido: verbos en -er / -ir',
    summaryUk:
      'Закінчення простого минулого часу дієслів на -er та -ir (comí, comió, vivieron); форма nosotros, яка в -ar та -ir збігається з теперішнім часом; перші короткі аудіо про минулі події.',
    objectives: ['A2-04-O1', 'A2-04-O2', 'A2-04-O9'],
    situations: ['routine-study-leisure', 'personal-messages', 'people-family-home'],
    estimatedMinutes: 16,
    introduces: ['indefinido.regular-er-ir', 'indefinido.nosotros-syncretism', 'listening.past-events'],
    revisits: ['indefinido.regular-ar', 'time.past-markers', 'present.regular-er', 'present.regular-ir', 'contrast.er-ir-endings'],
    steps: [
      step('s1', 'explanation', 'Закінчення дієслів на -er та -ir', true, {
        blocks: [
          uk('Дієслова на -er та -ir мають у простому минулому часі однакові закінчення: -í, -iste, -ió, -imos, -isteis, -ieron.'),
          ERIR_TABLE,
          uk('Знак наголосу в yo і él / ella / usted обов’язковий: comí, comió, viví, vivió.'),
          uk('Tú — comiste, без -s у кінці; vosotros — comisteis. Закінчення теперішнього часу сюди не переносимо.'),
        ],
      }),
      step('s2', 'explanation', 'Hablamos, vivimos: теперішній чи минулий?', true, {
        blocks: [
          uk('У дієсловах на -ar та -ir форма nosotros однакова в теперішньому і в простому минулому часі. Час розпізнаємо за контекстом:'),
          ex('Ayer hablamos con Ana. — Siempre hablamos con Ana.', 'Учора ми говорили з Аною. — Ми завжди говоримо з Аною.'),
          ex('El año pasado vivimos en Valencia. — Ahora vivimos en Madrid.', 'Минулого року ми жили у Валенсії. — Тепер ми живемо в Мадриді.'),
          uk('У дієсловах на -er форми різні: comemos (зараз, зазвичай) — comimos (у минулому).'),
        ],
      }),
      step('s3', 'examples', 'Приклади', true, {
        blocks: [
          ex('Ayer comí en casa de Ana.', 'Учора я обідав(-ла) в Ани.'),
          ex('¿A qué hora saliste anoche?', 'О котрій ти вийшов(-ла) вчора ввечері?'),
          ex('Mi hermana vivió dos años en Sevilla.', 'Моя сестра два роки жила в Севільї.'),
          ex('El sábado pasado comimos en un restaurante.', 'Минулої суботи ми обідали в ресторані.'),
          ex('¿Recibisteis mi mensaje?', 'Ви отримали моє повідомлення?'),
          ex('Los niños bebieron mucha agua.', 'Діти випили багато води.'),
        ],
      }),
      step('s4', 'supported-practice', 'Практика з таблицею', true, { taskIds: ids(1, 2) }),
      step('s5', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(3, 4, 5, 6) }),
      step('s6', 'listening', 'Слухаємо: що сталося', true, {
        blocks: [uk('Два короткі записи про минулі події. Слухайте стільки разів, скільки потрібно; текст можна відкрити як підказку.')],
        clipIds: [CLIP_YDAY, CLIP_WKND],
        taskIds: ids(11, 13, 15),
      }),
      step('s7', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            '-er / -ir: -í, -iste, -ió, -imos, -isteis, -ieron.',
            'Знак наголосу: comí, comió.',
            'Tú — comiste (без -s), vosotros — comisteis.',
            'Hablamos, vivimos — і теперішній, і минулий; comemos ≠ comimos.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
  clips,
};
