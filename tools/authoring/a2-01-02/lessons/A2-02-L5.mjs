// A2-02-L5 — two pronouns: order (me lo, te la, nos los, os las) and le/les → se before lo/la/los/las.
// object-pron.combination-attached is incidental (shown for recognition, never targeted).
import { EX, LINK, LIST_UK, TABLE_UK, UK, lesson as mkLesson, open, step } from '../lib.mjs';

const L = 'A2-02-L5';
const COC = 'object-pron.combination-order/construction-use';
const COW = 'object-pron.combination-order/written-form';
const SEW = 'object-pron.se-replacement/written-form';
const SEC = 'object-pron.se-replacement/construction-use';

const R = {
  co: 'Два займенники: спершу «кому?» (me, te, nos, os), потім «що?» (lo, la, los, las). Обидва стоять перед особовою формою дієслова, no — перед ними: Me lo da. No te la compro.',
  se: 'Le і les перед lo, la, los, las стають se: Le doy el libro → Se lo doy. Сполучення *le lo не буває. Щоб уточнити, кому, додаємо a + ім’я: Se lo doy a Marta.',
};
const cap = (x) => (/^[¿¡]/u.test(x) ? x.slice(0, 1) + x.charAt(1).toUpperCase() + x.slice(2) : x.charAt(0).toUpperCase() + x.slice(1));

/** Put the given words in order (written-form of the order). */
function order(id, role, family, words, uk, a, err) {
  const acc = Array.isArray(a) ? a : [a];
  return open(L, { id, role, family, ts: [COW], ask: 'Складіть речення з поданих слів у правильному порядку.', es: words, uk, a: acc, err: err.map(([t, fb]) => [t, { [COW]: 'incorrect' }, fb]), rule: R.co, closed: acc.length === 1, full: acc[0], ok: `Правильно: ${acc[0]}`, no: `Правильна відповідь: ${acc[0]}` });
}
/** Reply with two pronouns (construction-use): choose both and order them. t = COC or SEC. */
function reply(id, role, family, t, es, uk, a, err, full, extra = {}) {
  const acc = Array.isArray(a) ? a : [a];
  return open(L, { id, role, family, ts: [t], ask: `${extra.model ? 'Подивіться на зразок. ' : ''}Дайте відповідь: замініть обидва додатки займенниками. Впишіть пропущені слова.`, model: extra.model, es, uk, a: acc, err: err.map(([x, fb]) => [x, { [t]: 'incorrect' }, fb]), rule: t === SEC ? [R.co, R.se] : R.co, full, ok: `Правильно: ${full}`, no: `Можлива відповідь: ${full}` });
}
/** Replace le/les + noun by se + lo/la/los/las (written-form of the replacement). */
function swap(id, role, family, es, uk, a, err, full, model) {
  return open(L, { id, role, family, ts: [SEW], ask: `${model ? 'Подивіться на зразок. ' : ''}Замініть додаток займенником і впишіть два займенники перед дієсловом.`, model, es, uk, a: [a], err: err.map(([x, fb]) => [x, { [SEW]: 'incorrect' }, fb]), rule: R.se, closed: true, full, ok: `Правильно: ${full}`, no: `Правильна відповідь: ${full}` });
}
const LELO = (a) => [a.replace(/^se /u, 'le '), `Le перед lo, la, los, las стає se: ${a}.`];
const LESLO = (a) => [a.replace(/^se /u, 'les '), `Les перед lo, la, los, las теж стає se: ${a}.`];

export const tasks = [
  // order of given words
  order('T01', 'supported', 'family-home', 'lo / me / da / Ana', 'Ана дає це мені.', ['Ana me lo da.', 'Me lo da Ana.'], [['Ana lo me da.', 'Спершу «кому?» (me), потім «що?» (lo): Ana me lo da.']]),
  order('T02', 'supported', 'shop', '¿ / la / te / compro / ?', 'Купити її тобі?', '¿Te la compro?', [['¿La te compro?', 'Спершу «кому?» (te), потім «що?» (la): ¿Te la compro?'], ['¿Te compro la?', 'Обидва займенники стоять перед дієсловом: ¿Te la compro?']]),
  order('T03', 'independent', 'school', 'os / lo / explico / ahora', 'Я вам це зараз поясню.', ['Os lo explico ahora.', 'Ahora os lo explico.'], [['Lo os explico ahora.', 'Спершу «кому?» (os), потім «що?» (lo).']]),
  order('T04', 'independent', 'family-home', 'no / te / lo / digo', 'Я тобі цього не скажу.', 'No te lo digo.', [['Te lo no digo.', 'No стоїть перед обома займенниками: No te lo digo.'], ['No lo te digo.', 'Спершу «кому?» (te), потім «що?» (lo).']]),
  order('T05', 'independent', 'shop', 'nos / los / traen / mañana', 'Їх нам принесуть завтра.', ['Nos los traen mañana.', 'Mañana nos los traen.'], [['Los nos traen mañana.', 'Спершу «кому?» (nos), потім «що?» (los).']]),
  order('T06', 'independent', 'free-time', '¿ / me / las / prestas / ?', 'Позичиш їх мені?', '¿Me las prestas?', [['¿Las me prestas?', 'Спершу «кому?» (me), потім «що?» (las).']]),
  order('T07', 'delayed', 'family-home', 'mi / madre / nos / la / enseña', 'Мама нам її показує.', ['Mi madre nos la enseña.', 'Nos la enseña mi madre.'], [['Mi madre la nos enseña.', 'Спершу «кому?» (nos), потім «що?» (la).']]),
  order('T08', 'delayed', 'shop', 'no / me / los / da', 'Він мені їх не дає.', 'No me los da.', [['Me los no da.', 'No стоїть перед обома займенниками.'], ['No los me da.', 'Спершу «кому?» (me), потім «що?» (los).']]),
  order('T09', 'transfer', 'messages', 'te / la / mando / esta / noche', 'Я надішлю тобі її сьогодні ввечері.', ['Te la mando esta noche.', 'Esta noche te la mando.'], [['La te mando esta noche.', 'Спершу «кому?» (te), потім «що?» (la).']]),
  order('T10', 'transfer', 'travel', '¿ / nos / las / enseña / usted / ?', 'Ви нам їх покажете?', ['¿Nos las enseña usted?', '¿Usted nos las enseña?'], [['¿Las nos enseña usted?', 'Спершу «кому?» (nos), потім «що?» (las).']]),

  // reply with me/te/nos/os + lo/la/los/las
  reply('T11', 'supported', 'family-home', COC, '—¿Me das el libro? —Sí, ___ (dar, yo) ahora.', '— Даси мені книжку? — Так, зараз дам.', ['te lo doy'], [['lo te doy', 'Спершу «кому?» (te), потім «що?» (lo).'], ['te la doy', 'Libro — чоловічого роду: lo.'], ['me lo doy', 'Книжку отримуєте не ви, а співрозмовник: te.']], '—¿Me das el libro? —Sí, te lo doy ahora.', { model: [['—¿Me prestas la bicicleta? —Sí, te la presto.', '— Позичиш мені велосипед? — Так, позичу.']] }),
  reply('T12', 'supported', 'shop', COC, '—¿Nos traes los cafés? —Sí, ___ (traer, yo) ahora mismo.', '— Принесеш нам каву? — Так, зараз принесу.', ['os los traigo'], [['los os traigo', 'Спершу «кому?» (os), потім «що?» (los).'], ['os las traigo', 'Cafés — чоловічого роду: los.'], ['nos los traigo', 'Каву отримуєте не ви, а співрозмовники (vosotros): os.']], '—¿Nos traes los cafés? —Sí, os los traigo ahora mismo.', { model: [['—¿Me explicas el problema? —Sí, te lo explico.', '— Поясниш мені проблему? — Так, поясню.']] }),
  reply('T13', 'independent', 'free-time', COC, '—¿Me prestas tus gafas de sol? —Claro, ___ (prestar, yo).', '— Позичиш мені свої сонцезахисні окуляри? — Звісно, позичу.', ['te las presto'], [['las te presto', 'Спершу «кому?» (te), потім «що?» (las).'], ['te los presto', 'Gafas — жіночого роду: las.']], '—¿Me prestas tus gafas de sol? —Claro, te las presto.'),
  reply('T14', 'independent', 'family-home', COC, '—¿Nos enseñas las fotos? —Sí, ___ (enseñar, yo) después de cenar.', '— Покажеш нам фото? — Так, покажу вам після вечері.', ['os las enseño'], [['las os enseño', 'Спершу «кому?» (os), потім «що?» (las).'], ['nos las enseño', 'Фото отримуєте не ви, а співрозмовники (vosotros): os.']], '—¿Nos enseñas las fotos? —Sí, os las enseño después de cenar.'),
  reply('T15', 'independent', 'school', COC, '—¿Me explicas la tarea? —Sí, ___ (explicar, yo).', '— Поясниш мені завдання? — Так, поясню.', ['te la explico'], [['la te explico', 'Спершу «кому?» (te), потім «що?» (la).'], ['te lo explico', 'Tarea — жіночого роду: la.']], '—¿Me explicas la tarea? —Sí, te la explico.'),
  reply('T16', 'independent', 'shop', COC, '—¿Me dices el precio? —Sí, ___ (decir, yo) ahora: veinte euros.', '— Скажете мені ціну? — Так, зараз скажу: двадцять євро.', ['te lo digo'], [['lo te digo', 'Спершу «кому?» (te), потім «що?» (lo).'], ['te la digo', 'Precio — чоловічого роду: lo.']], '—¿Me dices el precio? —Sí, te lo digo ahora: veinte euros.'),
  reply('T17', 'delayed', 'family-home', COC, '—¿Me dices tu dirección? —Sí, ___ (decir, yo) ahora.', '— Скажеш мені свою адресу? — Так, зараз скажу.', ['te la digo'], [['la te digo', 'Спершу «кому?» (te), потім «що?» (la).'], ['te lo digo', 'Dirección — жіночого роду: la.']], '—¿Me dices tu dirección? —Sí, te la digo ahora.'),
  reply('T18', 'delayed', 'free-time', COC, '—¿Os enseño las fotos de la playa? —Sí, ¿___ (enseñar, tú) ahora?', '— Показати вам фото з пляжу? — Так, покажеш нам зараз?', ['nos las enseñas'], [['las nos enseñas', 'Спершу «кому?» (nos), потім «що?» (las).'], ['os las enseñas', 'Фото отримуєте ви (nosotros): nos.']], '—¿Os enseño las fotos de la playa? —Sí, ¿nos las enseñas ahora?'),
  reply('T19', 'transfer', 'messages', COC, '¡Hola, Ana! ¿Tienes las fotos del cumpleaños? ¿___ (mandar, tú) hoy?', 'Привіт, Ано! У тебе є фото з дня народження? Надішлеш їх мені сьогодні?', ['me las mandas'], [['las me mandas', 'Спершу «кому?» (me), потім «що?» (las).'], ['me los mandas', 'Fotos — жіночого роду: las.']], '¡Hola, Ana! ¿Tienes las fotos del cumpleaños? ¿Me las mandas hoy?'),
  reply('T20', 'transfer', 'work-study', COC, '—¿Nos explicas el horario nuevo? —Sí, ___ (explicar, yo) en la reunión.', '— Поясниш нам новий розклад? — Так, поясню вам на нараді.', ['os lo explico'], [['lo os explico', 'Спершу «кому?» (os), потім «що?» (lo).'], ['nos lo explico', 'Розклад отримуєте не ви, а співрозмовники (vosotros): os.']], '—¿Nos explicas el horario nuevo? —Sí, os lo explico en la reunión.'),

  // le/les → se (written-form)
  swap('T21', 'supported', 'family-home', 'Le doy el libro (a Marta). → ___ doy.', 'Я даю їй книжку.', 'se lo', [LELO('se lo'), ['se la', 'Libro — чоловічого роду: lo.'], ['lo le', 'Спершу se, потім lo: se lo.']], 'Se lo doy.', [['Le regalo la mochila. → Se la regalo.', 'Я дарую йому рюкзак.']]),
  swap('T22', 'supported', 'shop', 'Les compro las manzanas (a mis padres). → ___ compro.', 'Я купую їм яблука.', 'se las', [LESLO('se las'), ['se los', 'Manzanas — жіночого роду: las.']], 'Se las compro.', [['Le explico el problema. → Se lo explico.', 'Я пояснюю йому проблему.']]),
  swap('T23', 'independent', 'school', 'La profesora les explica la tarea (a los alumnos). → La profesora ___ explica.', 'Учителька пояснює їм завдання.', 'se la', [LESLO('se la'), ['se lo', 'Tarea — жіночого роду: la.']], 'La profesora se la explica.'),
  swap('T24', 'independent', 'family-home', 'Le presto el coche (a mi hermano). → ___ presto.', 'Я позичаю йому машину.', 'se lo', [LELO('se lo'), ['se la', 'Coche — чоловічого роду: lo.']], 'Se lo presto.'),
  swap('T25', 'independent', 'shop', 'Le enseño las gafas (a la señora). → ___ enseño.', 'Я показую їй окуляри.', 'se las', [LELO('se las'), ['se los', 'Gafas — жіночого роду: las.']], 'Se las enseño.'),
  swap('T26', 'independent', 'free-time', 'Le mando las fotos (a Pablo). → ___ mando.', 'Я надсилаю йому фото.', 'se las', [LELO('se las'), ['se los', 'Fotos — жіночого роду: las.']], 'Se las mando.'),
  swap('T27', 'delayed', 'family-home', 'No le digo la verdad (a mi hermana). → No ___ digo.', 'Я не кажу їй правди.', 'se la', [LELO('se la'), ['se lo', 'Verdad — жіночого роду: la.']], 'No se la digo.'),
  swap('T28', 'delayed', 'school', 'Les doy los libros (a los alumnos). → ___ doy.', 'Я даю їм книжки.', 'se los', [LESLO('se los')], 'Se los doy.'),
  swap('T29', 'transfer', 'messages', '¡Hola, Marta! Mañana le envío la dirección (a Luis). → ¡Hola, Marta! Mañana ___ envío.', 'Привіт, Марто! Завтра я надішлю йому адресу.', 'se la', [LELO('se la'), ['se lo', 'Dirección — жіночого роду: la.']], '¡Hola, Marta! Mañana se la envío.'),
  swap('T30', 'transfer', 'travel', 'En el hotel le doy las llaves (al señor). → En el hotel ___ doy.', 'У готелі я даю панові ключі.', 'se las', [LELO('se las'), ['se los', 'Llaves — жіночого роду: las.']], 'En el hotel se las doy.'),

  // le/les → se in a reply (construction-use)
  reply('T31', 'supported', 'family-home', SEC, '—¿Le das el regalo a Marta? —Sí, ___ (dar, yo) mañana.', '— Ти даси подарунок Марті? — Так, дам їй завтра.', ['se lo doy', 'se lo doy yo'], [['le lo doy', 'Le перед lo стає se: se lo doy.'], ['lo le doy', 'Порядок і форма: se lo doy.'], ['se la doy', 'Regalo — чоловічого роду: lo.']], '—¿Le das el regalo a Marta? —Sí, se lo doy mañana.', { model: [['—¿Le explicas el problema a Pablo? —Sí, se lo explico.', '— Поясниш проблему Пабло? — Так, поясню йому.']] }),
  reply('T32', 'supported', 'shop', SEC, '—¿Les compras las entradas a tus padres? —Sí, ___ (comprar, yo).', '— Ти купиш квитки батькам? — Так, куплю їм.', ['se las compro'], [['les las compro', 'Les перед las стає se: se las compro.'], ['se los compro', 'Entradas — жіночого роду: las.']], '—¿Les compras las entradas a tus padres? —Sí, se las compro.', { model: [['—¿Le mandas la foto a Ana? —Sí, se la mando.', '— Надішлеш фото Ані? — Так, надішлю їй.']] }),
  reply('T33', 'independent', 'family-home', SEC, '—¿Le prestas tu bicicleta a Luis? —No, no ___ (prestar, yo).', '— Позичиш свій велосипед Луїсу? — Ні, не позичу йому.', ['se la presto'], [['le la presto', 'Le перед la стає se: se la presto.'], ['se lo presto', 'Bicicleta — жіночого роду: la.']], '—¿Le prestas tu bicicleta a Luis? —No, no se la presto.'),
  reply('T34', 'independent', 'school', SEC, '—¿La profesora les explica los ejercicios a los alumnos? —Sí, ___ (explicar).', '— Учителька пояснює учням вправи? — Так, пояснює їм.', ['se los explica'], [['les los explica', 'Les перед los стає se: se los explica.'], ['se las explica', 'Ejercicios — чоловічого роду: los.']], '—¿La profesora les explica los ejercicios a los alumnos? —Sí, se los explica.'),
  reply('T35', 'independent', 'shop', SEC, '—¿Le enseña usted el piso a la señora? —Sí, ___ (enseñar, yo) ahora.', '— Ви покажете квартиру пані? — Так, покажу їй зараз.', ['se lo enseño'], [['le lo enseño', 'Le перед lo стає se: se lo enseño.'], ['se la enseño', 'Piso — чоловічого роду: lo.']], '—¿Le enseña usted el piso a la señora? —Sí, se lo enseño ahora.'),
  reply('T36', 'independent', 'free-time', SEC, '—¿Les mandas las fotos a tus amigos? —Sí, ___ (mandar, yo) esta noche.', '— Надішлеш фото друзям? — Так, надішлю їм сьогодні ввечері.', ['se las mando'], [['les las mando', 'Les перед las стає se: se las mando.'], ['se los mando', 'Fotos — жіночого роду: las.']], '—¿Les mandas las fotos a tus amigos? —Sí, se las mando esta noche.'),
  reply('T37', 'delayed', 'family-home', SEC, '—¿Le dices la verdad a tu madre? —Sí, siempre ___ (decir, yo).', '— Ти кажеш мамі правду? — Так, завжди кажу їй.', ['se la digo'], [['le la digo', 'Le перед la стає se: se la digo.'], ['se lo digo', 'Verdad — жіночого роду: la.']], '—¿Le dices la verdad a tu madre? —Sí, siempre se la digo.'),
  reply('T38', 'delayed', 'shop', SEC, '—¿Le traes el café a la señora? —Sí, ___ (traer, yo) ahora mismo.', '— Принесеш каву пані? — Так, зараз принесу їй.', ['se lo traigo'], [['le lo traigo', 'Le перед lo стає se: se lo traigo.'], ['se la traigo', 'Café — чоловічого роду: lo.']], '—¿Le traes el café a la señora? —Sí, se lo traigo ahora mismo.'),
  reply('T39', 'transfer', 'messages', SEC, '¡Hola, Pablo! ¿Le envías el número de Ana a Luis? —Sí, ___ (enviar, yo) ahora.', 'Привіт, Пабло! Надішлеш номер Ани Луїсу? — Так, зараз надішлю йому.', ['se lo envío'], [['le lo envío', 'Le перед lo стає se: se lo envío.'], ['se lo envio', 'Envío пишемо зі знаком наголосу.']], '¡Hola, Pablo! ¿Le envías el número de Ana a Luis? —Sí, se lo envío ahora.'),
  reply('T40', 'transfer', 'travel', SEC, '—¿Les da usted los billetes a sus hijos? —Sí, ___ (dar, yo) en la estación.', '— Ви даєте квитки своїм дітям? — Так, даю їм на вокзалі.', ['se los doy'], [['les los doy', 'Les перед los стає se: se los doy.'], ['se las doy', 'Billetes — чоловічого роду: los.']], '—¿Les da usted los billetes a sus hijos? —Sí, se los doy en la estación.'),
];

const T_TWO = TABLE_UK(['кому?', '+ що?', 'приклад'], [
  ['me', 'lo, la, los, las', 'Me lo da.'],
  ['te', 'lo, la, los, las', '¿Te la compro?'],
  ['le, les → se', 'lo, la, los, las', 'Se lo doy (a Marta).'],
  ['nos', 'lo, la, los, las', 'Nos los traen mañana.'],
  ['os', 'lo, la, los, las', 'Os lo explico.'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Два займенники: me lo, te la, se lo',
  termEs: 'combinación de pronombres',
  summaryUk: 'Коли в реченні є і «кому?», і «що?», ставимо два займенники: спершу «кому?», потім «що?» — Me lo da. Le і les перед lo, la, los, las стають se: Se lo doy.',
  objectives: ['A2-02-O6'],
  situations: ['people-family-home', 'food-shopping', 'personal-messages'],
  estimatedMinutes: 18,
  introduces: ['object-pron.combination-order', 'object-pron.se-replacement', 'object-pron.combination-attached'],
  revisits: ['object-pron.indirect-forms', 'object-pron.direct-3', 'object-pron.placement-finite', 'object-pron.indirect-doubling', 'object-pron.placement-infinitive', 'ortho.gerund-pronoun-accent'],
  steps: [
    s('s1', 'explanation', 'Спершу «кому?», потім «що?»', true, {
      blocks: [
        UK('Якщо замінюємо займенниками обидва додатки, спершу ставимо «кому?» (me, te, nos, os), потім «що?» (lo, la, los, las). Обидва стоять перед особовою формою дієслова; no — перед ними обома.'),
        EX('—¿Me das el libro? —Sí, te lo doy.', '— Даси мені книжку? — Так, дам.'),
        EX('—¿Nos explicas la tarea? —Sí, os la explico.', '— Поясниш нам завдання? — Так, поясню вам.'),
        EX('No te lo digo.', 'Я тобі цього не скажу.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Порядок за зразком', true, { tasks: ['T01', 'T02', 'T11', 'T12'] }),
    s('s3', 'explanation', 'Заміна le, les на se', true, {
      blocks: [
        UK('Le і les перед lo, la, los, las змінюються на se: Le doy el libro a Marta → Se lo doy (a Marta). Сполучення *le lo не буває. Тут se означає «йому, їй, вам (usted), їм, вам (ustedes)» — це не зворотне se з levantarse. Щоб уточнити, кому, додаємо a + ім’я: Se lo doy a Marta.'),
        T_TWO,
        EX('—¿Le das el regalo a Ana? —Sí, se lo doy mañana.', '— Даси подарунок Ані? — Так, дам їй завтра.'),
        EX('Les compro las entradas a mis padres. → Se las compro.', 'Я купую батькам квитки. → Я купую їх їм.'),
        UK('Для впізнавання: з інфінітивом чи герундієм обидва займенники можна приєднати в кінці, у тому самому порядку, і тоді пишемо знак наголосу: Voy a dárselo = Se lo voy a dar; Estoy explicándotelo = Te lo estoy explicando.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Se lo, se la за зразком', true, { tasks: ['T21', 'T22', 'T31', 'T32'] }),
    s('s5', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T04', 'T13', 'T14', 'T23', 'T24', 'T33', 'T34'] }),
    s('s6', 'independent-practice', 'Додаткова практика', false, { tasks: ['T05', 'T06', 'T15', 'T16', 'T25', 'T26', 'T35', 'T36'] }),
    s('s7', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'Спершу «кому?», потім «що?»: me lo, te la, nos los, os las — перед дієсловом.',
          'Le, les + lo, la, los, las → se lo, se la, se los, se las.',
          'Voy a dárselo = Se lo voy a dar (для впізнавання).',
        ]),
        LINK('Потренувати два займенники', [COC, COW, SEW, SEC], 'written', 10),
      ],
    }),
  ],
});
