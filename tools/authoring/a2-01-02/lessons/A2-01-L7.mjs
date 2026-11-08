// A2-01-L7 — routine, current action and plan together (reading, writing, listening); CV-04 weather frames.
import { ES, EX, LINK, LIST_UK, TABLE_UK, UK, choice, clip, dictation, gap, lesson as mkLesson, material, open, rubric, step } from '../lib.mjs';

const L = 'A2-01-L7';
const RNP = 'contrast.routine-now-plan/context-choice';
const RD = 'reading.routine-now-plan/reading-meaning';
const WR = 'writing.routine-now-plan/construction-use';
const LS = 'listening.situation-plan/listening-meaning';
const LS_D = 'listening.situation-plan/dictation';
const WH = 'formula.weather-hace/construction-use';
const WH_R = 'formula.weather-hace/reading-meaning';
const LN = 'present.llover-nevar/written-form';
const LN_R = 'present.llover-nevar/reading-meaning';
const EW = 'estar.weather/construction-use';
const HTE = 'contrast.hace-tener-estar/context-choice';

const CA = 'clip.a2-01.l7.voice-weekend';
const CB = 'clip.a2-01.l7.family-weekend';
const CC = 'clip.a2-01.l7.weather-cafe';
const TXT_A = '¡Hola, Marta! ¿qué tal? Normalmente los sábados trabajo en la tienda de mis padres, pero hoy no. Ahora estoy en casa y estoy cocinando. Esta noche vamos a cenar con unos amigos. ¿Quieres venir? Puedes venir a las nueve. Un beso, Ana.';
const TXT_B = 'Me llamo Luis y soy camarero. Normalmente empiezo a trabajar a las ocho de la mañana. Hoy es domingo y no trabajo: ahora estoy leyendo en el parque. Mañana voy a ir al médico por la mañana y por la tarde tengo que trabajar.';
const TXT_C = 'Martes. Hoy no voy a la universidad porque estoy enfermo. Estoy en la cama y estoy viendo una película. El jueves voy a volver a clase.';
const TR_A = 'Hola, Luis, soy Carmen. ¿Qué tal? Ahora estoy en el tren: vuelvo de Valencia. Normalmente trabajo los sábados, pero este fin de semana no. El domingo voy a ir a la playa con mis hijos. ¿Quieres venir? Tenemos que salir a las nueve de la mañana. Un abrazo.';
const TR_B = 'Este fin de semana mi familia está muy ocupada. Mi hermano tiene que estudiar: el lunes tiene un examen. Mi madre no puede salir porque está enferma. El sábado por la mañana mi padre y yo vamos a hacer la compra, y el domingo vamos a ver el fútbol en casa.';
const TR_C = 'Hoy hace mucho calor en Sevilla. Ahora estoy en un bar de la plaza y estoy tomando un café. Esta tarde voy a pasear por el centro, pero mañana va a llover.';

const R = {
  rnp: 'Звичка — простий теперішній (Normalmente trabajo en una oficina). Дія зараз — estar + герундій (Ahora estoy trabajando en casa). План — ir a + інфінітив (Mañana voy a ir al médico). Одне слово не завжди вирішує вибір: дивіться на зміст.',
  wh: 'Про погоду кажемо безособово: hace + іменник (hace calor, hace frío, hace sol, hace viento, hace buen / mal tiempo). Ступінь — mucho перед іменником: hace mucho calor (не *muy calor). Питання: ¿Qué tiempo hace?',
  ln: 'Дощ і сніг: llover → llueve (o → ue), nevar → nieva (e → ie), лише в 3-й особі однини. Те, що відбувається зараз, — está lloviendo, está nevando.',
  ew: 'Стан неба описуємо через estar + прикметник: está nublado, está despejado. Не *hace nublado.',
  hte: 'Погода — hace (Hace frío). Відчуття людини — tener (Tengo frío; tengo sed). Температура предмета — estar + прикметник, що узгоджується з іменником (El café está frío).',
};
const ASK_W = (cue) => `Як сказати «${cue}»? Впишіть пропущені слова.`;

export const tasks = [
  // hace + noun
  open(L, { id: 'T01', role: 'supported', family: 'seasons', ts: [WH], ask: `Подивіться на зразок. ${ASK_W('спекотно')}`, model: [['Hoy hace frío.', 'Сьогодні холодно.']], es: 'En agosto ___ en Sevilla.', uk: 'У серпні в Севільї спекотно.', a: ['hace calor', 'hace mucho calor'], err: [['es calor', { [WH]: 'incorrect' }, 'Про погоду кажемо hace: hace calor.'], ['está calor', { [WH]: 'incorrect' }, 'Про погоду кажемо hace: hace calor.']], rule: R.wh, full: 'En agosto hace calor en Sevilla.' }),
  open(L, { id: 'T02', role: 'supported', family: 'seasons', ts: [WH], ask: `Подивіться на зразок. ${ASK_W('дуже холодно')}`, model: [['En julio hace mucho calor.', 'У липні дуже спекотно.']], es: 'En enero ___ en Kiev.', uk: 'У січні в Києві дуже холодно.', a: ['hace mucho frío'], err: [['hace muy frío', { [WH]: 'incorrect' }, 'Frío — іменник, тому перед ним mucho, а не muy: hace mucho frío.'], ['es muy frío', { [WH]: 'incorrect' }, 'Про погоду кажемо hace + іменник: hace mucho frío.']], rule: R.wh, full: 'En enero hace mucho frío en Kiev.' }),
  open(L, { id: 'T03', role: 'independent', family: 'free-time', ts: [WH], ask: ASK_W('вітряно'), es: 'Hoy ___ en la playa.', uk: 'Сьогодні на пляжі вітряно.', a: ['hace viento', 'hace mucho viento', 'hay viento', 'hay mucho viento'], err: [['es viento', { [WH]: 'incorrect' }, 'Про погоду кажемо hace viento.']], rule: R.wh, full: 'Hoy hace viento en la playa.' }),
  open(L, { id: 'T04', role: 'independent', family: 'seasons', ts: [WH], ask: ASK_W('сонячно'), es: 'En verano ___ todos los días.', uk: 'Улітку щодня сонячно.', a: ['hace sol', 'hay sol'], err: [['es sol', { [WH]: 'incorrect' }, 'Про погоду кажемо hace sol.'], ['está sol', { [WH]: 'incorrect' }, 'Про погоду кажемо hace sol.']], rule: R.wh, full: 'En verano hace sol todos los días.' }),
  open(L, { id: 'T05', role: 'independent', family: 'free-time', ts: [WH], ask: ASK_W('гарна погода'), es: 'Hoy ___: vamos al parque.', uk: 'Сьогодні гарна погода: ходімо в парк.', a: ['hace buen tiempo', 'hace bueno'], err: [['hace bueno tiempo', { [WH]: 'incorrect' }, 'Перед іменником чоловічого роду bueno скорочується: hace buen tiempo.'], ['es buen tiempo', { [WH]: 'incorrect' }, 'Про погоду кажемо hace: hace buen tiempo.']], rule: R.wh, full: 'Hoy hace buen tiempo: vamos al parque.' }),
  open(L, { id: 'T06', role: 'independent', family: 'seasons', ts: [WH], ask: 'Як спитати «Яка сьогодні погода?» Впишіть пропущені слова.', es: '¿Qué ___ hoy?', uk: 'Яка сьогодні погода?', a: ['tiempo hace'], err: [['tiempo es', { [WH]: 'incorrect' }, 'Про погоду питаємо з hace: ¿Qué tiempo hace?'], ['tiempo está', { [WH]: 'incorrect' }, 'Про погоду питаємо з hace: ¿Qué tiempo hace?']], rule: R.wh, full: '¿Qué tiempo hace hoy?' }),
  open(L, { id: 'T07', role: 'delayed', family: 'free-time', ts: [WH], ask: ASK_W('погана погода'), es: 'No vamos a la playa: ___.', uk: 'Ми не їдемо на пляж: погана погода.', a: ['hace mal tiempo'], err: [['hace malo tiempo', { [WH]: 'incorrect' }, 'Перед іменником чоловічого роду malo скорочується: hace mal tiempo.'], ['es mal tiempo', { [WH]: 'incorrect' }, 'Про погоду кажемо hace: hace mal tiempo.']], rule: R.wh, full: 'No vamos a la playa: hace mal tiempo.' }),
  open(L, { id: 'T08', role: 'delayed', family: 'seasons', ts: [WH], ask: ASK_W('дуже спекотно'), es: 'En julio ___ en Madrid.', uk: 'У липні в Мадриді дуже спекотно.', a: ['hace mucho calor'], err: [['hace muy calor', { [WH]: 'incorrect' }, 'Calor — іменник, тому перед ним mucho, а не muy: hace mucho calor.']], rule: R.wh, full: 'En julio hace mucho calor en Madrid.' }),
  open(L, { id: 'T09', role: 'transfer', family: 'messages', ts: [WH], ask: `Допишіть повідомлення. ${ASK_W('холодно')}`, es: '¡Hola, Ana! Aquí en Kiev ___. ¿Y en Valencia?', uk: 'Привіт, Ано! Тут, у Києві, холодно. А у Валенсії?', a: ['hace frío', 'hace mucho frío'], err: [['es frío', { [WH]: 'incorrect' }, 'Про погоду кажемо hace frío.'], ['está frío', { [WH]: 'incorrect' }, 'Está frío — про температуру предмета; про погоду — hace frío.']], rule: R.wh, full: '¡Hola, Ana! Aquí en Kiev hace frío. ¿Y en Valencia?' }),
  open(L, { id: 'T10', role: 'transfer', family: 'travel', ts: [WH], ask: ASK_W('гарна погода'), es: 'Estamos de vacaciones en la playa y ___.', uk: 'Ми у відпустці на пляжі, і погода гарна.', a: ['hace buen tiempo', 'hace bueno'], err: [['hace bueno tiempo', { [WH]: 'incorrect' }, 'Перед іменником чоловічого роду bueno скорочується: hace buen tiempo.']], rule: R.wh, full: 'Estamos de vacaciones en la playa y hace buen tiempo.' }),
  choice(L, { id: 'T11', role: 'independent', family: 'seasons', ts: [WH_R], ask: 'Прочитайте речення. Що воно означає?', es: 'En Sevilla hace mucho calor en verano.', opts: [['Улітку в Севільї дуже спекотно.', 'c'], ['Улітку в Севільї людям холодно.', 'x', 'Hace calor — спекотно.'], ['Улітку в Севільї часто йде дощ.', 'x', 'Дощ — llueve.']], rule: R.wh, ok: 'Правильно: hace mucho calor — дуже спекотно.', no: 'Hace mucho calor — дуже спекотно.' }),
  choice(L, { id: 'T12', role: 'delayed', family: 'messages', ts: [WH_R], ask: 'Прочитайте діалог. Яка погода в Києві?', es: '—¿Qué tiempo hace en Kiev? —Hace frío y mucho viento.', opts: [['Холодно і дуже вітряно.', 'c'], ['Тепло й сонячно.', 'x', 'Hace frío — холодно.'], ['Іде сніг.', 'x', 'Сніг — nieva; про нього не сказано.']], rule: R.wh, ok: 'Правильно: hace frío y mucho viento.', no: 'Hace frío y mucho viento — холодно і дуже вітряно.' }),

  // llover / nevar
  gap(L, { id: 'T21', role: 'supported', family: 'seasons', t: LN, ask: 'Подивіться на зразок і впишіть правильну форму дієслова.', model: [['En invierno nieva en Kiev.', 'Узимку в Києві йде сніг.']], es: 'En otoño ___ (llover) mucho en Galicia.', uk: 'Восени в Галісії часто йде дощ.', a: 'llueve', err: [['llove', 'Під наголосом o змінюється на ue: llueve.']], rule: R.ln }),
  gap(L, { id: 'T22', role: 'supported', family: 'now', t: LN, ask: 'Подивіться на зразок і впишіть estar + герундій.', model: [['Ahora está lloviendo.', 'Зараз іде дощ.']], es: 'Ahora mismo ___ (nevar).', uk: 'Просто зараз іде сніг.', a: 'está nevando', err: [['esta nevando', 'Está пишемо зі знаком наголосу.'], ['está nievando', 'Герундій від nevar — nevando, без чергування.'], ['nieva', 'Тут ідеться про «просто зараз», потрібна форма está nevando.']], rule: R.ln }),
  gap(L, { id: 'T23', role: 'independent', family: 'seasons', t: LN, ask: 'Впишіть правильну форму дієслова.', es: 'En invierno ___ (nevar) mucho en Kiev.', uk: 'Узимку в Києві часто йде сніг.', a: 'nieva', err: [['neva', 'Під наголосом e змінюється на ie: nieva.']], rule: R.ln }),
  gap(L, { id: 'T24', role: 'independent', family: 'now', t: LN, ask: 'Впишіть estar + герундій.', es: 'Hoy no vamos al parque: ___ (llover).', uk: 'Сьогодні ми не йдемо в парк: іде дощ.', a: 'está lloviendo', err: [['esta lloviendo', 'Está пишемо зі знаком наголосу.'], ['está llovendo', 'Герундій дієслів на -er — -iendo: lloviendo.']], rule: R.ln }),
  gap(L, { id: 'T25', role: 'independent', family: 'seasons', t: LN, ask: 'Впишіть правильну форму дієслова.', es: 'En primavera ___ (llover) a menudo.', uk: 'Навесні часто йде дощ.', a: 'llueve', err: [['llove', 'Під наголосом o змінюється на ue: llueve.']], rule: R.ln }),
  gap(L, { id: 'T26', role: 'independent', family: 'places', t: LN, ask: 'Впишіть правильну форму дієслова.', es: '¿___ (nevar) en tu ciudad en invierno?', uk: 'У твоєму місті взимку йде сніг?', a: 'nieva', err: [['neva', 'Під наголосом e змінюється на ie: nieva.']], rule: R.ln }),
  gap(L, { id: 'T27', role: 'delayed', family: 'now', t: LN, ask: 'Впишіть estar + герундій.', es: 'Necesito el paraguas: ___ (llover).', uk: 'Мені потрібна парасолька: іде дощ.', a: 'está lloviendo', err: [['esta lloviendo', 'Está пишемо зі знаком наголосу.']], rule: R.ln }),
  gap(L, { id: 'T28', role: 'delayed', family: 'seasons', t: LN, ask: 'Впишіть правильну форму дієслова.', es: 'En enero, en Madrid a veces ___ (nevar).', uk: 'У січні в Мадриді іноді йде сніг.', a: 'nieva', err: [['neva', 'Під наголосом e змінюється на ie: nieva.']], rule: R.ln }),
  gap(L, { id: 'T29', role: 'transfer', family: 'messages', t: LN, ask: 'Допишіть повідомлення: впишіть estar + герундій.', es: '¡Hola, Pablo! Aquí ___ (llover) y no podemos ir a la playa.', uk: 'Привіт, Пабло! Тут іде дощ, і ми не можемо піти на пляж.', a: 'está lloviendo', err: [['esta lloviendo', 'Está пишемо зі знаком наголосу.']], rule: R.ln }),
  gap(L, { id: 'T30', role: 'transfer', family: 'travel', t: LN, ask: 'Впишіть правильну форму дієслова.', es: 'En el hotel nos dicen: «En diciembre aquí ___ (nevar) mucho».', uk: 'У готелі нам кажуть: «У грудні тут часто йде сніг».', a: 'nieva', err: [['neva', 'Під наголосом e змінюється на ie: nieva.']], rule: R.ln }),
  choice(L, { id: 'T31', role: 'independent', family: 'now', ts: [LN_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Hoy está nublado, pero no llueve.', opts: [['Сьогодні хмарно, але дощу немає.', 'c'], ['Сьогодні йде дощ.', 'x', 'No llueve — дощу немає.'], ['Сьогодні ясно й сонячно.', 'x', 'Está nublado — хмарно.']], rule: R.ln, ok: 'Правильно: está nublado, pero no llueve.', no: 'Está nublado, pero no llueve — хмарно, але дощу немає.' }),
  choice(L, { id: 'T32', role: 'delayed', family: 'seasons', ts: [LN_R], ask: 'Прочитайте речення. Що воно означає?', es: 'En mi ciudad nieva en diciembre.', opts: [['У моєму місті в грудні йде сніг.', 'c'], ['У моєму місті зараз іде сніг.', 'x', 'Про «зараз» сказали б está nevando.'], ['У моєму місті в грудні часто дощить.', 'x', 'Nieva — іде сніг.']], rule: R.ln, ok: 'Правильно: nieva en diciembre — у грудні йде сніг.', no: 'Nieva en diciembre — у грудні йде сніг.' }),

  // estar nublado / despejado (justified small bank)
  open(L, { id: 'T41', role: 'supported', family: 'now', ts: [EW], ask: `Подивіться на зразок. ${ASK_W('хмарно')}`, model: [['Hoy está despejado.', 'Сьогодні ясно (безхмарно).']], es: 'Hoy ___ y no hace sol.', uk: 'Сьогодні хмарно і не сонячно.', a: ['está nublado'], err: [['hace nublado', { [EW]: 'incorrect' }, 'Про хмари кажемо estar: está nublado.'], ['es nublado', { [EW]: 'incorrect' }, 'Стан неба описуємо через estar: está nublado.'], ['esta nublado', { [EW]: 'incorrect' }, 'Está пишемо зі знаком наголосу.']], rule: R.ew, closed: true, full: 'Hoy está nublado y no hace sol.' }),
  open(L, { id: 'T42', role: 'independent', family: 'now', ts: [EW], ask: ASK_W('ясно, безхмарно'), es: 'Por la noche ___ y hace frío.', uk: 'Уночі ясно й холодно.', a: ['está despejado'], err: [['hace despejado', { [EW]: 'incorrect' }, 'Про стан неба кажемо estar: está despejado.'], ['esta despejado', { [EW]: 'incorrect' }, 'Está пишемо зі знаком наголосу.']], rule: R.ew, closed: true, full: 'Por la noche está despejado y hace frío.' }),
  open(L, { id: 'T43', role: 'independent', family: 'free-time', ts: [EW], ask: ASK_W('хмарно'), es: '¿Vamos a la playa? Hoy ___.', uk: 'Підемо на пляж? Сьогодні хмарно.', a: ['está nublado'], err: [['hace nublado', { [EW]: 'incorrect' }, 'Про хмари кажемо estar: está nublado.']], rule: R.ew, closed: true, full: '¿Vamos a la playa? Hoy está nublado.' }),
  open(L, { id: 'T44', role: 'delayed', family: 'now', ts: [EW], ask: ASK_W('ясно, безхмарно'), es: 'Hoy ___ y hace mucho sol.', uk: 'Сьогодні ясно й дуже сонячно.', a: ['está despejado'], err: [['hace despejado', { [EW]: 'incorrect' }, 'Про стан неба кажемо estar: está despejado.']], rule: R.ew, closed: true, full: 'Hoy está despejado y hace mucho sol.' }),
  open(L, { id: 'T45', role: 'transfer', family: 'messages', ts: [EW], ask: `Допишіть повідомлення. ${ASK_W('хмарно')}`, es: '¡Hola, Ana! Aquí ___, pero no llueve.', uk: 'Привіт, Ано! Тут хмарно, але дощу немає.', a: ['está nublado'], err: [['hace nublado', { [EW]: 'incorrect' }, 'Про хмари кажемо estar: está nublado.']], rule: R.ew, closed: true, full: '¡Hola, Ana! Aquí está nublado, pero no llueve.' }),
  open(L, { id: 'T46', role: 'transfer', family: 'places', ts: [EW], ask: ASK_W('ясно, безхмарно'), es: 'En verano, en Sevilla siempre ___.', uk: 'Улітку в Севільї завжди ясно.', a: ['está despejado'], err: [['hace despejado', { [EW]: 'incorrect' }, 'Про стан неба кажемо estar: está despejado.']], rule: R.ew, closed: true, full: 'En verano, en Sevilla siempre está despejado.' }),

  // hace / tener / estar
  choice(L, { id: 'T51', role: 'supported', family: 'seasons', ts: [HTE], ask: 'Оберіть дієслово. Підказка: погода — hace, відчуття людини — tener, температура предмета — estar.', es: 'En Kiev, en enero, ___ mucho frío.', opts: [['hace', 'c'], ['tiene', 'x', 'Місто не «має холод»: про погоду кажемо hace frío.'], ['está', 'x', 'Про погоду кажемо hace frío.']], rule: R.hte, ref: 'En Kiev, en enero, hace mucho frío.', ok: 'Правильно: погода — hace.', no: 'Про погоду — hace: hace mucho frío.' }),
  choice(L, { id: 'T52', role: 'independent', family: 'family-home', ts: [HTE], ask: 'Оберіть дієслово.', es: '—¿Quieres agua? —Sí, ___ mucha sed.', opts: [['tengo', 'c'], ['hace', 'x', 'Спрага — відчуття людини: tengo sed.'], ['estoy', 'x', 'Не кажемо *estoy sed; правильно tengo sed.']], rule: R.hte, ref: '—¿Quieres agua? —Sí, tengo mucha sed.', ok: 'Правильно: відчуття людини — tener.', no: 'Відчуття людини — tener: tengo mucha sed.' }),
  choice(L, { id: 'T53', role: 'independent', family: 'food-cafe', ts: [HTE], ask: 'Оберіть дієслово.', es: 'El café ___ frío: no me gusta.', opts: [['está', 'c'], ['hace', 'x', 'Про температуру предмета кажемо estar: el café está frío.'], ['tiene', 'x', 'Предмет не «має холод»: el café está frío.']], rule: R.hte, ref: 'El café está frío: no me gusta.', ok: 'Правильно: температура предмета — estar.', no: 'Температура предмета — estar: el café está frío.' }),
  choice(L, { id: 'T54', role: 'delayed', family: 'family-home', ts: [HTE], ask: 'Оберіть слово, яке підходить.', es: '¿Puedes cerrar la ventana? ___ frío.', opts: [['Tengo', 'c', 'Так: ви відчуваєте холод.'], ['Hace', 'c', 'Так: холодно (у кімнаті чи надворі).'], ['Estoy', 'x', 'Українське «мені холодно» — tengo frío, а не *estoy frío.']], rule: R.hte, ok: 'Правильно: tengo frío (відчуття) або hace frío (погода, холодно в кімнаті).', no: 'Підходить Tengo frío або Hace frío; *estoy frío так не кажуть.' }),
  choice(L, { id: 'T55', role: 'transfer', family: 'messages', ts: [HTE], ask: 'Допишіть повідомлення: оберіть дієслово.', es: '¡Hola, Marta! ¿qué tal en Sevilla? Aquí en Kiev ___ mucho frío.', opts: [['hace', 'c'], ['tiene', 'x', 'Місто не «має холод»: hace frío.'], ['está', 'x', 'Про погоду кажемо hace frío.']], rule: R.hte, ref: '¡Hola, Marta! ¿qué tal en Sevilla? Aquí en Kiev hace mucho frío.', ok: 'Правильно: про погоду — hace.', no: 'Про погоду — hace: hace mucho frío.' }),

  // routine / now / plan
  choice(L, { id: 'T61', role: 'supported', family: 'free-time', ts: [RNP], ask: 'Пабло розповідає про свою ЗВИЧКУ (що він робить щосуботи). Оберіть речення. Підказка: звичка — простий теперішній.', opts: [['Los sábados juego al fútbol.', 'c'], ['Este sábado voy a jugar al fútbol.', 'x', 'Це план на одну суботу, а не звичка.'], ['Ahora estoy jugando al fútbol.', 'x', 'Це дія зараз, а не звичка.']], rule: R.rnp, ok: 'Правильно: звичка — простий теперішній.', no: 'Звичка — простий теперішній: Los sábados juego al fútbol.' }),
  choice(L, { id: 'T62', role: 'independent', family: 'family-home', ts: [RNP], ask: 'Ана пише подрузі, що вона робить ПРОСТО ЗАРАЗ. Оберіть речення.', opts: [['Ahora mismo estoy cocinando.', 'c'], ['Cocino todos los días.', 'x', 'Це звичка.'], ['Mañana voy a cocinar.', 'x', 'Це план на завтра.']], rule: R.rnp, ok: 'Правильно: дія зараз — estar + герундій.', no: 'Дія зараз: Ahora mismo estoy cocinando.' }),
  choice(L, { id: 'T63', role: 'independent', family: 'plans', ts: [RNP], ask: 'Луїс розповідає про ПЛАН на цю неділю. Оберіть речення.', opts: [['El domingo voy a ir a la playa.', 'c'], ['Los domingos voy a la playa.', 'x', 'Los domingos — щонеділі, тобто звичка.'], ['Estoy en la playa.', 'x', 'Це про «зараз».']], rule: R.rnp, ok: 'Правильно: план — ir a + інфінітив з вказівкою часу.', no: 'План: El domingo voy a ir a la playa.' }),
  choice(L, { id: 'T64', role: 'delayed', family: 'work-study', ts: [RNP], ask: 'Оберіть варіант, який підходить до тексту.', es: 'Normalmente Marta trabaja en una oficina, pero hoy está en casa: ___. Mañana vuelve a la oficina.', opts: [['está trabajando en casa', 'c'], ['trabaja en casa todos los días', 'x', 'Це суперечить тексту: зазвичай вона працює в офісі.'], ['va a trabajar en la oficina hoy', 'x', 'Сьогодні Марта вдома.']], rule: R.rnp, ref: 'Normalmente Marta trabaja en una oficina, pero hoy está en casa: está trabajando en casa. Mañana vuelve a la oficina.', ok: 'Правильно: сьогодні, тимчасово — estar + герундій.', no: 'Підходить: está trabajando en casa — сьогодні, тимчасово.' }),
  choice(L, { id: 'T65', role: 'delayed', family: 'routine', ts: [RNP], ask: 'Оберіть варіант, який підходить до тексту.', es: 'Hoy es lunes. Los lunes Ana tiene clase de inglés, pero hoy está enferma: ___.', opts: [['ahora está durmiendo', 'c'], ['los lunes duerme mucho', 'x', 'Це звичка, а текст про сьогодні.'], ['mañana va a dormir', 'x', 'Текст про сьогодні, а не про завтра.']], rule: R.rnp, ref: 'Hoy es lunes. Los lunes Ana tiene clase de inglés, pero hoy está enferma: ahora está durmiendo.', ok: 'Правильно: що відбувається зараз — estar + герундій.', no: 'Підходить: ahora está durmiendo.' }),
  choice(L, { id: 'T66', role: 'transfer', family: 'messages', ts: [RNP], ask: 'Допишіть повідомлення: оберіть варіант, який підходить.', es: '¡Hola, Pablo! Estoy en el tren. ___ y llego a las diez. Mañana vamos al cine, ¿vale?', opts: [['Ahora estoy leyendo un libro', 'c'], ['Mañana voy a leer un libro', 'x', 'У повідомленні йдеться про те, що людина робить зараз у потязі.'], ['Los domingos leo un libro', 'x', 'Це звичка, а не те, що відбувається зараз.']], rule: R.rnp, ref: '¡Hola, Pablo! Estoy en el tren. Ahora estoy leyendo un libro y llego a las diez. Mañana vamos al cine, ¿vale?', ok: 'Правильно: зараз у потязі — estar + герундій.', no: 'Підходить: Ahora estoy leyendo un libro.' }),

  // reading
  choice(L, { id: 'T71', role: 'supported', family: 'messages-chat', ts: [RD], ask: 'Прочитайте повідомлення Ани. Що вона зазвичай робить по суботах? Корисні слова: un beso — цілую.', es: TXT_A, opts: [['Працює в крамниці батьків.', 'c'], ['Готує вдома.', 'x', 'Це вона робить зараз.'], ['Вечеряє з друзями.', 'x', 'Це план на сьогоднішній вечір.']], rule: R.rnp, ok: 'Правильно: normalmente los sábados trabajo en la tienda de mis padres.', no: 'Ана пише: normalmente los sábados trabajo en la tienda de mis padres.' }),
  choice(L, { id: 'T72', role: 'independent', family: 'messages-chat', ts: [RD], ask: 'Прочитайте повідомлення Ани. Що вона робить зараз?', es: TXT_A, opts: [['Готує вдома.', 'c'], ['Працює в крамниці.', 'x', 'Сьогодні вона не працює.'], ['Вечеряє з друзями.', 'x', 'Вечеря з друзями — увечері.']], rule: R.rnp, ok: 'Правильно: ahora estoy en casa y estoy cocinando.', no: 'Ана пише: ahora estoy en casa y estoy cocinando.' }),
  choice(L, { id: 'T73', role: 'independent', family: 'messages-chat', ts: [RD], ask: 'Прочитайте повідомлення Ани. Що вона планує на вечір?', es: TXT_A, opts: [['Вечеряти з друзями.', 'c'], ['Працювати в крамниці.', 'x', 'Сьогодні вона не працює.'], ['Готувати для батьків.', 'x', 'Про це в повідомленні не йдеться.']], rule: R.rnp, ok: 'Правильно: esta noche vamos a cenar con unos amigos.', no: 'Ана пише: esta noche vamos a cenar con unos amigos.' }),
  choice(L, { id: 'T74', role: 'delayed', family: 'description', ts: [RD], ask: 'Прочитайте текст. Що Луїс робить зараз?', es: TXT_B, opts: [['Читає в парку.', 'c'], ['Працює в барі.', 'x', 'Сьогодні неділя, і він не працює.'], ['Іде до лікаря.', 'x', 'До лікаря він піде завтра.']], rule: R.rnp, ok: 'Правильно: ahora estoy leyendo en el parque.', no: 'Луїс пише: ahora estoy leyendo en el parque.' }),
  choice(L, { id: 'T75', role: 'delayed', family: 'description', ts: [RD], ask: 'Прочитайте текст. Що Луїс мусить зробити завтра після обіду?', es: TXT_B, opts: [['Працювати.', 'c'], ['Піти до лікаря.', 'x', 'До лікаря — уранці.'], ['Читати в парку.', 'x', 'Це він робить сьогодні.']], rule: R.rnp, ok: 'Правильно: por la tarde tengo que trabajar.', no: 'Луїс пише: por la tarde tengo que trabajar.' }),
  choice(L, { id: 'T76', role: 'transfer', family: 'diary', ts: [RD], ask: 'Прочитайте запис у щоденнику. Чому людина сьогодні вдома?', es: TXT_C, opts: [['Бо вона хвора.', 'c'], ['Бо сьогодні вихідний.', 'x', 'Сьогодні вівторок; людина не йде на заняття, бо хвора.'], ['Бо в неї відпустка.', 'x', 'Про відпустку в тексті не йдеться.']], rule: R.rnp, ok: 'Правильно: porque estoy enfermo.', no: 'У тексті: hoy no voy a la universidad porque estoy enfermo.' }),

  // writing
  rubric(L, {
    id: 'T81', role: 'supported', family: 'my-day', ts: [WR],
    ask: 'Напишіть 3–5 речень про свій день: що ви робите зазвичай, що робите зараз і що збираєтеся робити ввечері чи завтра. Можна взяти зразок за основу.',
    es: [EX('Normalmente trabajo en una oficina. Hoy es sábado y no trabajo: ahora estoy leyendo en casa. Esta noche voy a cenar con mis amigos.', 'Зазвичай я працюю в офісі. Сьогодні субота, і я не працюю: зараз я читаю вдома. Сьогодні ввечері я збираюся вечеряти з друзями.')],
    criteria: [
      'Є речення про звичку: простий теперішній час і слово на кшталт normalmente, siempre, los lunes.',
      'Є речення про те, що відбувається зараз: estar + герундій.',
      'Є план із вказівкою часу: ir a + інфінітив або теперішній час + mañana, esta noche.',
      'Форми дієслів відповідають особі; poder чи tener que — лише там, де цього вимагає зміст.',
    ],
    exemplars: [
      'Normalmente estudio por la mañana. Ahora estoy en el parque y estoy escuchando música. Mañana voy a ir al cine con mi hermana.',
      'Los lunes trabajo en casa. Hoy es lunes y ahora estoy escribiendo mensajes. Esta noche voy a cocinar para mis padres.',
    ],
    rule: R.rnp,
  }),
  rubric(L, {
    id: 'T82', role: 'independent', family: 'messages-chat', ts: [WR],
    ask: 'Ви в потязі. Напишіть другові повідомлення (3–5 речень): що ви зазвичай робите в цей час, що робите зараз і що плануєте на вихідні.',
    criteria: [
      'Є звичка (простий теперішній), дія зараз (estar + герундій) і план (ir a + інфінітив) з вказівкою часу.',
      'Повідомлення має привітання й прощання.',
      'Форми дієслів відповідають особі.',
    ],
    exemplars: ['¡Hola, Pablo! Normalmente a esta hora estoy en la oficina, pero hoy estoy en el tren. Ahora estoy leyendo un libro. El sábado voy a ir a la playa con mi familia. Un abrazo.'],
    rule: R.rnp,
  }),
  rubric(L, {
    id: 'T83', role: 'transfer', family: 'invitation', ts: [WR],
    ask: 'Подруга запрошує вас у кіно в суботу. Напишіть відповідь (3–5 речень): що ви робите зараз, чому в суботу не можете (tener que) і що пропонуєте натомість.',
    criteria: [
      'Є дія зараз (estar + герундій).',
      'Пояснено, чому не можете: no puedo… tengo que + інфінітив.',
      'Є пропозиція чи план на інший день (ir a + інфінітив або теперішній час + вказівка часу).',
      'Форми дієслів відповідають особі.',
    ],
    exemplars: ['¡Hola, Marta! Ahora estoy cocinando. El sábado no puedo ir al cine: tengo que trabajar. ¿Vamos el domingo? Voy a estar en casa por la tarde. Un beso.'],
    rule: R.rnp,
  }),

  // listening
  choice(L, { id: 'T91', role: 'supported', family: 'voice-message', ts: [LS], clips: [CA], ask: 'Прослухайте голосове повідомлення. Де Кармен зараз? Корисні слова: vuelvo de — повертаюся з; un abrazo — обіймаю.', opts: [['У потязі.', 'c'], ['На пляжі.', 'x', 'На пляж вона збирається в неділю.'], ['На роботі.', 'x', 'Цих вихідних вона не працює.']], transcript: TR_A, ok: 'Правильно: ahora estoy en el tren.', no: 'Кармен каже: ahora estoy en el tren.' }),
  choice(L, { id: 'T92', role: 'independent', family: 'voice-message', ts: [LS], clips: [CA], ask: 'Прослухайте голосове повідомлення. Що Кармен планує на неділю?', opts: [['Поїхати на пляж із дітьми.', 'c'], ['Працювати.', 'x', 'Цих вихідних вона не працює.'], ['Поїхати до Валенсії.', 'x', 'З Валенсії вона повертається зараз.']], transcript: TR_A, ok: 'Правильно: el domingo voy a ir a la playa con mis hijos.', no: 'Кармен каже: el domingo voy a ir a la playa con mis hijos.' }),
  choice(L, { id: 'T93', role: 'independent', family: 'family-plans', ts: [LS], clips: [CB], ask: 'Прослухайте запис. Чому мама не може вийти з дому?', opts: [['Вона хвора.', 'c'], ['Їй треба вчитися.', 'x', 'Учитися треба братові.'], ['Вона робить покупки.', 'x', 'Покупки роблять тато і той, хто говорить.']], transcript: TR_B, ok: 'Правильно: mi madre no puede salir porque está enferma.', no: 'У записі: mi madre no puede salir porque está enferma.' }),
  choice(L, { id: 'T94', role: 'delayed', family: 'family-plans', ts: [LS], clips: [CB], ask: 'Прослухайте запис. Що родина робитиме в неділю?', opts: [['Дивитися футбол удома.', 'c'], ['Робити покупки.', 'x', 'Покупки — у суботу вранці.'], ['Їхати на пляж.', 'x', 'Про пляж у записі не йдеться.']], transcript: TR_B, ok: 'Правильно: el domingo vamos a ver el fútbol en casa.', no: 'У записі: el domingo vamos a ver el fútbol en casa.' }),
  choice(L, { id: 'T95', role: 'transfer', family: 'weather', ts: [LS], clips: [CC], ask: 'Прослухайте запис. Що людина робить зараз і що буде завтра?', opts: [['Зараз п’є каву в барі; завтра буде дощ.', 'c'], ['Зараз гуляє центром; завтра буде спекотно.', 'x', 'Гуляти вона збирається ввечері, а завтра буде дощ.'], ['Зараз іде дощ; завтра вона буде в барі.', 'x', 'Зараз дуже спекотно; дощ буде завтра.']], transcript: TR_C, ok: 'Правильно: ahora estoy tomando un café… mañana va a llover.', no: 'У записі: ahora estoy tomando un café; mañana va a llover.' }),
  dictation(L, { id: 'T96', role: 'delayed', family: 'weather', t: LS_D, clip: CC, closed: false, ask: 'Прослухайте запис і запишіть почуте іспанською. Великі літери та крапку в кінці не оцінюємо; якщо розділові знаки всередині відрізняються, відповідь залишиться на перевірку.', a: [TR_C], err: [['Hoy hace mucho calor en Sevilla. Ahora estoy en un bar de la plaza y estoy tomando un cafe. Esta tarde voy a pasear por el centro, pero mañana va a llover.', 'Слова почуто правильно, але café пишемо зі знаком наголосу.']] }),
];

export const clips = [
  clip({ id: CA, lessonId: L, kind: 'text', family: 'voice-message', targets: [LS], transcript: TR_A, translationUk: 'Привіт, Луїсе, це Кармен. Як справи? Я зараз у потязі: повертаюся з Валенсії. Зазвичай я працюю по суботах, але цих вихідних — ні. У неділю я збираюся поїхати на пляж із дітьми. Хочеш поїхати з нами? Нам треба виїжджати о дев’ятій ранку. Обіймаю.' }),
  clip({ id: CB, lessonId: L, kind: 'text', family: 'family-plans', targets: [LS], transcript: TR_B, translationUk: 'Цих вихідних моя родина дуже зайнята. Братові треба вчитися: у понеділок у нього іспит. Мама не може виходити, бо хворіє. У суботу вранці ми з татом збираємося зробити покупки, а в неділю — дивитися футбол удома.' }),
  clip({ id: CC, lessonId: L, kind: 'text', family: 'weather', targets: [LS, LS_D], transcript: TR_C, translationUk: 'Сьогодні в Севільї дуже спекотно. Зараз я в барі на площі й п’ю каву. Сьогодні по обіді я збираюся погуляти центром, а завтра буде дощ.' }),
];

const T_WEATHER = TABLE_UK(['погода', 'іспанською'], [
  ['спекотно / холодно', 'hace calor / hace frío'],
  ['дуже спекотно', 'hace mucho calor'],
  ['сонячно / вітряно', 'hace sol / hace viento'],
  ['гарна / погана погода', 'hace buen tiempo / hace mal tiempo'],
  ['іде дощ / сніг (зазвичай)', 'llueve / nieva'],
  ['іде дощ / сніг (зараз)', 'está lloviendo / está nevando'],
  ['хмарно / ясно', 'está nublado / está despejado'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Звичка, дія зараз і план: усе разом; погода',
  termEs: 'rutina, acción en curso y planes; el tiempo',
  summaryUk:
    'Читаємо, слухаємо й пишемо короткі ситуації, де є звичка, дія зараз і план. Вчимося говорити про погоду: hace calor, llueve, está nublado — і відрізняти hace frío, tengo frío та el café está frío.',
  objectives: ['A2-01-O9'],
  cv: ['CV-04', 'CV-06'],
  situations: ['routine-study-leisure', 'time-appointments-transport', 'personal-messages', 'conditions-weather-problems'],
  estimatedMinutes: 20,
  introduces: ['contrast.routine-now-plan', 'reading.routine-now-plan', 'writing.routine-now-plan', 'listening.situation-plan', 'formula.weather-hace', 'present.llover-nevar', 'estar.weather', 'contrast.hace-tener-estar'],
  revisits: ['contrast.present-progressive', 'contrast.plan-vs-wish', 'future-ir.ir-a-inf', 'progressive.estar-gerund', 'obligation.tener-que', 'ability.poder-inf', 'contrast.modal-meaning', 'present.hacer', 'tener.physical-states', 'estar.state', 'contrast.muy-mucho', 'time.frequency.adverbs', 'listening.ongoing-actions'],
  steps: [
    s('s1', 'explanation', 'Звичка, дія зараз і план', true, {
      blocks: [
        UK('У розповіді про день часто поєднуються три значення. Звичка — простий теперішній: Normalmente trabajo en una oficina. Дія зараз — estar + герундій: Ahora estoy trabajando en casa. План — ir a + інфінітив: Mañana voy a ir al médico.'),
        UK('Форму обираємо за змістом усього речення, а не за одним словом: «сьогодні» може бути і звичкою (Hoy es lunes: los lunes tengo clase), і планом (Hoy voy a cenar con Ana).'),
        EX('Normalmente trabajo en una oficina, pero hoy estoy trabajando en casa y mañana voy a ir al médico.', 'Зазвичай я працюю в офісі, але сьогодні працюю вдома, а завтра збираюся до лікаря.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Звичка, зараз чи план', true, { tasks: ['T61'] }),
    s('s3', 'reading', 'Читаємо повідомлення', true, { blocks: [ES(TXT_A)], tasks: ['T71', 'T72', 'T73'] }),
    s('s4', 'explanation', 'Погода: hace, llueve, está nublado', true, {
      blocks: [
        UK('Про погоду кажемо безособово, без підмета. ¿Qué tiempo hace? — «Яка погода?» Тут tiempo означає «погода».'),
        T_WEATHER,
        UK('Ступінь: mucho перед іменником — hace mucho calor (не *muy calor). Llover (o → ue) і nevar (e → ie) уживаємо лише в 3-й особі однини.'),
        UK('Не плутайте: Hace frío — погода; Tengo frío — «мені холодно» (відчуття); El café está frío — температура предмета (прикметник узгоджується: la leche está fría).'),
        EX('Hoy hace sol, pero hace mucho viento.', 'Сьогодні сонячно, але дуже вітряно.'),
        EX('—¿Tienes frío? —Sí, y el té está frío.', '— Тобі холодно? — Так, і чай холодний.'),
      ],
    }),
    s('s5', 'supported-practice', 'Крок 2. Погода за зразком', true, { tasks: ['T01', 'T21', 'T41', 'T51'] }),
    s('s6', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T23', 'T42', 'T52', 'T62'] }),
    s('s7', 'listening', 'Слухаємо: плани на вихідні', true, { clips: [CA, CB], tasks: ['T91', 'T92', 'T93'] }),
    s('s8', 'writing', 'Пишемо про свій день', true, { tasks: ['T81'] }),
    s('s9', 'supported-practice', 'Ще приклади за зразком', false, { tasks: ['T02', 'T22'] }),
    s('s10', 'independent-practice', 'Додаткова практика', false, { tasks: ['T04', 'T05', 'T06', 'T11', 'T24', 'T25', 'T26', 'T31', 'T43', 'T53', 'T63', 'T82'] }),
    s('s11', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'Звичка — простий теперішній; дія зараз — estar + герундій; план — ir a + інфінітив.',
          'Погода: hace calor / frío / sol / viento / buen tiempo; llueve, nieva; está nublado, está despejado.',
          'Hace frío (погода) — tengo frío (відчуття) — el café está frío (предмет).',
        ]),
        LINK('Потренувати погоду', [WH, LN, EW, HTE], 'written', 10),
        LINK('Звичка, зараз чи план', [RNP, RD], 'written', 6),
        LINK('Послухати ще', [LS], 'listening', 3),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-01.weather',
    topicId: L,
    titleUk: 'Погода: hace, llueve, está nublado',
    blocks: [T_WEATHER, UK('Hace frío — погода; tengo frío — відчуття людини; el café está frío — температура предмета.'), LINK('Практика: погода', [WH, LN, EW, HTE], 'written', 10)],
    linkedTargets: [WH, WH_R, LN, LN_R, EW, HTE],
  }),
];
