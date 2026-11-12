// A2-02-L2 — direct object pronouns: me, te, nos, os; lo, la, los, las; referent; placement before a finite verb.
import { EX, LINK, LIST_UK, TABLE_UK, UK, choice, gap, lesson as mkLesson, open, step } from '../lib.mjs';

const L = 'A2-02-L2';
const D12 = 'object-pron.direct-1-2/written-form';
const D3 = 'object-pron.direct-3/written-form';
const D3_C = 'object-pron.direct-3/context-choice';
const REF = 'object-pron.direct-referent/reading-meaning';
const PFC = 'object-pron.placement-finite/construction-use';
const PFW = 'object-pron.placement-finite/written-form';

const R = {
  d12: 'Me, te, nos, os означають «мене, тебе, нас, вас», коли дія спрямована на цю людину: Ana me llama. ¿Te ayudo? Os — для vosotros.',
  d3: 'Lo, la, los, las замінюють уже названий прямий додаток і узгоджуються з ним у роді й числі: ¿El pan? Lo compro yo. ¿Las llaves? Las tengo.',
  le: 'Звичайні форми третьої особи — lo, la, los, las: узгоджуємо з іменником у роді й числі. Про одного чоловіка в Іспанії кажуть і lo, і le: ¿Pablo? Lo veo / Le veo mañana. Для предметів le не вживаємо; про жінку в третій особі кажемо la (лише при ввічливому звертанні на usted трапляється й le: ¿Le ayudo, señora?).',
  pf: 'Займенник стоїть перед особовою формою дієслова окремим словом: Lo compro. No стоїть перед займенником: No lo compro.',
  ref: 'Щоб зрозуміти lo, la, los, las, шукаємо раніше названий іменник того самого роду й числа.',
};
const ASK3 = 'Замініть названий предмет чи людину займенником lo, la, los або las. Впишіть займенник.';
const ASKW = 'Складіть речення з поданих слів у правильному порядку.';
const ASKC = 'Дайте відповідь, замінивши іменник займенником. Впишіть пропущені слова.';
const ASKC12 = 'Дайте відповідь, уживши потрібний займенник (зверніть увагу, хто говорить і до кого). Впишіть пропущені слова.';
const ASKWN = 'Складіть із поданих слів одне заперечне речення в правильному порядку.';

// who: the Ukrainian meaning of the pronoun («мене»), given in the instruction (Spanish prompt blocks stay Spanish)
const d12 = (id, role, family, who, es, uk, a, err, model) =>
  gap(L, { id, role, family, t: D12, ask: `${model ? 'Подивіться на зразок. ' : ''}Впишіть займенник зі значенням «${who}».`, model, es, uk, a, err, rule: R.d12 });
const d3 = (id, role, family, es, uk, a, err, extra = {}) =>
  gap(L, { id, role, family, t: D3, ask: extra.model ? `Подивіться на зразок. ${ASK3}` : ASK3, model: extra.model, es, uk, a, err, rule: extra.person ? [R.d3, R.le] : R.d3, why: extra.why });
// word order only: the words are given, the pronoun is not chosen by the learner
// one listed order → closed; several natural orders listed → open (an unlisted order stays unresolved)
const order = (id, role, family, words, uk, a, err) => {
  const acc = Array.isArray(a) ? a : [a];
  return open(L, { id, role, family, ts: [PFW], ask: words.startsWith('no /') ? ASKWN : ASKW, es: words, uk, a: acc, err: err.map(([t, fb]) => [t, { [PFW]: 'incorrect' }, fb]), rule: R.pf, closed: acc.length === 1, full: acc[0], ok: acc.length === 1 ? `Правильно: ${acc[0]}` : 'Правильно.', no: `Правильна відповідь: ${acc[0]}` });
};
// build the answer: choose the pronoun (form target) and place it (construction target)
const build = (id, role, family, form, es, uk, acc, misplaced, wrongForm, full, extra = {}) => {
  const err = [];
  for (const [t, fb] of misplaced) err.push([t, { [PFC]: 'incorrect', [form]: 'correct' }, fb]);
  for (const [t, fb] of wrongForm) err.push([t, { [PFC]: 'correct', [form]: 'incorrect' }, fb]);
  return open(L, { id, role, family, ts: [PFC, form], ask: `${extra.model ? 'Подивіться на зразок. ' : ''}${extra.who ? `${extra.who} ` : ''}${form === D12 ? ASKC12 : ASKC}`, model: extra.model, es, uk, a: acc, err, rule: [R.pf, form === D3 ? R.d3 : R.d12, ...(extra.person ? [R.le] : [])], full, ok: `Правильно: ${full}`, no: `Можлива відповідь: ${full}` });
};

export const tasks = [
  // me, te, nos, os
  d12('T01', 'supported', 'family-home', 'мене', 'Mis padres ___ llaman los domingos.', 'Батьки дзвонять мені по неділях.', 'me', [['mi', 'Mi — присвійне слово («мій»). Перед дієсловом — займенник me.']], [['Ana me llama todos los días.', 'Ана дзвонить мені щодня.']]),
  d12('T02', 'supported', 'shop', 'тебе', '¿___ ayudo con las bolsas?', 'Тобі допомогти з пакетами?', 'Te', [['Ti', 'Ti вживаємо після прийменника (para ti). Перед дієсловом — te.']], [['¿Me ayudas, por favor?', 'Допоможеш мені, будь ласка?']]),
  d12('T03', 'independent', 'family-home', 'вас (vosotros)', 'El sábado ___ invito a cenar en casa.', 'У суботу я запрошую вас на вечерю додому.', 'os', [['vosotros', 'Перед дієсловом уживаємо коротку форму: os.']]),
  d12('T04', 'independent', 'free-time', 'нас', 'Pablo siempre ___ espera en la puerta del cine.', 'Пабло завжди чекає нас біля входу в кінотеатр.', 'nos', [['nosotros', 'Перед дієсловом уживаємо коротку форму: nos.']]),
  d12('T05', 'delayed', 'family-home', 'мене', '¿___ buscas? Estoy en la cocina.', 'Ти мене шукаєш? Я на кухні.', 'Me', [['Mi', 'Mi — присвійне слово («мій»). Перед дієсловом — займенник me.']]),
  d12('T06', 'transfer', 'messages', 'мене', '¡Hola, Ana! ¿___ esperas en el bar? Llego en diez minutos.', 'Привіт, Ано! Почекаєш мене в барі? Я буду за десять хвилин.', 'Me', [['Mi', 'Mi — присвійне слово («мій»). Перед дієсловом — займенник me.']]),

  // lo, la, los, las
  d3('T11', 'supported', 'shop', '¿La leche? ___ compro yo.', 'Молоко? Його куплю я.', 'La', [['Lo', 'Leche — жіночого роду: la.'], ['Le', 'Le не вживаємо замість предмета: la.']], { model: [['¿El pan? Lo compro yo.', 'Хліб? Його куплю я.']], why: 'Leche — жіночого роду, однина.' }),
  d3('T12', 'supported', 'family-home', '¿Las llaves? ___ tengo yo.', 'Ключі? Вони в мене.', 'Las', [['Los', 'Llaves — жіночого роду: las.'], ['La', 'Llaves — множина: las.']], { model: [['¿Los libros? Los tengo yo.', 'Книжки? Вони в мене.']], why: 'Llaves — жіночого роду, множина.' }),
  d3('T13', 'independent', 'shop', '¿Los tomates? ___ compro en el supermercado.', 'Помідори? Я купую їх у супермаркеті.', 'Los', [['Las', 'Tomates — чоловічого роду: los.'], ['Lo', 'Tomates — множина: los.']], { why: 'Tomates — чоловічого роду, множина.' }),
  d3('T14', 'independent', 'family-home', '—¿Ves a Pablo los domingos? —Sí, ___ veo todos los domingos.', '— Ти бачишся з Пабло по неділях? — Так, я бачу його щонеділі.', ['lo', 'le'], [['la', 'Pablo — чоловік: lo (в Іспанії також le).']], { person: true, why: 'Про одного чоловіка — lo, в Іспанії також le.' }),
  d3('T15', 'delayed', 'family-home', '—¿Dónde está mi mochila? —No sé, no ___ veo.', '— Де мій рюкзак? — Не знаю, я його не бачу.', 'la', [['lo', 'Mochila — жіночого роду: la.'], ['le', 'Le не вживаємо замість предмета: la.']], { why: 'Mochila — жіночого роду, однина.' }),
  d3('T16', 'transfer', 'messages', '¡Hola, Marta! ¿Tienes mis gafas? No ___ encuentro.', 'Привіт, Марто! Мої окуляри в тебе? Я не можу їх знайти.', 'las', [['los', 'Gafas — жіночого роду: las.'], ['la', 'Gafas — множина: las.']], { why: 'Gafas — жіночого роду, множина.' }),

  // context choice
  choice(L, { id: 'T21', role: 'independent', family: 'family-home', ts: [D3_C], ask: 'Оберіть займенник.', es: '—¿Dónde está la mochila de Ana? —___ tienes tú en la mano.', opts: [['La', 'c'], ['Lo', 'x', 'Mochila — жіночого роду: la.'], ['Le', 'x', 'Le не вживаємо замість предмета.']], rule: R.d3, ref: '—¿Dónde está la mochila de Ana? —La tienes tú en la mano.', ok: 'Правильно: la mochila → la.', no: 'Правильно: La tienes tú en la mano (la mochila → la).' }),
  choice(L, { id: 'T22', role: 'delayed', family: 'school', ts: [D3_C], ask: 'Оберіть займенник.', es: '—¿Conoces a mis hermanas? —No, no ___ conozco.', opts: [['las', 'c'], ['les', 'x', 'Про кількох жінок — las.'], ['los', 'x', 'Hermanas — жіночого роду: las.']], rule: [R.d3, R.le], ref: '—¿Conoces a mis hermanas? —No, no las conozco.', ok: 'Правильно: mis hermanas → las.', no: 'Правильно: No, no las conozco (mis hermanas → las).' }),
  choice(L, { id: 'T23', role: 'transfer', family: 'work-study', ts: [D3_C], ask: 'Колега питає про ваш ноутбук (el ordenador). Оберіть відповідь.', es: '—¿Necesitas el ordenador hoy? —Sí, ___ necesito para la reunión.', opts: [['lo', 'c'], ['le', 'x', 'Le не вживаємо замість предмета: lo.'], ['la', 'x', 'Ordenador — чоловічого роду: lo.']], rule: [R.d3, R.le], ref: '—¿Necesitas el ordenador hoy? —Sí, lo necesito para la reunión.', ok: 'Правильно: el ordenador → lo.', no: 'Правильно: Sí, lo necesito (el ordenador → lo).' }),

  // referent (reading)
  choice(L, { id: 'T24', role: 'supported', family: 'shop', ts: [REF], ask: 'Прочитайте речення. Що означає las?', es: 'Compro unas manzanas y las pongo en la mesa.', opts: [['яблука', 'c'], ['стіл', 'x', 'Mesa — однина, а las — множина.'], ['покупки взагалі', 'x', 'Las замінює конкретний іменник жіночого роду в множині: las manzanas.']], rule: R.ref, ok: 'Правильно: las = las manzanas.', no: 'Las = las manzanas: жіночий рід, множина.' }),
  choice(L, { id: 'T25', role: 'independent', family: 'family-home', ts: [REF], ask: 'Прочитайте діалог. Кого Ана бачить у суботу?', es: '—¿Y tus padres? —Los veo el sábado. Mi hermana viene el domingo.', opts: [['батьків', 'c'], ['сестру', 'x', 'Про сестру сказано окремо: вона приходить у неділю.'], ['себе', 'x', 'Los — множина, чоловічий рід: tus padres.']], rule: R.ref, ok: 'Правильно: los = tus padres.', no: 'Los = tus padres: у суботу вона бачить батьків.' }),
  choice(L, { id: 'T26', role: 'delayed', family: 'food-cafe', ts: [REF], ask: 'Прочитайте діалог. Що офіціант приносить зараз?', es: '—Un café y un zumo de manzana, por favor. —Muy bien. El café lo traigo ahora y el zumo, en cinco minutos.', opts: [['каву', 'c'], ['сік', 'x', 'Сік (el zumo) він принесе за п’ять хвилин.'], ['і каву, і сік', 'x', 'Зараз лише кава; сік — за п’ять хвилин.']], rule: R.ref, ok: 'Правильно: lo = el café, ahora.', no: 'Lo = el café — зараз; сік — за п’ять хвилин.' }),
  choice(L, { id: 'T27', role: 'transfer', family: 'messages', ts: [REF], ask: 'Прочитайте повідомлення. Що Пабло просить купити?', es: '¡Hola, Ana! Las patatas ya las tengo, pero no tengo pan. ¿Lo compras tú?', opts: [['хліб', 'c'], ['картоплю', 'x', 'Картопля в Пабло вже є: ya las tengo.'], ['і хліб, і картоплю', 'x', 'Картопля вже є; lo — це pan.']], rule: R.ref, ok: 'Правильно: lo = el pan.', no: 'Lo = el pan; картопля вже є (las = las patatas).' }),

  // build: choose + place the pronoun
  build('T31', 'supported', 'shop', D3, '—¿Compras tú el pan? —Sí, ___.', '— Ти купуєш хліб? — Так, я.', ['lo compro', 'lo compro yo', 'yo lo compro'], [['compro lo', 'Займенник стоїть перед дієсловом: lo compro.']], [['la compro', 'Pan — чоловічого роду: lo.'], ['le compro', 'Le не вживаємо замість предмета: lo.']], '—¿Compras tú el pan? —Sí, lo compro.', { model: [['—¿Tienes las llaves? —Sí, las tengo.', '— Ключі в тебе? — Так, у мене.']] }),
  build('T32', 'supported', 'family-home', D12, '—¿Me llamas mañana? —Sí, ___ mañana.', '— Подзвониш мені завтра? — Так, подзвоню тобі завтра.', ['te llamo'], [['llamo te', 'Займенник стоїть перед дієсловом: te llamo.']], [['me llamo', 'Me llamo — «мене звати». Тут ви дзвоните співрозмовнику: te llamo.'], ['ti llamo', 'Перед дієсловом — te, не ti.']], '—¿Me llamas mañana? —Sí, te llamo mañana.', { model: [['—¿Me ayudas? —Sí, te ayudo.', '— Допоможеш мені? — Так, допоможу тобі.']] }),
  build('T33', 'independent', 'shop', D3, '—¿Quieres estas manzanas? —No, gracias, no ___.', '— Хочеш ці яблука? — Ні, дякую, не хочу.', ['las quiero'], [['quiero las', 'Займенник стоїть перед дієсловом: no las quiero.'], ['las no quiero', 'No стоїть перед займенником: no las quiero.']], [['los quiero', 'Manzanas — жіночого роду: las.'], ['la quiero', 'Manzanas — множина: las.']], '—¿Quieres estas manzanas? —No, gracias, no las quiero.'),
  build('T34', 'independent', 'family-home', D3, '—¿Ves mucho a tu madre? —Sí, ___ todos los domingos.', '— Ти часто бачишся з мамою? — Так, я бачу її щонеділі.', ['la veo'], [['veo la', 'Займенник стоїть перед дієсловом: la veo.']], [['le veo', 'Про жінку — la, не le.'], ['lo veo', 'Madre — жіночого роду: la.']], '—¿Ves mucho a tu madre? —Sí, la veo todos los domingos.'),
  build('T35', 'independent', 'free-time', D12, '—¿Nos esperas en el parque? —Sí, ___ allí.', '— Почекаєш нас у парку? — Так, чекаю вас там.', ['os espero', 'os espero yo'], [['espero os', 'Займенник стоїть перед дієсловом: os espero.']], [['nos espero', 'Ви чекаєте співрозмовників (vosotros): os espero.'], ['les espero', 'Ви звертаєтеся до друзів на vosotros, тому os.']], '—¿Nos esperas en el parque? —Sí, os espero allí.', { who: 'Вас питають друзі, до яких ви звертаєтеся на vosotros.' }),
  build('T36', 'independent', 'family-home', D12, '—¿Me buscas tú? —Sí, ___. ¿Tienes un momento?', '— Ти мене шукаєш? — Так, тебе. Маєш хвилинку?', ['te busco', 'te busco yo'], [['busco te', 'Займенник стоїть перед дієсловом: te busco.']], [['me busco', 'Ви шукаєте співрозмовника: te busco.'], ['ti busco', 'Перед дієсловом — te, не ti.']], '—¿Me buscas tú? —Sí, te busco. ¿Tienes un momento?'),
  build('T37', 'delayed', 'shop', D3, '—¿Tienes los billetes del cine? —No, no ___. ¿Y tú?', '— Квитки в кіно в тебе? — Ні, не в мене. А в тебе?', ['los tengo'], [['tengo los', 'Займенник стоїть перед дієсловом: no los tengo.'], ['los no tengo', 'No стоїть перед займенником: no los tengo.']], [['las tengo', 'Billetes — чоловічого роду: los.'], ['lo tengo', 'Billetes — множина: los.']], '—¿Tienes los billetes del cine? —No, no los tengo. ¿Y tú?'),
  build('T38', 'delayed', 'family-home', D12, '—¿Nos invitas a cenar? —Claro, ___ el sábado.', '— Запросиш нас на вечерю? — Звісно, запрошую вас у суботу.', ['os invito', 'os invito yo'], [['invito os', 'Займенник стоїть перед дієсловом: os invito.']], [['nos invito', 'Ви запрошуєте співрозмовників (vosotros): os invito.']], '—¿Nos invitas a cenar? —Claro, os invito el sábado.'),
  build('T39', 'transfer', 'travel', D3, '—¿Dónde compramos los billetes de tren? —___ en la estación.', '— Де ми купимо квитки на потяг? — Купимо їх на вокзалі.', ['Los compramos'], [['Compramos los', 'Займенник стоїть перед дієсловом: los compramos.']], [['Las compramos', 'Billetes — чоловічого роду: los.']], '—¿Dónde compramos los billetes de tren? —Los compramos en la estación.'),
  build('T40', 'transfer', 'work-study', D12, '—Profesora, ¿nos ayuda, por favor? —Sí, ___ ahora mismo.', '— Пані вчителько, допоможете нам, будь ласка? — Так, допоможу вам просто зараз.', ['os ayudo'], [['ayudo os', 'Займенник стоїть перед дієсловом: os ayudo.']], [['nos ayudo', 'Вчителька допомагає учням (vosotros): os ayudo.']], '—Profesora, ¿nos ayuda, por favor? —Sí, os ayudo ahora mismo.', { who: 'Ви — вчителька, яка звертається до учнів на vosotros.' }),

  // order only
  order('T41', 'supported', 'shop', 'no / lo / compro', 'Я його не купую.', 'No lo compro.', [['Lo no compro.', 'No стоїть перед займенником: No lo compro.'], ['No compro lo.', 'Займенник стоїть перед дієсловом: No lo compro.']]),
  order('T42', 'supported', 'family-home', 'te / mañana / llamo', 'Я подзвоню тобі завтра.', ['Te llamo mañana.', 'Mañana te llamo.'], [['Llamo te mañana.', 'Займенник стоїть перед дієсловом: Te llamo mañana.']]),
  order('T43', 'independent', 'free-time', 'no / la / veo', 'Я її не бачу.', 'No la veo.', [['La no veo.', 'No стоїть перед займенником: No la veo.'], ['No veo la.', 'Займенник стоїть перед дієсловом: No la veo.']]),
  order('T44', 'independent', 'family-home', '¿ / los / conoces / ?', 'Ти їх знаєш?', '¿Los conoces?', [['¿Conoces los?', 'Займенник стоїть перед дієсловом: ¿Los conoces?']]),
  order('T45', 'independent', 'shop', 'Ana / las / compra / siempre', 'Ана завжди їх купує.', ['Ana siempre las compra.', 'Ana las compra siempre.', 'Siempre las compra Ana.'], [['Ana las siempre compra.', 'Між займенником і дієсловом нічого не ставимо: Ana siempre las compra.'], ['Ana siempre compra las.', 'Займенник стоїть перед дієсловом: Ana siempre las compra.']]),
  order('T46', 'independent', 'free-time', 'no / os / espero', 'Я вас не чекаю.', 'No os espero.', [['Os no espero.', 'No стоїть перед займенником: No os espero.']]),
  order('T47', 'delayed', 'family-home', 'mis / padres / me / llaman / no', 'Батьки мені не дзвонять.', ['Mis padres no me llaman.', 'No me llaman mis padres.'], [['Mis padres me no llaman.', 'No стоїть перед займенником: Mis padres no me llaman.'], ['Mis padres no llaman me.', 'Займенник стоїть перед дієсловом: Mis padres no me llaman.']]),
  order('T48', 'delayed', 'shop', '¿ / lo / quiere / usted / ?', 'Ви його хочете?', ['¿Lo quiere usted?', '¿Usted lo quiere?'], [['¿Quiere lo usted?', 'Займенник стоїть перед дієсловом: ¿Lo quiere usted?']]),
  order('T49', 'transfer', 'messages', 'no / te / entiendo', 'Я тебе не розумію.', 'No te entiendo.', [['Te no entiendo.', 'No стоїть перед займенником: No te entiendo.'], ['No entiendo te.', 'Займенник стоїть перед дієсловом: No te entiendo.']]),
  order('T50', 'transfer', 'travel', 'hoy / no / lo / cojo', '(Про потяг, el tren) Сьогодні я ним не їду.', ['Hoy no lo cojo.', 'No lo cojo hoy.'], [['Hoy lo no cojo.', 'No стоїть перед займенником: Hoy no lo cojo.']]),
];

const T_PRON = TABLE_UK(['кого?', 'займенник', 'приклад'], [
  ['мене', 'me', 'Ana me llama.'],
  ['тебе', 'te', '¿Te ayudo?'],
  ['його, це (чол. рід); вас — usted', 'lo', '¿El pan? Lo compro.'],
  ['її (жін. рід); вас — usted', 'la', '¿La leche? La compro.'],
  ['нас', 'nos', 'Pablo nos espera.'],
  ['вас (vosotros)', 'os', 'Os invito a cenar.'],
  ['їх (чол. рід); вас — ustedes', 'los', '¿Los libros? Los tengo.'],
  ['їх (жін. рід); вас — ustedes', 'las', '¿Las llaves? Las tengo.'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Мене, тебе, його: займенник замість додатка',
  termEs: 'pronombres de objeto directo',
  summaryUk: 'Замінюємо вже названу людину чи предмет коротким займенником: ¿El pan? Lo compro yo. Ana me llama. Займенник стоїть перед дієсловом: No lo veo.',
  objectives: ['A2-02-O3', 'A2-02-O5'],
  situations: ['food-shopping', 'people-family-home', 'personal-messages'],
  estimatedMinutes: 20,
  introduces: ['object-pron.direct-1-2', 'object-pron.direct-3', 'object-pron.direct-referent', 'object-pron.placement-finite'],
  revisits: ['reflexive.pronouns', 'neg.no-before-verb', 'adj.agreement.o-a', 'prep.a.personal', 'present.ver', 'present.stem-e-ie'],
  steps: [
    s('s1', 'explanation', 'Займенники me, te, nos, os', true, {
      blocks: [
        UK('Прямий додаток відповідає на питання «кого? що?»: Ana llama a Pablo. Якщо це «мене, тебе, нас, вас», уживаємо короткі займенники me, te, nos, os — ті самі, що у зворотних дієсловах (me levanto), але тут дію спрямовано на іншу людину.'),
        UK('Нові дієслова: ayudar — допомагати, buscar — шукати, esperar — чекати, invitar — запрошувати. Зверніть увагу: в іспанській «кого?» там, де українською часто «кому?»: Ana me llama — «Ана дзвонить мені»; ¿Te ayudo? — «Тобі допомогти?».'),
        EX('Mis amigos me esperan en el bar.', 'Мої друзі чекають мене в барі.'),
        EX('¿Te ayudo con la maleta?', 'Допомогти тобі з валізою?'),
        EX('Os invito a cenar el sábado.', 'Запрошую вас на вечерю в суботу.'),
        EX('¿Me buscas?', 'Ти мене шукаєш?'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Me, te, nos, os за зразком', true, { tasks: ['T01', 'T02', 'T32', 'T42'] }),
    s('s3', 'explanation', 'Lo, la, los, las і місце займенника', true, {
      blocks: [
        UK('Lo, la, los, las замінюють уже названий предмет чи людину й узгоджуються з ним у роді й числі: el pan → lo, la leche → la, los tomates → los, las llaves → las. Звертаючись на usted чи ustedes, теж уживаємо ці форми: ¿La ayudo, señora?'),
        T_PRON,
        UK('Займенник стоїть перед особовою формою дієслова окремим словом. No стоїть перед займенником: No lo compro. У питанні порядок той самий: ¿Lo conoces?'),
        UK('Про одного чоловіка в Іспанії кажуть і lo, і le: ¿Pablo? Lo veo / Le veo mañana. Ми вчимо lo. Для предметів le не вживаємо; про жінку в третій особі кажемо la (¿Ana? La veo mañana). Лише при ввічливому звертанні на usted до жінки трапляється й le (¿Le ayudo, señora?), але моделлю вчимо la.'),
        EX('—¿Dónde están las llaves? —No sé, no las veo.', '— Де ключі? — Не знаю, я їх не бачу.'),
        EX('—¿Compras tú el pan? —Sí, lo compro yo.', '— Хліб купуєш ти? — Так, я.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Lo, la, los, las за зразком', true, { tasks: ['T11', 'T12', 'T24', 'T31', 'T41'] }),
    s('s5', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T13', 'T14', 'T21', 'T25', 'T33', 'T34', 'T43', 'T44'] }),
    s('s6', 'independent-practice', 'Додаткова практика', false, { tasks: ['T04', 'T35', 'T36', 'T45', 'T46'] }),
    s('s7', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'me, te, nos, os — «мене, тебе, нас, вас»: Ana me llama.',
          'lo, la, los, las — замість названого предмета чи людини, у тому самому роді й числі.',
          'Займенник — перед дієсловом; no — перед займенником: No lo compro.',
        ]),
        LINK('Потренувати займенники прямого додатка', [D12, D3, PFC, PFW, D3_C, REF], 'written', 10),
      ],
    }),
  ],
});
