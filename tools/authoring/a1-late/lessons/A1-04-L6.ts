// A1-04-L6 — put the day together: sequence links (CV-04), a short routine text, listening and writing (O7).
import { Kit, S, combos, es, ex, hTranscript, plink, ul, uk } from '../lib.ts';
import type { SlotSpec } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-04-L6', RULES);

const LSC = 'link.sequence/context-choice';
const LSU = 'link.sequence/construction-use';
const LSR = 'link.sequence/reading-meaning';
const RR = 'reading.routine-text/reading-meaning';
const WR = 'writing.routine/construction-use';
const LR = 'listening.routine/listening-meaning';

const FIRST: SlotSpec['err'] = [
  ['después', '«Después» — «потім». Для першої дії — primero.'],
  ['luego', '«Luego» — «потім». Для першої дії — primero.'],
  ['por último', '«Por último» — «наостанок». Для першої дії — primero.'],
];
const THEN: SlotSpec['err'] = [['primero', '«Primero» — «спочатку». Для наступної дії — después або luego.']];
const LAST: SlotSpec['err'] = [['primero', '«Primero» — «спочатку». Для останньої дії — por último або al final.']];
const sFirst = (id: string): SlotSpec => ({ id, t: LSU, acc: ['primero'], err: FIRST });
const sThen = (id: string): SlotSpec => ({ id, t: LSU, acc: ['después', 'luego'], err: THEN });
const sLast = (id: string): SlotSpec => ({ id, t: LSU, acc: ['por último', 'al final'], err: LAST });
const sLater = (id: string): SlotSpec => ({ id, t: LSU, acc: ['más tarde'], err: THEN });

// ======================= sequence links
k.slots({
  n: 1,
  role: 'supported',
  fam: 'a104.morning',
  t: [LSU],
  ins: 'Перепиши речення повністю, вставивши слова послідовності: спочатку — душ, потім — сніданок. Зразок: Primero me levanto, después desayuno.',
  p: ['___ me ducho y ___ desayuno.'],
  tpl: [S('s1'), ' me ducho y ', S('s2'), ' desayuno.'],
  slots: [sFirst('s1'), sThen('s2')],
  tr: 'Спочатку я приймаю душ, а потім снідаю.',
});
k.slots({
  n: 2,
  role: 'supported',
  fam: 'a104.work',
  t: [LSU],
  ins: 'Перепиши речення повністю: спочатку — робота, потім — обід, наостанок — відпочинок. Зразок: Primero me levanto, después desayuno y por último voy al trabajo.',
  p: ['___ trabajo, ___ como y ___ descanso.'],
  tpl: [S('s1'), ' trabajo, ', S('s2'), ' como y ', S('s3'), ' descanso.'],
  slots: [sFirst('s1'), sThen('s2'), sLast('s3')],
  tr: 'Спочатку я працюю, потім обідаю, а наостанок відпочиваю.',
});
k.slots({
  n: 3,
  role: 'independent',
  fam: 'a104.home',
  t: [LSU],
  ins: 'Перепиши речення повністю: спочатку — покупки, потім — готування.',
  p: ['___ hago la compra y ___ cocino.'],
  tpl: [S('s1'), ' hago la compra y ', S('s2'), ' cocino.'],
  slots: [sFirst('s1'), sThen('s2')],
  tr: 'Спочатку я купую продукти, а потім готую.',
});
k.exact({
  n: 4,
  role: 'independent',
  fam: 'a104.morning',
  t: [LSU],
  ins: 'Переклади іспанською: «Спочатку я снідаю, потім іду на роботу».',
  acc: combos(['Primero ', 'Primero, '], ['desayuno y después ', 'desayuno y luego ', 'desayuno, después ', 'desayuno, luego '], ['voy al trabajo.']),
});
k.slots({
  n: 5,
  role: 'independent',
  fam: 'a104.home',
  t: [LSU],
  ins: 'Перепиши речення повністю, вставивши слово «пізніше».',
  p: ['Primero leo el periódico y ___ escucho música.'],
  tpl: ['Primero leo el periódico y ', S('s1'), ' escucho música.'],
  slots: [sLater('s1')],
  tr: 'Спочатку я читаю газету, а пізніше слухаю музику.',
});
k.exact({
  n: 6,
  role: 'independent',
  fam: 'a104.home',
  t: [LSU],
  ins: 'Переклади іспанською: «Наостанок я читаю книжку».',
  acc: ['Por último leo un libro.', 'Por último, leo un libro.', 'Al final leo un libro.', 'Al final, leo un libro.'],
  err: [['Primero leo un libro.', '«Primero» — «спочатку». «Наостанок» — por último або al final.']],
});
k.slots({
  n: 7,
  role: 'delayed',
  fam: 'a104.morning',
  t: [LSU],
  ins: 'Перепиши речення повністю: спочатку — встаю, потім — душ, наостанок — сніданок.',
  p: ['___ me levanto, ___ me ducho y ___ desayuno.'],
  tpl: [S('s1'), ' me levanto, ', S('s2'), ' me ducho y ', S('s3'), ' desayuno.'],
  slots: [sFirst('s1'), sThen('s2'), sLast('s3')],
  tr: 'Спочатку я встаю, потім приймаю душ, а наостанок снідаю.',
});
k.exact({
  n: 8,
  role: 'delayed',
  fam: 'a104.home',
  t: [LSU],
  ins: 'Переклади іспанською: «Спочатку ми купуємо продукти, потім готуємо».',
  acc: combos(['Primero ', 'Primero, '], ['hacemos la compra y después ', 'hacemos la compra y luego ', 'hacemos la compra, después ', 'hacemos la compra, luego '], ['cocinamos.']),
});
k.exact({
  n: 9,
  role: 'transfer',
  fam: 'a104.evening-plan',
  t: [LSU],
  ins: 'Переклади іспанською: «Спочатку я вивчаю іспанську, а потім іду в спортзал».',
  acc: combos(['Primero ', 'Primero, '], ['estudio español y después ', 'estudio español y luego ', 'estudio español, después ', 'estudio español, luego '], ['voy al gimnasio.']),
});
k.slots({
  n: 10,
  role: 'transfer',
  fam: 'a104.holiday',
  t: [LSU],
  ins: 'Перепиши речення повністю: у готелі спочатку — сніданок, потім — пляж.',
  p: ['En el hotel, ___ desayunamos y ___ vamos a la playa.'],
  tpl: ['En el hotel, ', S('s1'), ' desayunamos y ', S('s2'), ' vamos a la playa.'],
  slots: [sFirst('s1'), sThen('s2')],
  tr: 'У готелі ми спочатку снідаємо, а потім ідемо на пляж.',
});
k.choice({
  n: 11,
  role: 'independent',
  fam: 'a104.morning',
  t: [LSC],
  ins: 'Це перша дія ранку. Обери слово, яке підходить.',
  p: ['___ me levanto.'],
  o: [
    ['Por último', LSC, '«Por último» — для останньої дії.'],
    ['Primero', true],
    ['Después', LSC, '«Después» — для наступної дії, а це перша.'],
  ],
  tr: 'Спочатку я встаю.',
});
k.choice({
  n: 12,
  role: 'delayed',
  fam: 'a104.home',
  t: [LSC],
  ins: 'Це остання дія вечора. Обери слово, яке підходить.',
  p: ['___ escucho música.'],
  o: [
    ['Primero', LSC, '«Primero» — для першої дії.'],
    ['Por último', true],
  ],
  tr: 'Наостанок я слухаю музику.',
});
k.choice({
  n: 13,
  role: 'independent',
  fam: 'a104.study',
  t: [LSR],
  ins: 'Прочитай речення. Що Ана робить останнім?',
  p: ['Primero Ana desayuna, después va a la universidad y por último hace deporte.'],
  o: [
    ['Снідає.', false],
    ['Іде до університету.', false],
    ['Займається спортом.', true],
  ],
});

// ======================= reading: two routines in the lesson, one held-out text
const TEXT_A =
  'Me llamo Marta. Vivo en Valencia y trabajo en una oficina. Normalmente me levanto temprano. Primero me ducho, después desayuno en casa y luego voy al trabajo. Por la tarde estudio inglés. Los fines de semana descanso y a veces voy a la playa.';
const TEXT_B =
  'Javier es estudiante y vive con sus padres en Sevilla. Por la mañana va a la universidad. Come en casa con su familia. Por la tarde lee en el parque. Por la noche cena con sus padres y escucha música. Los sábados nunca se levanta temprano.';
const TEXT_C = 'Luis trabaja en un hotel por la noche. Llega a casa por la mañana, se ducha y desayuna. Por la tarde se levanta y hace la compra. Los domingos come con su madre.';
const readQ = (n: number, role: 'independent' | 'delayed' | 'transfer', fam: string, text: string, q: string, o: Array<[string, boolean]>): string =>
  k.choice({ n, role, fam, t: [RR], ins: `Прочитай текст. ${q}`, p: [text], o });
readQ(14, 'independent', 'a104.text-marta', TEXT_A, 'Де працює Марта?', [['У банку.', false], ['В офісі.', true], ['Удома.', false]]);
readQ(15, 'independent', 'a104.text-marta', TEXT_A, 'Що Марта робить одразу після душу?', [['Снідає вдома.', true], ['Іде на роботу.', false], ['Вивчає англійську.', false]]);
readQ(16, 'independent', 'a104.text-marta', TEXT_A, 'Як часто Марта ходить на пляж?', [['Щодня.', false], ['Іноді, на вихідних.', true], ['Ніколи.', false]]);
readQ(17, 'independent', 'a104.text-javier', TEXT_B, 'З ким живе Хав’єр?', [['З друзями.', false], ['Сам.', false], ['З батьками.', true]]);
readQ(18, 'independent', 'a104.text-javier', TEXT_B, 'Що Хав’єр робить зранку?', [['Іде до університету.', true], ['Читає в парку.', false], ['Слухає музику.', false]]);
readQ(19, 'independent', 'a104.text-javier', TEXT_B, 'Що правда про суботу?', [['Хав’єр встає рано.', false], ['Хав’єр ніколи не встає рано.', true], ['Хав’єр займається спортом.', false]]);
readQ(20, 'delayed', 'a104.text-luis', TEXT_C, 'Коли Луїс працює?', [['Зранку.', false], ['Після обіду.', false], ['Уночі.', true]]);
readQ(21, 'delayed', 'a104.text-luis', TEXT_C, 'Що Луїс робить щонеділі?', [['Обідає з мамою.', true], ['Працює в готелі.', false], ['Купує продукти.', false]]);

// ======================= listening: a short routine (≥2 distinct clips)
const SCRIPT_1 = 'Me llamo Carmen. Me levanto temprano y primero me ducho. Después desayuno y voy a la oficina. Por la tarde hago deporte.';
const SCRIPT_2 = 'Los sábados mi hermano y yo nos levantamos tarde. Primero desayunamos en casa, luego vamos al parque y por la noche cenamos con nuestros padres.';
const r1 = k.clip({
  id: 'clip.a1-04.routine.carmen',
  kind: 'text',
  es: SCRIPT_1,
  uk: 'Мене звати Кармен. Я встаю рано й спочатку приймаю душ. Потім снідаю та йду в офіс. Після обіду займаюся спортом.',
  t: [LR],
  fam: 'a104.l6.carmen',
});
const r2 = k.clip({
  id: 'clip.a1-04.routine.sabados',
  kind: 'text',
  es: SCRIPT_2,
  uk: 'Щосуботи ми з братом встаємо пізно. Спочатку снідаємо вдома, потім ідемо в парк, а ввечері вечеряємо з батьками.',
  t: [LR],
  fam: 'a104.l6.saturday',
});
const listenQ = (n: number, clip: string, script: string, fam: string, q: string, o: Array<[string, boolean]>): string =>
  k.choice({ n, role: 'independent', fam, t: [LR], clips: [clip], ins: `Послухай запис. ${q}`, o, hints: [hTranscript([LR], script)] });
listenQ(22, r1, SCRIPT_1, 'a104.l6.carmen', 'Про що розповідає Кармен?', [['Про свій звичайний день.', true], ['Про свої вихідні.', false], ['Про роботу брата.', false]]);
listenQ(23, r1, SCRIPT_1, 'a104.l6.carmen', 'Що Кармен робить після обіду?', [['Іде в офіс.', false], ['Займається спортом.', true], ['Снідає.', false]]);
listenQ(24, r2, SCRIPT_2, 'a104.l6.saturday', 'Коли брат і сестра встають пізно?', [['Щодня.', false], ['Щонеділі.', false], ['Щосуботи.', true]]);
listenQ(25, r2, SCRIPT_2, 'a104.l6.saturday', 'Що вони роблять увечері?', [['Вечеряють із батьками.', true], ['Ідуть у парк.', false], ['Снідають удома.', false]]);

// ======================= writing (rubric review)
const CRITERIA = [
  'Є 3–5 речень на тему завдання.',
  'Дієслова в теперішньому часі узгоджені з особою (yo trabajo, Ana trabaja).',
  'Є хоча б одне слово частотності (siempre, normalmente, a veces, nunca…).',
  'Є слова послідовності (primero, después, luego, por último).',
  'Відповідь може відрізнятися від прикладу: перевіряється зміст і вивчені форми, а не збіг зі зразком.',
];
k.rubric({
  n: 26,
  role: 'independent',
  fam: 'a104.write-me',
  t: [WR],
  ins: 'Напиши 3–5 речень іспанською про свій звичайний день: що ти робиш, як часто і в якій послідовності. Це вільне письмо: зразок у підказці — лише приклад.',
  crit: CRITERIA,
  exm: ['Normalmente me levanto temprano. Primero me ducho y después desayuno en casa. Luego voy al trabajo. Por la tarde estudio español. Los fines de semana a veces voy al cine.'],
});
k.rubric({
  n: 27,
  role: 'delayed',
  fam: 'a104.write-friend',
  t: [WR],
  ins: 'Напиши 3–4 речення іспанською про звичайний день свого друга чи подруги (він / вона): що він чи вона робить, як часто і в якій послідовності.',
  crit: [CRITERIA[0] ?? '', 'Дієслова у формі для él / ella (trabaja, se levanta).', CRITERIA[2] ?? '', CRITERIA[3] ?? '', CRITERIA[4] ?? ''],
  exm: ['Mi amiga Lucía vive en Madrid. Siempre se levanta temprano. Primero desayuna y después va a la universidad. Por la noche lee un libro.'],
});
k.rubric({
  n: 28,
  role: 'transfer',
  fam: 'a104.write-weekend',
  t: [WR],
  ins: 'Напиши 3–4 речення іспанською про свої звичайні вихідні: що ти робиш, як часто і в якій послідовності.',
  crit: CRITERIA,
  exm: ['Los sábados me levanto tarde. Primero desayuno con mi familia y luego voy al parque. A veces voy al cine con mis amigos. Los domingos descanso en casa.'],
});

k.material({
  id: 'material.a1-04.sequence',
  topic: 'A1-04-L6',
  title: 'Слова послідовності',
  blocks: [
    ul('primero — спочатку', 'después, luego — потім', 'más tarde — пізніше', 'por último, al final — наостанок, зрештою'),
    ex('Primero me levanto, después desayuno y luego voy al trabajo.', 'Спочатку я встаю, потім снідаю, а тоді йду на роботу.'),
    plink('Потренувати слова послідовності', [LSU, LSC], 'written', 8),
  ],
  linked: [LSU, LSC, LSR],
});

export default k.build({
  title: 'Мій день: читаємо й пишемо',
  termEs: 'la rutina diaria: primero, después, luego',
  summary: 'Складаємо день докупи: вчимо слова послідовності, читаємо й слухаємо короткі розповіді про звичайний день і пишемо кілька речень про свій.',
  objectives: ['A1-04-O7'],
  cv: ['CV-04', 'CV-06'],
  situations: ['routine-study-leisure'],
  minutes: 18,
  introduces: ['link.sequence', 'reading.routine-text', 'writing.routine', 'listening.routine'],
  revisits: [
    'present.regular-ar',
    'present.regular-er',
    'present.regular-ir',
    'present.ir',
    'present.hacer',
    'reflexive.pronouns',
    'reflexive.placement',
    'time.parts-of-day',
    'time.frequency.adverbs',
    'time.frequency.expressions',
    'neg.nunca',
    'prep.con.company',
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Спочатку, потім, наостанок',
      blocks: [
        uk('Щоб розповісти про дії по черзі, вживаємо слова послідовності: primero — «спочатку», después і luego — «потім», más tarde — «пізніше», por último і al final — «наостанок, зрештою».'),
        ex('Primero me levanto, después desayuno y luego voy al trabajo.', 'Спочатку я встаю, потім снідаю, а тоді йду на роботу.'),
        ex('Por la tarde estudio y más tarde ceno con mi familia.', 'Після обіду я вчуся, а пізніше вечеряю з сім’єю.'),
        ex('Por último leo un libro.', 'Наостанок я читаю книжку.'),
        uk('Después і luego в цьому значенні взаємозамінні; por último і al final — теж.'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком', tasks: [k.id(1), k.id(2)] },
    { kind: 'independent-practice', title: 'Самостійна практика', tasks: [k.id(11), k.id(3), k.id(4), k.id(13), k.id(5), k.id(6)] },
    { kind: 'reading', title: 'Читаємо: день Марти', blocks: [es(TEXT_A)], tasks: [k.id(14), k.id(15), k.id(16)] },
    { kind: 'reading', title: 'Читаємо: день Хав’єра', required: false, blocks: [es(TEXT_B)], tasks: [k.id(17), k.id(18), k.id(19)] },
    { kind: 'listening', title: 'Послухай: звичайний день', required: false, clips: [r1, r2], tasks: [k.id(22), k.id(23), k.id(24), k.id(25)] },
    { kind: 'writing', title: 'Напиши про свій день', tasks: [k.id(26)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Послідовність: primero → después / luego → más tarde → por último / al final.',
          'Опис дня = дії в теперішньому часі + частотність + послідовність.',
          'Вільне письмо перевіряється за змістом і вивченими формами, а не за збігом зі зразком.',
        ),
      ],
    },
  ],
});
