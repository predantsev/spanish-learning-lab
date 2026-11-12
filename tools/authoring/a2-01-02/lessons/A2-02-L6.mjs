// A2-02-L6 — comparison: más / menos … que, tan … como, tanto … como, más de + number,
// mejor, peor, mayor / menor. Regular frames first, then the frequent exceptions.
import { EX, LINK, LIST_UK, TABLE_UK, UK, choice, gap, lesson as mkLesson, material, open, step } from '../lib.mjs';

const L = 'A2-02-L6';
const MQC = 'compare.mas-menos-que/construction-use';
const MQW = 'compare.mas-menos-que/written-form';
const TNC = 'compare.tan-como/construction-use';
const TNW = 'compare.tan-como/written-form';
const TTC = 'compare.tanto-como/construction-use';
const TTW = 'compare.tanto-como/written-form';
const MD = 'compare.mas-de-number/written-form';
const MD_C = 'compare.mas-de-number/context-choice';
const MJ = 'compare.mejor/written-form';
const MJ_C = 'compare.mejor/context-choice';
const PR = 'compare.peor/written-form';
const PR_C = 'compare.peor/context-choice';
const MY = 'compare.mayor-menor/written-form';
const MY_C = 'compare.mayor-menor/context-choice';

const R = {
  mq: 'Більше / менше: más або menos + прикметник (іменник, прислівник) + que: Este piso es más caro que ese. Прикметник узгоджується з тим, що описує: Esta casa es más cara. Після que — yo, tú: más alto que yo.',
  tn: 'Такий самий, як: tan + прикметник або прислівник + como: Mi piso es tan grande como el tuyo. Tan не змінюється, а прикметник узгоджується.',
  tt: 'Стільки ж, скільки: tanto, tanta, tantos, tantas + іменник + como — узгоджуємо з іменником: tantos libros como, tanta gente como. Після дієслова — tanto como: Trabajo tanto como tú.',
  md: 'Перед числом чи кількістю — más de / menos de: Cuesta más de veinte euros. Коли порівнюємо з людиною чи річчю — que: Cuesta más que el otro.',
  mj: 'Від bueno (добрий) і bien (добре) — mejor: Este café es mejor que ese. Cocinas mejor que yo. Множина — mejores; за родом mejor не змінюється.',
  pr: 'Від malo (поганий) і mal (погано) — peor: Este hotel es peor que el otro. Множина — peores; за родом peor не змінюється.',
  my: 'Про вік: mayor (старший), menor (молодший): Mi hermana es mayor que yo. Множина — mayores, menores. Про розмір — más grande, más pequeño.',
};
const KEY = '(+) — більше, (−) — менше, (=) — так само.';

/** Fill one comparison chunk (written-form). */
const w = (id, role, family, t, rule, es, uk, a, err, full, model) =>
  gap(L, { id, role, family, t, ask: `${model ? 'Подивіться на зразок. ' : ''}Впишіть порівняння за підказкою в дужках. ${KEY}`, model, es, uk, a, err, rule, full, open: Array.isArray(a) && a.length > 1 });
/** Build the comparison from the facts (construction-use): verb + comparison. */
const c = (id, role, family, t, rule, facts, es, uk, acc, err, full, model) =>
  open(L, { id, role, family, ts: [t], ask: `${model ? 'Подивіться на зразок. ' : ''}Прочитайте факти й допишіть речення порівнянням (з дієсловом).`, model, es: [facts, es], uk, a: acc, err: err.map(([x, fb]) => [x, { [t]: 'incorrect' }, fb]), rule, full, ok: `Правильно: ${full}`, no: `Можлива відповідь: ${full}` });

export const tasks = [
  // más / menos … que — written-form
  w('T01', 'supported', 'home', MQW, R.mq, 'Este piso es ___ (+ caro) ese.', 'Ця квартира дорожча за ту.', 'más caro que', [['más caro de', 'Порівнюємо з іншою квартирою: que, а не de.'], ['más cara que', 'Piso — чоловічого роду: caro.']], 'Este piso es más caro que ese.', [['Mi coche es más nuevo que el tuyo.', 'Моя машина новіша за твою.']]),
  w('T02', 'supported', 'home', MQW, R.mq, 'Mi barrio es ___ (− ruidoso) el centro.', 'Мій район менш галасливий, ніж центр.', 'menos ruidoso que', [['menos ruidoso como', 'Після más / menos — que.']], 'Mi barrio es menos ruidoso que el centro.', [['Esta calle es menos tranquila que la mía.', 'Ця вулиця менш спокійна, ніж моя.']]),
  w('T03', 'independent', 'home', MQW, R.mq, 'Esta casa es ___ (+ luminoso) la tuya.', 'Цей будинок світліший за твій.', 'más luminosa que', [['más luminoso que', 'Casa — жіночого роду: luminosa.']], 'Esta casa es más luminosa que la tuya.'),
  w('T04', 'independent', 'family-home', MQW, R.mq, 'Mi hermano es ___ (+ alto) yo.', 'Мій брат вищий за мене.', 'más alto que', [['más alto que mí', 'Після que — yo, а не mí.'], ['más alto de', 'Порівнюємо з людиною: que.']], 'Mi hermano es más alto que yo.'),
  w('T05', 'independent', 'shop', MQW, R.mq, 'Estas manzanas son ___ (− caro) esas.', 'Ці яблука дешевші, ніж ті.', 'menos caras que', [['menos caros que', 'Manzanas — жіночого роду, множина: caras.']], 'Estas manzanas son menos caras que esas.'),
  w('T06', 'independent', 'home', MQW, R.mq, 'Los pisos del centro son ___ (+ moderno) los de mi barrio.', 'Квартири в центрі сучасніші, ніж у моєму районі.', 'más modernos que', [['más moderno que', 'Pisos — множина: modernos.']], 'Los pisos del centro son más modernos que los de mi barrio.'),
  w('T07', 'delayed', 'free-time', MQW, R.mq, 'Ana tiene ___ (+ tiempo) yo.', 'Ана має більше часу, ніж я.', 'más tiempo que', [['más tiempo de', 'Порівнюємо з людиною: que.']], 'Ana tiene más tiempo que yo.'),
  w('T08', 'delayed', 'home', MQW, R.mq, 'El hotel es ___ (− cómodo) el piso.', 'Готель менш зручний, ніж квартира.', 'menos cómodo que', [['menos comodo que', 'Cómodo пишемо зі знаком наголосу.']], 'El hotel es menos cómodo que el piso.'),
  w('T09', 'transfer', 'messages', MQW, R.mq, '¡Hola, Marta! El piso nuevo es ___ (+ grande) el viejo. ¡Me encanta!', 'Привіт, Марто! Нова квартира більша за стару. Мені дуже подобається!', 'más grande que', [['más grande de', 'Порівнюємо з іншою квартирою: que.'], ['mayor que', 'Mayor — про вік; про розмір кажемо más grande.']], '¡Hola, Marta! El piso nuevo es más grande que el viejo. ¡Me encanta!'),
  w('T10', 'transfer', 'travel', MQW, R.mq, 'El tren es ___ (+ cómodo) el autobús.', 'Потяг зручніший за автобус.', 'más cómodo que', [['más cómodo de', 'Порівнюємо з автобусом: que.']], 'El tren es más cómodo que el autobús.'),

  // más / menos … que — construction-use
  c('T11', 'supported', 'home', MQC, R.mq, 'Piso A: 900 euros al mes. Piso B: 700 euros al mes.', 'El piso A ___ el piso B. (caro)', 'Квартира A дорожча, ніж квартира B.', ['es más caro que', 'cuesta más que'], [['es más caro de', 'Порівнюємо дві квартири: que.'], ['es más cara que', 'Piso — чоловічого роду: caro.']], 'El piso A es más caro que el piso B.', [['Calle A: ruidosa. Calle B: tranquila. → La calle A es más ruidosa que la calle B.', 'Вулиця A галасливіша за вулицю B.']]),
  c('T12', 'supported', 'family-home', MQC, R.mq, 'Pablo: 1,80 m. Luis: 1,70 m.', 'Luis ___ Pablo. (alto)', 'Луїс нижчий, ніж Пабло.', ['es menos alto que', 'es más bajo que'], [['es menos alto de', 'Порівнюємо з людиною: que.']], 'Luis es más bajo que Pablo.', [['Ana: 20 libros. Yo: 10 libros. → Ana tiene más libros que yo.', 'В Ани більше книжок, ніж у мене.']]),
  c('T13', 'independent', 'home', MQC, R.mq, 'Mi barrio: tranquilo. El centro: ruidoso.', 'El centro ___ mi barrio. (ruidoso)', 'Центр галасливіший, ніж мій район.', ['es más ruidoso que'], [['es más ruidosa que', 'Centro — чоловічого роду: ruidoso.']], 'El centro es más ruidoso que mi barrio.'),
  c('T14', 'independent', 'shop', MQC, R.mq, 'Bolso negro: 40 euros. Bolso rojo: 25 euros.', 'El bolso rojo ___ el negro. (barato)', 'Червона сумка дешевша, ніж чорна.', ['es más barato que', 'cuesta menos que', 'es menos caro que'], [['es más barata que', 'Bolso — чоловічого роду: barato.']], 'El bolso rojo es más barato que el negro.'),
  c('T15', 'independent', 'free-time', MQC, R.mq, 'Yo: trabajo 8 horas al día. Mi hermana: trabaja 6 horas.', 'Yo ___ mi hermana. (trabajar)', 'Я працюю більше, ніж сестра.', ['trabajo más que'], [['trabajo más de', 'Порівнюємо з людиною: que.']], 'Yo trabajo más que mi hermana.'),
  c('T16', 'independent', 'home', MQC, R.mq, 'Casa A: dos habitaciones. Casa B: cuatro habitaciones.', 'La casa A ___ la casa B. (grande)', 'Будинок A менший, ніж будинок B.', ['es más pequeña que', 'es menos grande que'], [['es más pequeño que', 'Casa — жіночого роду: pequeña.']], 'La casa A es más pequeña que la casa B.'),
  c('T17', 'delayed', 'family-home', MQC, R.mq, 'Ana: tres hermanos. Yo: un hermano.', 'Ana ___ yo. (hermanos)', 'В Ани більше братів, ніж у мене.', ['tiene más hermanos que'], [['tiene más hermanos que mí', 'Після que — yo.']], 'Ana tiene más hermanos que yo.'),
  c('T18', 'delayed', 'shop', MQC, R.mq, 'Tienda A: abre a las nueve. Tienda B: abre a las diez.', 'La tienda B ___ la tienda A. (tarde)', 'Крамниця B відчиняється пізніше, ніж крамниця A.', ['abre más tarde que'], [['abre más tarde de', 'Порівнюємо дві крамниці: que.']], 'La tienda B abre más tarde que la tienda A.'),
  c('T19', 'transfer', 'travel', MQC, R.mq, 'Tren a Madrid: 50 euros. Autobús a Madrid: 20 euros.', 'El autobús ___ el tren. (barato)', 'Автобус дешевший за потяг.', ['es más barato que', 'cuesta menos que', 'es menos caro que'], [['es más barato de', 'Порівнюємо з потягом: que.']], 'El autobús es más barato que el tren.'),
  c('T20', 'transfer', 'work-study', MQC, R.mq, 'Oficina de Luis: 10 personas. Oficina de Marta: 25 personas.', 'La oficina de Marta ___ la de Luis. (personas)', 'В офісі Марти більше людей, ніж в офісі Луїса.', ['tiene más personas que', 'tiene más gente que'], [['tiene más personas de', 'Порівнюємо два офіси: que.']], 'La oficina de Marta tiene más personas que la de Luis.'),

  // tan … como — written-form
  w('T21', 'supported', 'home', TNW, R.tn, 'Mi piso es ___ (= grande) el tuyo.', 'Моя квартира така сама велика, як твоя.', 'tan grande como', [['tanto grande como', 'Перед прикметником — tan, а не tanto.'], ['tan grande que', 'Після tan — como.']], 'Mi piso es tan grande como el tuyo.', [['Esta calle es tan tranquila como la mía.', 'Ця вулиця така ж спокійна, як моя.']]),
  w('T22', 'supported', 'family-home', TNW, R.tn, 'Ana es ___ (= alto) su madre.', 'Ана така сама висока, як її мама.', 'tan alta como', [['tan alto como', 'Ana — жінка: alta.'], ['tan alta que', 'Після tan — como.']], 'Ana es tan alta como su madre.', [['Pablo conduce tan bien como Luis.', 'Пабло водить так само добре, як Луїс.']]),
  w('T23', 'independent', 'home', TNW, R.tn, 'Este barrio es ___ (= tranquilo) el mío.', 'Цей район такий самий спокійний, як мій.', 'tan tranquilo como', [['tanto tranquilo como', 'Перед прикметником — tan.']], 'Este barrio es tan tranquilo como el mío.'),
  w('T24', 'independent', 'shop', TNW, R.tn, 'Estas gafas son ___ (= caro) esas.', 'Ці окуляри такі самі дорогі, як ті.', 'tan caras como', [['tan caros como', 'Gafas — жіночого роду, множина: caras.'], ['tantas caras como', 'Перед прикметником — незмінне tan.']], 'Estas gafas son tan caras como esas.'),
  w('T25', 'independent', 'free-time', TNW, R.tn, 'Mi hermano nada ___ (= bien) yo.', 'Мій брат плаває так само добре, як я.', 'tan bien como', [['tanto bien como', 'Перед прислівником — tan.']], 'Mi hermano nada tan bien como yo.'),
  w('T26', 'independent', 'home', TNW, R.tn, 'La cocina es ___ (= luminoso) mi habitación.', 'Кухня така сама світла, як моя кімната.', 'tan luminosa como', [['tan luminoso como', 'Cocina — жіночого роду: luminosa.']], 'La cocina es tan luminosa como mi habitación.'),
  w('T27', 'delayed', 'home', TNW, R.tn, 'El piso nuevo no es ___ (= cómodo) el viejo.', 'Нова квартира не така зручна, як стара.', 'tan cómodo como', [['tan comodo como', 'Cómodo пишемо зі знаком наголосу.']], 'El piso nuevo no es tan cómodo como el viejo.'),
  w('T28', 'delayed', 'family-home', TNW, R.tn, 'Mis amigas son ___ (= simpático) mis hermanas.', 'Мої подруги такі ж приємні, як мої сестри.', 'tan simpáticas como', [['tan simpáticos como', 'Amigas — жіночого роду, множина: simpáticas.']], 'Mis amigas son tan simpáticas como mis hermanas.'),
  w('T29', 'transfer', 'messages', TNW, R.tn, '¡Hola, Pablo! Valencia es ___ (= bonito) Barcelona.', 'Привіт, Пабло! Валенсія така сама гарна, як Барселона.', 'tan bonita como', [['tan bonito como', 'Valencia — місто, ciudad жіночого роду: bonita.']], '¡Hola, Pablo! Valencia es tan bonita como Barcelona.'),
  w('T30', 'transfer', 'work-study', TNW, R.tn, 'El trabajo nuevo no es ___ (= interesante) el otro.', 'Нова робота не така цікава, як інша.', 'tan interesante como', [['tanto interesante como', 'Перед прикметником — tan.']], 'El trabajo nuevo no es tan interesante como el otro.'),

  // tan … como — construction-use
  c('T31', 'supported', 'family-home', TNC, R.tn, 'Ana: 1,70 m. Marta: 1,70 m.', 'Ana ___ Marta. (alto)', 'Ана така сама висока, як Марта.', ['es tan alta como'], [['es tan alto como', 'Ana — жінка: alta.'], ['es tanto alta como', 'Перед прикметником — tan.']], 'Ana es tan alta como Marta.', [['Piso A: 80 m². Piso B: 80 m². → El piso A es tan grande como el piso B.', 'Квартира A така сама велика, як B.']]),
  c('T32', 'supported', 'home', TNC, R.tn, 'Calle A: tranquila. Calle B: tranquila.', 'La calle A ___ la calle B. (tranquilo)', 'Вулиця A така сама спокійна, як вулиця B.', ['es tan tranquila como'], [['es tan tranquilo como', 'Calle — жіночого роду: tranquila.']], 'La calle A es tan tranquila como la calle B.', [['Ana: cocina bien. Pablo: cocina bien. → Pablo cocina tan bien como Ana.', 'Пабло готує так само добре, як Ана.']]),
  c('T33', 'independent', 'shop', TNC, R.tn, 'Mochila azul: 30 euros. Mochila roja: 30 euros.', 'La mochila azul ___ la roja. (caro)', 'Синій рюкзак такий самий дорогий, як червоний.', ['es tan cara como', 'cuesta lo mismo que'], [['es tan caro como', 'Mochila — жіночого роду: cara.']], 'La mochila azul es tan cara como la roja.'),
  c('T34', 'independent', 'home', TNC, R.tn, 'Mi habitación: muy luminosa. Tu habitación: muy luminosa.', 'Mi habitación ___ la tuya. (luminoso)', 'Моя кімната така сама світла, як твоя.', ['es tan luminosa como'], [['es tan luminoso como', 'Habitación — жіночого роду: luminosa.']], 'Mi habitación es tan luminosa como la tuya.'),
  c('T35', 'independent', 'free-time', TNC, R.tn, 'Luis: nada muy bien. Carmen: nada muy bien.', 'Luis ___ Carmen. (bien)', 'Луїс плаває так само добре, як Кармен.', ['nada tan bien como'], [['nada tanto bien como', 'Перед прислівником — tan.']], 'Luis nada tan bien como Carmen.'),
  c('T36', 'independent', 'family-home', TNC, R.tn, 'Mis padres: simpáticos. Tus padres: simpáticos.', 'Mis padres ___ los tuyos. (simpático)', 'Мої батьки такі ж приємні, як твої.', ['son tan simpáticos como'], [['son tan simpático como', 'Padres — множина: simpáticos.']], 'Mis padres son tan simpáticos como los tuyos.'),
  c('T37', 'delayed', 'home', TNC, R.tn, 'Hotel A: cómodo. Hotel B: cómodo.', 'El hotel A ___ el hotel B. (cómodo)', 'Готель A такий самий зручний, як готель B.', ['es tan cómodo como'], [['es tan cómodo que', 'Після tan — como.']], 'El hotel A es tan cómodo como el hotel B.'),
  c('T38', 'delayed', 'shop', TNC, R.tn, 'Pan de esta tienda: bueno y barato. Pan del supermercado: bueno y barato.', 'El pan de esta tienda ___ el del supermercado. (barato)', 'Хліб у цій крамниці такий самий дешевий, як у супермаркеті.', ['es tan barato como'], [['es tanto barato como', 'Перед прикметником — tan.']], 'El pan de esta tienda es tan barato como el del supermercado.'),
  c('T39', 'transfer', 'travel', TNC, R.tn, 'Playa de Valencia: bonita. Playa de Barcelona: bonita.', 'La playa de Valencia ___ la de Barcelona. (bonito)', 'Пляж у Валенсії такий самий гарний, як у Барселоні.', ['es tan bonita como'], [['es tan bonito como', 'Playa — жіночого роду: bonita.']], 'La playa de Valencia es tan bonita como la de Barcelona.'),
  c('T40', 'transfer', 'work-study', TNC, R.tn, 'Marta: trabaja muy bien. Luis: trabaja muy bien.', 'Marta ___ Luis. (bien)', 'Марта працює так само добре, як Луїс.', ['trabaja tan bien como'], [['trabaja tanto bien como', 'Перед прислівником — tan.']], 'Marta trabaja tan bien como Luis.'),

  // tanto … como — written-form
  w('T41', 'supported', 'family-home', TTW, R.tt, 'Tengo ___ (= libros) tú.', 'У мене стільки ж книжок, скільки в тебе.', 'tantos libros como', [['tantas libros como', 'Libros — чоловічого роду: tantos.'], ['tan libros como', 'Перед іменником — tanto, tanta, tantos, tantas.']], 'Tengo tantos libros como tú.', [['Ana tiene tantas amigas como yo.', 'В Ани стільки ж подруг, скільки в мене.']]),
  w('T42', 'supported', 'home', TTW, R.tt, 'En mi barrio hay ___ (= gente) en el centro.', 'У моєму районі стільки ж людей, скільки в центрі.', 'tanta gente como', [['tanto gente como', 'Gente — жіночого роду: tanta.'], ['tantas gentes como', 'Gente — однина: tanta gente.']], 'En mi barrio hay tanta gente como en el centro.', [['No tengo tanto dinero como tú.', 'У мене немає стільки грошей, скільки в тебе.']]),
  w('T43', 'independent', 'free-time', TTW, R.tt, 'No tengo ___ (= tiempo) tú.', 'У мене немає стільки часу, скільки в тебе.', 'tanto tiempo como', [['tan tiempo como', 'Перед іменником — tanto.']], 'No tengo tanto tiempo como tú.'),
  w('T44', 'independent', 'home', TTW, R.tt, 'Este piso tiene ___ (= habitaciones) el tuyo.', 'У цій квартирі стільки ж кімнат, скільки у твоїй.', 'tantas habitaciones como', [['tantos habitaciones como', 'Habitaciones — жіночого роду: tantas.']], 'Este piso tiene tantas habitaciones como el tuyo.'),
  w('T45', 'independent', 'work-study', TTW, R.tt, 'Luis trabaja ___ (=) Marta.', 'Луїс працює стільки ж, скільки Марта.', 'tanto como', [['tan como', 'Після дієслова — tanto como.']], 'Luis trabaja tanto como Marta.'),
  w('T46', 'independent', 'shop', TTW, R.tt, 'No tengo ___ (= dinero) tú.', 'У мене немає стільки грошей, скільки в тебе.', 'tanto dinero como', [['tanta dinero como', 'Dinero — чоловічого роду: tanto.']], 'No tengo tanto dinero como tú.'),
  w('T47', 'delayed', 'family-home', TTW, R.tt, 'Mi hermana tiene ___ (= amigas) yo.', 'У моєї сестри стільки ж подруг, скільки в мене.', 'tantas amigas como', [['tantos amigas como', 'Amigas — жіночого роду: tantas.']], 'Mi hermana tiene tantas amigas como yo.'),
  w('T48', 'delayed', 'free-time', TTW, R.tt, 'Pablo no duerme ___ (=) yo.', 'Пабло спить не стільки, скільки я.', 'tanto como', [['tan como', 'Після дієслова — tanto como.']], 'Pablo no duerme tanto como yo.'),
  w('T49', 'transfer', 'messages', TTW, R.tt, '¡Hola, Ana! En mi barrio no hay ___ (= gente) en el centro.', 'Привіт, Ано! У моєму районі не так багато людей, як у центрі.', 'tanta gente como', [['tanto gente como', 'Gente — жіночого роду: tanta.']], '¡Hola, Ana! En mi barrio no hay tanta gente como en el centro.'),
  w('T50', 'transfer', 'travel', TTW, R.tt, 'Este hotel no tiene ___ (= habitaciones) el otro.', 'У цьому готелі не стільки номерів, як в іншому.', 'tantas habitaciones como', [['tantos habitaciones como', 'Habitaciones — жіночого роду: tantas.']], 'Este hotel no tiene tantas habitaciones como el otro.'),

  // tanto … como — construction-use
  c('T51', 'supported', 'family-home', TTC, R.tt, 'Ana: tres hermanos. Pablo: tres hermanos.', 'Ana ___ Pablo. (hermanos)', 'В Ани стільки ж братів, скільки в Пабло.', ['tiene tantos hermanos como'], [['tiene tantas hermanos como', 'Hermanos — чоловічого роду: tantos.'], ['tiene tan hermanos como', 'Перед іменником — tantos.']], 'Ana tiene tantos hermanos como Pablo.', [['Yo: 20 euros. Tú: 20 euros. → Tengo tanto dinero como tú.', 'У мене стільки ж грошей, скільки в тебе.']]),
  c('T52', 'supported', 'work-study', TTC, R.tt, 'Marta: trabaja 40 horas. Luis: trabaja 40 horas.', 'Marta ___ Luis. (trabajar)', 'Марта працює стільки ж, скільки Луїс.', ['trabaja tanto como', 'trabaja tantas horas como'], [['trabaja tan como', 'Після дієслова — tanto como.']], 'Marta trabaja tanto como Luis.', [['Yo: duermo 8 horas. Ana: duerme 8 horas. → Duermo tanto como Ana.', 'Я сплю стільки ж, скільки Ана.']]),
  c('T53', 'independent', 'home', TTC, R.tt, 'Piso A: tres habitaciones. Piso B: tres habitaciones.', 'El piso A ___ el piso B. (habitaciones)', 'У квартирі A стільки ж кімнат, скільки в B.', ['tiene tantas habitaciones como'], [['tiene tantos habitaciones como', 'Habitaciones — жіночого роду: tantas.']], 'El piso A tiene tantas habitaciones como el piso B.'),
  c('T54', 'independent', 'shop', TTC, R.tt, 'Tienda A: mucha gente. Tienda B: mucha gente.', 'En la tienda A hay ___ en la tienda B. (gente)', 'У крамниці A стільки ж людей, скільки в B.', ['tanta gente como'], [['tanto gente como', 'Gente — жіночого роду: tanta.']], 'En la tienda A hay tanta gente como en la tienda B.'),
  c('T55', 'independent', 'free-time', TTC, R.tt, 'Yo: leo mucho. Mi hermano: lee mucho.', 'Yo ___ mi hermano. (leer)', 'Я читаю стільки ж, скільки брат.', ['leo tanto como'], [['leo tan como', 'Після дієслова — tanto como.']], 'Yo leo tanto como mi hermano.'),
  c('T56', 'independent', 'family-home', TTC, R.tt, 'Carmen: dos hijas. Su hermana: dos hijas.', 'Carmen ___ su hermana. (hijas)', 'У Кармен стільки ж доньок, скільки в її сестри.', ['tiene tantas hijas como'], [['tiene tantos hijas como', 'Hijas — жіночого роду: tantas.']], 'Carmen tiene tantas hijas como su hermana.'),
  c('T57', 'delayed', 'free-time', TTC, R.tt, 'Pablo: mucho tiempo. Yo: mucho tiempo.', 'Pablo ___ yo. (tiempo)', 'У Пабло стільки ж часу, скільки в мене.', ['tiene tanto tiempo como'], [['tiene tanta tiempo como', 'Tiempo — чоловічого роду: tanto.']], 'Pablo tiene tanto tiempo como yo.'),
  c('T58', 'delayed', 'home', TTC, R.tt, 'Mi calle: muchos coches. Tu calle: muchos coches.', 'En mi calle hay ___ en la tuya. (coches)', 'На моїй вулиці стільки ж машин, скільки на твоїй.', ['tantos coches como'], [['tantas coches como', 'Coches — чоловічого роду: tantos.']], 'En mi calle hay tantos coches como en la tuya.'),
  c('T59', 'transfer', 'travel', TTC, R.tt, 'Hotel A: 50 habitaciones. Hotel B: 50 habitaciones.', 'El hotel A ___ el hotel B. (habitaciones)', 'У готелі A стільки ж номерів, скільки в B.', ['tiene tantas habitaciones como'], [['tiene tantos habitaciones como', 'Habitaciones — жіночого роду: tantas.']], 'El hotel A tiene tantas habitaciones como el hotel B.'),
  c('T60', 'transfer', 'messages', TTC, R.tt, 'Yo: 3 mensajes de Ana hoy. Tú: 3 mensajes de Ana hoy.', 'Hoy yo ___ tú. (mensajes)', 'Сьогодні я отримав стільки ж повідомлень, скільки ти.', ['tengo tantos mensajes como', 'recibo tantos mensajes como'], [['tengo tantas mensajes como', 'Mensajes — чоловічого роду: tantos.']], 'Hoy yo tengo tantos mensajes como tú.'),

  // más de / menos de + number
  w('T61', 'supported', 'shop', MD, R.md, 'Este bolso cuesta ___ (+) cien euros.', 'Ця сумка коштує понад сто євро.', 'más de', [['más que', 'Перед числом — más de.']], 'Este bolso cuesta más de cien euros.', [['Hay menos de diez personas.', 'Тут менше десяти людей.']]),
  w('T62', 'supported', 'home', MD, R.md, 'El alquiler cuesta ___ (−) mil euros.', 'Оренда коштує менше тисячі євро.', 'menos de', [['menos que', 'Перед числом — menos de.']], 'El alquiler cuesta menos de mil euros.', [['Cuesta más de veinte euros.', 'Коштує понад двадцять євро.']]),
  w('T63', 'independent', 'free-time', MD, R.md, 'En el concierto hay ___ (+) mil personas.', 'На концерті понад тисячу людей.', 'más de', [['más que', 'Перед числом — más de.']], 'En el concierto hay más de mil personas.'),
  w('T64', 'independent', 'work-study', MD, R.md, 'Trabajo ___ (+) ocho horas al día.', 'Я працюю понад вісім годин на день.', 'más de', [['más que', 'Перед числом — más de.']], 'Trabajo más de ocho horas al día.'),
  w('T65', 'independent', 'shop', MD, R.md, 'La mochila cuesta ___ (−) veinte euros.', 'Рюкзак коштує менше двадцяти євро.', 'menos de', [['menos que', 'Перед числом — menos de.']], 'La mochila cuesta menos de veinte euros.'),
  w('T66', 'independent', 'family-home', MD, R.md, 'Mi padre tiene ___ (+) sesenta años.', 'Моєму татові понад шістдесят років.', 'más de', [['más que', 'Перед числом — más de.']], 'Mi padre tiene más de sesenta años.'),
  w('T67', 'delayed', 'home', MD, R.md, 'Vivo a ___ (−) diez minutos del centro.', 'Я живу менш ніж за десять хвилин від центру.', 'menos de', [['menos que', 'Перед числом — menos de.']], 'Vivo a menos de diez minutos del centro.'),
  w('T68', 'delayed', 'shop', MD, R.md, 'En la tienda hay ___ (−) cinco personas.', 'У крамниці менше п’яти людей.', 'menos de', [['menos que', 'Перед числом — menos de.']], 'En la tienda hay menos de cinco personas.'),
  w('T69', 'transfer', 'travel', MD, R.md, 'Un billete de tren a Madrid cuesta ___ (+) cincuenta euros.', 'Квиток на потяг до Мадрида коштує понад п’ятдесят євро.', 'más de', [['más que', 'Перед числом — más de.']], 'Un billete de tren a Madrid cuesta más de cincuenta euros.'),
  w('T70', 'transfer', 'messages', MD, R.md, '¡Hola, Pablo! El piso cuesta ___ (−) setecientos euros al mes. ¿Lo vemos?', 'Привіт, Пабло! Квартира коштує менше семисот євро на місяць. Подивимося її?', 'menos de', [['menos que', 'Перед числом — menos de.']], '¡Hola, Pablo! El piso cuesta menos de setecientos euros al mes. ¿Lo vemos?'),
  choice(L, { id: 'T71', role: 'independent', family: 'shop', ts: [MD_C], ask: 'Оберіть правильний варіант.', es: 'Este móvil cuesta más ___ el otro.', opts: [['que', 'c'], ['de', 'x', 'Порівнюємо з іншим телефоном, а не з числом: que.']], rule: R.md, ref: 'Este móvil cuesta más que el otro.', ok: 'Правильно: порівнюємо з іншим телефоном — que.', no: 'Порівнюємо з іншим телефоном: más que.' }),
  choice(L, { id: 'T72', role: 'delayed', family: 'home', ts: [MD_C], ask: 'Оберіть правильний варіант.', es: 'En mi calle viven más ___ cincuenta personas.', opts: [['de', 'c'], ['que', 'x', 'Перед числом — más de.']], rule: R.md, ref: 'En mi calle viven más de cincuenta personas.', ok: 'Правильно: перед числом — más de.', no: 'Перед числом — más de cincuenta.' }),

  // mejor
  w('T73', 'supported', 'food-cafe', MJ, R.mj, 'Este café es ___ (+ bueno) ese.', 'Ця кава краща за ту.', 'mejor que', [['más bueno que', 'Від bueno порівняльна форма — mejor.'], ['mejor de', 'Порівнюємо з іншою кавою: que.']], 'Este café es mejor que ese.', [['Tu piso es mejor que el mío.', 'Твоя квартира краща за мою.']]),
  w('T74', 'supported', 'family-home', MJ, R.mj, 'Mi madre cocina ___ (+ bien) yo.', 'Мама готує краще за мене.', 'mejor que', [['más bien que', 'Від bien порівняльна форма — mejor.']], 'Mi madre cocina mejor que yo.', [['Hablas español mejor que yo.', 'Ти говориш іспанською краще за мене.']]),
  w('T75', 'independent', 'home', MJ, R.mj, 'Estos pisos son ___ (+ bueno) los del centro.', 'Ці квартири кращі, ніж у центрі.', 'mejores que', [['mejor que', 'Pisos — множина: mejores.'], ['más buenos que', 'Від bueno — mejor, у множині mejores.']], 'Estos pisos son mejores que los del centro.'),
  w('T76', 'independent', 'free-time', MJ, R.mj, 'Ana juega al fútbol ___ (+ bien) su hermano.', 'Ана грає у футбол краще за брата.', 'mejor que', [['más bien que', 'Від bien — mejor.']], 'Ana juega al fútbol mejor que su hermano.'),
  w('T77', 'independent', 'food-cafe', MJ, R.mj, 'Las manzanas de esta tienda son ___ (+ bueno) las del supermercado.', 'Яблука в цій крамниці кращі, ніж у супермаркеті.', 'mejores que', [['mejors que', 'Множина від mejor — mejores.']], 'Las manzanas de esta tienda son mejores que las del supermercado.'),
  w('T78', 'delayed', 'home', MJ, R.mj, 'Esta habitación es ___ (+ bueno) la otra: es más grande.', 'Ця кімната краща за іншу: вона більша.', 'mejor que', [['mejora que', 'Mejor за родом не змінюється.']], 'Esta habitación es mejor que la otra: es más grande.'),
  w('T79', 'transfer', 'travel', MJ, R.mj, 'El hotel del centro es ___ (+ bueno) el de la playa.', 'Готель у центрі кращий, ніж на пляжі.', 'mejor que', [['más bueno que', 'Від bueno — mejor.']], 'El hotel del centro es mejor que el de la playa.'),
  w('T80', 'transfer', 'work-study', MJ, R.mj, 'Marta habla inglés ___ (+ bien) yo.', 'Марта говорить англійською краще за мене.', 'mejor que', [['más bien que', 'Від bien — mejor.'], ['mejor que mí', 'Після que — yo.']], 'Marta habla inglés mejor que yo.'),
  choice(L, { id: 'T81', role: 'independent', family: 'food-cafe', ts: [MJ_C], ask: 'Оберіть варіант, що підходить.', es: 'Este restaurante es bueno, pero el otro es ___.', opts: [['mejor', 'c'], ['más bien', 'x', 'Від bueno — mejor.'], ['bueno', 'x', 'Тут порівняння: другий ресторан кращий — mejor.']], rule: R.mj, ref: 'Este restaurante es bueno, pero el otro es mejor.', ok: 'Правильно: bueno → mejor.', no: 'Порівняння від bueno — mejor.' }),
  choice(L, { id: 'T82', role: 'delayed', family: 'free-time', ts: [MJ_C], ask: 'Оберіть варіант, що підходить.', es: 'Mi hermano cocina bien, pero yo cocino ___.', opts: [['mejor', 'c'], ['más bueno', 'x', 'Тут про те, як готую (прислівник bien): mejor.'], ['más bien', 'x', 'Від bien — mejor.']], rule: R.mj, ref: 'Mi hermano cocina bien, pero yo cocino mejor.', ok: 'Правильно: bien → mejor.', no: 'Порівняння від bien — mejor.' }),

  // peor
  w('T83', 'supported', 'travel', PR, R.pr, 'Este hotel es ___ (+ malo) el otro.', 'Цей готель гірший за інший.', 'peor que', [['más malo que', 'Від malo порівняльна форма — peor.']], 'Este hotel es peor que el otro.', [['Mi coche es peor que el tuyo.', 'Моя машина гірша за твою.']]),
  w('T84', 'supported', 'free-time', PR, R.pr, 'Juego al fútbol ___ (+ mal) mi hermano.', 'Я граю у футбол гірше за брата.', 'peor que', [['más mal que', 'Від mal — peor.']], 'Juego al fútbol peor que mi hermano.', [['Duermo peor que tú.', 'Я сплю гірше за тебе.']]),
  w('T85', 'independent', 'home', PR, R.pr, 'Las fotos de mi móvil son ___ (+ malo) las de tu móvil.', 'Фото з мого телефона гірші, ніж з твого.', 'peores que', [['peor que', 'Fotos — множина: peores.']], 'Las fotos de mi móvil son peores que las de tu móvil.'),
  w('T86', 'independent', 'food-cafe', PR, R.pr, 'El café de aquí es ___ (+ malo) el de casa.', 'Кава тут гірша, ніж удома.', 'peor que', [['más malo que', 'Від malo — peor.']], 'El café de aquí es peor que el de casa.'),
  w('T87', 'independent', 'family-home', PR, R.pr, 'Mi hermano conduce ___ (+ mal) mi padre.', 'Мій брат водить гірше, ніж тато.', 'peor que', [['más mal que', 'Від mal — peor.']], 'Mi hermano conduce peor que mi padre.'),
  w('T88', 'delayed', 'home', PR, R.pr, 'Estas calles son ___ (+ malo) las del centro.', 'Ці вулиці гірші, ніж у центрі.', 'peores que', [['peors que', 'Множина від peor — peores.']], 'Estas calles son peores que las del centro.'),
  w('T89', 'transfer', 'work-study', PR, R.pr, 'El horario nuevo es ___ (+ malo) el viejo.', 'Новий розклад гірший за старий.', 'peor que', [['más malo que', 'Від malo — peor.']], 'El horario nuevo es peor que el viejo.'),
  w('T90', 'transfer', 'messages', PR, R.pr, '¡Hola, Ana! El tiempo aquí es ___ (+ malo) en Valencia: llueve mucho.', 'Привіт, Ано! Погода тут гірша, ніж у Валенсії: дуже дощить.', 'peor que', [['más malo que', 'Від malo — peor.']], '¡Hola, Ana! El tiempo aquí es peor que en Valencia: llueve mucho.'),
  choice(L, { id: 'T91', role: 'independent', family: 'free-time', ts: [PR_C], ask: 'Оберіть варіант, що підходить.', es: 'La película es mala, pero el libro es ___.', opts: [['peor', 'c'], ['más mal', 'x', 'Від malo — peor.'], ['mejor', 'x', 'Mejor — краще; тут «ще гірший».']], rule: R.pr, ref: 'La película es mala, pero el libro es peor.', ok: 'Правильно: malo → peor.', no: 'Порівняння від malo — peor.' }),
  choice(L, { id: 'T92', role: 'delayed', family: 'home', ts: [PR_C], ask: 'Оберіть варіант, що підходить.', es: 'Mi piso es pequeño, pero el tuyo es ___: no tiene ventanas.', opts: [['peor', 'c'], ['más malo', 'x', 'Моделлю вчимо peor.'], ['mayor', 'x', 'Mayor — про вік.']], rule: R.pr, ref: 'Mi piso es pequeño, pero el tuyo es peor: no tiene ventanas.', ok: 'Правильно: peor.', no: 'Тут потрібне peor.' }),

  // mayor / menor
  w('T93', 'supported', 'family-home', MY, R.my, 'Mi hermana tiene treinta años y yo veinte: ella es ___ (+ edad) yo.', 'Моїй сестрі тридцять, а мені двадцять: вона старша за мене.', 'mayor que', [['más mayor que', 'Mayor уже означає «старший»; más не додаємо.'], ['más vieja que', 'Про вік людей кажемо mayor.']], 'Mi hermana tiene treinta años y yo veinte: ella es mayor que yo.', [['Mi hermano es menor que yo.', 'Мій брат молодший за мене.']]),
  w('T94', 'supported', 'family-home', MY, R.my, 'Mis hermanos son ___ (− edad) yo.', 'Мої брати молодші за мене.', 'menores que', [['menor que', 'Hermanos — множина: menores.']], 'Mis hermanos son menores que yo.', [['Mis hermanas son mayores que yo.', 'Мої сестри старші за мене.']]),
  w('T95', 'independent', 'family-home', MY, R.my, 'Pablo tiene diez años y Luis doce: Pablo es ___ (− edad) Luis.', 'Пабло десять років, а Луїсу дванадцять: Пабло молодший за Луїса.', 'menor que', [['más menor que', 'Menor уже означає «молодший».']], 'Pablo tiene diez años y Luis doce: Pablo es menor que Luis.'),
  w('T96', 'independent', 'family-home', MY, R.my, 'Mis padres son ___ (+ edad) yo, claro.', 'Мої батьки, звісно, старші за мене.', 'mayores que', [['mayor que', 'Padres — множина: mayores.']], 'Mis padres son mayores que yo, claro.'),
  w('T97', 'independent', 'school', MY, R.my, 'En mi clase, Ana es ___ (+ edad) todos.', 'У моєму класі Ана старша за всіх.', 'mayor que', [['más mayor que', 'Mayor уже означає «старший».']], 'En mi clase, Ana es mayor que todos.'),
  w('T98', 'delayed', 'family-home', MY, R.my, 'Mis dos hermanos son ___ (+ edad) yo: tienen cuarenta años.', 'Мої двоє братів старші за мене: їм по сорок років.', 'mayores que', [['mayor que', 'Hermanos — множина: mayores.']], 'Mis dos hermanos son mayores que yo: tienen cuarenta años.'),
  w('T99', 'transfer', 'work-study', MY, R.my, 'Mi profesora de inglés es ___ (− edad) yo: tiene veinte años.', 'Моя викладачка англійської молодша за мене: їй двадцять.', 'menor que', [['más menor que', 'Menor уже означає «молодша».']], 'Mi profesora de inglés es menor que yo: tiene veinte años.'),
  w('T100', 'transfer', 'messages', MY, R.my, '¡Hola, Marta! ¿Tu hermano es ___ (+ edad) tú?', 'Привіт, Марто! Твій брат старший за тебе?', 'mayor que', [['más mayor que', 'Mayor уже означає «старший».']], '¡Hola, Marta! ¿Tu hermano es mayor que tú?'),
  w('T103', 'independent', 'shop', MJ, R.mj, 'Esta mochila es ___ (+ bueno) la mía.', 'Цей рюкзак кращий за мій.', 'mejor que', [['más buena que', 'Від bueno — mejor; за родом не змінюється.']], 'Esta mochila es mejor que la mía.'),
  w('T104', 'delayed', 'free-time', MJ, R.mj, 'Mis amigos bailan ___ (+ bien) yo.', 'Мої друзі танцюють краще за мене.', 'mejor que', [['más bien que', 'Від bien — mejor.']], 'Mis amigos bailan mejor que yo.'),
  w('T105', 'independent', 'shop', PR, R.pr, 'Este móvil es ___ (+ malo) el tuyo.', 'Цей телефон гірший за твій.', 'peor que', [['más malo que', 'Від malo — peor.']], 'Este móvil es peor que el tuyo.'),
  w('T106', 'delayed', 'family-home', PR, R.pr, 'Hablo inglés ___ (+ mal) mis hijos.', 'Я говорю англійською гірше, ніж мої діти.', 'peor que', [['más mal que', 'Від mal — peor.']], 'Hablo inglés peor que mis hijos.'),
  w('T107', 'independent', 'family-home', MY, R.my, 'Mi hermana pequeña es ___ (− edad) yo.', 'Моя молодша сестра молодша за мене.', 'menor que', [['más menor que', 'Menor уже означає «молодша».']], 'Mi hermana pequeña es menor que yo.'),
  w('T108', 'delayed', 'free-time', MY, R.my, 'Los amigos de mi hijo son ___ (+ edad) él.', 'Друзі мого сина старші за нього.', 'mayores que', [['mayor que', 'Amigos — множина: mayores.']], 'Los amigos de mi hijo son mayores que él.'),
  choice(L, { id: 'T101', role: 'independent', family: 'family-home', ts: [MY_C], ask: 'Ідеться про розмір будинку. Оберіть варіант.', es: 'La casa de mis padres es ___ que mi piso.', opts: [['más grande', 'c'], ['mayor', 'x', 'Mayor уживаємо про вік людей; про розмір — más grande.']], rule: R.my, ref: 'La casa de mis padres es más grande que mi piso.', ok: 'Правильно: про розмір — más grande.', no: 'Про розмір — más grande.' }),
  choice(L, { id: 'T102', role: 'delayed', family: 'family-home', ts: [MY_C], ask: 'Ідеться про вік. Оберіть варіант.', es: 'Mi hermana tiene cuarenta años: es ___ que yo.', opts: [['mayor', 'c'], ['más grande', 'x', 'Про вік людей — mayor.']], rule: R.my, ref: 'Mi hermana tiene cuarenta años: es mayor que yo.', ok: 'Правильно: про вік — mayor.', no: 'Про вік — mayor.' }),
];

const T_CMP = TABLE_UK(['що порівнюємо', 'конструкція', 'приклад'], [
  ['більше / менше', 'más / menos + прикм. + que', 'Este piso es más caro que ese.'],
  ['така сама якість', 'tan + прикм. / присл. + como', 'Mi piso es tan grande como el tuyo.'],
  ['стільки ж (з іменником)', 'tanto / tanta / tantos / tantas + ім. + como', 'Tengo tantos libros como tú.'],
  ['стільки ж (з дієсловом)', 'дієслово + tanto como', 'Trabajo tanto como tú.'],
  ['перед числом', 'más de / menos de', 'Cuesta más de veinte euros.'],
]);
const T_IRR = TABLE_UK(['звичайна форма', 'порівняння', 'приклад'], [
  ['bueno, bien', 'mejor, mejores', 'Este café es mejor que ese.'],
  ['malo, mal', 'peor, peores', 'Este hotel es peor que el otro.'],
  ['вік: старший', 'mayor, mayores', 'Mi hermana es mayor que yo.'],
  ['вік: молодший', 'menor, menores', 'Mi hermano es menor que yo.'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Порівнюємо: más caro que, tan grande como, mejor',
  termEs: 'comparativos',
  summaryUk: 'Порівнюємо дві знайомі речі, місця чи людей: más / menos … que, tan … como, tanto … como, más de + число, а також mejor, peor, mayor і menor.',
  objectives: ['A2-02-O7', 'A2-02-O8'],
  situations: ['places-accommodation', 'food-shopping', 'people-family-home'],
  estimatedMinutes: 20,
  introduces: ['compare.mas-menos-que', 'compare.tan-como', 'compare.tanto-como', 'compare.mas-de-number', 'compare.mejor', 'compare.peor', 'compare.mayor-menor'],
  revisits: ['adj.agreement.o-a', 'noun.gender.o-a', 'pron.subject'],
  steps: [
    s('s1', 'explanation', 'Більше чи менше: más … que', true, {
      blocks: [
        UK('Щоб сказати «дорожчий», «менш галасливий», ставимо más або menos перед прикметником, а після нього — que: Este piso es más caro que ese. Прикметник узгоджується з тим, що описує: Esta casa es más cara. Після que уживаємо yo, tú: Mi hermano es más alto que yo.'),
        UK('Нові слова для опису житла: cómodo — зручний, moderno — сучасний, antiguo — старий, старовинний, tranquilo — спокійний, ruidoso — галасливий, luminoso — світлий, céntrico — у центрі; el barrio — район, el jardín — сад, la terraza — тераса, el alquiler — оренда, la gente — люди.'),
        EX('Mi barrio es más tranquilo que el centro.', 'Мій район спокійніший, ніж центр.'),
        EX('Ana tiene más libros que yo.', 'В Ани більше книжок, ніж у мене.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Más / menos … que', true, { tasks: ['T01', 'T02', 'T11', 'T12'] }),
    s('s3', 'explanation', 'Так само: tan … como, tanto … como, más de', true, {
      blocks: [
        UK('Рівність якості: tan + прикметник або прислівник + como: Mi piso es tan grande como el tuyo. Рівність кількості: tanto, tanta, tantos, tantas + іменник + como (узгоджуємо з іменником; gente — жіночий рід, однина): tanta gente como. Після дієслова — tanto como: Trabajo tanto como tú. Перед числом — más de, menos de: Cuesta más de veinte euros.'),
        T_CMP,
        EX('No tengo tanto tiempo como tú.', 'У мене немає стільки часу, скільки в тебе.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Tan, tanto, más de', true, { tasks: ['T21', 'T22', 'T31', 'T41', 'T42', 'T51', 'T61', 'T62'] }),
    s('s5', 'explanation', 'Особливі форми: mejor, peor, mayor, menor', true, {
      blocks: [
        UK('Від bueno (добрий, хороший) і bien (добре) — mejor; від malo (поганий) і mal (погано) — peor. Про вік людей — mayor (старший) і menor (молодший). За родом ці форми не змінюються, у множині — mejores, peores, mayores, menores. Про розмір кажемо más grande, más pequeño.'),
        T_IRR,
        EX('Mi madre cocina mejor que yo.', 'Мама готує краще за мене.'),
        EX('Mi hermana es mayor que yo.', 'Моя сестра старша за мене.'),
      ],
    }),
    s('s6', 'supported-practice', 'Крок 3. Mejor, peor, mayor, menor', true, { tasks: ['T73', 'T74', 'T83', 'T93'] }),
    s('s7', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T13', 'T23', 'T33', 'T43', 'T53', 'T63', 'T71', 'T75', 'T85', 'T95', 'T101'] }),
    s('s8', 'independent-practice', 'Додаткова практика', false, { tasks: ['T04', 'T05', 'T06', 'T14', 'T15', 'T16', 'T24', 'T25', 'T26', 'T34', 'T35', 'T36', 'T44', 'T45', 'T46', 'T54', 'T55', 'T56', 'T64', 'T65', 'T66', 'T76', 'T77', 'T81', 'T86', 'T87', 'T91', 'T96', 'T97', 'T32', 'T52', 'T84', 'T94', 'T103', 'T105', 'T107'] }),
    s('s9', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'más / menos … que; tan … como (якість); tanto, tanta, tantos, tantas … como (кількість).',
          'Перед числом — más de, menos de.',
          'mejor, peor, mayor, menor — без más; множина -es.',
        ]),
        LINK('Потренувати порівняння', [MQW, MQC, TNW, TNC, TTW, TTC, MD, MJ, PR, MY], 'written', 12),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-02.comparison',
    topicId: L,
    titleUk: 'Таблиці: порівняння',
    blocks: [T_CMP, T_IRR, LINK('Практика', [MQW, TNW, TTW, MD, MJ, PR, MY], 'written', 10)],
    linkedTargets: [MQW, MQC, TNW, TNC, TTW, TTC, MD, MJ, PR, MY],
  }),
];
