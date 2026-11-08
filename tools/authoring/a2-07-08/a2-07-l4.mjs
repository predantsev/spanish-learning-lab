// A2-07-L4 — frequent irregular tú instructions (O4): di, haz, pon, sal, ten, ven, ve.
// Each irregular keeps its own evidence: 7 tasks per form here (1 supported, 3 independent,
// 2 delayed, 1 transfer) plus a return in A2-07-C1 (bankJustificationUk on each skill).
import { ex, table, ul, uk } from './lib.mjs';
import { kit, withPF } from './kit.mjs';

const L = 'A2-07-L4';
const ONE = 'Утворіть наказ для tú. Напишіть лише пропущене слово.';

const VERBS = [
  {
    skill: 'imperative.tu.decir',
    inf: 'decir',
    form: 'di',
    rule: 'Decir має в наказі для tú коротку форму di (без знака наголосу). Для vosotros форма правильна: decid.',
    errs: [
      ['dice', 'Dice — «він каже». Наказ для tú від decir має коротку форму: di.'],
      ['dices', 'Dices — «ти кажеш». Наказ для tú: di.'],
      ['decid', 'Decid — до кількох людей (vosotros). До однієї: di.'],
      ['dí', 'Di пишеться без знака наголосу.'],
    ],
    S: ['___ tu nombre, por favor.', 'Скажи своє ім’я, будь ласка.'],
    I: [['___ a Ana que la cena es a las nueve.', 'Скажи Ані, що вечеря о дев’ятій.', 'fam.home', [{ text: 'dile', noteUk: 'Dile = di + le (їй): займенник le тут дублює a Ana, це теж природно.' }]], ['___ algo en español.', 'Скажи щось іспанською.', 'fam.class']],
    X: ['¿Puedes decir tu nombre otra vez?', 'Di tu nombre otra vez.', 'Скажи своє ім’я ще раз.', 'fam.class'],
    Dl: [['___ a tus padres que vamos a llegar tarde.', 'Скажи батькам, що ми запізнимося.', 'fam.home', [{ text: 'diles', noteUk: 'Diles = di + les (їм): займенник les тут дублює a tus padres, це теж природно.' }]], ['___ «gracias» a la profesora.', 'Скажи «дякую» вчительці.', 'fam.class', [{ text: 'dile', noteUk: 'Dile = di + le (їй): займенник le тут дублює a la profesora, це теж природно.' }]]],
    T: ['Por teléfono: ___ tu nombre y tu dirección.', 'Телефоном: скажи своє ім’я та адресу.', 'fam.phone'],
  },
  {
    skill: 'imperative.tu.hacer',
    inf: 'hacer',
    form: 'haz',
    rule: 'Hacer має в наказі для tú коротку форму haz (із z). Для vosotros форма правильна: haced.',
    errs: [
      ['hace', 'Hace — «він робить». Наказ для tú від hacer має коротку форму: haz.'],
      ['haces', 'Haces — «ти робиш». Наказ для tú: haz.'],
      ['haced', 'Haced — до кількох людей (vosotros). До однієї: haz.'],
      ['has', 'Has — форма від haber (has comido). Наказ від hacer пишеться з z: haz.'],
    ],
    S: ['___ los deberes antes de cenar.', 'Зроби домашнє завдання до вечері.'],
    I: [['___ la compra hoy, por favor.', 'Зроби сьогодні покупки, будь ласка.', 'fam.home'], ['___ la tarea en casa.', 'Зроби завдання вдома.', 'fam.class']],
    X: ['¿Puedes hacer la cena?', 'Haz la cena.', 'Приготуй вечерю.', 'fam.home'],
    Dl: [['___ una foto de la casa.', 'Сфотографуй будинок.', 'fam.home'], ['___ la cena para todos esta noche.', 'Приготуй сьогодні вечерю для всіх.', 'fam.friends']],
    T: ['En la playa, ___ muchas fotos.', 'На пляжі зроби багато фото.', 'fam.trip'],
  },
  {
    skill: 'imperative.tu.poner',
    inf: 'poner',
    form: 'pon',
    rule: 'Poner має в наказі для tú коротку форму pon. Для vosotros форма правильна: poned.',
    errs: [
      ['pone', 'Pone — «він кладе». Наказ для tú від poner має коротку форму: pon.'],
      ['pones', 'Pones — «ти кладеш». Наказ для tú: pon.'],
      ['poned', 'Poned — до кількох людей (vosotros). До однієї: pon.'],
      ['pón', 'Pon пишеться без знака наголосу.'],
    ],
    S: ['___ la mesa, vamos a cenar.', 'Накрий на стіл, будемо вечеряти.'],
    I: [['___ el agua en la nevera.', 'Постав воду в холодильник.', 'fam.home'], ['___ las llaves encima de la mesa.', 'Поклади ключі на стіл.', 'fam.home']],
    X: ['¿Puedes poner el ordenador en la mesa?', 'Pon el ordenador en la mesa.', 'Постав комп’ютер на стіл.', 'fam.office'],
    Dl: [['___ la leche en la nevera, por favor.', 'Постав молоко в холодильник, будь ласка.', 'fam.home'], ['___ tu bolso aquí.', 'Поклади свою сумку сюди.', 'fam.office']],
    T: ['___ el agua y la fruta en la mochila.', 'Поклади воду й фрукти в рюкзак.', 'fam.trip'],
  },
  {
    skill: 'imperative.tu.salir',
    inf: 'salir',
    form: 'sal',
    rule: 'Salir має в наказі для tú коротку форму sal. Для vosotros форма правильна: salid.',
    errs: [
      ['sale', 'Sale — «він виходить». Наказ для tú від salir має коротку форму: sal.'],
      ['sales', 'Sales — «ти виходиш». Наказ для tú: sal.'],
      ['salid', 'Salid — до кількох людей (vosotros). До однієї: sal.'],
      ['sál', 'Sal пишеться без знака наголосу.'],
    ],
    S: ['___ de casa a las ocho.', 'Вийди з дому о восьмій.'],
    I: [['___ ahora, el autobús llega a las nueve.', 'Виходь зараз, автобус приходить о дев’ятій.', 'fam.home'], ['___ de la clase un momento, por favor.', 'Вийди на хвилинку з класу, будь ласка.', 'fam.class']],
    X: ['¿Puedes salir del coche?', 'Sal del coche.', 'Вийди з машини.', 'fam.home'],
    Dl: [['___ temprano, el tren sale a las siete.', 'Виходь рано, потяг відходить о сьомій.', 'fam.home'], ['___ con tus amigos el sábado.', 'Сходи кудись із друзями в суботу.', 'fam.friends']],
    T: ['___ de la oficina a las cinco.', 'Вийди з офісу о п’ятій.', 'fam.office'],
  },
  {
    skill: 'imperative.tu.tener',
    inf: 'tener',
    form: 'ten',
    rule: 'Tener має в наказі для tú коротку форму ten: ¡Ten cuidado! Для vosotros форма правильна: tened.',
    errs: [
      ['tiene', 'Tiene — «він має». Наказ для tú від tener має коротку форму: ten.'],
      ['tienes', 'Tienes — «ти маєш». Наказ для tú: ten.'],
      ['tened', 'Tened — до кількох людей (vosotros). До однієї: ten.'],
      ['tén', 'Ten пишеться без знака наголосу.'],
    ],
    S: ['___ cuidado con el perro.', 'Обережно з собакою.'],
    I: [['___ cuidado en la cocina.', 'Будь обережний (обережна) на кухні.', 'fam.home'], ['___ cuidado con las bicicletas.', 'Остерігайся велосипедів.', 'fam.street']],
    X: ['¿Puedes tener cuidado con la bicicleta?', 'Ten cuidado con la bicicleta.', 'Будь обережний (обережна) з велосипедом.', 'fam.home'],
    Dl: [['___ cuidado con el móvil.', 'Обережно з телефоном.', 'fam.home'], ['___ cuidado en la playa.', 'Будь обережний (обережна) на пляжі.', 'fam.street']],
    T: ['En el tren, ___ el billete en la mano.', 'У потязі тримай квиток у руці.', 'fam.trip'],
  },
  {
    skill: 'imperative.tu.venir',
    inf: 'venir',
    form: 'ven',
    rule: 'Venir має в наказі для tú коротку форму ven: ¡Ven aquí! Для vosotros форма правильна: venid.',
    errs: [
      ['viene', 'Viene — «він приходить». Наказ для tú від venir має коротку форму: ven.'],
      ['vienes', 'Vienes — «ти приходиш». Наказ для tú: ven.'],
      ['venid', 'Venid — до кількох людей (vosotros). До однієї: ven.'],
      ['ve', 'Ve — наказ від ir («іди»). «Приходь» — ven.'],
    ],
    S: ['___ aquí, por favor.', 'Іди сюди, будь ласка.'],
    I: [['___ a mi casa el sábado.', 'Приходь до мене в суботу.', 'fam.friends'], ['___ a cenar, la cena está en la mesa.', 'Іди вечеряти, вечеря на столі.', 'fam.home']],
    X: ['¿Puedes venir conmigo?', 'Ven conmigo.', 'Ходімо зі мною.', 'fam.friends'],
    Dl: [['___ al cine con nosotros.', 'Ходи з нами в кіно.', 'fam.friends'], ['___ pronto, por favor.', 'Приходь швидше, будь ласка.', 'fam.home']],
    T: ['___ a la reunión a las diez.', 'Приходь на зустріч о десятій.', 'fam.office'],
  },
  {
    skill: 'imperative.tu.ir',
    inf: 'ir',
    form: 've',
    rule: 'Ir має в наказі для tú коротку форму ve: Ve a la farmacia. Вона звучить так само, як ve від ver («він бачить»); значення видно з контексту. Для vosotros: id.',
    errs: [
      ['va', 'Va — «він іде». Наказ для tú від ir має коротку форму: ve.'],
      ['vas', 'Vas — «ти йдеш». Наказ для tú: ve.'],
      ['id', 'Id — до кількох людей (vosotros). До однієї: ve.'],
      ['ven', 'Ven — «приходь» (від venir). «Іди» — ve.'],
      ['vé', 'Ve пишеться без знака наголосу.'],
    ],
    S: ['___ a la farmacia, por favor.', 'Сходи в аптеку, будь ласка.'],
    I: [['___ al supermercado y compra leche.', 'Сходи в супермаркет і купи молока.', 'fam.home'], ['___ a la cama, es muy tarde.', 'Іди спати, уже дуже пізно.', 'fam.home']],
    X: ['¿Puedes ir al banco hoy?', 'Ve al banco hoy.', 'Сходи сьогодні в банк.', 'fam.home'],
    Dl: [['___ a casa de Ana.', 'Сходи до Ани додому.', 'fam.home'], ['___ con tu hermano al parque.', 'Іди з братом у парк.', 'fam.friends']],
    T: ['___ a la sala dos, la reunión es allí.', 'Іди в залу номер два, зустріч там.', 'fam.office'],
  },
];

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const D = {};
for (const v of VERBS) {
  D[`${v.skill}/written-form`] = {
    rule: v.rule,
    ok: `Правильно! Наказ для tú від ${v.inf}: ${v.form}.`,
    bad: `Ще ні. Наказ для tú від ${v.inf} має коротку форму: ${v.form}.`,
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.',
  };
}
const k = kit(L, D);

function bank(n0, v) {
  const key = `${v.skill}/written-form`;
  const gapErr = v.errs.map(([t, fb]) => [t, fb]);
  const gap = (n, role, fam, [esText, tr, , extra = []]) => k.ev(n, role, fam, key, { instr: ONE, es: `${esText} (${v.inf})`, acc: [v.form, ...extra], closed: true, err: gapErr, tr, ref: esText.replace('___', esText.startsWith('___') ? cap(v.form) : v.form) });
  const [q, answer, xtr, xfam] = v.X;
  const first = answer.split(' ')[0];
  const sentenceErr = v.errs.map(([t, fb]) => [answer.replace(first, cap(t)), fb]);
  return [
    k.ch(n0, 'supported', 'fam.home', key, {
      instr: `Оберіть наказ для tú від ${v.inf}.`,
      pre: uk('Нагадування: кілька частих дієслів мають у наказі для tú коротку форму: di, haz, pon, sal, ten, ven, ve.'),
      es: v.S[0],
      opts: [[v.form, 'c'], ...v.errs.slice(0, 3).map(([t, fb]) => [t, 'x', fb])],
      tr: v.S[1],
    }),
    gap(n0 + 1, 'independent', v.I[0][2], v.I[0]),
    gap(n0 + 2, 'independent', v.I[1][2], v.I[1]),
    k.ev(n0 + 3, 'independent', xfam, key, {
      instr: 'Перетворіть прохання на коротку інструкцію для tú (наказ). Por favor можна залишити.',
      es: q,
      acc: withPF(answer),
      err: sentenceErr.slice(0, 3),
      tr: xtr,
    }),
    gap(n0 + 4, 'delayed', v.Dl[0][2], v.Dl[0]),
    gap(n0 + 5, 'delayed', v.Dl[1][2], v.Dl[1]),
    gap(n0 + 6, 'transfer', v.T[2], v.T),
  ];
}

const tasks = VERBS.flatMap((v, i) => bank(i * 7 + 1, v));
const ids = (offsets) => VERBS.flatMap((_, i) => offsets.map((o) => `${L}-T${String(i * 7 + 1 + o).padStart(2, '0')}`));

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-07',
  titleUk: 'Короткі неправильні накази: di, haz, pon, sal, ten, ven, ve',
  termEs: 'imperativo irregular (tú)',
  summaryUk: 'Сім частих дієслів мають у наказі для tú коротку неправильну форму: di, haz, pon, sal, ten, ven, ve. Для vosotros вони правильні: decid, haced, poned, salid, tened, venid, id.',
  objectives: ['A2-07-O4'],
  situations: ['people-family-home', 'instructions-notices', 'routine-study-leisure'],
  estimatedMinutes: 15,
  introduces: VERBS.map((v) => v.skill),
  revisits: ['imperative.tu.regular', 'imperative.vosotros.regular', 'present.decir', 'present.venir', 'present.yo-g', 'present.ir'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Сім коротких форм для tú',
      required: true,
      blocks: [
        uk('Кілька частих дієслів мають у наказі для tú коротку неправильну форму. Її треба запам’ятати окремо для кожного дієслова. Для vosotros ці дієслова утворюють наказ за звичайним правилом: decid, haced, poned…'),
        table(
          ['infinitivo', 'tú', 'vosotros', 'ejemplo'],
          [
            ['decir', 'di', 'decid', 'Di tu nombre.'],
            ['hacer', 'haz', 'haced', 'Haz los deberes.'],
            ['poner', 'pon', 'poned', 'Pon la mesa.'],
            ['salir', 'sal', 'salid', 'Sal de casa a las ocho.'],
            ['tener', 'ten', 'tened', 'Ten cuidado.'],
            ['venir', 'ven', 'venid', 'Ven aquí.'],
            ['ir', 've', 'id', 'Ve a la farmacia.'],
          ],
        ),
        uk('Ці форми пишуться без знака наголосу: di, haz, pon, sal, ten, ven, ve. Haz — із z. Ve (від ir) звучить так само, як ve від ver («він бачить»), а sal — як іменник «сіль»: значення видно з контексту.'),
        ex('Di tu nombre, por favor.', 'Скажи своє ім’я, будь ласка.'),
        ex('Haz la compra hoy.', 'Зроби сьогодні покупки.'),
        ex('Pon la mesa, vamos a cenar.', 'Накрий на стіл, будемо вечеряти.'),
        ex('Sal de casa a las ocho.', 'Вийди з дому о восьмій.'),
        ex('Ten cuidado.', 'Будь обережний (обережна).'),
        ex('Ven aquí.', 'Іди сюди.'),
        ex('Ve a la farmacia.', 'Сходи в аптеку.'),
      ],
    },
    {
      id: 's2',
      kind: 'explanation',
      titleUk: 'Як запам’ятати',
      required: true,
      blocks: [
        uk('Підказка для запам’ятовування: у poner, salir, tener і venir наказ дорівнює формі yo без -go: pongo → pon, salgo → sal, tengo → ten, vengo → ven. У decir це теж працює: digo → di. Для hacer та ir це не діє: haz, ve — їх просто запам’ятайте.'),
        ex('Tengo cuidado. → Ten cuidado.', 'Я обережний. → Будь обережний.'),
        ex('Vengo mañana. → Ven mañana.', 'Я прийду завтра. → Приходь завтра.'),
      ],
    },
    { id: 's3', kind: 'supported-practice', titleUk: 'Оберіть форму', required: true, taskIds: ids([0]) },
    { id: 's4', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: ids([1]) },
    { id: 's5', kind: 'independent-practice', titleUk: 'Ще вправи (за бажанням)', required: false, taskIds: ids([2]) },
    { id: 's6', kind: 'independent-practice', titleUk: 'Від прохання до наказу (за бажанням)', required: false, taskIds: ids([3]) },
    {
      id: 's7',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'decir → di, hacer → haz, poner → pon, salir → sal, tener → ten, venir → ven, ir → ve.',
          'Без знака наголосу; haz — із z.',
          'Для vosotros — звичайні форми на -d: decid, haced, poned, salid, tened, venid, id.',
          'Ve (від ir) і ven (від venir) не плутайте: «іди» — ve, «приходь» — ven.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
