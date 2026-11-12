// A1-06-L4 — wishes and simple plans in two steps: querer forms, querer + noun / infinitive,
// future time expressions, a plan with the present tense, like/need/want and wish/plan contrasts,
// invitations and replies (O4/O5, CV-01, CV-06).
import { Kit, S, ex, hTranscript, plink, tableEs, ul, uk, vgap, vslot } from '../lib.ts';
import type { Outcome, TaskRole } from '../../../content/types.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-06-L4', RULES);

const QF = 'present.querer/written-form';
const QFC = 'present.querer/context-choice';
const QN = 'querer.noun/construction-use';
const QNC = 'querer.noun/context-choice';
const QI = 'querer.infinitive/construction-use';
const QIW = 'querer.infinitive/written-form';
const FE = 'time.future-expressions/reading-meaning';
const FEC = 'time.future-expressions/context-choice';
const PL = 'time.plan.present-for-future/construction-use';
const PLC = 'time.plan.present-for-future/context-choice';
const PLR = 'time.plan.present-for-future/reading-meaning';
const LNW = 'contrast.like-need-want/context-choice';
const LNWR = 'contrast.like-need-want/reading-meaning';
const WP = 'contrast.wish-plan/context-choice';
const WPR = 'contrast.wish-plan/reading-meaning';
const IV = 'formula.invitation/phrase-recall';
const IVR = 'formula.invitation/reading-meaning';
const IVL = 'formula.invitation/listening-meaning';

type E = Array<[string, string] | [string, string, Record<string, Outcome>]>;
function x(n: number, role: TaskRole, fam: string, t: string, ins: string, acc: string[], err: E = [], p?: string, tr?: string): string {
  return k.exact({ n, role, fam, t: [t], ins, acc, ...(err.length > 0 ? { err } : {}), ...(p ? { p: [p] } : {}), ...(tr ? { tr } : {}) });
}
const ieErr = (s: string, right: string): [string, string] => [s, `У querer основа змінюється: quier- (e → ie), крім nosotros і vosotros. Тут: ${right}.`];
const infErr = (s: string, inf: string): [string, string] => [s, `Після quiero — інфінітив (словникова форма): ${inf}.`];
const goingTo = (s: string): [string, string, Record<string, 'unresolved'>] => [s, 'Конструкцію ir a + інфінітив ми ще не вивчали: тут потрібен теперішній час зі словом майбутнього.', { [PL]: 'unresolved' }];

// ======================= querer forms
vgap(k, { n: 1, role: 'supported', fam: 'a106.cafe', t: [QF], verb: 'querer', person: 0, model: 'querer → tú quieres', s: 'Yo ___ un café. (querer)', tr: 'Я хочу каву.', extra: [ieErr('quero', 'quiero')] });
vgap(k, { n: 2, role: 'supported', fam: 'a106.home', t: [QF], verb: 'querer', person: 3, model: 'querer → nosotros queremos (без зміни основи)', s: 'Nosotros ___ una casa grande. (querer)', tr: 'Ми хочемо великий будинок.', extra: [['quieremos', 'У формі nosotros основа не змінюється: queremos.']] });
vgap(k, { n: 3, role: 'independent', fam: 'a106.drinks', t: [QF], verb: 'querer', person: 1, s: '¿___ agua? (querer, tú)', tr: 'Хочеш води?', extra: [ieErr('queres', 'quieres')] });
vgap(k, { n: 4, role: 'independent', fam: 'a106.travel', t: [QF], verb: 'querer', person: 2, s: 'Mi hermana ___ viajar a Italia. (querer)', tr: 'Моя сестра хоче поїхати в Італію.', extra: [ieErr('quere', 'quiere')] });
vgap(k, { n: 5, role: 'independent', fam: 'a106.cinema', t: [QF], verb: 'querer', person: 4, s: '¿Vosotros ___ ir al cine? (querer)', tr: 'Ви хочете піти в кіно?', extra: [['quieréis', 'У формі vosotros основа не змінюється: queréis.']] });
vgap(k, { n: 6, role: 'independent', fam: 'a106.home', t: [QF], verb: 'querer', person: 5, s: 'Mis padres ___ vivir en Valencia. (querer)', tr: 'Мої батьки хочуть жити у Валенсії.', extra: [ieErr('queren', 'quieren')] });
vgap(k, { n: 7, role: 'delayed', fam: 'a106.cafe', t: [QF], verb: 'querer', person: 2, s: '¿Usted ___ un té? (querer)', tr: 'Ви хочете чаю?', extra: [ieErr('quere', 'quiere')] });
vgap(k, { n: 8, role: 'delayed', fam: 'a106.study', t: [QF], verb: 'querer', person: 3, s: 'Nosotras ___ aprender inglés. (querer)', tr: 'Ми хочемо вивчити англійську.', extra: [['quieremos', 'У формі nosotros основа не змінюється: queremos.']] });
vgap(k, { n: 9, role: 'transfer', fam: 'a106.kids-t', t: [QF], verb: 'querer', person: 5, s: 'Los niños ___ ir a la playa. (querer)', tr: 'Діти хочуть піти на пляж.', extra: [ieErr('queren', 'quieren')] });
k.slots({
  n: 10,
  role: 'transfer',
  fam: 'a106.snack-t',
  t: [QF],
  ins: 'Перепиши речення повністю, вставивши форми querer: «Я хочу сік, а Пабло хоче каву».',
  p: ['Yo ___ un zumo y Pablo ___ un café. (querer)'],
  tpl: ['Yo ', S('s1'), ' un zumo y Pablo ', S('s2'), ' un café.'],
  slots: [vslot('s1', QF, 'querer', 0, [ieErr('quero', 'quiero')]), vslot('s2', QF, 'querer', 2, [ieErr('quere', 'quiere')])],
});
k.choice({ n: 11, role: 'independent', fam: 'a106.cinema', t: [QFC], ins: 'Обери правильну форму.', p: ['Nosotros ___ ir al teatro.'], o: [['quieremos', QFC, 'У формі nosotros основа не змінюється: queremos.'], ['queremos', true], ['quieren', QFC, 'Quieren — форма для ellos / ellas / ustedes.']], tr: 'Ми хочемо піти в театр.' });
k.choice({ n: 12, role: 'delayed', fam: 'a106.drinks', t: [QFC], ins: 'Обери правильну форму.', p: ['¿Tú ___ agua?'], o: [['quieres', true], ['queres', QFC, 'Основа змінюється: e → ie, quieres.'], ['quiere', QFC, 'Quiere — він / вона / usted.']] });

// ======================= querer + noun
x(13, 'supported', 'a106.cafe', QN, 'Скажи іспанською: «Я хочу каву». Зразок: Quiero un té.', ['Quiero un café.', 'Yo quiero un café.', 'Quiero café.'], [['Me quiero un café.', 'Querer — звичайне дієслово з підметом: quiero, без займенника me.']]);
x(14, 'supported', 'a106.drinks', QN, 'Запитай друга іспанською: «Хочеш води?» Зразок: ¿Quieres un café?', ['¿Quieres agua?', '¿Tú quieres agua?', '¿Quieres un poco de agua?'], [ieErr('¿Queres agua?', 'quieres')]);
x(15, 'independent', 'a106.home', QN, 'Переклади іспанською: «Ми хочемо великий будинок».', ['Queremos una casa grande.', 'Nosotros queremos una casa grande.', 'Nosotras queremos una casa grande.'], [['Queremos una grande casa.', 'Прикметник grande тут стоїть після іменника: una casa grande.']]);
x(16, 'independent', 'a106.pets', QN, 'Переклади іспанською: «Моя донька хоче собаку».', ['Mi hija quiere un perro.'], [ieErr('Mi hija quere un perro.', 'quiere')]);
x(17, 'independent', 'a106.cafe', QN, 'Запитай друзів (vosotros) іспанською: «Хочете чаю?»', ['¿Queréis un té?', '¿Queréis té?', '¿Vosotros queréis un té?'], [['¿Quieréis un té?', 'У формі vosotros основа не змінюється: queréis.']]);
x(18, 'independent', 'a106.gift', QN, 'Переклади іспанською: «Я хочу нову машину».', ['Quiero un coche nuevo.', 'Yo quiero un coche nuevo.'], [ieErr('Quero un coche nuevo.', 'quiero')]);
x(19, 'delayed', 'a106.sweets', QN, 'Переклади іспанською: «Діти хочуть шоколаду».', ['Los niños quieren chocolate.', 'Los niños quieren un chocolate.'], [ieErr('Los niños queren chocolate.', 'quieren')]);
x(20, 'delayed', 'a106.reading', QN, 'Переклади іспанською: «Ти хочеш книжку?»', ['¿Quieres un libro?', '¿Tú quieres un libro?'], [ieErr('¿Queres un libro?', 'quieres')]);
x(21, 'transfer', 'a106.bakery-t', QN, 'Подруга питає, що купити в пекарні. Відповідай іспанською: «Я хочу хліб і два круасани» — круасан: cruasán.', ['Quiero pan y dos cruasanes.', 'Yo quiero pan y dos cruasanes.'], [ieErr('Quero pan y dos cruasanes.', 'quiero')]);
x(22, 'transfer', 'a106.flat-t', QN, 'Ви шукаєте житло. Напиши ріелторові іспанською: «Ми хочемо квартиру в центрі».', ['Queremos un piso en el centro.', 'Nosotros queremos un piso en el centro.', 'Nosotras queremos un piso en el centro.'], [['Quieremos un piso en el centro.', 'У формі nosotros основа не змінюється: queremos.']]);
k.choice({ n: 23, role: 'independent', fam: 'a106.cafe', t: [QNC], ins: 'Ти в кафе і хочеш кави. Обери, що сказати.', o: [['Quiero un café, por favor.', true], ['Me gusta un café, por favor.', QNC, 'Me gusta — «мені подобається». Бажання — quiero.'], ['Me quiero un café.', QNC, 'Querer — без займенника me: quiero.']] });
k.choice({ n: 24, role: 'delayed', fam: 'a106.drinks', t: [QNC], ins: 'Ти пропонуєш гостеві воду. Обери питання.', o: [['¿Te gusta agua?', QNC, 'Ти пропонуєш, а не питаєш про смаки: ¿Quieres agua?'], ['¿Quieres agua?', true]] });

// ======================= querer + infinitive
x(25, 'supported', 'a106.study', QIW, 'Впиши дієслово aprender у потрібній формі: «Я хочу вивчити іспанську». Зразок: Quiero viajar.', ['aprender'], [infErr('aprendo', 'aprender')], 'Quiero ___ español.');
x(26, 'supported', 'a106.cinema', QI, 'Запитай друга іспанською: «Хочеш піти в кіно?» Зразок: ¿Quieres ir a la playa?', ['¿Quieres ir al cine?', '¿Tú quieres ir al cine?'], [infErr('¿Quieres vas al cine?', 'ir'), ['¿Quieres ir a el cine?', 'Злиття: a + el = al — ir al cine.']]);
x(27, 'independent', 'a106.home', QI, 'Переклади іспанською: «Ми хочемо жити в Мадриді».', ['Queremos vivir en Madrid.', 'Nosotros queremos vivir en Madrid.', 'Nosotras queremos vivir en Madrid.'], [infErr('Queremos vivimos en Madrid.', 'vivir')]);
x(28, 'independent', 'a106.rest', QIW, 'Впиши дієслово descansar у потрібній формі: «Тато хоче відпочити».', ['descansar'], [infErr('descansa', 'descansar')], 'Mi padre quiere ___.');
x(29, 'independent', 'a106.kitchen', QI, 'Переклади іспанською: «Я хочу приготувати вечерю».', ['Quiero cocinar la cena.', 'Yo quiero cocinar la cena.', 'Quiero preparar la cena.'], [infErr('Quiero cocino la cena.', 'cocinar')]);
k.slots({
  n: 30,
  role: 'independent',
  fam: 'a106.travel',
  t: [QIW],
  ins: 'Перепиши речення повністю, вставивши дієслово viajar у потрібній формі: «Мої друзі хочуть подорожувати».',
  p: ['Mis amigos quieren ___.'],
  tpl: ['Mis amigos quieren ', S('s1'), '.'],
  slots: [{ id: 's1', t: QIW, acc: ['viajar'], err: [infErr('viajan', 'viajar')] }],
});
x(31, 'delayed', 'a106.dance', QI, 'Переклади іспанською: «Ана хоче танцювати».', ['Ana quiere bailar.'], [infErr('Ana quiere baila.', 'bailar')]);
x(32, 'delayed', 'a106.swim', QIW, 'Впиши дієслово nadar у потрібній формі: «Хочете поплавати?» (vosotros)', ['nadar'], [infErr('nadáis', 'nadar')], '¿Queréis ___?');
x(33, 'transfer', 'a106.course-t', QI, 'Напиши в анкеті мовної школи іспанською: «Я хочу говорити іспанською з друзями».', ['Quiero hablar español con mis amigos.', 'Yo quiero hablar español con mis amigos.'], [infErr('Quiero hablo español con mis amigos.', 'hablar')]);
x(34, 'transfer', 'a106.weekend-wish-t', QI, 'Напиши другові іспанською: «На вихідних я хочу відпочити».', ['El fin de semana quiero descansar.', 'Quiero descansar el fin de semana.', 'Este fin de semana quiero descansar.', 'Quiero descansar este fin de semana.'], [['El fin de semana quiero descanso.', 'Descanso тут можна прочитати як іменник («відпочинок»), тож це не помилка. Але очікувана модель — quiero + інфінітив: quiero descansar.', { [QI]: 'unresolved' }]]);

// ======================= future expressions (recognition)
k.choice({ n: 35, role: 'independent', fam: 'a106.time-words', t: [FE], ins: 'Що означає «pasado mañana»?', o: [['Учора.', false], ['Післязавтра.', true], ['Сьогодні вранці.', false]] });
k.choice({ n: 36, role: 'independent', fam: 'a106.time-words', t: [FE], ins: 'Що означає «la semana que viene»?', o: [['Наступного тижня.', true], ['Минулого тижня.', false], ['Щотижня.', false]] });
k.choice({ n: 37, role: 'independent', fam: 'a106.time-words', t: [FEC], ins: 'Сьогодні понеділок. Ти йдеш у кіно сьогодні ввечері. Обери вираз, який сам по собі означає «сьогодні ввечері».', p: ['___ voy al cine.'], o: [['Esta noche', true], ['Por la noche', FEC, 'Por la noche — «увечері»: саме по собі не каже, що це сьогодні. «Сьогодні ввечері» — esta noche.'], ['Mañana', FEC, 'Mañana — «завтра».']] });
k.choice({ n: 38, role: 'delayed', fam: 'a106.time-words', t: [FE], ins: 'Що означає «este fin de semana»?', o: [['На цих вихідних.', true], ['Щовихідних.', false], ['Наприкінці місяця.', false]] });
k.choice({ n: 39, role: 'delayed', fam: 'a106.time-words', t: [FEC], ins: 'Сьогодні середа. Зустріч — у четвер. Обери слово.', p: ['La reunión es ___.'], o: [['mañana', true], ['pasado mañana', FEC, 'Pasado mañana — «післязавтра» (у п’ятницю).'], ['hoy', FEC, 'Hoy — «сьогодні».']] });

// ======================= plan: present + future time word
x(40, 'supported', 'a106.work', PL, 'Напиши план іспанською: «Завтра я працюю вдома». Зразок: El sábado voy a la playa.', ['Mañana trabajo en casa.', 'Trabajo en casa mañana.', 'Mañana yo trabajo en casa.'], [goingTo('Mañana voy a trabajar en casa.'), ['Mañana trabajar en casa.', 'Потрібна особова форма: trabajo.']]);
x(41, 'supported', 'a106.friends', PL, 'Напиши план іспанською: «Сьогодні ввечері я вечеряю з друзями». Зразок: Mañana trabajo en casa.', ['Esta noche ceno con mis amigos.', 'Ceno con mis amigos esta noche.', 'Esta noche yo ceno con mis amigos.'], [goingTo('Esta noche voy a cenar con mis amigos.')]);
x(42, 'independent', 'a106.beach', PL, 'Напиши план іспанською: «У суботу ми йдемо на пляж».', ['El sábado vamos a la playa.', 'Vamos a la playa el sábado.', 'El sábado nosotros vamos a la playa.', 'El sábado nosotras vamos a la playa.'], [['En el sábado vamos a la playa.', 'З днем тижня прийменник не потрібен: el sábado.']]);
x(43, 'independent', 'a106.study', PL, 'Напиши план іспанською: «Післязавтра я маю іспит».', ['Pasado mañana tengo un examen.', 'Pasado mañana tengo examen.', 'Tengo un examen pasado mañana.', 'Tengo examen pasado mañana.']);
x(44, 'independent', 'a106.travel', PL, 'Напиши план іспанською: «Наступного тижня Ана їде до Севільї».', ['La semana que viene Ana va a Sevilla.', 'Ana va a Sevilla la semana que viene.', 'La próxima semana Ana va a Sevilla.', 'Ana va a Sevilla la próxima semana.']);
k.slots({
  n: 45,
  role: 'independent',
  fam: 'a106.family',
  t: [PL],
  ins: 'Перепиши речення повністю з потрібним словом часу: «Цими вихідними ми відвідуємо батьків» — visitamos a mis padres.',
  p: ['___ visitamos a mis padres.'],
  tpl: [S('s1'), ' visitamos a mis padres.'],
  slots: [{ id: 's1', t: PL, acc: ['Este fin de semana'], err: [['Los fines de semana', 'Los fines de semana — «щовихідних» (звичка). Про план на ці вихідні — este fin de semana.']] }],
});
x(46, 'delayed', 'a106.cinema', PL, 'Напиши план іспанською: «У п’ятницю ввечері я йду в кіно».', ['El viernes por la noche voy al cine.', 'Voy al cine el viernes por la noche.', 'El viernes voy al cine por la noche.'], [goingTo('El viernes por la noche voy a ir al cine.')]);
x(47, 'delayed', 'a106.work', PL, 'Напиши план іспанською так, щоб саме речення показувало, що це сьогодні: «Сьогодні після обіду Пабло працює».', ['Esta tarde Pablo trabaja.', 'Pablo trabaja esta tarde.'], [['Por la tarde Pablo trabaja.', 'Por la tarde саме по собі не каже, що це сьогодні. «Сьогодні після обіду» — esta tarde.']]);
x(48, 'transfer', 'a106.message-plan-t', PL, 'Напиши другові в чаті іспанською: «Завтра я їду в Мадрид».', ['Mañana voy a Madrid.', 'Voy a Madrid mañana.', 'Mañana yo voy a Madrid.'], [goingTo('Mañana voy a ir a Madrid.')]);
x(49, 'transfer', 'a106.next-monday-t', PL, 'Напиши колегам іспанською: «Наступного понеділка ми починаємо о дев’ятій» — починати: empezar (empezamos).', ['El próximo lunes empezamos a las nueve.', 'Empezamos a las nueve el próximo lunes.', 'El lunes que viene empezamos a las nueve.']);
k.choice({ n: 50, role: 'independent', fam: 'a106.beach', t: [PLC], ins: 'Яке речення — план на конкретний день?', o: [['Los sábados voy a la playa.', PLC, 'Los sábados — «щосуботи»: це звичка, а не план.'], ['El sábado voy a la playa.', true]] });
k.choice({ n: 51, role: 'independent', fam: 'a106.r-plan', t: [PLR], ins: 'Прочитай повідомлення. Коли Луїс працює вдома?', p: ['Luis: Hoy trabajo en la oficina, pero mañana trabajo en casa.'], o: [['Сьогодні.', false], ['Завтра.', true], ['Щодня.', false]] });
k.choice({ n: 52, role: 'delayed', fam: 'a106.r-plan', t: [PLR], ins: 'Прочитай. Що Марта робить на цих вихідних?', p: ['Marta: Este fin de semana voy a Toledo con mi hermana.'], o: [['Їде до Толедо із сестрою.', true], ['Хоче колись поїхати до Толедо.', false], ['Щовихідних їздить до Толедо.', false]] });

// ======================= contrasts: like / need / want; wish / plan
k.choice({ n: 53, role: 'independent', fam: 'a106.lnw', t: [LNW], ins: 'Ти дуже втомлений і без кави не обійдешся. Що скажеш?', o: [['Me gusta el café.', LNW, 'Me gusta — «мені подобається» (загалом).'], ['Necesito un café.', true], ['Quiero un perro.', LNW, 'Це про інше бажання.']] });
k.choice({ n: 54, role: 'independent', fam: 'a106.lnw', t: [LNW], ins: 'Ти розповідаєш, що любиш каву взагалі. Обери речення.', o: [['Me gusta el café.', true], ['Necesito un café.', LNW, 'Necesito — «мені потрібно» (зараз).'], ['Quiero un café.', LNW, 'Quiero — «хочу» (бажання зараз).']] });
k.choice({ n: 55, role: 'delayed', fam: 'a106.lnw-read', t: [LNWR], ins: 'Прочитай. Що означає речення?', p: ['Necesito un paraguas.'], o: [['Мені подобаються парасольки.', false], ['Мені потрібна парасолька.', true], ['Я хочу купити парасольку колись.', false]] });
k.choice({ n: 56, role: 'independent', fam: 'a106.lnw-read', t: [LNWR], ins: 'Прочитай. Що означає речення?', p: ['Quiero un helado.'], o: [['Я хочу морозиво.', true], ['Мені потрібне морозиво.', false], ['Я люблю морозиво загалом.', false]], tr: 'helado — морозиво' });
k.choice({ n: 57, role: 'independent', fam: 'a106.wp', t: [WP], ins: 'Ти вже купив квитки на суботу. Обери речення, яке це передає.', o: [['Quiero ir a Toledo.', WP, 'Quiero ir — бажання; воно не каже, що поїздку вже вирішено й квитки куплено.'], ['El sábado voy a Toledo.', true]] });
k.choice({ n: 58, role: 'delayed', fam: 'a106.wp', t: [WP], ins: 'Ти мрієш про Італію, але нічого не плануєш. Обери речення.', o: [['Quiero viajar a Italia.', true], ['El lunes viajo a Italia.', WP, 'Це вже план із конкретним днем.']] });
k.choice({ n: 59, role: 'independent', fam: 'a106.wp-read', t: [WPR], ins: 'Прочитай. Що передає речення: бажання чи вже вирішений план?', p: ['Quiero viajar a Madrid.'], o: [['Бажання: речення не каже, чи поїздку вже вирішено.', true], ['Вирішений план на конкретний день.', false]] });
k.choice({ n: 60, role: 'delayed', fam: 'a106.wp-read', t: [WPR], ins: 'Прочитай. Це план чи лише бажання?', p: ['Esta tarde ceno con Ana.'], o: [['Лише бажання.', false], ['План: сьогодні після обіду / ввечері вечеря з Аною.', true]] });

// ======================= invitations
x(61, 'supported', 'a106.invite', IV, 'Запроси друга іспанською: «Хочеш піти в театр у суботу?» Зразок: ¿Quieres ir al cine el sábado?', ['¿Quieres ir al teatro el sábado?', '¿El sábado quieres ir al teatro?'], [['¿Quieres ir a el teatro el sábado?', 'Злиття: a + el = al — al teatro.']]);
x(62, 'independent', 'a106.invite', IV, 'Друг запрошує тебе в кіно, і ти погоджуєшся. Відповідай одним словом іспанською: «Гаразд, домовились!»', ['¡Vale!', 'Vale.', 'Vale'], []);
x(63, 'independent', 'a106.invite', IV, 'Відмовся ввічливо іспанською: «Шкода, у суботу я працюю».', ['Lo siento, el sábado trabajo.', 'Lo siento, trabajo el sábado.', 'Lo siento. El sábado trabajo.'], [['Perdón, el sábado trabajo.', 'Щоб відмовитися із жалем, кажуть Lo siento.', { [IV]: 'unresolved' }]]);
x(64, 'independent', 'a106.invite', IV, 'Запропонуй інший день іспанською: «Іншим разом, гаразд?»', ['Otro día, ¿vale?', '¿Otro día, vale?', 'Otro día, ¿de acuerdo?']);
k.choice({ n: 65, role: 'independent', fam: 'a106.r-invite', t: [IVR], ins: 'Прочитай повідомлення. Що пропонує Ана?', p: ['Ana: ¿Quieres ir a la playa mañana?'], o: [['Піти завтра на пляж.', true], ['Піти сьогодні на пляж.', false], ['Піти в кіно.', false]] });
k.choice({ n: 66, role: 'delayed', fam: 'a106.r-invite', t: [IVR], ins: 'Прочитай відповідь. Пабло погоджується?', p: ['Pablo: Lo siento, mañana trabajo. Otro día, ¿vale?'], o: [['Так, погоджується.', false], ['Ні, він працює й пропонує інший день.', true]] });
const L1 = '¿Quieres ir al cine el sábado? —¡Claro! ¡Genial!';
const L2 = '¿Queréis cenar en casa esta noche? —Lo siento, esta noche trabajo.';
const l1 = k.clip({ id: 'clip.a1-06.invitation.cine', kind: 'text', es: L1, uk: '— Хочеш піти в кіно в суботу? — Звісно! Чудово!', t: [IVL], fam: 'a106.l-invite-yes' });
const l2 = k.clip({ id: 'clip.a1-06.invitation.cena', kind: 'text', es: L2, uk: '— Хочете повечеряти вдома сьогодні ввечері? — Шкода, сьогодні ввечері я працюю.', t: [IVL], fam: 'a106.l-invite-no' });
k.choice({ n: 67, role: 'independent', fam: 'a106.l-invite-yes', t: [IVL], clips: [l1], ins: 'Послухай. Друг погоджується піти в кіно?', o: [['Так.', true], ['Ні.', false], ['Пропонує інший день.', false]], hints: [hTranscript([IVL], L1)] });
k.choice({ n: 68, role: 'independent', fam: 'a106.l-invite-no', t: [IVL], clips: [l2], ins: 'Послухай. Чому людина відмовляється?', o: [['Вона працює сьогодні ввечері.', true], ['Вона не любить вечеряти вдома.', false], ['Вона вже повечеряла.', false]], hints: [hTranscript([IVL], L2)] });

k.material({
  id: 'material.a1-06.wishes-plans',
  topic: 'A1-06-L4',
  title: 'Бажання, плани й запрошення',
  blocks: [
    tableEs(['persona', 'querer'], [['yo', 'quiero'], ['tú', 'quieres'], ['él / ella / usted', 'quiere'], ['nosotros / nosotras', 'queremos'], ['vosotros / vosotras', 'queréis'], ['ellos / ellas / ustedes', 'quieren']]),
    uk('Quiero + річ / інфінітив — бажання. План — теперішній час + слово майбутнього: mañana, esta tarde, esta noche, el sábado, la semana que viene.'),
    uk('Запрошення: ¿Quieres + інфінітив? — ¡Vale! / ¡Claro! / Lo siento, … Otro día, ¿vale?'),
    plink('Потренувати querer і плани', [QF, QN, QI, PL], 'written', 12),
  ],
  linked: [QF, QN, QI, PL, IV],
});

export default k.build({
  title: 'Чого я хочу і що планую',
  termEs: 'querer y los planes',
  summary: 'Спершу бажання: querer (e → ie) + річ або дія. Потім плани: теперішній час зі словами майбутнього (mañana, el sábado, esta noche). Розрізняємо «подобається / потрібно / хочу» і «хочу / план», запрошуємо й відповідаємо.',
  objectives: ['A1-06-O4', 'A1-06-O5'],
  cv: ['CV-01', 'CV-06'],
  situations: ['routine-study-leisure', 'food-shopping'],
  minutes: 20,
  introduces: ['present.querer', 'querer.noun', 'querer.infinitive', 'time.future-expressions', 'time.plan.present-for-future', 'contrast.like-need-want', 'contrast.wish-plan', 'formula.invitation'],
  revisits: ['present.preferir', 'gustar.infinitive', 'necesitar.noun', 'gustar.agreement', 'date.el-lunes', 'time.parts-of-day', 'present.ir', 'formula.apology', 'present.regular-er.plural'],
  steps: [
    {
      kind: 'explanation',
      title: 'Крок 1. Querer: чого я хочу',
      blocks: [
        uk('Querer — «хотіти». Як і в preferir, e в основі змінюється на ie, крім nosotros і vosotros: quiero, quieres, quiere, queremos, queréis, quieren.'),
        uk('Після querer — річ (Quiero un té) або дія в інфінітиві (Quiero viajar). У кафе ввічливіше: ¿Me pone un té, por favor?'),
        uk('Не плутай: Me gusta el té — люблю чай загалом; Necesito un té — мені потрібен чай; Quiero un té — хочу чаю зараз.'),
        ex('Quiero un té.', 'Я хочу чаю.'),
        ex('¿Quieres un café?', 'Хочеш кави?'),
        ex('Queremos viajar a Italia.', 'Ми хочемо поїхати в Італію.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 1: практика зі зразком', tasks: [k.id(1), k.id(2), k.id(13), k.id(14), k.id(25), k.id(26)] },
    { kind: 'independent-practice', title: 'Крок 1: самостійно', tasks: [k.id(11), k.id(3), k.id(4), k.id(23), k.id(15), k.id(16), k.id(27), k.id(28), k.id(53), k.id(54)] },
    {
      kind: 'explanation',
      title: 'Крок 2. План: теперішній час + слово майбутнього',
      blocks: [
        uk('Про певний, уже вирішений план говоримо теперішнім часом і додаємо слово майбутнього: mañana — «завтра», pasado mañana — «післязавтра», esta tarde — «сьогодні після обіду», esta noche — «сьогодні ввечері», este fin de semana, el sábado, la semana que viene, el próximo lunes.'),
        uk('Бажання ≠ план: Quiero ir a Toledo — лише хочу; El sábado voy a Toledo — уже вирішено.'),
        ex('Mañana estudio en casa.', 'Завтра я навчаюся вдома.'),
        ex('El domingo comemos con mis padres.', 'У неділю ми обідаємо з батьками.'),
        uk('Запросити: ¿Quieres ir al cine el sábado? — ¡Vale! / ¡Claro! / ¡Genial! Відмовитися: Lo siento, el sábado trabajo. Otro día, ¿vale?'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 2: практика зі зразком', tasks: [k.id(40), k.id(41), k.id(61)] },
    { kind: 'independent-practice', title: 'Крок 2: самостійно', tasks: [k.id(35), k.id(36), k.id(37), k.id(50), k.id(42), k.id(43), k.id(44), k.id(45), k.id(57), k.id(59), k.id(62), k.id(63), k.id(64)] },
    { kind: 'independent-practice', title: 'Читаємо повідомлення', tasks: [k.id(51), k.id(65), k.id(56)] },
    { kind: 'listening', title: 'Послухай: запрошення', required: false, clips: [l1, l2], tasks: [k.id(67), k.id(68)] },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика',
      required: false,
      tasks: [k.id(5), k.id(6), k.id(17), k.id(18), k.id(29), k.id(30)],
    },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Quiero, quieres, quiere, quieren — з ie; queremos, queréis — без зміни.',
          'Quiero + річ / інфінітив — бажання.',
          'План: Mañana trabajo en casa. El sábado voy a la playa.',
          '¿Quieres…? — ¡Vale! / Lo siento, … Otro día, ¿vale?',
        ),
      ],
    },
  ],
});
