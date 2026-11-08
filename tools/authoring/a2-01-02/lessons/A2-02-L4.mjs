// A2-02-L4 — pronoun placement with infinitive and gerund frames (both reviewed placements accepted);
// written accent when a pronoun is attached to a gerund.
import { EX, LINK, LIST_UK, TABLE_UK, UK, gap, lesson as mkLesson, open, step } from '../lib.mjs';

const L = 'A2-02-L4';
const PIC = 'object-pron.placement-infinitive/construction-use';
const PIW = 'object-pron.placement-infinitive/written-form';
const PGC = 'object-pron.placement-gerund/construction-use';
const PGW = 'object-pron.placement-gerund/written-form';
const GA = 'ortho.gerund-pronoun-accent/written-form';

const R = {
  pi: 'З інфінітивом займенник можна поставити двома способами: перед особовою формою (Lo voy a comprar) або приєднати до інфінітива (Voy a comprarlo). Обидва варіанти правильні. Між a і інфінітивом чи між двома дієсловами займенник не ставимо.',
  pg: 'З estar + gerundio так само два варіанти: Lo estoy leyendo або Estoy leyéndolo. Обидва правильні.',
  ga: 'Коли займенник приєднано до форми gerundio, ставимо знак наголосу на тому складі, що був наголошений: leyendo → leyéndolo, comprando → comprándolo. З інфінітивом і одним займенником знака немає: comprarlo, verla.',
};
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
/** Gerund + attached pronoun with the written accent on the stressed vowel. */
const attach = (g, p) => g.replace(/yendo$/u, 'yéndo').replace(/iendo$/u, 'iéndo').replace(/ando$/u, 'ándo') + p;

/**
 * Both placements of one pronoun in a verb frame. f: {pre, conj, verb, pron, post, ger?}
 * conj = the conjugated part ("voy a", "quiero", "estoy"), verb = infinitive or gerund.
 */
function forms(f) {
  const pre = f.pre ?? '';
  const post = f.post ?? '';
  const attached = f.ger ? attach(f.verb, f.pron) : f.verb + f.pron;
  return {
    after: `${pre}${f.conj} ${attached}${post}`,
    before: `${pre}${f.pron} ${f.conj} ${f.verb}${post}`,
    between: `${pre}${f.conj.replace(/ a$/u, '')} ${f.conj.endsWith(' a') ? 'a ' : ''}${f.pron} ${f.verb}${post}`.replace(/\s+/gu, ' '),
    noAccent: `${pre}${f.conj} ${f.verb}${f.pron}${post}`,
  };
}
const sentenceCase = (x) => (/^[¿¡]/u.test(x) ? x.slice(0, 1) + cap(x.slice(1)) : cap(x));

/** Rewrite a sentence replacing the noun with a pronoun (written-form: placement only). */
function rewrite(id, role, family, t, es, uk, f, extra = {}) {
  const v = forms(f);
  const acc = [sentenceCase(v.after), sentenceCase(v.before)];
  const err = [[sentenceCase(v.between), { [t]: 'incorrect' }, f.ger ? 'Займенник не ставимо між estar і формою gerundio: перед estar або в кінці форми gerundio.' : 'Займенник не ставимо між дієсловами: перед особовою формою або в кінці інфінітива.']];
  if (f.ger) err.push([sentenceCase(v.noAccent), { [t]: 'unresolved' }, `Розміщення правильне, але з приєднаним займенником потрібен знак наголосу: ${acc[0]}`]);
  const ask = `${extra.model ? 'Подивіться на зразок. ' : ''}Перепишіть речення, замінивши ${extra.what ?? 'виділене'} займенником ${f.pron}. Можна обидва варіанти розміщення.`;
  return open(L, { id, role, family, ts: [t], ask, model: extra.model, es, uk, a: acc, err, rule: f.ger ? [R.pg, R.ga] : R.pi, full: acc[0], ok: `Правильно. Обидва варіанти можливі: ${acc[0]} / ${acc[1]}`, no: `Правильні варіанти: ${acc[0]} / ${acc[1]}` });
}
/** Answer in a dialogue: the learner chooses the pronoun and places it (construction-use). */
function reply(id, role, family, t, es, uk, f, wrongPron, fbWrong, full, extra = {}) {
  const v = forms(f);
  const w = forms({ ...f, pron: wrongPron });
  const acc = [v.after, v.before];
  const err = [
    [v.between, { [t]: 'incorrect' }, f.ger ? 'Займенник не ставимо між estar і формою gerundio.' : 'Займенник не ставимо між дієсловами.'],
    [w.after, { [t]: 'incorrect' }, fbWrong],
    [w.before, { [t]: 'incorrect' }, fbWrong],
  ];
  if (f.ger) err.push([v.noAccent, { [t]: 'unresolved' }, `Розміщення правильне, але з приєднаним займенником потрібен знак наголосу: ${v.after}`]);
  return open(L, { id, role, family, ts: [t], ask: `${extra.model ? 'Подивіться на зразок. ' : ''}Дайте відповідь: замініть названий предмет чи людину займенником. Впишіть пропущені слова.`, model: extra.model, es, uk, a: acc, err, rule: f.ger ? [R.pg, R.ga] : R.pi, full, ok: `Правильно. Можна і так, і так: ${v.after} / ${v.before}`, no: `Можливі відповіді: ${v.after} / ${v.before}` });
}
/** Attach the pronoun to the gerund (or to the infinitive, contrast without accent). */
const accent = (id, role, family, es, uk, a, wrong, full, model) =>
  gap(L, { id, role, family, t: GA, ask: `${model ? 'Подивіться на зразок. ' : ''}Приєднайте займенник до ${/ndo/u.test(a) ? 'форми gerundio' : 'інфінітива'} і впишіть одним словом.`, model, es, uk, a, err: [[wrong, /ndo/u.test(a) ? `З приєднаним до форми gerundio займенником пишемо знак наголосу: ${a}.` : `З інфінітивом і одним займенником знак наголосу не потрібен: ${a}.`]], rule: R.ga, full });

export const tasks = [
  // infinitive — rewrite (written-form)
  rewrite('T01', 'supported', 'shop', PIW, 'Voy a comprar el pan.', 'Я куплю хліб.', { conj: 'voy a', verb: 'comprar', pron: 'lo', post: '.' }, { what: 'el pan', model: [['Quiero ver la película. → Quiero verla. / La quiero ver.', 'Я хочу подивитися фільм.']] }),
  rewrite('T02', 'supported', 'family-home', PIW, 'Tengo que llamar a mi madre.', 'Мені треба подзвонити мамі.', { conj: 'tengo que', verb: 'llamar', pron: 'la', post: '.' }, { what: 'a mi madre', model: [['Voy a ayudar a Pablo. → Voy a ayudarlo. / Lo voy a ayudar.', 'Я допоможу Пабло.']] }),
  rewrite('T03', 'independent', 'free-time', PIW, 'Quiero ver esa película.', 'Я хочу подивитися той фільм.', { conj: 'quiero', verb: 'ver', pron: 'la', post: '.' }, { what: 'esa película' }),
  rewrite('T04', 'independent', 'shop', PIW, 'No puedo comprar estas gafas.', 'Я не можу купити ці окуляри.', { pre: 'no ', conj: 'puedo', verb: 'comprar', pron: 'las', post: '.' }, { what: 'estas gafas' }),
  rewrite('T05', 'independent', 'family-home', PIW, 'Mañana vamos a invitar a tus padres.', 'Завтра ми запросимо твоїх батьків.', { pre: 'mañana ', conj: 'vamos a', verb: 'invitar', pron: 'los', post: '.' }, { what: 'a tus padres' }),
  rewrite('T06', 'independent', 'school', PIW, 'Tienes que leer las preguntas.', 'Тобі треба прочитати запитання.', { conj: 'tienes que', verb: 'leer', pron: 'las', post: '.' }, { what: 'las preguntas' }),
  rewrite('T07', 'delayed', 'family-home', PIW, '¿Puedes cerrar la ventana?', 'Можеш зачинити вікно?', { pre: '¿', conj: 'puedes', verb: 'cerrar', pron: 'la', post: '?' }, { what: 'la ventana' }),
  rewrite('T08', 'delayed', 'shop', PIW, 'Voy a buscar las llaves.', 'Я пошукаю ключі.', { conj: 'voy a', verb: 'buscar', pron: 'las', post: '.' }, { what: 'las llaves' }),
  rewrite('T09', 'transfer', 'messages', PIW, '¡Hola, Ana! Esta tarde quiero ver a tus hermanos.', 'Привіт, Ано! Сьогодні ввечері я хочу побачити твоїх братів.', { pre: '¡Hola, Ana! Esta tarde ', conj: 'quiero', verb: 'ver', pron: 'los', post: '.' }, { what: 'a tus hermanos' }),
  rewrite('T10', 'transfer', 'travel', PIW, 'Tenemos que coger el tren de las ocho.', 'Нам треба сісти на потяг о восьмій.', { conj: 'tenemos que', verb: 'coger', pron: 'lo', post: '.' }, { what: 'el tren de las ocho' }),

  // infinitive — reply (construction-use)
  reply('T11', 'supported', 'family-home', PIC, '—¿Vas a llamar a Ana? —Sí, ___ (ir a + llamar) esta tarde.', '— Ти подзвониш Ані? — Так, сьогодні ввечері.', { conj: 'voy a', verb: 'llamar', pron: 'la' }, 'lo', 'Ana — жінка: la.', '—¿Vas a llamar a Ana? —Sí, voy a llamarla esta tarde.', { model: [['—¿Quieres este libro? —Sí, quiero leerlo. / Sí, lo quiero leer.', '— Хочеш цю книжку? — Так, хочу її прочитати.']] }),
  reply('T12', 'supported', 'shop', PIC, '—¿Compramos las manzanas aquí? —Sí, ___ (poder + comprar, nosotros) aquí.', '— Купимо яблука тут? — Так, можемо купити їх тут.', { conj: 'podemos', verb: 'comprar', pron: 'las' }, 'los', 'Manzanas — жіночого роду: las.', '—¿Compramos las manzanas aquí? —Sí, podemos comprarlas aquí.', { model: [['—¿Tienes que hacer la cena? —Sí, tengo que hacerla.', '— Тобі треба готувати вечерю? — Так, треба.']] }),
  reply('T13', 'independent', 'free-time', PIC, '—¿Vas a ver el concierto en la tele? —No, no ___ (ir a + ver). Prefiero leer.', '— Будеш дивитися концерт по телевізору? — Ні, не буду. Я краще почитаю.', { conj: 'voy a', verb: 'ver', pron: 'lo' }, 'la', 'Concierto — чоловічого роду: lo.', '—¿Vas a ver el concierto en la tele? —No, no voy a verlo. Prefiero leer.'),
  reply('T14', 'independent', 'family-home', PIC, '—¿Me ayudas con la maleta? —Claro, ___ (poder + ayudar, yo) ahora.', '— Допоможеш мені з валізою? — Звісно, зараз допоможу тобі.', { conj: 'puedo', verb: 'ayudar', pron: 'te' }, 'me', 'Допомагаєте співрозмовнику: te.', '—¿Me ayudas con la maleta? —Claro, puedo ayudarte ahora.'),
  reply('T15', 'independent', 'school', PIC, '—¿Haces los ejercicios hoy? —Sí, ___ (tener que + hacer, yo) hoy.', '— Ти робиш вправи сьогодні? — Так, мені треба їх зробити сьогодні.', { conj: 'tengo que', verb: 'hacer', pron: 'los' }, 'las', 'Ejercicios — чоловічого роду: los.', '—¿Haces los ejercicios hoy? —Sí, tengo que hacerlos hoy.'),
  reply('T16', 'independent', 'family-home', PIC, '—¿Invitas a Marta y a Carmen? —Sí, ___ (querer + invitar, yo) el sábado.', '— Запросиш Марту й Кармен? — Так, хочу запросити їх у суботу.', { conj: 'quiero', verb: 'invitar', pron: 'las' }, 'los', 'Марта і Кармен — жінки: las.', '—¿Invitas a Marta y a Carmen? —Sí, quiero invitarlas el sábado.'),
  reply('T17', 'delayed', 'shop', PIC, '—¿Te gusta esta mochila? —Sí, ___ (ir a + comprar, yo).', '— Тобі подобається цей рюкзак? — Так, я його куплю.', { conj: 'voy a', verb: 'comprar', pron: 'la' }, 'lo', 'Mochila — жіночого роду: la.', '—¿Te gusta esta mochila? —Sí, voy a comprarla.'),
  reply('T18', 'delayed', 'family-home', PIC, '—¿Nos esperas? —Sí, ___ (poder + esperar, yo) en la puerta.', '— Почекаєш нас? — Так, можу почекати вас біля дверей.', { conj: 'puedo', verb: 'esperar', pron: 'os' }, 'nos', 'Ви чекаєте співрозмовників (vosotros): os.', '—¿Nos esperas? —Sí, puedo esperaros en la puerta.'),
  reply('T19', 'transfer', 'messages', PIC, '¡Hola, Pablo! Tengo un número nuevo. ___ (ir a + escribir, yo) aquí: 655 12 34 56.', 'Привіт, Пабло! У мене новий номер. Напишу його тут: 655 12 34 56.', { conj: 'voy a', verb: 'escribir', pron: 'lo' }, 'la', 'Número — чоловічого роду: lo.', '¡Hola, Pablo! Tengo un número nuevo. Voy a escribirlo aquí: 655 12 34 56.'),
  reply('T20', 'transfer', 'work-study', PIC, '—¿Cuándo vas a leer el correo de Luis? —___ (ir a + leer) mañana por la mañana.', '— Коли ти прочитаєш листа від Луїса? — Завтра зранку.', { conj: 'voy a', verb: 'leer', pron: 'lo' }, 'la', 'Correo — чоловічого роду: lo.', '—¿Cuándo vas a leer el correo de Luis? —Voy a leerlo mañana por la mañana.'),

  // gerund — rewrite (written-form)
  rewrite('T21', 'supported', 'free-time', PGW, 'Estoy leyendo el periódico.', 'Я зараз читаю газету.', { conj: 'estoy', verb: 'leyendo', pron: 'lo', post: '.', ger: true }, { what: 'el periódico', model: [['Estoy viendo la película. → Estoy viéndola. / La estoy viendo.', 'Я зараз дивлюся фільм.']] }),
  rewrite('T22', 'supported', 'family-home', PGW, 'Mi padre está cocinando la cena.', 'Тато зараз готує вечерю.', { pre: 'mi padre ', conj: 'está', verb: 'cocinando', pron: 'la', post: '.', ger: true }, { what: 'la cena', model: [['Ana está escribiendo el mensaje. → Ana está escribiéndolo. / Ana lo está escribiendo.', 'Ана зараз пише повідомлення.']] }),
  rewrite('T23', 'independent', 'shop', PGW, 'Estamos buscando las gafas de Ana.', 'Ми зараз шукаємо окуляри Ани.', { conj: 'estamos', verb: 'buscando', pron: 'las', post: '.', ger: true }, { what: 'las gafas de Ana' }),
  rewrite('T24', 'independent', 'family-home', PGW, 'Los niños están esperando a su madre.', 'Діти зараз чекають маму.', { pre: 'los niños ', conj: 'están', verb: 'esperando', pron: 'la', post: '.', ger: true }, { what: 'a su madre' }),
  rewrite('T25', 'independent', 'free-time', PGW, 'Estoy escuchando la radio.', 'Я зараз слухаю радіо.', { conj: 'estoy', verb: 'escuchando', pron: 'la', post: '.', ger: true }, { what: 'la radio' }),
  rewrite('T26', 'independent', 'school', PGW, 'La profesora está explicando el problema.', 'Учителька зараз пояснює задачу.', { pre: 'la profesora ', conj: 'está', verb: 'explicando', pron: 'lo', post: '.', ger: true }, { what: 'el problema' }),
  rewrite('T27', 'delayed', 'family-home', PGW, 'Estoy haciendo la cama.', 'Я зараз застеляю ліжко.', { conj: 'estoy', verb: 'haciendo', pron: 'la', post: '.', ger: true }, { what: 'la cama' }),
  rewrite('T28', 'delayed', 'shop', PGW, '¿Estás comprando los billetes?', 'Ти зараз купуєш квитки?', { pre: '¿', conj: 'estás', verb: 'comprando', pron: 'los', post: '?', ger: true }, { what: 'los billetes' }),
  rewrite('T29', 'transfer', 'messages', PGW, '¡Hola, Marta! Estoy escribiendo el correo ahora.', 'Привіт, Марто! Я саме пишу листа.', { pre: '¡Hola, Marta! ', conj: 'estoy', verb: 'escribiendo', pron: 'lo', post: ' ahora.', ger: true }, { what: 'el correo' }),
  rewrite('T30', 'transfer', 'work-study', PGW, 'Luis está ayudando a sus padres en la tienda.', 'Луїс зараз допомагає батькам у крамниці.', { pre: 'Luis ', conj: 'está', verb: 'ayudando', pron: 'los', post: ' en la tienda.', ger: true }, { what: 'a sus padres' }),

  // gerund — reply (construction-use)
  reply('T31', 'supported', 'free-time', PGC, '—¿Dónde está el libro? —___ (estar + leer, yo) ahora, en el sofá.', '— Де книжка? — Я зараз її читаю, на дивані.', { conj: 'estoy', verb: 'leyendo', pron: 'lo', ger: true }, 'la', 'Libro — чоловічого роду: lo.', '—¿Dónde está el libro? —Estoy leyéndolo ahora, en el sofá.', { model: [['—¿Y la cena? —La estoy haciendo. / Estoy haciéndola.', '— А вечеря? — Я зараз її готую.']] }),
  reply('T32', 'supported', 'family-home', PGC, '—¿Y los niños? —Mi madre ___ (estar + esperar) en el parque.', '— А діти? — Мама зараз чекає їх у парку.', { conj: 'está', verb: 'esperando', pron: 'los', ger: true }, 'las', 'Niños — чоловічий рід: los.', '—¿Y los niños? —Mi madre está esperándolos en el parque.', { model: [['—¿Y Ana? —Pablo la está ayudando. / Pablo está ayudándola.', '— А Ана? — Пабло зараз їй допомагає.']] }),
  reply('T33', 'independent', 'family-home', PGC, '—¿Y la comida? —Tu padre ___ (estar + cocinar) ahora.', '— А обід? — Тато зараз його готує.', { conj: 'está', verb: 'cocinando', pron: 'la', ger: true }, 'lo', 'Comida — жіночого роду: la.', '—¿Y la comida? —Tu padre está cocinándola ahora.'),
  reply('T34', 'independent', 'free-time', PGC, '—¿Ves la película conmigo? —Ya ___ (estar + ver, yo). ¡Es genial!', '— Подивишся зі мною фільм? — Я вже його дивлюся. Він чудовий!', { conj: 'estoy', verb: 'viendo', pron: 'la', ger: true }, 'lo', 'Película — жіночого роду: la.', '—¿Ves la película conmigo? —Ya estoy viéndola. ¡Es genial!'),
  reply('T35', 'independent', 'shop', PGC, '—¿Tienes las fotos? —No, ___ (estar + buscar, yo) en el móvil.', '— Фото в тебе? — Ні, я зараз шукаю їх у телефоні.', { conj: 'estoy', verb: 'buscando', pron: 'las', ger: true }, 'los', 'Fotos — жіночого роду: las.', '—¿Tienes las fotos? —No, estoy buscándolas en el móvil.'),
  reply('T36', 'independent', 'family-home', PGC, '—¿Me estás escuchando? —Sí, ___ (estar + escuchar, yo).', '— Ти мене слухаєш? — Так, слухаю тебе.', { conj: 'estoy', verb: 'escuchando', pron: 'te', ger: true }, 'me', 'Ви слухаєте співрозмовника: te.', '—¿Me estás escuchando? —Sí, estoy escuchándote.'),
  reply('T37', 'delayed', 'school', PGC, '—¿Y los ejercicios? —Los alumnos ___ (estar + hacer) ahora.', '— А вправи? — Учні зараз їх роблять.', { conj: 'están', verb: 'haciendo', pron: 'los', ger: true }, 'las', 'Ejercicios — чоловічого роду: los.', '—¿Y los ejercicios? —Los alumnos están haciéndolos ahora.'),
  reply('T38', 'delayed', 'family-home', PGC, '—¿Dónde está Ana? —En la cocina. Su hermano ___ (estar + ayudar) con la cena.', '— Де Ана? — На кухні. Брат допомагає їй із вечерею.', { conj: 'está', verb: 'ayudando', pron: 'la', ger: true }, 'le', 'Ayudar — кого?: Ana → la.', '—¿Dónde está Ana? —En la cocina. Su hermano está ayudándola con la cena.'),
  reply('T39', 'transfer', 'messages', PGC, '—¿Y el mensaje para Luis? —___ (estar + escribir, yo) ahora mismo.', '— А повідомлення для Луїса? — Якраз зараз його пишу.', { conj: 'estoy', verb: 'escribiendo', pron: 'lo', ger: true }, 'la', 'Mensaje — чоловічого роду: lo.', '—¿Y el mensaje para Luis? —Estoy escribiéndolo ahora mismo.'),
  reply('T40', 'transfer', 'travel', PGC, '—¿Y los billetes de tren? —Pablo ___ (estar + comprar) en la estación.', '— А квитки на потяг? — Пабло зараз купує їх на вокзалі.', { conj: 'está', verb: 'comprando', pron: 'los', ger: true }, 'las', 'Billetes — чоловічого роду: los.', '—¿Y los billetes de tren? —Pablo está comprándolos en la estación.'),

  // accent with an attached pronoun
  accent('T41', 'supported', 'free-time', 'La estoy leyendo. → Estoy ___.', 'Я зараз її читаю.', 'leyéndola', 'leyendola', 'Estoy leyéndola.', [['Lo estoy comprando. → Estoy comprándolo.', 'Я зараз його купую.']]),
  accent('T42', 'supported', 'family-home', 'Los estoy esperando. → Estoy ___.', 'Я зараз їх чекаю.', 'esperándolos', 'esperandolos', 'Estoy esperándolos.', [['Te estoy llamando. → Estoy llamándote.', 'Я зараз тобі дзвоню.']]),
  accent('T43', 'independent', 'shop', 'Lo estamos comprando. → Estamos ___.', 'Ми зараз його купуємо.', 'comprándolo', 'comprandolo', 'Estamos comprándolo.'),
  accent('T44', 'independent', 'school', 'La está escribiendo. → Está ___.', 'Він зараз її пише.', 'escribiéndola', 'escribiendola', 'Está escribiéndola.'),
  accent('T45', 'independent', 'free-time', 'La voy a ver. → Voy a ___.', 'Я подивлюся його (фільм).', 'verla', 'vérla', 'Voy a verla.'),
  accent('T46', 'independent', 'family-home', 'Te estoy buscando. → Estoy ___.', 'Я тебе шукаю.', 'buscándote', 'buscandote', 'Estoy buscándote.'),
  accent('T47', 'delayed', 'family-home', 'Lo están haciendo. → Están ___.', 'Вони зараз це роблять.', 'haciéndolo', 'haciendolo', 'Están haciéndolo.'),
  accent('T48', 'delayed', 'shop', 'Las quiero comprar. → Quiero ___.', 'Я хочу їх купити.', 'comprarlas', 'comprárlas', 'Quiero comprarlas.'),
  accent('T49', 'transfer', 'messages', '¡Hola, Pablo! Os estoy esperando en el bar. → ¡Hola, Pablo! Estoy ___ en el bar.', 'Привіт, Пабло! Я чекаю вас у барі.', 'esperándoos', 'esperandoos', '¡Hola, Pablo! Estoy esperándoos en el bar.'),
  accent('T50', 'transfer', 'work-study', 'Nos está ayudando. → Está ___.', 'Він зараз нам допомагає.', 'ayudándonos', 'ayudandonos', 'Está ayudándonos.'),
];

const T_PLACE = TABLE_UK(['конструкція', 'займенник перед дієсловом', 'займенник у кінці'], [
  ['ir a + інфінітив', 'Lo voy a comprar.', 'Voy a comprarlo.'],
  ['querer / poder / tener que + інфінітив', 'La quiero ver.', 'Quiero verla.'],
  ['estar + gerundio', 'Lo estoy leyendo.', 'Estoy leyéndolo.'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Де стоїть займенник: voy a comprarlo, lo estoy leyendo',
  termEs: 'colocación de los pronombres con infinitivo y gerundio',
  summaryUk: 'З інфінітивом і формою gerundio займенник можна поставити перед особовою формою або приєднати в кінці: Lo voy a comprar = Voy a comprarlo; Lo estoy leyendo = Estoy leyéndolo (зі знаком наголосу).',
  objectives: ['A2-02-O5'],
  situations: ['food-shopping', 'people-family-home', 'routine-study-leisure'],
  estimatedMinutes: 18,
  introduces: ['object-pron.placement-infinitive', 'object-pron.placement-gerund', 'ortho.gerund-pronoun-accent'],
  revisits: ['object-pron.direct-1-2', 'object-pron.direct-3', 'object-pron.placement-finite', 'future-ir.ir-a-inf', 'querer.infinitive', 'obligation.tener-que', 'ability.poder-inf', 'progressive.estar-gerund'],
  steps: [
    s('s1', 'explanation', 'Займенник з інфінітивом', true, {
      blocks: [
        UK('Якщо в реченні є особова форма й інфінітив (voy a comprar, quiero ver, tengo que llamar, puedo ayudar), займенник можна поставити двома способами: перед особовою формою — Lo voy a comprar, або в кінці інфінітива, разом в одне слово — Voy a comprarlo. Обидва варіанти правильні й однаково вживані.'),
        UK('Між двома дієсловами займенник не ставимо: не *Voy a lo comprar, не *Quiero la ver. З інфінітивом і одним займенником знак наголосу не потрібен: comprarlo, verla, llamarte.'),
        T_PLACE,
        EX('—¿Vas a llamar a Ana? —Sí, voy a llamarla. / Sí, la voy a llamar.', '— Подзвониш Ані? — Так, подзвоню їй.'),
        EX('Tengo que hacer la cena. → Tengo que hacerla.', 'Мені треба приготувати вечерю.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. З інфінітивом за зразком', true, { tasks: ['T01', 'T02', 'T11', 'T12'] }),
    s('s3', 'explanation', 'Займенник з формою gerundio і знак наголосу', true, {
      blocks: [
        UK('З estar + gerundio (форма на -ando / -iendo) так само: Lo estoy leyendo або Estoy leyéndolo. Коли займенник приєднано до форми gerundio, слово стає довшим, і ми ставимо знак наголосу на тому складі, що був наголошений: leyendo → leyéndolo, comprando → comprándolo, escribiendo → escribiéndola.'),
        EX('Estoy viendo la película. → La estoy viendo. / Estoy viéndola.', 'Я зараз дивлюся фільм.'),
        EX('Mi madre está esperando a los niños. → Mi madre está esperándolos.', 'Мама зараз чекає дітей.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. З формою gerundio за зразком', true, { tasks: ['T21', 'T22', 'T31', 'T32', 'T41', 'T42'] }),
    s('s5', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T04', 'T13', 'T14', 'T23', 'T24', 'T33', 'T34', 'T43', 'T44'] }),
    s('s6', 'independent-practice', 'Додаткова практика', false, { tasks: ['T05', 'T06', 'T15', 'T16', 'T25', 'T26', 'T35', 'T36', 'T45', 'T46'] }),
    s('s7', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'Lo voy a comprar = Voy a comprarlo; la quiero ver = quiero verla.',
          'Lo estoy leyendo = Estoy leyéndolo — з приєднаним займенником форма gerundio має знак наголосу.',
          'Між двома дієсловами займенник не ставимо.',
        ]),
        LINK('Потренувати місце займенника', [PIC, PIW, PGC, PGW, GA], 'written', 10),
      ],
    }),
  ],
});
