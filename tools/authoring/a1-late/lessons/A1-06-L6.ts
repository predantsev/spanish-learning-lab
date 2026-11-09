// A1-06-L6 — a short personal message: openings and closings, reading a message and choosing a
// reply, writing a short message, listening to a voice message (O7/O8, CV-01, CV-06).
import { Kit, es, hTranscript, plink, ul, uk } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-06-L6', RULES);

const OC = 'formula.message-opening-closing/phrase-recall';
const OCR = 'formula.message-opening-closing/reading-meaning';
const RM = 'reading.personal-message/reading-meaning';
const RMC = 'reading.personal-message/context-choice';
const WM = 'writing.personal-message/construction-use';
const LM = 'listening.message/listening-meaning';

const CRIT = [
  'Є привітання на початку і прощання в кінці (¡Hola…!, Un abrazo, Besos, ¡Hasta pronto!).',
  'Головну мету досягнуто: відповідь на запрошення, план чи прохання зрозуміла.',
  'Є хоча б одна причина з porque.',
  'Вивчені форми вжиті правильно (me gusta, quiero / necesito + інфінітив, el sábado voy…).',
  'Відповідь може відрізнятися від прикладу: перевіряється зміст і вивчені форми; довжина — орієнтир.',
];

// ======================= openings and closings
k.exact({ n: 1, role: 'supported', fam: 'a106.open', t: [OC], ins: 'Почни повідомлення подрузі Ані іспанською: «Привіт, Ано!» Зразок: ¡Hola, Pablo!', acc: ['¡Hola, Ana!', 'Hola, Ana:', 'Hola, Ana.', 'Hola, Ana'], err: [['¡Hola Ana!', 'Звертання відокремлюємо комою: ¡Hola, Ana!', { [OC]: 'incorrect' }], ['Hola Ana:', 'Звертання відокремлюємо комою: Hola, Ana:', { [OC]: 'incorrect' }]] });
k.exact({ n: 2, role: 'independent', fam: 'a106.close', t: [OC], ins: 'Закінчи повідомлення другові іспанською: «Обіймаю».', acc: ['Un abrazo.', 'Un abrazo,', 'Un abrazo', '¡Un abrazo!'] });
k.exact({ n: 3, role: 'independent', fam: 'a106.close', t: [OC], ins: 'Закінчи повідомлення іспанською: «До скорого!»', acc: ['¡Hasta pronto!', 'Hasta pronto.', 'Hasta pronto'] });
k.exact({ n: 4, role: 'independent', fam: 'a106.open', t: [OC], ins: 'Почни лист другові Пабло іспанською: «Дорогий Пабло».', acc: ['Querido Pablo:', '¡Querido Pablo!', 'Querido Pablo'], err: [['Querida Pablo:', 'Pablo — чоловік, тож querido.', { [OC]: 'incorrect' }], ['Querido Pablo,', 'В іспанському листі після звертання ставлять двокрапку, а не кому: Querido Pablo:', { [OC]: 'incorrect' }]] });
k.exact({ n: 5, role: 'delayed', fam: 'a106.close', t: [OC], ins: 'Закінчи повідомлення подрузі іспанською: «Побачимося».', acc: ['Nos vemos.', 'Nos vemos', '¡Nos vemos!'] });
k.choice({ n: 6, role: 'independent', fam: 'a106.r-close', t: [OCR], ins: 'Що означає «Besos» у кінці повідомлення другові?', o: [['«Цілую» — звичне прощання між друзями.', true], ['«Дякую».', false], ['«Вибач».', false]] });
k.choice({ n: 7, role: 'delayed', fam: 'a106.r-open', t: [OCR], ins: 'Як звернутися до подруги Марти на початку листа?', o: [['Querido Marta:', false], ['Querida Marta:', true], ['Querida a Marta:', false]] });

// ======================= reading messages
const M1 = '¡Hola, Lucía! El sábado es mi cumpleaños. ¿Quieres cenar en mi casa a las nueve? Necesito tu ayuda: ¿puedes traer pan? Un abrazo, Carmen';
const M2 = 'Hola, Diego: Esta semana no puedo ir al gimnasio porque tengo exámenes. Pero el lunes que viene voy contigo. ¡Hasta pronto! Sergio';
const M3 = 'Querida Elena: Estoy en Valencia con mi familia. Me gusta mucho la ciudad, pero hace mucho calor. Mañana vamos a la playa. Besos, Raquel';
const M4 = 'Hola, Jorge: ¿Quieres ir al cine el viernes? Hay una película española a las ocho. Después podemos cenar. ¿Qué prefieres, pizza o tapas? Laura';
const rm = (n: number, role: 'independent' | 'delayed', fam: string, text: string, q: string, o: Array<[string, boolean]>, gloss?: string): string =>
  k.choice({ n, role, fam, t: [RM], ins: `Прочитай повідомлення. ${q}`, p: [text], o, ...(gloss ? { tr: gloss } : {}) });
rm(11, 'independent', 'a106.m-birthday', M1, 'Чого хоче Кармен?', [['Запросити Лусію на вечерю в день народження.', true], ['Попросити Лусію прийти о дев’ятій ранку.', false], ['Розповісти про свої плани на неділю.', false]], 'Слова: ayuda — допомога; ¿puedes traer…? — «можеш принести…?»');
rm(12, 'independent', 'a106.m-birthday', M1, 'Що Кармен просить принести?', [['Хліб.', true], ['Торт.', false], ['Нічого.', false]], 'Слова: ayuda — допомога; ¿puedes traer…? — «можеш принести…?»');
rm(13, 'independent', 'a106.m-gym', M2, 'Чому Серхіо не йде цього тижня до спортзалу?', [['Бо в нього іспити.', true], ['Бо він хворий.', false], ['Бо спортзал зачинений.', false]], 'Слова: no puedo — «я не можу»; contigo — «з тобою».');
rm(14, 'independent', 'a106.m-gym', M2, 'Коли Серхіо піде до спортзалу з Дієго?', [['Наступного понеділка.', true], ['Сьогодні.', false], ['У суботу.', false]], 'Слова: no puedo — «я не можу»; contigo — «з тобою».');
rm(15, 'independent', 'a106.m-valencia', M3, 'Що Ракель думає про Валенсію?', [['Місто їй дуже подобається, але там дуже спекотно.', true], ['Місто їй не подобається.', false], ['Там холодно.', false]], 'Слова: hace calor — «спекотно».');
rm(16, 'independent', 'a106.m-valencia', M3, 'Що Ракель робить завтра?', [['Іде на пляж.', true], ['Повертається додому.', false], ['Іде в кіно.', false]], 'Слова: hace calor — «спекотно».');
rm(17, 'delayed', 'a106.m-cinema', M4, 'Що пропонує Лаура?', [['Піти в кіно в п’ятницю, а потім повечеряти.', true], ['Повечеряти в суботу.', false], ['Подивитися фільм удома.', false]], 'Слова: podemos — «ми можемо»; pizza — піца; tapas — тапас (невеликі закуски).');
rm(18, 'delayed', 'a106.m-cinema', M4, 'Що Лаура питає наприкінці?', [['Що Хорхе вибирає: піцу чи тапас.', true], ['О котрій фільм.', false], ['Чи любить Хорхе кіно.', false]], 'Слова: podemos — «ми можемо»; pizza — піца; tapas — тапас (невеликі закуски).');
k.choice({ n: 19, role: 'independent', fam: 'a106.m-birthday', t: [RMC], ins: `Прочитай повідомлення Кармен ще раз: «${M1}» Ти можеш прийти. Яка відповідь підходить?`, o: [['¡Claro! ¿A qué hora? Un abrazo.', false], ['¡Vale! Nos vemos el sábado a las nueve. Un abrazo.', true], ['Lo siento, el domingo trabajo.', false]] });
k.choice({ n: 20, role: 'delayed', fam: 'a106.m-cinema', t: [RMC], ins: `Прочитай повідомлення Лаури ще раз: «${M4}» Хорхе в п’ятницю працює до десятої вечора. Яка відповідь підходить?`, o: [['¡Genial! Prefiero pizza.', false], ['Lo siento, el viernes trabajo. ¿Y el sábado?', true], ['¿Cuándo es la película?', false]] });

// ======================= writing a message (rubric)
k.rubric({
  n: 21,
  role: 'supported',
  fam: 'a106.w-reply-invite',
  t: [WM],
  ins: `Прочитай повідомлення: «${M1}» Напиши Кармен відповідь 3–5 реченнями іспанською: погодься чи відмовся, поясни чому (porque) і попрощайся. Зразок — у підказці.`,
  crit: CRIT,
  exm: ['¡Hola, Carmen! ¡Muchas gracias! Sí, quiero cenar en tu casa el sábado porque me gusta mucho tu cocina. Necesito comprar pan, ¿vale? Un abrazo, Ana'],
});
k.rubric({
  n: 22,
  role: 'independent',
  fam: 'a106.w-plan',
  t: [WM],
  ins: 'Напиши другові повідомлення 3–5 реченнями іспанською про свої плани на вихідні: що ти робиш, що тобі подобається і чому (porque), і запроси його приєднатися.',
  crit: CRIT,
  exm: ['¡Hola, Pablo! El sábado voy a la playa con mi hermana porque me gusta mucho nadar. Por la noche cenamos en un restaurante. ¿Quieres ir con nosotras? ¡Hasta pronto! Marta'],
});
k.rubric({
  n: 23,
  role: 'transfer',
  fam: 'a106.w-neighbour-t',
  t: [WM],
  ins: 'Ти переїхав у нову квартиру. Напиши новій знайомій Ані повідомлення 3–5 реченнями іспанською: що тобі подобається в районі і чому (porque), що тобі потрібно (наприклад, знайти аптеку чи супермаркет) і запропонуй випити каву.',
  crit: CRIT,
  exm: ['Hola, Ana: Me gusta mucho mi piso nuevo porque está cerca del centro. Necesito un supermercado: ¿hay uno cerca de aquí? ¿Quieres tomar un café el domingo? Nos vemos. Un beso, Isabel'],
});

// ======================= listening: voice messages
const V1 = 'Hola, Marta, soy Pablo. ¿Quieres ir al teatro el jueves? Es a las ocho, en la plaza Mayor. ¡Hasta luego!';
const V2 = 'Hola, Luis. Mañana no voy a clase porque tengo una cita con el médico a las diez. Nos vemos el jueves.';
const v1 = k.clip({ id: 'clip.a1-06.message.teatro', kind: 'text', es: V1, uk: 'Привіт, Марто, це Пабло. Хочеш піти в театр у четвер? О восьмій, на площі Майор. До зустрічі!', t: [LM], fam: 'a106.l-theatre' });
const v2 = k.clip({ id: 'clip.a1-06.message.medico', kind: 'text', es: V2, uk: 'Привіт, Луїсе. Завтра я не йду на заняття, бо в мене запис до лікаря о десятій. Побачимося в четвер.', t: [LM], fam: 'a106.l-doctor' });
k.choice({ n: 31, role: 'independent', fam: 'a106.l-theatre', t: [LM], clips: [v1], ins: 'Послухай голосове повідомлення. Навіщо телефонує Пабло і коли?', o: [['Запрошує в театр у четвер о восьмій.', true], ['Запрошує в кіно в п’ятницю.', false], ['Каже, що не прийде в театр.', false]], hints: [hTranscript([LM], V1)] });
k.choice({ n: 32, role: 'independent', fam: 'a106.l-doctor', t: [LM], clips: [v2], ins: 'Послухай голосове повідомлення. Чому людина завтра не йде на заняття?', o: [['Бо в неї запис до лікаря о десятій.', true], ['Бо вона працює.', false], ['Бо заняття скасоване.', false]], hints: [hTranscript([LM], V2)] });

k.material({
  id: 'material.a1-06.message',
  topic: 'A1-06-L6',
  title: 'Коротке особисте повідомлення',
  blocks: [
    ul('Початок: ¡Hola, Ana! / Hola, Ana: / Querido Pablo: / Querida Ana:', 'Головне: план, запрошення, вподобання; причина з porque', 'Кінець: Un abrazo / Besos / Un beso / ¡Hasta pronto! / Nos vemos.'),
    plink('Потренувати формули повідомлення', [OC], 'written', 6),
  ],
  linked: [OC, WM],
});

export default k.build({
  title: 'Коротке повідомлення другові',
  termEs: 'un mensaje personal',
  summary: 'Читаємо коротке повідомлення від друга, визначаємо, чого він хоче, вибираємо відповідь і пишемо власне повідомлення з привітанням, планом чи запрошенням, причиною й прощанням.',
  objectives: ['A1-06-O7', 'A1-06-O8'],
  cv: ['CV-01', 'CV-06'],
  situations: ['routine-study-leisure'],
  minutes: 18,
  introduces: ['formula.message-opening-closing', 'reading.personal-message', 'writing.personal-message', 'listening.message'],
  revisits: ['formula.greeting', 'formula.leave-taking', 'formula.invitation', 'link.porque', 'link.pero', 'time.plan.present-for-future', 'gustar.agreement', 'querer.infinitive', 'necesitar.noun', 'listening.preferences'],
  steps: [
    {
      kind: 'explanation',
      title: 'Як почати й закінчити повідомлення',
      blocks: [
        uk('Початок: ¡Hola, Ana! або Hola, Ana: — після звертання в іспанській часто ставлять двокрапку, і далі текст починаємо з великої літери: Hola, Ana: Mañana voy… Querido / Querida + ім’я — «дорогий / дорога» (узгоджуємо з адресатом).'),
        uk('Кінець: Un abrazo — «обіймаю», Besos / Un beso — «цілую» (між друзями в Іспанії це звично), ¡Hasta pronto! — «до скорого», Nos vemos — «побачимося».'),
        uk('Між ними — головне: що плануєш, що подобається, куди запрошуєш, і чому (porque).'),
        es('¡Hola, Marta! El domingo como con mis padres. ¿Quieres comer con nosotros? Besos, Ana'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком', tasks: [k.id(1)] },
    { kind: 'independent-practice', title: 'Формули самостійно', tasks: [k.id(6), k.id(2), k.id(3), k.id(4)] },
    { kind: 'reading', title: 'Читаємо повідомлення', blocks: [es(M1), es(M2), es(M3)], tasks: [k.id(11), k.id(12), k.id(19), k.id(13), k.id(14), k.id(15), k.id(16)] },
    { kind: 'writing', title: 'Пишемо повідомлення', tasks: [k.id(21), k.id(22)] },
    { kind: 'listening', title: 'Послухай голосові повідомлення', required: false, clips: [v1, v2], tasks: [k.id(31), k.id(32)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [ul('Привітання: ¡Hola, Ana! / Querida Ana:', 'Головне: план, запрошення, вподобання + porque.', 'Прощання: Un abrazo, Besos, ¡Hasta pronto!, Nos vemos.')],
    },
  ],
});
