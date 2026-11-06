// A2-02-L1 — demonstratives (agreement, distance, neuter, no written accent) and tonic possessives.
import { EX, LINK, LIST_UK, TABLE_ES, UK, choice, gap, lesson as mkLesson, material, open, step } from '../lib.mjs';

const L = 'A2-02-L1';
const DEM = 'pron.demonstrative-agreement/written-form';
const DIST_C = 'pron.demonstrative-distance/context-choice';
const DIST_R = 'pron.demonstrative-distance/reading-meaning';
const NEU = 'pron.demonstrative-neuter/written-form';
const NEU_C = 'pron.demonstrative-neuter/context-choice';
const NOACC = 'ortho.demonstrative-no-accent/written-form';
const TON = 'poss.tonic-forms/written-form';
const STAND = 'poss.tonic-standalone/construction-use';
const STAND_C = 'poss.tonic-standalone/context-choice';
const MM = 'contrast.poss-mi-mio/written-form';
const MM_C = 'contrast.poss-mi-mio/context-choice';

const R = {
  dem: 'Вказівне слово узгоджується з іменником у роді й числі: este libro, esta mesa, estos libros, estas mesas; так само ese / esa / esos / esas, aquel / aquella / aquellos / aquellas.',
  dist: 'Este — те, що поруч із вами; ese — поруч зі співрозмовником або трохи далі; aquel — далеко від обох. У розмові ese часто вживають і для далеких предметів.',
  neu: 'Esto, eso, aquello вживаємо без іменника, коли предмет ще не названо або коли йдеться про ситуацію чи думку: ¿Qué es esto? Eso es interesante.',
  noacc: 'За чинними правилами вказівні слова пишемо без знака наголосу і тоді, коли вони стоять без іменника: Quiero este. Esto, eso, aquello знака наголосу не мають ніколи.',
  ton: 'Наголошені присвійні форми узгоджуються з тим, що належить: mío, mía, míos, mías; tuyo, tuya…; suyo, suya…; nuestro, nuestra…; vuestro, vuestra… У mío, mía, míos, mías пишемо знак наголосу на í.',
  stand: 'Щоб не повторювати іменник, ставимо артикль + наголошену форму: Mi coche es rojo y el tuyo es azul. Після ser, коли кажемо, чиє щось, артикль зазвичай не потрібен: Esta maleta es mía.',
  mm: 'Mi, tu, su (mis, tus, sus) стоять лише перед іменником: mi libro. Без іменника — mío, tuyo, suyo: El libro es mío. Nuestro і vuestro мають ту саму форму в обох позиціях.',
};
const ASK_DEM = 'Впишіть правильну форму вказівного слова з дужок.';
const ACC_ERR = (form) => [form.replace(/^e/u, 'é').replace(/^a/u, 'á'), { [DEM]: 'correct', [NOACC]: 'incorrect' }, `За чинними правилами пишемо без знака наголосу: ${form}.`];

// demonstrative + noun (agreement only)
const demNoun = (id, role, family, es, uk, a, err, model) => gap(L, { id, role, family, t: DEM, ask: model ? `Подивіться на зразок. ${ASK_DEM}` : ASK_DEM, model, es, uk, a, err, rule: R.dem });
// standalone demonstrative: agreement + no-accent spelling
const demAlone = (id, role, family, es, uk, a, wrong, full) =>
  open(L, { id, role, family, ts: [DEM, NOACC], ask: 'Впишіть правильну форму вказівного слова з дужок (без іменника).', es, uk, a: [a], err: [ACC_ERR(a), ...wrong.map(([t, fb]) => [t, { [DEM]: 'incorrect', [NOACC]: 'unresolved' }, fb])], rule: [R.dem, R.noacc], full, ok: `Правильно: ${a}.`, no: `Правильна відповідь: ${a}.` });
const neu = (id, role, family, ask, es, uk, a, wrong, full) =>
  open(L, { id, role, family, ts: [NEU, NOACC], ask, es, uk, a: [a], err: [[a.replace(/^e/u, 'é').replace(/^a/u, 'á'), { [NEU]: 'correct', [NOACC]: 'incorrect' }, `${a} знака наголосу не має ніколи.`], ...wrong.map(([t, fb]) => [t, { [NEU]: 'incorrect', [NOACC]: 'unresolved' }, fb])], rule: [R.neu, R.noacc], full, ok: `Правильно: ${a}.`, no: `Правильна відповідь: ${a}.` });
// "es + tonic form": the form and the mi/mío position contrast
const ton = (id, role, family, es, uk, a, extraErr, full, model) =>
  open(L, { id, role, family, ts: [TON, MM], ask: model ? 'Подивіться на зразок і впишіть присвійне слово для особи з дужок.' : 'Впишіть присвійне слово для особи з дужок.', model, es, uk, a: [a], err: extraErr, rule: [R.ton, R.mm], full, ok: `Правильно: ${a}.`, no: `Правильна відповідь: ${a}.` });
const MI = (short, a) => [short, { [TON]: 'unresolved', [MM]: 'incorrect' }, `${short} стоїть лише перед іменником; без іменника — ${a}.`];
const NOTILDE = (a) => [a.replace('í', 'i'), { [TON]: 'incorrect', [MM]: 'correct' }, `У формах mío, mía, míos, mías пишемо знак наголосу: ${a}.`];
const GENDER = (wrong, a, noun) => [wrong, { [TON]: 'incorrect', [MM]: 'correct' }, `Форма узгоджується з тим, що належить (${noun}): ${a}.`];
// article + tonic form instead of a repeated noun
const stand = (id, role, family, es, uk, a, err, full, extra = {}) =>
  open(L, { id, role, family, ts: extra.withTon ? [STAND, TON] : [STAND], ask: extra.model ? 'Подивіться на зразок і впишіть артикль + присвійне слово, щоб не повторювати іменник.' : 'Впишіть артикль + присвійне слово, щоб не повторювати іменник.', model: extra.model, es, uk, a: [a], err, rule: R.stand, full, ok: `Правильно: ${a}.`, no: `Правильна відповідь: ${a}.`, closed: !extra.withTon });
const mm = (id, role, family, es, uk, a, err, full, model) => gap(L, { id, role, family, t: MM, ask: model ? 'Подивіться на зразок: mi чи mío? Впишіть потрібне слово для особи з дужок.' : 'Mi чи mío? Впишіть потрібне слово для особи з дужок.', model, es, uk, a, err, rule: R.mm, full });

export const tasks = [
  // agreement with a noun
  demNoun('T01', 'supported', 'shop', 'Me gusta ___ (este) mesa.', 'Мені подобається цей стіл.', 'esta', [['este', 'Mesa — жіночого роду: esta mesa.']], [['¿Cuánto cuesta este bolso?', 'Скільки коштує ця сумка?']]),
  demNoun('T02', 'supported', 'family-home', '___ (ese) llaves son de Ana.', 'Ці ключі (біля тебе) — Анині.', 'Esas', [['Esos', 'Llaves — жіночого роду, множина: esas.'], ['Esa', 'Llaves — множина: esas.']], [['Ese libro es de mi hermano.', 'Та книжка (біля тебе) — мого брата.']]),
  demNoun('T03', 'independent', 'shop', '¿Cuánto cuestan ___ (este) tomates?', 'Скільки коштують ці помідори?', 'estos', [['estas', 'Tomates — чоловічого роду: estos.'], ['este', 'Tomates — множина: estos.']]),
  demNoun('T04', 'independent', 'travel', '___ (aquel) hotel es muy caro.', 'Он той готель дуже дорогий.', 'Aquel', [['Aquello', 'Перед іменником — aquel; aquello вживаємо без іменника.'], ['Aquella', 'Hotel — чоловічого роду: aquel.']]),
  demNoun('T05', 'independent', 'family-home', '¿De quién es ___ (ese) maleta?', 'Чия це валіза (біля тебе)?', 'esa', [['ese', 'Maleta — жіночого роду: esa.']]),
  demAlone('T06', 'independent', 'shop', '—¿Qué bolso quieres? —___ (este), el negro.', '— Яку сумку ти хочеш? — Оцю, чорну.', 'Este', [['Esta', 'Bolso — чоловічого роду: este.']], '—¿Qué bolso quieres? —Este, el negro.'),
  demAlone('T07', 'delayed', 'travel', '—¿Cuál es tu maleta? —___ (aquel), la roja.', '— Котра твоя валіза? — Он та, червона.', 'Aquella', [['Aquel', 'Maleta — жіночого роду: aquella.']], '—¿Cuál es tu maleta? —Aquella, la roja.'),
  demAlone('T08', 'delayed', 'shop', 'No quiero estas manzanas: quiero ___ (ese).', 'Я не хочу цих яблук: я хочу ті (біля вас).', 'esas', [['esos', 'Manzanas — жіночого роду: esas.']], 'No quiero estas manzanas: quiero esas.'),
  demAlone('T09', 'transfer', 'messages', 'Hola, Pablo: ¿qué gafas compro, estas o ___ (ese)?', 'Привіт, Пабло! Які окуляри купити — ці чи ті?', 'esas', [['esos', 'Gafas — жіночого роду: esas.'], ['esa', 'Gafas — множина: esas.']], 'Hola, Pablo: ¿qué gafas compro, estas o esas?'),
  demAlone('T10', 'transfer', 'food-cafe', '—¿Qué café quieres? —___ (este), con leche.', '— Яку каву хочеш? — Оцю, з молоком.', 'Este', [['Esta', 'Café — чоловічого роду: este.']], '—¿Qué café quieres? —Este, con leche.'),

  // distance
  choice(L, { id: 'T11', role: 'supported', family: 'shop', ts: [DIST_C], ask: 'Книжка у ваших руках. Оберіть варіант. Підказка: este — поруч із вами, aquel — далеко від обох.', es: '___ libro es muy interesante.', opts: [['Este', 'c'], ['Aquel', 'x', 'Книжка у ваших руках, тобто поруч: este.']], rule: R.dist, ref: 'Este libro es muy interesante.', ok: 'Правильно: поруч із мовцем — este.', no: 'Поруч із мовцем — este: Este libro es muy interesante.' }),
  choice(L, { id: 'T12', role: 'independent', family: 'travel', ts: [DIST_C], ask: 'Ви на площі й показуєте на готель далеко, на іншому кінці міста. Оберіть варіант.', es: '___ hotel es nuevo.', opts: [['Aquel', 'c'], ['Ese', 'c', 'Теж можливо: у розмові ese часто вживають і для далеких предметів.'], ['Este', 'x', 'Este — поруч із вами, а готель далеко.']], rule: R.dist, ok: 'Правильно: для далекого — aquel (у розмові й ese).', no: 'Готель далеко: aquel (у розмові також ese), але не este.' }),
  choice(L, { id: 'T13', role: 'delayed', family: 'food-cafe', ts: [DIST_C], ask: 'Склянка стоїть поруч зі співрозмовником. Ви питаєте про неї. Оберіть варіант.', es: '¿Es tuyo ___ vaso?', opts: [['ese', 'c'], ['este', 'x', 'Este — поруч із вами; склянка біля співрозмовника: ese.']], rule: R.dist, ref: '¿Es tuyo ese vaso?', ok: 'Правильно: поруч зі співрозмовником — ese.', no: 'Поруч зі співрозмовником — ese.' }),
  choice(L, { id: 'T14', role: 'independent', family: 'family-home', ts: [DIST_R], ask: 'Прочитайте діалог. Де телефон?', es: '—¿Es tu móvil? —¿Cuál? ¿Ese? No, el mío está aquí.', opts: [['Біля першого співрозмовника.', 'c'], ['У того, хто відповідає.', 'x', 'Той, хто відповідає, каже ese — «той, біля тебе»; його телефон — aquí.'], ['Дуже далеко від обох.', 'x', 'Для далекого сказали б aquel.']], rule: R.dist, ok: 'Правильно: ese — біля співрозмовника.', no: 'Ese — біля співрозмовника: телефон біля того, хто питає.' }),
  choice(L, { id: 'T15', role: 'transfer', family: 'places', ts: [DIST_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Aquella casa de allí es de mis padres.', opts: [['Он той будинок, далеко, — моїх батьків.', 'c'], ['Цей будинок, де ми зараз, — моїх батьків.', 'x', 'Про будинок поруч сказали б esta casa.'], ['Мої батьки живуть у будь-якому будинку.', 'x', 'Aquella вказує на конкретний далекий будинок.']], rule: R.dist, ok: 'Правильно: aquella + allí — далеко.', no: 'Aquella casa de allí — он той будинок, далеко.' }),

  // neuter
  neu('T21', 'supported', 'shop', 'Подивіться на зразок. Предмет у ваших руках, ви не знаєте, що це. Впишіть вказівне слово.', '¿Qué es ___?', 'Що це?', 'esto', [['este', 'Предмет ще не названо, тому esto.']], '¿Qué es esto?'),
  neu('T22', 'independent', 'family-home', 'Співрозмовник щось сказав. Ви відповідаєте: «Це правда». Впишіть вказівне слово.', '___ es verdad.', 'Це правда.', 'Eso', [['Ese', 'Ідеться про сказане, а не про предмет чоловічого роду: eso.']], 'Eso es verdad.'),
  neu('T23', 'independent', 'shop', 'Співрозмовник тримає незнайомий предмет. Ви питаєте, що це. Впишіть вказівне слово.', '¿Qué es ___?', 'Що це (у тебе)?', 'eso', [['ese', 'Предмет ще не названо, тому eso.']], '¿Qué es eso?'),
  neu('T24', 'delayed', 'travel', 'Ви бачите щось дуже далеко й не знаєте, що це. Впишіть вказівне слово.', '¿Qué es ___ de allí?', 'Що он там таке?', 'aquello', [['aquel', 'Предмет ще не названо, тому aquello.']], '¿Qué es aquello de allí?'),
  neu('T25', 'transfer', 'messages', 'Друг пише про план. Ви відповідаєте: «Це чудова ідея!» — тут: «Це дуже цікаво!». Впишіть вказівне слово.', 'Hola, Ana: ¡___ es muy interesante!', 'Привіт, Ано! Це дуже цікаво!', 'eso', [['ese', 'Ідеться про сказане, тому eso.']], 'Hola, Ana: ¡eso es muy interesante!'),
  choice(L, { id: 'T26', role: 'independent', family: 'family-home', ts: [NEU_C], ask: 'Оберіть варіант.', es: '—Mañana no hay clase. —¡___ es genial!', opts: [['Eso', 'c'], ['Ese', 'x', 'Ідеться про ситуацію (немає заняття), а не про іменник: eso.']], rule: R.neu, ref: '—Mañana no hay clase. —¡Eso es genial!', ok: 'Правильно: про ситуацію — eso.', no: 'Про ситуацію — eso: ¡Eso es genial!' }),
  choice(L, { id: 'T27', role: 'delayed', family: 'shop', ts: [NEU_C], ask: 'Оберіть варіант.', es: 'Quiero ___ libro, por favor.', opts: [['este', 'c'], ['esto', 'x', 'Перед іменником — este; esto без іменника.']], rule: R.neu, ref: 'Quiero este libro, por favor.', ok: 'Правильно: перед іменником — este.', no: 'Перед іменником — este: Quiero este libro.' }),

  // no written accent (own tasks)
  open(L, { id: 'T28', role: 'supported', family: 'shop', ts: [NOACC], ask: 'Подивіться на зразок і перепишіть відповідь, виправивши написання за чинними правилами.', model: [['—¿Qué mochila quieres? —Esta.', '— Який рюкзак хочеш? — Цей.']], es: '—¿Qué paraguas quieres? —Éste.', uk: '— Яку парасольку хочеш? — Цю.', a: ['Este.', 'Este'], err: [['Éste.', { [NOACC]: 'incorrect' }, 'За чинними правилами вказівне слово без іменника пишемо без знака наголосу: Este.']], rule: R.noacc, closed: true, full: '—¿Qué paraguas quieres? —Este.' }),
  open(L, { id: 'T29', role: 'independent', family: 'travel', ts: [NOACC], ask: 'Перепишіть відповідь, виправивши написання за чинними правилами.', es: '—¿Cuáles son vuestras maletas? —Aquéllas.', uk: '— Котрі ваші валізи? — Он ті.', a: ['Aquellas.', 'Aquellas'], err: [['Aquéllas.', { [NOACC]: 'incorrect' }, 'Без знака наголосу: Aquellas.']], rule: R.noacc, closed: true, full: '—¿Cuáles son vuestras maletas? —Aquellas.' }),
  open(L, { id: 'T30', role: 'transfer', family: 'school', ts: [NOACC], ask: 'Перепишіть речення, виправивши написання за чинними правилами.', es: 'Ésto no es mi bolígrafo.', uk: 'Це не моя ручка.', a: ['Esto no es mi bolígrafo.'], err: [['Ésto no es mi bolígrafo.', { [NOACC]: 'incorrect' }, 'Esto ніколи не має знака наголосу.']], rule: R.noacc, closed: true, full: 'Esto no es mi bolígrafo.' }),

  // tonic forms after ser (+ mi / mío)
  ton('T31', 'supported', 'travel', 'Esta maleta es ___ (yo).', 'Ця валіза моя.', 'mía', [MI('mi', 'mía'), NOTILDE('mía'), GENDER('mío', 'mía', 'maleta')], 'Esta maleta es mía.', [['Este libro es mío.', 'Ця книжка моя.']]),
  ton('T32', 'supported', 'family-home', 'Estas llaves son ___ (tú).', 'Ці ключі твої.', 'tuyas', [MI('tus', 'tuyas'), GENDER('tuyos', 'tuyas', 'llaves')], 'Estas llaves son tuyas.', [['Ese coche es tuyo.', 'Та машина — твоя.']]),
  ton('T33', 'independent', 'family-home', 'Estos libros son ___ (yo).', 'Ці книжки мої.', 'míos', [MI('mis', 'míos'), NOTILDE('míos'), GENDER('mías', 'míos', 'libros')], 'Estos libros son míos.'),
  ton('T34', 'independent', 'travel', '¿Es ___ (usted) este paraguas?', 'Це ваша парасолька?', 'suyo', [MI('su', 'suyo'), GENDER('suya', 'suyo', 'paraguas')], '¿Es suyo este paraguas?'),
  ton('T35', 'delayed', 'family-home', 'Esa casa es ___ (nosotros).', 'Той будинок — наш.', 'nuestra', [GENDER('nuestro', 'nuestra', 'casa')], 'Esa casa es nuestra.'),
  ton('T36', 'transfer', 'messages', 'Hola, chicos: ¿estas gafas son ___ (vosotros)?', 'Привіт, хлопці! Ці окуляри ваші?', 'vuestras', [GENDER('vuestros', 'vuestras', 'gafas')], 'Hola, chicos: ¿estas gafas son vuestras?'),

  // article + tonic form (standalone)
  stand('T41', 'supported', 'family-home', 'Mi coche es rojo y ___ (tú) es azul.', 'Моя машина червона, а твоя — синя.', 'el tuyo', [['tuyo', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: el tuyo.'], ['el tu', { [STAND]: 'incorrect' }, 'Tu стоїть лише перед іменником; без іменника — el tuyo.']], 'Mi coche es rojo y el tuyo es azul.', { model: [['Mi casa es grande y la tuya es pequeña.', 'Мій будинок великий, а твій — маленький.']] }),
  stand('T42', 'supported', 'family-home', 'Mis llaves están aquí. ¿Y ___ (tú)?', 'Мої ключі тут. А твої?', 'las tuyas', [['tuyas', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: las tuyas.'], ['los tuyos', { [STAND]: 'incorrect' }, 'Llaves — жіночого роду: las tuyas.']], 'Mis llaves están aquí. ¿Y las tuyas?', { model: [['Mi móvil es nuevo y el tuyo es viejo.', 'Мій мобільний новий, а твій старий.']] }),
  stand('T43', 'independent', 'work-study', 'Tu ordenador es nuevo, pero ___ (yo) es muy viejo.', 'Твій комп’ютер новий, а мій дуже старий.', 'el mío', [['mío', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: el mío.'], ['el mio', { [STAND]: 'incorrect' }, 'Mío пишемо зі знаком наголосу: el mío.'], ['el mi', { [STAND]: 'incorrect' }, 'Mi стоїть лише перед іменником; без іменника — el mío.']], 'Tu ordenador es nuevo, pero el mío es muy viejo.'),
  stand('T44', 'independent', 'family-home', 'Nuestra casa está en el centro. ¿Dónde está ___ (vosotros)?', 'Наш будинок у центрі. А де ваш?', 'la vuestra', [['vuestra', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: la vuestra.'], ['el vuestro', { [STAND]: 'incorrect' }, 'Casa — жіночого роду: la vuestra.']], 'Nuestra casa está en el centro. ¿Dónde está la vuestra?'),
  stand('T45', 'independent', 'school', 'Mis profesores son simpáticos. ¿Y ___ (tú)?', 'Мої викладачі приємні. А твої?', 'los tuyos', [['tuyos', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: los tuyos.'], ['las tuyas', { [STAND]: 'incorrect' }, 'Profesores — чоловічого роду: los tuyos.']], 'Mis profesores son simpáticos. ¿Y los tuyos?', { withTon: true }),
  stand('T46', 'independent', 'shop', 'Esta mochila es de Ana y ___ (yo) es la azul.', 'Цей рюкзак — Анин, а мій — синій.', 'la mía', [['mía', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: la mía.'], ['la mia', { [STAND]: 'incorrect' }, 'Mía пишемо зі знаком наголосу: la mía.']], 'Esta mochila es de Ana y la mía es la azul.'),
  stand('T47', 'delayed', 'family-home', 'Mi perro es pequeño y ___ (ella) es muy grande.', 'Мій собака маленький, а її — дуже великий.', 'el suyo', [['suyo', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: el suyo.'], ['el su', { [STAND]: 'incorrect' }, 'Su стоїть лише перед іменником; без іменника — el suyo.']], 'Mi perro es pequeño y el suyo es muy grande.'),
  stand('T48', 'delayed', 'work-study', 'Vuestra clase empieza a las nueve y ___ (nosotros), a las diez.', 'Ваше заняття починається о дев’ятій, а наше — о десятій.', 'la nuestra', [['nuestra', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: la nuestra.']], 'Vuestra clase empieza a las nueve y la nuestra, a las diez.', { withTon: true }),
  stand('T49', 'transfer', 'messages', 'Hola, Marta: mi tren sale a las seis. ¿A qué hora sale ___ (tú)?', 'Привіт, Марто! Мій потяг відправляється о шостій. О котрій твій?', 'el tuyo', [['tuyo', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: el tuyo.']], 'Hola, Marta: mi tren sale a las seis. ¿A qué hora sale el tuyo?'),
  stand('T50', 'transfer', 'travel', 'Nuestra habitación es pequeña, pero ___ (vosotros) es grande.', 'Наш номер маленький, а ваш — великий.', 'la vuestra', [['vuestra', { [STAND]: 'incorrect' }, 'Щоб замінити іменник, потрібен артикль: la vuestra.']], 'Nuestra habitación es pequeña, pero la vuestra es grande.', { withTon: true }),
  choice(L, { id: 'T51', role: 'independent', family: 'travel', ts: [STAND_C], ask: 'На вокзалі стоять кілька валіз. Ви показуєте, котра з них ваша. Оберіть речення.', opts: [['Esta es la mía.', 'c'], ['Esta es mía.', 'c', 'Теж можливо, але це радше відповідь на «чия?», а не «котра?».'], ['Esta es mi.', 'x', 'Mi стоїть лише перед іменником.']], rule: R.stand, ok: 'Правильно: котра з кількох — es la mía.', no: 'Котра з кількох: Esta es la mía. *Es mi — помилка.' }),
  choice(L, { id: 'T52', role: 'delayed', family: 'family-home', ts: [STAND_C], ask: 'Вас питають: «¿De quién es este libro?» (Чия це книжка?). Оберіть відповідь.', opts: [['Es mío.', 'c'], ['Es mi.', 'x', 'Mi стоїть лише перед іменником: Es mío.'], ['Es el mi libro.', 'x', 'Перед mi артикль не ставимо: Es mi libro.']], rule: R.stand, ok: 'Правильно: на «чий?» — es mío.', no: 'На «чий?»: Es mío.' }),

  // mi vs mío (own)
  mm('T61', 'supported', 'family-home', '___ (yo) hermana vive en Valencia.', 'Моя сестра живе у Валенсії.', 'Mi', [['Mía', 'Перед іменником — mi: mi hermana.']], 'Mi hermana vive en Valencia.', [['El coche es mío. — Es mi coche.', 'Машина моя. — Це моя машина.']]),
  mm('T62', 'independent', 'work-study', '¿Es ___ (tú) este bolígrafo?', 'Це твоя ручка?', 'tuyo', [['tu', 'Без іменника після ser — tuyo.']], '¿Es tuyo este bolígrafo?'),
  mm('T63', 'independent', 'family-home', '___ (tú) padres son muy simpáticos.', 'Твої батьки дуже приємні.', 'Tus', [['Tuyos', 'Перед іменником — tus: tus padres.']], 'Tus padres son muy simpáticos.'),
  mm('T64', 'delayed', 'shop', 'Ese paraguas no es ___ (yo): es de Pablo.', 'Та парасолька не моя: вона Пабло.', 'mío', [['mi', 'Без іменника після ser — mío.'], ['mio', 'Mío пишемо зі знаком наголосу.']], 'Ese paraguas no es mío: es de Pablo.'),
  choice(L, { id: 'T65', role: 'independent', family: 'family-home', ts: [MM_C], ask: 'Оберіть правильний варіант.', es: 'Esta habitación es ___.', opts: [['mía', 'c'], ['mi', 'x', 'Без іменника — mía.']], rule: R.mm, ref: 'Esta habitación es mía.', ok: 'Правильно: без іменника — mía.', no: 'Без іменника — mía.' }),
  choice(L, { id: 'T66', role: 'transfer', family: 'messages', ts: [MM_C], ask: 'Допишіть повідомлення: оберіть правильний варіант.', es: 'Hola, Ana: ¿___ número de teléfono es nuevo?', opts: [['tu', 'c'], ['tuyo', 'x', 'Перед іменником — tu: tu número.']], rule: R.mm, ref: 'Hola, Ana: ¿tu número de teléfono es nuevo?', ok: 'Правильно: перед іменником — tu.', no: 'Перед іменником — tu: tu número.' }),
];

const T_DEM = TABLE_ES(['', 'masculino', 'femenino', 'neutro'], [
  ['aquí (cerca de mí)', 'este / estos', 'esta / estas', 'esto'],
  ['ahí (cerca de ti)', 'ese / esos', 'esa / esas', 'eso'],
  ['allí (lejos)', 'aquel / aquellos', 'aquella / aquellas', 'aquello'],
]);
const T_POSS = TABLE_ES(['antes del nombre', 'sin nombre', 'ejemplo'], [
  ['mi, mis', 'mío, mía, míos, mías', 'Es mío. El mío.'],
  ['tu, tus', 'tuyo, tuya, tuyos, tuyas', 'Es tuya. La tuya.'],
  ['su, sus', 'suyo, suya, suyos, suyas', 'Es suyo. El suyo.'],
  ['nuestro, nuestra…', 'nuestro, nuestra…', 'Es nuestra. La nuestra.'],
  ['vuestro, vuestra…', 'vuestro, vuestra…', 'Es vuestro. El vuestro.'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Цей, той, он той; мій, твій без іменника',
  termEs: 'demostrativos y posesivos tónicos',
  summaryUk: 'Вказуємо на речі (este, ese, aquel; esto, eso, aquello) і кажемо, чиє щось, не повторюючи іменник: Es mío. Mi coche es rojo y el tuyo es azul.',
  objectives: ['A2-02-O1', 'A2-02-O2'],
  situations: ['food-shopping', 'people-family-home', 'time-appointments-transport'],
  estimatedMinutes: 18,
  introduces: ['pron.demonstrative-agreement', 'pron.demonstrative-distance', 'pron.demonstrative-neuter', 'ortho.demonstrative-no-accent', 'poss.tonic-forms', 'poss.tonic-standalone', 'contrast.poss-mi-mio'],
  revisits: ['adj.agreement.o-a', 'poss.mi-tu-su', 'poss.nuestro-vuestro', 'poss.number-agreement', 'prep.de.possession', 'noun.gender.o-a'],
  steps: [
    s('s1', 'explanation', 'Este, ese, aquel', true, {
      blocks: [
        UK('Вказівні слова узгоджуються з іменником у роді й числі. Este — те, що поруч із вами; ese — поруч зі співрозмовником або трохи далі; aquel — далеко від обох. У розмові ese часто вживають і для далеких предметів.'),
        T_DEM,
        UK('Вказівне слово може замінити іменник, якщо зрозуміло, про що йдеться: Quiero este. За чинними правилами його пишемо без знака наголосу (не éste). Esto, eso, aquello вживаємо без іменника, коли предмет не названо або йдеться про ситуацію: ¿Qué es esto? Eso es genial.'),
        EX('¿Cuánto cuesta esta mochila?', 'Скільки коштує цей рюкзак?'),
        EX('—¿Qué bolso quieres? —Ese, el negro.', '— Яку сумку хочеш? — Ту, чорну.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Вказівні слова за зразком', true, { tasks: ['T01', 'T02', 'T11', 'T21', 'T28'] }),
    s('s3', 'explanation', 'Mío, tuyo, suyo: чиє це?', true, {
      blocks: [
        UK('Mi, tu, su стоять лише перед іменником. Без іменника вживаємо наголошені форми: mío, tuyo, suyo, nuestro, vuestro. Вони узгоджуються з тим, що належить: Esta maleta es mía (maleta — жіночого роду).'),
        T_POSS,
        UK('Es mío — «це моє» (відповідь на «чиє?»). Щоб не повторювати іменник, ставимо артикль: Mi coche es rojo y el tuyo es azul. Es el mío — «це той, що мій» (котрий із кількох). Suyo може означати «його, її, ваш, їхній» — власника видно з контексту.'),
        EX('—¿De quién es esta maleta? —Es mía.', '— Чия це валіза? — Моя.'),
        EX('Mis llaves están aquí. ¿Y las tuyas?', 'Мої ключі тут. А твої?'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Присвійні слова за зразком', true, { tasks: ['T31', 'T32', 'T41', 'T42', 'T61'] }),
    s('s5', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T06', 'T12', 'T22', 'T33', 'T43', 'T62'] }),
    s('s6', 'independent-practice', 'Додаткова практика', false, { tasks: ['T04', 'T05', 'T14', 'T23', 'T26', 'T29', 'T34', 'T44', 'T45', 'T46', 'T51', 'T63', 'T65'] }),
    s('s7', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'este / ese / aquel (+ -a, -os, -as) — узгоджуємо з іменником; без іменника пишемо без знака наголосу.',
          'esto, eso, aquello — без іменника: про незнайомий предмет або ситуацію.',
          'Перед іменником — mi, tu, su; без іменника — mío, tuyo, suyo (es mío; el mío).',
        ]),
        LINK('Потренувати вказівні й присвійні слова', [DEM, NEU, NOACC, TON, STAND, MM, DIST_C, STAND_C], 'written', 10),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-02.demonstratives-possessives',
    topicId: L,
    titleUk: 'Таблиці: вказівні та присвійні слова',
    blocks: [T_DEM, T_POSS, UK('Вказівні слова без іменника пишемо без знака наголосу: Quiero este. Перед іменником — mi, tu, su; без іменника — mío, tuyo, suyo.'), LINK('Практика', [DEM, NEU, TON, STAND, MM], 'written', 10)],
    linkedTargets: [DEM, DIST_C, NEU, NOACC, TON, STAND, MM],
  }),
];
