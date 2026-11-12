// A2-02-L3 — indirect object pronouns (recipient), doubling with a + recipient, prepositional pronouns,
// conmigo/contigo, su → de él / de ella, mí vs mi; listening for pronoun reference.
import { EX, LINK, LIST_UK, TABLE_UK, UK, choice, clip, dictation, gap, lesson as mkLesson, material, open, step } from '../lib.mjs';

const L = 'A2-02-L3';
const IF = 'object-pron.indirect-forms/written-form';
const IR = 'object-pron.indirect-recipient/construction-use';
const IR_R = 'object-pron.indirect-recipient/reading-meaning';
const ID = 'object-pron.indirect-doubling/construction-use';
const PP = 'pron.prepositional/written-form';
const CC = 'pron.conmigo-contigo/written-form';
const SU = 'poss.su-clarification/construction-use';
const SU_R = 'poss.su-clarification/reading-meaning';
const MI = 'ortho.accent-pair.mi/written-form';
const MI_C = 'ortho.accent-pair.mi/context-choice';
const LIS = 'listening.pronoun-reference/listening-meaning';
const LIS_D = 'listening.pronoun-reference/dictation';
const C1 = 'clip.a2-02.l3.shop-gift';
const C2 = 'clip.a2-02.l3.home-keys';
const C3 = 'clip.a2-02.l3.short-gift';

const R = {
  if: 'Кому? — me (мені), te (тобі), le (йому, їй, вам — usted), nos (нам), os (вам — vosotros), les (їм, вам — ustedes).',
  ir: 'Займенник непрямого додатка показує, кому щось дають, кажуть, пишуть, пояснюють. Він стоїть перед особовою формою дієслова: Le doy el regalo. ¿Me dices tu número?',
  id: 'Якщо отримувача названо через a + ім’я, le чи les зазвичай теж ставимо: Le doy el libro a Marta. Les explico la tarea a los alumnos. З a mí, a ti займенник обов’язковий: A mí me escribe Ana.',
  pp: 'Після прийменника (a, para, de, sin…) уживаємо mí і ti, а для інших осіб — форми підмета: para mí, para ti, para él, para ella, para usted, para nosotros, para vosotros, para ellos.',
  cc: 'Після con: conmigo (зі мною), contigo (з тобою). Для інших осіб — звичайні форми: con él, con ella, con usted, con nosotros.',
  su: 'Su може означати «його, її, ваш, їхній». Щоб уточнити, кажемо: артикль + іменник + de + займенник: la casa de él, la casa de ella, los libros de ellos.',
  mi: 'Mí зі знаком наголосу — займенник після прийменника: para mí, a mí. Mi без знака — присвійне слово перед іменником: mi casa. Ti знака наголосу не має ніколи.',
};
const ASK_IR = 'Хто отримувач? Впишіть займенник і дієслово з дужок у правильній формі.';

// recipient pronoun + verb: the construction (placement, recipient role) and the pronoun form are separate targets
function rec(id, role, family, es, uk, a, extra = {}) {
  const err = [];
  if (extra.misplaced) err.push([extra.misplaced, { [IR]: 'incorrect', [IF]: 'correct' }, `Займенник стоїть перед дієсловом: ${a}.`]);
  for (const [t, fb] of extra.wrong ?? []) err.push([t, { [IR]: 'correct', [IF]: 'incorrect' }, fb]);
  // the pronoun is right, the verb ending is not a target of this task
  for (const [t, fb] of extra.verbWrong ?? []) err.push([t, { [IR]: 'unresolved', [IF]: 'correct' }, fb]);
  return open(L, { id, role, family, ts: [IR, IF], ask: extra.ask ?? (extra.model ? `Подивіться на зразок. ${ASK_IR}` : ASK_IR), model: extra.model, es, uk, a: [a], err, rule: [R.ir, R.if], full: extra.full, ok: `Правильно: ${a}.`, no: `Правильна відповідь: ${a}.` });
}
// doubling: build the whole sentence from the given parts
function dbl(id, role, family, parts, uk, acc, err, extra = {}) {
  return open(L, { id, role, family, ts: [ID], ask: extra.ask ?? (extra.model ? 'Подивіться на зразок і складіть речення з поданих частин. Назвіть отримувача і займенником, і через a.' : 'Складіть речення з поданих частин. Назвіть отримувача і займенником, і через a.'), model: extra.model, es: parts, uk, a: acc, err: err.map(([t, fb]) => [t, { [ID]: 'incorrect' }, fb]), rule: R.id, full: acc[0], ok: 'Правильно.', no: `Можлива відповідь: ${acc[0]}` });
}
const pp = (id, role, family, es, uk, a, err, model) =>
  gap(L, { id, role, family, t: PP, ask: model ? 'Подивіться на зразок і впишіть займенник для особи з дужок.' : 'Впишіть займенник для особи з дужок.', model, es, uk, a, err, rule: R.pp });
const cc = (id, role, family, es, uk, a, err, model) =>
  gap(L, { id, role, family, t: CC, ask: model ? 'Подивіться на зразок і впишіть con + займенник для особи з дужок.' : 'Впишіть con + займенник для особи з дужок.', model, es, uk, a, err, rule: R.cc });
const NOCON = (a) => [`con ${a === 'conmigo' ? 'mí' : 'ti'}`, `Після con — особлива форма: ${a}.`];
const su = (id, role, family, ask, es, uk, a, err, full, model) =>
  open(L, { id, role, family, ts: [SU], ask: model ? `Подивіться на зразок. ${ask}` : ask, model, es, uk, a, err: err.map(([t, fb]) => [t, { [SU]: 'incorrect' }, fb]), rule: R.su, closed: a.length === 1, full, ok: `Правильно: ${full}`, no: `Правильна відповідь: ${full}` });
const mi = (id, role, family, es, uk, a, full, model) =>
  gap(L, { id, role, family, t: MI, ask: model ? 'Подивіться на зразок: mi чи mí? Впишіть потрібне слово.' : 'Mi чи mí? Впишіть потрібне слово.', model, es, uk, a, err: [[a === 'mí' ? 'mi' : 'mí', a === 'mí' ? 'Після прийменника — займенник зі знаком наголосу: mí.' : 'Перед іменником — присвійне слово без знака наголосу: mi.']], rule: R.mi, full });

const TR = {
  [C1]: '—Buenos días. Busco unas gafas de sol para mi hermana. —¿Estas? Son muy bonitas. —Sí, me gustan. ¿Cuánto cuestan? —Treinta euros. —Vale, las compro. Le regalo las gafas el sábado, por su cumpleaños.',
  [C2]: '—Mamá, ¿dónde están mis llaves? —No sé, hijo. ¿Las tiene tu padre? —No, él no las tiene. —¿Y tu hermana? Ella siempre coge tus llaves. —¡Es verdad! Ahora le escribo un mensaje.',
  [C3]: '¿Las gafas? Las tengo yo. Mañana le regalo las gafas a Marta.',
};

export const tasks = [
  // recipient + indirect form
  rec('T01', 'supported', 'family-home', 'Mañana es el cumpleaños de mi padre: ___ (regalar, yo) un libro.', 'Завтра в тата день народження: я дарую йому книжку.', 'le regalo', { model: [['Es el cumpleaños de Ana: le compro unas flores.', 'У Ани день народження: я купую їй квіти.']], misplaced: 'regalo le', wrong: [['lo regalo', 'Тато — отримувач (кому?), тому le.'], ['les regalo', 'Отримувач один — тато: le.']], full: 'Mañana es el cumpleaños de mi padre: le regalo un libro.' }),
  rec('T02', 'supported', 'school', 'Los alumnos no entienden la tarea y la profesora ___ (explicar) el problema.', 'Учні не розуміють завдання, і вчителька пояснює їм проблему.', 'les explica', { model: [['Mi hermana no entiende el ejercicio y yo le explico el problema.', 'Сестра не розуміє вправи, і я пояснюю їй проблему.']], misplaced: 'explica les', wrong: [['le explica', 'Учнів кілька: les.'], ['los explica', 'Учні — отримувачі (кому?), тому les.']], full: 'Los alumnos no entienden la tarea y la profesora les explica el problema.' }),
  rec('T03', 'independent', 'family-home', 'Tus padres viven en Valencia, ¿no? ¿___ (escribir, tú) mucho?', 'Твої батьки живуть у Валенсії, так? Ти часто їм пишеш?', 'les escribes', { misplaced: 'escribes les', wrong: [['le escribes', 'Батьків двоє: les.'], ['los escribes', 'Батьки — отримувачі (кому?), тому les.']], full: 'Tus padres viven en Valencia, ¿no? ¿Les escribes mucho?' }),
  rec('T04', 'independent', 'shop', 'La señora no sabe el precio y el chico de la tienda ___ (decir) el precio.', 'Пані не знає ціни, і хлопець у крамниці каже їй ціну.', 'le dice', { misplaced: 'dice le', wrong: [['la dice', 'Пані — отримувач (кому?), тому le, а не la.']], full: 'La señora no sabe el precio y el chico de la tienda le dice el precio.' }),
  rec('T05', 'independent', 'free-time', 'Mi amiga no tiene bicicleta y yo ___ (prestar) la mía.', 'Моя подруга не має велосипеда, і я позичаю їй свій.', 'le presto', { misplaced: 'presto le', wrong: [['la presto', 'Подруга — отримувач (кому?), тому le.']], full: 'Mi amiga no tiene bicicleta y yo le presto la mía.' }),
  rec('T06', 'independent', 'family-home', 'No tengo tu número. ¿___ (dar, tú) tu número, por favor?', 'У мене немає твого номера. Даси мені свій номер, будь ласка?', 'me das', { misplaced: 'das me', wrong: [['te das', 'Номер дають вам (мені): me das.'], ['mi das', 'Mi — присвійне слово. Мені — me.']], full: 'No tengo tu número. ¿Me das tu número, por favor?' }),
  rec('T07', 'delayed', 'school', 'Profesor, ¿___ (enseñar, usted) las fotos de la playa?', 'Пане вчителю, покажете нам фото з пляжу?', 'nos enseña', { ask: `Учні просять учителя показати їм фото. ${ASK_IR}`, misplaced: 'enseña nos', wrong: [['les enseña', 'Учні просять для себе (нам): nos.']], verbWrong: [['nos enseñas', 'Займенник nos правильний, але до вчителя звертаємося на usted, тому дієслово — enseña: nos enseña.']], full: 'Profesor, ¿nos enseña las fotos de la playa?' }),
  rec('T08', 'delayed', 'family-home', 'Vivís lejos, pero ___ (mandar, yo) fotos de los niños los domingos.', 'Ви живете далеко, але по неділях я надсилаю вам фото дітей.', 'os mando', { misplaced: 'mando os', wrong: [['les mando', 'Vivís — це vosotros, тому os.'], ['nos mando', 'Фото отримуєте ви (vosotros): os.']], full: 'Vivís lejos, pero os mando fotos de los niños los domingos.' }),
  rec('T09', 'transfer', 'messages', '¡Hola, Pablo! ¿___ (enviar, tú) la dirección del hotel? No la tengo.', 'Привіт, Пабло! Надішлеш мені адресу готелю? У мене її немає.', 'me envías', { misplaced: 'envías me', wrong: [['te envías', 'Адресу надсилають вам (мені): me.']], full: '¡Hola, Pablo! ¿Me envías la dirección del hotel? No la tengo.' }),
  rec('T10', 'transfer', 'party', 'Mis amigos no saben la hora de la cena: ___ (escribir, yo) un mensaje ahora.', 'Мої друзі не знають, о котрій вечеря: я зараз напишу їм повідомлення.', 'les escribo', { misplaced: 'escribo les', wrong: [['le escribo', 'Друзів кілька: les.'], ['los escribo', 'Друзі — отримувачі (кому?), тому les.']], full: 'Mis amigos no saben la hora de la cena: les escribo un mensaje ahora.' }),

  // recipient (reading)
  choice(L, { id: 'T11', role: 'supported', family: 'family-home', ts: [IR_R], ask: 'Прочитайте речення. Кому Ана дарує книжку?', es: 'Ana tiene un hermano y le regala un libro por su cumpleaños.', opts: [['братові', 'c'], ['собі', 'x', 'Le — третя особа: тут це брат.'], ['батькам', 'x', 'Про батьків нічого не сказано; le — одна особа.']], rule: R.ir, ok: 'Правильно: le = su hermano.', no: 'Le = su hermano: книжку отримує брат.' }),
  choice(L, { id: 'T12', role: 'independent', family: 'school', ts: [IR_R], ask: 'Прочитайте речення. Хто отримує пояснення?', es: 'Mis padres no entienden el móvil nuevo y yo les explico qué hacer.', opts: [['батьки', 'c'], ['я', 'x', 'Пояснюю я, а отримувачі — les, тобто батьки.'], ['мобільний', 'x', 'Les — люди (кому?), а не предмет.']], rule: R.ir, ok: 'Правильно: les = mis padres.', no: 'Les = mis padres: пояснення отримують батьки.' }),
  choice(L, { id: 'T13', role: 'transfer', family: 'messages', ts: [IR_R], ask: 'Прочитайте повідомлення. Кому Марта надішле фото?', es: '¡Hola, chicos! Mañana os mando las fotos del cumpleaños. Un beso, Marta.', opts: [['тим, кому вона пише (адресатам повідомлення)', 'c'], ['собі', 'x', 'Os — «вам» (vosotros), тобто адресатам повідомлення.'], ['батькам', 'x', 'Про батьків у повідомленні не йдеться.']], rule: R.if, ok: 'Правильно: os — «вам», адресатам повідомлення.', no: 'Os — «вам» (vosotros): фото отримають ті, кому Марта пише.' }),

  // doubling (a + recipient)
  dbl('T21', 'supported', 'family-home', '(yo) dar / el libro / a Marta', 'Я даю книжку Марті.', ['Le doy el libro a Marta.', 'A Marta le doy el libro.'], [['Doy el libro a Marta.', 'Речення граматичне, але в завданні треба назвати отримувача двічі — займенником і через a: Le doy el libro a Marta.'], ['Les doy el libro a Marta.', 'Марта — одна особа: le.'], ['La doy el libro a Marta.', 'Марта — отримувач (кому?), тому le.']], { model: [['(yo) explicar / el problema / a Pablo → Le explico el problema a Pablo.', '(я) пояснювати / проблему / Пабло → Я пояснюю проблему Пабло.']] }),
  dbl('T22', 'supported', 'school', '(la profesora) explicar / la tarea / a los alumnos', 'Учителька пояснює учням завдання.', ['La profesora les explica la tarea a los alumnos.'], [['La profesora explica la tarea a los alumnos.', 'Речення граматичне, але в завданні треба назвати отримувача двічі — займенником і через a: La profesora les explica la tarea a los alumnos.'], ['La profesora le explica la tarea a los alumnos.', 'Учнів кілька: les.']], { model: [['(yo) escribir / un mensaje / a mis padres → Les escribo un mensaje a mis padres.', '(я) писати / повідомлення / батькам → Я пишу повідомлення батькам.']] }),
  dbl('T23', 'independent', 'family-home', '(Ana) escribir / a mí / todos los días', 'Ана пише мені щодня.', ['A mí me escribe Ana todos los días.', 'A mí Ana me escribe todos los días.'], [['Ana me escribe a mí todos los días.', 'Речення правильне, але завдання просить почати з a mí: A mí me escribe Ana todos los días.'], ['A mí escribe Ana todos los días.', 'З a mí займенник me обов’язковий: A mí me escribe Ana.'], ['A mi me escribe Ana todos los días.', 'Після прийменника пишемо mí зі знаком наголосу.']], { ask: 'Складіть речення з поданих частин; почніть з a mí, щоб наголосити, що саме вам.' }),
  dbl('T24', 'independent', 'shop', '(yo) regalar / unas gafas de sol / a mi hermana', 'Я дарую сестрі сонцезахисні окуляри.', ['Le regalo unas gafas de sol a mi hermana.', 'A mi hermana le regalo unas gafas de sol.'], [['Regalo unas gafas de sol a mi hermana.', 'Речення граматичне, але в завданні треба назвати отримувача двічі — займенником і через a: Le regalo unas gafas de sol a mi hermana.'], ['La regalo unas gafas de sol a mi hermana.', 'Сестра — отримувач (кому?), тому le.'], ['Les regalo unas gafas de sol a mi hermana.', 'Сестра — одна особа: le.']]),
  dbl('T25', 'independent', 'free-time', '(nosotros) preguntar / la hora / al camarero', 'Ми питаємо в офіціанта, котра година.', ['Le preguntamos la hora al camarero.', 'Al camarero le preguntamos la hora.'], [['Preguntamos la hora al camarero.', 'Речення граматичне, але в завданні треба назвати отримувача двічі — займенником і через a: Le preguntamos la hora al camarero.'], ['Lo preguntamos la hora al camarero.', 'Офіціант — той, кого питають (кому?), тому le.']]),
  dbl('T26', 'independent', 'family-home', '(mi madre) decir / la verdad / a mis hermanos', 'Мама каже моїм братам правду.', ['Mi madre les dice la verdad a mis hermanos.'], [['Mi madre dice la verdad a mis hermanos.', 'Речення граматичне, але в завданні треба назвати отримувача двічі — займенником і через a: Mi madre les dice la verdad a mis hermanos.'], ['Mi madre le dice la verdad a mis hermanos.', 'Братів кілька: les.']]),
  dbl('T27', 'delayed', 'family-home', '(yo) enseñar / el piso nuevo / a mis padres', 'Я показую батькам нову квартиру.', ['Les enseño el piso nuevo a mis padres.', 'A mis padres les enseño el piso nuevo.'], [['Enseño el piso nuevo a mis padres.', 'Речення граматичне, але в завданні треба назвати отримувача двічі — займенником і через a: Les enseño el piso nuevo a mis padres.'], ['Le enseño el piso nuevo a mis padres.', 'Батьків двоє: les.'], ['Los enseño el piso nuevo a mis padres.', 'Батьки — отримувачі (кому?), тому les.']]),
  dbl('T28', 'delayed', 'family-home', '(Pablo) prestar / el coche / a ti', 'Пабло позичає машину тобі.', ['A ti te presta el coche Pablo.', 'A ti Pablo te presta el coche.'], [['Pablo te presta el coche a ti.', 'Речення правильне, але завдання просить почати з a ti: A ti te presta el coche Pablo.'], ['A ti presta el coche Pablo.', 'З a ti займенник te обов’язковий.'], ['A tí te presta el coche Pablo.', 'Ti пишемо без знака наголосу.']], { ask: 'Складіть речення з поданих частин; почніть з a ti, щоб наголосити, що саме тобі.' }),
  dbl('T29', 'transfer', 'messages', '(yo) mandar / la dirección / a Luis', 'Я надсилаю адресу Луїсу.', ['Le mando la dirección a Luis.', 'A Luis le mando la dirección.'], [['Mando la dirección a Luis.', 'Речення граматичне, але в завданні треба назвати отримувача двічі — займенником і через a: Le mando la dirección a Luis.'], ['Lo mando la dirección a Luis.', 'Луїс — отримувач (кому?), тому le.'], ['Les mando la dirección a Luis.', 'Луїс — одна особа: le.']]),
  dbl('T30', 'transfer', 'work-study', '(Luis) explicar / el problema / a nosotros', 'Луїс пояснює нам проблему.', ['A nosotros nos explica el problema Luis.', 'A nosotros Luis nos explica el problema.'], [['Luis nos explica el problema a nosotros.', 'Речення правильне, але завдання просить почати з a nosotros: A nosotros nos explica el problema Luis.'], ['A nosotros explica el problema Luis.', 'З a nosotros займенник nos обов’язковий.']], { ask: 'Складіть речення з поданих частин; почніть з a nosotros, щоб наголосити, що саме нам.' }),

  // prepositional pronouns
  pp('T31', 'supported', 'family-home', 'Este regalo es para ___ (yo).', 'Цей подарунок для мене.', 'mí', [['mi', 'Після прийменника — займенник зі знаком наголосу: mí.'], ['me', 'Після прийменника — mí, а не me.']], [['Este café es para ti.', 'Ця кава для тебе.']]),
  pp('T32', 'supported', 'shop', 'Las flores son para ___ (tú).', 'Квіти для тебе.', 'ti', [['tí', 'Ti пишемо без знака наголосу.'], ['te', 'Після прийменника — ti, а не te.']], [['El libro es para mí.', 'Книжка для мене.']]),
  pp('T33', 'independent', 'family-home', 'Mi hermana tiene un perro y siempre habla de ___ (él).', 'Моя сестра має собаку й завжди про нього говорить.', 'él', [['el', 'Займенник él пишемо зі знаком наголосу (el — артикль).'], ['lo', 'Після прийменника — форма підмета: de él.']]),
  pp('T34', 'independent', 'free-time', 'No podemos ir al cine sin ___ (vosotros).', 'Ми не можемо піти в кіно без вас.', 'vosotros', [['os', 'Після прийменника — повна форма: sin vosotros.']]),
  pp('T35', 'independent', 'family-home', 'Mis padres viven cerca de ___ (nosotros).', 'Мої батьки живуть біля нас.', 'nosotros', [['nos', 'Після прийменника — повна форма: de nosotros.']]),
  pp('T36', 'independent', 'shop', 'Señora, ¿esta bolsa es para ___ (usted)?', 'Пані, цей пакет для вас?', 'usted', [['le', 'Після прийменника — usted.']]),
  pp('T37', 'delayed', 'family-home', 'A ___ (yo) no me gusta el café.', 'Мені не подобається кава.', 'mí', [['mi', 'Після прийменника — займенник зі знаком наголосу: mí.'], ['me', 'Після a — mí; me стоїть перед дієсловом.']]),
  pp('T38', 'delayed', 'free-time', 'Estas entradas son para ___ (ellas).', 'Ці квитки для них.', 'ellas', [['las', 'Після прийменника — форма підмета: para ellas.'], ['les', 'Після прийменника — форма підмета: para ellas.']]),
  pp('T39', 'transfer', 'messages', '¡Hola, Ana! Tengo un regalo para ___ (tú). ¿Nos vemos mañana?', 'Привіт, Ано! У мене для тебе подарунок. Побачимося завтра?', 'ti', [['tí', 'Ti пишемо без знака наголосу.'], ['te', 'Після прийменника — ti.']]),
  pp('T40', 'transfer', 'work-study', 'Este mensaje no es para mí, es para ___ (ella).', 'Це повідомлення не для мене, а для неї.', 'ella', [['la', 'Після прийменника — форма підмета: para ella.'], ['le', 'Після прийменника — форма підмета: para ella.']]),

  // conmigo / contigo
  cc('T41', 'supported', 'free-time', '¿Vienes al cine ___ (yo)?', 'Підеш зі мною в кіно?', 'conmigo', [NOCON('conmigo'), ['con migo', 'Пишемо одним словом: conmigo.']], [['¿Puedo ir contigo?', 'Можна мені піти з тобою?']]),
  cc('T42', 'supported', 'family-home', 'Mañana voy ___ (tú) al médico.', 'Завтра я піду з тобою до лікаря.', 'contigo', [NOCON('contigo'), ['con tigo', 'Пишемо одним словом: contigo.']], [['Ana siempre viene conmigo.', 'Ана завжди ходить зі мною.']]),
  cc('T43', 'independent', 'free-time', 'El sábado voy al concierto. ¿Vienes ___ (yo)?', 'У суботу я йду на концерт. Підеш зі мною?', 'conmigo', [NOCON('conmigo')]),
  cc('T44', 'independent', 'family-home', 'Mi hermano siempre juega ___ (tú).', 'Мій брат завжди грається з тобою.', 'contigo', [NOCON('contigo')]),
  cc('T45', 'independent', 'shop', '—¿Con quién vas de compras? —___ (ella).', '— З ким ти йдеш по покупки? — З нею.', 'Con ella', [['Conella', 'Для інших осіб — окремі слова: con ella.'], ['Con la', 'Після прийменника — форма підмета: con ella.']]),
  cc('T46', 'independent', 'free-time', '¿Quieres cenar ___ (yo) esta noche?', 'Хочеш повечеряти зі мною сьогодні ввечері?', 'conmigo', [NOCON('conmigo')]),
  cc('T47', 'delayed', 'family-home', 'Tengo que hablar ___ (tú). ¿Tienes un momento?', 'Мені треба з тобою поговорити. Маєш хвилинку?', 'contigo', [NOCON('contigo')]),
  cc('T48', 'delayed', 'free-time', 'Los sábados mis amigos juegan al fútbol ___ (yo).', 'По суботах мої друзі грають зі мною у футбол.', 'conmigo', [NOCON('conmigo')]),
  cc('T49', 'transfer', 'messages', '¡Hola, Marta! ¿Puedo ir ___ (tú) a la playa el domingo?', 'Привіт, Марто! Можна мені поїхати з тобою на пляж у неділю?', 'contigo', [NOCON('contigo')]),
  cc('T50', 'transfer', 'travel', 'El tren sale a las ocho y tú vienes ___ (yo), ¿verdad?', 'Потяг відправляється о восьмій, і ти їдеш зі мною, так?', 'conmigo', [NOCON('conmigo')]),

  // su → de él / de ella
  su('T51', 'supported', 'family-home', 'Pablo й Ана мають по машині. Ви кажете про машину Ани. Уточніть: замініть su на de + займенник.', 'Su coche es rojo.', 'Її машина червона.', ['El coche de ella es rojo.'], [['El coche de él es rojo.', 'Машина Ани — de ella.'], ['Su coche de ella es rojo.', 'Su і de ella разом не вживаємо: el coche de ella.']], 'El coche de ella es rojo.', [['Su casa es grande. → La casa de él es grande.', 'Про Пабло: його будинок великий.']]),
  su('T52', 'supported', 'family-home', 'Марта і Луїс мають по собаці. Ви кажете про собаку Луїса. Уточніть: замініть su на de + займенник.', 'Su perro es muy pequeño.', 'Його собака дуже маленький.', ['El perro de él es muy pequeño.'], [['El perro de el es muy pequeño.', 'Займенник él пишемо зі знаком наголосу.'], ['Su perro de él es muy pequeño.', 'Su і de él разом не вживаємо: el perro de él.']], 'El perro de él es muy pequeño.', [['Sus libros están aquí. → Los libros de ella están aquí.', 'Про Ану: її книжки тут.']]),
  su('T53', 'independent', 'family-home', 'Ана й Пабло мають по квартирі. Ви кажете про квартиру Пабло. Замініть su на артикль + іменник + de + особовий займенник (de él, de ella, de ellos, de usted); решту речення не змінюйте.', 'Su piso está en el centro.', 'Його квартира в центрі.', ['El piso de él está en el centro.'], [['El piso de el está en el centro.', 'Займенник él пишемо зі знаком наголосу.']], 'El piso de él está en el centro.'),
  su('T54', 'independent', 'school', 'У класі говорять про учнів і вчительку. Ви кажете про книжки вчительки. Замініть sus на артикль + іменник + de + особовий займенник (de él, de ella, de ellos, de usted); решту речення не змінюйте.', 'Sus libros están en la mesa.', 'Її книжки на столі.', ['Los libros de ella están en la mesa.'], [['Las libros de ella están en la mesa.', 'Libros — чоловічого роду: los libros.'], ['Sus libros de ella están en la mesa.', 'Sus і de ella разом не вживаємо.']], 'Los libros de ella están en la mesa.'),
  su('T55', 'independent', 'family-home', 'Ваші сусіди (двоє чоловіків) і їхня сестра мають різні будинки. Ви кажете про будинок братів. Замініть su на артикль + іменник + de + особовий займенник (de él, de ella, de ellos, de usted); решту речення не змінюйте.', 'Su casa es muy bonita.', 'Їхній будинок дуже гарний.', ['La casa de ellos es muy bonita.'], [['La casa de ellas es muy bonita.', 'Брати — чоловічий рід: de ellos.']], 'La casa de ellos es muy bonita.'),
  su('T56', 'independent', 'shop', 'Ви звертаєтеся до пані на usted і кажете про її сумку. Замініть su на артикль + іменник + de + особовий займенник (de él, de ella, de ellos, de usted); решту речення не змінюйте.', '¿Es su bolso?', 'Це ваша сумка?', ['¿Es el bolso de usted?'], [['¿Es el bolso de ella?', 'Ви звертаєтеся до пані на usted: de usted.']], '¿Es el bolso de usted?'),
  su('T57', 'delayed', 'family-home', 'Ана і Пабло мають по велосипеду. Ви кажете про велосипед Ани. Замініть su на артикль + іменник + de + особовий займенник (de él, de ella, de ellos, de usted); решту речення не змінюйте.', 'Su bicicleta es nueva.', 'Її велосипед новий.', ['La bicicleta de ella es nueva.'], [['La bicicleta de él es nueva.', 'Велосипед Ани — de ella.']], 'La bicicleta de ella es nueva.'),
  su('T58', 'delayed', 'school', 'Учитель і учениця мають по ручці. Ви кажете про ручку вчителя. Замініть su на артикль + іменник + de + особовий займенник (de él, de ella, de ellos, de usted); решту речення не змінюйте.', 'Su bolígrafo es azul.', 'Його ручка синя.', ['El bolígrafo de él es azul.'], [['El bolígrafo de el es azul.', 'Займенник él пишемо зі знаком наголосу.']], 'El bolígrafo de él es azul.'),
  su('T59', 'transfer', 'travel', 'У готелі живуть Луїс і Кармен, у кожного свій номер. Ви кажете про номер Кармен. Замініть su на артикль + іменник + de + особовий займенник (de él, de ella, de ellos, de usted); решту речення не змінюйте.', 'Su habitación está en el segundo piso.', 'Її номер на другому поверсі.', ['La habitación de ella está en el segundo piso.'], [['La habitación de él está en el segundo piso.', 'Номер Кармен — de ella.']], 'La habitación de ella está en el segundo piso.'),
  su('T60', 'transfer', 'work-study', 'На роботі в Марти і Луїса різні кабінети. Ви кажете про кабінет Луїса. Замініть su на артикль + іменник + de + особовий займенник (de él, de ella, de ellos, de usted); решту речення не змінюйте.', 'Su oficina es pequeña.', 'Його кабінет маленький.', ['La oficina de él es pequeña.'], [['La oficina de ella es pequeña.', 'Кабінет Луїса — de él.'], ['La oficina de el es pequeña.', 'Займенник él пишемо зі знаком наголосу.']], 'La oficina de él es pequeña.'),
  choice(L, { id: 'T61', role: 'independent', family: 'family-home', ts: [SU_R], ask: 'Прочитайте діалог. Чия це машина?', es: '—¿Es el coche de Pablo? —No, es el coche de ella, de la hermana de Pablo.', opts: [['сестри Пабло', 'c'], ['Пабло', 'x', 'Сказано: no — машина не Пабло, а de ella.'], ['співрозмовника', 'x', 'De ella — «її», тобто сестри.']], rule: R.su, ok: 'Правильно: de ella = de su hermana.', no: 'De ella — це сестра Пабло.' }),
  choice(L, { id: 'T62', role: 'transfer', family: 'travel', ts: [SU_R], ask: 'Прочитайте речення. У кого велика квартира?', es: 'Luis y Carmen viven en Madrid. El piso de él es pequeño, pero el piso de ella es muy grande.', opts: [['у Кармен', 'c'], ['у Луїса', 'x', 'El piso de él — маленька квартира Луїса.'], ['в обох', 'x', 'Велика лише квартира de ella.']], rule: R.su, ok: 'Правильно: el piso de ella — квартира Кармен.', no: 'El piso de ella — квартира Кармен; вона велика.' }),

  // mí vs mi
  mi('T63', 'supported', 'family-home', 'Este regalo es para ___.', 'Цей подарунок для мене.', 'mí', 'Este regalo es para mí.', [['Es mi libro. — Es para mí.', 'Це моя книжка. — Це для мене.']]),
  mi('T64', 'supported', 'family-home', '___ hermano vive en Valencia.', 'Мій брат живе у Валенсії.', 'mi', 'Mi hermano vive en Valencia.', [['Mi casa es pequeña. — A mí me gusta.', 'Мій будинок маленький. — Мені він подобається.']]),
  mi('T65', 'independent', 'free-time', 'A ___ me gusta mucho el cine.', 'Мені дуже подобається кіно.', 'mí', 'A mí me gusta mucho el cine.'),
  mi('T66', 'independent', 'family-home', '¿Dónde está ___ móvil?', 'Де мій мобільний?', 'mi', '¿Dónde está mi móvil?'),
  mi('T67', 'independent', 'shop', '¿Es para ___? ¡Muchas gracias!', 'Це для мене? Дуже дякую!', 'mí', '¿Es para mí? ¡Muchas gracias!'),
  mi('T68', 'independent', 'school', 'Esta es ___ profesora de español.', 'Це моя вчителька іспанської.', 'mi', 'Esta es mi profesora de español.'),
  mi('T69', 'delayed', 'free-time', 'Sin ___ no vais a la playa, ¿verdad?', 'Без мене ви ж не поїдете на пляж?', 'mí', 'Sin mí no vais a la playa, ¿verdad?'),
  mi('T70', 'delayed', 'family-home', 'Mis padres viven cerca de ___.', 'Мої батьки живуть біля мене.', 'mí', 'Mis padres viven cerca de mí.'),
  mi('T71', 'transfer', 'messages', '¡Hola, Ana! ¿Hay un mensaje para ___?', 'Привіт, Ано! Є повідомлення для мене?', 'mí', '¡Hola, Ana! ¿Hay un mensaje para mí?'),
  mi('T72', 'transfer', 'travel', 'Esta es ___ maleta, la roja.', 'Це моя валіза, червона.', 'mi', 'Esta es mi maleta, la roja.'),
  choice(L, { id: 'T73', role: 'independent', family: 'family-home', ts: [MI_C], ask: 'Оберіть правильне написання.', es: 'Para ___, un café con leche, por favor.', opts: [['mí', 'c'], ['mi', 'x', 'Після прийменника — займенник зі знаком наголосу: mí.']], rule: R.mi, ref: 'Para mí, un café con leche, por favor.', ok: 'Правильно: para mí.', no: 'Після para — mí: Para mí, un café con leche.' }),
  choice(L, { id: 'T74', role: 'delayed', family: 'school', ts: [MI_C], ask: 'Оберіть правильне написання.', es: '¿Tienes ___ bolígrafo?', opts: [['mi', 'c'], ['mí', 'x', 'Перед іменником — присвійне слово без знака наголосу: mi.']], rule: R.mi, ref: '¿Tienes mi bolígrafo?', ok: 'Правильно: mi bolígrafo.', no: 'Перед іменником — mi: ¿Tienes mi bolígrafo?' }),

  // listening
  choice(L, { id: 'T81', role: 'supported', family: 'shop-dialogue', ts: [LIS], clips: [C1], ask: 'Прослухайте розмову в крамниці. Для кого покупець купує окуляри?', opts: [['для сестри', 'c'], ['для себе', 'x', 'Він каже: para mi hermana.'], ['для продавця', 'x', 'Окуляри — подарунок сестрі.']], transcript: TR[C1], ok: 'Правильно: son para mi hermana — le regalo las gafas.', no: 'Покупець каже: busco unas gafas de sol para mi hermana.' }),
  choice(L, { id: 'T82', role: 'independent', family: 'shop-dialogue', ts: [LIS], clips: [C1], ask: 'Прослухайте ще раз. Що означає займенник las у відповіді покупця?', opts: [['окуляри', 'c'], ['сестру', 'x', 'Сестра — отримувачка подарунка (le); las — те, що купують.'], ['гроші', 'x', 'Las — окуляри (las gafas), про які щойно йшлося.']], transcript: TR[C1], ok: 'Правильно: las = las gafas.', no: 'Las = las gafas: покупець купує окуляри.' }),
  choice(L, { id: 'T83', role: 'independent', family: 'home-dialogue', ts: [LIS], clips: [C2], ask: 'Прослухайте розмову вдома. Що шукає син?', opts: [['ключі', 'c'], ['телефон', 'x', 'Він питає: ¿dónde están mis llaves?'], ['рюкзак', 'x', 'Про рюкзак не йдеться.']], transcript: TR[C2], ok: 'Правильно: mis llaves.', no: 'Син питає: Mamá, ¿dónde están mis llaves?' }),
  choice(L, { id: 'T84', role: 'delayed', family: 'home-dialogue', ts: [LIS], clips: [C2], ask: 'Прослухайте ще раз. Кому син зараз напише повідомлення?', opts: [['сестрі', 'c'], ['батькові', 'x', 'Тато ключів не має; син напише сестрі.'], ['мамі', 'x', 'Мама поруч — він говорить з нею.']], transcript: TR[C2], ok: 'Правильно: ahora le escribo — сестрі.', no: 'Мама каже про сестру, і син відповідає: Ahora le escribo un mensaje — тобто сестрі.' }),
  choice(L, { id: 'T86', role: 'delayed', family: 'short-dialogue', ts: [LIS], clips: [C3], ask: 'Прослухайте запис. Хто отримає окуляри?', opts: [['Марта', 'c'], ['той, хто говорить', 'x', 'Окуляри зараз у того, хто говорить (las tengo yo), але подарує він їх Марті.'], ['сестра', 'x', 'Про сестру тут не йдеться: a Marta.']], transcript: TR[C3], ok: 'Правильно: le regalo las gafas a Marta.', no: 'Mañana le regalo las gafas a Marta — окуляри отримає Марта.' }),
  dictation(L, { id: 'T85', role: 'independent', family: 'short-dialogue', t: LIS_D, clip: C3, a: ['¿Las gafas? Las tengo yo. Mañana le regalo las gafas a Marta.', '¿Las gafas? Las tengo yo. Mañana le regalo las gafas a Marta'] }),
];


export const clips = [
  clip({ id: C1, lessonId: L, kind: 'text', family: 'shop-dialogue', targets: [LIS], transcript: TR[C1], translationUk: '— Добрий день. Я шукаю сонцезахисні окуляри для сестри. — Ці? Вони дуже гарні. — Так, мені подобаються. Скільки коштують? — Тридцять євро. — Добре, беру. Подарую їй окуляри в суботу, на день народження.' }),
  clip({ id: C2, lessonId: L, kind: 'text', family: 'home-dialogue', targets: [LIS], transcript: TR[C2], translationUk: '— Мамо, де мої ключі? — Не знаю, синку. Може, вони в тата? — Ні, у тата їх немає. — А в сестри? Вона завжди бере твої ключі. — Точно! Зараз напишу їй повідомлення.' }),
  clip({ id: C3, lessonId: L, kind: 'text', family: 'short-dialogue', targets: [LIS, LIS_D], transcript: TR[C3], translationUk: 'Окуляри? Вони в мене. Завтра я подарую окуляри Марті.' }),
];

const T_IND = TABLE_UK(['кому?', 'займенник', 'після прийменника', 'приклад'], [
  ['мені', 'me', 'a mí, para mí, conmigo', '¿Me das tu número?'],
  ['тобі', 'te', 'a ti, para ti, contigo', 'Te escribo mañana.'],
  ['йому, їй; вам (usted)', 'le', 'a él, a ella, a usted', 'Le doy el regalo.'],
  ['нам', 'nos', 'a nosotros, a nosotras', 'Nos explica la tarea.'],
  ['вам (vosotros)', 'os', 'a vosotros, a vosotras', 'Os mando las fotos.'],
  ['їм; вам (ustedes)', 'les', 'a ellos, a ellas, a ustedes', 'Les escribo un mensaje.'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Кому? Le doy, para mí, conmigo',
  termEs: 'pronombres de objeto indirecto y con preposición',
  summaryUk: 'Кажемо, кому щось дають, пишуть чи пояснюють (le doy el libro a Marta), уживаємо займенники після прийменників (para mí, para ti, conmigo, contigo), уточнюємо su (la casa de ella) і розрізняємо mi і mí.',
  objectives: ['A2-02-O4', 'A2-02-O2'],
  cv: ['CV-03'],
  situations: ['people-family-home', 'personal-messages', 'food-shopping'],
  estimatedMinutes: 20,
  introduces: ['object-pron.indirect-forms', 'object-pron.indirect-recipient', 'object-pron.indirect-doubling', 'pron.prepositional', 'pron.conmigo-contigo', 'poss.su-clarification', 'ortho.accent-pair.mi', 'listening.pronoun-reference'],
  revisits: ['gustar.pronouns', 'gustar.pronouns.plural', 'gustar.a-noun-le', 'object-pron.direct-1-2', 'object-pron.placement-finite', 'present.dar', 'present.decir', 'poss.su-reference', 'poss.mi-tu-su', 'ortho.accent-pair.el', 'prep.con.company'],
  steps: [
    s('s1', 'explanation', 'Кому? Me, te, le, nos, os, les', true, {
      blocks: [
        UK('Непрямий додаток відповідає на питання «кому?». Займенники ті самі, що з gustar: me, te, le, nos, os, les. Le і les не розрізняють роду: le — «йому», «їй» або «вам» (usted). Займенник стоїть перед особовою формою дієслова.'),
        UK('Нові дієслова: regalar — дарувати (el regalo — подарунок), enviar і mandar — надсилати (envío, envías — зі знаком наголосу), prestar — позичати комусь, explicar — пояснювати, preguntar — питати, enseñar — показувати; навчати. La tarea — завдання.'),
        T_IND,
        EX('Es el cumpleaños de Ana: le regalo un libro.', 'В Ани день народження: я дарую їй книжку.'),
        EX('¿Me das tu número?', 'Даси мені свій номер?'),
        EX('Los alumnos no entienden y la profesora les explica la tarea.', 'Учні не розуміють, і вчителька пояснює їм завдання.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Кому? За зразком', true, { tasks: ['T01', 'T02', 'T11'] }),
    s('s3', 'explanation', 'Отримувач через a; para mí, conmigo', true, {
      blocks: [
        UK('Отримувача часто називають двічі — займенником і через a: Le doy el libro a Marta. Це звичайна іспанська конструкція, а не зайвий повтор. Без le речення теж правильне, але менш природне. З a mí, a ti, a nosotros займенник обов’язковий: A mí me escribe Ana.'),
        UK('Після прийменників (a, para, de, sin, cerca de) уживаємо mí і ti, а для інших осіб — форми підмета: para él, para ella, para usted, sin nosotros. Mí пишемо зі знаком наголосу (mi без знака — «мій»: mi casa), ti — без знака. Після con — особливі форми conmigo і contigo, але con él, con ella.'),
        EX('Este regalo es para ti.', 'Цей подарунок для тебе.'),
        EX('A mí me gusta, pero a mi hermano no.', 'Мені подобається, а моєму братові — ні.'),
        EX('¿Vienes conmigo? — Sí, voy contigo.', 'Підеш зі мною? — Так, піду з тобою.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. A + отримувач, para mí, conmigo', true, { tasks: ['T21', 'T31', 'T41', 'T63', 'T64'] }),
    s('s5', 'explanation', 'Su: чиє саме?', true, {
      blocks: [
        UK('Su може означати «його», «її», «ваш» (usted) або «їхній». Якщо з контексту незрозуміло, чиє щось, кажемо: артикль + іменник + de + займенник — la casa de él, la casa de ella, los libros de ellos. Su і de él разом не вживаємо.'),
        EX('—¿Es el coche de Pablo? —No, es el coche de ella.', '— Це машина Пабло? — Ні, це її машина.'),
      ],
    }),
    s('s6', 'supported-practice', 'Крок 3. De él чи de ella', true, { tasks: ['T51', 'T52'] }),
    s('s7', 'listening', 'Слухаємо: хто що отримує', true, { clips: [C1, C2], tasks: ['T81', 'T82', 'T83'] }),
    s('s8', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T04', 'T23', 'T33', 'T43', 'T53', 'T65', 'T73'] }),
    s('s9', 'independent-practice', 'Додаткова практика', false, { tasks: ['T05', 'T06', 'T12', 'T22', 'T24', 'T25', 'T26', 'T32', 'T34', 'T35', 'T36', 'T42', 'T44', 'T45', 'T46', 'T54', 'T55', 'T56', 'T61', 'T66', 'T67', 'T68', 'T85'] }),
    s('s10', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'Кому? me, te, le, nos, os, les — перед дієсловом: Le doy el regalo.',
          'Le doy el libro a Marta — отримувача можна назвати двічі; з a mí, a ti займенник обов’язковий.',
          'Після прийменника: mí, ti, él, ella…; con → conmigo, contigo.',
          'Su → la casa de él / de ella, коли треба уточнити власника. Mí (займенник) ≠ mi (мій).',
        ]),
        LINK('Потренувати займенники «кому?» і після прийменника', [IR, IF, ID, PP, CC, SU, MI, MI_C], 'written', 10),
        LINK('Послухати ще', [LIS], 'listening', 3),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-02.indirect-prepositional-pronouns',
    topicId: L,
    titleUk: 'Таблиця: кому? і займенники після прийменника',
    blocks: [T_IND, UK('Le doy el libro a Marta — отримувача можна назвати двічі. Після прийменника: para mí, para ti, conmigo, contigo, con él. Su → la casa de él / de ella.'), LINK('Практика', [IR, IF, ID, PP, CC, SU, MI], 'written', 10)],
    linkedTargets: [IR, IF, ID, PP, CC, SU, MI],
  }),
];
