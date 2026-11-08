// A2-07-L2 — asking permission; accepting or refusing with a reason (O2); listening to requests.
import { ex, table, ul, uk } from './lib.mjs';
import { kit, withPF } from './kit.mjs';

const L = 'A2-07-L2';
const PM = 'formula.permission-puedo/construction-use';
const PVR_CC = 'contrast.permission-vs-request/context-choice';
const PVR_RM = 'contrast.permission-vs-request/reading-meaning';
const ACC = 'formula.response-accept/context-choice';
const REF = 'formula.response-refuse-reason/construction-use';
const REF_CC = 'formula.response-refuse-reason/context-choice';
const LM = 'listening.requests-responses/listening-meaning';
const DI = 'listening.requests-responses/dictation';

const D = {
  [PM]: {
    rule: 'Дозвіл для себе: ¿Puedo + інфінітив…? (за себе й інших — ¿Podemos…?). Якщо просимо, щоб дію виконав співрозмовник, — ¿Puedes…? / ¿Puede…?',
    ok: 'Правильно! Так просять дозволу щось зробити самому.',
    bad: 'Ще ні. Дозвіл для себе: ¿Puedo / Podemos + інфінітив…?',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком: ¿Puedo / Podemos + інфінітив…?',
  },
  [REF]: {
    rule: 'Ввічлива відмова: Lo siento, es que + причина (звичайне речення в теперішньому часі). Можна й так: Lo siento, pero + що заважає.',
    ok: 'Правильно! Ввічлива відмова з причиною.',
    bad: 'Ще ні. Схема: Lo siento, es que + причина.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком: Lo siento, es que + причина.',
  },
  [REF_CC]: {
    rule: 'Якщо ви не можете виконати прохання, відмовте ввічливо: Lo siento, es que + причина.',
    ok: 'Так, у цій ситуації доречна ввічлива відмова з причиною.',
    bad: 'Ні. Подумайте: ви можете виконати прохання чи ні?',
  },
  [ACC]: {
    rule: 'Погодитися допомагають готові фрази: Sí, claro. / Claro que sí. / Por supuesto. / Vale. / Sin problema.',
    ok: 'Так, тут доречна згода.',
    bad: 'Ні. Подумайте: ви можете виконати прохання чи ні?',
  },
  [PVR_CC]: {
    rule: 'Puedo, podemos — діятиме сам мовець (просить дозволу). Puedes, puede, podéis, pueden — діятиме співрозмовник (його просять).',
    ok: 'Правильно! Форма poder показує, хто діятиме.',
    bad: 'Ні. Подумайте, хто має виконати дію: ви самі чи співрозмовник.',
  },
  [PVR_RM]: {
    rule: 'Puedo, podemos — діятиме той, хто питає. Puedes, puede, podéis, pueden — діятиме той, кого просять.',
    ok: 'Правильно! Ви зрозуміли, хто діятиме.',
    bad: 'Ні. Подивіться на форму poder: хто діятиме — той, хто питає, чи той, кого просять?',
  },
  [LM]: {
    rule: 'Слухаючи, визначте: хто просить, про що, як звертається (tú чи usted) і чи погоджується співрозмовник.',
    ok: 'Правильно! Ви зрозуміли головне.',
    bad: 'Ні. Послухайте ще раз; за потреби відкрийте текст запису.',
  },
  [DI]: {
    rule: 'Запишіть фразу так, як чуєте: зі знаками ¿ ?, знаками наголосу й ñ.',
    ok: 'Правильно записано!',
    bad: 'Є помилка в написанні. Порівняйте із записом.',
  },
};

const k = kit(L, D);

const refuse = (...reasons) => reasons.flatMap((x) => [`Lo siento, es que ${x}.`, `Lo siento, pero ${x}.`, `No, lo siento, es que ${x}.`]);

const CLIPS = [
  {
    id: 'clip.a2-07.coche-request',
    lessonId: L,
    kind: 'text',
    transcript: 'Hola, Marta, soy Luis. Te llamo porque tengo un problema: mañana tengo una cita con el médico a las nueve y no tengo coche. ¿Me dejas tu coche por la mañana? Muchas gracias. Hasta luego.',
    translationUk: 'Привіт, Марто, це Луїс. Телефоную тобі, бо в мене проблема: завтра о дев’ятій у мене прийом у лікаря, а машини в мене немає. Позичиш мені свою машину на ранок? Дуже дякую. До зустрічі.',
    targets: [
      { skillId: 'listening.requests-responses', modality: 'listening-meaning' },
      { skillId: 'listening.requests-responses', modality: 'dictation' },
    ],
    family: 'fam.clip-coche-request',
    reviewStatus: 'draft',
  },
  {
    id: 'clip.a2-07.coche-reply',
    lessonId: L,
    kind: 'text',
    transcript: 'Hola, Luis, soy Marta. Lo siento, es que mañana necesito el coche: a las ocho tengo que ir a Toledo. ¿Por qué no vas en autobús? Hay un autobús a las ocho y media. Un abrazo.',
    translationUk: 'Привіт, Луїсе, це Марта. Вибач, просто завтра мені самій потрібна машина: о восьмій я маю їхати до Толедо. Чому б тобі не поїхати автобусом? Є автобус о пів на дев’яту. Обіймаю.',
    targets: [{ skillId: 'listening.requests-responses', modality: 'listening-meaning' }],
    family: 'fam.clip-coche-reply',
    reviewStatus: 'draft',
  },
  {
    id: 'clip.a2-07.bicicleta-permiso',
    lessonId: L,
    kind: 'text',
    transcript: 'Hola, Elena, soy Carmen. Esta tarde voy al supermercado. ¿Necesitas algo? El sábado quiero ir al parque. ¿Puedo usar tu bicicleta? La mía está rota. ¡Gracias!',
    translationUk: 'Привіт, Олено, це Кармен. Сьогодні по обіді я йду в супермаркет. Тобі щось потрібно? У суботу я хочу поїхати в парк. Можна взяти твій велосипед? Мій зламаний. Дякую!',
    targets: [
      { skillId: 'listening.requests-responses', modality: 'listening-meaning' },
      { skillId: 'listening.requests-responses', modality: 'dictation' },
    ],
    family: 'fam.clip-bicicleta',
    reviewStatus: 'draft',
  },
];
const [cA, cB, cC] = CLIPS;

const tasks = [
  // ---- formula.permission-puedo ----
  k.ch(1, 'supported', 'fam.home', PM, {
    instr: 'Ви в гостях і хочете самі відчинити вікно. Оберіть, як попросити дозволу.',
    pre: uk('Нагадування: дозвіл для себе — ¿Puedo + інфінітив…?'),
    opts: [
      ['¿Puedo abrir la ventana?', 'c'],
      ['¿Puedes abrir la ventana?', 'x', 'Так ви просите господаря відчинити вікно. Дозвіл для себе: ¿Puedo…?'],
      ['¿Puedo abro la ventana?', 'x', 'Після puedo ставимо інфінітив: abrir.'],
    ],
  }),
  k.ev(2, 'supported', 'fam.shop', PM, {
    instr: 'За зразком запитайте в магазині, чи можна заплатити готівкою (pagar en efectivo).',
    model: ['¿Puedo pagar con tarjeta?', 'Можна заплатити карткою?'],
    acc: withPF('¿Puedo pagar en efectivo?'),
    err: [
      ['¿Puede pagar en efectivo?', 'Puede — «чи може він / чи можете Ви». Дозвіл для себе: ¿Puedo…?'],
      ['¿Puedo pago en efectivo?', 'Після puedo ставимо інфінітив: pagar.'],
    ],
  }),
  k.ev(3, 'independent', 'fam.home', PM, {
    instr: 'Ви в гостях у подруги. Запитайте, чи можна скористатися її комп’ютером (usar tu ordenador).',
    acc: withPF('¿Puedo usar tu ordenador?'),
    err: [
      ['¿Puedes usar tu ordenador?', 'Так ви питаєте, чи може подруга скористатися комп’ютером. Дозвіл для себе: ¿Puedo…?'],
      ['¿Puedo uso tu ordenador?', 'Після puedo ставимо інфінітив: usar.'],
    ],
    tr: 'usar — користуватися; el ordenador — комп’ютер',
  }),
  k.ev(4, 'independent', 'fam.street', PM, {
    instr: 'Ви з другом під’їхали до магазину. Запитайте працівника, чи можна вам тут припаркуватися (aparcar aquí). Ви питаєте за себе й друга.',
    acc: withPF('¿Podemos aparcar aquí?'),
    err: [
      ['¿Pueden aparcar aquí?', 'Pueden — «чи можуть вони / чи можете Ви». Ви питаєте за себе й друга: ¿Podemos…?'],
      ['¿Podemos aparcamos aquí?', 'Після podemos ставимо інфінітив: aparcar.'],
      ['¿Puedo aparcar aquí?', 'Ви питаєте за себе й друга, тому ¿Podemos…?'],
    ],
    tr: 'aparcar — паркуватися',
  }),
  k.ev(5, 'independent', 'fam.office', PM, {
    instr: 'Ваш телефон розрядився. Запитайте колегу, з яким ви на «ти», чи можна скористатися його зарядним (usar tu cargador).',
    acc: withPF('¿Puedo usar tu cargador?'),
    err: [
      ['¿Puedes usar tu cargador?', 'Так ви питаєте, чи може колега скористатися зарядним. Дозвіл для себе: ¿Puedo…?'],
      ['¿Puedo usar su cargador?', 'До колеги на «ти» кажемо tu cargador.'],
    ],
  }),
  k.ch(6, 'independent', 'fam.class', PM, {
    instr: 'На занятті ви хочете ненадовго вийти. Оберіть, як попросити дозволу у викладачки.',
    opts: [
      ['¿Puedo salir un momento?', 'c'],
      ['¿Puede salir un momento?', 'x', 'Так ви просите вийти викладачку. Дозвіл для себе: ¿Puedo…?'],
      ['¿Puedo salgo un momento?', 'x', 'Після puedo ставимо інфінітив: salir.'],
    ],
  }),
  k.ev(7, 'delayed', 'fam.home', PM, {
    instr: 'Ви в гостях, і вам холодно. Запитайте, чи можна зачинити двері (cerrar la puerta).',
    acc: withPF('¿Puedo cerrar la puerta?'),
    err: [
      ['¿Puedes cerrar la puerta?', 'Так ви просите господаря зачинити двері. Дозвіл для себе: ¿Puedo…?'],
      ['¿Puedo cierro la puerta?', 'Після puedo ставимо інфінітив: cerrar.'],
    ],
  }),
  k.ev(8, 'delayed', 'fam.shop', PM, {
    instr: 'У магазині запитайте продавця, чи можна подивитися сумку (ver el bolso).',
    acc: [...withPF('¿Puedo ver el bolso?'), ...withPF('¿Puedo ver ese bolso?')],
    err: [
      ['¿Puede ver el bolso?', 'Puede — «чи можете Ви подивитися». Дозвіл для себе: ¿Puedo…?'],
      ['¿Puedo veo el bolso?', 'Після puedo ставимо інфінітив: ver.'],
    ],
  }),
  k.ev(9, 'transfer', 'fam.station', PM, {
    instr: 'На вокзалі ви з подругою запитуєте працівника, чи можна вам залишити тут валізи (dejar las maletas aquí).',
    acc: withPF('¿Podemos dejar las maletas aquí?'),
    err: [
      ['¿Pueden dejar las maletas aquí?', 'Pueden — «чи можуть вони / чи можете Ви». Ви питаєте за себе й подругу: ¿Podemos…?'],
      ['¿Podemos dejamos las maletas aquí?', 'Після podemos ставимо інфінітив: dejar.'],
    ],
    tr: 'dejar — тут: залишати; las maletas — валізи',
  }),
  k.ev(10, 'transfer', 'fam.station', PM, {
    instr: 'На вокзалі біля каси лежать розклади. Запитайте, чи можна взяти цей розклад (coger este horario).',
    acc: [...withPF('¿Puedo coger este horario?'), ...withPF('¿Puedo coger un horario?')],
    err: [
      ['¿Puede coger este horario?', 'Puede — «чи можете Ви взяти». Дозвіл для себе: ¿Puedo…?'],
      ['¿Puedo cojo este horario?', 'Після puedo ставимо інфінітив: coger.'],
    ],
    tr: 'coger — брати; el horario — розклад',
  }),

  // ---- formula.response-refuse-reason (construction-use) ----
  k.ev(11, 'supported', 'fam.friends', REF, {
    instr: 'Подруга просить вас допомогти їй у суботу. Відмовте з причиною: у суботу ви працюєте (el sábado trabajo). Почніть із Lo siento, es que…',
    model: ['Lo siento, es que no tengo coche.', 'Вибач, просто в мене немає машини.'],
    acc: refuse('el sábado trabajo', 'trabajo el sábado'),
    err: [
      ['Lo siento, es que el sábado trabajar.', 'Після es que — звичайне речення з дієсловом у формі: trabajo.'],
      ['Sí, claro, el sábado trabajo.', 'Sí, claro — це згода. Для відмови почніть із Lo siento…'],
    ],
  }),
  k.ch(12, 'supported', 'fam.friends', REF, {
    instr: 'Друг просить позичити ваш велосипед, але він вам самому потрібен. Оберіть ввічливу відмову з причиною.',
    pre: uk('Нагадування: Lo siento, es que + причина.'),
    opts: [
      ['Lo siento, es que la necesito.', 'c'],
      ['Sí, claro, es que la necesito.', 'x', 'Sí, claro — це згода. Для відмови почніть із Lo siento…'],
      ['Lo siento.', 'x', 'Тут бракує причини. Додайте es que + причина.'],
    ],
    tr: 'la necesito — він мені потрібен (la = la bicicleta)',
  }),
  k.ev(13, 'independent', 'fam.home', REF, {
    instr: 'Сусід просить вас увечері погодувати його кота, але сьогодні ввечері вас не буде вдома (esta noche no estoy en casa). Відмовте з причиною.',
    acc: refuse('esta noche no estoy en casa', 'no estoy en casa esta noche'),
    err: [['Lo siento, es que esta noche no soy en casa.', 'Місце позначаємо дієсловом estar: no estoy en casa.']],
  }),
  k.ev(14, 'independent', 'fam.friends', REF, {
    instr: 'Друзі кличуть вас сьогодні ввечері в кіно, але ви дуже втомлені (estoy muy cansado / estoy muy cansada). Відмовте з причиною.',
    acc: refuse('estoy muy cansado', 'estoy muy cansada'),
    err: [['Lo siento, es que soy muy cansado.', 'Тимчасовий стан позначаємо дієсловом estar: estoy muy cansado.']],
  }),
  k.ev(15, 'independent', 'fam.home', REF, {
    instr: 'Сестра просить позичити їй гроші, але зараз у вас немає грошей (no tengo dinero). Відмовте з причиною.',
    acc: refuse('no tengo dinero', 'ahora no tengo dinero'),
    err: [['Lo siento, es que no tener dinero.', 'Після es que — дієслово у формі: no tengo dinero.']],
  }),
  k.ev(16, 'independent', 'fam.work', REF, {
    instr: 'Колега просить вас прийти завтра на зустріч уранці, але вранці у вас прийом у лікаря (por la mañana tengo una cita con el médico). Відмовте з причиною.',
    acc: refuse('por la mañana tengo una cita con el médico', 'tengo una cita con el médico por la mañana'),
    err: [['Lo siento, es que por la mañana tener una cita con el médico.', 'Після es que — дієслово у формі: tengo.']],
  }),
  k.ev(17, 'delayed', 'fam.friends', REF, {
    instr: 'Друг просить допомогти йому в неділю, але в неділю ви їдете до батьків (el domingo voy a casa de mis padres). Відмовте з причиною.',
    acc: refuse('el domingo voy a casa de mis padres', 'voy a casa de mis padres el domingo'),
    err: [['Lo siento, es que el domingo ir a casa de mis padres.', 'Після es que — дієслово у формі: voy.']],
  }),
  k.ev(18, 'delayed', 'fam.home', REF, {
    instr: 'Сусідка питає, чи можете ви завтра полити її квіти, але завтра ви їдете до Толедо (mañana voy a Toledo). Відмовте з причиною.',
    acc: refuse('mañana voy a Toledo', 'voy a Toledo mañana'),
    err: [['Lo siento, es que mañana ir a Toledo.', 'Після es que — дієслово у формі: voy.']],
  }),
  k.ev(19, 'transfer', 'fam.formal', REF, {
    instr: 'Незнайома людина на вулиці просить допомогти їй знайти готель, але ви не знаєте цього міста (no conozco la ciudad). Відмовте з причиною.',
    acc: refuse('no conozco la ciudad', 'no conozco esta ciudad'),
    err: [['Lo siento, es que no sé la ciudad.', 'Місто «знають» як знайоме місце: conocer — no conozco la ciudad.']],
  }),
  k.ev(20, 'transfer', 'fam.formal', REF, {
    instr: 'Керівник просить вас залишитися на роботі довше, але о сьомій у вас заняття з іспанської (a las siete tengo clase de español). Відмовте з причиною.',
    acc: refuse('a las siete tengo clase de español', 'tengo clase de español a las siete'),
    err: [['Lo siento, es que a las siete tener clase de español.', 'Після es que — дієслово у формі: tengo.']],
  }),

  // ---- accept vs refuse in context (context-choice) ----
  k.ch(21, 'supported', 'fam.class', ACC, {
    instr: 'Однокурсниця питає: «¿Me dejas tu boli?» У вас дві ручки. Як ви відповісте?',
    pre: uk('Нагадування: Sí, claro. / Vale. / Sin problema. — згода; Lo siento, es que… — відмова.'),
    opts: [
      ['Sí, claro.', 'c'],
      ['Lo siento, es que lo necesito.', 'x', 'У вас дві ручки, тож відмовляти немає причини.'],
    ],
  }),
  k.ch(22, 'supported', 'fam.friends', REF_CC, {
    instr: 'Друг питає: «¿Puedes venir a mi casa esta tarde?» Але сьогодні ви працюєте до дев’ятої. Як ви відповісте?',
    pre: uk('Нагадування: якщо не можете, відмовте з причиною: Lo siento, es que…'),
    opts: [
      ['Lo siento, es que hoy trabajo hasta las nueve.', 'c'],
      ['¡Sí, claro!', 'x', 'Ви не можете прийти, тож потрібна відмова з причиною.'],
      ['Vale.', 'x', 'Vale — це згода. Ви ж не можете прийти.'],
    ],
  }),
  k.ch(23, 'independent', 'fam.work', ACC, {
    instr: 'Колега питає: «¿Puedo abrir la ventana?» Вам теж спекотно. Як ви відповісте?',
    opts: [
      ['Sí, claro.', 'c'],
      ['Lo siento, es que tengo frío.', 'x', 'Вам теж спекотно, тож доречно погодитися.'],
    ],
  }),
  k.ch(24, 'independent', 'fam.friends', REF_CC, {
    instr: 'Подруга питає: «¿Me dejas tu coche mañana?» Але завтра ви самі їдете машиною на роботу. Як ви відповісте?',
    opts: [
      ['Lo siento, es que mañana lo necesito.', 'c'],
      ['Por supuesto.', 'x', 'Por supuesto — це згода. Машина завтра потрібна вам самим.'],
      ['Sin problema.', 'x', 'Sin problema — це згода. Машина завтра потрібна вам самим.'],
    ],
  }),
  k.ch(25, 'delayed', 'fam.home', ACC, {
    instr: 'Сестра питає: «¿Puedo usar tu cargador?» Ваш телефон уже заряджений. Як ви відповісте?',
    opts: [
      ['Claro que sí.', 'c'],
      ['Lo siento, es que lo necesito.', 'x', 'Ваш телефон уже заряджений, тож доречно погодитися.'],
    ],
  }),
  k.ch(26, 'transfer', 'fam.meeting', REF_CC, {
    instr: 'Колега питає: «¿Puedes venir a la reunión a las ocho?» О восьмій у вас інша зустріч. Як ви відповісте?',
    opts: [
      ['Lo siento, es que a las ocho tengo otra reunión.', 'c'],
      ['Sí, claro.', 'x', 'О восьмій ви зайняті, тож потрібна відмова з причиною.'],
      ['Vale, sin problema.', 'x', 'Це згода. О восьмій ви зайняті.'],
    ],
  }),

  // ---- contrast.permission-vs-request ----
  k.ch(27, 'supported', 'fam.friends', PVR_RM, {
    instr: 'Прочитайте діалог. Хто їхатиме на велосипеді?',
    pre: uk('Нагадування: puedo — діятиме той, хто питає; puedes — той, кого просять.'),
    es: '—¿Puedo usar tu bicicleta? —Sí, claro.',
    opts: [
      ['той, хто питає', 'c'],
      ['той, хто відповідає', 'x', 'Puedo — «можна мені». Діятиме той, хто питає.'],
    ],
  }),
  k.ch(28, 'supported', 'fam.home', PVR_CC, {
    instr: 'Ви хочете, щоб ваш друг зачинив вікно. Оберіть питання.',
    pre: uk('Нагадування: ¿Puedes…? — просимо іншого; ¿Puedo…? — просимо дозволу для себе.'),
    opts: [
      ['¿Puedes cerrar la ventana?', 'c'],
      ['¿Puedo cerrar la ventana?', 'x', '¿Puedo…? — ви просите дозволу зачинити вікно самі.'],
    ],
  }),
  k.ch(29, 'independent', 'fam.friends', PVR_RM, {
    instr: 'Прочитайте повідомлення. Хто телефонуватиме ввечері?',
    es: 'Hola, Ana. ¿Me puedes llamar esta noche?',
    opts: [
      ['Ана', 'c'],
      ['той, хто пише повідомлення', 'x', 'Me puedes llamar — «можеш мені подзвонити»: телефонуватиме Ана.'],
    ],
  }),
  k.ch(30, 'independent', 'fam.bar', PVR_CC, {
    instr: 'У кафе ви хочете самі заплатити за себе й друга. Що ви скажете другові?',
    opts: [
      ['¿Puedo pagar yo?', 'c'],
      ['¿Puedes pagar tú?', 'x', 'Так ви просите друга заплатити.'],
    ],
  }),
  k.ch(31, 'delayed', 'fam.class', PVR_RM, {
    instr: 'Учні питають у викладача. Хто хоче вийти о дванадцятій?',
    es: '—Profesor, ¿podemos salir a las doce? —Vale.',
    opts: [
      ['учні, які питають', 'c'],
      ['викладач', 'x', 'Podemos — «чи можемо ми». Вийти хочуть учні.'],
    ],
  }),
  k.ch(32, 'transfer', 'fam.office', PVR_CC, {
    instr: 'По телефону ви не почули номер. Ви хочете, щоб працівник (на usted) повторив свій номер. Оберіть питання.',
    opts: [
      ['¿Puede repetir su número?', 'c'],
      ['¿Puedo repetir su número?', 'x', 'Так ви пропонуєте повторити номер самі.'],
    ],
  }),

  // ---- listening ----
  k.lm(33, 'independent', cA, LM, {
    instr: 'Прослухайте голосове повідомлення. Про що Луїс просить Марту?',
    opts: [
      ['позичити йому машину на ранок', 'c'],
      ['відвезти його до лікаря о дев’ятій', 'x', 'Луїс питає ¿Me dejas tu coche…? — «Позичиш мені машину?»'],
      ['подзвонити лікареві', 'x', 'Луїс сам телефонує Марті й просить машину.'],
    ],
  }),
  k.lm(34, 'independent', cA, LM, {
    instr: 'Прослухайте повідомлення Луїса ще раз. Як він звертається до Марти?',
    opts: [
      ['на «ти» (tú)', 'c'],
      ['на «Ви» (usted)', 'x', 'Луїс каже ¿Me dejas tu coche? — це форма для tú.'],
    ],
  }),
  k.lm(35, 'independent', cB, LM, {
    instr: 'Прослухайте відповідь Марти. Що вона відповідає Луїсові?',
    opts: [
      ['Відмовляє: завтра машина потрібна їй самій.', 'c'],
      ['Погоджується і дає машину на ранок.', 'x', 'Марта каже Lo siento, es que mañana necesito el coche — це відмова.'],
      ['Пропонує сама відвезти Луїса.', 'x', 'Марта радить поїхати автобусом.'],
    ],
  }),
  k.lm(36, 'independent', cB, LM, {
    instr: 'Прослухайте відповідь Марти ще раз. Що вона радить Луїсові?',
    opts: [
      ['поїхати автобусом о 8:30', 'c'],
      ['поїхати з нею до Толедо о восьмій', 'x', 'До Толедо їде сама Марта. Луїсові вона радить автобус.'],
      ['перенести прийом у лікаря', 'x', 'Про перенесення прийому Марта не говорить.'],
    ],
  }),
  k.lm(37, 'delayed', cC, LM, {
    instr: 'Прослухайте голосове повідомлення. Про що Кармен просить дозволу?',
    opts: [
      ['узяти велосипед Олени в суботу', 'c'],
      ['піти з Оленою в супермаркет', 'x', 'У супермаркет Кармен іде сама й питає, чи Олені щось потрібно.'],
      ['узяти машину Олени', 'x', 'Кармен питає про bicicleta — велосипед.'],
    ],
  }),
  k.lm(38, 'delayed', cC, LM, {
    instr: 'Прослухайте повідомлення Кармен ще раз. Хто їхатиме на велосипеді в суботу?',
    opts: [
      ['Кармен', 'c'],
      ['Олена', 'x', 'Кармен питає ¿Puedo usar tu bicicleta? — їхатиме вона сама.'],
      ['Кармен і Олена разом', 'x', 'Кармен питає дозволу лише для себе: ¿Puedo…?'],
    ],
  }),
  k.dict(39, 'independent', cA, DI, {
    instr: 'Прослухайте повідомлення Луїса й запишіть його питання до Марти.',
    acc: ['¿Me dejas tu coche por la mañana?'],
    err: [
      ['¿Me dejas tú coche por la mañana?', 'Tu («твій») пишеться без знака наголосу; tú — це «ти».'],
      ['¿Me dejas tu coche por la manana?', 'Mañana пишеться з ñ.'],
    ],
  }),
  k.dict(40, 'delayed', cC, DI, {
    instr: 'Прослухайте повідомлення Кармен і запишіть її питання про велосипед.',
    acc: ['¿Puedo usar tu bicicleta?'],
    err: [['¿Puedo usar tú bicicleta?', 'Tu («твій») пишеться без знака наголосу; tú — це «ти».']],
  }),
];

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-07',
  titleUk: 'Дозвіл і коротка відповідь',
  termEs: 'pedir permiso, aceptar y rechazar',
  summaryUk: 'Як попросити дозволу для себе (¿Puedo…?), відрізнити його від прохання до іншого (¿Puedes…?), коротко погодитися (Sí, claro. Vale.) або ввічливо відмовити з причиною (Lo siento, es que…).',
  objectives: ['A2-07-O2'],
  cv: ['CV-01'],
  situations: ['people-family-home', 'personal-messages', 'greetings-introductions', 'food-shopping'],
  estimatedMinutes: 20,
  introduces: ['formula.permission-puedo', 'contrast.permission-vs-request', 'formula.response-accept', 'formula.response-refuse-reason', 'listening.requests-responses'],
  revisits: ['formula.request-puedes', 'formula.request-object', 'ability.poder-inf', 'link.porque', 'formula.apology', 'formula.invitation'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Дозвіл для себе: ¿Puedo…?',
      required: true,
      blocks: [
        uk('Коли просимо дозволу щось зробити самі, poder стоїть у формі yo (¿Puedo…?) або nosotros (¿Podemos…?), а далі — інфінітив. Коли просимо, щоб дію виконав інший, — у формі співрозмовника (¿Puedes…?, ¿Puede…?).'),
        table(
          ['Хто діятиме', 'Питання', 'Значення'],
          [
            ['я', '¿Puedo abrir la ventana?', 'Можна мені відчинити вікно?'],
            ['ми', '¿Podemos aparcar aquí?', 'Можна нам тут припаркуватися?'],
            ['ти', '¿Puedes abrir la ventana?', 'Можеш відчинити вікно?'],
            ['Ви (usted)', '¿Puede abrir la ventana?', 'Можете відчинити вікно?'],
          ],
          'uk',
        ),
        ex('¿Puedo usar tu cargador?', 'Можна скористатися твоїм зарядним?'),
        ex('¿Puedo pagar con tarjeta?', 'Можна заплатити карткою?'),
        ex('¿Podemos fumar aquí?', 'Нам тут можна палити?'),
        ex('Con permiso.', 'Дозвольте (пройти, увійти).'),
      ],
    },
    {
      id: 's2',
      kind: 'explanation',
      titleUk: 'Згода: Sí, claro. Vale. Por supuesto.',
      required: true,
      blocks: [
        uk('Коротко погодитися допомагають готові фрази: Sí, claro. / Claro que sí. / Por supuesto. / Vale. / Sin problema. Vale — дуже поширене в Іспанії «гаразд».'),
        ex('—¿Puedo abrir la ventana? —Sí, claro.', '— Можна відчинити вікно? — Так, звісно.'),
        ex('—¿Me dejas tu boli? —Por supuesto.', '— Позичиш мені ручку? — Звісно.'),
        ex('—¿Puedes venir a las ocho? —Vale, sin problema.', '— Можеш прийти о восьмій? — Гаразд, без проблем.'),
      ],
    },
    {
      id: 's3',
      kind: 'explanation',
      titleUk: 'Ввічлива відмова з причиною',
      required: true,
      blocks: [
        uk('Ввічлива відмова зазвичай має вибачення і причину: Lo siento, es que + причина. Es que не перекладаємо дослівно: це «справа в тому, що», «просто». Можна сказати й так: Lo siento, pero + що заважає.'),
        uk('Після es que іде звичайне речення в теперішньому часі: es que trabajo, es que estoy cansado.'),
        ex('Lo siento, es que no tengo coche.', 'Вибач, просто в мене немає машини.'),
        ex('Lo siento, pero ahora no puedo.', 'Вибач, але зараз я не можу.'),
        ex('No, lo siento, es que lo necesito.', 'Ні, вибач, він мені самому потрібен.'),
      ],
    },
    { id: 's4', kind: 'supported-practice', titleUk: 'Практика зі зразком', required: true, taskIds: ['A2-07-L2-T01', 'A2-07-L2-T02', 'A2-07-L2-T11', 'A2-07-L2-T12', 'A2-07-L2-T21', 'A2-07-L2-T22', 'A2-07-L2-T27', 'A2-07-L2-T28'] },
    { id: 's5', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: ['A2-07-L2-T03', 'A2-07-L2-T04', 'A2-07-L2-T13', 'A2-07-L2-T14', 'A2-07-L2-T23', 'A2-07-L2-T24', 'A2-07-L2-T29', 'A2-07-L2-T30'] },
    {
      id: 's6',
      kind: 'listening',
      titleUk: 'Слухаємо: прохання і відповідь',
      required: true,
      blocks: [uk('Прослухайте два голосові повідомлення: прохання Луїса і відповідь Марти. Спершу відповідайте без тексту; текст запису можна відкрити як підказку.')],
      clipIds: ['clip.a2-07.coche-request', 'clip.a2-07.coche-reply'],
      taskIds: ['A2-07-L2-T33', 'A2-07-L2-T34', 'A2-07-L2-T35', 'A2-07-L2-T36'],
    },
    { id: 's7', kind: 'independent-practice', titleUk: 'Додаткова практика і диктант (за бажанням)', required: false, taskIds: ['A2-07-L2-T05', 'A2-07-L2-T06', 'A2-07-L2-T15', 'A2-07-L2-T16', 'A2-07-L2-T39'] },
    {
      id: 's8',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Дозвіл для себе: ¿Puedo / Podemos + інфінітив…?',
          'Прохання до іншого: ¿Puedes / Puede…? — діятиме співрозмовник.',
          'Згода: Sí, claro. / Claro que sí. / Por supuesto. / Vale. / Sin problema.',
          'Відмова: Lo siento, es que + причина (або Lo siento, pero…).',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks, clips: CLIPS };
