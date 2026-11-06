// A2-07-L5 — affirmative instructions for usted/ustedes (O5): regular, yo-g, stem change,
// spelling changes, ir; addressee recognition and register with instructions.
import { ex, table, ul, uk } from './lib.mjs';
import { kit } from './kit.mjs';

const L = 'A2-07-L5';
const UR = 'imperative.usted.regular/written-form';
const UG = 'imperative.usted.yo-g/written-form';
const US = 'imperative.usted.stem-change/written-form';
const SP = 'imperative.usted.spelling/written-form';
const UI = 'imperative.usted.ir/written-form';
const AD = 'imperative.addressee/reading-meaning';
const RG = 'contrast.tu-usted-register/context-choice';

const unres = 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.';
const D = {
  [UR]: {
    rule: 'Для usted і ustedes голосна закінчення «міняється»: дієслова на -ar отримують -e / -en (hablar → hable, hablen), на -er та -ir — -a / -an (comer → coma, coman; escribir → escriba, escriban).',
    ok: 'Правильно! Це форма для usted / ustedes.',
    bad: 'Ще ні. Для usted: -ar → -e, -er / -ir → -a; для ustedes додаємо -n.',
    unres,
  },
  [UG]: {
    rule: 'Якщо форма yo теперішнього часу закінчується на -go, наказ для usted будуємо від неї: відкидаємо -o і додаємо -a (для ustedes — -an): tengo → tenga, pongo → ponga, digo → diga.',
    ok: 'Правильно! Форму утворено від yo на -go.',
    bad: 'Ще ні. Візьміть форму yo (tengo, pongo, digo…), відкиньте -o і додайте -a.',
    unres,
  },
  [US]: {
    rule: 'Дієслова з чергуванням у корені утворюють наказ для usted від форми yo: cierro → cierre, vuelvo → vuelva, sigo → siga, pido → pida.',
    ok: 'Правильно! Чергування з форми yo збережено.',
    bad: 'Ще ні. Візьміть форму yo (cierro, vuelvo, pido…) і змініть закінчення: cierre, vuelva, pida.',
    unres,
  },
  [SP]: {
    rule: 'Щоб зберегти звук, перед e змінюється буква: buscar → busque (c → qu), llegar → llegue, pagar → pague (g → gu), cruzar → cruce (z → c) — як у busqué, llegué, crucé. Coger → coja (від yo cojo).',
    ok: 'Правильно! Букву змінено, щоб зберегти звук.',
    bad: 'Ще ні. Перевірте букву перед закінченням: qu, gu, c чи j.',
    unres,
  },
  [UI]: {
    rule: 'Ir має для usted та ustedes окремі форми: vaya, vayan. Їх треба запам’ятати.',
    ok: 'Правильно! Від ir: vaya, vayan.',
    bad: 'Ще ні. Від ir для usted — vaya, для ustedes — vayan.',
    unres,
  },
  [AD]: {
    rule: 'Habla — tú; hablad — vosotros; hable — usted; hablen — ustedes. У дієсловах на -er / -ir: come — tú, coma — usted, coman — ustedes.',
    ok: 'Правильно! Ви визначили адресата за формою.',
    bad: 'Ні. Подивіться на закінчення: -e / -a — usted, -en / -an — ustedes, -d — vosotros.',
  },
  [RG]: {
    rule: 'Usted — до незнайомих старших людей і в офіційних ситуаціях; tú — до родини, друзів, дітей.',
    ok: 'Так, у цій ситуації це звертання доречне.',
    bad: 'Ні, у цій ситуації доречніше інше звертання.',
  },
};

const k = kit(L, D);
const ONE = 'Утворіть наказ для usted. Напишіть лише пропущене слово.';
const ONEP = 'Утворіть наказ для ustedes (кілька людей). Напишіть лише пропущене слово.';
const TO_USTED = 'Перетворіть інструкцію для tú на інструкцію для usted.';
const gap = (n, role, fam, key, es, acc, err, tr, plural = false) => k.ev(n, role, fam, key, { instr: plural ? ONEP : ONE, es, acc: [acc], closed: true, err, tr });

const tasks = [
  // ---- imperative.usted.regular ----
  k.ch(1, 'supported', 'fam.office', UR, {
    instr: 'У приймальні вам кажуть почекати. Оберіть наказ для usted.',
    pre: uk('Нагадування: -ar → -e для usted (esperar → espere), -en для ustedes.'),
    es: '___ un momento, por favor.',
    opts: [
      ['Espere', 'c'],
      ['Espera', 'x', 'Espera — наказ для tú. Для usted у дієсловах на -ar: espere.'],
      ['Esperen', 'x', 'Esperen — до кількох людей (ustedes). До однієї людини: espere.'],
    ],
    tr: 'Зачекайте хвилинку, будь ласка.',
  }),
  k.ev(2, 'supported', 'fam.office', UR, {
    instr: `Утворіть наказ для usted за зразком. Напишіть лише пропущене слово.`,
    model: ['Firme aquí. (firmar → firme)', 'Підпишіть тут.'],
    es: '___ el formulario, por favor. (rellenar)',
    acc: ['Rellene'],
    closed: true,
    err: [
      ['Rellena', 'Rellena — наказ для tú. Для usted: rellene.'],
      ['Rellenen', 'Rellenen — до кількох людей. До однієї людини: rellene.'],
    ],
    tr: 'Заповніть бланк, будь ласка.',
  }),
  gap(3, 'independent', 'fam.office', UR, '___ aquí, por favor. (firmar)', 'Firme', [
    ['Firma', 'Firma — наказ для tú. Для usted: firme.'],
    ['Firmen', 'Firmen — до кількох людей. До однієї людини: firme.'],
  ], 'Підпишіть тут, будь ласка.'),
  gap(4, 'independent', 'fam.clinic', UR, '___ su nombre en el formulario. (escribir)', 'Escriba', [
    ['Escribe', 'Escribe — наказ для tú. Для usted у дієсловах на -ir: escriba.'],
    ['Escriban', 'Escriban — до кількох людей. До однієї людини: escriba.'],
  ], 'Напишіть своє ім’я в бланку.'),
  gap(5, 'independent', 'fam.office', UR, 'Señores, ___ su turno, por favor. (esperar)', 'esperen', [
    ['espere', 'Espere — до однієї людини (usted). До кількох: esperen.'],
    ['esperan', 'Esperan — «вони чекають». Наказ для ustedes: esperen.'],
  ], 'Панове, чекайте своєї черги, будь ласка.', true),
  k.ev(6, 'independent', 'fam.clinic', UR, {
    instr: TO_USTED,
    es: 'Abre la ventana, por favor.',
    acc: ['Abra la ventana, por favor.', 'Abra la ventana.'],
    err: [
      ['Abre la ventana, por favor.', 'Abre — для tú. Для usted у дієсловах на -ir: abra.'],
      ['Abran la ventana, por favor.', 'Abran — до кількох людей. До однієї людини: abra.'],
    ],
    tr: 'Відчиніть вікно, будь ласка.',
  }),
  gap(7, 'delayed', 'fam.office', UR, '___ en la ventanilla dos. (preguntar)', 'Pregunte', [
    ['Pregunta', 'Pregunta — наказ для tú. Для usted: pregunte.'],
    ['Pregunten', 'Pregunten — до кількох людей. До однієї людини: pregunte.'],
  ], 'Запитайте у віконці номер два.'),
  gap(8, 'delayed', 'fam.clinic', UR, '___ un poco de agua, por favor. (beber)', 'Beba', [
    ['Bebe', 'Bebe — наказ для tú. Для usted у дієсловах на -er: beba.'],
    ['Beban', 'Beban — до кількох людей. До однієї людини: beba.'],
  ], 'Випийте трохи води, будь ласка.'),
  gap(9, 'transfer', 'fam.hotel', UR, 'Señora, ___ aquí el número de su habitación. (escribir)', 'escriba', [
    ['escribe', 'Escribe — наказ для tú. Для usted: escriba.'],
    ['escriban', 'Escriban — до кількох людей. До однієї людини: escriba.'],
  ], 'Пані, напишіть тут номер своєї кімнати.'),
  gap(10, 'transfer', 'fam.hotel', UR, 'Señores, ___ un momento aquí, por favor. (esperar)', 'esperen', [
    ['espere', 'Espere — до однієї людини. До кількох: esperen.'],
    ['esperad', 'Esperad — до кількох людей на «ти» (vosotros). У готелі до гостей — ustedes: esperen.'],
  ], 'Панове, зачекайте тут хвилинку, будь ласка.', true),

  // ---- imperative.usted.yo-g ----
  k.ch(11, 'supported', 'fam.office', UG, {
    instr: 'Оберіть наказ для usted від tener.',
    pre: uk('Нагадування: yo tengo → (без -o) teng- → tenga.'),
    es: '___ su DNI en la mano, por favor.',
    opts: [
      ['Tenga', 'c'],
      ['Tiene', 'x', 'Tiene — «він має». Для usted будуємо від yo tengo: tenga.'],
      ['Ten', 'x', 'Ten — наказ для tú. Для usted: tenga.'],
    ],
    tr: 'Тримайте посвідчення особи в руці, будь ласка.',
  }),
  k.ev(12, 'supported', 'fam.office', UG, {
    instr: 'Утворіть наказ для usted за зразком. Напишіть лише пропущене слово.',
    model: ['Ponga su nombre aquí. (pongo → ponga)', 'Напишіть тут своє ім’я.'],
    es: '___ su número de teléfono, por favor. (decir)',
    acc: ['Diga'],
    closed: true,
    err: [
      ['Dice', 'Dice — «він каже». Для usted будуємо від yo digo: diga.'],
      ['Di', 'Di — наказ для tú. Для usted: diga.'],
    ],
    tr: 'Скажіть свій номер телефону, будь ласка.',
  }),
  gap(13, 'independent', 'fam.office', UG, '___ el DNI encima de la mesa. (poner)', 'Ponga', [
    ['Pone', 'Pone — «він кладе». Для usted від yo pongo: ponga.'],
    ['Pon', 'Pon — наказ для tú. Для usted: ponga.'],
  ], 'Покладіть посвідчення особи на стіл.'),
  gap(14, 'independent', 'fam.clinic', UG, '___ mañana a las diez. (venir)', 'Venga', [
    ['Viene', 'Viene — «він приходить». Для usted від yo vengo: venga.'],
    ['Ven', 'Ven — наказ для tú. Для usted: venga.'],
  ], 'Приходьте завтра о десятій.'),
  gap(15, 'independent', 'fam.station', UG, '___ por la salida B. (salir)', 'Salga', [
    ['Sale', 'Sale — «він виходить». Для usted від yo salgo: salga.'],
    ['Sal', 'Sal — наказ для tú. Для usted: salga.'],
  ], 'Виходьте через вихід B.'),
  k.ev(16, 'independent', 'fam.office', UG, {
    instr: TO_USTED,
    es: 'Haz la compra hoy.',
    acc: ['Haga la compra hoy.'],
    err: [
      ['Hace la compra hoy.', 'Hace — «він робить». Для usted від yo hago: haga.'],
      ['Haz la compra hoy.', 'Haz — для tú. Для usted: haga.'],
    ],
    tr: 'Зробіть покупки сьогодні.',
  }),
  gap(17, 'delayed', 'fam.clinic', UG, 'Señora, ___ cuidado con el coche. (tener)', 'tenga', [
    ['tiene', 'Tiene — «вона має». Для usted від yo tengo: tenga.'],
    ['ten', 'Ten — наказ для tú. Для usted: tenga.'],
  ], 'Пані, обережно з машиною.'),
  gap(18, 'delayed', 'fam.office', UG, 'Señores, ___ su nombre en el formulario. (poner)', 'pongan', [
    ['ponga', 'Ponga — до однієї людини. До кількох: pongan.'],
    ['ponen', 'Ponen — «вони кладуть». Наказ для ustedes: pongan.'],
  ], 'Панове, напишіть свої імена в бланку.', true),
  gap(19, 'transfer', 'fam.hotel', UG, 'Señores, ___ a la sala tres a las once. (venir)', 'vengan', [
    ['venga', 'Venga — до однієї людини. До кількох: vengan.'],
    ['vienen', 'Vienen — «вони приходять». Наказ для ustedes: vengan.'],
  ], 'Панове, приходьте до зали номер три об одинадцятій.', true),
  gap(20, 'transfer', 'fam.hotel', UG, '___ su nombre y su apellido, por favor. (decir)', 'Diga', [
    ['Dice', 'Dice — «він каже». Для usted від yo digo: diga.'],
    ['Di', 'Di — наказ для tú. Для usted: diga.'],
  ], 'Скажіть своє ім’я та прізвище, будь ласка.'),

  // ---- imperative.usted.stem-change ----
  k.ch(21, 'supported', 'fam.office', US, {
    instr: 'Оберіть наказ для usted від cerrar.',
    pre: uk('Нагадування: yo cierro → cierre.'),
    es: '___ la puerta, por favor.',
    opts: [
      ['Cierre', 'c'],
      ['Cerre', 'x', 'Від yo cierro зберігаємо ie: cierre.'],
      ['Cierra', 'x', 'Cierra — наказ для tú. Для usted: cierre.'],
    ],
    tr: 'Зачиніть двері, будь ласка.',
  }),
  k.ev(22, 'supported', 'fam.clinic', US, {
    instr: 'Утворіть наказ для usted за зразком. Напишіть лише пропущене слово.',
    model: ['Vuelva mañana. (vuelvo → vuelva)', 'Поверніться завтра.'],
    es: '___ su nombre, por favor. (repetir)',
    acc: ['Repita'],
    closed: true,
    err: [
      ['Repite', 'Repite — наказ для tú. Для usted від yo repito: repita.'],
      ['Repeta', 'Від yo repito зберігаємо i: repita.'],
    ],
    tr: 'Повторіть своє ім’я, будь ласка.',
  }),
  gap(23, 'independent', 'fam.office', US, '___ cita en la ventanilla. (pedir)', 'Pida', [
    ['Pide', 'Pide — наказ для tú. Для usted від yo pido: pida.'],
    ['Peda', 'Від yo pido зберігаємо i: pida.'],
  ], 'Запишіться на прийом у віконці.'),
  gap(24, 'independent', 'fam.street', US, '___ hasta la plaza y allí está el museo. (seguir)', 'Siga', [
    ['Sigue', 'Sigue — наказ для tú. Для usted від yo sigo: siga.'],
    ['Sega', 'Від yo sigo зберігаємо i: siga.'],
  ], 'Ідіть далі до площі, і там буде музей.'),
  gap(25, 'independent', 'fam.clinic', US, '___ el viernes a las cinco. (volver)', 'Vuelva', [
    ['Vuelve', 'Vuelve — наказ для tú. Для usted від yo vuelvo: vuelva.'],
    ['Volva', 'Від yo vuelvo зберігаємо ue: vuelva.'],
  ], 'Приходьте знову в п’ятницю о п’ятій.'),
  k.ev(26, 'independent', 'fam.office', US, {
    instr: TO_USTED,
    es: 'Cierra la ventana, por favor.',
    acc: ['Cierre la ventana, por favor.', 'Cierre la ventana.'],
    err: [
      ['Cerre la ventana, por favor.', 'Від yo cierro зберігаємо ie: cierre.'],
      ['Cierra la ventana, por favor.', 'Cierra — для tú. Для usted: cierre.'],
    ],
    tr: 'Зачиніть вікно, будь ласка.',
  }),
  gap(27, 'delayed', 'fam.clinic', US, '___ la luz, por favor. (encender)', 'Encienda', [
    ['Enciende', 'Enciende — наказ для tú. Для usted від yo enciendo: encienda.'],
    ['Encenda', 'Від yo enciendo зберігаємо ie: encienda.'],
  ], 'Увімкніть світло, будь ласка.'),
  gap(28, 'delayed', 'fam.office', US, 'Señores, ___ la puerta, por favor. (cerrar)', 'cierren', [
    ['cierre', 'Cierre — до однієї людини. До кількох: cierren.'],
    ['cierran', 'Cierran — «вони зачиняють». Наказ для ustedes: cierren.'],
  ], 'Панове, зачиніть двері, будь ласка.', true),
  gap(29, 'transfer', 'fam.station', US, 'Señores, ___ hasta la salida B. (seguir)', 'sigan', [
    ['siga', 'Siga — до однієї людини. До кількох: sigan.'],
    ['siguen', 'Siguen — «вони йдуть далі». Наказ для ustedes: sigan.'],
  ], 'Панове, ідіть далі до виходу B.', true),
  gap(30, 'transfer', 'fam.hotel', US, '___ la cena antes de las once. (pedir)', 'Pida', [
    ['Pide', 'Pide — наказ для tú. Для usted: pida.'],
    ['Peda', 'Від yo pido зберігаємо i: pida.'],
  ], 'Замовте вечерю до одинадцятої.'),

  // ---- imperative.usted.spelling ----
  k.ch(31, 'supported', 'fam.office', SP, {
    instr: 'Оберіть правильно написаний наказ для usted від buscar.',
    pre: uk('Нагадування: як у busqué, перед e пишемо qu: busque.'),
    es: '___ su nombre en el formulario.',
    opts: [
      ['Busque', 'c'],
      ['Busce', 'x', 'Перед e буква c звучала б інакше, тому, щоб зберегти звук [к], пишемо qu: busque.'],
      ['Busca', 'x', 'Busca — наказ для tú. Для usted: busque.'],
    ],
    tr: 'Знайдіть своє ім’я в бланку.',
  }),
  k.ev(32, 'supported', 'fam.station', SP, {
    instr: 'Утворіть наказ для usted за зразком. Напишіть лише пропущене слово.',
    model: ['Pague en la ventanilla. (pagar → pague)', 'Заплатіть у віконці.'],
    es: '___ diez minutos antes, por favor. (llegar)',
    acc: ['Llegue'],
    closed: true,
    err: [
      ['Llege', 'Перед e буква g звучала б як [х], тому, щоб зберегти звук [ґ], пишемо gu: llegue.'],
      ['Llega', 'Llega — наказ для tú. Для usted: llegue.'],
    ],
    tr: 'Прийдіть на десять хвилин раніше, будь ласка.',
  }),
  gap(33, 'independent', 'fam.street', SP, '___ la calle aquí. (cruzar)', 'Cruce', [
    ['Cruze', 'Перед e пишемо c, а не z: cruce.'],
    ['Cruza', 'Cruza — наказ для tú. Для usted: cruce.'],
  ], 'Перейдіть вулицю тут.'),
  gap(34, 'independent', 'fam.station', SP, '___ el autobús número cinco. (coger)', 'Coja', [
    ['Coga', 'Форму будуємо від yo cojo, тому з j: coja.'],
    ['Coge', 'Coge — наказ для tú. Для usted: coja.'],
    ['Coje', 'Для usted у дієсловах на -er закінчення -a: coja.'],
  ], 'Сідайте на автобус номер п’ять.'),
  gap(35, 'independent', 'fam.office', SP, '___ en la ventanilla dos, por favor. (pagar)', 'Pague', [
    ['Page', 'Перед e буква g звучала б як [х], тому пишемо gu: pague.'],
    ['Paga', 'Paga — наказ для tú. Для usted: pague.'],
  ], 'Заплатіть у віконці номер два, будь ласка.'),
  k.ev(36, 'independent', 'fam.street', SP, {
    instr: TO_USTED,
    es: 'Busca la farmacia en la plaza.',
    acc: ['Busque la farmacia en la plaza.'],
    err: [
      ['Busce la farmacia en la plaza.', 'Перед e пишемо qu, щоб зберегти звук [к]: busque.'],
      ['Busca la farmacia en la plaza.', 'Busca — для tú. Для usted: busque.'],
    ],
    tr: 'Пошукайте аптеку на площі.',
  }),
  gap(37, 'delayed', 'fam.street', SP, '___ la plaza y gire a la derecha. (cruzar)', 'Cruce', [
    ['Cruze', 'Перед e пишемо c, а не z: cruce.'],
    ['Cruza', 'Cruza — наказ для tú. Для usted: cruce.'],
  ], 'Перейдіть площу й поверніть праворуч.'),
  gap(38, 'delayed', 'fam.office', SP, '___ el número y espere su turno. (coger)', 'Coja', [
    ['Coga', 'Форму будуємо від yo cojo, тому з j: coja.'],
    ['Coge', 'Coge — наказ для tú. Для usted: coja.'],
  ], 'Візьміть номерок і чекайте своєї черги.'),
  gap(39, 'transfer', 'fam.trip', SP, 'Señores, ___ el tren de las ocho. (coger)', 'cojan', [
    ['coja', 'Coja — до однієї людини. До кількох: cojan.'],
    ['cogan', 'Форму будуємо від yo cojo, тому з j: cojan.'],
    ['cogen', 'Cogen — «вони беруть». Наказ для ustedes: cojan.'],
  ], 'Панове, сідайте на потяг о восьмій.', true),
  gap(40, 'transfer', 'fam.trip', SP, 'Señores, ___ a la estación a las siete. (llegar)', 'lleguen', [
    ['llegue', 'Llegue — до однієї людини. До кількох: lleguen.'],
    ['llegen', 'Перед e пишемо gu, щоб зберегти звук [ґ]: lleguen.'],
    ['llegan', 'Llegan — «вони приходять». Наказ для ustedes: lleguen.'],
  ], 'Панове, прийдіть на вокзал о сьомій.', true),

  // ---- imperative.usted.ir ----
  k.ch(41, 'supported', 'fam.office', UI, {
    instr: 'Оберіть наказ для usted від ir.',
    pre: uk('Нагадування: ir → vaya (usted), vayan (ustedes).'),
    es: '___ a la ventanilla dos, por favor.',
    opts: [
      ['Vaya', 'c'],
      ['Va', 'x', 'Va — «він іде». Для usted від ir: vaya.'],
      ['Ve', 'x', 'Ve — наказ для tú. Для usted: vaya.'],
    ],
    tr: 'Підійдіть до віконця номер два, будь ласка.',
  }),
  k.ev(42, 'supported', 'fam.clinic', UI, {
    instr: 'Утворіть наказ для usted за зразком. Напишіть лише пропущене слово.',
    model: ['Vaya a la farmacia. (ir → vaya)', 'Сходіть в аптеку.'],
    es: '___ a la sala dos, por favor. (ir)',
    acc: ['Vaya'],
    closed: true,
    err: [
      ['Va', 'Va — «він іде». Для usted: vaya.'],
      ['Ve', 'Ve — наказ для tú. Для usted: vaya.'],
    ],
    tr: 'Пройдіть до зали номер два, будь ласка.',
  }),
  gap(43, 'independent', 'fam.office', UI, '___ al segundo piso. (ir)', 'Vaya', [
    ['Va', 'Va — «він іде». Для usted: vaya.'],
    ['Ve', 'Ve — наказ для tú. Для usted: vaya.'],
  ], 'Підніміться на другий поверх (piso тут — «поверх»).'),
  gap(44, 'independent', 'fam.clinic', UI, 'Señores, ___ a la sala tres. (ir)', 'vayan', [
    ['vaya', 'Vaya — до однієї людини. До кількох: vayan.'],
    ['van', 'Van — «вони йдуть». Наказ для ustedes: vayan.'],
  ], 'Панове, пройдіть до зали номер три.', true),
  gap(45, 'independent', 'fam.street', UI, '___ a la farmacia de la plaza. (ir)', 'Vaya', [
    ['Va', 'Va — «він іде». Для usted: vaya.'],
    ['Ve', 'Ve — наказ для tú. Для usted: vaya.'],
  ], 'Сходіть в аптеку на площі.'),
  k.ev(46, 'independent', 'fam.street', UI, {
    instr: TO_USTED,
    es: 'Ve al banco, está cerca.',
    acc: ['Vaya al banco, está cerca.'],
    err: [
      ['Va al banco, está cerca.', 'Va — «він іде». Для usted: vaya.'],
      ['Ve al banco, está cerca.', 'Ve — для tú. Для usted: vaya.'],
    ],
    tr: 'Сходіть у банк, він близько.',
  }),
  gap(47, 'delayed', 'fam.office', UI, '___ a la ventanilla cuatro y pague allí. (ir)', 'Vaya', [
    ['Va', 'Va — «він іде». Для usted: vaya.'],
    ['Ve', 'Ve — наказ для tú. Для usted: vaya.'],
  ], 'Підійдіть до віконця номер чотири й заплатіть там.'),
  gap(48, 'delayed', 'fam.clinic', UI, 'Señores, ___ a la sala cinco, por favor. (ir)', 'vayan', [
    ['vaya', 'Vaya — до однієї людини. До кількох: vayan.'],
    ['van', 'Van — «вони йдуть». Наказ для ustedes: vayan.'],
  ], 'Панове, пройдіть до зали номер п’ять, будь ласка.', true),
  gap(49, 'transfer', 'fam.station', UI, 'Señores, ___ a la salida B. (ir)', 'vayan', [
    ['vaya', 'Vaya — до однієї людини. До кількох: vayan.'],
    ['van', 'Van — «вони йдуть». Наказ для ustedes: vayan.'],
  ], 'Панове, пройдіть до виходу B.', true),
  gap(50, 'transfer', 'fam.station', UI, '___ a la estación de autobuses. (ir)', 'Vaya', [
    ['Va', 'Va — «він іде». Для usted: vaya.'],
    ['Ve', 'Ve — наказ для tú. Для usted: vaya.'],
  ], 'Ідіть на автовокзал.'),

  // ---- addressee (now with usted / ustedes) ----
  k.ch(51, 'supported', 'fam.clinic', AD, {
    instr: 'Прочитайте інструкцію. Кому вона адресована?',
    pre: uk('Нагадування: -e / -a — usted, -en / -an — ustedes, -d — vosotros.'),
    es: 'Rellene el formulario, por favor.',
    opts: [
      ['одній людині на usted', 'c'],
      ['одній людині на «ти»', 'x', 'Для tú було б rellena. Закінчення -e в дієслові на -ar — usted.'],
      ['кільком людям', 'x', 'Для кількох людей було б rellenen (ustedes) або rellenad (vosotros).'],
    ],
  }),
  k.ch(52, 'independent', 'fam.clinic', AD, {
    instr: 'Прочитайте інструкцію. Кому вона адресована?',
    es: 'Escriban su nombre aquí.',
    opts: [
      ['кільком людям на usted (ustedes)', 'c'],
      ['одній людині на usted', 'x', 'Закінчення -an показує ustedes. Одній людині: escriba.'],
      ['одній людині на «ти»', 'x', 'Для tú було б escribe.'],
    ],
  }),
  k.ch(53, 'delayed', 'fam.clinic', AD, {
    instr: 'Прочитайте інструкцію. Кому вона адресована?',
    es: 'Señora, cierre la ventana, por favor.',
    opts: [
      ['одній людині на usted', 'c'],
      ['одній людині на «ти»', 'x', 'Для tú було б cierra.'],
      ['кільком людям на «ти» (vosotros)', 'x', 'Для vosotros було б cerrad.'],
    ],
  }),
  k.ch(54, 'transfer', 'fam.station', AD, {
    instr: 'Прочитайте оголошення. Кому воно адресоване?',
    es: 'Esperen aquí, por favor.',
    opts: [
      ['кільком людям на usted (ustedes)', 'c'],
      ['одній людині на usted', 'x', 'Закінчення -en показує ustedes. Одній людині: espere.'],
      ['кільком людям на «ти» (vosotros)', 'x', 'Для vosotros було б esperad.'],
    ],
  }),

  // ---- register with instructions ----
  k.ch(55, 'independent', 'fam.clinic', RG, {
    instr: 'У поліклініці медсестра звертається до незнайомого літнього пацієнта. Яка інструкція доречна?',
    opts: [
      ['Espere aquí, por favor.', 'c'],
      ['Espera aquí, por favor.', 'x', 'До незнайомого літнього пацієнта доречне usted: espere.'],
    ],
  }),
  k.ch(56, 'delayed', 'fam.home', RG, {
    instr: 'Мама звертається до свого сина. Яка інструкція доречна?',
    opts: [
      ['Espera aquí.', 'c'],
      ['Espere aquí.', 'x', 'До сина звертаються на tú: espera.'],
    ],
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-07',
  titleUk: 'Інструкції для usted і ustedes',
  termEs: 'imperativo afirmativo: usted y ustedes',
  summaryUk: 'Як дати ввічливу інструкцію незнайомій людині чи кільком людям в установі: hable, coma, escriba; diga, ponga, tenga; cierre, vuelva, pida; busque, llegue, cruce, coja; vaya.',
  objectives: ['A2-07-O5'],
  situations: ['time-appointments-transport', 'places-accommodation', 'instructions-notices'],
  estimatedMinutes: 18,
  introduces: ['imperative.usted.regular', 'imperative.usted.yo-g', 'imperative.usted.stem-change', 'imperative.usted.spelling', 'imperative.usted.ir'],
  revisits: ['imperative.tu.regular', 'imperative.addressee', 'contrast.tu-usted-register', 'present.yo-g', 'present.decir', 'present.venir', 'present.stem-e-ie', 'present.stem-o-ue', 'present.stem-e-i', 'present.yo-spelling-g-j', 'indefinido.spelling-car', 'indefinido.spelling-gar', 'indefinido.spelling-zar', 'present.ir'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Usted і ustedes: голосна «міняється»',
      required: true,
      blocks: [
        uk('Для usted (одна людина) і ustedes (кілька людей) голосна закінчення «міняється»: дієслова на -ar отримують -e / -en, дієслова на -er та -ir — -a / -an. Ці форми вживаємо в ствердних інструкціях: в установі, у лікаря, в оголошеннях.'),
        table(
          ['infinitivo', 'usted', 'ustedes'],
          [
            ['esperar', 'espere', 'esperen'],
            ['firmar', 'firme', 'firmen'],
            ['rellenar', 'rellene', 'rellenen'],
            ['beber', 'beba', 'beban'],
            ['leer', 'lea', 'lean'],
            ['escribir', 'escriba', 'escriban'],
            ['abrir', 'abra', 'abran'],
          ],
        ),
        uk('Usted поєднується з 3-ю особою, тому поруч часто стоїть su: Escriba su nombre — «Напишіть своє ім’я».'),
        ex('Espere su turno, por favor.', 'Чекайте своєї черги, будь ласка.'),
        ex('Rellene el formulario y firme aquí.', 'Заповніть бланк і підпишіть тут.'),
        ex('Escriban su nombre en la ventanilla.', 'Напишіть свої імена біля віконця (до кількох).'),
      ],
    },
    {
      id: 's2',
      kind: 'explanation',
      titleUk: 'Від форми yo: diga, haga, ponga, tenga',
      required: true,
      blocks: [
        uk('Якщо форма yo теперішнього часу закінчується на -go, наказ для usted будуємо від неї: відкидаємо -o і додаємо -a (для ustedes — -an).'),
        table(
          ['yo (presente)', 'usted', 'ustedes'],
          [
            ['digo', 'diga', 'digan'],
            ['hago', 'haga', 'hagan'],
            ['pongo', 'ponga', 'pongan'],
            ['salgo', 'salga', 'salgan'],
            ['tengo', 'tenga', 'tengan'],
            ['vengo', 'venga', 'vengan'],
          ],
        ),
        ex('Diga su nombre, por favor.', 'Скажіть своє ім’я, будь ласка.'),
        ex('Ponga su DNI aquí.', 'Покладіть сюди своє посвідчення особи.'),
        ex('Tenga cuidado.', 'Будьте обережні.'),
        ex('Venga mañana a las diez.', 'Приходьте завтра о десятій.'),
      ],
    },
    {
      id: 's3',
      kind: 'explanation',
      titleUk: 'Чергування: cierre, vuelva, siga, pida',
      required: true,
      blocks: [
        uk('Дієслова з чергуванням у корені теж утворюють наказ для usted від форми yo: cierro → cierre, vuelvo → vuelva, sigo → siga, pido → pida.'),
        table(
          ['yo (presente)', 'usted', 'ustedes'],
          [
            ['cierro', 'cierre', 'cierren'],
            ['enciendo', 'encienda', 'enciendan'],
            ['vuelvo', 'vuelva', 'vuelvan'],
            ['sigo', 'siga', 'sigan'],
            ['pido', 'pida', 'pidan'],
            ['repito', 'repita', 'repitan'],
          ],
        ),
        ex('Cierre la puerta, por favor.', 'Зачиніть двері, будь ласка.'),
        ex('Vuelva mañana.', 'Приходьте знову завтра.'),
        ex('Pida cita en la ventanilla.', 'Запишіться на прийом у віконці.'),
      ],
    },
    {
      id: 's4',
      kind: 'explanation',
      titleUk: 'Зміни букви та ir: busque, llegue, cruce, coja, vaya',
      required: true,
      blocks: [
        uk('Щоб зберегти звук, перед e змінюється буква — так само, як у busqué, llegué, crucé: c → qu (buscar → busque), g → gu (llegar → llegue, pagar → pague), z → c (cruzar → cruce). Coger утворює coja від форми yo cojo.'),
        table(
          ['infinitivo', 'usted', 'ustedes'],
          [
            ['buscar', 'busque', 'busquen'],
            ['llegar', 'llegue', 'lleguen'],
            ['pagar', 'pague', 'paguen'],
            ['cruzar', 'cruce', 'crucen'],
            ['coger', 'coja', 'cojan'],
            ['ir', 'vaya', 'vayan'],
          ],
        ),
        uk('Ir має окремі форми vaya, vayan — їх треба запам’ятати. Помилка в букві (busce, llege) — це помилка правопису, а не вибору звертання.'),
        ex('Pague en la ventanilla.', 'Заплатіть у віконці.'),
        ex('Cruce la calle aquí.', 'Перейдіть вулицю тут.'),
        ex('Coja el número y espere su turno.', 'Візьміть номерок і чекайте своєї черги.'),
        ex('Vaya a la ventanilla dos.', 'Підійдіть до віконця номер два.'),
        uk('Як і в проханнях, звертання обираємо за ситуацією: в установі й до незнайомих старших людей — usted; до друзів і родини — tú. Часто доречні обидва.'),
      ],
    },
    { id: 's5', kind: 'supported-practice', titleUk: 'Практика зі зразком', required: true, taskIds: [1, 2, 11, 12, 21, 22, 31, 32, 41, 42, 51].map(T) },
    { id: 's6', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: [3, 13, 23, 33, 43, 52, 55].map(T) },
    { id: 's7', kind: 'independent-practice', titleUk: 'Ще вправи (за бажанням)', required: false, taskIds: [4, 5, 14, 15, 24, 25, 34, 35, 44, 45].map(T) },
    { id: 's8', kind: 'independent-practice', titleUk: 'Від tú до usted (за бажанням)', required: false, taskIds: [6, 16, 26, 36, 46].map(T) },
    {
      id: 's9',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Usted / ustedes: -ar → -e / -en; -er, -ir → -a / -an.',
          'Від yo на -go: diga, haga, ponga, salga, tenga, venga.',
          'Чергування від форми yo: cierre, vuelva, siga, pida.',
          'Букви: busque, llegue, pague, cruce, coja. Ir: vaya, vayan.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
