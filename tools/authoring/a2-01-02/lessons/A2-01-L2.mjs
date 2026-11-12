// A2-01-L2 — other irregular and spelling-dependent present forms; sé/se; saber vs conocer; personal a.
import { EX, LINK, LIST_UK, TABLE_ES, UK, ES, choice, gap, lesson as mkLesson, material, open, step } from '../lib.mjs';

const L = 'A2-01-L2';
const YOG = 'present.yo-g/written-form';
const VEN = 'present.venir/written-form';
const DEC = 'present.decir/written-form';
const ZCO = 'present.yo-zco/written-form';
const SAB = 'present.saber/written-form';
const SE = 'ortho.accent-pair.se/written-form';
const SE_C = 'ortho.accent-pair.se/context-choice';
const DAR = 'present.dar/written-form';
const VER = 'present.ver/written-form';
const GJ = 'present.yo-spelling-g-j/written-form';
const SC_C = 'contrast.saber-conocer/context-choice';
const SC_R = 'contrast.saber-conocer/reading-meaning';
const PA = 'prep.a.personal/written-form';
const PA_C = 'prep.a.personal/context-choice';

const R = {
  yog: 'У poner, salir, traer і hacer форма yo закінчується на -go: pongo, salgo, traigo, hago. Інші особи — регулярні: pones, sales, traes, haces.',
  zco: 'У conocer, conducir і traducir форма yo закінчується на -zco: conozco, conduzco, traduzco. Інші особи — регулярні: conoces, conduce, traducimos.',
  ven: 'Venir: yo vengo (з -go, як tengo); tú vienes, él viene, ellos vienen (e → ie); nosotros venimos, vosotros venís — без зміни основи.',
  dec: 'Decir: yo digo (з -go); tú dices, él dice, ellos dicen (e → i); nosotros decimos, vosotros decís — без зміни основи.',
  sab: 'Saber неправильне лише у формі yo: sé. Інші форми регулярні: sabes, sabe, sabemos, sabéis, saben.',
  se: 'Sé зі знаком наголосу — форма yo дієслова saber: No sé. Se без знака — займенник: Ana se levanta a las siete.',
  dar: 'Dar: yo doy (як voy від ir); інші форми регулярні й короткі: das, da, damos, dais, dan. Односкладові das, da, dais пишемо без знака наголосу.',
  ver: 'Ver: yo veo; інші форми регулярні: ves, ve, vemos, ven. Veis — один склад, тому без знака наголосу.',
  gj: 'Перед -o буква g змінюється на j, щоб зберегти звук [х]: coger → cojo, recoger → recojo, escoger → escojo. В інших формах — g: coges, recoge.',
  pa: 'Якщо прямий додаток — конкретна людина, перед ним ставимо a (a + el = al): Conozco a Ana. Veo al profesor. Перед предметами й місцями a не ставимо: Conozco Madrid.',
  sc: 'Saber — знати факт, інформацію (Sé dónde vive Ana). Conocer — бути знайомим з людиною, місцем чи річчю (Conozco a Ana, conozco Madrid).',
};
const yog = (f) => `У формі yo це дієслово закінчується на -go: ${f}.`;
const zco = (f) => `У формі yo дієслів conocer, conducir, traducir пишемо -zco: ${f}.`;
const num = (wrong, right, who) => `${wrong} — форма однини. Для «${who}» потрібна форма множини: ${right}.`;
const person = (wrong, right, who) => `${wrong} — форма іншої особи. Для «${who}» потрібна форма ${right}.`;
const venS = (f) => `Під наголосом e змінюється на ie, як у tener: ${f}.`;
const decS = (f) => `Під наголосом e змінюється на i: ${f}.`;
const noChange = (f) => `У формах nosotros і vosotros основа не змінюється: ${f}.`;
const accent = (f) => `Цю форму пишемо зі знаком наголосу: ${f}.`;
const oneSyl = (f) => `${f} — один склад, тому пишемо без знака наголосу.`;
const gj = (f) => `Перед -o пишемо j, щоб зберегти звук [х]: ${f}.`;
const ASK = 'Впишіть правильну форму дієслова з дужок.';
const ASK_S = 'Подивіться на зразок і впишіть правильну форму дієслова з дужок.';
const ASK_MSG = 'Допишіть повідомлення: впишіть правильну форму дієслова з дужок.';
const ASK_SE = 'Впишіть se або sé.';
const ASK_PA = 'Впишіть a або al.';

// saber 1s doubles as evidence for the sé/se spelling (two independently attributed targets)
const SE_ERR = ['se', { [SAB]: 'unresolved', [SE]: 'incorrect' }, 'Форму yo дієслова saber пишемо зі знаком наголосу: sé. Se без знака — займенник (se levanta).'];
const SABO_ERR = ['sabo', { [SAB]: 'incorrect', [SE]: 'unresolved' }, 'Форма yo дієслова saber неправильна: sé.'];
const sabYo = (id, role, family, es, uk, extra = {}) =>
  open(L, { id, role, family, ts: [SAB, SE], ask: extra.ask ?? ASK, model: extra.model, es, uk, a: ['sé'], err: [SE_ERR, SABO_ERR], rule: [R.sab, R.se], ok: 'Правильно: sé — форма yo дієслова saber, зі знаком наголосу.', no: 'Правильна відповідь: sé — форма yo дієслова saber, зі знаком наголосу.' });

export const tasks = [
  // yo -go
  gap(L, { id: 'T01', role: 'supported', family: 'routine', t: YOG, ask: ASK_S, model: [['Por la mañana salgo de casa a las ocho.', 'Уранці я виходжу з дому о восьмій.']], es: 'Siempre ___ (poner, yo) las llaves en la mesa.', uk: 'Я завжди кладу ключі на стіл.', a: 'pongo', err: [['pono', yog('pongo')], ['pone', person('Pone', 'pongo', 'yo')]], rule: R.yog }),
  gap(L, { id: 'T02', role: 'supported', family: 'food-cafe', t: YOG, ask: ASK_S, model: [['Hago la compra los sábados.', 'Я роблю покупки по суботах.']], es: 'Hoy ___ (traer, yo) el pan.', uk: 'Сьогодні хліб приношу я.', a: 'traigo', err: [['trao', yog('traigo')], ['trago', 'У формі yo дієслова traer пишемо -ig-: traigo.']], rule: R.yog }),
  gap(L, { id: 'T03', role: 'independent', family: 'routine', t: YOG, ask: ASK, es: '___ (salir, yo) del trabajo a las seis.', uk: 'Я виходжу з роботи о шостій.', a: 'salgo', err: [['salo', yog('salgo')]], rule: R.yog }),
  gap(L, { id: 'T04', role: 'independent', family: 'free-time', t: YOG, ask: ASK, es: 'Los domingos ___ (hacer, yo) deporte.', uk: 'По неділях я займаюся спортом.', a: 'hago', err: [['haco', yog('hago')], ['hace', person('Hace', 'hago', 'yo')]], rule: R.yog }),
  gap(L, { id: 'T05', role: 'independent', family: 'family-home', t: YOG, ask: ASK, es: 'En casa siempre ___ (poner, yo) música por la noche.', uk: 'Удома я завжди вмикаю музику ввечері.', a: 'pongo', err: [['pono', yog('pongo')]], rule: R.yog }),
  gap(L, { id: 'T06', role: 'independent', family: 'work-study', t: YOG, ask: ASK, es: 'Mañana ___ (traer, yo) el ordenador a clase.', uk: 'Завтра я принесу комп’ютер на заняття.', a: 'traigo', err: [['trao', yog('traigo')]], rule: R.yog }),
  gap(L, { id: 'T07', role: 'delayed', family: 'routine', t: YOG, ask: ASK, es: 'Los viernes ___ (salir, yo) con mis amigos.', uk: 'По п’ятницях я ходжу кудись із друзями.', a: 'salgo', err: [['salo', yog('salgo')]], rule: R.yog }),
  gap(L, { id: 'T08', role: 'delayed', family: 'family-home', t: YOG, ask: ASK, es: 'Hoy yo ___ (hacer) la comida.', uk: 'Сьогодні обід готую я.', a: 'hago', err: [['haco', yog('hago')]], rule: R.yog }),
  gap(L, { id: 'T09', role: 'transfer', family: 'messages', t: YOG, ask: ASK_MSG, es: '¡Hola, Ana! ___ (salir, yo) ahora de casa. Llego a las diez.', uk: 'Привіт, Ано! Я вже виходжу з дому. Буду о десятій.', a: 'salgo', err: [['salo', yog('salgo')]], rule: R.yog }),
  gap(L, { id: 'T10', role: 'transfer', family: 'travel', t: YOG, ask: ASK, es: 'En la playa siempre ___ (poner, yo) las llaves en la mochila.', uk: 'На пляжі я завжди кладу ключі в рюкзак.', a: 'pongo', err: [['pono', yog('pongo')]], rule: R.yog }),

  // yo -zco
  gap(L, { id: 'T11', role: 'supported', family: 'work-study', t: ZCO, ask: ASK_S, model: [['Conozco Madrid muy bien.', 'Я дуже добре знаю Мадрид.']], es: 'En mi trabajo ___ (traducir, yo) mensajes del inglés al español.', uk: 'На роботі я перекладаю повідомлення з англійської на іспанську.', a: 'traduzco', err: [['traduco', zco('traduzco')], ['traduzo', zco('traduzco')]], rule: R.zco }),
  gap(L, { id: 'T12', role: 'supported', family: 'transport', t: ZCO, ask: ASK_S, model: [['Traduzco un mensaje.', 'Я перекладаю повідомлення.']], es: 'Normalmente ___ (conducir, yo) al trabajo.', uk: 'Зазвичай я їжджу на роботу машиною.', a: 'conduzco', err: [['conduco', zco('conduzco')], ['conduzo', zco('conduzco')]], rule: R.zco }),
  gap(L, { id: 'T13', role: 'independent', family: 'travel', t: ZCO, ask: ASK, es: 'No ___ (conocer, yo) Valencia.', uk: 'Я не знаю Валенсії.', a: 'conozco', err: [['conoco', zco('conozco')], ['conozo', zco('conozco')]], rule: R.zco }),
  gap(L, { id: 'T14', role: 'independent', family: 'transport', t: ZCO, ask: ASK, es: 'Yo ___ (conducir) y tú lees el mapa.', uk: 'Я веду машину, а ти читаєш мапу.', a: 'conduzco', err: [['conduco', zco('conduzco')]], rule: R.zco }),
  gap(L, { id: 'T15', role: 'independent', family: 'work-study', t: ZCO, ask: ASK, es: '___ (traducir, yo) el mensaje al ucraniano.', uk: 'Я перекладаю повідомлення українською.', a: 'traduzco', err: [['traduco', zco('traduzco')]], rule: R.zco }),
  gap(L, { id: 'T16', role: 'independent', family: 'family-home', t: ZCO, ask: ASK, es: 'No ___ (conocer, yo) a los padres de Pablo.', uk: 'Я не знайомий із батьками Пабло.', a: 'conozco', err: [['conoco', zco('conozco')]], rule: R.zco }),
  gap(L, { id: 'T17', role: 'delayed', family: 'travel', t: ZCO, ask: ASK, es: '___ (conocer, yo) un bar muy bonito cerca de la plaza.', uk: 'Я знаю дуже гарний бар біля площі.', a: 'conozco', err: [['conoco', zco('conozco')]], rule: R.zco }),
  gap(L, { id: 'T18', role: 'delayed', family: 'transport', t: ZCO, ask: ASK, es: 'Los sábados no ___ (conducir, yo): voy en bicicleta.', uk: 'По суботах я не їжджу машиною: їжджу велосипедом.', a: 'conduzco', err: [['conduco', zco('conduzco')]], rule: R.zco }),
  gap(L, { id: 'T19', role: 'transfer', family: 'messages', t: ZCO, ask: ASK_MSG, es: '¡Hola, Marta! ___ (conocer, yo) un bar nuevo en el centro. ¿Vamos el sábado?', uk: 'Привіт, Марто! Я знаю новий бар у центрі. Підемо в суботу?', a: 'conozco', err: [['conoco', zco('conozco')]], rule: R.zco }),
  gap(L, { id: 'T20', role: 'transfer', family: 'shop', t: ZCO, ask: ASK, es: 'En la tienda de mis padres, yo ___ (traducir) los avisos al inglés.', uk: 'У крамниці моїх батьків я перекладаю оголошення англійською.', a: 'traduzco', err: [['traduco', zco('traduzco')]], rule: R.zco }),

  // venir
  gap(L, { id: 'T21', role: 'supported', family: 'family-home', t: VEN, ask: ASK_S, model: [['Mis padres tienen un perro.', 'У моїх батьків є собака.']], es: 'Mis padres ___ (venir) el domingo.', uk: 'Мої батьки приїжджають у неділю.', a: 'vienen', err: [['venen', venS('vienen')]], rule: R.ven }),
  gap(L, { id: 'T22', role: 'supported', family: 'routine', t: VEN, ask: ASK_S, model: [['¿Tienes clase mañana?', 'У тебе завтра заняття?']], es: '¿A qué hora ___ (venir, tú) mañana?', uk: 'О котрій ти прийдеш завтра?', a: 'vienes', err: [['venes', venS('vienes')]], rule: R.ven }),
  gap(L, { id: 'T23', role: 'independent', family: 'work-study', t: VEN, ask: ASK, es: '___ (venir, yo) a clase en autobús.', uk: 'Я їжджу на заняття автобусом.', a: 'vengo', err: [['veno', 'Форма yo — vengo, з -go, як tengo.'], ['vieno', 'Форма yo — vengo, з -go, як tengo.']], rule: R.ven }),
  gap(L, { id: 'T24', role: 'independent', family: 'family-home', t: VEN, ask: ASK, es: 'Mi hermana ___ (venir) a casa con su perro.', uk: 'Моя сестра приходить додому зі своїм собакою.', a: 'viene', err: [['vene', venS('viene')]], rule: R.ven }),
  gap(L, { id: 'T25', role: 'independent', family: 'free-time', t: VEN, ask: ASK, es: '¿___ (venir, vosotros) al cine esta noche?', uk: 'Ви прийдете в кіно сьогодні ввечері?', a: 'venís', err: [['venis', accent('venís')], ['vienís', noChange('venís')]], rule: R.ven }),
  gap(L, { id: 'T26', role: 'independent', family: 'routine', t: VEN, ask: ASK, es: 'Nosotros ___ (venir) a la oficina a las nueve.', uk: 'Ми приходимо в офіс о дев’ятій.', a: 'venimos', err: [['vienimos', noChange('venimos')], ['venemos', 'Venir — дієслово на -ir: venimos.']], rule: R.ven }),
  gap(L, { id: 'T27', role: 'delayed', family: 'family-home', t: VEN, ask: ASK, es: 'Ana y Pablo ___ (venir) a casa el sábado.', uk: 'Ана й Пабло приходять до нас у суботу.', a: 'vienen', err: [['venen', venS('vienen')]], rule: R.ven }),
  gap(L, { id: 'T28', role: 'delayed', family: 'work-study', t: VEN, ask: ASK, es: 'Mañana no ___ (venir, yo): tengo una cita con el médico.', uk: 'Завтра я не прийду: у мене запис до лікаря.', a: 'vengo', err: [['veno', 'Форма yo — vengo, з -go, як tengo.']], rule: R.ven }),
  gap(L, { id: 'T29', role: 'transfer', family: 'messages', t: VEN, ask: ASK_MSG, es: '¡Hola, Ana! ¿___ (venir, tú) a mi cumpleaños el viernes?', uk: 'Привіт, Ано! Прийдеш на мій день народження в п’ятницю?', a: 'vienes', err: [['venes', venS('vienes')]], rule: R.ven }),
  gap(L, { id: 'T30', role: 'transfer', family: 'travel', t: VEN, ask: ASK, es: 'Mis amigos ___ (venir) de Kiev en julio.', uk: 'Мої друзі приїжджають із Києва в липні.', a: 'vienen', err: [['venen', venS('vienen')]], rule: R.ven }),

  // decir
  gap(L, { id: 'T31', role: 'supported', family: 'food-cafe', t: DEC, ask: ASK_S, model: [['Hago la cena.', 'Я готую вечерю.']], es: 'En el bar siempre ___ (decir, yo) «buenos días».', uk: 'У барі я завжди кажу «добрий день».', a: 'digo', err: [['dico', 'Форма yo — digo, з -go.'], ['dizo', 'Форма yo — digo, з -go.']], rule: R.dec }),
  gap(L, { id: 'T32', role: 'supported', family: 'work-study', t: DEC, ask: ASK_S, model: [['El camarero sirve el café.', 'Офіціант подає каву.']], es: '¿Qué ___ (decir) el aviso?', uk: 'Що написано в оголошенні?', a: 'dice', err: [['dece', decS('dice')]], rule: R.dec }),
  gap(L, { id: 'T33', role: 'independent', family: 'routine', t: DEC, ask: ASK, es: '¿Qué ___ (decir, tú)? No entiendo.', uk: 'Що ти кажеш? Я не розумію.', a: 'dices', err: [['deces', decS('dices')]], rule: R.dec }),
  gap(L, { id: 'T34', role: 'independent', family: 'family-home', t: DEC, ask: ASK, es: 'Los niños siempre ___ (decir) «gracias».', uk: 'Діти завжди кажуть «дякую».', a: 'dicen', err: [['decen', decS('dicen')]], rule: R.dec }),
  gap(L, { id: 'T35', role: 'independent', family: 'work-study', t: DEC, ask: ASK, es: 'En la oficina ___ (decir, nosotros) «buenos días».', uk: 'В офісі ми кажемо «добрий день».', a: 'decimos', err: [['dicimos', noChange('decimos')], ['decemos', 'Decir — дієслово на -ir: decimos.']], rule: R.dec }),
  gap(L, { id: 'T36', role: 'independent', family: 'free-time', t: DEC, ask: ASK, es: '¿Vosotros qué ___ (decir)? ¿Vamos al cine o a la playa?', uk: 'А ви що скажете? Ідемо в кіно чи на пляж?', a: 'decís', err: [['decis', accent('decís')], ['dicís', noChange('decís')]], rule: R.dec }),
  gap(L, { id: 'T37', role: 'delayed', family: 'food-cafe', t: DEC, ask: ASK, es: 'Yo nunca ___ (decir) «no» a un café.', uk: 'Я ніколи не відмовляюся від кави.', a: 'digo', err: [['dico', 'Форма yo — digo, з -go.']], rule: R.dec }),
  gap(L, { id: 'T38', role: 'delayed', family: 'family-home', t: DEC, ask: ASK, es: 'Mi madre siempre ___ (decir) «hasta mañana».', uk: 'Моя мама завжди каже «до завтра».', a: 'dice', err: [['dece', decS('dice')]], rule: R.dec }),
  gap(L, { id: 'T39', role: 'transfer', family: 'messages', t: DEC, ask: ASK_MSG, es: '¡Hola, Ana! ¿Qué ___ (decir) tus padres? ¿Vienen el domingo?', uk: 'Привіт, Ано! Що кажуть твої батьки? Приїдуть у неділю?', a: 'dicen', err: [['decen', decS('dicen')]], rule: R.dec }),
  gap(L, { id: 'T40', role: 'transfer', family: 'shop', t: DEC, ask: ASK, es: 'En la tienda, el señor ___ (decir) el precio.', uk: 'У крамниці пан називає ціну.', a: 'dice', err: [['dece', decS('dice')]], rule: R.dec }),

  // saber (+ sé/se)
  sabYo('T41', 'supported', 'routine', 'No ___ (saber, yo) dónde está la farmacia.', 'Я не знаю, де аптека.', { ask: ASK_S, model: [['¿Sabes dónde está el banco?', 'Ти знаєш, де банк?']] }),
  gap(L, { id: 'T42', role: 'supported', family: 'family-home', t: SAB, ask: ASK_S, model: [['Mi hermano sabe mi número.', 'Мій брат знає мій номер.']], es: '¿___ (saber, tú) el número de Ana?', uk: 'Ти знаєш номер Ани?', a: 'sabes', err: [['sabe', person('Sabe', 'sabes', 'tú')]], rule: R.sab }),
  sabYo('T43', 'independent', 'work-study', '—¿A qué hora empieza la reunión? —No ___ (saber, yo).', '— О котрій починається нарада? — Не знаю.'),
  gap(L, { id: 'T44', role: 'independent', family: 'family-home', t: SAB, ask: ASK, es: 'Mis padres no ___ (saber) mi dirección nueva.', uk: 'Мої батьки не знають моєї нової адреси.', a: 'saben', err: [['sabe', num('Sabe', 'saben', 'mis padres')]], rule: R.sab }),
  gap(L, { id: 'T45', role: 'independent', family: 'free-time', t: SAB, ask: ASK, es: '¿___ (saber, vosotros) a qué hora empieza el concierto?', uk: 'Ви знаєте, о котрій починається концерт?', a: 'sabéis', err: [['sabeis', accent('sabéis')]], rule: R.sab }),
  sabYo('T46', 'independent', 'routine', 'Yo ___ (saber) su nombre, pero no recuerdo su apellido.', 'Я знаю його ім’я, але не пам’ятаю прізвища.'),
  gap(L, { id: 'T47', role: 'delayed', family: 'family-home', t: SAB, ask: ASK, es: 'Nosotros ___ (saber) dónde vive Pablo.', uk: 'Ми знаємо, де живе Пабло.', a: 'sabemos', err: [['sabimos', 'Saber — дієслово на -er: sabemos.']], rule: R.sab }),
  sabYo('T48', 'delayed', 'work-study', '—¿Quién es el profesor nuevo? —No ___ (saber, yo).', '— Хто новий викладач? — Не знаю.'),
  sabYo('T49', 'transfer', 'messages', '¡Hola, Pablo! ___ (saber, yo) dónde está tu móvil: en mi coche.', 'Привіт, Пабло! Я знаю, де твій мобільний: у моїй машині.', { ask: ASK_MSG }),
  gap(L, { id: 'T50', role: 'transfer', family: 'shop', t: SAB, ask: ASK, es: 'La chica de la tienda no ___ (saber) el precio del queso.', uk: 'Дівчина в крамниці не знає ціни сиру.', a: 'sabe', err: [['sabes', person('Sabes', 'sabe', 'la chica')]], rule: R.sab }),

  // sé / se
  gap(L, { id: 'T51', role: 'supported', family: 'routine', t: SE, ask: `Подивіться на зразок і ${ASK_SE.toLowerCase()}`, model: [['Ana se ducha por la mañana.', 'Ана приймає душ уранці.']], es: 'Pablo ___ levanta muy temprano.', uk: 'Пабло встає дуже рано.', a: 'se', err: [['sé', 'Тут займенник дієслова levantarse — пишемо без знака: se.']], rule: R.se, why: 'Займенник se пишемо без знака наголосу.' }),
  gap(L, { id: 'T52', role: 'independent', family: 'family-home', t: SE, ask: ASK_SE, es: 'Mis hijos ___ duchan por la noche.', uk: 'Мої діти приймають душ увечері.', a: 'se', err: [['sé', 'Тут займенник дієслова ducharse — пишемо без знака: se.']], rule: R.se, why: 'Займенник se пишемо без знака наголосу.' }),
  gap(L, { id: 'T53', role: 'independent', family: 'routine', t: SE, ask: ASK_SE, es: 'No ___ a qué hora se levanta Marta.', uk: 'Я не знаю, о котрій встає Марта.', a: 'sé', err: [['se', 'Тут форма yo дієслова saber — пишемо зі знаком наголосу: sé.']], rule: R.se, why: 'Форма yo дієслова saber має знак наголосу.' }),
  gap(L, { id: 'T54', role: 'delayed', family: 'routine', t: SE, ask: ASK_SE, es: 'El niño ___ lava los dientes.', uk: 'Хлопчик чистить зуби.', a: 'se', err: [['sé', 'Тут займенник дієслова lavarse — пишемо без знака: se.']], rule: R.se, why: 'Займенник se пишемо без знака наголосу.' }),
  gap(L, { id: 'T55', role: 'transfer', family: 'messages', t: SE, ask: ASK_SE, es: '¡Hola, Ana! No ___ dónde están mis llaves. ¿Están en tu bolso?', uk: 'Привіт, Ано! Я не знаю, де мої ключі. Вони в твоїй сумці?', a: 'sé', err: [['se', 'Тут форма yo дієслова saber — пишемо зі знаком наголосу: sé.']], rule: R.se, why: 'Форма yo дієслова saber має знак наголосу.' }),
  choice(L, { id: 'T56', role: 'independent', family: 'family-home', ts: [SE_C], ask: 'Оберіть правильне написання.', es: 'Mi padre ___ peina por la mañana.', opts: [['se', 'c'], ['sé', 'x', 'Тут займенник дієслова peinarse, тому без знака: se.']], rule: R.se, ok: 'Правильно: se — займенник, без знака наголосу.', no: 'Тут потрібен займенник se без знака наголосу.' }),
  choice(L, { id: 'T57', role: 'delayed', family: 'shop', ts: [SE_C], ask: 'Оберіть правильне написання.', es: 'No ___ cuánto cuesta el billete.', opts: [['sé', 'c'], ['se', 'x', 'Тут «я не знаю» — форма yo дієслова saber, зі знаком наголосу: sé.']], rule: R.se, ok: 'Правильно: sé — форма yo дієслова saber.', no: 'Тут потрібна форма saber зі знаком наголосу: sé.' }),

  // dar
  gap(L, { id: 'T61', role: 'supported', family: 'work-study', t: DAR, ask: ASK_S, model: [['Hoy voy al gimnasio.', 'Сьогодні я йду в спортзал.']], es: 'Yo ___ (dar) clases de español en una escuela.', uk: 'Я викладаю іспанську в школі.', a: 'doy', err: [['do', 'Форма yo дієслова dar — doy, як voy від ir.']], rule: R.dar }),
  gap(L, { id: 'T62', role: 'supported', family: 'free-time', t: DAR, ask: ASK_S, model: [['Mi padre da clases de música.', 'Мій тато викладає музику.']], es: '¿Qué película ___ (dar, ellos) hoy en el cine?', uk: 'Який фільм сьогодні йде в кінотеатрі?', a: 'dan', err: [['da', 'Тут 3-тя особа множини («показують»): dan.']], rule: R.dar }),
  gap(L, { id: 'T63', role: 'independent', family: 'work-study', t: DAR, ask: ASK, es: 'Mi madre ___ (dar) clases de inglés.', uk: 'Моя мама викладає англійську.', a: 'da', err: [['dá', oneSyl('Da')]], rule: R.dar }),
  gap(L, { id: 'T64', role: 'independent', family: 'family-home', t: DAR, ask: ASK, es: 'Siempre ___ (dar, nosotros) las gracias.', uk: 'Ми завжди дякуємо.', a: 'damos', rule: R.dar }),
  gap(L, { id: 'T65', role: 'independent', family: 'work-study', t: DAR, ask: ASK, es: '¿___ (dar, vosotros) clases los sábados?', uk: 'Ви проводите заняття по суботах?', a: 'dais', err: [['daís', oneSyl('Dais')]], rule: R.dar }),
  gap(L, { id: 'T66', role: 'independent', family: 'free-time', t: DAR, ask: ASK, es: 'Los sábados ___ (dar, ellos) conciertos en la plaza.', uk: 'По суботах на площі влаштовують концерти.', a: 'dan', rule: R.dar }),
  gap(L, { id: 'T67', role: 'delayed', family: 'work-study', t: DAR, ask: ASK, es: '¿Tú ___ (dar) clases de música?', uk: 'Ти викладаєш музику?', a: 'das', err: [['dás', oneSyl('Das')]], rule: R.dar }),
  gap(L, { id: 'T68', role: 'delayed', family: 'work-study', t: DAR, ask: ASK, es: 'Los lunes ___ (dar, yo) clase de nueve a dos.', uk: 'По понеділках я викладаю з дев’ятої до другої.', a: 'doy', err: [['do', 'Форма yo дієслова dar — doy, як voy від ir.']], rule: R.dar }),
  gap(L, { id: 'T69', role: 'transfer', family: 'messages', t: DAR, ask: ASK_MSG, es: '¡Hola, Ana! El sábado ___ (dar, ellos) un concierto en el parque. ¿Vamos?', uk: 'Привіт, Ано! У суботу в парку буде концерт. Підемо?', a: 'dan', rule: R.dar }),
  gap(L, { id: 'T70', role: 'transfer', family: 'travel', t: DAR, ask: ASK, es: 'En el hotel ___ (dar, ellos) el desayuno de ocho a diez.', uk: 'У готелі сніданок дають з восьмої до десятої.', a: 'dan', rule: R.dar }),

  // ver
  gap(L, { id: 'T71', role: 'supported', family: 'free-time', t: VER, ask: ASK_S, model: [['Leo el periódico.', 'Я читаю газету.']], es: 'Los domingos ___ (ver, yo) películas en casa.', uk: 'По неділях я дивлюся фільми вдома.', a: 'veo', err: [['ve', person('Ve', 'veo', 'yo')]], rule: R.ver }),
  gap(L, { id: 'T72', role: 'supported', family: 'family-home', t: VER, ask: ASK_S, model: [['Mis padres leen mucho.', 'Мої батьки багато читають.']], es: '¿___ (ver, vosotros) el fútbol los sábados?', uk: 'Ви дивитеся футбол по суботах?', a: 'veis', err: [['veís', oneSyl('Veis')]], rule: R.ver }),
  gap(L, { id: 'T73', role: 'independent', family: 'family-home', t: VER, ask: ASK, es: 'Mi hermano ___ (ver) el fútbol con sus amigos.', uk: 'Мій брат дивиться футбол із друзями.', a: 've', err: [['vé', oneSyl('Ve')]], rule: R.ver }),
  gap(L, { id: 'T74', role: 'independent', family: 'routine', t: VER, ask: ASK, es: 'Desde mi ventana ___ (ver, yo) el parque.', uk: 'Зі свого вікна я бачу парк.', a: 'veo', rule: R.ver }),
  gap(L, { id: 'T75', role: 'independent', family: 'transport', t: VER, ask: ASK, es: '¿___ (ver, tú) el autobús?', uk: 'Ти бачиш автобус?', a: 'ves', rule: R.ver }),
  gap(L, { id: 'T76', role: 'independent', family: 'free-time', t: VER, ask: ASK, es: 'Nosotros ___ (ver) muchas películas.', uk: 'Ми дивимося багато фільмів.', a: 'vemos', rule: R.ver }),
  gap(L, { id: 'T77', role: 'delayed', family: 'free-time', t: VER, ask: ASK, es: 'Mis amigos ___ (ver) una película de terror.', uk: 'Мої друзі дивляться фільм жахів.', a: 'ven', err: [['ve', num('Ve', 'ven', 'mis amigos')]], rule: R.ver }),
  gap(L, { id: 'T78', role: 'delayed', family: 'routine', t: VER, ask: ASK, es: 'Por la noche ___ (ver, nosotros) una película.', uk: 'Увечері ми дивимося фільм.', a: 'vemos', rule: R.ver }),
  gap(L, { id: 'T79', role: 'transfer', family: 'messages', t: VER, ask: ASK_MSG, es: '¡Hola, Pablo! ___ (ver, yo) a tus padres en el parque.', uk: 'Привіт, Пабло! Я бачу твоїх батьків у парку.', a: 'veo', rule: R.ver }),
  gap(L, { id: 'T80', role: 'transfer', family: 'travel', t: VER, ask: ASK, es: 'Desde el hotel ___ (ver, nosotros) la playa.', uk: 'З готелю ми бачимо пляж.', a: 'vemos', rule: R.ver }),

  // g → j
  gap(L, { id: 'T81', role: 'supported', family: 'transport', t: GJ, ask: ASK_S, model: [['Mi hermano coge el tren a las siete.', 'Мій брат сідає на потяг о сьомій.']], es: 'Yo ___ (coger) el autobús a las ocho.', uk: 'Я сідаю на автобус о восьмій.', a: 'cojo', err: [['cogo', gj('cojo')]], rule: R.gj }),
  gap(L, { id: 'T82', role: 'supported', family: 'family-home', t: GJ, ask: ASK_S, model: [['Mi madre recoge a los niños.', 'Моя мама забирає дітей.']], es: 'Yo ___ (recoger) a los niños en la escuela.', uk: 'Я забираю дітей зі школи.', a: 'recojo', err: [['recogo', gj('recojo')]], rule: R.gj }),
  gap(L, { id: 'T83', role: 'independent', family: 'shop', t: GJ, ask: ASK, es: 'Siempre ___ (escoger, yo) la fruta en la tienda.', uk: 'Я завжди обираю фрукти в крамниці.', a: 'escojo', err: [['escogo', gj('escojo')]], rule: R.gj }),
  gap(L, { id: 'T84', role: 'independent', family: 'transport', t: GJ, ask: ASK, es: 'Mañana ___ (coger, yo) el tren de las nueve.', uk: 'Завтра я їду потягом, що відправляється о дев’ятій.', a: 'cojo', err: [['cogo', gj('cojo')]], rule: R.gj }),
  gap(L, { id: 'T85', role: 'independent', family: 'family-home', t: GJ, ask: ASK, es: 'Después de comer, ___ (recoger, yo) la cocina.', uk: 'Після обіду я прибираю на кухні.', a: 'recojo', err: [['recogo', gj('recojo')]], rule: R.gj }),
  gap(L, { id: 'T86', role: 'independent', family: 'food-cafe', t: GJ, ask: ASK, es: 'En el bar, yo ___ (escoger) la mesa.', uk: 'У барі столик обираю я.', a: 'escojo', err: [['escogo', gj('escojo')]], rule: R.gj }),
  gap(L, { id: 'T87', role: 'delayed', family: 'transport', t: GJ, ask: ASK, es: 'Normalmente ___ (coger, yo) la bicicleta.', uk: 'Зазвичай я беру велосипед.', a: 'cojo', err: [['cogo', gj('cojo')]], rule: R.gj }),
  gap(L, { id: 'T88', role: 'delayed', family: 'shop', t: GJ, ask: ASK, es: '¿Qué ___ (escoger, yo)? ¿El bolso rojo o el negro?', uk: 'Що мені обрати? Червону сумку чи чорну?', a: 'escojo', err: [['escogo', gj('escojo')]], rule: R.gj }),
  gap(L, { id: 'T89', role: 'transfer', family: 'messages', t: GJ, ask: ASK_MSG, es: '¡Hola, Ana! Hoy ___ (recoger, yo) a los niños. Tú descansas.', uk: 'Привіт, Ано! Сьогодні дітей забираю я. А ти відпочиваєш.', a: 'recojo', err: [['recogo', gj('recojo')]], rule: R.gj }),
  gap(L, { id: 'T90', role: 'transfer', family: 'travel', t: GJ, ask: ASK, es: 'En el hotel ___ (coger, yo) un mapa de la ciudad.', uk: 'У готелі я беру мапу міста.', a: 'cojo', err: [['cogo', gj('cojo')]], rule: R.gj }),

  // personal a
  gap(L, { id: 'T91', role: 'supported', family: 'family-home', t: PA, ask: `Подивіться на зразок і ${ASK_PA.toLowerCase()}`, model: [['Veo a mis padres los domingos.', 'Я бачуся з батьками по неділях.']], es: '¿Conoces ___ Pablo?', uk: 'Ти знайомий з Пабло?', a: 'a', err: [['al', 'Перед іменем немає артикля, тому просто a.']], rule: R.pa, why: 'Перед людиною у ролі прямого додатка ставимо a.' }),
  gap(L, { id: 'T92', role: 'supported', family: 'work-study', t: PA, ask: `Подивіться на зразок і ${ASK_PA.toLowerCase()}`, model: [['Conozco al profesor de Ana.', 'Я знайомий з викладачем Ани.']], es: 'Los estudiantes escuchan ___ profesor.', uk: 'Студенти слухають викладача.', a: 'al', err: [['a el', 'A + el зливаються в одне слово: al.'], ['el', 'Перед людиною у ролі прямого додатка потрібне a: a + el = al.']], rule: R.pa, why: 'Перед людиною — a; a + el = al.' }),
  gap(L, { id: 'T93', role: 'independent', family: 'family-home', t: PA, ask: ASK_PA, es: 'Recojo ___ mi hijo a las cinco.', uk: 'Я забираю сина о п’ятій.', a: 'a', err: [['al', 'Перед mi артикля немає, тому просто a.']], rule: R.pa, why: 'Перед людиною у ролі прямого додатка ставимо a.' }),
  gap(L, { id: 'T94', role: 'independent', family: 'work-study', t: PA, ask: ASK_PA, es: 'No entiendo ___ profesor de inglés.', uk: 'Я не розумію викладача англійської.', a: 'al', err: [['a el', 'A + el зливаються в одне слово: al.'], ['el', 'Перед людиною у ролі прямого додатка потрібне a: a + el = al.']], rule: R.pa, why: 'Перед людиною — a; a + el = al.' }),
  gap(L, { id: 'T95', role: 'independent', family: 'travel', t: PA, ask: ASK_PA, es: 'En Madrid veo ___ mis amigos.', uk: 'У Мадриді я бачуся з друзями.', a: 'a', err: [['al', 'Перед mis артикля немає, тому просто a.']], rule: R.pa, why: 'Перед людьми у ролі прямого додатка ставимо a.' }),
  gap(L, { id: 'T96', role: 'independent', family: 'family-home', t: PA, ask: ASK_PA, es: '¿Ves ___ niño de la foto?', uk: 'Ти бачиш хлопчика на фото?', a: 'al', err: [['a el', 'A + el зливаються в одне слово: al.'], ['el', 'Перед людиною у ролі прямого додатка потрібне a: a + el = al.']], rule: R.pa, why: 'Перед людиною — a; a + el = al.' }),
  gap(L, { id: 'T97', role: 'delayed', family: 'family-home', t: PA, ask: ASK_PA, es: 'No encuentro ___ mi hermana.', uk: 'Не можу знайти сестру.', a: 'a', err: [['al', 'Перед mi артикля немає, тому просто a.']], rule: R.pa, why: 'Перед людиною у ролі прямого додатка ставимо a.' }),
  gap(L, { id: 'T98', role: 'delayed', family: 'work-study', t: PA, ask: ASK_PA, es: '¿Conoces ___ médico de tu padre?', uk: 'Ти знаєш лікаря свого тата?', a: 'al', err: [['a el', 'A + el зливаються в одне слово: al.'], ['el', 'Перед людиною у ролі прямого додатка потрібне a: a + el = al.']], rule: R.pa, why: 'Перед людиною — a; a + el = al.' }),
  gap(L, { id: 'T99', role: 'transfer', family: 'messages', t: PA, ask: ASK_PA, es: '¡Hola, Marta! Mañana recojo ___ tus padres en la estación.', uk: 'Привіт, Марто! Завтра я зустріну твоїх батьків на вокзалі.', a: 'a', err: [['al', 'Перед tus артикля немає, тому просто a.']], rule: R.pa, why: 'Перед людьми у ролі прямого додатка ставимо a.' }),
  gap(L, { id: 'T100', role: 'transfer', family: 'shop', t: PA, ask: ASK_PA, es: 'En la tienda veo ___ camarero del bar de mi calle.', uk: 'У крамниці я бачу офіціанта з бару на моїй вулиці.', a: 'al', err: [['a el', 'A + el зливаються в одне слово: al.'], ['el', 'Перед людиною у ролі прямого додатка потрібне a: a + el = al.']], rule: R.pa, why: 'Перед людиною — a; a + el = al.' }),
  choice(L, { id: 'T101', role: 'independent', family: 'travel', ts: [PA_C], ask: 'Чи потрібне тут a? Оберіть варіант.', es: 'Conozco ___ Valencia muy bien.', opts: [['a', 'x', 'Valencia — місто, а не людина, тому a не потрібне.'], ['без a', 'c']], rule: R.pa, ref: 'Conozco Valencia muy bien.', ok: 'Правильно: перед назвою міста a не ставимо — Conozco Valencia.', no: 'Перед назвою міста a не ставимо: Conozco Valencia.' }),
  choice(L, { id: 'T102', role: 'delayed', family: 'family-home', ts: [PA_C], ask: 'Чи потрібне тут a? Оберіть варіант.', es: 'Veo ___ mi madre los sábados.', opts: [['a', 'c'], ['без a', 'x', 'Mi madre — людина у ролі прямого додатка, тому потрібне a.']], rule: R.pa, ok: 'Правильно: Veo a mi madre — перед людиною ставимо a.', no: 'Перед людиною у ролі прямого додатка потрібне a: Veo a mi madre.' }),
  choice(L, { id: 'T103', role: 'transfer', family: 'messages', ts: [PA_C], ask: 'Чи потрібне тут a? Оберіть варіант.', es: '¡Hola, Ana! Tengo ___ dos hermanos y una hermana.', opts: [['a', 'x', 'Після tener a зазвичай не ставимо: Tengo dos hermanos.'], ['без a', 'c']], rule: R.pa, ref: '¡Hola, Ana! Tengo dos hermanos y una hermana.', ok: 'Правильно: після tener a зазвичай не ставимо.', no: 'Після tener a зазвичай не ставимо: Tengo dos hermanos.' }),

  // saber vs conocer
  choice(L, { id: 'T104', role: 'supported', family: 'family-home', ts: [SC_C], ask: 'Оберіть дієслово. Підказка: saber — знати факт, conocer — бути знайомим.', es: 'Yo no ___ dónde vive Pablo.', opts: [['sé', 'c'], ['conozco', 'x', 'Де живе Пабло — це інформація, тому saber: No sé dónde vive.']], rule: R.sc, ok: 'Правильно: про інформацію (де, коли, скільки) кажемо saber.', no: 'Про інформацію (де, коли, скільки) кажемо saber: No sé dónde vive Pablo.' }),
  choice(L, { id: 'T105', role: 'independent', family: 'family-home', ts: [SC_C], ask: 'Оберіть дієслово.', es: '¿___ a mi hermana?', opts: [['Conoces', 'c'], ['Sabes', 'x', 'Про знайомство з людиною кажемо conocer: ¿Conoces a mi hermana?']], rule: R.sc, ok: 'Правильно: про знайомство з людиною — conocer.', no: 'Про знайомство з людиною — conocer: ¿Conoces a mi hermana?' }),
  choice(L, { id: 'T106', role: 'independent', family: 'shop', ts: [SC_C], ask: 'Оберіть дієслово.', es: 'No ___ cuánto cuesta el billete.', opts: [['sé', 'c'], ['conozco', 'x', 'Скільки коштує — це інформація, тому saber.']], rule: R.sc, ok: 'Правильно: перед питальним словом (cuánto, dónde, qué) уживаємо saber.', no: 'Перед питальним словом (cuánto, dónde, qué) уживаємо saber: No sé cuánto cuesta.' }),
  choice(L, { id: 'T107', role: 'delayed', family: 'travel', ts: [SC_C], ask: 'Оберіть дієслово.', es: '___ Barcelona muy bien: vivo allí.', opts: [['Conozco', 'c'], ['Sé', 'x', 'Про місто, яке ви знаєте з досвіду, кажемо conocer.']], rule: R.sc, ok: 'Правильно: місто, яке знаємо з досвіду, — conocer.', no: 'Про місто, яке знаємо з досвіду, кажемо conocer: Conozco Barcelona.' }),
  choice(L, { id: 'T108', role: 'transfer', family: 'messages', ts: [SC_C], ask: 'Оберіть дієслово.', es: '¡Hola, Ana! ¿___ a qué hora sale el tren?', opts: [['sabes', 'c'], ['conoces', 'x', 'Перед питанням «о котрій» уживаємо saber.']], rule: R.sc, ok: 'Правильно: перед непрямим питанням — saber.', no: 'Перед непрямим питанням (a qué hora…) — saber: ¿Sabes a qué hora sale el tren?' }),
  choice(L, { id: 'T109', role: 'independent', family: 'work-study', ts: [SC_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Conozco a la profesora de mi hijo.', opts: [['Я знайомий (знайома) з учителькою свого сина.', 'c'], ['Я знаю, де працює вчителька мого сина.', 'x', 'Про місце роботи було б Sé dónde trabaja…'], ['Я шукаю вчительку свого сина.', 'x', 'У реченні дієслово conocer — «бути знайомим».']], rule: R.sc, ok: 'Правильно: conocer a + людина — бути з нею знайомим.', no: 'Conocer a + людина означає «бути знайомим з нею».' }),
  choice(L, { id: 'T110', role: 'delayed', family: 'routine', ts: [SC_R], ask: 'Прочитайте речення. Що воно означає?', es: 'Sé dónde está el banco.', opts: [['Я знаю, де банк.', 'c'], ['Я знайомий з працівниками банку.', 'x', 'Тут дієслово saber і питання dónde — це знання факту.'], ['Я часто буваю в цьому банку.', 'x', 'Тут ідеться лише про те, що людина знає, де банк.']], rule: R.sc, ok: 'Правильно: saber + dónde — знати, де щось є.', no: 'Saber + dónde означає «знати, де щось є»: Я знаю, де банк.' }),
];

const PERSONS = ['yo', 'tú', 'él / ella / usted', 'nosotros / nosotras', 'vosotros / vosotras', 'ellos / ellas / ustedes'];
const paradigm = (cols, forms) => TABLE_ES(['persona', ...cols], PERSONS.map((p, i) => [p, ...forms.map((f) => f[i])]));
const T_YO = TABLE_ES(['infinitivo', 'yo', 'tú'], [
  ['poner', 'pongo', 'pones'], ['salir', 'salgo', 'sales'], ['traer', 'traigo', 'traes'], ['hacer', 'hago', 'haces'],
  ['conocer', 'conozco', 'conoces'], ['conducir', 'conduzco', 'conduces'], ['traducir', 'traduzco', 'traduces'],
  ['coger', 'cojo', 'coges'], ['recoger', 'recojo', 'recoges'], ['escoger', 'escojo', 'escoges'],
]);
const T_VD = paradigm(['tener', 'venir', 'decir'], [
  ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
  ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
  ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
]);
const T_SDV = paradigm(['saber', 'dar', 'ver'], [
  ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
  ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
  ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Інші неправильні форми теперішнього часу',
  termEs: 'presente: verbos irregulares y cambios ortográficos',
  summaryUk:
    'Форма yo на -go і -zco (pongo, conozco), дієслова venir, decir, saber, dar, ver, написання cojo, пара sé / se, вибір між saber і conocer та особове a перед людиною.',
  objectives: ['A2-01-O2'],
  cv: ['CV-03'],
  situations: ['routine-study-leisure', 'people-family-home', 'time-appointments-transport', 'food-shopping'],
  estimatedMinutes: 20,
  introduces: ['present.yo-g', 'present.venir', 'present.decir', 'present.yo-zco', 'present.saber', 'ortho.accent-pair.se', 'present.dar', 'present.ver', 'present.yo-spelling-g-j', 'contrast.saber-conocer', 'prep.a.personal'],
  revisits: ['present.hacer', 'present.tener', 'present.ir', 'present.regular-ar', 'present.regular-er', 'present.regular-ir', 'present.stem-e-ie', 'present.stem-e-i', 'reflexive.pronouns', 'article.contraction-al'],
  steps: [
    s('s1', 'explanation', 'Форма yo на -go, -zco і -jo', true, {
      blocks: [
        UK('У деяких дієсловах неправильна лише форма yo, а інші особи змінюються регулярно.'),
        UK('poner, salir, traer, hacer → pongo, salgo, traigo, hago (-go). conocer, conducir, traducir → conozco, conduzco, traduzco (-zco). coger, recoger, escoger → cojo, recojo, escojo: тут змінюється лише написання — перед -o пишемо j, щоб зберегти звук [х].'),
        T_YO,
        EX('Salgo de casa a las ocho y cojo el autobús.', 'Я виходжу з дому о восьмій і сідаю на автобус.'),
        EX('No conozco Valencia.', 'Я не знаю Валенсії.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Форма yo за зразком', true, { tasks: ['T01', 'T02', 'T11', 'T12', 'T81', 'T82'] }),
    s('s3', 'explanation', 'venir і decir', true, {
      blocks: [
        UK('Venir і decir поєднують два явища: форму yo на -go і чергування під наголосом. Venir змінюється, як tener (e → ie), decir — e → i. У nosotros і vosotros основа не змінюється.'),
        T_VD,
        UK('Venir — «приходити, приїжджати (сюди)». Decir — «казати, говорити (щось)».'),
        EX('Mis padres vienen el domingo.', 'Мої батьки приїжджають у неділю.'),
        EX('¿Qué dices? No entiendo.', 'Що ти кажеш? Я не розумію.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. venir і decir за зразком', true, { tasks: ['T21', 'T22', 'T31', 'T32'] }),
    s('s5', 'explanation', 'saber, dar, ver і пара sé / se', true, {
      blocks: [
        UK('Saber неправильне лише у формі yo: sé. Dar має форму yo doy (як voy), ver — veo. Інші форми цих дієслів регулярні.'),
        T_SDV,
        UK('Односкладові форми da, das, dais, ve, veis пишемо без знака наголосу. А sé пишемо зі знаком, щоб відрізнити від займенника se: No sé. — Ana se levanta temprano.'),
        EX('No sé dónde está la farmacia.', 'Я не знаю, де аптека.'),
        EX('Mi madre da clases de inglés.', 'Моя мама викладає англійську.'),
        EX('Los domingos veo películas en casa.', 'По неділях я дивлюся фільми вдома.'),
      ],
    }),
    s('s6', 'supported-practice', 'Крок 3. saber, dar, ver, sé / se за зразком', true, { tasks: ['T41', 'T42', 'T51', 'T61', 'T62', 'T71', 'T72'] }),
    s('s7', 'explanation', 'saber чи conocer; особове a', true, {
      blocks: [
        UK('Обидва дієслова перекладаємо «знати». Saber — знати факт, інформацію: Sé dónde vive Ana. Sé su número. Conocer — бути знайомим з людиною, містом чи річчю: Conozco a Ana. Conozco Madrid.'),
        UK('Якщо прямий додаток — конкретна людина, перед ним ставимо a: Conozco a Ana. Veo a mis padres. A + el = al: Veo al profesor. Перед предметами й містами a не потрібне: Veo el parque. Після tener a зазвичай не ставимо: Tengo dos hermanos.'),
        EX('Conozco a la profesora de mi hijo.', 'Я знайомий з учителькою свого сина.'),
        EX('No sé a qué hora sale el tren.', 'Я не знаю, о котрій відправляється потяг.'),
      ],
    }),
    s('s8', 'supported-practice', 'Крок 4. saber чи conocer; a перед людиною', true, { tasks: ['T104', 'T91', 'T92'] }),
    s('s9', 'independent-practice', 'Самостійно: усі форми разом', true, { tasks: ['T03', 'T23', 'T43', 'T73', 'T93', 'T105'] }),
    s('s10', 'independent-practice', 'Додаткова практика', false, {
      tasks: ['T04', 'T05', 'T06', 'T13', 'T14', 'T15', 'T16', 'T24', 'T25', 'T26', 'T33', 'T34', 'T35', 'T36', 'T44', 'T45', 'T46', 'T52', 'T53', 'T56', 'T63', 'T64', 'T65', 'T66', 'T74', 'T75', 'T76', 'T83', 'T84', 'T85', 'T86', 'T94', 'T95', 'T96', 'T101', 'T106', 'T109'],
    }),
    s('s11', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          '-go у формі yo: pongo, salgo, traigo, hago; також vengo, digo.',
          '-zco у формі yo: conozco, conduzco, traduzco. Написання -jo: cojo, recojo, escojo.',
          'venir (vienes, viene) і decir (dices, dice): чергування під наголосом, без змін у nosotros і vosotros.',
          'saber: sé — зі знаком наголосу (se без знака — займенник); dar: doy; ver: veo; dais і veis — без знака.',
          'saber — знати факт; conocer — бути знайомим. Перед людиною у ролі прямого додатка — a (al).',
        ]),
        LINK('Потренувати неправильні форми', [YOG, ZCO, GJ, VEN, DEC, SAB, DAR, VER, SE], 'written', 12),
        LINK('Потренувати saber / conocer і особове a', [SC_C, PA, PA_C], 'written', 8),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-01.irregular-present',
    topicId: L,
    titleUk: 'Таблиця: інші неправильні форми теперішнього часу',
    blocks: [
      UK('Форма yo: -go, -zco, -jo (інші особи регулярні).'),
      T_YO,
      T_VD,
      T_SDV,
      UK('Sé (saber) — зі знаком наголосу; se (займенник) — без знака. Saber — знати факт; conocer — бути знайомим з людиною чи місцем. Перед людиною у ролі прямого додатка — a: Conozco a Ana.'),
      LINK('Практика: неправильні форми', [YOG, ZCO, GJ, VEN, DEC, SAB, DAR, VER, SE], 'written', 12),
    ],
    linkedTargets: [YOG, ZCO, GJ, VEN, DEC, SAB, DAR, VER, SE, SC_C, PA],
  }),
];
