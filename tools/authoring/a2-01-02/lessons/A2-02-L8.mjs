// A2-02-L8 — read, compare and describe a familiar choice: algo / alguien, double negation with nada / nadie,
// reading and listening to descriptions/comparisons, writing a choice with a reason.
import { EX, LINK, LIST_UK, UK, choice, clip, dictation, gap, lesson as mkLesson, open, rubric, step } from '../lib.mjs';

const L = 'A2-02-L8';
const AA = 'pron.algo-alguien/context-choice';
const AA_R = 'pron.algo-alguien/reading-meaning';
const DNC = 'neg.double-negation/construction-use';
const DNW = 'neg.double-negation/written-form';
const RD = 'reading.description-comparison/reading-meaning';
const WC = 'writing.choice-description/construction-use';
const LIS = 'listening.description-comparison/listening-meaning';
const LIS_D = 'listening.description-comparison/dictation';
const C1 = 'clip.a2-02.l8.agency-flats';
const C2 = 'clip.a2-02.l8.shop-fridges';
const C3 = 'clip.a2-02.l8.short-choice';

const R = {
  aa: 'Algo — «щось» (про речі), alguien — «хтось» (про людей): ¿Quieres algo? ¿Hay alguien en casa? Заперечні пари: nada — «нічого», nadie — «ніхто».',
  dn: 'Якщо nada чи nadie стоїть після дієслова, перед дієсловом потрібне no: No quiero nada. No veo a nadie. Якщо nadie стоїть перед дієсловом, no не додаємо: Nadie viene (не *Nadie no viene). Nadie у ролі «кого?» — з a: No conozco a nadie.',
  rd: 'Читаючи опис чи порівняння, шукаємо, про що йдеться, чим відрізняються варіанти й котрий підходить за умовою.',
  wc: 'Опишіть два варіанти, порівняйте їх (más … que, tan … como, mejor) і поясніть вибір словом porque.',
};

const TR = {
  [C1]: 'Buenos días, le llamo de la agencia de pisos. Tenemos dos pisos para usted. El piso de la calle Mayor es más grande y tiene terraza, pero es más caro: cuesta novecientos euros. El piso de la calle del Sol es más pequeño, pero muy luminoso y más tranquilo. Cuesta setecientos euros. Y no hay nadie en el piso: puede verlo mañana.',
  [C2]: '—Buenas tardes. Busco una nevera para un piso pequeño. —Esta blanca es pequeña y barata, pero no es tan moderna como la negra. —¿Y la negra es mejor? —Sí, es mejor, pero cuesta cien euros más. —Vale, prefiero la blanca: no necesito una nevera tan grande.',
  [C3]: 'Prefiero el piso pequeño porque es más tranquilo y más luminoso.',
};

const dnw = (id, role, family, es, uk, a, err, full, model) =>
  gap(L, { id, role, family, t: DNW, ask: `${model ? 'Подивіться на зразок. ' : ''}Впишіть no, nada або nadie.`, model, es, uk, a, err, rule: R.dn, full });
const dnc = (id, role, family, es, uk, acc, err, model) =>
  open(L, { id, role, family, ts: [DNC], ask: `${model ? 'Подивіться на зразок. ' : ''}Перепишіть речення в запереченні: alguien → nadie, algo → nada.`, model, es, uk, a: acc, err: err.map(([x, fb]) => [x, { [DNC]: 'incorrect' }, fb]), rule: R.dn, full: acc[0], ok: `Правильно: ${acc[0]}`, no: `Можлива відповідь: ${acc[0]}` });

export const tasks = [
  // algo / alguien
  choice(L, { id: 'T01', role: 'supported', family: 'family-home', ts: [AA], ask: 'Ви чуєте шум у квартирі й питаєте, чи хтось є вдома. Оберіть слово.', es: '¿Hay ___ en casa?', opts: [['alguien', 'c'], ['algo', 'x', 'Питаєте про людину — alguien.']], rule: R.aa, ref: '¿Hay alguien en casa?', ok: 'Правильно: про людину — alguien.', no: 'Про людину — alguien: ¿Hay alguien en casa?' }),
  choice(L, { id: 'T02', role: 'independent', family: 'food-cafe', ts: [AA], ask: 'Офіціант питає, чи ви хочете ще щось. Оберіть слово.', es: '¿Quieren ___ más?', opts: [['algo', 'c'], ['alguien', 'x', 'Ідеться про їжу чи напої, тобто речі — algo.']], rule: R.aa, ref: '¿Quieren algo más?', ok: 'Правильно: про речі — algo.', no: 'Про речі — algo: ¿Quieren algo más?' }),
  choice(L, { id: 'T03', role: 'delayed', family: 'home', ts: [AA], ask: 'Оберіть слово.', es: '___ llama a la puerta. ¿Abres tú?', opts: [['Alguien', 'c'], ['Algo', 'x', 'У двері стукає людина — alguien.']], rule: R.aa, ref: 'Alguien llama a la puerta. ¿Abres tú?', ok: 'Правильно: людина — alguien.', no: 'Людина — alguien.' }),
  choice(L, { id: 'T04', role: 'transfer', family: 'messages', ts: [AA], ask: 'Допишіть повідомлення: оберіть слово.', es: '¡Hola, Ana! Voy al supermercado. ¿Necesitas ___?', opts: [['algo', 'c'], ['alguien', 'x', 'У супермаркеті купують речі — algo.']], rule: R.aa, ref: '¡Hola, Ana! Voy al supermercado. ¿Necesitas algo?', ok: 'Правильно: про речі — algo.', no: 'Про речі — algo.' }),
  choice(L, { id: 'T05', role: 'independent', family: 'family-home', ts: [AA_R], ask: 'Прочитайте діалог. Чи є хтось у кімнаті?', es: '—¿Hay alguien en la habitación? —No, no hay nadie.', opts: [['ні, нікого', 'c'], ['так, хтось є', 'x', 'No hay nadie — «нікого немає».'], ['там щось є', 'x', 'Питають про людей (alguien), відповідь — nadie.']], rule: R.aa, ok: 'Правильно: no hay nadie — нікого немає.', no: 'No hay nadie — нікого немає.' }),
  choice(L, { id: 'T06', role: 'delayed', family: 'shop', ts: [AA_R], ask: 'Прочитайте діалог. Що купує покупець?', es: '—¿Quiere algo más? —No, nada más, gracias.', opts: [['більше нічого', 'c'], ['ще щось', 'x', 'Nada más — «більше нічого».'], ['когось шукає', 'x', 'Algo і nada — про речі, не про людей.']], rule: R.aa, ok: 'Правильно: nada más — більше нічого.', no: 'Nada más — більше нічого.' }),
  choice(L, { id: 'T07', role: 'transfer', family: 'travel', ts: [AA_R], ask: 'Прочитайте повідомлення в готелі. Що сталося?', es: 'Hay algo para usted en el hotel: un paquete de su familia.', opts: [['для гостя щось передали', 'c'], ['гостя хтось чекає', 'x', 'Algo — річ (un paquete), а не людина.'], ['для гостя нічого немає', 'x', 'Hay algo — «є щось».']], rule: R.aa, ok: 'Правильно: algo = un paquete.', no: 'Hay algo — є щось: пакунок від родини.' }),

  // double negation — written-form
  dnw('T11', 'supported', 'family-home', 'No veo a ___ en el parque.', 'Я нікого не бачу в парку.', 'nadie', [['nada', 'Про людей — nadie.']], 'No veo a nadie en el parque.', [['No quiero nada, gracias.', 'Я нічого не хочу, дякую.']]),
  dnw('T12', 'supported', 'shop', '___ quiero nada, gracias.', 'Я нічого не хочу, дякую.', 'No', [['Nada', 'Nada стоїть після дієслова, тому перед дієсловом потрібне no.']], 'No quiero nada, gracias.', [['Nadie viene hoy.', 'Сьогодні ніхто не приходить.']]),
  dnw('T13', 'independent', 'home', 'En el piso no hay ___ ahora.', 'Зараз у квартирі нікого немає.', 'nadie', [['alguien', 'У запереченні — nadie.']], 'En el piso no hay nadie ahora.'),
  dnw('T14', 'independent', 'free-time', '___ viene al cine conmigo hoy.', 'Сьогодні ніхто не йде зі мною в кіно.', 'Nadie', [['Nadie no', 'Коли nadie стоїть перед дієсловом, no не додаємо.']], 'Nadie viene al cine conmigo hoy.'),
  dnw('T15', 'independent', 'food-cafe', 'No necesito ___ más, gracias.', 'Мені більше нічого не треба, дякую.', 'nada', [['algo', 'У запереченні — nada.']], 'No necesito nada más, gracias.'),
  dnw('T16', 'independent', 'family-home', 'No conozco a ___ en este barrio.', 'Я нікого не знаю в цьому районі.', 'nadie', [['nada', 'Про людей — nadie.']], 'No conozco a nadie en este barrio.'),
  dnw('T17', 'delayed', 'shop', 'En la nevera no hay ___: tenemos que ir al supermercado.', 'У холодильнику нічого немає: треба йти в супермаркет.', 'nada', [['nadie', 'Про речі — nada.']], 'En la nevera no hay nada: tenemos que ir al supermercado.'),
  dnw('T18', 'delayed', 'home', '___ vive en el tercer piso.', 'На третьому поверсі ніхто не живе.', 'Nadie', [['No nadie', 'Коли nadie стоїть перед дієсловом, no не додаємо.']], 'Nadie vive en el tercer piso.'),
  dnw('T19', 'transfer', 'messages', '¡Hola, Pablo! Hoy ___ hago nada: estoy en casa.', 'Привіт, Пабло! Сьогодні я нічого не роблю: я вдома.', 'no', [['nada', 'Nada вже стоїть після дієслова; перед дієсловом — no.']], '¡Hola, Pablo! Hoy no hago nada: estoy en casa.'),
  dnw('T20', 'transfer', 'work-study', 'Son las ocho y en la oficina no hay ___.', 'Восьма година, і в офісі нікого немає.', 'nadie', [['nada', 'Про людей — nadie.']], 'Son las ocho y en la oficina no hay nadie.'),

  // double negation — construction-use
  dnc('T21', 'supported', 'family-home', 'Veo a alguien en el jardín.', 'Я нікого не бачу в саду.', ['No veo a nadie en el jardín.'], [['Veo a nadie en el jardín.', 'Nadie після дієслова — перед дієсловом потрібне no.'], ['No veo nadie en el jardín.', 'Nadie у ролі «кого?» — з a: no veo a nadie.']], [['Quiero algo. → No quiero nada.', 'Я щось хочу. → Я нічого не хочу.']]),
  dnc('T22', 'supported', 'home', 'Alguien vive en este piso.', 'У цій квартирі ніхто не живе.', ['Nadie vive en este piso.', 'No vive nadie en este piso.'], [['Nadie no vive en este piso.', 'Коли nadie стоїть перед дієсловом, no не додаємо.']], [['Alguien llama. → Nadie llama. / No llama nadie.', 'Хтось дзвонить. → Ніхто не дзвонить.']]),
  dnc('T23', 'independent', 'shop', 'Compro algo en esta tienda.', 'Я нічого не купую в цій крамниці.', ['No compro nada en esta tienda.'], [['Compro nada en esta tienda.', 'Nada після дієслова — перед дієсловом потрібне no.']]),
  dnc('T24', 'independent', 'family-home', 'Alguien me llama por la noche.', 'Мені ніхто не дзвонить уночі.', ['Nadie me llama por la noche.', 'No me llama nadie por la noche.'], [['Nadie no me llama por la noche.', 'Коли nadie стоїть перед дієсловом, no не додаємо.']]),
  dnc('T25', 'independent', 'free-time', 'Hay algo interesante en la tele.', 'По телевізору немає нічого цікавого.', ['No hay nada interesante en la tele.'], [['Hay nada interesante en la tele.', 'Nada після дієслова — перед дієсловом потрібне no.']]),
  dnc('T26', 'independent', 'home', 'Conozco a alguien en mi barrio nuevo.', 'Я нікого не знаю в моєму новому районі.', ['No conozco a nadie en mi barrio nuevo.'], [['No conozco nadie en mi barrio nuevo.', 'Nadie у ролі «кого?» — з a: no conozco a nadie.'], ['Conozco a nadie en mi barrio nuevo.', 'Перед дієсловом потрібне no.']]),
  dnc('T27', 'delayed', 'food-cafe', 'Quiero algo de beber.', 'Я нічого не хочу пити.', ['No quiero nada de beber.'], [['Quiero nada de beber.', 'Перед дієсловом потрібне no.']]),
  dnc('T28', 'delayed', 'family-home', 'Alguien sabe la dirección.', 'Ніхто не знає адреси.', ['Nadie sabe la dirección.', 'No sabe nadie la dirección.'], [['Nadie no sabe la dirección.', 'Коли nadie стоїть перед дієсловом, no не додаємо.']]),
  dnc('T29', 'transfer', 'messages', '¡Hola, Ana! Tengo algo para la cena.', 'Привіт, Ано! У мене нічого немає на вечерю.', ['¡Hola, Ana! No tengo nada para la cena.'], [['¡Hola, Ana! Tengo nada para la cena.', 'Перед дієсловом потрібне no.']]),
  dnc('T30', 'transfer', 'travel', 'En el hotel alguien habla español.', 'У готелі ніхто не говорить іспанською.', ['En el hotel nadie habla español.', 'En el hotel no habla nadie español.', 'En el hotel no habla español nadie.'], [['En el hotel nadie no habla español.', 'Коли nadie стоїть перед дієсловом, no не додаємо.']]),

  // reading
  choice(L, { id: 'T31', role: 'supported', family: 'flat-ads', ts: [RD], ask: 'Прочитайте оголошення. Яка квартира дешевша?', es: 'Piso A: tres habitaciones, terraza, muy céntrico. 950 euros al mes. Piso B: dos habitaciones, luminoso y tranquilo, a quince minutos del centro. 700 euros al mes.', opts: [['квартира B', 'c'], ['квартира A', 'x', 'A коштує 950 євро — дорожча.'], ['обидві однакові', 'x', 'Ціни різні: 950 і 700 євро.']], rule: R.rd, ok: 'Правильно: 700 євро менше, ніж 950.', no: 'Квартира B дешевша: 700 євро.' }),
  choice(L, { id: 'T32', role: 'independent', family: 'flat-ads', ts: [RD], ask: 'Прочитайте те саме оголошення. Вам потрібна тераса. Яка квартира підходить?', es: 'Piso A: tres habitaciones, terraza, muy céntrico. 950 euros al mes. Piso B: dos habitaciones, luminoso y tranquilo, a quince minutos del centro. 700 euros al mes.', opts: [['квартира A', 'c'], ['квартира B', 'x', 'Про терасу сказано лише в оголошенні A.'], ['жодна', 'x', 'У квартири A є тераса.']], rule: R.rd, ok: 'Правильно: terraza — у квартирі A.', no: 'Тераса є лише в квартирі A.' }),
  choice(L, { id: 'T33', role: 'independent', family: 'product-descriptions', ts: [RD], ask: 'Прочитайте опис. Чим червона сумка краща за чорну?', es: 'El bolso negro es más grande que el rojo, pero el rojo es más bonito y cuesta menos.', opts: [['вона гарніша й дешевша', 'c'], ['вона більша', 'x', 'Більша чорна: el negro es más grande.'], ['нічим', 'x', 'Червона гарніша й коштує менше.']], rule: R.rd, ok: 'Правильно: el rojo es más bonito y cuesta menos.', no: 'Червона гарніша й дешевша: más bonito, cuesta menos.' }),
  choice(L, { id: 'T34', role: 'delayed', family: 'people-descriptions', ts: [RD], ask: 'Прочитайте опис. Хто старший?', es: 'Tengo dos hermanos. Luis es alto y muy simpático; tiene veinte años. Pablo es menor que Luis, pero es tan alto como él.', opts: [['Луїс', 'c'], ['Пабло', 'x', 'Pablo es menor que Luis — Пабло молодший.'], ['вони однолітки', 'x', 'Однакові вони лише на зріст: tan alto como él.']], rule: R.rd, ok: 'Правильно: Pablo es menor que Luis.', no: 'Pablo es menor que Luis — старший Луїс.' }),
  choice(L, { id: 'T35', role: 'transfer', family: 'messages', ts: [RD], ask: 'Прочитайте повідомлення. Який готель обрала Марта і чому?', es: '¡Hola, Pablo! Hay dos hoteles cerca de la playa. El Hotel Sol es más barato, pero no tiene nada cerca: no hay tiendas. El Hotel Centro es un poco más caro, pero es más céntrico. Prefiero el Hotel Centro.', opts: [['Hotel Centro, бо він ближче до центру', 'c'], ['Hotel Sol, бо він дешевший', 'x', 'Вона пише, що Hotel Sol дешевший, але обирає Hotel Centro.'], ['жоден', 'x', 'Prefiero el Hotel Centro — вона обрала.']], rule: R.rd, ok: 'Правильно: Prefiero el Hotel Centro — es más céntrico.', no: 'Марта обирає Hotel Centro, бо він ближче до центру.' }),

  // writing a choice
  rubric(L, { id: 'T41', role: 'supported', family: 'flat-ads', ts: [WC], ask: 'Подивіться на оголошення про дві квартири (A: 950 €, тераса, центр; B: 700 €, світла, спокійна). Напишіть 2–3 речення: порівняйте їх і скажіть, яку обираєте і чому (porque).', criteria: ['Є порівняння двох варіантів (más … que, menos … que, tan … como, mejor).', 'Є вибір і причина з porque.', 'Прикметники узгоджені з іменниками.'], exemplars: ['El piso A es más caro que el piso B, pero tiene terraza. El piso B es más tranquilo y luminoso. Prefiero el piso B porque es más barato.'], rule: R.wc }),
  rubric(L, { id: 'T42', role: 'independent', family: 'product-descriptions', ts: [WC], ask: 'Порівняйте дві речі, які ви хочете купити (наприклад, два телефони чи дві сумки), і поясніть свій вибір: 2–4 речення.', criteria: ['Є короткий опис обох варіантів.', 'Є порівняння (más … que, tan … como, mejor, peor).', 'Є вибір і причина з porque.'], exemplars: ['El móvil negro es más moderno que el blanco, pero también es más caro. El blanco es tan bonito como el negro. Prefiero el blanco porque cuesta menos.'], rule: R.wc }),
  rubric(L, { id: 'T43', role: 'delayed', family: 'people-descriptions', ts: [WC], ask: 'Опишіть двох знайомих людей (вік, характер) і скажіть, з ким вам легше розмовляти і чому: 3–4 речення.', criteria: ['Є опис двох людей з узгодженими прикметниками.', 'Є порівняння (mayor, menor, más … que, tan … como).', 'Є висновок з porque.'], exemplars: ['Mi hermana Ana es mayor que yo y es muy tranquila. Mi amigo Luis es menor que yo y es muy simpático. Hablo más con Luis porque es más simpático que mi hermana.'], rule: R.wc }),
  rubric(L, { id: 'T44', role: 'transfer', family: 'messages', ts: [WC], ask: 'Напишіть другові повідомлення: ви шукаєте готель на вихідні; опишіть два варіанти й поясніть, який обираєте (3–4 речення).', criteria: ['Є опис двох готелів.', 'Є порівняння.', 'Є вибір і причина з porque; форма — повідомлення другові.'], exemplars: ['¡Hola, Marta! Hay dos hoteles en Valencia. El Hotel Sol está cerca de la playa, pero es más caro. El Hotel Playa es más barato y es tan cómodo como el Sol. Prefiero el Hotel Playa porque no tengo mucho dinero.'], rule: R.wc }),

  // listening
  choice(L, { id: 'T51', role: 'supported', family: 'agency-call', ts: [LIS], clips: [C1], ask: 'Прослухайте повідомлення з агенції. Яка квартира має терасу?', opts: [['квартира на calle Mayor', 'c'], ['квартира на calle del Sol', 'x', 'Про квартиру на calle del Sol кажуть: менша, світла і спокійніша.'], ['обидві', 'x', 'Тераса лише в квартирі на calle Mayor.']], transcript: TR[C1], ok: 'Правильно: el piso de la calle Mayor tiene terraza.', no: 'Тераса — у квартирі на calle Mayor.' }),
  choice(L, { id: 'T52', role: 'independent', family: 'agency-call', ts: [LIS], clips: [C1], ask: 'Прослухайте ще раз. Скільки коштує спокійніша квартира?', opts: [['700 євро', 'c'], ['900 євро', 'x', '900 євро коштує більша квартира з терасою.'], ['800 євро', 'x', 'Таких цін у повідомленні немає.']], transcript: TR[C1], ok: 'Правильно: setecientos euros.', no: 'Спокійніша квартира (calle del Sol) коштує setecientos euros — 700 євро.' }),
  choice(L, { id: 'T53', role: 'independent', family: 'shop-dialogue', ts: [LIS], clips: [C2], ask: 'Прослухайте розмову в крамниці. Який холодильник обирає покупець?', opts: [['білий', 'c'], ['чорний', 'x', 'Продавець каже, що чорний кращий, але покупець обирає білий.'], ['жодного', 'x', 'Prefiero la blanca — він обирає.']], transcript: TR[C2], ok: 'Правильно: prefiero la blanca.', no: 'Покупець каже: prefiero la blanca.' }),
  choice(L, { id: 'T54', role: 'delayed', family: 'shop-dialogue', ts: [LIS], clips: [C2], ask: 'Прослухайте ще раз. Чому покупець обирає цей холодильник?', opts: [['йому не потрібен великий холодильник', 'c'], ['він сучасніший', 'x', 'Сучасніший — чорний, але покупець обирає білий.'], ['він кращий', 'x', 'Кращий — чорний.']], transcript: TR[C2], ok: 'Правильно: no necesito una nevera tan grande.', no: 'Він каже: no necesito una nevera tan grande.' }),
  choice(L, { id: 'T55', role: 'transfer', family: 'voice-note', ts: [LIS], clips: [C3], ask: 'Прослухайте. Яку квартиру обирає людина і чому?', opts: [['маленьку, бо вона спокійніша', 'c'], ['велику, бо вона більша', 'x', 'Людина каже: prefiero el piso pequeño.'], ['маленьку, бо вона дешевша', 'x', 'Причина — спокій: es más tranquilo.']], transcript: TR[C3], ok: 'Правильно: el piso pequeño — es más tranquilo.', no: 'Людина обирає маленьку квартиру, бо вона спокійніша: es más tranquilo.' }),
  dictation(L, { id: 'T56', role: 'independent', family: 'short-statement', t: LIS_D, clip: C3, a: [TR[C3], TR[C3].replace(/\.$/u, '')] }),
];

export const clips = [
  clip({ id: C1, lessonId: L, kind: 'text', family: 'agency-call', targets: [LIS], transcript: TR[C1], translationUk: 'Добрий день, вам телефонують з агенції. Ми маємо для вас дві квартири. Квартира на вулиці Майор більша й має терасу, але дорожча: коштує дев’ятсот євро. Квартира на вулиці Соль менша, але дуже світла й спокійніша. Коштує сімсот євро. І в квартирі нікого немає: можете подивитися її завтра.' }),
  clip({ id: C2, lessonId: L, kind: 'text', family: 'shop-dialogue', targets: [LIS], transcript: TR[C2], translationUk: '— Добрий вечір. Я шукаю холодильник для невеликої квартири. — Цей білий маленький і дешевий, але не такий сучасний, як чорний. — А чорний кращий? — Так, кращий, але коштує на сто євро більше. — Добре, я візьму білий: мені не потрібен такий великий холодильник.' }),
  clip({ id: C3, lessonId: L, kind: 'sentence', family: 'short-statement', targets: [LIS, LIS_D], transcript: TR[C3], translationUk: 'Я обираю маленьку квартиру, бо вона спокійніша й світліша.' }),
];

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Читаємо, порівнюємо й обираємо',
  termEs: 'describir, comparar y elegir',
  summaryUk: 'Читаємо й слухаємо описи та порівняння (оголошення, розмова в крамниці), уживаємо algo / alguien і заперечення з nada / nadie та пишемо, що обираємо і чому.',
  objectives: ['A2-02-O10'],
  cv: ['CV-02', 'CV-06'],
  situations: ['places-accommodation', 'food-shopping', 'personal-messages'],
  estimatedMinutes: 20,
  introduces: ['pron.algo-alguien', 'neg.double-negation', 'reading.description-comparison', 'writing.choice-description', 'listening.description-comparison'],
  revisits: ['hay.existence', 'neg.short-answer.nada-nadie', 'neg.nunca', 'neg.no-before-verb', 'prep.a.personal', 'compare.mas-menos-que', 'compare.tan-como', 'compare.mejor', 'object-pron.direct-referent', 'relative.que', 'writing.description-detail', 'link.porque'],
  steps: [
    s('s1', 'explanation', 'Щось і хтось: algo, alguien; nada, nadie', true, {
      blocks: [
        UK('Algo — «щось» (про речі), alguien — «хтось» (про людей). Заперечні пари: nada — «нічого», nadie — «ніхто». Нове слово: la nevera — холодильник.'),
        UK('Якщо nada чи nadie стоїть після дієслова, перед дієсловом потрібне no: No quiero nada. No veo a nadie. Якщо nadie стоїть на початку, no не додаємо — на відміну від української: Nadie viene (не *Nadie no viene). Nadie у ролі «кого?» вживаємо з a: No conozco a nadie.'),
        EX('—¿Hay alguien en casa? —No, no hay nadie.', '— Є хтось удома? — Ні, нікого немає.'),
        EX('—¿Quieres algo? —No, nada, gracias.', '— Хочеш щось? — Ні, нічого, дякую.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Algo, alguien, nada, nadie', true, { tasks: ['T01', 'T11', 'T12', 'T21', 'T22'] }),
    s('s3', 'reading', 'Читаємо оголошення', true, {
      blocks: [UK('Нові слова: el anuncio — оголошення, el folleto — рекламний буклет, la agencia (de pisos) — агенція нерухомості. Читаючи оголошення, порівнюйте ціну, розмір і розташування.')],
      tasks: ['T31', 'T32'],
    }),
    s('s4', 'listening', 'Слухаємо: дві квартири, два холодильники', true, { clips: [C1, C2], tasks: ['T51', 'T53'] }),
    s('s5', 'writing', 'Пишемо: що обираю і чому', true, { tasks: ['T41'] }),
    s('s6', 'independent-practice', 'Самостійно', true, { tasks: ['T02', 'T05', 'T13', 'T14', 'T23', 'T24', 'T33', 'T52'] }),
    s('s7', 'independent-practice', 'Додаткова практика', false, { tasks: ['T15', 'T16', 'T25', 'T26', 'T42', 'T56'] }),
    s('s8', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'algo / alguien — щось / хтось; nada / nadie — нічого / ніхто.',
          'No + дієслово + nada / nadie; але Nadie viene (без no).',
          'Описуємо, порівнюємо і пояснюємо вибір: Prefiero… porque…',
        ]),
        LINK('Потренувати заперечення й порівняння', [DNW, DNC, AA, RD, WC], 'written', 10),
        LINK('Послухати ще', [LIS], 'listening', 3),
      ],
    }),
  ],
});
