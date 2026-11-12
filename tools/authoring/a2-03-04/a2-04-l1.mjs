// A2-04-L1 — regular -ar pretérito indefinido (A2-04-O1) and past time markers (A2-04-O1/O8).
// Verbs with a yo spelling change (-car/-gar/-zar) and stem-changing verbs are kept out of this
// lesson (they are A2-04-L3/L4 targets).
import { choice, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-04-L1';
const AR = ['indefinido.regular-ar', 'written-form'];
const PM = ['time.past-markers', 'reading-meaning'];

export const AR_TABLE = esTable(['sujeto', 'hablar', 'trabajar'], [
  ['yo', 'hablé', 'trabajé'],
  ['tú', 'hablaste', 'trabajaste'],
  ['él / ella / usted', 'habló', 'trabajó'],
  ['nosotros / nosotras', 'hablamos', 'trabajamos'],
  ['vosotros / vosotras', 'hablasteis', 'trabajasteis'],
  ['ellos / ellas / ustedes', 'hablaron', 'trabajaron'],
]);
const AR_RULE = 'Простий минулий час дієслів на -ar: -é, -aste, -ó, -amos, -asteis, -aron (hablé, hablaste, habló, hablamos, hablasteis, hablaron). У формах yo і él / ella / usted обов’язковий знак наголосу.';
const PM_RULE = 'Ayer — «учора», anteayer — «позавчора», anoche — «учора ввечері, минулої ночі», el lunes pasado — «минулого понеділка», la semana pasada — «минулого тижня», el mes pasado — «минулого місяця», el año pasado — «минулого року».';
const INSTR = 'Впишіть дієслово в дужках у простому минулому часі (pretérito indefinido).';

const ACCENT = (f) => `Майже: у цій формі обов’язковий знак наголосу — ${f}.`;
const PRESENT = (wrong, f) => `${wrong} — теперішній час. Ідеться про минуле: ${f}.`;

function gap(id, role, family, sentence, answer, errors, full, fullUk, extra = {}) {
  const prompt = [uk(extra.instr ?? (extra.model ? `${INSTR} Скористайтеся таблицею.` : INSTR))];
  if (extra.model) prompt.push(extra.model);
  prompt.push(es(sentence));
  return exact({
    id, lesson: L, role, family, target: AR, prompt, answers: [answer], closed: true, errors,
    rule: AR_RULE, clue: extra.clue, glosses: extra.glosses, full, fullUk,
    ok: `Правильно: ${answer}.`, bad: `Правильна форма — ${answer}: ${full}`,
  });
}

function marker(id, role, family, sentence, question, options, fullUk, extra = {}) {
  return choice({
    id, lesson: L, role, family, target: PM,
    prompt: [uk(extra.instr ?? 'Прочитайте речення і дайте відповідь.'), ...(extra.model ? [extra.model] : []), es(sentence), uk(question)],
    options, rule: PM_RULE, full: sentence, fullUk,
    ok: 'Правильно.', bad: `Ні. ${fullUk}`,
  });
}

const tasks = [
  gap('T01', 'supported', 'routine', 'Ayer (yo, trabajar) ___ en casa.', 'trabajé',
    [['trabaje', ACCENT('trabajé')], ['trabajo', PRESENT('Trabajo', 'trabajé')], ['trabajó', 'Trabajó — форма él / ella / usted. Для yo — trabajé.']],
    'Ayer trabajé en casa.', 'Учора я працював(-ла) вдома.', { model: AR_TABLE, clue: 'Підмет — yo; закінчення -é.' }),
  gap('T02', 'supported', 'leisure', 'Anoche mis amigos (bailar) ___ mucho.', 'bailaron',
    [['bailó', 'Bailó — для однієї особи. Mis amigos — «вони»: bailaron.'], ['bailan', PRESENT('Bailan', 'bailaron')]],
    'Anoche mis amigos bailaron mucho.', 'Учора ввечері мої друзі багато танцювали.', { model: AR_TABLE, clue: 'Mis amigos — «вони»; закінчення -aron.' }),
  gap('T03', 'independent', 'routine', 'Ayer (tú, cenar) ___ muy tarde.', 'cenaste',
    [['cenastes', 'Для tú — cenaste, без -s у кінці.'], ['cenó', 'Cenó — форма él / ella / usted. Для tú — cenaste.'], ['cenas', PRESENT('Cenas', 'cenaste')]],
    'Ayer cenaste muy tarde.', 'Учора ти вечеряв(-ла) дуже пізно.'),
  gap('T04', 'independent', 'shopping', 'El sábado pasado (nosotros, comprar) ___ fruta en el supermercado.', 'compramos',
    [['compremos', 'Для nosotros у простому минулому — compramos (так само, як у теперішньому часі).'], ['compraron', 'Compraron — для ellos / ellas / ustedes. Для nosotros — compramos.']],
    'El sábado pasado compramos fruta en el supermercado.', 'Минулої суботи ми купили фрукти в супермаркеті.'),
  gap('T05', 'independent', 'routine', 'Anteayer Ana (estudiar) ___ en casa de su amiga.', 'estudió',
    [['estudio', 'Без знака наголосу це інша форма (estudio — «я вчуся»). Для Ana в минулому — estudió.'], ['estudiaron', 'Estudiaron — для кількох осіб. Ana — «вона»: estudió.']],
    'Anteayer Ana estudió en casa de su amiga.', 'Позавчора Ана вчилася в подруги вдома.'),
  choice({
    id: 'T06', lesson: L, role: 'independent', family: 'leisure', target: AR,
    prompt: [uk('Оберіть правильну форму простого минулого часу.'), es('¿Vosotros ___ (viajar) a Sevilla el año pasado?')],
    options: [
      ['viajasteis', true],
      ['viajastes', false, 'Для vosotros — viajasteis (-asteis), а не *viajastes.'],
      ['viajaron', false, 'Viajaron — для ellos / ellas / ustedes. Для vosotros — viajasteis.'],
      ['viajáis', false, 'Viajáis — теперішній час. El año pasado — «минулого року»: viajasteis.'],
    ],
    rule: AR_RULE,
    full: '¿Vosotros viajasteis a Sevilla el año pasado?', fullUk: 'Ви їздили до Севільї минулого року?',
    ok: 'Правильно: vosotros viajasteis.', bad: 'Для vosotros у простому минулому — viajasteis.',
  }),
  gap('T07', 'delayed', 'routine', 'Ayer (yo, desayunar) ___ en un bar con Luis.', 'desayuné',
    [['desayune', ACCENT('desayuné')], ['desayuno', PRESENT('Desayuno', 'desayuné')]],
    'Ayer desayuné en un bar con Luis.', 'Учора я снідав(-ла) в барі з Луїсом.'),
  gap('T08', 'delayed', 'shopping', 'La semana pasada mis padres (comprar) ___ un coche nuevo.', 'compraron',
    [['compró', 'Compró — для однієї особи. Mis padres — «вони»: compraron.'], ['compran', PRESENT('Compran', 'compraron')]],
    'La semana pasada mis padres compraron un coche nuevo.', 'Минулого тижня мої батьки купили нову машину.'),
  gap('T09', 'transfer', 'messages', '¡Hola, Marta! ¿(tú, hablar) ___ ayer con Pedro?', 'hablaste',
    [['hablastes', 'Для tú — hablaste, без -s у кінці.'], ['habló', 'Habló — форма él / ella / usted. До Марти звертаються на tú: hablaste.'], ['hablas', PRESENT('Hablas', 'hablaste')]],
    '¡Hola, Marta! ¿Hablaste ayer con Pedro?', 'Привіт, Марто! Ти вчора говорила з Педро?', { instr: `Повідомлення. ${INSTR}` }),
  choice({
    id: 'T10', lesson: L, role: 'transfer', family: 'travel', target: AR,
    prompt: [uk('Оберіть правильну форму простого минулого часу.'), es('Anoche el tren ___ (llegar) muy tarde.')],
    options: [
      ['llegó', true],
      ['llego', false, 'Llego — «я приходжу», теперішній час. Знак наголосу змінює значення: llegó — «прибув».'],
      ['llegaron', false, 'Llegaron — для кількох. El tren — однина: llegó.'],
    ],
    rule: AR_RULE,
    full: 'Anoche el tren llegó muy tarde.', fullUk: 'Учора ввечері потяг прибув дуже пізно.',
    ok: 'Правильно: el tren llegó.', bad: 'Для él / ella (el tren) — llegó, зі знаком наголосу.',
  }),

  // ---------- time.past-markers ----------
  marker('T11', 'supported', 'days', 'Anteayer cené con Ana en un restaurante.', 'Коли автор вечеряв з Аною?',
    [['Позавчора.', true], ['Учора.', false, 'Учора — ayer. Anteayer — «позавчора».'], ['Завтра.', false, 'Cené — минулий час; anteayer — «позавчора».']],
    'Позавчора я вечеряв(-ла) з Аною в ресторані.', { instr: 'Прочитайте речення і дайте відповідь. Підказка нижче.', model: ex('ayer — anteayer', 'учора — позавчора') }),
  marker('T12', 'supported', 'periods', 'El año pasado trabajé en Valencia.', 'Коли автор працював у Валенсії?',
    [['Минулого року.', true], ['Цього року.', false, 'Цього року — este año. El año pasado — «минулого року».'], ['Наступного року.', false, 'Trabajé — минулий час; el año pasado — «минулого року».']],
    'Минулого року я працював(-ла) у Валенсії.', { instr: 'Прочитайте речення і дайте відповідь. Підказка нижче.', model: ex('el año pasado — la semana pasada', 'минулого року — минулого тижня') }),
  marker('T13', 'independent', 'days', 'Anoche Luis llegó a casa muy tarde.', 'Коли Луїс прийшов додому?',
    [['Учора ввечері або вночі.', true], ['Сьогодні вранці.', false], ['Учора вранці.', false]],
    'Учора ввечері Луїс прийшов додому дуже пізно.'),
  marker('T14', 'independent', 'periods', 'La semana pasada estudié mucho.', 'Коли автор багато вчився?',
    [['Минулого тижня.', true], ['Цього тижня.', false], ['Наступного тижня.', false]],
    'Минулого тижня я багато вчився(-лася).'),
  marker('T15', 'delayed', 'days', 'El lunes pasado mi hermana compró un móvil.', 'Коли сестра купила мобільний?',
    [['Минулого понеділка.', true], ['Наступного понеділка.', false], ['Щопонеділка.', false]],
    'Минулого понеділка моя сестра купила мобільний.'),
  marker('T16', 'transfer', 'messages', '¡Hola, Pedro! El mes pasado mis padres viajaron a Sevilla.', 'Коли батьки їздили до Севільї?',
    [['Минулого місяця.', true], ['Цього місяця.', false], ['Наступного місяця.', false]],
    'Привіт, Педро! Минулого місяця мої батьки їздили до Севільї.', { instr: 'Прочитайте повідомлення і дайте відповідь.' }),
];

const ids = (...n) => n.map((x) => `${L}-T${String(x).padStart(2, '0')}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Простий минулий час: дієслова на -ar',
    termEs: 'pretérito indefinido: verbos en -ar',
    summaryUk:
      'Pretérito indefinido розповідає про завершені події в минулому, яке вже відокремлене від «зараз»: ayer, anoche, la semana pasada. Закінчення дієслів на -ar і знак наголосу в hablé, habló.',
    objectives: ['A2-04-O1', 'A2-04-O8'],
    situations: ['routine-study-leisure', 'time-appointments-transport', 'food-shopping'],
    estimatedMinutes: 15,
    introduces: ['indefinido.regular-ar', 'time.past-markers'],
    revisits: ['present.regular-ar', 'present.regular-ar.plural', 'date.days-of-week', 'ortho.written-accent.familiar-words', 'perfecto.use-current-period'],
    steps: [
      step('s1', 'explanation', 'Новий минулий час', true, {
        blocks: [
          uk('Pretérito indefinido (в іспанських граматиках — також pretérito perfecto simple) — простий минулий час: одне слово замість двох. Ним розповідаємо про завершені події в минулому, яке вже відокремлене від «зараз»: учора, минулого тижня, у 2020 році.'),
          ex('Ayer trabajé en casa.', 'Учора я працював(-ла) вдома.'),
          ex('El año pasado mis padres viajaron a Sevilla.', 'Минулого року мої батьки їздили до Севільї.'),
          uk('Порівняйте з perfecto: Hoy he trabajado en casa (сьогоднішній день ще триває) — Ayer trabajé en casa (учорашній день уже минув). Детальніше порівнюємо в уроці 7.'),
        ],
      }),
      step('s2', 'explanation', 'Закінчення дієслів на -ar', true, {
        blocks: [
          AR_TABLE,
          uk('У формах yo і él / ella / usted обов’язковий знак наголосу: hablé, habló. Він змінює значення: hablo — «я говорю», habló — «він (вона) говорив(-ла)».'),
          uk('Для tú — hablaste, без -s у кінці; для vosotros — hablasteis (не *hablastes).'),
          uk('Форма nosotros (hablamos, trabajamos) така сама, як у теперішньому часі: час видно з контексту — Ayer hablamos con Ana.'),
        ],
      }),
      step('s3', 'explanation', 'Слова минулого часу', true, {
        blocks: [
          ex('ayer', 'учора'),
          ex('anteayer', 'позавчора'),
          ex('anoche', 'учора ввечері, минулої ночі'),
          ex('el lunes pasado', 'минулого понеділка'),
          ex('la semana pasada', 'минулого тижня'),
          ex('el mes pasado', 'минулого місяця'),
          ex('el año pasado', 'минулого року'),
          ex('en 2020', 'у 2020 році'),
          uk('Pasado узгоджується з іменником: el año pasado, la semana pasada.'),
        ],
      }),
      step('s4', 'examples', 'Приклади', true, {
        blocks: [
          ex('Ayer cené con mis padres.', 'Учора я вечеряв(-ла) з батьками.'),
          ex('¿Hablaste con Ana anoche?', 'Ти говорив(-ла) з Аною вчора ввечері?'),
          ex('La semana pasada Luis trabajó mucho.', 'Минулого тижня Луїс багато працював.'),
          ex('El sábado pasado compramos fruta y pan.', 'Минулої суботи ми купили фрукти й хліб.'),
          ex('¿Viajasteis a Madrid el año pasado?', 'Ви їздили до Мадрида минулого року?'),
          ex('Anoche mis amigos bailaron mucho.', 'Учора ввечері мої друзі багато танцювали.'),
        ],
      }),
      step('s5', 'supported-practice', 'Практика з підказкою', true, { taskIds: ids(1, 2, 11, 12) }),
      step('s6', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(3, 4, 5, 6, 13, 14) }),
      step('s7', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            '-ar: -é, -aste, -ó, -amos, -asteis, -aron.',
            'Знак наголосу: hablé, habló (hablo — теперішній час).',
            'Tú — hablaste (без -s), vosotros — hablasteis.',
            'Hablamos — і теперішній, і минулий: дивіться на контекст.',
            'Ayer, anteayer, anoche, el … pasado / la … pasada — минуле, відокремлене від «зараз».',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
