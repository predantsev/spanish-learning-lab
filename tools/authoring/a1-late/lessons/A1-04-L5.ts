// A1-04-L5 — how often: parts of the day (CV-03), frequency adverbs, nunca, frequency expressions (O6).
import { Kit, S, ex, hTranscript, plink, ul, uk } from '../lib.ts';
import type { SlotSpec } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-04-L5', RULES);

const PD = 'time.parts-of-day/written-form';
const PDC = 'time.parts-of-day/context-choice';
const FAU = 'time.frequency.adverbs/construction-use';
const FAR = 'time.frequency.adverbs/reading-meaning';
const FAC = 'time.frequency.adverbs/context-choice';
const NUW = 'neg.nunca/written-form';
const NUU = 'neg.nunca/construction-use';
const NUC = 'neg.nunca/context-choice';
const FEU = 'time.frequency.expressions/construction-use';
const FER = 'time.frequency.expressions/reading-meaning';
const LM = 'listening.daily-actions/listening-meaning';

// ======================= parts of the day
const pdErr = (part: 'mañana' | 'tarde' | 'noche'): Array<[string, string, Record<string, 'incorrect' | 'unresolved'>?]> => [
  [`en la ${part}`, `В Іспанії без точного часу кажуть por la ${part}. Варіант en la ${part} поширений у Латинській Америці, тож тут він не рахується помилкою, але очікувана відповідь — por la ${part}.`, { [PD]: 'unresolved' }],
  [`la ${part}`, `Бракує прийменника: por la ${part}.`],
  [`por ${part}`, `Бракує артикля: por la ${part}.`],
  ...(part === 'mañana' ? ([['mañana', 'Mañana без por la означає «завтра». «Зранку» — por la mañana.']] as Array<[string, string]>) : []),
];
const pdSlot = (id: string, part: 'mañana' | 'tarde' | 'noche'): SlotSpec => ({
  id,
  t: PD,
  acc: [`por la ${part}`],
  err: [
    [`la ${part}`, `Бракує прийменника: por la ${part}.`],
    [`por ${part}`, `Бракує артикля: por la ${part}.`],
  ],
});
const pdIns = 'Впиши іспанською, у яку частину доби це відбувається.';
k.exact({ n: 1, role: 'supported', fam: 'a104.study', t: [PD], ins: `${pdIns} Зразок: por la tarde — «удень, після обіду». Коли: зранку.`, p: ['Estudio español ___.'], acc: ['por la mañana'], err: pdErr('mañana'), tr: 'Я вивчаю іспанську зранку.' });
k.exact({ n: 2, role: 'supported', fam: 'a104.home', t: [PD], ins: `${pdIns} Зразок: por la mañana — «зранку». Коли: пізно ввечері.`, p: ['Ceno con mi familia ___.'], acc: ['por la noche'], err: pdErr('noche'), tr: 'Я вечеряю з сім’єю пізно ввечері.' });
k.exact({ n: 3, role: 'independent', fam: 'a104.work', t: [PD], ins: `${pdIns} Коли: після обіду.`, p: ['¿Trabajas ___?'], acc: ['por la tarde'], err: pdErr('tarde'), tr: 'Ти працюєш після обіду?' });
k.exact({ n: 4, role: 'independent', fam: 'a104.leisure', t: [PD], ins: `${pdIns} Коли: вночі, після вечері.`, p: ['Mis padres pasean ___.'], acc: ['por la noche'], err: pdErr('noche'), tr: 'Мої батьки гуляють увечері після вечері.' });
k.exact({
  n: 5,
  role: 'independent',
  fam: 'a104.home',
  t: [PD],
  ins: 'Переклади іспанською: «Я снідаю зранку».',
  acc: ['Desayuno por la mañana.', 'Yo desayuno por la mañana.', 'Por la mañana desayuno.'],
  err: [['Desayuno la mañana.', 'Бракує прийменника: por la mañana.']],
});
k.slots({
  n: 6,
  role: 'independent',
  fam: 'a104.work',
  t: [PD],
  ins: 'Перепиши речення повністю: зранку я працюю, а після обіду вчуся.',
  p: ['Trabajo ___ y estudio ___.'],
  tpl: ['Trabajo ', S('s1'), ' y estudio ', S('s2'), '.'],
  slots: [pdSlot('s1', 'mañana'), pdSlot('s2', 'tarde')],
  tr: 'Я працюю зранку, а вчуся після обіду.',
});
k.exact({ n: 7, role: 'delayed', fam: 'a104.home', t: [PD], ins: `${pdIns} Коли: зранку.`, p: ['Leo el periódico ___.'], acc: ['por la mañana'], err: pdErr('mañana'), tr: 'Я читаю газету зранку.' });
k.exact({
  n: 8,
  role: 'delayed',
  fam: 'a104.leisure',
  t: [PD],
  ins: 'Переклади іспанською: «Ми гуляємо після обіду».',
  acc: ['Paseamos por la tarde.', 'Nosotros paseamos por la tarde.', 'Nosotras paseamos por la tarde.', 'Por la tarde paseamos.'],
  err: [['Paseamos la tarde.', 'Бракує прийменника: por la tarde.']],
});
k.exact({
  n: 9,
  role: 'transfer',
  fam: 'a104.nightshift',
  t: [PD],
  ins: 'Переклади іспанською: «Мій брат працює вночі в готелі».',
  acc: ['Mi hermano trabaja por la noche en un hotel.', 'Mi hermano trabaja en un hotel por la noche.', 'Por la noche mi hermano trabaja en un hotel.'],
  err: [['Mi hermano trabaja la noche en un hotel.', 'Бракує прийменника: por la noche.']],
});
k.slots({
  n: 10,
  role: 'transfer',
  fam: 'a104.weekend',
  t: [PD],
  ins: 'Перепиши речення повністю: у неділю зранку — спорт, а після обіду — відпочинок.',
  p: ['Los domingos ___ hago deporte y ___ descanso.'],
  tpl: ['Los domingos ', S('s1'), ' hago deporte y ', S('s2'), ' descanso.'],
  slots: [pdSlot('s1', 'mañana'), pdSlot('s2', 'tarde')],
  tr: 'Щонеділі зранку я займаюся спортом, а після обіду відпочиваю.',
});
k.choice({
  n: 11,
  role: 'independent',
  fam: 'a104.home',
  t: [PDC],
  ins: 'Ти снідаєш зранку. Обери, як сказати «зранку».',
  p: ['Desayuno ___.'],
  o: [
    ['por la noche', PDC, 'Por la noche — «увечері, вночі». «Зранку» — por la mañana.'],
    ['por la mañana', true],
    ['por la tarde', PDC, 'Por la tarde — «удень, після обіду». «Зранку» — por la mañana.'],
  ],
  tr: 'Я снідаю …',
});
k.choice({
  n: 12,
  role: 'delayed',
  fam: 'a104.work',
  t: [PDC],
  ins: 'Ти встаєш рано і йдеш на роботу зранку. Обери, як сказати «зранку».',
  p: ['Me levanto temprano y voy al trabajo ___.'],
  o: [
    ['por la mañana', true],
    ['por la noche', PDC, 'Por la noche — «увечері, вночі». «Зранку» — por la mañana.'],
  ],
  tr: 'Я встаю рано й іду на роботу …',
});

// ======================= frequency adverbs
k.exact({
  n: 13,
  role: 'supported',
  fam: 'a104.home',
  t: [FAU],
  ins: 'Переклади іспанською: «Я завжди снідаю вдома». Зразок: A veces como con mis amigos. — «Іноді я обідаю з друзями».',
  acc: ['Siempre desayuno en casa.', 'Yo siempre desayuno en casa.', 'Desayuno siempre en casa.'],
});
k.exact({
  n: 14,
  role: 'supported',
  fam: 'a104.leisure',
  t: [FAU],
  ins: 'Переклади іспанською: «Я іноді ходжу в кіно». Зразок: Siempre desayuno en casa. — «Я завжди снідаю вдома».',
  acc: ['A veces voy al cine.', 'Yo a veces voy al cine.', 'Voy al cine a veces.'],
});
k.exact({
  n: 15,
  role: 'independent',
  fam: 'a104.home',
  t: [FAU],
  ins: 'Переклади іспанською: «Ана часто читає газету».',
  acc: ['Ana lee el periódico a menudo.', 'A menudo Ana lee el periódico.', 'Ana a menudo lee el periódico.'],
});
k.exact({
  n: 16,
  role: 'independent',
  fam: 'a104.home',
  t: [FAU],
  ins: 'Переклади іспанською: «Зазвичай я вечеряю вдома».',
  acc: ['Normalmente ceno en casa.', 'Yo normalmente ceno en casa.', 'Normalmente yo ceno en casa.', 'Ceno normalmente en casa.'],
});
k.slots({
  n: 17,
  role: 'independent',
  fam: 'a104.sport',
  t: [FAU],
  ins: 'Перепиши речення повністю: брат часто займається спортом і іноді ходить у кіно.',
  p: ['Mi hermano ___ hace deporte y ___ va al cine.'],
  tpl: ['Mi hermano ', S('s1'), ' hace deporte y ', S('s2'), ' va al cine.'],
  slots: [
    { id: 's1', t: FAU, acc: ['a menudo'], err: [['a veces', '«A veces» — «іноді». «Часто» — a menudo.'], ['siempre', '«Siempre» — «завжди». «Часто» — a menudo.']] },
    { id: 's2', t: FAU, acc: ['a veces'], err: [['a menudo', '«A menudo» — «часто». «Іноді» — a veces.'], ['siempre', '«Siempre» — «завжди». «Іноді» — a veces.']] },
  ],
  tr: 'Мій брат часто займається спортом і іноді ходить у кіно.',
});
k.exact({
  n: 18,
  role: 'independent',
  fam: 'a104.food',
  t: [FAU],
  ins: 'Переклади іспанською: «Ми іноді обідаємо в ресторані».',
  acc: ['A veces comemos en un restaurante.', 'Nosotros a veces comemos en un restaurante.', 'Nosotras a veces comemos en un restaurante.', 'Comemos en un restaurante a veces.'],
});
k.exact({
  n: 19,
  role: 'delayed',
  fam: 'a104.food',
  t: [FAU],
  ins: 'Переклади іспанською: «Ти завжди п’єш каву?»',
  acc: ['¿Siempre bebes café?', '¿Tú siempre bebes café?', '¿Bebes siempre café?', '¿Siempre tomas café?', '¿Tú siempre tomas café?', '¿Tomas siempre café?'],
});
k.exact({
  n: 20,
  role: 'delayed',
  fam: 'a104.leisure',
  t: [FAU],
  ins: 'Переклади іспанською: «Зазвичай мої батьки ходять у парк».',
  acc: ['Normalmente mis padres van al parque.', 'Mis padres normalmente van al parque.', 'Mis padres van normalmente al parque.'],
});
k.exact({
  n: 21,
  role: 'transfer',
  fam: 'a104.homeoffice',
  t: [FAU],
  ins: 'Переклади іспанською: «Я часто працюю вдома».',
  acc: ['A menudo trabajo en casa.', 'Yo a menudo trabajo en casa.', 'Trabajo en casa a menudo.'],
});
k.exact({
  n: 22,
  role: 'transfer',
  fam: 'a104.social',
  t: [FAU],
  ins: 'Переклади іспанською: «Ми іноді вечеряємо з нашими друзями».',
  acc: ['A veces cenamos con nuestros amigos.', 'Nosotros a veces cenamos con nuestros amigos.', 'Nosotras a veces cenamos con nuestros amigos.', 'Cenamos con nuestros amigos a veces.'],
});
k.choice({
  n: 23,
  role: 'independent',
  fam: 'a104.sport',
  t: [FAR],
  ins: 'Прочитай речення. Як часто Пабло ходить у спортзал?',
  p: ['Pablo va al gimnasio a veces.'],
  o: [
    ['Завжди.', false],
    ['Іноді.', true],
    ['Часто.', false],
  ],
});
k.choice({
  n: 24,
  role: 'independent',
  fam: 'a104.food',
  t: [FAC],
  ins: 'Ана п’є каву кожного ранку, без винятків. Обери слово, яке підходить за змістом.',
  p: ['Ana ___ bebe café por la mañana.'],
  o: [
    ['a veces', FAC, '«A veces» — «іноді», а Ана п’є каву кожного ранку.'],
    ['siempre', true],
    ['a menudo', FAC, '«A menudo» — «часто», а тут — кожного ранку, без винятків: siempre.'],
  ],
});
k.choice({
  n: 25,
  role: 'delayed',
  fam: 'a104.home',
  t: [FAR],
  ins: 'Прочитай речення. Як часто батьки вечеряють удома?',
  p: ['Mis padres normalmente cenan en casa.'],
  o: [
    ['Ніколи.', false],
    ['Іноді.', false],
    ['Зазвичай.', true],
  ],
});

// ======================= nunca
const nuncaNo = 'Якщо nunca стоїть перед дієсловом, no не потрібне.';
const noMissing = 'Якщо nunca стоїть після дієслова, перед дієсловом потрібне no.';
k.exact({
  n: 26,
  role: 'supported',
  fam: 'a104.food',
  t: [NUU],
  ins: 'Переклади іспанською: «Я ніколи не їм м’ясо». Зразок: Nunca bebo café. = No bebo café nunca.',
  acc: ['Nunca como carne.', 'Yo nunca como carne.', 'No como carne nunca.', 'Yo no como carne nunca.'],
  err: [
    ['Nunca no como carne.', nuncaNo],
    ['Como carne nunca.', noMissing],
  ],
});
k.exact({
  n: 27,
  role: 'supported',
  fam: 'a104.food',
  t: [NUW],
  ins: 'Перепиши речення, поставивши nunca на початок. Зразок: No bebo café nunca. → Nunca bebo café.',
  p: ['No como pescado nunca.'],
  acc: ['Nunca como pescado.'],
  err: [['Nunca no como pescado.', nuncaNo]],
  tr: 'Я ніколи не їм рибу.',
});
k.exact({
  n: 28,
  role: 'independent',
  fam: 'a104.morning',
  t: [NUU],
  ins: 'Переклади іспанською: «Ти ніколи не встаєш рано?»',
  acc: ['¿Nunca te levantas temprano?', '¿Tú nunca te levantas temprano?', '¿No te levantas nunca temprano?', '¿No te levantas temprano nunca?'],
  err: [['¿Nunca no te levantas temprano?', nuncaNo]],
});
k.exact({
  n: 29,
  role: 'independent',
  fam: 'a104.home',
  t: [NUW],
  ins: 'Перепиши речення так, щоб nunca стояло після дієслова.',
  p: ['Nunca ceno tarde.'],
  acc: ['No ceno nunca tarde.', 'No ceno tarde nunca.'],
  err: [
    ['Ceno nunca tarde.', noMissing],
    ['Ceno tarde nunca.', noMissing],
  ],
  tr: 'Я ніколи не вечеряю пізно.',
});
k.exact({
  n: 30,
  role: 'independent',
  fam: 'a104.leisure',
  t: [NUU],
  ins: 'Переклади іспанською: «Мої батьки ніколи не ходять у кіно».',
  acc: ['Mis padres nunca van al cine.', 'Mis padres no van nunca al cine.', 'Mis padres no van al cine nunca.'],
  err: [
    ['Mis padres nunca no van al cine.', nuncaNo],
    ['Mis padres van nunca al cine.', noMissing],
  ],
});
k.slots({
  n: 31,
  role: 'independent',
  fam: 'a104.work',
  t: [NUW],
  ins: 'Перепиши речення повністю, вставивши слово «ніколи».',
  p: ['Ana ___ trabaja los domingos.'],
  tpl: ['Ana ', S('s1'), ' trabaja los domingos.'],
  slots: [{ id: 's1', t: NUW, acc: ['nunca'], err: [['nunca no', nuncaNo], ['no', '«No» означає «не». «Ніколи» — nunca.']] }],
  tr: 'Ана ніколи не працює в неділю.',
});
k.exact({
  n: 32,
  role: 'delayed',
  fam: 'a104.food',
  t: [NUU],
  ins: 'Переклади іспанською: «Я ніколи не п’ю каву ввечері».',
  acc: [
    'Nunca bebo café por la noche.',
    'Yo nunca bebo café por la noche.',
    'Nunca tomo café por la noche.',
    'Yo nunca tomo café por la noche.',
    'No bebo nunca café por la noche.',
    'No tomo nunca café por la noche.',
    'Nunca bebo café por la tarde.',
    'Yo nunca bebo café por la tarde.',
    'Nunca tomo café por la tarde.',
    'Yo nunca tomo café por la tarde.',
    'No bebo nunca café por la tarde.',
    'No tomo nunca café por la tarde.',
  ],
  err: [
    ['Nunca no bebo café por la noche.', nuncaNo],
    ['Nunca no tomo café por la noche.', nuncaNo],
  ],
});
k.exact({
  n: 33,
  role: 'delayed',
  fam: 'a104.sport',
  t: [NUW],
  ins: 'Перепиши речення, поставивши nunca на початок.',
  p: ['No hago deporte nunca.'],
  acc: ['Nunca hago deporte.'],
  err: [['Nunca no hago deporte.', nuncaNo]],
  tr: 'Я ніколи не займаюся спортом.',
});
k.exact({
  n: 34,
  role: 'transfer',
  fam: 'a104.weekend',
  t: [NUU],
  ins: 'Переклади іспанською: «Ми ніколи не працюємо в суботу».',
  acc: ['Nunca trabajamos los sábados.', 'Nosotros nunca trabajamos los sábados.', 'Nosotras nunca trabajamos los sábados.', 'No trabajamos nunca los sábados.', 'No trabajamos los sábados nunca.'],
  err: [['Nunca no trabajamos los sábados.', nuncaNo]],
});
k.exact({
  n: 35,
  role: 'transfer',
  fam: 'a104.family-food',
  t: [NUU],
  ins: 'Переклади іспанською: «Мій брат ніколи не їсть рибу».',
  acc: ['Mi hermano nunca come pescado.', 'Mi hermano no come pescado nunca.', 'Mi hermano no come nunca pescado.'],
  err: [
    ['Mi hermano nunca no come pescado.', nuncaNo],
    ['Mi hermano come pescado nunca.', noMissing],
  ],
});
k.choice({
  n: 36,
  role: 'independent',
  fam: 'a104.food',
  t: [NUC],
  ins: 'Обери правильне речення зі значенням «Я ніколи не їм м’ясо».',
  o: [
    ['Nunca no como carne.', NUC, nuncaNo],
    ['Nunca como carne.', true],
    ['Como carne nunca.', NUC, noMissing],
  ],
});
k.choice({
  n: 37,
  role: 'delayed',
  fam: 'a104.food',
  t: [NUC],
  ins: 'Обери правильне речення зі значенням «Я ніколи не п’ю каву».',
  o: [
    ['Bebo café nunca.', NUC, noMissing],
    ['No bebo café nunca.', true],
    ['Nunca no bebo café.', NUC, nuncaNo],
  ],
});

// ======================= frequency expressions
k.exact({
  n: 38,
  role: 'supported',
  fam: 'a104.home',
  t: [FEU],
  ins: 'Переклади іспанською: «Я щодня читаю газету». Зразок: todos los días = cada día — «щодня».',
  acc: ['Leo el periódico todos los días.', 'Todos los días leo el periódico.', 'Leo el periódico cada día.', 'Cada día leo el periódico.', 'Yo leo el periódico todos los días.', 'Yo leo el periódico cada día.'],
});
k.exact({
  n: 39,
  role: 'supported',
  fam: 'a104.home',
  t: [FEU],
  ins: 'Переклади іспанською: «На вихідних ми відпочиваємо вдома». Зразок: los fines de semana — «на вихідних».',
  acc: ['Los fines de semana descansamos en casa.', 'Descansamos en casa los fines de semana.', 'Los fines de semana nosotros descansamos en casa.', 'Nosotros descansamos en casa los fines de semana.'],
});
k.exact({
  n: 40,
  role: 'independent',
  fam: 'a104.sport',
  t: [FEU],
  ins: 'Переклади іспанською: «Я займаюся спортом раз на тиждень».',
  acc: ['Hago deporte una vez a la semana.', 'Una vez a la semana hago deporte.', 'Yo hago deporte una vez a la semana.'],
});
k.exact({
  n: 41,
  role: 'independent',
  fam: 'a104.family',
  t: [FEU],
  ins: 'Переклади іспанською: «Щонеділі я обідаю з батьками».',
  acc: ['Los domingos como con mis padres.', 'Como con mis padres los domingos.', 'Yo como con mis padres los domingos.', 'Los domingos yo como con mis padres.'],
  err: [['El domingo como con mis padres.', 'El domingo — «у неділю» (одного разу). «Щонеділі» — los domingos.']],
});
k.slots({
  n: 42,
  role: 'independent',
  fam: 'a104.work',
  t: [FEU],
  ins: 'Перепиши речення повністю: щодня я працюю в офісі, а на вихідних відпочиваю.',
  p: ['___ trabajo en la oficina y ___ descanso.'],
  tpl: [S('s1'), ' trabajo en la oficina y ', S('s2'), ' descanso.'],
  slots: [
    { id: 's1', t: FEU, acc: ['todos los días', 'cada día'], err: [['todo el día', '«Todo el día» — «увесь день». «Щодня» — todos los días або cada día.']] },
    { id: 's2', t: FEU, acc: ['los fines de semana', 'el fin de semana'] },
  ],
  tr: 'Щодня я працюю в офісі, а на вихідних відпочиваю.',
});
k.exact({
  n: 43,
  role: 'independent',
  fam: 'a104.sport',
  t: [FEU],
  ins: 'Переклади іспанською: «Ти ходиш у спортзал щосуботи?»',
  acc: ['¿Vas al gimnasio los sábados?', '¿Los sábados vas al gimnasio?', '¿Tú vas al gimnasio los sábados?'],
});
k.exact({
  n: 44,
  role: 'delayed',
  fam: 'a104.errands',
  t: [FEU],
  ins: 'Переклади іспанською: «Мій тато купує газету щодня».',
  acc: ['Mi padre compra el periódico todos los días.', 'Mi padre compra el periódico cada día.', 'Todos los días mi padre compra el periódico.', 'Cada día mi padre compra el periódico.'],
});
k.exact({
  n: 45,
  role: 'delayed',
  fam: 'a104.leisure',
  t: [FEU],
  ins: 'Переклади іспанською: «Ми ходимо в кіно раз на тиждень».',
  acc: ['Vamos al cine una vez a la semana.', 'Una vez a la semana vamos al cine.', 'Nosotros vamos al cine una vez a la semana.', 'Nosotras vamos al cine una vez a la semana.'],
});
k.exact({
  n: 46,
  role: 'transfer',
  fam: 'a104.chores',
  t: [FEU],
  ins: 'Переклади іспанською: «Щосуботи Ана купує продукти» (hacer la compra).',
  acc: ['Los sábados Ana hace la compra.', 'Ana hace la compra los sábados.'],
  err: [['El sábado Ana hace la compra.', 'El sábado — «у суботу» (одного разу). «Щосуботи» — los sábados.']],
});
k.exact({
  n: 47,
  role: 'transfer',
  fam: 'a104.beach',
  t: [FEU],
  ins: 'Переклади іспанською: «На вихідних мої друзі ходять на пляж».',
  acc: ['Los fines de semana mis amigos van a la playa.', 'Mis amigos van a la playa los fines de semana.'],
});
k.choice({
  n: 48,
  role: 'independent',
  fam: 'a104.sport',
  t: [FER],
  ins: 'Прочитай речення. Як часто Пабло ходить у спортзал?',
  p: ['Pablo va al gimnasio una vez a la semana.'],
  o: [
    ['Щодня.', false],
    ['Раз на тиждень.', true],
    ['Лише на вихідних.', false],
  ],
});
k.choice({
  n: 49,
  role: 'delayed',
  fam: 'a104.family',
  t: [FER],
  ins: 'Прочитай речення. Коли людина обідає з батьками?',
  p: ['Los domingos como con mis padres.'],
  o: [
    ['Щонеділі.', true],
    ['Лише цієї неділі.', FER, 'Los + день тижня означає повтор: los domingos — «щонеділі».'],
    ['Щодня.', false],
  ],
});

// ======================= listening practice
const c6 = k.clip({
  id: 'clip.a1-04.daily-actions.sabados',
  kind: 'sentence',
  es: 'Los sábados me levanto tarde y desayuno en casa.',
  uk: 'Щосуботи я встаю пізно й снідаю вдома.',
  t: [LM],
  fam: 'a104.l5.saturday',
});
k.choice({
  n: 50,
  role: 'independent',
  fam: 'a104.l5.saturday',
  t: [LM],
  clips: [c6],
  ins: 'Послухай запис. Що людина робить щосуботи?',
  o: [
    ['Встає пізно й снідає вдома.', true],
    ['Встає рано й снідає в кав’ярні.', false],
    ['Встає пізно й іде в спортзал.', false],
  ],
  hints: [hTranscript([LM], 'Los sábados me levanto tarde y desayuno en casa.')],
});

k.material({
  id: 'material.a1-04.frequency',
  topic: 'A1-04-L5',
  title: 'Коли і як часто',
  blocks: [
    ul(
      'por la mañana — зранку; por la tarde — удень, після обіду; por la noche — увечері, вночі.',
      'siempre — завжди; normalmente — зазвичай; a menudo — часто; a veces — іноді; nunca — ніколи.',
      'todos los días / cada día — щодня; los fines de semana — на вихідних; una vez a la semana — раз на тиждень; los sábados — щосуботи.',
    ),
    ex('Nunca como carne. = No como carne nunca.', 'Я ніколи не їм м’ясо.'),
    plink('Потренувати частотність', [FAU, NUU, FEU, PD], 'written', 10),
  ],
  linked: [PD, FAU, NUU, FEU],
});

export default k.build({
  title: 'Як часто: siempre, a veces, nunca',
  termEs: 'frecuencia: siempre, a veces, nunca, todos los días',
  summary: 'Кажемо, у яку частину доби й як часто щось робимо: por la mañana, siempre, a veces, nunca, todos los días, los sábados.',
  objectives: ['A1-04-O6'],
  cv: ['CV-03'],
  situations: ['routine-study-leisure'],
  minutes: 18,
  introduces: ['time.parts-of-day', 'time.frequency.adverbs', 'neg.nunca', 'time.frequency.expressions'],
  revisits: ['present.regular-ar', 'present.regular-er', 'present.ir', 'present.hacer', 'reflexive.pronouns', 'reflexive.placement', 'neg.no-before-verb', 'article.plural'],
  steps: [
    {
      kind: 'explanation',
      title: 'Частина доби: por la mañana, por la tarde, por la noche',
      blocks: [
        uk('Якщо точний час не називаємо, частину доби кажемо з por і артиклем la.'),
        ex('Estudio por la mañana.', 'Я вчуся зранку.'),
        ex('Trabajo por la tarde.', 'Я працюю вдень, після обіду.'),
        ex('Ceno por la noche.', 'Я вечеряю ввечері.'),
        uk('В Іспанії la tarde триває довше, ніж українське «після обіду»: приблизно до восьмої-дев’ятої вечора. Саме слово mañana без артикля означає «завтра»: Mañana trabajo. «Зранку» — por la mañana.'),
      ],
    },
    {
      kind: 'explanation',
      title: 'Як часто: siempre, normalmente, a menudo, a veces, nunca',
      blocks: [
        uk('Siempre — «завжди», normalmente — «зазвичай», a menudo — «часто», a veces — «іноді». Найчастіше вони стоять перед дієсловом або на початку речення.'),
        ex('Siempre desayuno en casa.', 'Я завжди снідаю вдома.'),
        ex('A veces como con mis amigos.', 'Іноді я обідаю з друзями.'),
        uk('Nunca — «ніколи». Перед дієсловом — без no: Nunca como carne. Після дієслова — з no перед дієсловом: No como carne nunca. Як в українському «ніколи не їм», заперечень може бути два.'),
      ],
    },
    {
      kind: 'explanation',
      title: 'Щодня, на вихідних, раз на тиждень',
      blocks: [
        uk('Todos los días або cada día — «щодня». Los fines de semana — «на вихідних». Una vez a la semana — «раз на тиждень».'),
        uk('Los + день тижня означає повтор: los sábados — «щосуботи», los domingos — «щонеділі». El sábado — «у суботу» (один раз).'),
        ex('Leo el periódico todos los días.', 'Я щодня читаю газету.'),
        ex('Los sábados voy al cine.', 'Щосуботи я ходжу в кіно.'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком', tasks: [k.id(1), k.id(2), k.id(13), k.id(14), k.id(26), k.id(27), k.id(38), k.id(39)] },
    {
      kind: 'independent-practice',
      title: 'Самостійна практика',
      tasks: [k.id(11), k.id(3), k.id(4), k.id(23), k.id(15), k.id(16), k.id(36), k.id(28), k.id(29), k.id(48), k.id(40), k.id(41)],
    },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика',
      required: false,
      tasks: [k.id(5), k.id(6), k.id(24), k.id(17), k.id(18), k.id(30), k.id(31), k.id(42), k.id(43)],
    },
    { kind: 'listening', title: 'Послухай: субота', required: false, clips: [c6], tasks: [k.id(50)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Без точного часу: por la mañana / por la tarde / por la noche.',
          'Siempre, normalmente, a menudo, a veces — зазвичай перед дієсловом.',
          'Nunca + дієслово або no + дієслово + nunca.',
          'Повтор: todos los días, los fines de semana, una vez a la semana, los sábados.',
        ),
      ],
    },
  ],
});
