// A1-05-L3 — clock time and opening hours: son las / es la una, minutes, de la mañana, a las,
// ¿qué hora? vs ¿a qué hora?, de … a …, abre / cierra, opening-hours notices, listening to times.
import { Kit, S, el, es, ex, hTranscript, plink, ul, uk, DICTATION } from '../lib.ts';
import type { SlotSpec } from '../lib.ts';
import type { TaskRole } from '../../../content/types.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-05-L3', RULES);

const TH = 'time.clock.hours/written-form';
const THC = 'time.clock.hours/context-choice';
const THR = 'time.clock.hours/reading-meaning';
const EU = 'time.clock.es-la-una/written-form';
const EUC = 'time.clock.es-la-una/context-choice';
const MI = 'time.clock.minutes/written-form';
const MIC = 'time.clock.minutes/context-choice';
const MIR = 'time.clock.minutes/reading-meaning';
const DM = 'time.clock.de-la-manana/written-form';
const DMC = 'time.clock.de-la-manana/context-choice';
const EAU = 'time.event.a-las/construction-use';
const EAW = 'time.event.a-las/written-form';
const EAC = 'time.event.a-las/context-choice';
const QHC = 'contrast.que-hora-a-que-hora/context-choice';
const QHR = 'contrast.que-hora-a-que-hora/reading-meaning';
const RAR = 'time.range.de-a/reading-meaning';
const RAW = 'time.range.de-a/written-form';
const RAU = 'time.range.de-a/construction-use';
const ACW = 'time.abre-cierra/written-form';
const ACR = 'time.abre-cierra/reading-meaning';
const ACU = 'time.abre-cierra/construction-use';
const RO = 'reading.opening-hours/reading-meaning';
const LT = 'listening.times/listening-meaning';
const LTD = 'listening.times/dictation';

type E = Array<[string, string]>;
const clockIns = (clock: string, model?: string): string => `Котра година? Напиши відповідь іспанською повним реченням: ${clock}.${model ? ` Зразок: ${model}.` : ''}`;
function hour(n: number, role: TaskRole, fam: string, clock: string, word: string, model?: string): string {
  return k.exact({
    n,
    role,
    fam,
    t: [TH],
    ins: clockIns(clock, model),
    acc: [`Son las ${word}.`, `Son las ${word} en punto.`],
    err: [
      [`Son ${word}.`, 'Перед годиною потрібен артикль las: Son las …'],
      [`Es las ${word}.`, 'Для всіх годин, крім першої, — son: Son las …'],
    ],
  });
}

// ======================= hours, es la una
hour(1, 'supported', 'a105.clock', '2:00', 'dos', '10:00 → Son las diez');
hour(2, 'supported', 'a105.clock', '5:00', 'cinco', '10:00 → Son las diez');
hour(3, 'independent', 'a105.clock', '9:00', 'nueve');
hour(4, 'independent', 'a105.clock', '12:00', 'doce');
k.slots({
  n: 5,
  role: 'independent',
  fam: 'a105.timezones',
  t: [TH],
  ins: 'Перепиши речення повністю, записавши години словами: у Мадриді 8:00, а в Лісабоні 7:00.',
  p: ['En Madrid son las ___ y en Lisboa son las ___.'],
  tpl: ['En Madrid son las ', S('s1'), ' y en Lisboa son las ', S('s2'), '.'],
  slots: [
    { id: 's1', t: TH, acc: ['ocho'] },
    { id: 's2', t: TH, acc: ['siete'] },
  ],
  tr: 'У Мадриді восьма година, а в Лісабоні — сьома.',
});
hour(6, 'independent', 'a105.clock', '11:00', 'once');
hour(7, 'delayed', 'a105.clock', '7:00', 'siete');
hour(8, 'delayed', 'a105.clock', '3:00', 'tres');
hour(9, 'transfer', 'a105.phone-clock', '6:00 (на твоєму телефоні, Ана питає: «¿Qué hora es?»)', 'seis');
hour(10, 'transfer', 'a105.train-chat', '10:00 (сусід у потязі питає, котра година)', 'diez');
k.choice({ n: 11, role: 'independent', fam: 'a105.clock', t: [THC], ins: 'Зараз 4:00. Обери правильну відповідь на «¿Qué hora es?».', o: [['Es las cuatro.', THC, 'Для всіх годин, крім першої, — son.'], ['Son las cuatro.', true], ['Son cuatro.', THC, 'Перед годиною потрібен артикль las.']] });
k.choice({ n: 12, role: 'independent', fam: 'a105.clock', t: [THR], ins: 'Прочитай відповідь. Котра година?', p: ['Son las ocho.'], o: [['Восьма.', true], ['Дев’ята.', false], ['Четверта.', false]] });

const unaErr: E = [
  ['Son la una.', 'Перша година — однина: Es la una.'],
  ['Es las una.', 'Перша година — однина: Es la una.'],
  ['Son las una.', 'Перша година — однина: Es la una.'],
];
k.exact({ n: 13, role: 'supported', fam: 'a105.clock', t: [EU], ins: clockIns('1:00', '2:00 → Son las dos; перша година — в однині (es la …)'), acc: ['Es la una.', 'Es la una en punto.'], err: unaErr });
k.exact({ n: 14, role: 'independent', fam: 'a105.clock', t: [EU], ins: clockIns('1:30'), acc: ['Es la una y media.'], err: [['Son la una y media.', 'Перша година — однина: Es la una y media.'], ['Son las una y media.', 'Перша година — однина: Es la una y media.']] });
k.exact({ n: 15, role: 'independent', fam: 'a105.class-time', t: [EU], ins: 'Впиши, о котрій заняття: о першій.', p: ['La clase es ___ una.'], acc: ['a la'], err: [['a las', 'Перша година — однина: a la una.'], ['la', 'Час події — з a: a la una.']], tr: 'Заняття о першій.' });
k.exact({ n: 16, role: 'delayed', fam: 'a105.clock', t: [EU], ins: clockIns('1:15'), acc: ['Es la una y cuarto.', 'Es la una y quince.'], err: [['Son la una y cuarto.', 'Перша година — однина: Es la una y cuarto.']] });
k.slots({ n: 17, role: 'transfer', fam: 'a105.train', t: [EU], ins: 'Перепиши речення повністю: потяг відправляється о першій.', p: ['El tren sale ___ una.'], tpl: ['El tren sale ', S('s1'), ' una.'], slots: [{ id: 's1', t: EU, acc: ['a la'], err: [['a las', 'Перша година — однина: a la una.']] }], tr: 'Потяг відправляється о першій.' });
k.exact({ n: 18, role: 'transfer', fam: 'a105.lunch', t: [EU], ins: clockIns('12:45 (обідня перерва скоро закінчиться)'), acc: ['Es la una menos cuarto.', 'Son las doce cuarenta y cinco.'], err: [['Son la una menos cuarto.', 'Перша година — однина: Es la una menos cuarto.'], ['Son las doce menos cuarto.', 'Las doce menos cuarto — це 11:45. Після половини називаємо наступну годину.']] });
k.choice({ n: 19, role: 'delayed', fam: 'a105.clock', t: [EUC], ins: 'Зараз 1:00. Обери правильне слово.', p: ['___ la una.'], o: [['Son', EUC, 'Перша година — однина: Es la una.'], ['Es', true]] });

// ======================= minutes
function mins(n: number, role: TaskRole, fam: string, clock: string, acc: string[], err: E = [], model?: string): string {
  return k.exact({ n, role, fam, t: [MI], ins: clockIns(clock, model), acc, err });
}
mins(20, 'supported', 'a105.clock', '3:15', ['Son las tres y cuarto.', 'Son las tres y quince.'], [['Son las tres menos cuarto.', 'Menos — після половини. 3:15 — y cuarto.']], '4:30 → Son las cuatro y media');
mins(21, 'supported', 'a105.clock', '4:30', ['Son las cuatro y media.'], [['Son las cinco y media.', 'Las cinco y media — це 5:30. До половини години називаємо цю саму годину: las cuatro y media.']], '3:15 → Son las tres y cuarto');
mins(22, 'independent', 'a105.clock', '5:10', ['Son las cinco y diez.']);
mins(23, 'independent', 'a105.clock', '3:45', ['Son las cuatro menos cuarto.', 'Son las tres cuarenta y cinco.'], [['Son las tres menos cuarto.', 'Las tres menos cuarto — це 2:45. Після половини називаємо наступну годину: las cuatro menos cuarto.']]);
mins(24, 'independent', 'a105.clock', '5:40', ['Son las seis menos veinte.', 'Son las cinco cuarenta.'], [['Son las cinco menos veinte.', 'Las cinco menos veinte — це 4:40. Після половини називаємо наступну годину: las seis menos veinte.']]);
mins(25, 'independent', 'a105.clock', '8:30', ['Son las ocho y media.']);
mins(26, 'delayed', 'a105.clock', '7:15', ['Son las siete y cuarto.', 'Son las siete y quince.']);
mins(27, 'delayed', 'a105.clock', '9:50', ['Son las diez menos diez.', 'Son las nueve cincuenta.'], [['Son las nueve menos diez.', 'Las nueve menos diez — це 8:50. Після половини називаємо наступну годину.']]);
mins(28, 'transfer', 'a105.station-board', '11:20 (табло на вокзалі)', ['Son las once y veinte.']);
mins(29, 'transfer', 'a105.cafe-clock', '10:45 (годинник у кав’ярні)', ['Son las once menos cuarto.', 'Son las diez cuarenta y cinco.'], [['Son las diez menos cuarto.', 'Las diez menos cuarto — це 9:45. Після половини називаємо наступну годину.']]);
k.choice({ n: 30, role: 'independent', fam: 'a105.clock', t: [MIC], ins: 'Зараз 3:45. Обери правильну відповідь.', o: [['Son las tres menos cuarto.', MIC, 'Це 2:45.'], ['Son las cuatro y cuarto.', MIC, 'Це 4:15.'], ['Son las cuatro menos cuarto.', true]] });
k.choice({ n: 31, role: 'independent', fam: 'a105.clock', t: [MIR], ins: 'Прочитай відповідь. Котра година?', p: ['Son las seis menos veinte.'], o: [['6:20.', false], ['5:40.', true], ['6:40.', false]] });

// ======================= de la mañana (with exact time)
const dmErr = (part: 'mañana' | 'tarde' | 'noche'): Array<[string, string, Record<string, 'incorrect' | 'unresolved'>?]> => [
  [`por la ${part}`, `З точним часом частину доби додаємо через de: de la ${part}. Por la ${part} — без точного часу.`],
  [`en la ${part}`, `В Іспанії з точним часом кажуть de la ${part}; en la ${part} поширене в Латинській Америці, тож тут не рахується помилкою, але очікувана відповідь — de la ${part}.`, { [DM]: 'unresolved' }],
];
const dmIns = (when: string, model?: string): string => `Впиши іспанською частину доби до точного часу (${when}).${model ? ` Зразок: a las cinco de la tarde.` : ''}`;
k.exact({ n: 32, role: 'supported', fam: 'a105.morning-time', t: [DM], ins: dmIns('зранку', 'y'), p: ['a las ocho ___'], acc: ['de la mañana'], err: dmErr('mañana'), tr: 'о восьмій ранку' });
k.exact({ n: 33, role: 'supported', fam: 'a105.afternoon-time', t: [DM], ins: dmIns('після обіду', 'y'), p: ['a las cinco ___'], acc: ['de la tarde'], err: dmErr('tarde'), tr: 'о п’ятій після обіду' });
k.exact({ n: 34, role: 'independent', fam: 'a105.night-time', t: [DM], ins: dmIns('уночі'), p: ['a las once ___'], acc: ['de la noche'], err: dmErr('noche'), tr: 'об одинадцятій вечора' });
k.exact({ n: 35, role: 'independent', fam: 'a105.morning-time', t: [DM], ins: dmIns('зранку'), p: ['Trabajo a las nueve ___.'], acc: ['de la mañana'], err: dmErr('mañana'), tr: 'Я працюю з дев’ятої ранку.' });
k.exact({ n: 36, role: 'independent', fam: 'a105.night-time', t: [DM], ins: dmIns('увечері, 22:00'), p: ['Ceno a las diez ___.'], acc: ['de la noche'], err: dmErr('noche'), tr: 'Я вечеряю о десятій вечора.' });
k.slots({
  n: 37,
  role: 'independent',
  fam: 'a105.shop-hours',
  t: [DM],
  ins: 'Перепиши речення повністю: крамниця відчиняється о 9:00 і зачиняється о 20:00.',
  p: ['La tienda abre a las nueve ___ y cierra a las ocho ___.'],
  tpl: ['La tienda abre a las nueve ', S('s1'), ' y cierra a las ocho ', S('s2'), '.'],
  slots: [
    { id: 's1', t: DM, acc: ['de la mañana'], err: [['por la mañana', 'З точним часом — de la mañana.']] },
    { id: 's2', t: DM, acc: ['de la tarde', 'de la noche'], err: [['por la tarde', 'З точним часом — de la tarde.']] },
  ],
  tr: 'Крамниця відчиняється о дев’ятій ранку й зачиняється о восьмій вечора.',
});
k.exact({ n: 38, role: 'delayed', fam: 'a105.afternoon-time', t: [DM], ins: dmIns('після обіду'), p: ['a las cuatro ___'], acc: ['de la tarde'], err: dmErr('tarde'), tr: 'о четвертій після обіду' });
k.exact({ n: 39, role: 'delayed', fam: 'a105.class-time', t: [DM], ins: dmIns('зранку'), p: ['La clase es a las diez ___.'], acc: ['de la mañana'], err: dmErr('mañana'), tr: 'Заняття о десятій ранку.' });
k.exact({ n: 40, role: 'transfer', fam: 'a105.train', t: [DM], ins: dmIns('зранку'), p: ['El tren sale a las seis ___.'], acc: ['de la mañana'], err: dmErr('mañana'), tr: 'Потяг відправляється о шостій ранку.' });
k.exact({ n: 41, role: 'transfer', fam: 'a105.concert', t: [DM], ins: dmIns('увечері, 21:00'), p: ['El concierto es a las nueve ___.'], acc: ['de la noche'], err: dmErr('noche'), tr: 'Концерт о дев’ятій вечора.' });
k.choice({ n: 42, role: 'independent', fam: 'a105.morning-time', t: [DMC], ins: 'Обери правильний варіант.', p: ['Me levanto a las siete ___.'], o: [['por la mañana', DMC, 'З точним часом — de la mañana.'], ['de la mañana', true]], tr: 'Я встаю о сьомій ранку.' });

// ======================= ¿A qué hora…? — a las …
const aQue: [string, string] = ['', 'Про час події питаємо з a: ¿A qué hora…?'];
k.exact({ n: 43, role: 'supported', fam: 'a105.class-time', t: [EAU], ins: 'Запитай іспанською, о котрій заняття. Зразок: ¿A qué hora es el concierto?', acc: ['¿A qué hora es la clase?'], err: [['¿Qué hora es la clase?', aQue[1]]] });
k.exact({ n: 44, role: 'supported', fam: 'a105.class-time', t: [EAW], ins: 'Впиши, о котрій заняття (о дев’ятій). Зразок: El concierto es a las nueve.', p: ['La clase es ___ nueve.'], acc: ['a las'], err: [['las', 'Час події — з a: a las nueve.'], ['en las', 'Час події — з a: a las nueve.']], tr: 'Заняття о дев’ятій.' });
k.exact({ n: 45, role: 'independent', fam: 'a105.class-time', t: [EAU], ins: 'Відповідай іспанською на «¿A qué hora es la clase?»: о восьмій тридцять.', acc: ['A las ocho y media.', 'Es a las ocho y media.', 'La clase es a las ocho y media.'], err: [['Las ocho y media.', 'Час події — з a: A las ocho y media.']] });
k.exact({ n: 46, role: 'independent', fam: 'a105.bank-hours', t: [EAU], ins: 'Запитай іспанською, о котрій відчиняється банк.', acc: ['¿A qué hora abre el banco?'], err: [['¿Qué hora abre el banco?', aQue[1]]] });
k.exact({ n: 47, role: 'independent', fam: 'a105.train', t: [EAW], ins: 'Впиши, о котрій відправляється потяг (о десятій).', p: ['Mi tren sale ___ diez.'], acc: ['a las'], err: [['las', 'Час події — з a: a las diez.']], tr: 'Мій потяг відправляється о десятій.' });
k.exact({ n: 48, role: 'independent', fam: 'a105.concert', t: [EAU], ins: 'Переклади іспанською: «Концерт о дев’ятій».', acc: ['El concierto es a las nueve.'], err: [['El concierto es las nueve.', 'Час події — з a: a las nueve.']] });
k.exact({ n: 49, role: 'delayed', fam: 'a105.dinner-time', t: [EAU], ins: 'Запитай іспанською, о котрій вечеря.', acc: ['¿A qué hora es la cena?'], err: [['¿Qué hora es la cena?', aQue[1]]] });
k.slots({ n: 50, role: 'delayed', fam: 'a105.breakfast-time', t: [EAW], ins: 'Перепиши речення повністю: я снідаю о сьомій.', p: ['Desayuno ___ siete.'], tpl: ['Desayuno ', S('s1'), ' siete.'], slots: [{ id: 's1', t: EAW, acc: ['a las'], err: [['las', 'Час події — з a: a las siete.']] }], tr: 'Я снідаю о сьомій.' });
k.exact({ n: 51, role: 'transfer', fam: 'a105.departures', t: [EAU], ins: 'Переклади іспанською: «Потяг відправляється о шостій».', acc: ['El tren sale a las seis.'], err: [['El tren sale las seis.', 'Час події — з a: a las seis.']] });
k.exact({ n: 52, role: 'transfer', fam: 'a105.museum-hours', t: [EAU], ins: 'Запитай іспанською, о котрій відчиняється музей.', acc: ['¿A qué hora abre el museo?'], err: [['¿Qué hora abre el museo?', aQue[1]]] });
k.choice({ n: 53, role: 'independent', fam: 'a105.class-time', t: [EAC], ins: 'Обери правильний варіант.', p: ['La clase es ___ nueve.'], o: [['las', EAC, 'Час події — з a: a las.'], ['a las', true], ['en las', EAC, 'Час події — з a: a las.']], tr: 'Заняття о дев’ятій.' });

k.choice({ n: 54, role: 'supported', fam: 'a105.clock', t: [QHC], ins: 'Ти хочеш знати, котра година зараз. Що спитаєш? (¿Qué hora es? — котра година; ¿A qué hora…? — о котрій подія.)', o: [['¿Qué hora es?', true], ['¿A qué hora es?', QHC, '¿A qué hora…? питає про час події, а не про поточний час.']] });
k.choice({ n: 55, role: 'independent', fam: 'a105.class-time', t: [QHC], ins: 'Ти хочеш знати, о котрій починається заняття. Що спитаєш?', o: [['¿Qué hora es la clase?', QHC, 'Про час події питаємо з a: ¿A qué hora…?'], ['¿A qué hora es la clase?', true]] });
k.choice({ n: 56, role: 'delayed', fam: 'a105.concert', t: [QHR], ins: 'Прочитай діалог. Про що питає людина?', p: ['—¿A qué hora es el concierto? —A las nueve.'], o: [['Котра година зараз.', false], ['О котрій концерт.', true], ['Скільки коштує концерт.', false]] });

// ======================= de … a …
const range = (from: string, to: string, fromArt = 'las', toArt = 'las'): string[] => [`de ${from} a ${to}`, `de ${fromArt} ${from} a ${toArt} ${to}`, `desde ${fromArt} ${from} hasta ${toArt} ${to}`];
const rangeSent = (pre: string, from: string, to: string, post = '.'): string[] => range(from, to).map((r) => `${pre} ${r}${post}`);
k.slots({
  n: 57,
  role: 'supported',
  fam: 'a105.bank-hours',
  t: [RAW],
  ins: 'Перепиши речення повністю: банк працює з дев’ятої до другої. Зразок: de nueve a dos.',
  p: ['El banco abre ___ nueve ___ dos.'],
  tpl: ['El banco abre ', S('s1'), ' nueve ', S('s2'), ' dos.'],
  slots: [
    { id: 's1', t: RAW, acc: ['de'], err: [['a', '«Від» — de, «до» — a: de nueve a dos.']] },
    { id: 's2', t: RAW, acc: ['a'], err: [['de', '«До» — a: de nueve a dos.']] },
  ],
  tr: 'Банк працює з дев’ятої до другої.',
});
k.exact({ n: 58, role: 'supported', fam: 'a105.bank-hours', t: [RAU], ins: 'Напиши іспанською: «з дев’ятої до другої». Зразок: de diez a ocho.', acc: range('nueve', 'dos') });
k.exact({ n: 59, role: 'independent', fam: 'a105.pharmacy-hours', t: [RAU], ins: 'Переклади іспанською: «Аптека працює з десятої до восьмої».', acc: rangeSent('La farmacia abre', 'diez', 'ocho') });
k.exact({ n: 60, role: 'independent', fam: 'a105.bank-hours', t: [RAU], ins: 'Напиши словами години роботи з таблички: 9:00–14:00.', acc: [...range('nueve', 'dos'), ...range('nueve', 'catorce')] });
k.slots({
  n: 61,
  role: 'independent',
  fam: 'a105.workday',
  t: [RAW],
  ins: 'Перепиши речення повністю: я працюю з восьмої до третьої.',
  p: ['Trabajo ___ ocho ___ tres.'],
  tpl: ['Trabajo ', S('s1'), ' ocho ', S('s2'), ' tres.'],
  slots: [
    { id: 's1', t: RAW, acc: ['de', 'de las'], err: [['a', '«Від» — de.']] },
    { id: 's2', t: RAW, acc: ['a', 'a las'], err: [['de', '«До» — a.']] },
  ],
  tr: 'Я працюю з восьмої до третьої.',
});
k.exact({ n: 62, role: 'independent', fam: 'a105.class-time', t: [RAU], ins: 'Переклади іспанською: «Заняття з п’ятої до сьомої».', acc: rangeSent('La clase es', 'cinco', 'siete') });
k.slots({
  n: 63,
  role: 'delayed',
  fam: 'a105.museum-hours',
  t: [RAW],
  ins: 'Перепиши речення повністю: музей працює з десятої до шостої.',
  p: ['El museo abre ___ diez ___ seis.'],
  tpl: ['El museo abre ', S('s1'), ' diez ', S('s2'), ' seis.'],
  slots: [
    { id: 's1', t: RAW, acc: ['de', 'de las'], err: [['a', '«Від» — de.']] },
    { id: 's2', t: RAW, acc: ['a', 'a las'], err: [['de', '«До» — a.']] },
  ],
  tr: 'Музей працює з десятої до шостої.',
});
k.exact({ n: 64, role: 'delayed', fam: 'a105.workday', t: [RAU], ins: 'Напиши іспанською: «з восьмої до третьої».', acc: range('ocho', 'tres') });
k.exact({
  n: 65,
  role: 'transfer',
  fam: 'a105.restaurant-hours',
  t: [RAU],
  ins: 'Переклади іспанською: «Ресторан працює з першої до четвертої».',
  acc: [
    'El restaurante abre de una a cuatro.',
    'El restaurante abre de la una a las cuatro.',
    'El restaurante abre desde la una hasta las cuatro.',
    'El restaurante está abierto de una a cuatro.',
    'El restaurante está abierto de la una a las cuatro.',
    'El restaurante está abierto desde la una hasta las cuatro.',
  ],
});
k.exact({ n: 66, role: 'transfer', fam: 'a105.study-hours', t: [RAU], ins: 'Переклади іспанською: «Я вчуся з четвертої до шостої після обіду».', acc: rangeSent('Estudio', 'cuatro', 'seis', ' de la tarde.') });
k.choice({ n: 67, role: 'independent', fam: 'a105.bank-hours', t: [RAR], ins: 'Прочитай табличку (horario — години роботи). Коли працює заклад?', p: ['Horario: de 9:00 a 14:00'], o: [['З 9:00 до 14:00.', true], ['О 9:00 і о 14:00.', false], ['Після 14:00.', false]] });

// ======================= abre / cierra
const abreIns = (what: string, model?: string): string => `Впиши форму дієслова: ${what}.${model ? ` Зразок: ${model}.` : ''}`;
k.exact({ n: 68, role: 'supported', fam: 'a105.bank-hours', t: [ACW], ins: abreIns('банк відчиняється', 'La tienda cierra a las ocho'), p: ['El banco ___ a las nueve.'], acc: ['abre'], err: [['abren', 'Banco — один заклад: abre.'], ['abrir', 'Це інфінітив. Потрібна форма для él / ella: abre.']], tr: 'Банк відчиняється о дев’ятій.' });
k.exact({ n: 69, role: 'supported', fam: 'a105.shop-hours', t: [ACW], ins: abreIns('крамниця зачиняється', 'El banco abre a las nueve'), p: ['La tienda ___ a las ocho.'], acc: ['cierra'], err: [['cerra', 'У формі cierra основа змінюється: e → ie.'], ['cierran', 'Tienda — один заклад: cierra.']], tr: 'Крамниця зачиняється о восьмій.' });
k.exact({ n: 70, role: 'independent', fam: 'a105.museum-hours', t: [ACW], ins: abreIns('музеї відчиняються'), p: ['Los museos ___ a las diez.'], acc: ['abren'], err: [['abre', 'Museos — кілька закладів: abren.']], tr: 'Музеї відчиняються о десятій.' });
k.exact({ n: 71, role: 'independent', fam: 'a105.shop-hours', t: [ACW], ins: abreIns('крамниці зачиняються'), p: ['Las tiendas ___ a las nueve.'], acc: ['cierran'], err: [['cerran', 'У формі cierran основа змінюється: e → ie.'], ['cierra', 'Tiendas — кілька закладів: cierran.']], tr: 'Крамниці зачиняються о дев’ятій.' });
k.exact({ n: 72, role: 'independent', fam: 'a105.pharmacy-hours', t: [ACU], ins: 'Запитай іспанською, о котрій зачиняється аптека.', acc: ['¿A qué hora cierra la farmacia?'], err: [['¿A qué hora cerra la farmacia?', 'У формі cierra основа змінюється: e → ie.']] });
k.exact({ n: 73, role: 'independent', fam: 'a105.super-hours', t: [ACU], ins: 'Переклади іспанською: «Супермаркет відчиняється о дев’ятій».', acc: ['El supermercado abre a las nueve.'], err: [['El supermercado abren a las nueve.', 'Supermercado — один заклад: abre.']] });
k.slots({ n: 74, role: 'delayed', fam: 'a105.bank-hours', t: [ACW], ins: 'Перепиши речення повністю: банк зачиняється о другій.', p: ['El banco ___ a las dos.'], tpl: ['El banco ', S('s1'), ' a las dos.'], slots: [{ id: 's1', t: ACW, acc: ['cierra'], err: [['cerra', 'У формі cierra основа змінюється: e → ie.'], ['cierran', 'Banco — один заклад: cierra.']] }], tr: 'Банк зачиняється о другій.' });
k.exact({ n: 75, role: 'delayed', fam: 'a105.museum-hours', t: [ACU], ins: 'Переклади іспанською: «Музеї зачиняються о шостій».', acc: ['Los museos cierran a las seis.'], err: [['Los museos cierra a las seis.', 'Museos — кілька закладів: cierran.']] });
k.exact({ n: 76, role: 'transfer', fam: 'a105.bar-hours', t: [ACU], ins: 'Переклади іспанською: «Бар відчиняється о сьомій ранку».', acc: ['El bar abre a las siete de la mañana.'] });
k.exact({
  n: 77,
  role: 'transfer',
  fam: 'a105.notice-closed',
  t: [ACU],
  ins: 'Переклади іспанською: «Аптека зараз зачинена».',
  acc: ['La farmacia está cerrada.', 'Ahora la farmacia está cerrada.', 'La farmacia está cerrada ahora.'],
  err: [['La farmacia cierra.', 'Cierra — дія: «зачиняється» (о певній годині). Стан «зачинено зараз» — está cerrada.']],
});
k.choice({ n: 78, role: 'independent', fam: 'a105.pharmacy-hours', t: [ACR], ins: 'Прочитай. О котрій зачиняється аптека?', p: ['La farmacia abre a las nueve y cierra a las nueve de la noche.'], o: [['О 9:00.', false], ['О 21:00.', true], ['О 19:00.', false]] });

// ======================= reading: opening hours (CV-06)
const H1 = 'FARMACIA GARCÍA — Horario: L–V 9:00–14:00 y 17:00–20:30 · Sábados: 10:00–14:00 · Domingos y festivos: cerrado';
const H2 = 'SUPERMERCADO — Abierto todos los días de 9:00 a 21:30';
const H3 = 'MUSEO — Horario: 10:00–19:00 · Lunes: cerrado';
const H4 = 'BANCO — Horario: L–V 8:30–14:00';
const days = '(L–V — з понеділка до п’ятниці; lunes — понеділок; festivos — святкові дні.)';
const ro = (n: number, role: TaskRole, fam: string, text: string, q: string, o: Array<[string, boolean]>): string => k.choice({ n, role, fam, t: [RO], ins: `Прочитай табличку ${days} ${q}`, p: [text], o });
ro(79, 'independent', 'a105.sign-pharmacy', H1, 'Коли аптека працює в будні?', [['З 9:00 до 20:30 без перерви.', false], ['З 9:00 до 14:00 і з 17:00 до 20:30.', true], ['Лише з 10:00 до 14:00.', false]]);
ro(80, 'independent', 'a105.sign-pharmacy', H1, 'Чи працює аптека в неділю?', [['Так, з 10:00 до 14:00.', false], ['Ні, зачинена.', true]]);
ro(81, 'independent', 'a105.sign-super', H2, 'О котрій зачиняється супермаркет?', [['О 21:30.', true], ['О 9:00.', false], ['О 20:30.', false]]);
ro(82, 'independent', 'a105.sign-super', H2, 'Чи працює супермаркет у неділю?', [['Так, він працює щодня.', true], ['Ні, у неділю зачинено.', false]]);
ro(83, 'independent', 'a105.sign-museum', H3, 'Коли музей зачинений?', [['У понеділок.', true], ['У неділю.', false], ['Після 10:00.', false]]);
ro(84, 'independent', 'a105.sign-museum', H3, 'О котрій відчиняється музей?', [['О 19:00.', false], ['О 10:00.', true], ['О 9:00.', false]]);
ro(85, 'delayed', 'a105.sign-bank', H4, 'О котрій відчиняється банк?', [['О 8:30.', true], ['О 14:00.', false], ['О 9:00.', false]]);
ro(86, 'delayed', 'a105.sign-bank', H4, 'Чи працює банк після обіду (о 17:00)?', [['Так.', false], ['Ні, він працює до 14:00.', true]]);

// ======================= listening: times
const T1 = 'Son las cuatro menos cuarto.';
const T2 = 'El tren sale a las diez y media.';
const T3 = 'La tienda abre a las nueve.';
const t1 = k.clip({ id: 'clip.a1-05.times.menos-cuarto', kind: 'sentence', es: T1, uk: 'Зараз за чверть четверта (3:45).', t: [LT], fam: 'a105.l-clock' });
const t2 = k.clip({ id: 'clip.a1-05.times.tren', kind: 'sentence', es: T2, uk: 'Потяг відправляється о пів на одинадцяту (10:30).', t: [LT, LTD], fam: 'a105.l-train' });
const t3 = k.clip({ id: 'clip.a1-05.times.tienda', kind: 'sentence', es: T3, uk: 'Крамниця відчиняється о дев’ятій.', t: [LT], fam: 'a105.l-shop-hours' });
k.choice({ n: 87, role: 'independent', fam: 'a105.l-clock', t: [LT], clips: [t1], ins: 'Послухай. Котра година?', o: [['4:15.', false], ['3:45.', true], ['4:45.', false]], hints: [hTranscript([LT], T1)] });
k.choice({ n: 88, role: 'independent', fam: 'a105.l-train', t: [LT], clips: [t2], ins: 'Послухай. О котрій відправляється потяг?', o: [['10:30.', true], ['11:30.', false], ['10:15.', false]], hints: [hTranscript([LT], T2)] });
k.choice({ n: 89, role: 'independent', fam: 'a105.l-shop-hours', t: [LT], clips: [t3], ins: 'Послухай. Що ти дізнаєшся про крамницю?', o: [['Вона зачиняється о дев’ятій.', false], ['Вона відчиняється о дев’ятій.', true], ['Вона відчиняється о десятій.', false]], hints: [hTranscript([LT], T3)] });
k.exact({ n: 90, role: 'independent', fam: 'a105.l-train', t: [LTD], clips: [t2], ins: 'Необов’язковий диктант: послухай і запиши речення. Час можна записати цифрами. Великі літери й крапка не оцінюються.', acc: [T2, 'El tren sale a las 10:30.', 'El tren sale a las 10.30.'], pol: DICTATION });

k.material({
  id: 'material.a1-05.time',
  topic: 'A1-05-L3',
  title: 'Котра година і години роботи',
  blocks: [
    el(
      '¿Qué hora es? — Son las dos. Es la una.',
      'Son las tres y cuarto (3:15), y media (3:30); las cuatro menos cuarto (3:45).',
      'a las ocho de la mañana, a las cinco de la tarde, a las once de la noche.',
      '¿A qué hora es la clase? — A las nueve.',
      'El banco abre de nueve a dos. La tienda cierra a las ocho.',
    ),
    plink('Потренувати час', [TH, MI, EAU, RAU, ACW], 'written', 12),
  ],
  linked: [TH, EU, MI, DM, EAU, RAU, ACW],
});

export default k.build({
  title: 'Котра година і коли відчинено',
  termEs: 'la hora y los horarios',
  summary: 'Кажемо, котра година, і питаємо, о котрій подія; додаємо частину доби, читаємо таблички з годинами роботи (abre, cierra, de … a …) і слухаємо час. Урок поділено на три кроки, до яких можна повертатися окремо.',
  objectives: ['A1-05-O3'],
  cv: ['CV-03', 'CV-06'],
  situations: ['time-appointments-transport', 'conditions-weather-problems'],
  minutes: 20,
  introduces: [
    'time.clock.hours',
    'time.clock.es-la-una',
    'time.clock.minutes',
    'time.clock.de-la-manana',
    'time.event.a-las',
    'contrast.que-hora-a-que-hora',
    'time.range.de-a',
    'time.abre-cierra',
    'reading.opening-hours',
    'listening.times',
  ],
  revisits: ['number.0-15', 'number.16-29', 'number.30-99', 'present.ser', 'time.parts-of-day', 'present.regular-ir', 'estar.state', 'question.word.que', 'listening.amounts'],
  steps: [
    {
      kind: 'explanation',
      title: 'Крок 1. Котра година?',
      blocks: [
        uk('Котра година — ¿Qué hora es? Відповідь: Son las + число. Артикль las обов’язковий.'),
        uk('Перша година — в однині: Es la una.'),
        uk('До половини години хвилини додаємо через y: y cuarto (15), y media (30), y diez. Після половини називаємо наступну годину й віднімаємо через menos: las cuatro menos cuarto — 3:45.'),
        ex('Son las dos.', 'Друга година.'),
        ex('Es la una y media.', 'Пів на другу (1:30).'),
        ex('Son las cuatro menos cuarto.', 'За чверть четверта (3:45).'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 1: практика зі зразком', tasks: [k.id(1), k.id(2), k.id(13), k.id(20), k.id(21)] },
    { kind: 'independent-practice', title: 'Крок 1: самостійно', tasks: [k.id(11), k.id(12), k.id(3), k.id(14), k.id(30), k.id(31), k.id(22), k.id(23)] },
    {
      kind: 'explanation',
      title: 'Крок 2. О котрій? ¿A qué hora…?',
      blocks: [
        uk('¿Qué hora es? — «Котра година зараз?». ¿A qué hora…? — «О котрій відбувається подія?». Відповідь про подію — a las + година (a la una).'),
        uk('З точним часом частину доби додаємо через de: a las ocho de la mañana, a las cinco de la tarde, a las once de la noche. Без точного часу — por la mañana.'),
        ex('¿A qué hora es la clase? — A las nueve.', 'О котрій заняття? — О дев’ятій.'),
        ex('El concierto es a las nueve de la noche.', 'Концерт о дев’ятій вечора.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 2: практика зі зразком', tasks: [k.id(54), k.id(43), k.id(44), k.id(32), k.id(33)] },
    { kind: 'independent-practice', title: 'Крок 2: самостійно', tasks: [k.id(55), k.id(53), k.id(45), k.id(46), k.id(42), k.id(34), k.id(35)] },
    {
      kind: 'explanation',
      title: 'Крок 3. Години роботи: abre, cierra, de … a …',
      blocks: [
        uk('Abre — «відчиняється», cierra — «зачиняється»; про кілька закладів — abren, cierran. Стан зараз — estar: La farmacia está cerrada.'),
        uk('«Від … до …» — de … a … або desde … hasta …: El banco abre de nueve a dos. На табличках — 24-годинний формат: 17:00 у розмові — las cinco de la tarde.'),
        ex('El banco abre a las nueve y cierra a las dos.', 'Банк відчиняється о дев’ятій і зачиняється о другій.'),
        ex('Horario: de 9:00 a 14:00 y de 17:00 a 20:30.', 'Години роботи: з 9:00 до 14:00 і з 17:00 до 20:30.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 3: практика зі зразком', tasks: [k.id(68), k.id(69), k.id(57), k.id(58)] },
    { kind: 'independent-practice', title: 'Крок 3: самостійно', tasks: [k.id(78), k.id(70), k.id(71), k.id(67), k.id(59), k.id(60)] },
    { kind: 'reading', title: 'Читаємо таблички', blocks: [es(H1), es(H2), es(H3)], tasks: [k.id(79), k.id(80), k.id(81), k.id(82), k.id(83), k.id(84)] },
    { kind: 'listening', title: 'Послухай: час', required: false, clips: [t1, t2, t3], tasks: [k.id(87), k.id(88), k.id(89), k.id(90)] },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика',
      required: false,
      tasks: [k.id(4), k.id(5), k.id(6), k.id(15), k.id(24), k.id(25), k.id(36), k.id(37), k.id(47), k.id(48), k.id(61), k.id(62), k.id(72), k.id(73)],
    },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Son las dos; es la una; y cuarto / y media / menos cuarto.',
          '¿Qué hora es? — котра година; ¿A qué hora…? — a las …',
          'З точним часом — de la mañana / de la tarde / de la noche.',
          'Abre / cierra; de nueve a dos.',
        ),
      ],
    },
  ],
});
