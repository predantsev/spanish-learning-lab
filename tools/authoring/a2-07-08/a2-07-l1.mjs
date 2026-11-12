// A2-07-L1 — requests for an object, an action or help (O1); tú/usted register.
import { ex, table, ul, uk } from './lib.mjs';
import { kit, withPF } from './kit.mjs';

const L = 'A2-07-L1';
const P = 'formula.request-puedes/construction-use';
const O = 'formula.request-object/construction-use';
const Q = 'formula.request-queria/construction-use';
const R = 'contrast.tu-usted-register/context-choice';

const D = {
  [P]: {
    rule: 'Прохання до іншої людини: poder у формі співрозмовника + інфінітив. Tú — ¿Puedes…?, usted — ¿Puede…?, vosotros — ¿Podéis…?, ustedes — ¿Pueden…? Займенник ставимо перед poder або приєднуємо до інфінітива: ¿Me puedes ayudar? = ¿Puedes ayudarme?',
    ok: 'Правильно! Це прохання з poder + інфінітив.',
    bad: 'Ще ні. Прохання будуємо так: ¿Puedes / Puede / Podéis / Pueden + інфінітив…?',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком: poder у формі співрозмовника + інфінітив.',
  },
  [O]: {
    rule: 'Річ просимо коротким питанням у теперішньому часі з me («мені»): ¿Me das…?, ¿Me pasas…?, ¿Me dejas…? Me стоїть перед дієсловом, а дієслово — у формі того, до кого звертаємося.',
    ok: 'Правильно! Коротке прохання з me звучить природно.',
    bad: 'Ще ні. Схема: ¿Me + дієслово у формі співрозмовника + річ?',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком: ¿Me + дієслово + річ?',
  },
  [Q]: {
    rule: 'Ввічливе прохання в магазині, кафе, на вокзалі чи в установі: Quería + іменник або інфінітив. Quería — форма імперфекту від querer, але стосується теперішнього бажання. Пишеться зі знаком наголосу на í.',
    ok: 'Правильно! Quería звучить ввічливо й природно.',
    bad: 'Ще ні. Почніть із ввічливого Quería + те, чого ви хочете.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком: Quería + іменник або інфінітив.',
  },
  [R]: {
    rule: 'Tú — до друзів, родини, дітей, колег; usted — до незнайомих старших людей і в офіційних ситуаціях. До кількох друзів в Іспанії — vosotros, до кількох незнайомих людей офіційно — ustedes.',
    ok: 'Так, у цій ситуації це звертання доречне.',
    bad: 'Ні, у цій ситуації доречніше інше звертання.',
  },
};

const k = kit(L, D);

// Shared reviewed error variants for quería tasks (outcome unresolved: the construction is right).
const qErr = (text) => [
  [text.replace('Quería', 'Queria'), 'Конструкцію вжито правильно, але quería пишеться зі знаком наголосу на í: quería.', { [Q]: 'unresolved' }],
  [text.replace('Quería', 'Quiero'), 'Quiero теж зрозуміло, але тут потренуйте ввічливе quería.', { [Q]: 'unresolved' }],
];

const tasks = [
  // ---- formula.request-puedes ----
  k.ch(1, 'supported', 'fam.home', P, {
    instr: 'Ви просите сестру допомогти вам. Оберіть правильне прохання.',
    pre: uk('Нагадування: ¿Puedes + інфінітив…? Займенник me — перед poder або разом з інфінітивом.'),
    opts: [
      ['¿Puedes ayudarme?', 'c'],
      ['¿Puedes me ayudar?', 'x', 'Me стоїть або перед poder (¿Me puedes ayudar?), або в кінці інфінітива (¿Puedes ayudarme?).'],
      ['¿Puedes ayudas?', 'x', 'Після poder ставимо інфінітив: ayudar, а не ayudas.'],
    ],
    tr: 'ayudar — допомагати',
  }),
  k.ev(2, 'supported', 'fam.class', P, {
    instr: 'За зразком попросіть однокурсника зачинити двері (cerrar la puerta). Звертайтеся на tú; por favor можна додати.',
    model: ['¿Puedes abrir la ventana?', 'Можеш відчинити вікно?'],
    acc: [...withPF('¿Puedes cerrar la puerta?'), '¿Me puedes cerrar la puerta?'],
    err: [
      ['¿Puede cerrar la puerta?', 'Ви звертаєтеся до однокурсника на tú: ¿Puedes…? (¿Puede…? — до usted).'],
      ['¿Puedes cierras la puerta?', 'Після poder ставимо інфінітив: cerrar.'],
      ['¿Puedo cerrar la puerta?', '¿Puedo…? означає «Можна мені…?». Ви просите іншу людину: ¿Puedes…?'],
    ],
  }),
  k.ev(3, 'independent', 'fam.home', P, {
    instr: 'Ви вдома, ваш брат стоїть біля вікна. Попросіть його відчинити вікно (abrir la ventana). Звертайтеся на tú.',
    acc: [...withPF('¿Puedes abrir la ventana?'), '¿Me puedes abrir la ventana?'],
    err: [
      ['¿Puede abrir la ventana?', 'До брата звертаємося на tú: ¿Puedes…?'],
      ['¿Puedes abres la ventana?', 'Після poder ставимо інфінітив: abrir.'],
      ['¿Puedo abrir la ventana?', '¿Puedo…? — «Можна мені відчинити?». Ви просите брата: ¿Puedes…?'],
    ],
    tr: 'abrir la ventana — відчинити вікно',
  }),
  k.ev(4, 'independent', 'fam.office', P, {
    instr: 'Ви телефонуєте в банк і не зрозуміли працівника. Попросіть його повторити (repetir). Звертайтеся на usted.',
    acc: [...withPF('¿Puede repetir?'), '¿Puede repetirlo?', '¿Puede repetirlo, por favor?', '¿Me lo puede repetir?', '¿Me lo puede repetir, por favor?'],
    err: [
      ['¿Puedes repetir, por favor?', 'Завдання просить звертатися на usted: ¿Puede…?'],
      ['¿Puede repite, por favor?', 'Після poder ставимо інфінітив: repetir.'],
    ],
  }),
  k.ev(5, 'independent', 'fam.class', P, {
    instr: 'Ви з двома друзями готуєтеся до іспиту. Попросіть їх зачекати хвилинку (esperar un momento). Звертайтеся на vosotros.',
    acc: withPF('¿Podéis esperar un momento?'),
    err: [
      ['¿Pueden esperar un momento?', 'Завдання просить vosotros: ¿Podéis…? Pueden — форма для ustedes.'],
      ['¿Podéis esperáis un momento?', 'Після poder ставимо інфінітив: esperar.'],
      ['¿Podeis esperar un momento?', 'Прохання побудовано правильно, але podéis пишеться зі знаком наголосу: podéis.', { [P]: 'unresolved' }],
    ],
    tr: 'esperar un momento — зачекати хвилинку',
  }),
  k.ev(6, 'independent', 'fam.home', P, {
    instr: 'Ви несете важкі сумки. Попросіть сусідку, з якою ви на «ти», допомогти вам (ayudar).',
    acc: [...withPF('¿Puedes ayudarme?'), ...withPF('¿Me puedes ayudar?')],
    err: [
      ['¿Puedes me ayudar?', 'Me стоїть перед poder (¿Me puedes ayudar?) або в кінці інфінітива (¿Puedes ayudarme?).'],
      ['¿Me puedes ayudarme?', 'Займенник me пишемо лише один раз: ¿Me puedes ayudar? або ¿Puedes ayudarme?'],
      ['¿Puede ayudarme?', 'До сусідки, з якою ви на «ти», звертаємося на tú: ¿Puedes…?'],
    ],
  }),
  k.ev(7, 'delayed', 'fam.office', P, {
    instr: 'У довідковій на вокзалі ви не почули, о котрій відходить потяг. Попросіть працівницю повторити годину (repetir la hora). Звертайтеся на usted.',
    acc: withPF('¿Puede repetir la hora?'),
    err: [
      ['¿Puedes repetir la hora?', 'Завдання просить звертатися на usted: ¿Puede…?'],
      ['¿Puede repite la hora?', 'Після poder ставимо інфінітив: repetir.'],
    ],
  }),
  k.ev(8, 'delayed', 'fam.home', P, {
    instr: 'Ваша подруга йде в магазин. Попросіть її купити хліб (comprar pan). Звертайтеся на tú.',
    acc: [...withPF('¿Puedes comprar pan?'), ...withPF('¿Puedes comprar el pan?'), '¿Me puedes comprar pan?', '¿Puedes comprarme pan?'],
    err: [
      ['¿Puedes compras pan?', 'Після poder ставимо інфінітив: comprar.'],
      ['¿Puede comprar pan?', 'До подруги звертаємося на tú: ¿Puedes…?'],
    ],
  }),
  k.ev(9, 'transfer', 'fam.shop', P, {
    instr: 'У магазині ви хочете роздивитися сумку на полиці. Попросіть продавця показати її вам (enseñar el bolso). Звертайтеся на usted.',
    acc: [...withPF('¿Puede enseñarme el bolso?'), ...withPF('¿Me puede enseñar el bolso?')],
    err: [
      ['¿Puedes enseñarme el bolso?', 'Завдання просить звертатися на usted: ¿Puede…?'],
      ['¿Puede me enseñar el bolso?', 'Me стоїть перед poder (¿Me puede enseñar…?) або в кінці інфінітива (¿Puede enseñarme…?).'],
    ],
    tr: 'enseñar — показувати; el bolso — сумка',
  }),
  k.ev(10, 'transfer', 'fam.shop', P, {
    instr: 'Ви в ресторані. Попросіть офіціанта принести рахунок (traer la cuenta). Звертайтеся на usted.',
    acc: [...withPF('¿Puede traer la cuenta?'), ...withPF('¿Puede traerme la cuenta?'), ...withPF('¿Me puede traer la cuenta?')],
    err: [
      ['¿Puede trae la cuenta?', 'Після poder ставимо інфінітив: traer.'],
      ['¿Puedes traer la cuenta?', 'Завдання просить звертатися на usted: ¿Puede…?'],
    ],
    tr: 'traer — приносити; la cuenta — рахунок',
  }),

  // ---- formula.request-object ----
  k.ev(11, 'supported', 'fam.home', O, {
    instr: 'За зразком попросіть маму дати вам хліб (dar, el pan). Звертайтеся на tú.',
    model: ['¿Me das un vaso de agua?', 'Даси мені склянку води?'],
    acc: withPF('¿Me das el pan?'),
    err: [
      ['¿Me da el pan?', 'До мами звертаємося на tú: ¿Me das…?'],
      ['¿Das me el pan?', 'Me стоїть перед дієсловом: ¿Me das…?'],
      ['¿Me dar el pan?', 'Тут потрібна форма tú теперішнього часу: das.'],
    ],
  }),
  k.ch(12, 'supported', 'fam.home', O, {
    instr: 'За обідом ви просите друга передати вам воду. Оберіть правильне прохання.',
    pre: uk('Нагадування: ¿Me + дієслово у формі tú + річ?'),
    opts: [
      ['¿Me pasas el agua?', 'c'],
      ['¿Pasas me el agua?', 'x', 'Me стоїть перед дієсловом: ¿Me pasas…?'],
      ['¿Te pasas el agua?', 'x', 'Te означає «тобі». Ви просите для себе: ¿Me pasas…?'],
    ],
    tr: 'pasar — передавати; el agua — вода',
  }),
  k.ev(13, 'independent', 'fam.class', O, {
    instr: 'На занятті у вас немає ручки. Попросіть однокурсника позичити вам його ручку (dejar, tu boli). Звертайтеся на tú.',
    acc: [...withPF('¿Me dejas tu boli?'), ...withPF('¿Me dejas el boli?'), ...withPF('¿Me dejas un boli?')],
    err: [
      ['¿Me deja tu boli?', 'До однокурсника звертаємося на tú: ¿Me dejas…?'],
      ['¿Me dejas su boli?', 'До tú кажемо tu boli («твою ручку»).'],
      ['¿Dejas me tu boli?', 'Me стоїть перед дієсловом: ¿Me dejas…?'],
    ],
    tr: 'dejar — тут: позичати; el boli — ручка',
  }),
  k.ev(14, 'independent', 'fam.home', O, {
    instr: 'Ви з подругою на кухні. Попросіть її передати вам молоко (pasar, la leche). Звертайтеся на tú.',
    acc: withPF('¿Me pasas la leche?'),
    err: [
      ['¿Me pasa la leche?', 'До подруги звертаємося на tú: ¿Me pasas…?'],
      ['¿Me pasar la leche?', 'Тут потрібна форма tú теперішнього часу: pasas.'],
    ],
  }),
  k.ev(15, 'independent', 'fam.bar', O, {
    instr: 'У барі ви замовляєте каву в офіціанта. Попросіть каву з дієсловом poner, звертаючись на usted.',
    acc: withPF('¿Me pone un café?'),
    err: [
      ['¿Me pones un café?', 'Завдання просить usted: ¿Me pone…? (¿Me pones…? — до tú; у барах так теж часто кажуть).'],
      ['¿Me pongo un café?', 'Pongo — «я ставлю». Дію робить офіціант: ¿Me pone…?'],
    ],
  }),
  k.ch(16, 'independent', 'fam.home', O, {
    instr: 'Ви просите сестру дати вам ключі. Оберіть правильний варіант.',
    opts: [
      ['¿Me das las llaves?', 'c'],
      ['¿Me dan las llaves?', 'x', 'Dan — форма для ellos або ustedes. До однієї людини на tú: das.'],
      ['¿Le das las llaves?', 'x', 'Le означає «йому, їй». Ви просите для себе: me.'],
    ],
  }),
  k.ev(17, 'delayed', 'fam.home', O, {
    instr: 'У вашого брата є зарядний пристрій. Попросіть позичити його вам (dejar, el cargador). Звертайтеся на tú.',
    acc: [...withPF('¿Me dejas el cargador?'), ...withPF('¿Me dejas tu cargador?')],
    err: [
      ['¿Me deja el cargador?', 'До брата звертаємося на tú: ¿Me dejas…?'],
      ['¿Dejas me el cargador?', 'Me стоїть перед дієсловом: ¿Me dejas…?'],
    ],
  }),
  k.ev(18, 'delayed', 'fam.bar', O, {
    instr: 'У барі попросіть в офіціанта склянку води (poner, un vaso de agua). Звертайтеся на usted.',
    acc: withPF('¿Me pone un vaso de agua?'),
    err: [
      ['¿Me pongo un vaso de agua?', 'Pongo — «я ставлю». Дію робить офіціант: ¿Me pone…?'],
      ['¿Me pones un vaso de agua?', 'Завдання просить usted: ¿Me pone…?'],
    ],
  }),
  k.ev(19, 'transfer', 'fam.office', O, {
    instr: 'В офісі вам потрібна ручка. Попросіть колегу, з якою ви на «ти», дати вам ручку (dar, un boli).',
    acc: [...withPF('¿Me das un boli?'), ...withPF('¿Me dejas un boli?')],
    err: [
      ['¿Me da un boli?', 'До колеги, з якою ви на «ти», звертаємося на tú: ¿Me das…?'],
      ['¿Das me un boli?', 'Me стоїть перед дієсловом: ¿Me das…?'],
    ],
  }),
  k.ev(20, 'transfer', 'fam.office', O, {
    instr: 'Ваші ключі лежать біля колеги, з яким ви на «ти». Попросіть його передати вам ключі (pasar, las llaves).',
    acc: [...withPF('¿Me pasas las llaves?'), ...withPF('¿Me pasas mis llaves?')],
    err: [
      ['¿Me pasa las llaves?', 'До колеги, з яким ви на «ти», звертаємося на tú: ¿Me pasas…?'],
      ['¿Me pasar las llaves?', 'Тут потрібна форма tú теперішнього часу: pasas.'],
    ],
  }),

  // ---- formula.request-queria ----
  k.ev(21, 'supported', 'fam.shop', Q, {
    instr: 'За зразком ввічливо скажіть у пекарні, що хочете два багети (dos barras de pan).',
    model: ['Quería un kilo de tomates.', 'Я хотів би (хотіла б) кілограм помідорів.'],
    acc: withPF('Quería dos barras de pan.'),
    err: qErr('Quería dos barras de pan.'),
  }),
  k.ch(22, 'supported', 'fam.station', Q, {
    instr: 'Ви в касі вокзалу. Оберіть правильно написане ввічливе прохання.',
    pre: uk('Нагадування: Quería + те, чого ви хочете.'),
    opts: [
      ['Quería un billete para Toledo.', 'c'],
      ['Quise un billete para Toledo.', 'x', 'Quise — форма простого минулого часу від querer, вона говорить про минуле. Для ввічливого прохання тут і тепер — quería.'],
      ['Quiera un billete para Toledo.', 'x', 'Quiera — інша форма, її ще не вивчали. Для ввічливого прохання — quería.'],
    ],
    tr: 'un billete para Toledo — квиток до Толедо',
  }),
  k.ev(23, 'independent', 'fam.station', Q, {
    instr: 'У касі вокзалу ввічливо скажіть, що хочете квиток до Севільї (un billete para Sevilla).',
    acc: withPF('Quería un billete para Sevilla.'),
    err: qErr('Quería un billete para Sevilla.'),
  }),
  k.ev(24, 'independent', 'fam.office', Q, {
    instr: 'Ви телефонуєте в клініку. Ввічливо скажіть, що хотіли б перенести запис (cambiar la cita).',
    acc: [...withPF('Quería cambiar la cita.'), ...withPF('Quería cambiar mi cita.')],
    err: qErr('Quería cambiar la cita.'),
    tr: 'cambiar la cita — перенести запис',
  }),
  k.ev(25, 'independent', 'fam.shop', Q, {
    instr: 'На ринку ввічливо попросіть пів кілограма сиру (medio kilo de queso).',
    acc: withPF('Quería medio kilo de queso.'),
    err: qErr('Quería medio kilo de queso.'),
  }),
  k.ev(26, 'independent', 'fam.bar', Q, {
    instr: 'У кафе ввічливо замовте дві кави (dos cafés).',
    acc: withPF('Quería dos cafés.'),
    err: qErr('Quería dos cafés.'),
  }),
  k.ev(27, 'delayed', 'fam.shop', Q, {
    instr: 'У фруктовій крамниці ввічливо попросіть кілограм яблук (un kilo de manzanas).',
    acc: withPF('Quería un kilo de manzanas.'),
    err: qErr('Quería un kilo de manzanas.'),
  }),
  k.ev(28, 'delayed', 'fam.office', Q, {
    instr: 'Ви телефонуєте до стоматолога. Ввічливо скажіть, що хотіли б записатися на прийом (pedir una cita).',
    acc: [...withPF('Quería pedir una cita.'), ...withPF('Quería pedir cita.')],
    err: qErr('Quería pedir una cita.'),
    tr: 'pedir una cita — записатися на прийом',
  }),
  k.ev(29, 'transfer', 'fam.hotel', Q, {
    instr: 'Ви на рецепції готелю. Ввічливо скажіть, що хочете номер (una habitación).',
    acc: withPF('Quería una habitación.'),
    err: qErr('Quería una habitación.'),
  }),
  k.ev(30, 'transfer', 'fam.hotel', Q, {
    instr: 'Ви виїжджаєте з готелю. Ввічливо скажіть на рецепції, що хотіли б заплатити рахунок (pagar la cuenta).',
    acc: [...withPF('Quería pagar la cuenta.'), ...withPF('Quería pagar.')],
    err: qErr('Quería pagar la cuenta.'),
  }),

  // ---- contrast.tu-usted-register ----
  k.ch(31, 'supported', 'fam.home', R, {
    instr: 'Ви просите свого восьмирічного племінника зачинити двері. Яке прохання доречне?',
    pre: uk('Нагадування: tú — до дітей, родини, друзів; usted — до незнайомих старших людей і в офіційних ситуаціях.'),
    opts: [
      ['¿Puedes cerrar la puerta?', 'c'],
      ['¿Puede cerrar la puerta?', 'x', 'До дитини в Іспанії звертаються на tú; usted тут звучить дивно.'],
    ],
  }),
  k.ch(32, 'supported', 'fam.office', R, {
    instr: 'Ви пишете офіційного листа незнайомому працівникові міської ради. Яке прохання доречне?',
    pre: uk('Нагадування: в офіційному листі незнайомій людині звертаються на usted.'),
    opts: [
      ['¿Puede ayudarme, por favor?', 'c'],
      ['¿Puedes ayudarme, por favor?', 'x', 'В офіційному листі незнайомій людині доречне usted: ¿Puede…?'],
    ],
  }),
  k.ch(33, 'independent', 'fam.friends', R, {
    instr: 'Ви живете в Мадриді й запрошуєте двох друзів у суботу. Яке питання звучить природно в Мадриді?',
    opts: [
      ['¿Podéis venir el sábado?', 'c'],
      ['¿Pueden venir el sábado?', 'x', 'До кількох друзів у більшій частині Іспанії, зокрема в Мадриді, звертаються на vosotros: ¿Podéis…? Ustedes у такій ситуації вживають на Канарських островах і частково в Андалусії.'],
    ],
  }),
  k.ch(34, 'independent', 'fam.street', R, {
    instr: 'На вулиці ви звертаєтеся по допомогу до незнайомої літньої жінки й хочете говорити ввічливо, на «ви» (usted). Яке прохання відповідає цьому звертанню?',
    opts: [
      ['Señora, ¿puede ayudarme?', 'c'],
      ['Señora, ¿puedes ayudarme?', 'x', 'Ви обрали ввічливе звертання usted, тому потрібно ¿Puede…? ¿Puedes…? — звертання на tú.'],
    ],
  }),
  k.ch(35, 'delayed', 'fam.work', R, {
    instr: 'Ви звертаєтеся до колеги свого віку, з яким працюєте щодня й давно на «ти» (tú). Яке прохання відповідає вашому звичному звертанню?',
    opts: [
      ['¿Puedes enviarme el mensaje?', 'c'],
      ['¿Puede enviarme el mensaje?', 'x', 'Ви з цим колегою на «ти», тому потрібно ¿Puedes…? ¿Puede…? — звертання на usted.'],
    ],
  }),
  k.ch(36, 'transfer', 'fam.station', R, {
    instr: 'На вокзалі ви звертаєтеся до групи незнайомих літніх туристів і хочете говорити ввічливо, на «ви» (ustedes). Яке прохання відповідає цьому звертанню?',
    opts: [
      ['Perdón, ¿pueden esperar un momento?', 'c'],
      ['Perdón, ¿podéis esperar un momento?', 'x', 'Ви обрали ввічливе звертання ustedes, тому потрібно ¿Pueden…? ¿Podéis…? — звертання на vosotros, до кількох людей на «ти».'],
    ],
  }),
];

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-07',
  titleUk: 'Прохання: річ, дія чи допомога',
  termEs: 'pedir objetos, acciones y ayuda',
  summaryUk: 'Як попросити когось щось зробити (¿Puedes…? / ¿Puede…?), дати чи передати річ (¿Me das…? / ¿Me pasas…?) і ввічливо сказати, чого ви хочете (Quería…). Звертання tú чи usted обираємо за ситуацією.',
  objectives: ['A2-07-O1'],
  cv: ['CV-01', 'CV-06'],
  situations: ['people-family-home', 'food-shopping', 'time-appointments-transport', 'greetings-introductions'],
  estimatedMinutes: 18,
  introduces: ['formula.request-puedes', 'formula.request-object', 'formula.request-queria', 'contrast.tu-usted-register'],
  revisits: ['ability.poder-inf', 'present.stem-o-ue', 'question.yes-no', 'object-pron.indirect-forms', 'present.querer', 'imperfecto.regular-er-ir.singular', 'pron.subject', 'formula.please-thanks', 'formula.shop'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Прохання з poder: ¿Puedes…?',
      required: true,
      blocks: [
        uk('Щоб попросити когось щось зробити, ставимо питання: poder у формі того, до кого звертаємося, + інфінітив. Por favor робить прохання м’якшим; його ставлять на початку або в кінці.'),
        table(
          ['Кому', 'Форма', 'Приклад'],
          [
            ['другові (tú)', '¿Puedes…?', '¿Puedes abrir la ventana?'],
            ['незнайомій людині (usted)', '¿Puede…?', '¿Puede repetir, por favor?'],
            ['кільком друзям (vosotros)', '¿Podéis…?', '¿Podéis ayudarme?'],
            ['кільком людям офіційно (ustedes)', '¿Pueden…?', '¿Pueden esperar un momento?'],
          ],
          'uk',
        ),
        uk('Займенник ставимо перед poder або приєднуємо до інфінітива — обидва варіанти правильні: ¿Me puedes ayudar? = ¿Puedes ayudarme?'),
        ex('¿Puedes abrir la ventana?', 'Можеш відчинити вікно?'),
        ex('¿Puede repetir, por favor?', 'Можете повторити, будь ласка?'),
        ex('¿Podéis ayudarme?', 'Можете мені допомогти? (до кількох друзів)'),
        ex('¿Pueden esperar un momento?', 'Можете зачекати хвилинку? (до кількох людей на usted)'),
      ],
    },
    {
      id: 's2',
      kind: 'explanation',
      titleUk: 'Попросити річ: ¿Me das…? ¿Me pasas…?',
      required: true,
      blocks: [
        uk('Річ часто просять простим питанням у теперішньому часі з me («мені»): ¿Me das…? — «Даси мені…?», ¿Me pasas…? — «Передаси мені…?», ¿Me dejas…? — «Позичиш мені…?». Me стоїть перед дієсловом.'),
        uk('У барі чи магазині в Іспанії звично кажуть ¿Me pone…? (до usted) або ¿Me pones…? (до tú) — буквально «Поставите мені…?».'),
        ex('¿Me das un vaso de agua?', 'Даси мені склянку води?'),
        ex('¿Me pasas el pan?', 'Передаси мені хліб?'),
        ex('¿Me dejas tu boli?', 'Позичиш мені свою ручку?'),
        ex('¿Me pone un café, por favor?', 'Можна мені каву, будь ласка?'),
      ],
    },
    {
      id: 's3',
      kind: 'explanation',
      titleUk: 'Ввічливо в магазині й установі: Quería…',
      required: true,
      blocks: [
        uk('Quería + іменник або інфінітив — ввічливий спосіб сказати, чого ви хочете, у магазині, кафе, на вокзалі чи в установі. Це форма імперфекту від querer, але вона стосується теперішнього бажання. Пишеться зі знаком наголосу: quería.'),
        uk('Quiero… з por favor теж правильно, але quería звучить м’якше. У виразі un billete para Toledo слово para показує напрямок: «квиток до Толедо».'),
        ex('Quería dos barras de pan.', 'Я хотів би (хотіла б) два багети.'),
        ex('Quería un billete para Toledo.', 'Я хотів би (хотіла б) квиток до Толедо.'),
        ex('Quería cambiar la cita.', 'Я хотів би (хотіла б) перенести запис.'),
      ],
    },
    {
      id: 's4',
      kind: 'explanation',
      titleUk: 'Tú чи usted?',
      required: true,
      blocks: [
        uk('В Іспанії tú вживають широко: з друзями, родиною, дітьми, колегами, часто з ровесниками. Usted — до незнайомих старших людей і в офіційних ситуаціях (установа, офіційний лист). До кількох друзів — vosotros, до кількох людей офіційно — ustedes.'),
        uk('Часто доречні обидва звертання. У вправах ми обираємо ситуації, де різниця очевидна. Usted поєднується з дієсловом у 3-й особі: ¿Puede usted…?'),
        ex('Ana, ¿puedes ayudarme?', 'Ано, можеш мені допомогти?'),
        ex('Señora, ¿puede ayudarme?', 'Пані, можете мені допомогти?'),
      ],
    },
    { id: 's5', kind: 'supported-practice', titleUk: 'Практика зі зразком', required: true, taskIds: ['A2-07-L1-T01', 'A2-07-L1-T02', 'A2-07-L1-T11', 'A2-07-L1-T12', 'A2-07-L1-T21', 'A2-07-L1-T22', 'A2-07-L1-T31', 'A2-07-L1-T32'] },
    { id: 's6', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: ['A2-07-L1-T03', 'A2-07-L1-T04', 'A2-07-L1-T13', 'A2-07-L1-T14', 'A2-07-L1-T23', 'A2-07-L1-T24', 'A2-07-L1-T33', 'A2-07-L1-T34'] },
    { id: 's7', kind: 'independent-practice', titleUk: 'Додаткова практика (за бажанням)', required: false, taskIds: ['A2-07-L1-T05', 'A2-07-L1-T06', 'A2-07-L1-T15', 'A2-07-L1-T16', 'A2-07-L1-T25', 'A2-07-L1-T26'] },
    {
      id: 's8',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Дія: ¿Puedes / Puede / Podéis / Pueden + інфінітив…?',
          'Річ: ¿Me das…? ¿Me pasas…? ¿Me dejas…? У барі: ¿Me pone…?',
          'Ввічливо в магазині чи установі: Quería + іменник або інфінітив.',
          'Tú — друзям і родині, usted — незнайомим старшим людям і офіційно; кільком друзям — vosotros.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
