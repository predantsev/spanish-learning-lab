// A1-06-C1 — optional cumulative A1 check: delayed independent return to targets of A1-01…A1-06.
// Earlier blocks (A1-01…A1-03) are sampled with new recognition/choice items of its own (so other
// ranges' production banks are not changed); A1-04…A1-06 by referencing held-out tasks. Small
// resumable parts, no new teaching, no locks, not a proficiency certificate.
import { Kit, es, hTranscript, uk } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-06-C1', {
  ...RULES,
  'formula.greeting': 'Buenos días — до обіду, buenas tardes — після обіду до вечора, buenas noches — увечері та вночі.',
  'present.ser': 'Ser: soy, eres, es, somos, sois, son. Звідки людина — ser de: Somos de Ucrania.',
  'estar.location': 'Де щось знаходиться — estar: Madrid está en España.',
  'hay.existence': 'Чи є щось і що є — hay: Hay una farmacia cerca. Де конкретна річ — estar: La farmacia está aquí.',
  'article.definite': 'Означений артикль: el — чоловічий рід, la — жіночий: la casa, el libro.',
  'adj.agreement.o-a': 'Прикметник узгоджується з іменником у роді: una casa bonita, un piso bonito.',
  'tener.possession': 'Що в мене є — tener: tengo, tienes, tiene… Tengo dos hermanos.',
});

const GR = 'formula.greeting/reading-meaning';
const SE = 'present.ser/context-choice';
const EL = 'estar.location/context-choice';
const HY = 'hay.existence/context-choice';
const AD = 'article.definite/context-choice';
const AG = 'adj.agreement.o-a/context-choice';
const TE = 'tener.possession/context-choice';
const RM = 'reading.personal-message/reading-meaning';
const LM = 'listening.message/listening-meaning';
const WM = 'writing.personal-message/construction-use';

k.choice({ n: 1, role: 'transfer', fam: 'a106c.greeting', t: [GR], ins: 'Тобі о 16:00 пишуть «¡Buenas tardes!». Що це означає?', o: [['«Добрий день» (після обіду).', true], ['«Доброго ранку».', false], ['«На добраніч».', false]] });
k.choice({ n: 2, role: 'transfer', fam: 'a106c.origin', t: [SE], ins: 'Обери форму.', p: ['Nosotros ___ de Ucrania.'], o: [['somos', true], ['estamos', SE, 'Звідки людина — ser: somos de…'], ['son', SE, 'Son — для ellos / ellas / ustedes.']], tr: 'Ми з України.' });
k.choice({ n: 3, role: 'transfer', fam: 'a106c.location', t: [EL], ins: 'Обери форму.', p: ['Madrid ___ en el centro de España.'], o: [['es', EL, 'Де щось знаходиться — estar: está.'], ['está', true]], tr: 'Мадрид у центрі Іспанії.' });
k.choice({ n: 4, role: 'transfer', fam: 'a106c.pharmacy', t: [HY], ins: 'Ти питаєш, чи є поблизу аптека. Обери слово.', p: ['¿___ una farmacia cerca de aquí?'], o: [['Hay', true], ['Está', HY, 'Чи є щось — hay. Está — де конкретна річ.']] });
k.choice({ n: 5, role: 'transfer', fam: 'a106c.house', t: [AD], ins: 'Обери артикль.', p: ['___ casa de Ana es grande.'], o: [['El', AD, 'Casa — жіночого роду: la casa.'], ['La', true]] });
k.choice({ n: 6, role: 'transfer', fam: 'a106c.house', t: [AG], ins: 'Обери форму прикметника.', p: ['Tengo una casa ___.'], o: [['bonito', AG, 'Casa — жіночого роду: bonita.'], ['bonita', true]] });
k.choice({ n: 7, role: 'transfer', fam: 'a106c.family', t: [TE], ins: 'Обери форму.', p: ['Yo ___ dos hermanos.'], o: [['tengo', true], ['soy', TE, 'Що в мене є — tener: tengo.'], ['estoy', TE, 'Що в мене є — tener: tengo.']] });

const MSG = '¡Hola, Sofía! Soy Carlos. Estoy en Sevilla con mis padres. La ciudad es muy bonita y me gusta mucho la comida. Mañana vamos a un museo, pero el domingo descansamos en el hotel. ¿Quieres comer conmigo el lunes en Madrid? Un abrazo.';
k.choice({ n: 8, role: 'transfer', fam: 'a106c.m-sevilla', t: [RM], ins: 'Прочитай повідомлення. Де зараз Карлос?', p: [MSG], o: [['У Севільї з батьками.', true], ['У Мадриді.', false], ['У готелі в Мадриді.', false]], tr: 'Слова: comida — їжа; conmigo — «зі мною».' });
k.choice({ n: 9, role: 'transfer', fam: 'a106c.m-sevilla', t: [RM], ins: 'Прочитай повідомлення. Що Карлос пропонує Софії?', p: [MSG], o: [['Пообідати разом у понеділок у Мадриді.', true], ['Піти в музей у неділю.', false], ['Приїхати до Севільї.', false]], tr: 'Слова: comida — їжа; conmigo — «зі мною».' });

const VOICE = 'Hola, soy Ana. Esta tarde voy al supermercado. ¿Necesitas algo? ¡Hasta luego!';
const v = k.clip({ id: 'clip.a1-06.check.supermercado', kind: 'text', es: VOICE, uk: 'Привіт, це Ана. Сьогодні після обіду я йду в супермаркет. Тобі щось потрібно? До зустрічі!', t: [LM], fam: 'a106c.l-shop' });
k.choice({ n: 10, role: 'transfer', fam: 'a106c.l-shop', t: [LM], clips: [v], ins: 'Послухай голосове повідомлення. Навіщо телефонує Ана?', o: [['Вона йде в супермаркет і питає, чи тобі щось потрібно.', true], ['Вона запрошує тебе в кіно.', false], ['Вона каже, що супермаркет зачинений.', false]], hints: [hTranscript([LM], VOICE)] });

k.rubric({
  n: 11,
  role: 'transfer',
  fam: 'a106c.w-reply',
  t: [WM],
  ins: `Прочитай повідомлення Карлоса ще раз: «${MSG}» Напиши йому відповідь 3–5 реченнями іспанською: привітайся, відповідай на запрошення, поясни чому (porque) і попрощайся.`,
  crit: [
    'Є привітання і прощання.',
    'Є відповідь на запрошення (так чи ні) і причина з porque.',
    'Вивчені форми вжиті правильно.',
    'Відповідь може відрізнятися від прикладу: перевіряється зміст і вивчені форми; довжина — орієнтир.',
  ],
  exm: ['¡Hola, Carlos! ¡Qué bien! Sí, quiero comer contigo el lunes porque me gusta mucho la comida española. ¿A qué hora? Un abrazo, Sofía'],
});

const ref = (lesson: string, ...nums: number[]): string[] => nums.map((n) => `${lesson}-T${String(n).padStart(2, '0')}`);

export default k.build({
  kind: 'optional-check',
  title: 'Перевір себе: увесь рівень A1',
  termEs: 'repaso del nivel A1',
  summary:
    'Необов’язкова підсумкова перевірка рівня A1: коротко повертаємося до тем A1-01…A1-06 на нових прикладах, читаємо й слухаємо повідомлення та пишемо відповідь. Частини можна проходити окремо; кожна навичка отримує окремий результат. Це не сертифікат рівня і не замок для A2.',
  objectives: ['A1-06-O1', 'A1-06-O2', 'A1-06-O3', 'A1-06-O4', 'A1-06-O5', 'A1-06-O6', 'A1-06-O7', 'A1-06-O8'],
  situations: ['routine-study-leisure', 'food-shopping', 'time-appointments-transport'],
  minutes: 20,
  introduces: [],
  revisits: [
    'formula.greeting',
    'present.ser',
    'estar.location',
    'hay.existence',
    'article.definite',
    'adj.agreement.o-a',
    'tener.possession',
    'present.regular-ar',
    'present.regular-er',
    'present.ir',
    'reflexive.pronouns',
    'time.parts-of-day',
    'link.sequence',
    'number.0-15',
    'time.clock.hours',
    'date.el-lunes',
    'prep.spatial.place',
    'question.word.cual',
    'gustar.pronouns',
    'gustar.a-noun-le',
    'present.preferir',
    'necesitar.noun',
    'querer.noun',
    'time.plan.present-for-future',
    'link.porque',
    'neg.tambien-tampoco',
    'reading.personal-message',
    'listening.message',
    'writing.personal-message',
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Як працює перевірка',
      blocks: [
        uk('Це необов’язкова підсумкова перевірка без нових правил. Завдання — нові. Її поділено на невеликі частини: можна зупинитися після будь-якої й повернутися пізніше.'),
        uk('Кожна навичка отримує окремий результат, і після перевірки ти побачиш, що варто повторити. Це не сертифікат рівня: A2 відкритий незалежно від результату.'),
      ],
    },
    { kind: 'self-check', title: 'Частина 1. Основи: ser, estar, hay, tener, артиклі', tasks: [k.id(1), k.id(2), k.id(3), k.id(4), k.id(5), k.id(6), k.id(7)] },
    { kind: 'self-check', title: 'Частина 2. Дії та розпорядок дня', tasks: [...ref('A1-04-L1', 11), ...ref('A1-04-L2', 11), ...ref('A1-04-L3', 7), ...ref('A1-04-L4', 7), ...ref('A1-04-L5', 7), ...ref('A1-04-L6', 7)] },
    { kind: 'self-check', title: 'Частина 3. Числа, час, дати й місця', tasks: [...ref('A1-05-L1', 7), ...ref('A1-05-L3', 7), ...ref('A1-05-L4', 17), ...ref('A1-05-L5', 27), ...ref('A1-05-L6', 7)] },
    { kind: 'self-check', title: 'Частина 4. Вподобання, потреби, бажання й плани', tasks: [...ref('A1-06-L1', 7, 65), ...ref('A1-06-L2', 7), ...ref('A1-06-L3', 7), ...ref('A1-06-L4', 19, 46), ...ref('A1-06-L5', 37, 67)] },
    { kind: 'reading', title: 'Частина 5. Читаємо повідомлення', blocks: [es(MSG)], tasks: [k.id(8), k.id(9)] },
    { kind: 'listening', title: 'Частина 6. Слухаємо', required: false, clips: [v], tasks: [k.id(10)] },
    { kind: 'writing', title: 'Частина 7. Пишемо відповідь', required: false, tasks: [k.id(11)] },
  ],
});
