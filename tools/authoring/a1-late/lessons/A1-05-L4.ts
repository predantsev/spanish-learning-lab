// A1-05-L4 — days of the week, el lunes / los lunes, months with en, full dates, cuándo,
// appointments (cita), reading calendar entries and listening to dates (O4, CV-03, CV-06).
import { Kit, S, combos, el, es, ex, hRule, hTranscript, plink, tableUk, ul, uk, DICTATION } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-05-L4', RULES);

const DW = 'date.days-of-week/written-form';
const DWR = 'date.days-of-week/reading-meaning';
const DWC = 'date.days-of-week/context-choice';
const EL = 'date.el-lunes/construction-use';
const ELC = 'date.el-lunes/context-choice';
const MW = 'date.months/written-form';
const MR = 'date.months/reading-meaning';
const MU = 'date.months/construction-use';
const FU = 'date.full-date/construction-use';
const FW = 'date.full-date/written-form';
const FR = 'date.full-date/reading-meaning';
const CW = 'question.word.cuando/written-form';
const CC = 'question.word.cuando/context-choice';
const CR = 'question.word.cuando/reading-meaning';
const AU = 'date.appointment/construction-use';
const AR = 'date.appointment/reading-meaning';
const RC = 'reading.calendar-appointment/reading-meaning';
const LD = 'listening.dates/listening-meaning';
const LDD = 'listening.dates/dictation';

type E = Array<[string, string]>;
const dayIns = (uk: string, model?: string): string => `Напиши іспанською день тижня: ${uk}.${model ? ` Зразок: ${model}.` : ''}`;
const monthIns = (uk: string, model?: string): string => `Напиши іспанською назву місяця: ${uk}.${model ? ` Зразок: ${model}.` : ''}`;
const enEl: [string, string] = ['', 'З днями тижня прийменник en не вживаємо: el lunes, los lunes.'];
const cuandoAcc = (q: string): [string, string] => [q.replace('Cuándo', 'Cuando'), 'У питанні cuándo пишеться зі знаком наголосу: ¿Cuándo…?'];

// ======================= days of the week
k.exact({ n: 1, role: 'supported', fam: 'a105.week', t: [DW], ins: dayIns('вівторок', 'понеділок — lunes'), acc: ['martes', 'el martes'] });
k.exact({ n: 2, role: 'supported', fam: 'a105.week', t: [DW], ins: dayIns('середа', 'субота — sábado'), acc: ['miércoles', 'el miércoles'], err: [['miercoles', 'Майже: miércoles пишеться зі знаком наголосу.']] });
k.exact({ n: 3, role: 'independent', fam: 'a105.week', t: [DW], ins: dayIns('четвер'), acc: ['jueves', 'el jueves'] });
k.exact({ n: 4, role: 'independent', fam: 'a105.week', t: [DW], ins: dayIns('субота'), acc: ['sábado', 'el sábado'], err: [['sabado', 'Майже: sábado пишеться зі знаком наголосу.']] });
k.choice({
  n: 5,
  role: 'independent',
  fam: 'a105.today',
  t: [DWC],
  ins: 'Обери правильне написання.',
  p: ['Hoy es ___.'],
  o: [
    ['Viernes', DWC, 'Дні тижня пишуться з малої літери: viernes.'],
    ['viernes', true],
  ],
  tr: 'Сьогодні п’ятниця.',
});
k.choice({ n: 6, role: 'independent', fam: 'a105.week', t: [DWR], ins: 'Що означає «domingo»?', o: [['Субота.', false], ['Неділя.', true], ['Понеділок.', false]] });
k.exact({ n: 7, role: 'delayed', fam: 'a105.week', t: [DW], ins: dayIns('неділя'), acc: ['domingo', 'el domingo'] });
k.choice({
  n: 8,
  role: 'delayed',
  fam: 'a105.week',
  t: [DWC],
  ins: 'Який день іде після miércoles? Обери.',
  o: [
    ['martes', DWC, 'Martes — вівторок, він іде перед miércoles.'],
    ['jueves', true],
    ['viernes', DWC, 'Viernes — п’ятниця; після середи йде четвер.'],
  ],
});
k.choice({
  n: 9,
  role: 'transfer',
  fam: 'a105.timetable',
  t: [DWR],
  ins: 'Прочитай розклад. Коли заняття з англійської?',
  p: ['Lunes: gimnasio · Miércoles: clase de inglés · Sábado: cine'],
  o: [
    ['У понеділок.', false],
    ['У середу.', true],
    ['У суботу.', false],
  ],
});
k.slots({
  n: 10,
  role: 'transfer',
  fam: 'a105.diary',
  t: [DW],
  ins: 'Перепиши речення повністю, вставивши дні тижня: «Сьогодні не понеділок, сьогодні вівторок».',
  p: ['Hoy no es ___, hoy es ___.'],
  tpl: ['Hoy no es ', S('s1'), ', hoy es ', S('s2'), '.'],
  slots: [
    { id: 's1', t: DW, acc: ['lunes'] },
    { id: 's2', t: DW, acc: ['martes'] },
  ],
});

// ======================= el lunes / los lunes (CV-03)
k.choice({
  n: 11,
  role: 'supported',
  fam: 'a105.class-day',
  t: [ELC],
  ins: 'Обери варіант зі значенням «У вівторок (цього тижня) я маю заняття». Зразок: El sábado voy al cine.',
  p: ['___ martes tengo clase.'],
  o: [
    ['El', true],
    ['En el', ELC, 'З днями тижня прийменник en не вживаємо: el martes.'],
    ['Los', ELC, 'Los martes — «щовівторка», а йдеться про один вівторок.'],
  ],
});
k.exact({
  n: 12,
  role: 'supported',
  fam: 'a105.work-day',
  t: [EL],
  ins: 'Переклади іспанською: «У понеділок я працюю вдома» (йдеться про один понеділок). Зразок: El sábado voy al cine.',
  acc: ['El lunes trabajo en casa.', 'El lunes yo trabajo en casa.', 'Trabajo en casa el lunes.', 'Yo trabajo en casa el lunes.'],
  err: [
    ['En el lunes trabajo en casa.', enEl[1]],
    ['En lunes trabajo en casa.', enEl[1]],
  ],
});
k.exact({
  n: 13,
  role: 'independent',
  fam: 'a105.gym',
  t: [EL],
  ins: 'Переклади іспанською: «Щоп’ятниці я ходжу в спортзал».',
  acc: ['Los viernes voy al gimnasio.', 'Los viernes yo voy al gimnasio.', 'Voy al gimnasio los viernes.', 'Yo voy al gimnasio los viernes.', 'Todos los viernes voy al gimnasio.', 'Voy al gimnasio todos los viernes.'],
  err: [
    ['El viernes voy al gimnasio.', 'El viernes — «у п’ятницю» (один раз). «Щоп’ятниці» — los viernes.'],
    ['En los viernes voy al gimnasio.', enEl[1]],
  ],
});
k.choice({
  n: 14,
  role: 'independent',
  fam: 'a105.today',
  t: [ELC],
  ins: 'Обери правильне речення зі значенням «Сьогодні четвер».',
  o: [
    ['Hoy es jueves.', true],
    ['Hoy es el jueves.', ELC, 'Після hoy es артикль перед днем тижня не ставимо: Hoy es jueves.'],
    ['Hoy es en jueves.', ELC, 'Після hoy es прийменник не потрібен: Hoy es jueves.'],
  ],
});
k.exact({
  n: 15,
  role: 'independent',
  fam: 'a105.weekend',
  t: [EL],
  ins: 'Запитай друга іспанською: «Що ти робиш у суботу?»',
  acc: ['¿Qué haces el sábado?', '¿Qué haces tú el sábado?', '¿El sábado qué haces?'],
  err: [
    ['¿Qué haces en el sábado?', enEl[1]],
    ['¿Qué haces el sabado?', 'Майже: sábado пишеться зі знаком наголосу.'],
  ],
});
k.choice({
  n: 16,
  role: 'independent',
  fam: 'a105.rest',
  t: [ELC],
  ins: 'Обери варіант зі значенням «Щонеділі я відпочиваю».',
  p: ['___ descanso.'],
  o: [
    ['El domingo', ELC, 'El domingo — одна неділя. «Щонеділі» — los domingos.'],
    ['Los domingos', true],
    ['En los domingos', ELC, 'З днями тижня прийменник en не вживаємо: los domingos.'],
  ],
});
k.exact({
  n: 17,
  role: 'delayed',
  fam: 'a105.exam',
  t: [EL],
  ins: 'Переклади іспанською: «У середу в мене іспит».',
  acc: ['El miércoles tengo un examen.', 'El miércoles tengo examen.', 'Tengo un examen el miércoles.', 'Tengo examen el miércoles.', 'El miércoles yo tengo un examen.', 'Yo tengo un examen el miércoles.'],
  err: [
    ['En el miércoles tengo un examen.', enEl[1]],
    ['El miercoles tengo un examen.', 'Майже: miércoles пишеться зі знаком наголосу.'],
  ],
});
k.choice({
  n: 18,
  role: 'delayed',
  fam: 'a105.park',
  t: [ELC],
  ins: 'Обери варіант зі значенням «Щосуботи ми гуляємо в парку».',
  p: ['___ paseamos en el parque.'],
  o: [
    ['Los sábados', true],
    ['El sábado', ELC, 'El sábado — одна субота. «Щосуботи» — los sábados.'],
    ['En los sábados', ELC, 'З днями тижня прийменник en не вживаємо: los sábados.'],
  ],
});
k.exact({
  n: 19,
  role: 'transfer',
  fam: 'a105.cinema-plan',
  t: [EL],
  ins: 'Переклади іспанською: «У четвер ми йдемо в кіно».',
  acc: ['El jueves vamos al cine.', 'Vamos al cine el jueves.', 'El jueves nosotros vamos al cine.', 'Nosotros vamos al cine el jueves.', 'El jueves nosotras vamos al cine.', 'Nosotras vamos al cine el jueves.'],
  err: [['En el jueves vamos al cine.', enEl[1]]],
});
k.exact({
  n: 20,
  role: 'transfer',
  fam: 'a105.family-lunch',
  t: [EL],
  ins: 'Напиши іспанською: «Щонеділі я обідаю з батьками».',
  acc: ['Los domingos como con mis padres.', 'Como con mis padres los domingos.', 'Los domingos yo como con mis padres.', 'Yo como con mis padres los domingos.', 'Todos los domingos como con mis padres.'],
  err: [
    ['El domingo como con mis padres.', 'El domingo — одна неділя. «Щонеділі» — los domingos.'],
    ['En los domingos como con mis padres.', enEl[1]],
  ],
});

// ======================= months, en + month / season
k.exact({ n: 21, role: 'supported', fam: 'a105.months', t: [MW], ins: monthIns('січень', 'травень — mayo'), acc: ['enero'] });
k.exact({
  n: 22,
  role: 'supported',
  fam: 'a105.birthday',
  t: [MU],
  ins: 'Впиши слово, щоб речення означало «Мій день народження в травні». Зразок: en verano — «влітку».',
  p: ['Mi cumpleaños es ___ mayo.'],
  acc: ['en'],
  err: [
    ['el', 'З назвою місяця артикль не потрібен: «у травні» — en mayo.'],
    ['a', '«У травні» — en mayo.'],
  ],
});
k.exact({ n: 23, role: 'independent', fam: 'a105.months', t: [MW], ins: monthIns('серпень'), acc: ['agosto'] });
k.exact({ n: 24, role: 'independent', fam: 'a105.months', t: [MW], ins: monthIns('вересень'), acc: ['septiembre', 'setiembre'] });
k.choice({ n: 25, role: 'independent', fam: 'a105.months', t: [MR], ins: 'Що означає «junio»?', o: [['Липень.', false], ['Червень.', true], ['Січень.', false]] });
k.exact({
  n: 26,
  role: 'independent',
  fam: 'a105.holidays',
  t: [MU],
  ins: 'Переклади іспанською: «У липні я відпочиваю».',
  acc: ['En julio descanso.', 'Descanso en julio.', 'En julio yo descanso.', 'Yo descanso en julio.'],
  err: [['Descanso julio.', 'Бракує en: «у липні» — en julio.']],
});
k.exact({ n: 27, role: 'delayed', fam: 'a105.months', t: [MW], ins: monthIns('грудень'), acc: ['diciembre'] });
k.slots({
  n: 28,
  role: 'delayed',
  fam: 'a105.summer',
  t: [MU],
  ins: 'Перепиши речення повністю, вставивши слово, щоб воно означало «Влітку ми їдемо на пляж».',
  p: ['___ verano vamos a la playa.'],
  tpl: [S('s1'), ' verano vamos a la playa.'],
  slots: [{ id: 's1', t: MU, acc: ['En'], err: [['El', 'З порою року вживаємо en: en verano — «влітку».']] }],
});
k.choice({
  n: 29,
  role: 'transfer',
  fam: 'a105.r-luis',
  t: [MR],
  ins: 'Прочитай. Коли день народження Луїса?',
  p: ['El cumpleaños de Luis es en marzo.'],
  o: [
    ['У травні.', false],
    ['У березні.', true],
    ['У листопаді.', false],
  ],
});
k.exact({
  n: 30,
  role: 'transfer',
  fam: 'a105.my-birthday',
  t: [MU],
  ins: 'Переклади іспанською: «Мій день народження в листопаді».',
  acc: ['Mi cumpleaños es en noviembre.'],
  err: [['Mi cumpleaños es el noviembre.', 'З назвою місяця — en: en noviembre.']],
});

// ======================= full date
const fdIns = (digits: string, model?: string): string => `Напиши дату словами (день/місяць): ${digits}.${model ? ` Зразок: ${model}.` : ''}`;
const deErr = (day: string, month: string): [string, string] => [`el ${day} ${month}`, `Між числом і місяцем потрібне de: el ${day} de ${month}.`];
k.exact({ n: 31, role: 'supported', fam: 'a105.dates', t: [FW], ins: fdIns('5/3', '12/10 → el doce de octubre'), acc: ['el cinco de marzo', 'cinco de marzo'], err: [deErr('cinco', 'marzo'), ['el tres de mayo', 'Спочатку день, потім місяць: 5/3 — п’яте березня, el cinco de marzo.']] });
k.exact({
  n: 32,
  role: 'supported',
  fam: 'a105.today',
  t: [FU],
  ins: 'Відповідай іспанською на питання ¿Qué día es hoy? Сьогодні вівторок, 6 листопада. Числа пиши словами. Зразок: Hoy es lunes, cinco de mayo.',
  acc: combos(['Hoy es martes, ', 'Hoy es martes '], ['', 'el '], ['seis de noviembre.']),
  err: [['Hoy es martes, seis noviembre.', 'Між числом і місяцем потрібне de: seis de noviembre.']],
});
k.exact({ n: 33, role: 'independent', fam: 'a105.dates', t: [FW], ins: fdIns('1/5'), acc: ['el uno de mayo', 'el primero de mayo', 'uno de mayo', 'primero de mayo'], err: [deErr('uno', 'mayo')] });
k.exact({ n: 34, role: 'independent', fam: 'a105.dates', t: [FW], ins: fdIns('24/12'), acc: ['el veinticuatro de diciembre', 'veinticuatro de diciembre'], err: [deErr('veinticuatro', 'diciembre'), ['el veinte y cuatro de diciembre', 'Числа від 16 до 29 пишуться одним словом: veinticuatro.']] });
k.choice({ n: 35, role: 'independent', fam: 'a105.dates', t: [FR], ins: 'Що означає «el 15 de agosto»?', o: [['15 квітня.', false], ['15 серпня.', true], ['5 серпня.', false]] });
k.exact({
  n: 36,
  role: 'independent',
  fam: 'a105.birthday',
  t: [FU],
  ins: 'Напиши іспанською: «Мій день народження — двадцятого квітня». Числа пиши словами.',
  acc: ['Mi cumpleaños es el veinte de abril.'],
  err: [['Mi cumpleaños es el veinte abril.', 'Між числом і місяцем потрібне de: el veinte de abril.'], ['Mi cumpleaños es en veinte de abril.', 'Перед датою — артикль el, а не en: el veinte de abril.']],
});
k.exact({ n: 37, role: 'delayed', fam: 'a105.dates', t: [FW], ins: fdIns('30/9'), acc: ['el treinta de septiembre', 'el treinta de setiembre', 'treinta de septiembre', 'treinta de setiembre'], err: [deErr('treinta', 'septiembre')] });
k.choice({
  n: 38,
  role: 'delayed',
  fam: 'a105.today',
  t: [FR],
  ins: 'Прочитай. Яка сьогодні дата?',
  p: ['Hoy es jueves, 3 de julio.'],
  o: [
    ['3 червня.', false],
    ['3 липня.', true],
    ['7 березня.', false],
  ],
});
k.exact({
  n: 39,
  role: 'transfer',
  fam: 'a105.weekend-date',
  t: [FU],
  ins: 'Відповідай іспанською на питання ¿Qué día es hoy? Сьогодні субота, 21 червня. Числа пиши словами.',
  acc: combos(['Hoy es sábado, ', 'Hoy es sábado '], ['', 'el '], ['veintiuno de junio.']),
  err: [['Hoy es sábado, veintiún de junio.', 'У даті число стоїть без іменника, тож повна форма: veintiuno de junio.']],
});
k.exact({
  n: 40,
  role: 'transfer',
  fam: 'a105.exam',
  t: [FU],
  ins: 'Напиши іспанською: «Іспит — чотирнадцятого січня». Числа пиши словами.',
  acc: ['El examen es el catorce de enero.'],
  err: [['El examen es el catorce enero.', 'Між числом і місяцем потрібне de: el catorce de enero.'], ['El examen es en catorce de enero.', 'Перед датою — артикль el, а не en: el catorce de enero.']],
});

// ======================= cuándo
k.exact({ n: 41, role: 'supported', fam: 'a105.meeting', t: [CW], ins: 'Впиши питальне слово «коли». Зразок: ¿Cuándo es el concierto?', p: ['¿___ es la reunión?'], acc: ['Cuándo'], err: [cuandoAcc('Cuándo')], tr: 'Коли нарада?' });
k.choice({
  n: 42,
  role: 'supported',
  fam: 'a105.exam',
  t: [CC],
  ins: 'Ти хочеш дізнатися, у який день іспит. Обери питальне слово.',
  p: ['¿___ es el examen?'],
  o: [
    ['Cuándo', true],
    ['Dónde', CC, 'Dónde — «де?». Про день питаємо cuándo.'],
    ['Cuánto', CC, 'Cuánto — «скільки?». Про день питаємо cuándo.'],
  ],
});
k.exact({ n: 43, role: 'independent', fam: 'a105.study-time', t: [CW], ins: 'Переклади іспанською: «Коли ти вивчаєш іспанську?»', acc: ['¿Cuándo estudias español?', '¿Cuándo estudias tú español?'], err: [cuandoAcc('¿Cuándo estudias español?')] });
k.exact({ n: 44, role: 'independent', fam: 'a105.concert', t: [CW], ins: 'Переклади іспанською: «Коли концерт?»', acc: ['¿Cuándo es el concierto?'], err: [cuandoAcc('¿Cuándo es el concierto?')] });
k.choice({
  n: 45,
  role: 'independent',
  fam: 'a105.meeting',
  t: [CC],
  ins: 'Відповідь: «El viernes». Яке питання підходить до цієї відповіді?',
  o: [
    ['¿Dónde es la reunión?', CC, 'Dónde питає про місце, а відповідь називає день.'],
    ['¿Cuándo es la reunión?', true],
    ['¿Cuánto cuesta?', CC, 'Cuánto cuesta питає про ціну, а відповідь називає день.'],
  ],
});
k.choice({
  n: 46,
  role: 'independent',
  fam: 'a105.cita-question',
  t: [CR],
  ins: 'Прочитай питання. Про що питають?',
  p: ['¿Cuándo es la cita?'],
  o: [
    ['Про місце запису.', false],
    ['Про день чи час запису.', true],
    ['Про ціну запису.', false],
  ],
});
k.exact({ n: 47, role: 'delayed', fam: 'a105.birthday', t: [CW], ins: 'Запитай друга іспанською: «Коли твій день народження?»', acc: ['¿Cuándo es tu cumpleaños?'], err: [cuandoAcc('¿Cuándo es tu cumpleaños?')] });
k.choice({
  n: 48,
  role: 'delayed',
  fam: 'a105.exam',
  t: [CC],
  ins: 'Ти хочеш дізнатися, у який день іспит. Обери питання.',
  o: [
    ['¿Qué hora es?', CC, '¿Qué hora es? — «котра година зараз?». Про день іспиту питаємо cuándo.'],
    ['¿Cuándo es el examen?', true],
    ['¿Dónde es el examen?', CC, 'Dónde питає про місце. Про день — cuándo.'],
  ],
});
k.exact({
  n: 49,
  role: 'transfer',
  fam: 'a105.trip',
  t: [CW],
  ins: 'Запитай друзів (vosotros) іспанською: «Коли ви їдете в Мадрид?»',
  acc: ['¿Cuándo vais a Madrid?', '¿Cuándo vais vosotros a Madrid?', '¿Cuándo vais vosotras a Madrid?'],
  err: [cuandoAcc('¿Cuándo vais a Madrid?')],
});
k.choice({
  n: 50,
  role: 'transfer',
  fam: 'a105.chat',
  t: [CR],
  ins: 'Прочитай переписку. Що хоче дізнатися Ана?',
  p: ['Ana: ¿Cuándo vamos al museo?', 'Pablo: El sábado.'],
  o: [
    ['Куди вони йдуть.', false],
    ['Коли вони йдуть до музею.', true],
    ['Скільки коштує музей.', false],
  ],
});

// ======================= appointments (cita)
k.exact({
  n: 51,
  role: 'supported',
  fam: 'a105.doctor',
  t: [AU],
  ins: 'Переклади іспанською: «У мене запис до лікаря». Зразок: Tengo una cita con el dentista.',
  acc: ['Tengo una cita con el médico.', 'Yo tengo una cita con el médico.', 'Tengo cita con el médico.'],
  err: [['Tengo una cita con el medico.', 'Майже: médico пишеться зі знаком наголосу.']],
});
k.slots({
  n: 52,
  role: 'supported',
  fam: 'a105.doctor',
  t: [AU],
  ins: 'Перепиши речення повністю: «Запис у четвер о п’ятій». Зразок: La cita es el martes a las diez.',
  p: ['La cita es ___ jueves ___ cinco.'],
  tpl: ['La cita es ', S('s1'), ' jueves ', S('s2'), ' cinco.'],
  slots: [
    { id: 's1', t: AU, acc: ['el'], err: [['en el', 'З днем тижня прийменник не потрібен: el jueves.']] },
    { id: 's2', t: AU, acc: ['a las'], err: [['las', 'Година події — з a: a las cinco.']] },
  ],
});
k.exact({
  n: 53,
  role: 'independent',
  fam: 'a105.meeting',
  t: [AU],
  ins: 'Напиши іспанською: «Нарада в понеділок о десятій».',
  acc: ['La reunión es el lunes a las diez.', 'La reunión es a las diez el lunes.', 'El lunes a las diez es la reunión.'],
  err: [['La reunión es en el lunes a las diez.', 'З днем тижня прийменник не потрібен: el lunes.'], ['La reunión es el lunes las diez.', 'Година події — з a: a las diez.']],
});
k.exact({
  n: 54,
  role: 'independent',
  fam: 'a105.doctor',
  t: [AU],
  ins: 'Запитай іспанською, у який день запис (cita).',
  acc: ['¿Cuándo es la cita?', '¿Cuándo es mi cita?', '¿Cuándo es tu cita?'],
  err: [cuandoAcc('¿Cuándo es la cita?')],
});
k.choice({
  n: 55,
  role: 'independent',
  fam: 'a105.dentist',
  t: [AR],
  ins: 'Прочитай. Коли запис до стоматолога?',
  p: ['Tengo una cita con el dentista el miércoles a las cuatro de la tarde.'],
  o: [
    ['У середу о 16:00.', true],
    ['У понеділок о 16:00.', false],
    ['У середу о 14:00.', false],
  ],
});
k.choice({
  n: 56,
  role: 'independent',
  fam: 'a105.meeting',
  t: [AR],
  ins: 'Прочитай відповідь. Що ти дізнаєшся про нараду?',
  p: ['—¿Cuándo es la reunión? —Es el viernes a las nueve y media.'],
  o: [
    ['Нарада в п’ятницю о 9:30.', true],
    ['Нарада у вівторок о 9:30.', false],
    ['Нарада в п’ятницю о 10:30.', false],
  ],
});
k.exact({
  n: 57,
  role: 'delayed',
  fam: 'a105.dentist',
  t: [AU],
  ins: 'Напиши іспанською: «У мене запис до стоматолога в п’ятницю о дев’ятій ранку».',
  acc: [
    'Tengo una cita con el dentista el viernes a las nueve de la mañana.',
    'El viernes tengo una cita con el dentista a las nueve de la mañana.',
    'El viernes a las nueve de la mañana tengo una cita con el dentista.',
    'Tengo cita con el dentista el viernes a las nueve de la mañana.',
  ],
  err: [['Tengo una cita con el dentista en el viernes a las nueve de la mañana.', 'З днем тижня прийменник не потрібен: el viernes.']],
});
k.choice({
  n: 58,
  role: 'delayed',
  fam: 'a105.doctor',
  t: [AR],
  ins: 'Прочитай. О котрій запис до лікаря?',
  p: ['La cita con el médico es el martes a las once y cuarto.'],
  o: [
    ['О 11:15.', true],
    ['О 11:45.', false],
    ['О 10:45.', false],
  ],
});
k.exact({
  n: 59,
  role: 'transfer',
  fam: 'a105.colleague',
  t: [AU],
  ins: 'Колега питає: «¿Cuándo es la reunión?» Відповідай іспанською: у вівторок об одинадцятій.',
  acc: ['Es el martes a las once.', 'La reunión es el martes a las once.', 'El martes a las once.'],
  err: [['Es en el martes a las once.', 'З днем тижня прийменник не потрібен: el martes.'], ['Es el martes las once.', 'Година події — з a: a las once.']],
});
k.choice({
  n: 60,
  role: 'transfer',
  fam: 'a105.note',
  t: [AR],
  ins: 'Прочитай записку. Що треба зробити Марті?',
  p: ['Marta: tienes cita con el dentista el lunes a las cinco.'],
  o: [
    ['Піти до стоматолога в понеділок о п’ятій.', true],
    ['Піти до лікаря в понеділок о п’ятій.', false],
    ['Піти до стоматолога в п’ятницю.', false],
  ],
});

// ======================= further typed instances (productive bank: 2 supported / 4 independent / 4 held-out per skill)
k.exact({ n: 72, role: 'independent', fam: 'a105.week', t: [DW], ins: dayIns('понеділок'), acc: ['lunes', 'el lunes'] });
k.slots({
  n: 73,
  role: 'independent',
  fam: 'a105.today',
  t: [DW],
  ins: 'Перепиши речення повністю, щоб воно означало «Сьогодні середа».',
  p: ['Hoy es ___.'],
  tpl: ['Hoy es ', S('s1'), '.'],
  slots: [{ id: 's1', t: DW, acc: ['miércoles'], err: [['miercoles', 'Майже: miércoles пишеться зі знаком наголосу.']] }],
});
k.slots({
  n: 74,
  role: 'delayed',
  fam: 'a105.workweek',
  t: [DW],
  ins: 'Перепиши речення повністю, вставивши дні тижня: «Я працюю з понеділка до п’ятниці».',
  p: ['Trabajo de ___ a ___.'],
  tpl: ['Trabajo de ', S('s1'), ' a ', S('s2'), '.'],
  slots: [
    { id: 's1', t: DW, acc: ['lunes'] },
    { id: 's2', t: DW, acc: ['viernes'] },
  ],
});
k.exact({
  n: 75,
  role: 'transfer',
  fam: 'a105.chat-day',
  t: [DW],
  ins: 'Друг питає: «¿Qué día es hoy?» Сьогодні неділя. Відповідай іспанською.',
  acc: ['Hoy es domingo.', 'Es domingo.', 'Domingo.'],
});
k.exact({
  n: 76,
  role: 'supported',
  fam: 'a105.rest',
  t: [EL],
  ins: 'Переклади іспанською: «У неділю я відпочиваю» (йдеться про одну неділю). Зразок: El sábado voy al cine.',
  acc: ['El domingo descanso.', 'Descanso el domingo.', 'El domingo yo descanso.', 'Yo descanso el domingo.'],
  err: [['En el domingo descanso.', enEl[1]]],
});
k.slots({
  n: 77,
  role: 'independent',
  fam: 'a105.class-day',
  t: [EL],
  ins: 'Перепиши речення повністю, щоб воно означало «Щосереди в мене заняття з англійської».',
  p: ['___ miércoles tengo clase de inglés.'],
  tpl: [S('s1'), ' miércoles tengo clase de inglés.'],
  slots: [{ id: 's1', t: EL, acc: ['Los'], err: [['El', 'El miércoles — одна середа. «Щосереди» — los miércoles.'], ['En los', enEl[1]]] }],
});
k.exact({
  n: 78,
  role: 'independent',
  fam: 'a105.dinner-out',
  t: [EL],
  ins: 'Переклади іспанською: «У п’ятницю ми вечеряємо в ресторані».',
  acc: ['El viernes cenamos en un restaurante.', 'Cenamos en un restaurante el viernes.', 'El viernes nosotros cenamos en un restaurante.', 'Nosotros cenamos en un restaurante el viernes.', 'El viernes nosotras cenamos en un restaurante.'],
  err: [['En el viernes cenamos en un restaurante.', enEl[1]]],
});
k.slots({
  n: 79,
  role: 'transfer',
  fam: 'a105.family-routine',
  t: [EL],
  ins: 'Перепиши речення повністю, щоб воно означало «Щочетверга Ана вечеряє з батьками».',
  p: ['___ jueves Ana cena con sus padres.'],
  tpl: [S('s1'), ' jueves Ana cena con sus padres.'],
  slots: [{ id: 's1', t: EL, acc: ['Los'], err: [['El', 'El jueves — один четвер. «Щочетверга» — los jueves.'], ['En los', enEl[1]]] }],
});
k.exact({
  n: 80,
  role: 'independent',
  fam: 'a105.seasons',
  t: [MU],
  ins: 'Переклади іспанською: «Взимку я багато читаю».',
  acc: ['En invierno leo mucho.', 'Leo mucho en invierno.', 'En invierno yo leo mucho.', 'Yo leo mucho en invierno.'],
  err: [['El invierno leo mucho.', 'З порою року вживаємо en: en invierno — «взимку».']],
});
k.exact({ n: 81, role: 'transfer', fam: 'a105.month-order', t: [MW], ins: 'Напиши іспанською назву місяця, який іде після квітня (abril).', acc: ['mayo'] });
k.slots({
  n: 82,
  role: 'independent',
  fam: 'a105.concert',
  t: [FU],
  ins: 'Перепиши речення повністю, щоб воно означало «Концерт десятого червня».',
  p: ['El concierto es ___ diez ___ junio.'],
  tpl: ['El concierto es ', S('s1'), ' diez ', S('s2'), ' junio.'],
  slots: [
    { id: 's1', t: FU, acc: ['el'], err: [['en', 'Перед датою — артикль el, а не en: el diez de junio.']] },
    { id: 's2', t: FU, acc: ['de'] },
  ],
});
k.exact({ n: 83, role: 'delayed', fam: 'a105.dates', t: [FW], ins: fdIns('2/2'), acc: ['el dos de febrero', 'dos de febrero'], err: [deErr('dos', 'febrero')] });
k.exact({ n: 84, role: 'supported', fam: 'a105.work-time', t: [CW], ins: 'Впиши питальне слово «коли». Зразок: ¿Cuándo es la reunión?', p: ['¿___ trabajas?'], acc: ['Cuándo'], err: [cuandoAcc('Cuándo')], tr: 'Коли ти працюєш?' });
k.exact({ n: 85, role: 'independent', fam: 'a105.work-time', t: [CW], ins: 'Переклади іспанською: «Коли Ана працює?»', acc: ['¿Cuándo trabaja Ana?', '¿Ana cuándo trabaja?'], err: [cuandoAcc('¿Cuándo trabaja Ana?')] });
k.slots({
  n: 86,
  role: 'independent',
  fam: 'a105.cinema',
  t: [CW],
  ins: 'Перепиши питання повністю, вставивши слово «коли»: «Коли ти йдеш у кіно?»',
  p: ['¿___ vas al cine?'],
  tpl: ['¿', S('s1'), ' vas al cine?'],
  slots: [{ id: 's1', t: CW, acc: ['Cuándo'], err: [cuandoAcc('Cuándo')] }],
});
k.exact({ n: 87, role: 'delayed', fam: 'a105.class-time', t: [CW], ins: 'Переклади іспанською: «Коли заняття?»', acc: ['¿Cuándo es la clase?'], err: [cuandoAcc('¿Cuándo es la clase?')] });
k.exact({ n: 88, role: 'transfer', fam: 'a105.rest-chat', t: [CW], ins: 'Напиши другові іспанською: «Коли ти відпочиваєш?»', acc: ['¿Cuándo descansas?', '¿Cuándo descansas tú?'], err: [cuandoAcc('¿Cuándo descansas?')] });
k.exact({
  n: 89,
  role: 'independent',
  fam: 'a105.doctor',
  t: [AU],
  ins: 'Напиши іспанською: «Запис у середу о пів на четверту (3:30)».',
  acc: ['La cita es el miércoles a las tres y media.', 'Es el miércoles a las tres y media.'],
  err: [['La cita es en el miércoles a las tres y media.', 'З днем тижня прийменник не потрібен: el miércoles.'], ['La cita es el miércoles a las cuatro y media.', 'Las cuatro y media — це 4:30. 3:30 — las tres y media.']],
});
k.slots({
  n: 90,
  role: 'independent',
  fam: 'a105.dentist',
  t: [AU],
  ins: 'Перепиши речення повністю, щоб воно означало «У мене запис до стоматолога в понеділок».',
  p: ['Tengo una cita ___ el dentista ___ lunes.'],
  tpl: ['Tengo una cita ', S('s1'), ' el dentista ', S('s2'), ' lunes.'],
  slots: [
    { id: 's1', t: AU, acc: ['con'] },
    { id: 's2', t: AU, acc: ['el'], err: [['en el', 'З днем тижня прийменник не потрібен: el lunes.']] },
  ],
});
k.slots({
  n: 91,
  role: 'delayed',
  fam: 'a105.meeting',
  t: [AU],
  ins: 'Перепиши речення повністю, щоб воно означало «Нарада в четвер о дев’ятій ранку».',
  p: ['La reunión es ___ jueves ___ nueve de la mañana.'],
  tpl: ['La reunión es ', S('s1'), ' jueves ', S('s2'), ' nueve de la mañana.'],
  slots: [
    { id: 's1', t: AU, acc: ['el'], err: [['en el', 'З днем тижня прийменник не потрібен: el jueves.']] },
    { id: 's2', t: AU, acc: ['a las'], err: [['las', 'Година події — з a: a las nueve.']] },
  ],
});
k.exact({
  n: 92,
  role: 'transfer',
  fam: 'a105.clinic-call',
  t: [AU],
  ins: 'Ти телефонуєш у клініку. Скажи іспанською: «У мене запис у вівторок о п’ятій».',
  acc: ['Tengo una cita el martes a las cinco.', 'El martes a las cinco tengo una cita.', 'Tengo cita el martes a las cinco.', 'Tengo una cita el martes a las cinco de la tarde.'],
  err: [['Tengo una cita en el martes a las cinco.', 'З днем тижня прийменник не потрібен: el martes.']],
});

// ======================= reading: calendar entries and notes (CV-06)
const R1 = 'Dentista – martes 3 de marzo, 17:00';
const R2 = 'Lunes 9: clase de inglés, 18:00 · Miércoles 11: reunión, 10:00 · Viernes 13: cine con Ana, 20:30';
const R3 = '¡Hola, Marta! La cita con el médico es el jueves a las nueve y media, no a las diez. ¡Hasta luego! Pablo';
const R4 = 'Cumpleaños de Lucía: sábado 24 de mayo, a las seis de la tarde, en el parque.';
const rd = (n: number, role: 'independent' | 'delayed', fam: string, text: string, q: string, o: Array<[string, boolean]>): string =>
  k.choice({ n, role, fam, t: [RC], ins: `Прочитай запис. ${q}`, p: [text], o });
rd(61, 'independent', 'a105.r-dentist', R1, 'Коли візит до стоматолога?', [['У вівторок, 3 березня, о 17:00.', true], ['У вівторок, 3 травня, о 17:00.', false], ['У середу, 3 березня, о 7:00.', false]]);
rd(62, 'independent', 'a105.r-dentist', R1, 'О котрій візит, якщо сказати по-розмовному?', [['О п’ятій вечора (las cinco de la tarde).', true], ['О сьомій вечора.', false], ['О п’ятій ранку.', false]]);
rd(63, 'independent', 'a105.r-week', R2, 'Коли нарада?', [['У понеділок, 9-го, о 18:00.', false], ['У середу, 11-го, о 10:00.', true], ['У п’ятницю, 13-го, о 20:30.', false]]);
rd(64, 'independent', 'a105.r-week', R2, 'Що заплановано на п’ятницю?', [['Заняття з англійської.', false], ['Кіно з Аною.', true], ['Нарада.', false]]);
rd(65, 'independent', 'a105.r-note', R3, 'О котрій запис до лікаря?', [['О 10:00.', false], ['О 9:30.', true], ['О 9:00.', false]]);
rd(66, 'independent', 'a105.r-note', R3, 'У який день запис?', [['У четвер.', true], ['У вівторок.', false], ['У п’ятницю.', false]]);
rd(67, 'delayed', 'a105.r-birthday', R4, 'Коли день народження Лусії?', [['У суботу, 24 травня, о 18:00.', true], ['У неділю, 24 травня, о 16:00.', false], ['У суботу, 4 травня, о 18:00.', false]]);
rd(68, 'delayed', 'a105.r-birthday', R4, 'Де святкують?', [['У кафе.', false], ['У парку.', true], ['Удома в Лусії.', false]]);

// ======================= listening: dates and appointments
const L1 = 'La cita es el miércoles a las once.';
const L2 = 'Mi cumpleaños es el doce de octubre.';
const l1 = k.clip({ id: 'clip.a1-05.dates.cita', kind: 'sentence', es: L1, uk: 'Запис у середу об одинадцятій.', t: [LD], fam: 'a105.l-cita' });
const l2 = k.clip({ id: 'clip.a1-05.dates.cumple', kind: 'sentence', es: L2, uk: 'Мій день народження — дванадцятого жовтня.', t: [LD, LDD], fam: 'a105.l-birthday' });
k.choice({ n: 69, role: 'independent', fam: 'a105.l-cita', t: [LD], clips: [l1], ins: 'Послухай. Коли запис?', o: [['У середу об 11:00.', true], ['У понеділок об 11:00.', false], ['У середу о 12:00.', false]], hints: [hTranscript([LD], L1)] });
k.choice({ n: 70, role: 'independent', fam: 'a105.l-birthday', t: [LD], clips: [l2], ins: 'Послухай. Коли день народження?', o: [['2 жовтня.', false], ['12 жовтня.', true], ['12 серпня.', false]], hints: [hTranscript([LD], L2)] });
k.exact({
  n: 71,
  role: 'independent',
  fam: 'a105.l-birthday',
  t: [LDD],
  clips: [l2],
  ins: 'Необов’язковий диктант: послухай і запиши речення. Число можна записати цифрами. Великі літери й крапка не оцінюються.',
  acc: [L2, 'Mi cumpleaños es el 12 de octubre.'],
  pol: DICTATION,
  noRule: true,
  bad: 'Поки що ні. Порівняй свій запис зі зразком у підказці «Показати відповідь»: зверни увагу на кожне слово й на знаки наголосу.',
  hints: [hRule([LDD], 'Пиши так, як чуєш. Орфографічна помилка тут не означає, що ти не зрозумів запис: розуміння перевіряє окреме завдання.')],
});

k.material({
  id: 'material.a1-05.dates',
  topic: 'A1-05-L4',
  title: 'Дні тижня, місяці й дати',
  blocks: [
    tableUk(
      ['українською', 'español'],
      [
        ['понеділок — неділя', 'lunes, martes, miércoles, jueves, viernes, sábado, domingo'],
        ['січень — червень', 'enero, febrero, marzo, abril, mayo, junio'],
        ['липень — грудень', 'julio, agosto, septiembre, octubre, noviembre, diciembre'],
      ],
    ),
    el('El sábado voy al cine. Los lunes trabajo en casa.', 'en mayo, en verano', 'el cinco de mayo; ¿Qué día es hoy?', '¿Cuándo es la cita? — El martes a las diez.'),
    plink('Потренувати дні, місяці й дати', [DW, EL, MW, FW, AU], 'written', 12),
  ],
  linked: [DW, EL, MW, MU, FW, FU, CW, AU],
});

export default k.build({
  title: 'Дні, дати й запис на зустріч',
  termEs: 'los días, los meses y las citas',
  summary: 'Називаємо дні тижня й місяці, кажемо дату, питаємо «коли?» й домовляємося про запис. Урок поділено на три кроки, до яких можна повертатися окремо.',
  objectives: ['A1-05-O4'],
  cv: ['CV-03', 'CV-06'],
  situations: ['time-appointments-transport'],
  minutes: 20,
  introduces: ['date.days-of-week', 'date.el-lunes', 'date.months', 'date.full-date', 'question.word.cuando', 'date.appointment', 'reading.calendar-appointment', 'listening.dates'],
  revisits: ['ortho.capitalization', 'ortho.interrogative-accent', 'question.word-order', 'time.frequency.expressions', 'number.0-15', 'number.16-29', 'number.30-99', 'time.event.a-las', 'time.clock.hours', 'time.clock.de-la-manana', 'present.ser', 'tener.possession', 'present.ir'],
  steps: [
    {
      kind: 'explanation',
      title: 'Крок 1. Дні тижня: el lunes, los lunes',
      blocks: [
        uk('Дні тижня: lunes, martes, miércoles, jueves, viernes, sábado, domingo. Усі чоловічого роду й пишуться з малої літери. Тиждень в Іспанії починається з понеділка.'),
        uk('«У понеділок» — el lunes, без прийменника. «Щопонеділка» — los lunes. Lunes–viernes у множині не змінюються, а sábado і domingo додають -s: los sábados. Після hoy es артикля немає.'),
        ex('El sábado voy al cine.', 'У суботу я йду в кіно.'),
        ex('Los lunes trabajo en casa.', 'Щопонеділка я працюю вдома.'),
        ex('Hoy es martes.', 'Сьогодні вівторок.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 1: практика зі зразком', tasks: [k.id(1), k.id(2), k.id(11), k.id(12), k.id(76)] },
    { kind: 'independent-practice', title: 'Крок 1: самостійно', tasks: [k.id(3), k.id(5), k.id(6), k.id(14), k.id(13), k.id(16)] },
    {
      kind: 'explanation',
      title: 'Крок 2. Місяці й дата',
      blocks: [
        uk('Місяці теж пишуться з малої літери. «У травні» — en mayo, «влітку» — en verano: з місяцями й порами року вживаємо en.'),
        uk('Дата: el + число + de + місяць. Перше число — el uno або el primero. Питання — ¿Qué día es hoy? Після дня тижня артикль перед числом можна не ставити.'),
        ex('Mi cumpleaños es en junio.', 'Мій день народження в червні.'),
        ex('El concierto es el cinco de mayo.', 'Концерт п’ятого травня.'),
        ex('¿Qué día es hoy? — Hoy es lunes, cinco de mayo.', 'Яке сьогодні число? — Сьогодні понеділок, п’яте травня.'),
        uk('У цифровому записі спочатку день, потім місяць: 5/3 — п’яте березня (el cinco de marzo).'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 2: практика зі зразком', tasks: [k.id(21), k.id(22), k.id(31), k.id(32)] },
    { kind: 'independent-practice', title: 'Крок 2: самостійно', tasks: [k.id(23), k.id(25), k.id(26), k.id(33), k.id(35), k.id(36)] },
    {
      kind: 'explanation',
      title: 'Крок 3. ¿Cuándo? Запис на зустріч',
      blocks: [
        uk('Cuándo — «коли?»: питає про день, дату чи загальний час. Пишеться зі знаком наголосу. Про точну годину зручніше питати ¿A qué hora…?'),
        uk('Cita — «запис, домовлена зустріч» (до лікаря, стоматолога). Reunión — «нарада, зустріч». Час зустрічі: день + a las + година.'),
        ex('¿Cuándo es la reunión? — El lunes.', 'Коли нарада? — У понеділок.'),
        ex('Tengo una cita con el dentista el martes a las diez.', 'У мене запис до стоматолога у вівторок о десятій.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 3: практика зі зразком', tasks: [k.id(41), k.id(84), k.id(42), k.id(51), k.id(52)] },
    { kind: 'independent-practice', title: 'Крок 3: самостійно', tasks: [k.id(43), k.id(45), k.id(46), k.id(53), k.id(54), k.id(55)] },
    { kind: 'reading', title: 'Читаємо календар і записки', blocks: [es(R1), es(R2), es(R3)], tasks: [k.id(61), k.id(62), k.id(63), k.id(64), k.id(65), k.id(66)] },
    { kind: 'listening', title: 'Послухай: дати й запис', required: false, clips: [l1, l2], tasks: [k.id(69), k.id(70), k.id(71)] },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика',
      required: false,
      tasks: [k.id(4), k.id(72), k.id(73), k.id(15), k.id(77), k.id(78), k.id(24), k.id(80), k.id(34), k.id(82), k.id(44), k.id(85), k.id(86), k.id(56), k.id(89), k.id(90)],
    },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Дні й місяці — з малої літери: lunes, mayo.',
          'El lunes — «у понеділок», los lunes — «щопонеділка»; без en.',
          'En mayo, en verano. Дата: el cinco de mayo.',
          '¿Cuándo es la cita? — El martes a las diez.',
        ),
      ],
    },
  ],
});
