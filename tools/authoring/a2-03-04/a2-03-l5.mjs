// A2-03-L5 — the full sentence (A2-03-O5/O6): no / question order, pronouns before haber,
// invariant participle, plus the first short listening clips (A2-03-O8, listening.perfecto-sentences).
// Sentence-building tasks stay open (closed:false): only reviewed variants are graded; any other
// answer is unresolved, never a fake failure.
import { SENTENCE, choice, clip, es, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-03-L5';
const WO_C = ['perfecto.word-order', 'construction-use'];
const WO_W = ['perfecto.word-order', 'written-form'];
const PP_C = ['perfecto.pronoun-placement', 'construction-use'];
const PP_W = ['perfecto.pronoun-placement', 'written-form'];
const INV_W = ['perfecto.participle-invariance', 'written-form'];
const INV_C = ['perfecto.participle-invariance', 'context-choice'];
const LM = ['listening.perfecto-sentences', 'listening-meaning'];
const LD = ['listening.perfecto-sentences', 'dictation'];

const WO_RULE = 'Haber і дієприкметник стоять поруч, між ними нічого не ставимо. No — перед haber: No he comido. У питанні підмет стоїть після дієприкметника або на початку: ¿Ha llegado el tren? / ¿El tren ha llegado?';
const PP_RULE = 'Займенники (lo, la, me, te, se, nos, os…) ставимо перед haber окремим словом: Lo he visto. Me he levantado tarde. No — перед займенником: No lo he visto. Між haber і дієприкметником займенник не ставимо.';
const INV_RULE = 'Після haber дієприкметник завжди закінчується на -o і не узгоджується ні з підметом, ні з додатком: Ana ha comido, he comprado dos botellas. Після estar він поводиться як прикметник і узгоджується: La puerta está abierta.';

const BUILD = 'Складіть речення з поданих слів. Інших слів не додавайте.';
const BUILD_Q = 'Складіть питання з поданих слів. Інших слів не додавайте.';
const UNRES = 'Такого варіанта немає серед перевірених відповідей, тому автоматично ми його не оцінюємо. Порівняйте зі зразком.';
const NO_FIRST = 'No ставимо перед haber, а не між haber і дієприкметником.';
const NOTHING_BETWEEN = 'Між haber і дієприкметником нічого не ставимо.';
const PRON_FIRST = 'Займенник ставимо перед haber, а не між haber і дієприкметником.';

function build(id, role, family, target, rule, words, answers, errors, fullUk, extra = {}) {
  return exact({
    id, lesson: L, role, family, target, input: 'short', policy: SENTENCE,
    prompt: [uk(extra.instr ?? BUILD), ...(extra.model ? [ex(...extra.model)] : []), es(words)],
    answers, errors, closed: false, rule, clue: extra.clue, glosses: extra.glosses,
    full: answers[0], fullUk,
    ok: extra.ok ?? `Правильно: ${answers[0]}`,
    bad: extra.bad ?? `Порядок слів інший: ${answers[0]}`,
    unresolved: UNRES,
  });
}

function slot(id, role, family, target, rule, instr, sentence, answers, errors, full, fullUk, extra = {}) {
  return exact({
    id, lesson: L, role, family, target, policy: SENTENCE,
    prompt: [uk(instr), ...(extra.model ? [ex(...extra.model)] : []), es(sentence)],
    answers, errors, closed: extra.closed ?? false, rule, clue: extra.clue, glosses: extra.glosses,
    full, fullUk,
    ok: extra.ok ?? `Правильно: ${full}`,
    bad: extra.bad ?? `Правильно так: ${full}`,
    ...(extra.closed ? {} : { unresolved: UNRES }),
  });
}

function pick(id, role, family, target, rule, instr, sentence, options, full, fullUk, extra = {}) {
  return choice({
    id, lesson: L, role, family, target,
    prompt: [uk(instr), es(sentence)],
    options, rule, clue: extra.clue, glosses: extra.glosses, full, fullUk,
    ok: extra.ok ?? `Правильно: ${full}`,
    bad: extra.bad ?? `Правильно так: ${full}`,
  });
}

// ---------- listening clips ----------
const CLIP_HOME = 'clip.a2-03.l5.home-message';
const CLIP_OFFICE = 'clip.a2-03.l5.office-message';
const T_HOME = 'Hola, Pablo, soy Marta. Hoy he hecho la compra y he puesto la leche en la nevera. Los niños han comido en casa de mis padres. Nos vemos esta noche.';
const U_HOME = 'Привіт, Пабло, це Марта. Сьогодні я купила продукти й поставила молоко в холодильник. Діти обідали в моїх батьків. Побачимося ввечері.';
const T_OFFICE = 'Hola, soy Luis, de la oficina. He escrito el correo electrónico a la señora García y se lo he enviado esta mañana. Pero no he visto el anuncio nuevo. ¿Me lo envías, por favor?';
const U_OFFICE = 'Привіт, це Луїс з офісу. Я написав електронного листа пані Гарсії й надіслав його сьогодні вранці. Але нового оголошення я не бачив. Надішлеш мені його, будь ласка?';

const clips = [
  clip({ id: CLIP_HOME, lesson: L, kind: 'text', transcript: T_HOME, translationUk: U_HOME, targets: [LM, LD], family: 'home-message' }),
  clip({ id: CLIP_OFFICE, lesson: L, kind: 'text', transcript: T_OFFICE, translationUk: U_OFFICE, targets: [LM], family: 'office-message' }),
];

const LISTEN = 'Прослухайте голосове повідомлення і дайте відповідь.';
const transcriptHint = (keys, text) => ({ kind: 'transcript', targets: keys, blocks: [es(text)] });
const translationHint = (keys, text) => ({ kind: 'translation', targets: keys, blocks: [uk(text)] });

function listen(id, role, clipId, transcript, translation, question, options, revealEs, revealUk) {
  const k = ['listening.perfecto-sentences/listening-meaning'];
  return choice({
    id, lesson: L, role, family: clipId === CLIP_HOME ? 'home-message' : 'office-message', target: LM,
    clipIds: [clipId],
    prompt: [uk(LISTEN), uk(question)],
    options,
    extraHints: [transcriptHint(k, transcript), translationHint(k, translation)],
    full: revealEs, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. У записі: «${revealEs}» — ${revealUk}`,
  });
}

const tasks = [
  // ---------- perfecto.word-order: construction ----------
  build('T01', 'supported', 'home', WO_C, WO_RULE, 'no · he · comido', ['No he comido.'],
    [['He no comido.', NO_FIRST]], 'Я не обідав(-ла).', { model: ['No he trabajado hoy.', 'Сьогодні я не працював(-ла).'] }),
  build('T02', 'supported', 'work-study', WO_C, WO_RULE, 'has · terminado · el trabajo', ['¿Has terminado el trabajo?'],
    [['¿Has el trabajo terminado?', NOTHING_BETWEEN]], 'Ти закінчив(-ла) роботу?', { instr: BUILD_Q, model: ['¿Has visto a Ana?', 'Ти бачив(-ла) Ану?'] }),
  build('T03', 'independent', 'travel', WO_C, WO_RULE, 'el tren · ha · llegado', ['¿Ha llegado el tren?', '¿El tren ha llegado?'],
    [['¿Ha el tren llegado?', 'Підмет не ставимо між haber і дієприкметником: ¿Ha llegado el tren? або ¿El tren ha llegado?']], 'Потяг прибув?', { instr: BUILD_Q }),
  build('T04', 'independent', 'home', WO_C, WO_RULE, 'no · han · cenado · los niños', ['Los niños no han cenado.', 'No han cenado los niños.'],
    [['Los niños han no cenado.', NO_FIRST], ['No los niños han cenado.', 'No ставимо безпосередньо перед haber: Los niños no han cenado.']], 'Діти не вечеряли.'),
  build('T05', 'delayed', 'work-study', WO_C, WO_RULE, 'qué · has · hecho · hoy', ['¿Qué has hecho hoy?', '¿Hoy qué has hecho?'],
    [['¿Qué has hoy hecho?', NOTHING_BETWEEN], ['¿Qué hoy has hecho?', 'Після питального слова qué одразу йде дієслово: ¿Qué has hecho hoy?']], 'Що ти сьогодні робив(-ла)?', { instr: BUILD_Q }),
  build('T06', 'transfer', 'messages', WO_C, WO_RULE, 'no · he · visto · tu mensaje', ['No he visto tu mensaje.'],
    [['He no visto tu mensaje.', NO_FIRST], ['No he tu mensaje visto.', NOTHING_BETWEEN]], 'Я не бачив(-ла) твого повідомлення.', { instr: `Відповідь на повідомлення. ${BUILD}` }),
  // ---------- perfecto.word-order: written group no + haber ----------
  slot('T07', 'independent', 'home', WO_W, WO_RULE, 'Впишіть заперечення: no + потрібна форма haber.', 'Hoy (yo) ___ desayunado.',
    ['no he', 'yo no he'], [['he no', NO_FIRST], ['yo he no', NO_FIRST]], 'Hoy no he desayunado.', 'Сьогодні я не снідав(-ла).'),
  slot('T08', 'independent', 'work-study', WO_W, WO_RULE, 'Впишіть заперечення: no + потрібна форма haber.', 'Mi hermana ___ terminado el examen.',
    ['no ha'], [['ha no', NO_FIRST]], 'Mi hermana no ha terminado el examen.', 'Моя сестра не закінчила іспит.'),
  slot('T09', 'delayed', 'home', WO_W, WO_RULE, 'Впишіть заперечення: no + потрібна форма haber.', '¿Vosotros ___ comido?',
    ['no habéis'], [['habéis no', NO_FIRST]], '¿Vosotros no habéis comido?', 'Ви не обідали?'),
  slot('T10', 'transfer', 'shopping', WO_W, WO_RULE, 'Впишіть заперечення: no + потрібна форма haber.', 'Hoy la tienda ___ abierto.',
    ['no ha'], [['ha no', NO_FIRST]], 'Hoy la tienda no ha abierto.', 'Сьогодні магазин не відчинився.'),

  // ---------- perfecto.pronoun-placement: construction ----------
  build('T11', 'supported', 'home', PP_C, PP_RULE, 'lo · he · visto', ['Lo he visto.'],
    [['He lo visto.', PRON_FIRST], ['He visto lo.', 'Займенник не ставимо після дієприкметника і не приєднуємо до нього: Lo he visto.']],
    'Я це бачив(-ла). / Я його бачив(-ла).', { model: ['Lo he comprado.', 'Я це купив(-ла).'] }),
  build('T12', 'supported', 'routine', PP_C, PP_RULE, 'me · he · levantado · tarde', ['Me he levantado tarde.'],
    [['He me levantado tarde.', PRON_FIRST]], 'Я встав(-ла) пізно.', { model: ['Me he duchado.', 'Я прийняв(-ла) душ.'] }),
  build('T13', 'independent', 'home', PP_C, PP_RULE, 'no · la · hemos · visto', ['No la hemos visto.'],
    [['La no hemos visto.', 'No ставимо перед займенником: No la hemos visto.'], ['No hemos la visto.', PRON_FIRST]], 'Ми її не бачили.'),
  build('T14', 'independent', 'routine', PP_C, PP_RULE, 'te · has · duchado', ['¿Te has duchado?'],
    [['¿Has te duchado?', PRON_FIRST]], 'Ти прийняв(-ла) душ?', { instr: BUILD_Q }),
  build('T15', 'delayed', 'home', PP_C, PP_RULE, 'se · lo · he · dicho', ['Se lo he dicho.'],
    [['He se lo dicho.', 'Обидва займенники ставимо перед haber: Se lo he dicho.']], 'Я йому (їй) це сказав(-ла).'),
  build('T16', 'transfer', 'messages', PP_C, PP_RULE, 'os · he · escrito · un mensaje', ['Os he escrito un mensaje.'],
    [['He os escrito un mensaje.', PRON_FIRST]], 'Я написав(-ла) вам повідомлення.', { instr: `Повідомлення друзям. ${BUILD}` }),
  // ---------- perfecto.pronoun-placement: written group pronoun + haber ----------
  slot('T17', 'independent', 'home', PP_W, PP_RULE, 'Впишіть займенник і потрібну форму haber.', '¿Las llaves? (yo) ___ puesto en la mesa.',
    ['las he', 'yo las he'], [['he las', PRON_FIRST], ['yo he las', PRON_FIRST], ['lo he', 'Las llaves — жіночий рід, множина: потрібен займенник las.', { 'perfecto.pronoun-placement/written-form': 'unresolved' }]],
    '¿Las llaves? Las he puesto en la mesa.', 'Ключі? Я поклав(-ла) їх на стіл.'),
  slot('T18', 'independent', 'routine', PP_W, PP_RULE, 'Впишіть займенник і потрібну форму haber.', 'Hoy (nosotros) ___ levantado muy temprano.',
    ['nos hemos'], [['hemos nos', PRON_FIRST]], 'Hoy nos hemos levantado muy temprano.', 'Сьогодні ми встали дуже рано.'),
  slot('T19', 'delayed', 'work-study', PP_W, PP_RULE, 'Впишіть займенник і потрібну форму haber.', '¿El correo electrónico? No ___ leído. (yo)',
    ['lo he'], [['he lo', PRON_FIRST]], '¿El correo electrónico? No lo he leído.', 'Електронний лист? Я його не прочитав(-ла).'),
  slot('T20', 'transfer', 'shopping', PP_W, PP_RULE, 'Впишіть займенник і потрібну форму haber.', '¿El pan? Mi madre ___ comprado.',
    ['lo ha'], [['ha lo', PRON_FIRST]], '¿El pan? Mi madre lo ha comprado.', 'Хліб? Мама його купила.'),

  // ---------- perfecto.participle-invariance: written ----------
  slot('T21', 'supported', 'home', INV_W, INV_RULE, 'Впишіть дієприкметник дієслова в дужках. Зразок нижче.', 'Hoy mis hermanas han ___ (cenar) en casa.',
    ['cenado'], [['cenadas', 'Після haber дієприкметник не узгоджується з підметом: han cenado.'], ['cenada', 'Після haber дієприкметник не змінюється: cenado.']],
    'Hoy mis hermanas han cenado en casa.', 'Сьогодні мої сестри вечеряли вдома.', { closed: true, model: ['Ana ha comido. — Las chicas han comido.', 'Ана поїла. — Дівчата поїли.'] }),
  slot('T22', 'supported', 'work-study', INV_W, INV_RULE, 'Впишіть дієприкметник дієслова в дужках. Зразок нижче.', 'Hoy Marta ha ___ (trabajar) mucho.',
    ['trabajado'], [['trabajada', 'Після haber дієприкметник не узгоджується з підметом: Marta ha trabajado.']],
    'Hoy Marta ha trabajado mucho.', 'Сьогодні Марта багато працювала.', { closed: true, model: ['Ana ha comido. — Las chicas han comido.', 'Ана поїла. — Дівчата поїли.'] }),
  slot('T23', 'independent', 'home', INV_W, INV_RULE, 'Впишіть дієприкметник дієслова в дужках.', 'Las niñas han ___ (abrir) la puerta.',
    ['abierto'], [['abiertas', 'Після haber дієприкметник не узгоджується з підметом: han abierto.'], ['abierta', 'Після haber дієприкметник не узгоджується з додатком la puerta: han abierto.']],
    'Las niñas han abierto la puerta.', 'Дівчатка відчинили двері.', { closed: true }),
  slot('T24', 'independent', 'shopping', INV_W, INV_RULE, 'Впишіть дієприкметник дієслова в дужках.', 'He ___ (comprar) dos botellas de agua.',
    ['comprado'], [['compradas', 'Після haber дієприкметник не узгоджується і з додатком: he comprado dos botellas.']],
    'He comprado dos botellas de agua.', 'Я купив(-ла) дві пляшки води.', { closed: true }),
  slot('T25', 'delayed', 'home', INV_W, INV_RULE, 'Впишіть дієприкметник дієслова в дужках.', 'Ana y Marta han ___ (volver) muy tarde.',
    ['vuelto'], [['vueltas', 'Після haber дієприкметник не узгоджується з підметом: han vuelto.']],
    'Ana y Marta han vuelto muy tarde.', 'Ана й Марта повернулися дуже пізно.', { closed: true }),
  slot('T26', 'transfer', 'messages', INV_W, INV_RULE, 'Повідомлення. Впишіть дієприкметник дієслова в дужках.', '¡Hola, Luis! Tus hermanas han ___ (llegar) a Madrid.',
    ['llegado'], [['llegadas', 'Після haber дієприкметник не узгоджується з підметом: han llegado.']],
    '¡Hola, Luis! Tus hermanas han llegado a Madrid.', 'Привіт, Луїсе! Твої сестри приїхали до Мадрида.', { closed: true }),
  // ---------- perfecto.participle-invariance: haber vs estar in context ----------
  pick('T27', 'independent', 'home', INV_C, INV_RULE, 'Оберіть форму, яка підходить.', 'La puerta está ___.',
    [['abierta', true], ['abierto', false, 'Після estar дієприкметник поводиться як прикметник і узгоджується з іменником: la puerta está abierta.']],
    'La puerta está abierta.', 'Двері відчинені.'),
  pick('T28', 'independent', 'work-study', INV_C, INV_RULE, 'Оберіть форму, яка підходить.', 'Hoy Lucía ha ___ la ventana de la oficina.',
    [['abierto', true], ['abierta', false, 'Після haber дієприкметник не змінюється: ha abierto la ventana.']],
    'Hoy Lucía ha abierto la ventana de la oficina.', 'Сьогодні Лусія відчинила вікно в офісі.'),
  pick('T29', 'delayed', 'shopping', INV_C, INV_RULE, 'Оберіть форму, яка підходить.', 'La farmacia está ___.',
    [['abierta', true], ['abierto', false, 'Після estar дієприкметник узгоджується з іменником: la farmacia está abierta.']],
    'La farmacia está abierta.', 'Аптека відчинена.'),
  pick('T30', 'transfer', 'messages', INV_C, INV_RULE, 'Повідомлення. Оберіть форму, яка підходить.', '¡Hola, Ana! Hemos ___ las ventanas de tu casa.',
    [['abierto', true], ['abiertas', false, 'Після haber дієприкметник не змінюється: hemos abierto las ventanas.']],
    '¡Hola, Ana! Hemos abierto las ventanas de tu casa.', 'Привіт, Ано! Ми відчинили вікна у твоєму домі.'),

  // ---------- listening.perfecto-sentences ----------
  listen('T31', 'independent', CLIP_HOME, T_HOME, U_HOME, 'Що Марта зробила сьогодні?',
    [['Купила продукти й поставила молоко в холодильник.', true], ['Приготувала дітям обід.', false], ['Ще не купила продуктів.', false], ['Обідала у своїх батьків.', false]],
    'Hoy he hecho la compra y he puesto la leche en la nevera.', 'Купила продукти й поставила молоко в холодильник.'),
  listen('T32', 'delayed', CLIP_HOME, T_HOME, U_HOME, 'Де сьогодні обідали діти?',
    [['У Мартиних батьків.', true], ['Удома.', false], ['У школі.', false]],
    'Los niños han comido en casa de mis padres.', 'У Мартиних батьків.'),
  listen('T33', 'independent', CLIP_OFFICE, T_OFFICE, U_OFFICE, 'Що Луїс зробив сьогодні вранці?',
    [['Надіслав електронного листа пані Гарсії.', true], ['Побачив нове оголошення.', false], ['Поговорив із пані Гарсією в офісі.', false]],
    'He escrito el correo electrónico a la señora García y se lo he enviado esta mañana.', 'Надіслав електронного листа пані Гарсії.'),
  listen('T34', 'delayed', CLIP_OFFICE, T_OFFICE, U_OFFICE, 'Чого Луїс ще не бачив?',
    [['Нового оголошення.', true], ['Електронного листа.', false], ['Пані Гарсії.', false]],
    'Pero no he visto el anuncio nuevo.', 'Нового оголошення.'),
  exact({
    id: 'T35', lesson: L, role: 'independent', family: 'home-message', target: LD, clipIds: [CLIP_HOME],
    input: 'short', policy: SENTENCE,
    prompt: [uk('Диктант. Прослухайте повідомлення Марти і запишіть третє речення — про дітей.')],
    answers: ['Los niños han comido en casa de mis padres.'],
    errors: [
      ['Los niños an comido en casa de mis padres.', 'Han пишемо з h: han comido.'],
      ['Los ninos han comido en casa de mis padres.', 'У слові niños пишемо ñ.'],
      ['Los niños han comido en casa de mi padres.', 'Послухайте ще раз: mis padres — «мої батьки», множина.'],
    ],
    closed: false,
    extraHints: [{ kind: 'transcript', targets: ['listening.perfecto-sentences/dictation'], blocks: [es(T_HOME)] }],
    full: 'Los niños han comido en casa de mis padres.', fullUk: 'Діти обідали в моїх батьків.',
    ok: 'Правильно записано.', bad: 'Порівняйте: Los niños han comido en casa de mis padres.',
    unresolved: 'Ваш запис відрізняється від перевірених варіантів. Порівняйте його з текстом: Los niños han comido en casa de mis padres.',
  }),
];

const ids = (...n) => n.map((x) => `${L}-T${String(x).padStart(2, '0')}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Збираємо речення: заперечення, питання, займенники',
    termEs: 'pretérito perfecto compuesto: orden de palabras',
    summaryUk:
      'Де стоять no, підмет і займенники в реченні з pretérito perfecto compuesto і чому після haber дієприкметник не змінюється. Перші короткі аудіоповідомлення.',
    objectives: ['A2-03-O5', 'A2-03-O6', 'A2-03-O8'],
    situations: ['routine-study-leisure', 'people-family-home', 'personal-messages'],
    estimatedMinutes: 20,
    introduces: ['perfecto.word-order', 'perfecto.pronoun-placement', 'perfecto.participle-invariance', 'listening.perfecto-sentences'],
    revisits: ['perfecto.haber-forms', 'participle.regular-ar', 'participle.regular-er-ir', 'participle.hecho', 'participle.visto', 'participle.puesto', 'participle.abierto', 'neg.no-before-verb', 'question.yes-no', 'object-pron.placement-finite', 'object-pron.se-replacement', 'reflexive.placement', 'adj.agreement.o-a', 'estar.state'],
    steps: [
      step('s1', 'explanation', 'Заперечення і питання', true, {
        blocks: [
          uk('Haber і дієприкметник — одне ціле: між ними нічого не ставимо.'),
          uk('No ставимо перед haber:'),
          ex('No he comido.', 'Я не обідав(-ла).'),
          uk('У питанні підмет стоїть після дієприкметника або на початку речення:'),
          ex('¿Ha llegado el tren? / ¿El tren ha llegado?', 'Потяг прибув?'),
          ex('¿Qué has hecho hoy?', 'Що ти сьогодні робив(-ла)?'),
        ],
      }),
      step('s2', 'explanation', 'Займенники перед haber', true, {
        blocks: [
          uk('Займенники lo, la, los, las, me, te, se, nos, os ставимо перед haber окремим словом — так само, як перед будь-яким дієсловом в особовій формі. Між haber і дієприкметником займенник не ставимо (не *he lo visto).'),
          ex('¿La película? La he visto.', 'Фільм? Я його бачив(-ла).'),
          ex('Hoy me he levantado tarde.', 'Сьогодні я встав(-ла) пізно.'),
          ex('Se lo he dicho.', 'Я йому (їй) це сказав(-ла).'),
          uk('No стоїть перед займенником:'),
          ex('No lo he visto.', 'Я цього не бачив(-ла).'),
        ],
      }),
      step('s3', 'explanation', 'Дієприкметник не змінюється', true, {
        blocks: [
          uk('Після haber дієприкметник завжди закінчується на -o: він не узгоджується ні з підметом, ні з додатком.'),
          ex('Ana ha comido. — Las chicas han comido.', 'Ана поїла. — Дівчата поїли.'),
          ex('He comprado dos botellas.', 'Я купив(-ла) дві пляшки.'),
          uk('Інша річ — estar + дієприкметник, що описує стан. Тоді він поводиться як прикметник і узгоджується з іменником (ви знаєте це з abierto / cerrado):'),
          ex('He abierto la puerta. — La puerta está abierta.', 'Я відчинив(-ла) двері. — Двері відчинені.'),
        ],
      }),
      step('s4', 'supported-practice', 'Практика зі зразком', true, { taskIds: ids(1, 2, 11, 12, 21, 22) }),
      step('s5', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(3, 4, 7, 8, 13, 14, 17, 18, 23, 24, 27, 28) }),
      step('s6', 'listening', 'Слухаємо: що вже зроблено', true, {
        blocks: [uk('Два короткі голосові повідомлення. Слухайте стільки разів, скільки потрібно; текст можна відкрити як підказку.')],
        clipIds: [CLIP_HOME, CLIP_OFFICE],
        taskIds: ids(31, 33, 35),
      }),
      step('s7', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'Haber + дієприкметник — разом, між ними нічого не ставимо.',
            'No і займенники — перед haber: No lo he visto. Me he levantado.',
            'Питання: ¿Ha llegado el tren? / ¿El tren ha llegado?',
            'Після haber — завжди -o: han comido, he comprado dos botellas.',
            'Після estar — узгодження: la puerta está abierta.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
  clips,
};
