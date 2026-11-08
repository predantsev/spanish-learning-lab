// A2-01-L6 — poder / saber + infinitive, tener que, modal meanings; CV-05 acabar de, empezar a, volver a.
import { EX, LINK, LIST_UK, TABLE_UK, UK, choice, gap, lesson as mkLesson, material, open, step } from '../lib.mjs';

const L = 'A2-01-L6';
const POD = 'ability.poder-inf/construction-use';
const POD_R = 'ability.poder-inf/reading-meaning';
const SABI = 'ability.saber-inf/construction-use';
const SABI_R = 'ability.saber-inf/reading-meaning';
const PS = 'contrast.poder-saber/context-choice';
const TQ = 'obligation.tener-que/construction-use';
const TQ_R = 'obligation.tener-que/reading-meaning';
const MM_C = 'contrast.modal-meaning/context-choice';
const MM_R = 'contrast.modal-meaning/reading-meaning';
const AD = 'perifrasis.acabar-de/construction-use';
const AD_R = 'perifrasis.acabar-de/reading-meaning';
const EA = 'perifrasis.empezar-a/construction-use';
const EA_R = 'perifrasis.empezar-a/reading-meaning';
const VA = 'perifrasis.volver-a/construction-use';
const VA_R = 'perifrasis.volver-a/reading-meaning';
const OUE = 'present.stem-o-ue/written-form';
const EIE = 'present.stem-e-ie/written-form';
const UNCH = 'present.stem-unchanged-1p-2p/written-form';
const SAB = 'present.saber/written-form';
const SE = 'ortho.accent-pair.se/written-form';
const TEN = 'present.tener/written-form';

const R = {
  pod: 'Poder + інфінітив: є змога щось зробити, дозволяють обставини: Hoy no puedo salir. Після poder інфінітив іде без прийменника.',
  sabi: 'Saber + інфінітив: уміння, якого навчилися: Sé nadar — «я вмію плавати». Інфінітив іде без прийменника.',
  ps: '«Вміти» (навичка) — saber + інфінітив: Sé conducir. «Могти» (дозволяють обставини) — poder + інфінітив: Hoy no puedo conducir.',
  tq: 'Tener que + інфінітив — особистий обов’язок: Tengo que trabajar — «мені треба працювати». Que обов’язкове; змінюється лише tener.',
  mm: 'Tener que + інфінітив — обов’язок («мушу, треба»), poder — можливість («можу»), querer — бажання («хочу»), ir a — план («збираюся»).',
  ad: 'Acabar у теперішньому часі + de + інфінітив — дія щойно завершилася: Acabo de llegar — «я щойно прийшов». De обов’язкове.',
  ea: 'Empezar (e → ie) + a + інфінітив — почати щось робити: Empiezo a trabajar a las nueve. A обов’язкове.',
  va: 'Volver (o → ue) + a + інфінітив — зробити ще раз, знову: Vuelvo a leer el mensaje. Не плутайте з volver a + місце: Vuelvo a casa — «повертаюся додому».',
};

/**
 * Verb + (link) + infinitive in one short answer: the construction and the conjugated verb form are
 * separate targets. link: '' (poder, saber), 'que', 'de', 'a'.
 */
function frame(id, role, family, cons, formT, rule, es, uk, verb, link, inf, extra = {}) {
  const answer = [verb, link, inf].filter(Boolean).join(' ');
  const ts = formT ? [cons, ...(Array.isArray(formT) ? formT : [formT])] : [cons];
  const o = (consOutcome, formOutcome) => Object.fromEntries(ts.map((t) => [t, t === cons ? consOutcome : formOutcome]));
  const err = [];
  if (link) err.push([`${verb} ${inf}`, o('incorrect', 'correct'), `${link === 'que' ? 'Que' : link === 'de' ? 'De' : 'A'} тут обов’язкове: ${answer}.`]);
  else err.push([`${verb} a ${inf}`, o('incorrect', 'correct'), `Після ${extra.lemma ?? 'цього дієслова'} інфінітив іде без прийменника: ${answer}.`]);
  if (extra.conj) err.push([[verb, link, extra.conj].filter(Boolean).join(' '), o('incorrect', 'correct'), `Друге дієслово стоїть в інфінітиві: ${answer}.`]);
  if (extra.badForm && formT) {
    // a wrong verb form says nothing about the sé/se spelling
    const outcomes = Object.fromEntries(ts.map((t) => [t, t === cons ? 'correct' : t === SE ? 'unresolved' : 'incorrect']));
    err.push([[extra.badForm[0], link, inf].filter(Boolean).join(' '), outcomes, extra.badForm[1]]);
  }
  if (extra.seForm) err.push([[extra.seForm, link, inf].filter(Boolean).join(' '), Object.fromEntries(ts.map((t) => [t, t === SE ? 'incorrect' : t === SAB ? 'unresolved' : 'correct'])), 'Форму yo дієслова saber пишемо зі знаком наголосу: sé.']);
  const spec = {
    id,
    role,
    family,
    ask: extra.ask ?? 'Утворіть конструкцію й впишіть пропущені слова.',
    model: extra.model,
    es,
    uk,
    a: [answer],
    rule,
    full: extra.full,
    ok: `Правильно: ${answer}.`,
    no: `Правильна відповідь: ${answer}.`,
  };
  if (ts.length === 1) return gap(L, { ...spec, t: cons, err: err.map(([text, , fb]) => [text, fb]) });
  return open(L, { ...spec, ts, err });
}
const ASK_S = 'Подивіться на зразок, утворіть конструкцію й впишіть пропущені слова.';
const ASK_MSG = 'Допишіть повідомлення: утворіть конструкцію й впишіть пропущені слова.';
const oue = (f) => `Під наголосом o змінюється на ue: ${f}.`;
const eie = (f) => `Під наголосом e змінюється на ie: ${f}.`;
const acc = (f) => `Цю форму пишемо зі знаком наголосу: ${f}.`;

export const tasks = [
  // poder + infinitive
  frame('T01', 'supported', 'plans', POD, OUE, R.pod, '¿___ (poder + venir, tú) el sábado?', 'Ти можеш прийти в суботу?', 'puedes', '', 'venir', { lemma: 'poder', ask: ASK_S, model: [['Hoy no puedo salir.', 'Сьогодні я не можу кудись піти.']], badForm: ['podes', oue('puedes')], full: '¿Puedes venir el sábado?' }),
  frame('T02', 'supported', 'family-home', POD, OUE, R.pod, 'Mis padres no ___ (poder + venir) mañana.', 'Мої батьки не можуть приїхати завтра.', 'pueden', '', 'venir', { lemma: 'poder', ask: ASK_S, model: [['Mañana podemos comer a las dos.', 'Завтра ми можемо пообідати о другій.']], badForm: ['poden', oue('pueden')], full: 'Mis padres no pueden venir mañana.' }),
  frame('T03', 'independent', 'routine', POD, OUE, R.pod, 'Hoy no ___ (poder + ir, yo) al gimnasio: tengo mucho trabajo.', 'Сьогодні я не можу піти в спортзал: у мене багато роботи.', 'puedo', '', 'ir', { lemma: 'poder', badForm: ['podo', oue('puedo')], conj: 'voy', full: 'Hoy no puedo ir al gimnasio: tengo mucho trabajo.' }),
  frame('T04', 'independent', 'food-cafe', POD, UNCH, R.pod, '___ (poder + cenar, nosotros) en el restaurante de la plaza.', 'Ми можемо повечеряти в ресторані на площі.', 'podemos', '', 'cenar', { lemma: 'poder', badForm: ['puedemos', 'У формі nosotros основа не змінюється: podemos.'], full: 'Podemos cenar en el restaurante de la plaza.' }),
  frame('T05', 'independent', 'free-time', POD, OUE, R.pod, 'Ana no ___ (poder + salir) esta noche.', 'Ана не може піти гуляти сьогодні ввечері.', 'puede', '', 'salir', { lemma: 'poder', badForm: ['pode', oue('puede')], conj: 'sale', full: 'Ana no puede salir esta noche.' }),
  frame('T06', 'independent', 'plans', POD, UNCH, R.pod, '¿___ (poder + venir, vosotros) a las ocho?', 'Ви можете прийти о восьмій?', 'podéis', '', 'venir', { lemma: 'poder', badForm: ['podeis', acc('podéis')], full: '¿Podéis venir a las ocho?' }),
  frame('T07', 'delayed', 'food-cafe', POD, OUE, R.pod, 'Hoy no ___ (poder + comer, yo) con vosotros.', 'Сьогодні я не можу пообідати з вами.', 'puedo', '', 'comer', { lemma: 'poder', badForm: ['podo', oue('puedo')], full: 'Hoy no puedo comer con vosotros.' }),
  frame('T08', 'delayed', 'family-home', POD, OUE, R.pod, 'Los niños ___ (poder + jugar) en el parque hasta las siete.', 'Діти можуть гратися в парку до сьомої.', 'pueden', '', 'jugar', { lemma: 'poder', badForm: ['poden', oue('pueden')], full: 'Los niños pueden jugar en el parque hasta las siete.' }),
  frame('T09', 'transfer', 'messages', POD, OUE, R.pod, '¡Hola, Marta! Lo siento, mañana no ___ (poder + ir, yo) al cine.', 'Привіт, Марто! Вибач, завтра я не можу піти в кіно.', 'puedo', '', 'ir', { lemma: 'poder', ask: ASK_MSG, badForm: ['podo', oue('puedo')], full: '¡Hola, Marta! Lo siento, mañana no puedo ir al cine.' }),
  frame('T10', 'transfer', 'travel', POD, UNCH, R.pod, 'En el hotel, ¿___ (poder + desayunar, nosotros) a las siete?', 'У готелі ми можемо поснідати о сьомій?', 'podemos', '', 'desayunar', { lemma: 'poder', badForm: ['puedemos', 'У формі nosotros основа не змінюється: podemos.'], full: 'En el hotel, ¿podemos desayunar a las siete?' }),
  choice(L, { id: 'T11', role: 'independent', family: 'free-time', ts: [POD_R], ask: 'Прочитайте речення. Чому Пабло сьогодні не грає у футбол?', es: 'Hoy Pablo no puede jugar al fútbol: está enfermo.', opts: [['Бо він хворий.', 'c'], ['Бо він не вміє грати.', 'x', 'Не вміє — no sabe jugar; poder говорить про обставини.'], ['Бо він не хоче.', 'x', 'Про бажання в реченні не йдеться.']], rule: R.pod, ok: 'Правильно: no puede — обставини не дозволяють (він хворий).', no: 'Пабло не може грати, бо хворий: no puede jugar, está enfermo.' }),
  choice(L, { id: 'T12', role: 'delayed', family: 'food-cafe', ts: [POD_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Podemos comer a las dos o a las tres.', opts: [['Ми можемо пообідати о другій або о третій.', 'c'], ['Ми мусимо обідати о другій.', 'x', 'Обов’язок — tener que; poder — можливість.'], ['Ми вміємо готувати обід.', 'x', 'Уміння — saber; тут ідеться про можливий час.']], rule: R.pod, ok: 'Правильно: poder + інфінітив — можливість.', no: 'Podemos comer… — ми можемо пообідати о другій або о третій.' }),

  // saber + infinitive
  frame('T21', 'supported', 'transport', SABI, SAB, R.sabi, '¿___ (saber + conducir, tú)?', 'Ти вмієш водити машину?', 'sabes', '', 'conducir', { lemma: 'saber', ask: ASK_S, model: [['Mi hermano sabe nadar.', 'Мій брат уміє плавати.']], conj: 'conduces', full: '¿Sabes conducir?' }),
  frame('T22', 'supported', 'family-home', SABI, SAB, R.sabi, 'Mis hijos ___ (saber + nadar).', 'Мої діти вміють плавати.', 'saben', '', 'nadar', { lemma: 'saber', ask: ASK_S, model: [['¿Sabes cocinar?', 'Ти вмієш готувати?']], full: 'Mis hijos saben nadar.' }),
  frame('T23', 'independent', 'free-time', SABI, [SAB, SE], R.sabi, 'Yo no ___ (saber + bailar).', 'Я не вмію танцювати.', 'sé', '', 'bailar', { lemma: 'saber', seForm: 'se', badForm: ['sabo', 'Форма yo дієслова saber — sé.'], full: 'Yo no sé bailar.' }),
  frame('T24', 'independent', 'family-home', SABI, SAB, R.sabi, 'Mi madre ___ (saber + hablar) inglés y francés.', 'Моя мама вміє говорити англійською та французькою.', 'sabe', '', 'hablar', { lemma: 'saber', conj: 'habla', full: 'Mi madre sabe hablar inglés y francés.' }),
  frame('T25', 'independent', 'food-cafe', SABI, SAB, R.sabi, '¿___ (saber + cocinar, vosotros)?', 'Ви вмієте готувати?', 'sabéis', '', 'cocinar', { lemma: 'saber', badForm: ['sabeis', acc('sabéis')], full: '¿Sabéis cocinar?' }),
  frame('T26', 'independent', 'free-time', SABI, SAB, R.sabi, 'Nosotros no ___ (saber + jugar) al fútbol.', 'Ми не вміємо грати у футбол.', 'sabemos', '', 'jugar', { lemma: 'saber', full: 'Nosotros no sabemos jugar al fútbol.' }),
  frame('T27', 'delayed', 'transport', SABI, SAB, R.sabi, '¿Tu hermana ___ (saber + conducir)?', 'Твоя сестра вміє водити машину?', 'sabe', '', 'conducir', { lemma: 'saber', full: '¿Tu hermana sabe conducir?' }),
  frame('T28', 'delayed', 'food-cafe', SABI, [SAB, SE], R.sabi, 'Yo ___ (saber + cocinar) muy bien.', 'Я дуже добре вмію готувати.', 'sé', '', 'cocinar', { lemma: 'saber', seForm: 'se', full: 'Yo sé cocinar muy bien.' }),
  frame('T29', 'transfer', 'messages', SABI, SAB, R.sabi, '¡Hola, Ana! ¿tu hijo ___ (saber + nadar)? El domingo vamos a la playa.', 'Привіт, Ано! Твій син уміє плавати? У неділю ми їдемо на пляж.', 'sabe', '', 'nadar', { lemma: 'saber', ask: ASK_MSG, full: '¡Hola, Ana! ¿tu hijo sabe nadar? El domingo vamos a la playa.' }),
  frame('T30', 'transfer', 'school', SABI, SAB, R.sabi, 'En la escuela de mis hijos, todos los profesores ___ (saber + hablar) inglés.', 'У школі моїх дітей усі вчителі вміють говорити англійською.', 'saben', '', 'hablar', { lemma: 'saber', full: 'En la escuela de mis hijos, todos los profesores saben hablar inglés.' }),
  choice(L, { id: 'T31', role: 'independent', family: 'family-home', ts: [SABI_R], ask: 'Прочитайте речення. Що ми знаємо про тата?', es: 'Mi padre sabe cocinar, pero hoy no puede: está muy cansado.', opts: [['Він уміє готувати, але сьогодні не може, бо дуже втомлений.', 'c'], ['Він не вміє готувати.', 'x', 'Sabe cocinar — уміє.'], ['Він готує щодня.', 'x', 'Про звичку в реченні не йдеться.']], rule: R.sabi, ok: 'Правильно: sabe — уміє, no puede — сьогодні не може.', no: 'Тато вміє готувати (sabe), але сьогодні не може (no puede), бо втомлений.' }),
  choice(L, { id: 'T32', role: 'delayed', family: 'free-time', ts: [SABI_R], ask: 'Прочитайте питання. Про що питають?', es: '¿Sabes nadar?', opts: [['Чи вміє людина плавати.', 'c'], ['Чи може людина зараз піти плавати.', 'x', 'Про можливість спитали б ¿Puedes…?'], ['Чи любить людина плавати.', 'x', 'Про вподобання спитали б ¿Te gusta…?']], rule: R.sabi, ok: 'Правильно: saber + інфінітив — уміння.', no: '¿Sabes nadar? — «Ти вмієш плавати?»' }),

  // poder vs saber
  choice(L, { id: 'T33', role: 'supported', family: 'transport', ts: [PS], ask: 'Оберіть дієслово. Підказка: уміння — saber, можливість через обставини — poder.', es: 'No ___ conducir: no tengo coche.', opts: [['puedo', 'c'], ['sé', 'x', 'Причина — обставини (немає машини), а не вміння: poder.']], rule: R.ps, ref: 'No puedo conducir: no tengo coche.', ok: 'Правильно: обставини не дозволяють — poder.', no: 'Причина — обставини: No puedo conducir.' }),
  choice(L, { id: 'T34', role: 'independent', family: 'family-home', ts: [PS], ask: 'Оберіть дієслово.', es: 'Mi hija tiene tres años y no ___ leer.', opts: [['sabe', 'c'], ['puede', 'x', 'Читати вчаться: це вміння, тому saber.']], rule: R.ps, ref: 'Mi hija tiene tres años y no sabe leer.', ok: 'Правильно: уміння читати — saber.', no: 'Читання — уміння: no sabe leer.' }),
  choice(L, { id: 'T35', role: 'independent', family: 'routine', ts: [PS], ask: 'Оберіть дієслово.', es: 'Hoy no ___ salir: tengo mucho trabajo.', opts: [['puedo', 'c'], ['sé', 'x', 'Причина — багато роботи (обставини), тому poder.']], rule: R.ps, ref: 'Hoy no puedo salir: tengo mucho trabajo.', ok: 'Правильно: обставини — poder.', no: 'Причина — обставини: Hoy no puedo salir.' }),
  choice(L, { id: 'T36', role: 'delayed', family: 'transport', ts: [PS], ask: 'Оберіть дієслово.', es: 'Sé conducir, pero hoy no ___: no tengo coche.', opts: [['puedo', 'c'], ['sé', 'x', 'Людина вміє водити (sé), але сьогодні не дозволяють обставини: puedo.']], rule: R.ps, ref: 'Sé conducir, pero hoy no puedo: no tengo coche.', ok: 'Правильно: уміння — saber, обставини — poder.', no: 'Уміння є (sé), але обставини не дозволяють: no puedo.' }),
  choice(L, { id: 'T37', role: 'transfer', family: 'messages', ts: [PS], ask: 'Допишіть повідомлення: оберіть дієслово.', es: '¡Hola, Pablo! El sábado no ___ ir al cine, tengo que trabajar.', opts: [['puedo', 'c'], ['sé', 'x', 'Причина — робота, тобто обставини: poder.']], rule: R.ps, ref: '¡Hola, Pablo! El sábado no puedo ir al cine, tengo que trabajar.', ok: 'Правильно: обставини — poder.', no: 'Причина — робота (обставини): no puedo ir.' }),

  // tener que
  frame('T41', 'supported', 'routine', TQ, TEN, R.tq, 'Mañana ___ (tener que + estudiar, nosotros).', 'Завтра нам треба вчитися.', 'tenemos', 'que', 'estudiar', { ask: ASK_S, model: [['Tengo que trabajar.', 'Мені треба працювати.']], conj: 'estudiamos', full: 'Mañana tenemos que estudiar.' }),
  frame('T42', 'supported', 'work-study', TQ, TEN, R.tq, 'Mi hermano ___ (tener que + trabajar) el sábado.', 'Моєму братові треба працювати в суботу.', 'tiene', 'que', 'trabajar', { ask: ASK_S, model: [['¿Tienes que estudiar hoy?', 'Тобі сьогодні треба вчитися?']], badForm: ['tienes', 'Tienes — форма tú; для mi hermano потрібно tiene.'], full: 'Mi hermano tiene que trabajar el sábado.' }),
  frame('T43', 'independent', 'shop', TQ, TEN, R.tq, 'Hoy ___ (tener que + hacer, yo) la compra.', 'Сьогодні мені треба зробити покупки.', 'tengo', 'que', 'hacer', { conj: 'hago', full: 'Hoy tengo que hacer la compra.' }),
  frame('T44', 'independent', 'routine', TQ, TEN, R.tq, '¿A qué hora ___ (tener que + salir, tú) de casa?', 'О котрій тобі треба виходити з дому?', 'tienes', 'que', 'salir', { conj: 'sales', full: '¿A qué hora tienes que salir de casa?' }),
  frame('T45', 'independent', 'family-home', TQ, TEN, R.tq, 'Los niños ___ (tener que + ir) a la escuela a las ocho.', 'Дітям треба йти до школи о восьмій.', 'tienen', 'que', 'ir', { conj: 'van', full: 'Los niños tienen que ir a la escuela a las ocho.' }),
  frame('T46', 'independent', 'shop', TQ, TEN, R.tq, '___ (tener que + comprar, vosotros) pan.', 'Вам треба купити хліб.', 'tenéis', 'que', 'comprar', { badForm: ['teneis', acc('tenéis')], full: 'Tenéis que comprar pan.' }),
  frame('T47', 'delayed', 'routine', TQ, TEN, R.tq, 'Mañana ___ (tener que + ir, yo) al médico.', 'Завтра мені треба йти до лікаря.', 'tengo', 'que', 'ir', { full: 'Mañana tengo que ir al médico.' }),
  frame('T48', 'delayed', 'work-study', TQ, TEN, R.tq, 'Ana ___ (tener que + estudiar) mucho: el lunes tiene un examen.', 'Ані треба багато вчитися: у понеділок у неї іспит.', 'tiene', 'que', 'estudiar', { full: 'Ana tiene que estudiar mucho: el lunes tiene un examen.' }),
  frame('T49', 'transfer', 'messages', TQ, TEN, R.tq, '¡Hola, Pablo! Hoy no puedo, ___ (tener que + trabajar, yo) hasta las ocho.', 'Привіт, Пабло! Сьогодні не можу: мені треба працювати до восьмої.', 'tengo', 'que', 'trabajar', { ask: ASK_MSG, conj: 'trabajo', full: '¡Hola, Pablo! Hoy no puedo, tengo que trabajar hasta las ocho.' }),
  frame('T50', 'transfer', 'travel', TQ, TEN, R.tq, 'En el hotel ___ (tener que + salir, nosotros) de la habitación a las doce.', 'У готелі нам треба звільнити номер до дванадцятої.', 'tenemos', 'que', 'salir', { full: 'En el hotel tenemos que salir de la habitación a las doce.' }),
  choice(L, { id: 'T51', role: 'independent', family: 'free-time', ts: [TQ_R], ask: 'Прочитайте речення. Чому людина не піде в кіно?', es: 'Esta noche no puedo ir al cine: tengo que estudiar.', opts: [['Їй треба вчитися.', 'c'], ['Вона не хоче.', 'x', 'Про бажання не йдеться; tengo que — обов’язок.'], ['Кінотеатр сьогодні зачинений.', 'x', 'Про кінотеатр нічого не сказано.']], rule: R.tq, ok: 'Правильно: tengo que estudiar — треба вчитися.', no: 'Tengo que estudiar — їй треба вчитися.' }),
  choice(L, { id: 'T52', role: 'delayed', family: 'shop', ts: [TQ_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Tenemos que comprar leche.', opts: [['Нам треба купити молоко.', 'c'], ['Ми хочемо купити молоко.', 'x', 'Хотіти — querer; tener que — треба.'], ['Ми щойно купили молоко.', 'x', 'Щойно — acabar de.']], rule: R.tq, ok: 'Правильно: tener que — треба.', no: 'Tenemos que comprar leche — нам треба купити молоко.' }),

  // modal meanings
  choice(L, { id: 'T53', role: 'supported', family: 'work-study', ts: [MM_C], ask: 'Ви хочете сказати «мені ТРЕБА вчитися». Оберіть речення. Підказка: обов’язок — tener que.', opts: [['Tengo que estudiar.', 'c'], ['Puedo estudiar.', 'x', 'Puedo — можливість, а не обов’язок.'], ['Quiero estudiar.', 'x', 'Quiero — бажання.'], ['Voy a estudiar.', 'x', 'Voy a — план.']], rule: R.mm, ok: 'Правильно: обов’язок — tener que.', no: 'Обов’язок — tener que: Tengo que estudiar.' }),
  choice(L, { id: 'T54', role: 'independent', family: 'plans', ts: [MM_C], ask: 'Ви хочете сказати «я МОЖУ прийти о п’ятій». Оберіть речення.', opts: [['Puedo venir a las cinco.', 'c'], ['Tengo que venir a las cinco.', 'x', 'Tengo que — обов’язок.'], ['Voy a venir a las cinco.', 'x', 'Voy a — план.']], rule: R.mm, ok: 'Правильно: можливість — poder.', no: 'Можливість — poder: Puedo venir a las cinco.' }),
  choice(L, { id: 'T55', role: 'delayed', family: 'plans', ts: [MM_C], ask: 'Ви хочете сказати «сьогодні ввечері я ЗБИРАЮСЯ вчитися» (план). Оберіть речення.', opts: [['Esta noche voy a estudiar.', 'c'], ['Esta noche tengo que estudiar.', 'x', 'Tengo que — обов’язок, а не план.'], ['Esta noche puedo estudiar.', 'x', 'Puedo — можливість.']], rule: R.mm, ok: 'Правильно: план — ir a + інфінітив.', no: 'План — ir a: Esta noche voy a estudiar.' }),
  choice(L, { id: 'T56', role: 'transfer', family: 'messages', ts: [MM_C], ask: 'Допишіть повідомлення: оберіть, що підходить за змістом.', es: '¡Hola, Ana! El sábado no puedo ir a la playa: ___ trabajar.', opts: [['tengo que', 'c'], ['quiero', 'x', 'Людина відмовляється від пляжу через роботу — це обов’язок, а не бажання.'], ['sé', 'x', 'Saber — уміння; тут потрібен обов’язок.']], rule: R.mm, ref: '¡Hola, Ana! El sábado no puedo ir a la playa: tengo que trabajar.', ok: 'Правильно: причина відмови — обов’язок.', no: 'Причина відмови — обов’язок: tengo que trabajar.' }),
  choice(L, { id: 'T57', role: 'independent', family: 'free-time', ts: [MM_R], ask: 'Прочитайте речення. Що ми знаємо?', es: 'Quiero ir al concierto, pero no puedo: tengo que trabajar.', opts: [['Людина хоче піти на концерт, але мусить працювати.', 'c'], ['Людина не хоче йти на концерт.', 'x', 'Quiero ir — хоче.'], ['Людина піде на концерт після роботи.', 'x', 'No puedo — не може піти.']], rule: R.mm, ok: 'Правильно: quiero — бажання, no puedo — не може, tengo que — обов’язок.', no: 'Людина хоче (quiero), але не може (no puedo), бо мусить працювати (tengo que trabajar).' }),
  choice(L, { id: 'T58', role: 'delayed', family: 'family-home', ts: [MM_R], ask: 'Прочитайте речення. Що має зробити співрозмовник?', es: 'Mañana voy a cocinar y tú tienes que comprar el pan.', opts: [['Купити хліб.', 'c'], ['Приготувати їжу.', 'x', 'Готуватиме той, хто говорить: voy a cocinar.'], ['Нічого.', 'x', 'Tú tienes que comprar el pan — співрозмовнику треба купити хліб.']], rule: R.mm, ok: 'Правильно: tú tienes que comprar el pan.', no: 'Tú tienes que comprar el pan — співрозмовнику треба купити хліб.' }),

  // CV-05: acabar de
  frame('T61', 'supported', 'routine', AD, null, R.ad, 'Ana ___ (acabar de + salir).', 'Ана щойно вийшла.', 'acaba', 'de', 'salir', { ask: ASK_S, model: [['Acabo de llegar a casa.', 'Я щойно прийшов (прийшла) додому.']], conj: 'sale', full: 'Ana acaba de salir.' }),
  frame('T62', 'supported', 'work-study', AD, null, R.ad, '___ (acabar de + llegar, yo) a la oficina.', 'Я щойно прийшов (прийшла) в офіс.', 'acabo', 'de', 'llegar', { ask: ASK_S, model: [['Acabamos de comer.', 'Ми щойно пообідали.']], conj: 'llego', full: 'Acabo de llegar a la oficina.' }),
  frame('T63', 'independent', 'family-home', AD, null, R.ad, 'Mis padres ___ (acabar de + cenar).', 'Мої батьки щойно повечеряли.', 'acaban', 'de', 'cenar', { conj: 'cenan', full: 'Mis padres acaban de cenar.' }),
  frame('T64', 'independent', 'routine', AD, null, R.ad, '¿___ (acabar de + llegar, tú)?', 'Ти щойно прийшов (прийшла)?', 'acabas', 'de', 'llegar', { full: '¿Acabas de llegar?' }),
  frame('T65', 'independent', 'free-time', AD, null, R.ad, 'El concierto ___ (acabar de + empezar).', 'Концерт щойно почався.', 'acaba', 'de', 'empezar', { conj: 'empieza', full: 'El concierto acaba de empezar.' }),
  frame('T66', 'independent', 'food-cafe', AD, null, R.ad, 'No, gracias: ___ (acabar de + comer, nosotros).', 'Ні, дякуємо: ми щойно поїли.', 'acabamos', 'de', 'comer', { full: 'No, gracias: acabamos de comer.' }),
  frame('T67', 'delayed', 'shop', AD, null, R.ad, 'Lo siento, la farmacia ___ (acabar de + cerrar).', 'На жаль, аптека щойно зачинилася.', 'acaba', 'de', 'cerrar', { conj: 'cierra', full: 'Lo siento, la farmacia acaba de cerrar.' }),
  frame('T68', 'delayed', 'routine', AD, null, R.ad, '___ (acabar de + recibir, yo) tu mensaje.', 'Я щойно отримав (отримала) твоє повідомлення.', 'acabo', 'de', 'recibir', { full: 'Acabo de recibir tu mensaje.' }),
  frame('T69', 'transfer', 'messages', AD, null, R.ad, '¡Hola, mamá! ___ (acabar de + llegar, yo) al hotel. Estoy bien.', 'Привіт, мамо! Я щойно приїхав (приїхала) в готель. У мене все добре.', 'acabo', 'de', 'llegar', { ask: ASK_MSG, full: '¡Hola, mamá! Acabo de llegar al hotel. Estoy bien.' }),
  frame('T70', 'transfer', 'school', AD, null, R.ad, 'Los estudiantes ___ (acabar de + empezar) el examen.', 'Студенти щойно почали іспит.', 'acaban', 'de', 'empezar', { full: 'Los estudiantes acaban de empezar el examen.' }),
  choice(L, { id: 'T71', role: 'independent', family: 'routine', ts: [AD_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Pablo acaba de salir de casa.', opts: [['Пабло щойно вийшов з дому.', 'c'], ['Пабло зараз виходить з дому.', 'x', 'Acabar de — дія вже відбулася, щойно.'], ['Пабло скоро вийде з дому.', 'x', 'Acabar de — дія вже відбулася, а не відбудеться.']], rule: R.ad, ok: 'Правильно: acabar de + інфінітив — щойно.', no: 'Acaba de salir — Пабло щойно вийшов.' }),
  choice(L, { id: 'T72', role: 'delayed', family: 'food-cafe', ts: [AD_R], ask: 'Прочитайте діалог. Чому людина відмовляється?', es: '—¿Quieres comer algo? —No, gracias, acabo de comer.', opts: [['Вона щойно поїла.', 'c'], ['Вона не любить їсти вдень.', 'x', 'Про вподобання не йдеться.'], ['Вона поїсть пізніше.', 'x', 'Acabo de comer — уже поїла.']], rule: R.ad, ok: 'Правильно: acabo de comer — щойно поїла.', no: 'Acabo de comer — людина щойно поїла.' }),

  // CV-05: empezar a
  frame('T81', 'supported', 'work-study', EA, EIE, R.ea, '¿Cuándo ___ (empezar a + estudiar, tú) inglés?', 'Коли ти починаєш вивчати англійську?', 'empiezas', 'a', 'estudiar', { ask: ASK_S, model: [['Empiezo a trabajar a las nueve.', 'Я починаю працювати о дев’ятій.']], badForm: ['empezas', eie('empiezas')], full: '¿Cuándo empiezas a estudiar inglés?' }),
  frame('T82', 'supported', 'family-home', EA, EIE, R.ea, 'Mi hijo ___ (empezar a + leer) libros en inglés.', 'Мій син починає читати книжки англійською.', 'empieza', 'a', 'leer', { ask: ASK_S, model: [['Los niños empiezan a cenar.', 'Діти починають вечеряти.']], badForm: ['empeza', eie('empieza')], conj: 'lee', full: 'Mi hijo empieza a leer libros en inglés.' }),
  frame('T83', 'independent', 'work-study', EA, EIE, R.ea, 'A las diez ___ (empezar a + trabajar, yo).', 'О десятій я починаю працювати.', 'empiezo', 'a', 'trabajar', { badForm: ['empezo', eie('empiezo')], conj: 'trabajo', full: 'A las diez empiezo a trabajar.' }),
  frame('T84', 'independent', 'routine', EA, UNCH, R.ea, '___ (empezar a + cenar, nosotros) a las nueve.', 'Ми починаємо вечеряти о дев’ятій.', 'empezamos', 'a', 'cenar', { badForm: ['empiezamos', 'У формі nosotros основа не змінюється: empezamos.'], full: 'Empezamos a cenar a las nueve.' }),
  frame('T85', 'independent', 'family-home', EA, EIE, R.ea, 'Mis padres ___ (empezar a + aprender) español.', 'Мої батьки починають вивчати іспанську.', 'empiezan', 'a', 'aprender', { badForm: ['empezan', eie('empiezan')], conj: 'aprenden', full: 'Mis padres empiezan a aprender español.' }),
  frame('T86', 'independent', 'work-study', EA, UNCH, R.ea, '¿Cuándo ___ (empezar a + trabajar, vosotros)?', 'Коли ви починаєте працювати?', 'empezáis', 'a', 'trabajar', { badForm: ['empezais', acc('empezáis')], full: '¿Cuándo empezáis a trabajar?' }),
  frame('T87', 'delayed', 'work-study', EA, EIE, R.ea, 'Ana ___ (empezar a + estudiar) a las siete de la mañana.', 'Ана починає вчитися о сьомій ранку.', 'empieza', 'a', 'estudiar', { badForm: ['empeza', eie('empieza')], full: 'Ana empieza a estudiar a las siete de la mañana.' }),
  frame('T88', 'delayed', 'routine', EA, EIE, R.ea, 'Hoy ___ (empezar a + cocinar, yo) a las ocho.', 'Сьогодні я починаю готувати о восьмій.', 'empiezo', 'a', 'cocinar', { badForm: ['empezo', eie('empiezo')], full: 'Hoy empiezo a cocinar a las ocho.' }),
  frame('T89', 'transfer', 'messages', EA, EIE, R.ea, '¡Hola, Marta! Mañana ___ (empezar a + trabajar, yo) en una tienda nueva.', 'Привіт, Марто! Завтра я починаю працювати в новій крамниці.', 'empiezo', 'a', 'trabajar', { ask: ASK_MSG, badForm: ['empezo', eie('empiezo')], full: '¡Hola, Marta! Mañana empiezo a trabajar en una tienda nueva.' }),
  frame('T90', 'transfer', 'travel', EA, EIE, R.ea, 'En vacaciones, mis hijos ___ (empezar a + hablar) un poco de español.', 'У відпустці мої діти починають трохи говорити іспанською.', 'empiezan', 'a', 'hablar', { badForm: ['empezan', eie('empiezan')], full: 'En vacaciones, mis hijos empiezan a hablar un poco de español.' }),
  choice(L, { id: 'T91', role: 'independent', family: 'work-study', ts: [EA_R], ask: 'Прочитайте речення. Коли Пабло починає працювати?', es: 'Pablo empieza a trabajar a las ocho y vuelve a casa a las tres.', opts: [['О восьмій.', 'c'], ['О третій.', 'x', 'О третій він повертається додому.'], ['Об одинадцятій.', 'x', 'Такого часу в реченні немає.']], rule: R.ea, ok: 'Правильно: empieza a trabajar a las ocho.', no: 'Empieza a trabajar a las ocho — о восьмій.' }),
  choice(L, { id: 'T92', role: 'delayed', family: 'family-home', ts: [EA_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Mi hermana empieza a estudiar alemán.', opts: [['Моя сестра починає вивчати німецьку.', 'c'], ['Моя сестра добре знає німецьку.', 'x', 'Empieza a estudiar — тільки починає.'], ['Моя сестра вже закінчила вивчати німецьку.', 'x', 'Empezar — починати, а не закінчувати.']], rule: R.ea, ok: 'Правильно: empezar a + інфінітив — починати щось робити.', no: 'Empieza a estudiar alemán — сестра починає вивчати німецьку.' }),

  // CV-05: volver a
  frame('T101', 'supported', 'messages-chat', VA, OUE, R.va, 'Ana ___ (volver a + escribir) el mensaje.', 'Ана знову пише повідомлення (ще раз).', 'vuelve', 'a', 'escribir', { ask: ASK_S, model: [['Vuelvo a leer el mensaje.', 'Я ще раз читаю повідомлення.']], badForm: ['volve', oue('vuelve')], conj: 'escribe', full: 'Ana vuelve a escribir el mensaje.' }),
  frame('T102', 'supported', 'family-home', VA, OUE, R.va, 'Los niños ___ (volver a + jugar) en el parque.', 'Діти знову граються в парку.', 'vuelven', 'a', 'jugar', { ask: ASK_S, model: [['No volvemos a comer allí.', 'Ми більше там не обідаємо.']], badForm: ['volven', oue('vuelven')], full: 'Los niños vuelven a jugar en el parque.' }),
  frame('T103', 'independent', 'routine', VA, OUE, R.va, 'Hoy ___ (volver a + leer, yo) el libro.', 'Сьогодні я ще раз читаю книжку.', 'vuelvo', 'a', 'leer', { badForm: ['volvo', oue('vuelvo')], conj: 'leo', full: 'Hoy vuelvo a leer el libro.' }),
  frame('T104', 'independent', 'free-time', VA, OUE, R.va, '¿___ (volver a + ver, tú) la película?', 'Ти ще раз дивишся фільм?', 'vuelves', 'a', 'ver', { badForm: ['volves', oue('vuelves')], full: '¿Vuelves a ver la película?' }),
  frame('T105', 'independent', 'shop', VA, UNCH, R.va, 'No ___ (volver a + comprar, nosotros) pan en el supermercado: es muy caro.', 'Ми більше не купуємо хліб у супермаркеті: він дуже дорогий.', 'volvemos', 'a', 'comprar', { badForm: ['vuelvemos', 'У формі nosotros основа не змінюється: volvemos.'], full: 'No volvemos a comprar pan en el supermercado: es muy caro.' }),
  frame('T106', 'independent', 'food-cafe', VA, UNCH, R.va, '¿___ (volver a + cenar, vosotros) en el restaurante de Pablo?', 'Ви знову вечеряєте в ресторані Пабло?', 'volvéis', 'a', 'cenar', { badForm: ['volveis', acc('volvéis')], full: '¿Volvéis a cenar en el restaurante de Pablo?' }),
  frame('T107', 'delayed', 'work-study', VA, OUE, R.va, 'Mi padre ___ (volver a + trabajar) el lunes.', 'Мій тато знову виходить на роботу в понеділок.', 'vuelve', 'a', 'trabajar', { badForm: ['volve', oue('vuelve')], full: 'Mi padre vuelve a trabajar el lunes.' }),
  frame('T108', 'delayed', 'routine', VA, OUE, R.va, 'Esta noche ___ (volver a + cocinar, yo) pescado.', 'Сьогодні ввечері я знову готую рибу.', 'vuelvo', 'a', 'cocinar', { badForm: ['volvo', oue('vuelvo')], full: 'Esta noche vuelvo a cocinar pescado.' }),
  frame('T109', 'transfer', 'messages', VA, OUE, R.va, '¡Hola, Ana! Mañana ___ (volver a + ir, yo) a la tienda de la plaza.', 'Привіт, Ано! Завтра я знову піду до крамниці на площі.', 'vuelvo', 'a', 'ir', { ask: ASK_MSG, badForm: ['volvo', oue('vuelvo')], full: '¡Hola, Ana! Mañana vuelvo a ir a la tienda de la plaza.' }),
  frame('T110', 'transfer', 'school', VA, OUE, R.va, 'Los estudiantes ___ (volver a + hacer) el examen en septiembre.', 'Студенти перескладають іспит у вересні.', 'vuelven', 'a', 'hacer', { badForm: ['volven', oue('vuelven')], full: 'Los estudiantes vuelven a hacer el examen en septiembre.' }),
  choice(L, { id: 'T111', role: 'independent', family: 'routine', ts: [VA_R], ask: 'Прочитайте речення. Що людина робить о восьмій?', es: 'Vuelvo a casa a las seis y vuelvo a salir a las ocho.', opts: [['Знову виходить з дому.', 'c'], ['Повертається додому.', 'x', 'Додому вона повертається о шостій; vuelvo a salir — знову виходжу.'], ['Лягає спати.', 'x', 'Про сон у реченні не йдеться.']], rule: R.va, ok: 'Правильно: volver a + інфінітив — знову щось робити.', no: 'Vuelvo a salir a las ocho — о восьмій знову виходжу.' }),
  choice(L, { id: 'T112', role: 'delayed', family: 'messages-chat', ts: [VA_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Pablo vuelve a leer el mensaje de Ana.', opts: [['Пабло ще раз читає повідомлення Ани.', 'c'], ['Пабло відповідає на повідомлення Ани.', 'x', 'Leer — читати, а не відповідати.'], ['Пабло повертає Ані повідомлення.', 'x', 'Volver a + інфінітив — робити знову, а не повертати.']], rule: R.va, ok: 'Правильно: vuelve a leer — ще раз читає.', no: 'Vuelve a leer — Пабло ще раз читає повідомлення.' }),
];

const T_MM = TABLE_UK(['значення', 'конструкція', 'приклад'], [
  ['обов’язок: «треба, мушу»', 'tener que + інфінітив', 'Tengo que estudiar.'],
  ['можливість: «можу»', 'poder + інфінітив', 'Puedo estudiar.'],
  ['уміння: «вмію»', 'saber + інфінітив', 'Sé nadar.'],
  ['бажання: «хочу»', 'querer + інфінітив', 'Quiero estudiar.'],
  ['план: «збираюся»', 'ir a + інфінітив', 'Voy a estudiar.'],
  ['щойно зробив', 'acabar de + інфінітив', 'Acabo de llegar.'],
  ['починаю робити', 'empezar a + інфінітив', 'Empiezo a trabajar.'],
  ['роблю знову', 'volver a + інфінітив', 'Vuelvo a leer el mensaje.'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Можу, вмію, мушу; щойно, починаю, знову',
  termEs: 'poder, saber, tener que, acabar de, empezar a, volver a + infinitivo',
  summaryUk:
    'Кажемо про можливість (poder + інфінітив), уміння (saber + інфінітив) і обов’язок (tener que + інфінітив), а потім додаємо три корисні конструкції: acabar de (щойно), empezar a (починати), volver a (знову).',
  objectives: ['A2-01-O7', 'A2-01-O8'],
  cv: ['CV-05'],
  situations: ['routine-study-leisure', 'time-appointments-transport', 'personal-messages'],
  estimatedMinutes: 20,
  introduces: ['ability.poder-inf', 'ability.saber-inf', 'contrast.poder-saber', 'obligation.tener-que', 'contrast.modal-meaning', 'perifrasis.acabar-de', 'perifrasis.empezar-a', 'perifrasis.volver-a'],
  revisits: ['present.stem-o-ue', 'present.stem-e-ie', 'present.stem-unchanged-1p-2p', 'present.saber', 'ortho.accent-pair.se', 'present.tener', 'querer.infinitive', 'future-ir.ir-a-inf', 'contrast.plan-vs-wish', 'present.regular-ar'],
  steps: [
    s('s1', 'explanation', 'poder і saber + інфінітив', true, {
      blocks: [
        UK('Poder + інфінітив означає, що є змога щось зробити, що дозволяють обставини: Hoy no puedo salir. Saber + інфінітив означає вміння, якого навчилися: Sé nadar. Після обох дієслів інфінітив іде без прийменника.'),
        UK('Порівняйте з українськими «могти» і «вміти»: Sé conducir, pero hoy no puedo: no tengo coche.'),
        EX('¿Puedes venir el sábado?', 'Ти можеш прийти в суботу?'),
        EX('Mi hermano no sabe nadar.', 'Мій брат не вміє плавати.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Можу чи вмію', true, { tasks: ['T01', 'T21', 'T33'] }),
    s('s3', 'explanation', 'tener que + інфінітив і огляд значень', true, {
      blocks: [
        UK('Tener que + інфінітив — особистий обов’язок: Tengo que trabajar — «мені треба працювати». Que обов’язкове, змінюється лише tener: tengo, tienes, tiene, tenemos, tenéis, tienen.'),
        T_MM,
        EX('Quiero ir al concierto, pero no puedo: tengo que trabajar.', 'Я хочу піти на концерт, але не можу: мені треба працювати.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Обов’язок і значення', true, { tasks: ['T41', 'T53'] }),
    s('s5', 'explanation', 'Конструкції acabar de, empezar a, volver a', true, {
      blocks: [
        UK('Acabar de + інфінітив — дія щойно завершилася: Acabo de llegar («я щойно прийшов»). Форма теперішня, а значення — щойно в минулому.'),
        UK('Empezar a + інфінітив — почати щось робити: Empiezo a trabajar a las nueve. Volver a + інфінітив — зробити знову: Vuelvo a leer el mensaje.'),
        UK('Не плутайте: volver a + місце — «повертатися»: Vuelvo a casa. Прийменники de і a тут обов’язкові.'),
        EX('Acabamos de comer.', 'Ми щойно пообідали.'),
        EX('Los niños vuelven a jugar en el parque.', 'Діти знову граються в парку.'),
      ],
    }),
    s('s6', 'supported-practice', 'Крок 3. Щойно, починаю, знову', true, { tasks: ['T61', 'T81', 'T101'] }),
    s('s7', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T23', 'T43', 'T63', 'T83', 'T103', 'T34', 'T54'] }),
    s('s8', 'supported-practice', 'Ще приклади за зразком', false, { tasks: ['T02', 'T22', 'T42', 'T62', 'T82', 'T102'] }),
    s('s9', 'independent-practice', 'Додаткова практика', false, {
      tasks: ['T04', 'T05', 'T06', 'T11', 'T24', 'T25', 'T26', 'T31', 'T35', 'T44', 'T45', 'T46', 'T51', 'T57', 'T64', 'T65', 'T66', 'T71', 'T84', 'T85', 'T86', 'T91', 'T104', 'T105', 'T106', 'T111'],
    }),
    s('s10', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'poder + інфінітив — можу (обставини); saber + інфінітив — вмію (навичка); без прийменника.',
          'tener que + інфінітив — треба, мушу; que обов’язкове.',
          'acabar de + інфінітив — щойно; empezar a — починати; volver a — знову (volver a casa — повертатися).',
          'Змінюється лише перше дієслово: puedo, sabes, tenemos, acaba, empiezo, vuelven.',
        ]),
        LINK('Потренувати можу / вмію / мушу', [POD, SABI, PS, TQ, MM_C, MM_R], 'written', 10),
        LINK('Потренувати acabar de, empezar a, volver a', [AD, EA, VA, AD_R, EA_R, VA_R], 'written', 8),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-01.infinitive-frames',
    topicId: L,
    titleUk: 'Дієслово + інфінітив: значення',
    blocks: [T_MM, UK('Змінюється лише перше дієслово; прийменник (que, de, a) — частина конструкції, після poder і saber його немає.'), LINK('Практика: конструкції з інфінітивом', [POD, SABI, TQ, AD, EA, VA], 'written', 10)],
    linkedTargets: [POD, SABI, PS, TQ, MM_C, AD, EA, VA],
  }),
];
