// A2-01-L4 — estar + gerund (form and meaning), present vs progressive, listening to ongoing actions.
import { ES, EX, LINK, LIST_UK, TABLE_ES, UK, choice, clip, dictation, lesson as mkLesson, material, open, step } from '../lib.mjs';

const L = 'A2-01-L4';
const PROG = 'progressive.estar-gerund/construction-use';
const PROG_R = 'progressive.estar-gerund/reading-meaning';
const EST = 'present.estar/written-form';
const AR = 'progressive.gerund-regular-ar/written-form';
const ER = 'progressive.gerund-regular-er-ir/written-form';
const YE = 'progressive.gerund-yendo/written-form';
const EI = 'progressive.gerund-e-i/written-form';
const OU = 'progressive.gerund-o-u/written-form';
const CPP_C = 'contrast.present-progressive/context-choice';
const CPP_R = 'contrast.present-progressive/reading-meaning';
const LIS = 'listening.ongoing-actions/listening-meaning';
const LIS_D = 'listening.ongoing-actions/dictation';

const C1 = 'clip.a2-01.l4.phone-train';
const C2 = 'clip.a2-01.l4.office-message';
const C3 = 'clip.a2-01.l4.home-busy';
const LEYENDO = 'Leyendo — форма gerundio від leer (урок A2-01-L3): основа закінчується на голосну, тому -yendo. Durmiendo — від dormir (o → u).';

const R = {
  prog: 'Estar у теперішньому часі + герундій описує дію, що відбувається саме зараз: Estoy trabajando. Особу показує estar; герундій не змінюється. No ставимо перед estar: No estoy trabajando.',
  cpp: 'Простий теперішній — для звичок, розкладу і загальних фактів: Los sábados juego al fútbol. Estar + герундій — для дії, що відбувається зараз або в цей обмежений період: Ahora estoy jugando. Про «зараз» часто можна сказати обома способами.',
};
const GER_RULE = {
  [AR]: 'Герундій дієслів на -ar: -ando (cocinar → cocinando).',
  [ER]: 'Герундій дієслів на -er та -ir: -iendo (hacer → haciendo, escribir → escribiendo).',
  [YE]: 'Після голосної основи — -yendo: leer → leyendo, oír → oyendo.',
  [EI]: 'У частині дієслів на -ir e → i: servir → sirviendo, pedir → pidiendo.',
  [OU]: 'Герундій від dormir — durmiendo.',
};

/**
 * estar + gerund in one short answer; three independently attributed targets:
 * the construction, the estar form and the gerund form.
 */
function prog(id, role, family, ger, es, uk, estar, gerund, wrongGerund, extra = {}) {
  const answer = `${estar} ${gerund}`;
  const err = [];
  const plain = estar.normalize('NFD').replace(/\p{M}/gu, '');
  if (plain !== estar) err.push([`${plain} ${gerund}`, { [PROG]: 'correct', [EST]: 'incorrect', [ger]: 'correct' }, `Форму ${estar} пишемо зі знаком наголосу.`]);
  if (wrongGerund) err.push([`${estar} ${wrongGerund}`, { [PROG]: 'correct', [EST]: 'correct', [ger]: 'incorrect' }, `Конструкцію побудовано правильно, але герундій — ${gerund}.`]);
  if (extra.inf) err.push([`${estar} ${extra.inf}`, { [PROG]: 'incorrect', [EST]: 'correct', [ger]: 'unresolved' }, `Після estar потрібен герундій, а не інфінітив: ${answer}.`]);
  if (extra.simple) err.push([extra.simple, { [PROG]: 'incorrect', [EST]: 'unresolved', [ger]: 'unresolved' }, `Тут треба побудувати estar + герундій: ${answer}.`]);
  if (extra.person) err.push([`${extra.person} ${gerund}`, { [PROG]: 'correct', [EST]: 'incorrect', [ger]: 'correct' }, `${extra.person} — форма іншої особи; тут потрібно ${estar}.`]);
  return open(L, {
    id,
    role,
    family,
    ts: [PROG, EST, ger],
    ask: extra.ask ?? 'Утворіть estar + герундій і впишіть обидва слова.',
    model: extra.model,
    es,
    uk,
    a: [answer],
    err,
    rule: [R.prog, GER_RULE[ger]],
    full: extra.full,
    ok: `Правильно: ${answer}.`,
    no: `Правильна відповідь: ${answer}.`,
  });
}

export const tasks = [
  prog('T01', 'supported', 'routine', AR, 'Mi padre ___ (estar + cocinar) ahora.', 'Мій тато зараз готує їжу.', 'está', 'cocinando', 'cociniendo', { ask: 'Подивіться на зразок, утворіть estar + герундій і впишіть обидва слова.', model: [['Estoy trabajando.', 'Я зараз працюю.']], inf: 'cocinar', full: 'Mi padre está cocinando ahora.' }),
  prog('T02', 'supported', 'family-home', OU, 'Los niños ___ (estar + dormir) en su habitación.', 'Діти зараз сплять у своїй кімнаті.', 'están', 'durmiendo', 'dormiendo', { ask: 'Подивіться на зразок, утворіть estar + герундій і впишіть обидва слова.', model: [['Estamos comiendo.', 'Ми зараз їмо.']], simple: 'duermen', full: 'Los niños están durmiendo en su habitación.' }),
  prog('T03', 'independent', 'free-time', ER, '¿Qué ___ (estar + hacer, tú)?', 'Що ти зараз робиш?', 'estás', 'haciendo', 'hacendo', { simple: 'haces', full: '¿Qué estás haciendo?' }),
  prog('T04', 'independent', 'routine', YE, 'Ahora mismo ___ (estar + leer, yo) el periódico.', 'Просто зараз я читаю газету.', 'estoy', 'leyendo', 'leiendo', { inf: 'leer', full: 'Ahora mismo estoy leyendo el periódico.' }),
  prog('T05', 'independent', 'food-cafe', EI, 'El camarero ___ (estar + servir) la comida.', 'Офіціант зараз подає обід.', 'está', 'sirviendo', 'serviendo', { simple: 'sirve', full: 'El camarero está sirviendo la comida.' }),
  prog('T06', 'independent', 'family-home', ER, 'Mi hermana ___ (estar + escribir) un mensaje.', 'Моя сестра зараз пише повідомлення.', 'está', 'escribiendo', 'escribendo', { person: 'estoy', full: 'Mi hermana está escribiendo un mensaje.' }),
  prog('T07', 'delayed', 'free-time', YE, '¿___ (estar + oír, vosotros) la música?', 'Ви чуєте музику?', 'estáis', 'oyendo', 'oiendo', { full: '¿Estáis oyendo la música?' }),
  prog('T08', 'delayed', 'family-home', OU, '—¿Dónde está Pablo? —___ (estar + dormir).', '— Де Пабло? — Він спить.', 'está', 'durmiendo', 'dormiendo', { simple: 'duerme', full: '—¿Dónde está Pablo? —Está durmiendo.' }),
  prog('T09', 'transfer', 'messages', EI, '¡Hola, Ana! Ahora ___ (estar + pedir, nosotros) la cena. ¿Vienes?', 'Привіт, Ано! Ми зараз замовляємо вечерю. Прийдеш?', 'estamos', 'pidiendo', 'pediendo', { ask: 'Допишіть повідомлення: утворіть estar + герундій і впишіть обидва слова.', full: '¡Hola, Ana! Ahora estamos pidiendo la cena. ¿Vienes?' }),
  prog('T10', 'transfer', 'travel', OU, 'En el hotel, mis hijos ___ (estar + dormir) y yo estoy en el bar.', 'У готелі мої діти зараз сплять, а я в барі.', 'están', 'durmiendo', 'dormiendo', { full: 'En el hotel, mis hijos están durmiendo y yo estoy en el bar.' }),

  choice(L, { id: 'T11', role: 'independent', family: 'family-home', ts: [PROG_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Mi madre está hablando por teléfono.', opts: [['Моя мама зараз розмовляє по телефону.', 'c'], ['Моя мама часто розмовляє по телефону.', 'x', 'Estar + герундій: дія відбувається зараз, а не «часто».'], ['Моя мама подзвонить пізніше.', 'x', 'У реченні немає плану на майбутнє.']], rule: R.prog, ok: 'Правильно: estar + герундій — дія відбувається зараз.', no: 'Estar + герундій означає, що дія відбувається зараз: мама зараз розмовляє по телефону.' }),
  choice(L, { id: 'T12', role: 'delayed', family: 'free-time', ts: [PROG_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Los chicos no están estudiando: están jugando al fútbol.', opts: [['Хлопці зараз не вчаться, а грають у футбол.', 'c'], ['Хлопці ніколи не вчаться.', 'x', 'У реченні йдеться про «зараз», а не про «ніколи».'], ['Хлопці грають у футбол по суботах.', 'x', 'Про суботи в реченні нічого не сказано.']], rule: R.prog, ok: 'Правильно: no + estar + герундій — зараз цього не роблять.', no: 'Речення означає: хлопці зараз не вчаться, а грають у футбол.' }),

  choice(L, { id: 'T21', role: 'supported', family: 'free-time', ts: [CPP_C], ask: 'Ідеться про постійну звичку (без наголосу на тимчасовості). Оберіть форму. Підказка: звичка — простий теперішній, дія зараз — estar + герундій.', es: 'Los sábados ___ al fútbol con mis amigos.', opts: [['juego', 'c'], ['estoy jugando', 'x', 'Для постійної звички нейтральний вибір — простий теперішній; estar + gerundio підкреслив би тимчасову ситуацію.']], rule: R.cpp, ref: 'Los sábados juego al fútbol con mis amigos.', ok: 'Правильно: про звичку кажемо простим теперішнім часом.', no: 'Los sábados — звичка, тому простий теперішній: juego.' }),
  choice(L, { id: 'T22', role: 'supported', family: 'messages-chat', ts: [CPP_C], ask: 'Оберіть відповідь, яка підходить за змістом.', es: '—Hola, ¿qué haces? —…', opts: [['Ahora mismo estoy escribiendo un mensaje.', 'c'], ['Escribo mensajes todos los días.', 'x', 'Це про звичку, а питають, що ви робите зараз.']], rule: R.cpp, ok: 'Правильно: питають про «зараз», і відповідь описує дію, що відбувається.', no: 'Питають, що ви робите зараз, тому підходить: Ahora mismo estoy escribiendo un mensaje.' }),
  choice(L, { id: 'T23', role: 'independent', family: 'work-study', ts: [CPP_C], ask: 'Ідеться про постійне місце роботи тата. Оберіть форму.', es: 'Normalmente mi padre ___ en un banco, pero esta semana está de vacaciones.', opts: [['trabaja', 'c'], ['está trabajando', 'x', 'Про постійну роботу нейтрально кажемо простим теперішнім: trabaja.']], rule: R.cpp, ref: 'Normalmente mi padre trabaja en un banco, pero esta semana está de vacaciones.', ok: 'Правильно: про звичну роботу — простий теперішній.', no: 'Normalmente — звичка: trabaja.' }),
  choice(L, { id: 'T24', role: 'independent', family: 'family-home', ts: [CPP_C], ask: 'Відповідь має сказати, що Пабло робить саме зараз. Оберіть продовження.', es: '—¿Dónde está Pablo? —En el parque: …', opts: [['está jugando con el perro.', 'c'], ['juega con el perro los domingos.', 'x', 'Це про звичку, а треба сказати, що Пабло робить саме зараз.']], rule: R.cpp, ok: 'Правильно: дія відбувається зараз.', no: 'Питають, що відбувається зараз: está jugando con el perro.' }),
  choice(L, { id: 'T25', role: 'delayed', family: 'routine', ts: [CPP_C], ask: 'Ідеться про звичайну годину вечері в родині. Оберіть форму.', es: 'En mi casa ___ a las nueve todos los días.', opts: [['cenamos', 'c'], ['estamos cenando', 'x', 'Щоб назвати звичайну годину вечері, кажемо простим теперішнім: cenamos. Estamos cenando a las nueve означало б, що о дев’ятій вечеря вже триває.']], rule: R.cpp, ref: 'En mi casa cenamos a las nueve todos los días.', ok: 'Правильно: todos los días — звичка, простий теперішній.', no: 'Todos los días — звичка: cenamos.' }),
  choice(L, { id: 'T26', role: 'transfer', family: 'messages', ts: [CPP_C], ask: 'Ви пишете повідомлення просто під час вечері: дія відбувається в цю мить. Оберіть, що підходить.', es: '¡Hola, Marta! Ahora mismo ___ con mis padres. Hablamos más tarde.', opts: [['estoy cenando', 'c'], ['ceno los sábados', 'x', 'Це про звичку, а повідомлення — про дію, що відбувається в цю мить.']], rule: R.cpp, ref: '¡Hola, Marta! Ahora mismo estoy cenando con mis padres. Hablamos más tarde.', ok: 'Правильно: ahora mismo — дія відбувається зараз.', no: 'У повідомленні йдеться про «зараз»: estoy cenando.' }),
  choice(L, { id: 'T27', role: 'independent', family: 'work-study', ts: [CPP_R], ask: 'Прочитайте текст і дайте відповідь на запитання: де Ана працює цього тижня?', es: 'Normalmente Ana trabaja en una oficina, pero esta semana está trabajando en casa.', opts: [['Удома.', 'c'], ['В офісі.', 'x', 'В офісі вона працює зазвичай, а цього тижня — удома.'], ['У кафе.', 'x', 'Про кафе в тексті нічого немає.']], rule: R.cpp, ok: 'Правильно: está trabajando en casa — цього тижня, тимчасово.', no: 'Цього тижня Ана працює вдома: está trabajando en casa.' }),
  choice(L, { id: 'T28', role: 'delayed', family: 'free-time', ts: [CPP_R], ask: 'Прочитайте текст і дайте відповідь на запитання: що Пабло робить зараз?', es: 'Pablo juega al fútbol los domingos. Hoy es martes y está estudiando en casa.', opts: [['Учиться вдома.', 'c'], ['Грає у футбол.', 'x', 'У футбол він грає по неділях, а сьогодні вівторок.'], ['Спить.', 'x', 'Про сон у тексті нічого немає.']], rule: R.cpp, ok: 'Правильно: está estudiando — зараз.', no: 'Зараз Пабло вчиться вдома: está estudiando en casa.' }),
  choice(L, { id: 'T29', role: 'transfer', family: 'shop', ts: [CPP_R], ask: 'Прочитайте повідомлення і дайте відповідь на запитання: що людина робить зараз?', es: '¡Hola, Ana! Estoy en el supermercado y estoy comprando fruta. Normalmente compro el pan aquí, pero hoy no hay.', opts: [['Купує фрукти в супермаркеті.', 'c'], ['Купує хліб.', 'x', 'Хліб вона купує тут зазвичай, але сьогодні його немає.'], ['Іде додому.', 'x', 'Про дорогу додому в повідомленні нічого немає.']], rule: R.cpp, ok: 'Правильно: estoy comprando fruta — зараз.', no: 'Зараз людина купує фрукти: estoy comprando fruta.' }),

  choice(L, { id: 'T31', role: 'supported', family: 'phone-call', ts: [LIS], clips: [C1], ask: 'Прослухайте запис. Що людина робить зараз? Корисні слова: mamá — мама; el tren — потяг; hasta las seis — до шостої.', opts: [['Учиться в потязі.', 'c'], ['Учиться вдома.', 'x', 'Удома вона вчиться зазвичай, а зараз — у потязі.'], ['Працює в офісі.', 'x', 'Про офіс у записі не йдеться.']], transcript: 'Hola, mamá. Ahora estoy en el tren y estoy estudiando. Normalmente estudio en casa por la tarde, pero hoy trabajo hasta las seis. Hablamos más tarde, ¿vale?', ok: 'Правильно: estoy en el tren y estoy estudiando.', no: 'Людина каже: estoy en el tren y estoy estudiando — вона вчиться в потязі.' }),
  choice(L, { id: 'T32', role: 'independent', family: 'phone-call', ts: [LIS], clips: [C1], ask: 'Прослухайте запис. До котрої людина сьогодні працює?', opts: [['До шостої.', 'c'], ['До третьої.', 'x'], ['До п’ятої.', 'x']], transcript: 'Hola, mamá. Ahora estoy en el tren y estoy estudiando. Normalmente estudio en casa por la tarde, pero hoy trabajo hasta las seis. Hablamos más tarde, ¿vale?', ok: 'Правильно: hoy trabajo hasta las seis.', no: 'У записі: hoy trabajo hasta las seis — до шостої.' }),
  choice(L, { id: 'T33', role: 'independent', family: 'voice-message', ts: [LIS], clips: [C2], ask: 'Прослухайте повідомлення. Що Марта робить зараз?', opts: [['Працює з новим комп’ютером в офісі.', 'c'], ['Іде додому.', 'x', 'Марта ще в офісі.'], ['Обідає в барі.', 'x', 'Про бар у повідомленні не йдеться.']], transcript: 'Hola, Pablo, soy Marta. Ahora estoy en la oficina: estoy trabajando con el ordenador nuevo. Normalmente salgo a las tres, pero hoy salgo a las cinco. ¡Hasta luego!', ok: 'Правильно: estoy trabajando con el ordenador nuevo.', no: 'Марта каже: estoy trabajando con el ordenador nuevo — вона працює в офісі.' }),
  choice(L, { id: 'T34', role: 'delayed', family: 'voice-message', ts: [LIS], clips: [C2], ask: 'Прослухайте повідомлення. О котрій Марта виходить з роботи сьогодні?', opts: [['О п’ятій.', 'c'], ['О третій.', 'x', 'О третій вона виходить зазвичай, а сьогодні — о п’ятій.'], ['О шостій.', 'x']], transcript: 'Hola, Pablo, soy Marta. Ahora estoy en la oficina: estoy trabajando con el ordenador nuevo. Normalmente salgo a las tres, pero hoy salgo a las cinco. ¡Hasta luego!', ok: 'Правильно: hoy salgo a las cinco.', no: 'Марта каже: normalmente salgo a las tres, pero hoy salgo a las cinco — сьогодні о п’ятій.' }),
  choice(L, { id: 'T35', role: 'transfer', family: 'home', ts: [LIS], clips: [C3], ask: 'Прослухайте запис. Яке твердження правильне?', opts: [['Сестра читає на дивані.', 'c'], ['Батько слухає музику.', 'x', 'Батько готує; музику слухає людина, яка говорить.'], ['Собака грається в парку.', 'x', 'Собака спить.']], rule: LEYENDO, transcript: 'En casa todos están ocupados. Mi padre está cocinando, mi hermana está leyendo en el sofá y el perro está durmiendo. Y yo estoy escuchando música.', ok: 'Правильно: mi hermana está leyendo en el sofá.', no: 'У записі: mi hermana está leyendo en el sofá — сестра читає на дивані.' }),
  dictation(L, { id: 'T36', role: 'delayed', family: 'home', t: LIS_D, clip: C3, closed: false, rule: LEYENDO, ask: 'Прослухайте запис і запишіть почуте іспанською. Великі літери та крапку в кінці не оцінюємо; якщо розділові знаки всередині відрізняються, відповідь залишиться на перевірку.', a: ['En casa todos están ocupados. Mi padre está cocinando, mi hermana está leyendo en el sofá y el perro está durmiendo. Y yo estoy escuchando música.', 'En casa todos están ocupados: mi padre está cocinando, mi hermana está leyendo en el sofá y el perro está durmiendo. Y yo estoy escuchando música.'], err: [['En casa todos estan ocupados. Mi padre esta cocinando, mi hermana esta leyendo en el sofa y el perro esta durmiendo. Y yo estoy escuchando musica.', 'Слова почуто правильно, але бракує знаків наголосу: están, está, sofá, música.']] }),
];

export const clips = [
  clip({ id: C1, lessonId: L, kind: 'text', family: 'phone-call', targets: [LIS], transcript: 'Hola, mamá. Ahora estoy en el tren y estoy estudiando. Normalmente estudio en casa por la tarde, pero hoy trabajo hasta las seis. Hablamos más tarde, ¿vale?', translationUk: 'Привіт, мамо. Я зараз у потязі й учуся. Зазвичай я вчуся вдома після обіду, але сьогодні працюю до шостої. Поговоримо пізніше, гаразд?' }),
  clip({ id: C2, lessonId: L, kind: 'text', family: 'voice-message', targets: [LIS], transcript: 'Hola, Pablo, soy Marta. Ahora estoy en la oficina: estoy trabajando con el ordenador nuevo. Normalmente salgo a las tres, pero hoy salgo a las cinco. ¡Hasta luego!', translationUk: 'Привіт, Пабло, це Марта. Я зараз в офісі: працюю з новим комп’ютером. Зазвичай я виходжу о третій, але сьогодні виходжу о п’ятій. До зустрічі!' }),
  clip({ id: C3, lessonId: L, kind: 'text', family: 'home', targets: [LIS, LIS_D], transcript: 'En casa todos están ocupados. Mi padre está cocinando, mi hermana está leyendo en el sofá y el perro está durmiendo. Y yo estoy escuchando música.', translationUk: 'Удома всі зайняті. Тато готує, сестра читає на дивані, а собака спить. А я слухаю музику.' }),
];

const T_PROG = TABLE_ES(['persona', 'estar', 'gerundio'], [
  ['yo', 'estoy', 'trabajando'], ['tú', 'estás', 'comiendo'], ['él / ella / usted', 'está', 'leyendo'],
  ['nosotros / nosotras', 'estamos', 'escribiendo'], ['vosotros / vosotras', 'estáis', 'durmiendo'], ['ellos / ellas / ustedes', 'están', 'pidiendo'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Дія в процесі: estar + герундій',
  termEs: 'estar + gerundio',
  summaryUk: 'Будуємо estar + герундій (estoy trabajando), щоб сказати, що відбувається зараз, і відрізняємо цю конструкцію від простого теперішнього часу для звичок.',
  objectives: ['A2-01-O4', 'A2-01-O5'],
  situations: ['routine-study-leisure', 'people-family-home'],
  estimatedMinutes: 16,
  introduces: ['progressive.estar-gerund', 'contrast.present-progressive', 'listening.ongoing-actions'],
  revisits: ['present.estar', 'progressive.gerund-regular-ar', 'progressive.gerund-regular-er-ir', 'progressive.gerund-yendo', 'progressive.gerund-e-i', 'progressive.gerund-o-u', 'neg.no-before-verb', 'time.frequency.adverbs', 'present.hacer', 'present.ver'],
  steps: [
    s('s1', 'explanation', 'estar + герундій: що відбувається зараз', true, {
      blocks: [
        UK('Щоб сказати, що дія відбувається саме зараз, уживаємо estar у теперішньому часі + герундій. Особу показує estar, а герундій не змінюється.'),
        T_PROG,
        UK('Заперечення no ставимо перед estar: No estoy trabajando. Питання: ¿Qué estás haciendo?'),
        EX('—¿Qué estás haciendo? —Estoy leyendo el periódico.', '— Що ти зараз робиш? — Читаю газету.'),
        EX('En este momento mis padres están cenando.', 'Цієї миті мої батьки вечеряють.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Побудуйте estar + герундій', true, { tasks: ['T01', 'T02'] }),
    s('s3', 'explanation', 'Звичка чи дія зараз?', true, {
      blocks: [
        UK('Простий теперішній час описує звички, розклад і загальні факти: Los sábados juego al fútbol. Trabajo en un banco.'),
        UK('Estar + герундій описує дію, що відбувається зараз або в цей обмежений період: Ahora estoy jugando. Esta semana estoy trabajando en casa.'),
        UK('Про «зараз» іспанці часто кажуть і простим теперішнім: ¿Qué haces? — Leo un libro / Estoy leyendo un libro. Про постійні звички нейтрально кажемо простим теперішнім (Los sábados juego al fútbol); estar + gerundio (форма на -ando / -iendo) зі звичною дією підкреслює, що ситуація тимчасова: Últimamente estoy trabajando los sábados. Нагадаємо форму gerundio з уроку A2-01-L3: leer → leyendo. Одне слово на кшталт ahora не вирішує все: дивіться на зміст усього речення.'),
        EX('Normalmente trabajo en una oficina, pero esta semana estoy trabajando en casa.', 'Зазвичай я працюю в офісі, але цього тижня працюю вдома.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Звичка чи дія зараз', true, { tasks: ['T21', 'T22'] }),
    s('s5', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T04', 'T11', 'T23', 'T27'] }),
    s('s6', 'listening', 'Слухаємо: хто що робить', true, { clips: [C1, C2], tasks: ['T31', 'T32', 'T33'] }),
    s('s7', 'independent-practice', 'Додаткова практика', false, { tasks: ['T05', 'T06', 'T24'] }),
    s('s8', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'estar (estoy, estás, está, estamos, estáis, están) + герундій — дія зараз: Estoy trabajando.',
          'No стоїть перед estar: No estoy trabajando.',
          'Звичка, розклад, загальний факт — простий теперішній: Los sábados juego al fútbol.',
          'Про «зараз» часто підходять обидві форми; про постійну звичку зазвичай — простий теперішній.',
        ]),
        LINK('Потренувати estar + герундій', [PROG, PROG_R, CPP_C, CPP_R], 'written', 8),
        LINK('Послухати ще', [LIS], 'listening', 3),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-01.estar-gerund',
    topicId: L,
    titleUk: 'estar + герундій і простий теперішній',
    blocks: [
      T_PROG,
      UK('Звичка, розклад, загальний факт — простий теперішній. Дія зараз або в обмежений період — estar + герундій. Про «зараз» часто підходять обидві форми.'),
      EX('Los sábados juego al fútbol. Ahora estoy jugando.', 'По суботах я граю у футбол. Зараз я граю.'),
      LINK('Практика: estar + герундій', [PROG, CPP_C], 'written', 8),
    ],
    linkedTargets: [PROG, PROG_R, CPP_C, CPP_R],
  }),
];
