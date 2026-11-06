// A2-03-L1 — the compound pattern and present haber (objective A2-03-O1).
// Participles are given in every prompt (they are taught in L2) and glossed in a hint, so the tasks
// isolate the auxiliary. Time context is limited to `hoy`; uses of the tense are taught in L6.
import { choice, es, esTable, ex, exact, key, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-03-L1';
const HF = ['perfecto.haber-forms', 'written-form'];
const HH_W = ['perfecto.haber-vs-hay', 'written-form'];
const HH_C = ['perfecto.haber-vs-hay', 'context-choice'];

const HABER_RULE =
  'Haber у теперішньому часі: yo he, tú has, él / ella / usted ha, nosotros / nosotras hemos, vosotros / vosotras habéis, ellos / ellas / ustedes han.';
const HAY_RULE =
  'Hay означає «є, існує»: Hay pan en casa. У складеному минулому часі після підмета йде форма haber (he, has, ha…) і дієприкметник: Ana ha comprado pan. Перед дієприкметником hay не вживаємо.';

export const HABER_TABLE = esTable(
  ['sujeto', 'haber', 'ejemplo'],
  [
    ['yo', 'he', 'he comido'],
    ['tú', 'has', 'has comido'],
    ['él / ella / usted', 'ha', 'ha comido'],
    ['nosotros / nosotras', 'hemos', 'hemos comido'],
    ['vosotros / vosotras', 'habéis', 'habéis comido'],
    ['ellos / ellas / ustedes', 'han', 'han comido'],
  ],
);

const GAP = 'Впишіть пропущену форму дієслова haber.';
const H_SPELL = (form) => `Майже: форму ${form} пишемо з h. H не вимовляється, але на письмі обов’язкова.`;
const HAY_NOT = (form) => `Hay означає «є, існує». У складеному минулому часі потрібне допоміжне дієслово: ${form}.`;
const gloss = (participle, infinitive, meaning) => `${participle} — дієприкметник від ${infinitive} (${meaning}). Утворення дієприкметників — в уроці 2.`;

const tasks = [
  // ---------- perfecto.haber-forms ----------
  exact({
    id: 'T01', lesson: L, role: 'supported', family: 'home', target: HF,
    prompt: [uk(`${GAP} Зразок нижче.`), ex('Yo he comido en casa.', 'Я поїв(-ла) вдома.'), es('Ana ___ comido en casa.')],
    answers: ['ha'], closed: true,
    errors: [
      ['a', H_SPELL('ha')],
      ['has', 'Has — для tú. Ana — це «вона», тож потрібна форма 3-ї особи однини: ha.'],
      ['he', 'He — для yo. Для Ana (вона) — ha.'],
      ['hay', HAY_NOT('ha')],
    ],
    rule: HABER_RULE, clue: 'Ana — це «вона», 3-тя особа однини.',
    glosses: [gloss('comido', 'comer', 'їсти')],
    full: 'Ana ha comido en casa.', fullUk: 'Ана поїла вдома.',
    ok: 'Правильно: Ana ha comido en casa.', bad: 'Для Ana (вона) потрібна форма ha: Ana ha comido en casa.',
  }),
  exact({
    id: 'T02', lesson: L, role: 'supported', family: 'work-study', target: HF,
    prompt: [uk(`${GAP} Скористайтеся таблицею.`), HABER_TABLE, es('Hoy nosotros ___ trabajado mucho.')],
    answers: ['hemos'], closed: true,
    errors: [
      ['habemos', 'У складеному минулому часі для nosotros уживаємо hemos; форма habemos тут ненормативна.'],
      ['emos', H_SPELL('hemos')],
      ['han', 'Han — для ellos / ellas / ustedes. Для nosotros — hemos.'],
      ['hay', HAY_NOT('hemos')],
    ],
    rule: HABER_RULE, clue: 'Підмет — nosotros (ми).',
    glosses: [gloss('trabajado', 'trabajar', 'працювати')],
    full: 'Hoy nosotros hemos trabajado mucho.', fullUk: 'Сьогодні ми багато працювали.',
    ok: 'Правильно: nosotros hemos trabajado.', bad: 'Для nosotros потрібна форма hemos: Hoy nosotros hemos trabajado mucho.',
  }),
  exact({
    id: 'T03', lesson: L, role: 'independent', family: 'home', target: HF,
    prompt: [uk(GAP), es('Hoy (tú) ___ desayunado muy tarde.')],
    answers: ['has'], closed: true,
    errors: [
      ['as', H_SPELL('has')],
      ['ha', 'Ha — для él / ella / usted. Для tú — has.'],
      ['he', 'He — для yo. Для tú — has.'],
    ],
    rule: HABER_RULE, clue: 'Підмет — tú (ти).',
    glosses: [gloss('desayunado', 'desayunar', 'снідати')],
    full: 'Hoy has desayunado muy tarde.', fullUk: 'Сьогодні ти снідав(-ла) дуже пізно.',
    ok: 'Правильно: tú has desayunado.', bad: 'Для tú потрібна форма has: Hoy has desayunado muy tarde.',
  }),
  exact({
    id: 'T04', lesson: L, role: 'independent', family: 'work-study', target: HF,
    prompt: [uk(GAP), es('Hoy vosotros ___ estudiado mucho.')],
    answers: ['habéis'], closed: true,
    errors: [
      ['habeis', 'Майже: habéis пишемо зі знаком наголосу на é.'],
      ['han', 'Han — для ellos / ellas / ustedes. Для vosotros — habéis.'],
      ['hemos', 'Hemos — для nosotros. Для vosotros — habéis.'],
    ],
    rule: HABER_RULE, clue: 'Підмет — vosotros (ви — до кількох знайомих людей).',
    glosses: [gloss('estudiado', 'estudiar', 'вчитися')],
    full: 'Hoy vosotros habéis estudiado mucho.', fullUk: 'Сьогодні ви багато вчилися.',
    ok: 'Правильно: vosotros habéis estudiado.', bad: 'Для vosotros потрібна форма habéis (зі знаком наголосу): Hoy vosotros habéis estudiado mucho.',
  }),
  exact({
    id: 'T05', lesson: L, role: 'independent', family: 'home', target: HF,
    prompt: [uk(GAP), es('Hoy mis padres ___ cenado en un restaurante.')],
    answers: ['han'], closed: true,
    errors: [
      ['an', H_SPELL('han')],
      ['ha', 'Ha — для однини. Mis padres — це «вони», тож han.'],
      ['hay', HAY_NOT('han')],
    ],
    rule: HABER_RULE, clue: 'Mis padres — це «вони», 3-тя особа множини.',
    glosses: [gloss('cenado', 'cenar', 'вечеряти')],
    full: 'Hoy mis padres han cenado en un restaurante.', fullUk: 'Сьогодні мої батьки вечеряли в ресторані.',
    ok: 'Правильно: mis padres han cenado.', bad: 'Для mis padres (вони) потрібна форма han: Hoy mis padres han cenado en un restaurante.',
  }),
  choice({
    id: 'T06', lesson: L, role: 'independent', family: 'work-study', target: HF,
    prompt: [uk('Оберіть правильну форму haber.'), es('Señora García, ¿usted ___ hablado hoy con el profesor?')],
    options: [
      ['ha', true],
      ['has', false, 'Has — для tú. З usted уживаємо форму 3-ї особи однини: ha.'],
      ['he', false, 'He — для yo. З usted — ha.'],
      ['han', false, 'Han — для ustedes (кількох осіб). Тут одна особа: usted ha.'],
    ],
    rule: HABER_RULE, clue: 'Usted уживає ту саму форму, що й él / ella.',
    glosses: [gloss('hablado', 'hablar', 'говорити')],
    full: 'Señora García, ¿usted ha hablado hoy con el profesor?', fullUk: 'Пані Гарсія, ви сьогодні говорили з викладачем?',
    ok: 'Правильно: usted ha hablado.', bad: 'З usted уживаємо форму 3-ї особи однини: usted ha hablado.',
  }),
  exact({
    id: 'T07', lesson: L, role: 'delayed', family: 'home', target: HF,
    prompt: [uk(GAP), es('Hoy (yo) ___ comprado pan y fruta.')],
    answers: ['he'], closed: true,
    errors: [
      ['e', H_SPELL('he')],
      ['ha', 'Ha — для él / ella / usted. Для yo — he.'],
      ['hay', HAY_NOT('he')],
    ],
    rule: HABER_RULE, clue: 'Підмет — yo (я).',
    glosses: [gloss('comprado', 'comprar', 'купувати')],
    full: 'Hoy he comprado pan y fruta.', fullUk: 'Сьогодні я купив(-ла) хліб і фрукти.',
    ok: 'Правильно: yo he comprado.', bad: 'Для yo потрібна форма he: Hoy he comprado pan y fruta.',
  }),
  choice({
    id: 'T08', lesson: L, role: 'delayed', family: 'work-study', target: HF,
    prompt: [uk('Оберіть правильну форму haber.'), es('¿Ustedes ___ comido hoy en la oficina?')],
    options: [
      ['han', true],
      ['habéis', false, 'Habéis — для vosotros. Ustedes уживає форму 3-ї особи множини: han.'],
      ['ha', false, 'Ha — для однини. Ustedes — han.'],
      ['hemos', false, 'Hemos — для nosotros. Ustedes — han.'],
    ],
    rule: HABER_RULE, clue: 'Ustedes уживає ту саму форму, що й ellos / ellas.',
    glosses: [gloss('comido', 'comer', 'їсти; обідати')],
    full: '¿Ustedes han comido hoy en la oficina?', fullUk: 'Ви сьогодні обідали в офісі? (ввічливо, до кількох осіб)',
    ok: 'Правильно: ustedes han comido.', bad: 'З ustedes уживаємо форму 3-ї особи множини: ustedes han comido.',
  }),
  exact({
    id: 'T09', lesson: L, role: 'transfer', family: 'messages', target: HF,
    prompt: [uk(`Повідомлення від подруги. ${GAP}`), es('Hola, Pedro: ¿___ (tú) recibido mi mensaje?')],
    answers: ['has'], closed: true,
    errors: [
      ['as', H_SPELL('has')],
      ['ha', 'Ha — для él / ella / usted. Подруга звертається до Педро на tú: has.'],
      ['he', 'He — для yo. Для tú — has.'],
    ],
    rule: HABER_RULE, clue: 'Підмет — tú (ти).',
    glosses: [gloss('recibido', 'recibir', 'отримувати')],
    full: 'Hola, Pedro: ¿has recibido mi mensaje?', fullUk: 'Привіт, Педро! Ти отримав моє повідомлення?',
    ok: 'Правильно: ¿has recibido…?', bad: 'Для tú потрібна форма has: ¿Has recibido mi mensaje?',
  }),
  exact({
    id: 'T10', lesson: L, role: 'transfer', family: 'messages', target: HF,
    prompt: [uk(`Повідомлення другові. ${GAP}`), es('Hola, Luis: hoy Marta y yo ___ comido con tus padres.')],
    answers: ['hemos'], closed: true,
    errors: [
      ['han', 'Marta y yo — це «ми» (nosotros), тож hemos.'],
      ['ha', 'Підмет — Marta y yo (ми), а не одна особа: hemos.'],
      ['he', 'He — для yo. Marta y yo — це «ми»: hemos.'],
      ['habemos', 'У складеному минулому часі для nosotros уживаємо hemos; форма habemos тут ненормативна.'],
      ['emos', H_SPELL('hemos')],
    ],
    rule: HABER_RULE, clue: 'Marta y yo — це «ми» (nosotros).',
    glosses: [gloss('comido', 'comer', 'їсти; обідати')],
    full: 'Hola, Luis: hoy Marta y yo hemos comido con tus padres.', fullUk: 'Привіт, Луїсе! Сьогодні ми з Мартою обідали з твоїми батьками.',
    ok: 'Правильно: Marta y yo (ми) hemos comido.', bad: 'Marta y yo — це «ми», тому потрібна форма hemos: Marta y yo hemos comido.',
  }),

  // ---------- perfecto.haber-vs-hay: written form ----------
  exact({
    id: 'T11', lesson: L, role: 'supported', family: 'home', target: HH_W,
    prompt: [
      uk('Впишіть hay або потрібну форму haber (he, has, ha…). Зразки нижче.'),
      ex('Hay un perro en el parque.', 'У парку є собака.'),
      ex('Ana ha comprado pan.', 'Ана купила хліб.'),
      es('En mi calle ___ una farmacia.'),
    ],
    answers: ['hay'], closed: true,
    errors: [
      ['ha', 'Тут ідеться про те, що аптека є (існує), і після пропуску немає дієприкметника → hay.'],
      ['hai', 'Hay пишемо з y в кінці.'],
    ],
    rule: HAY_RULE, clue: 'Чи стоїть після пропуску дієприкметник? Ні — і йдеться про те, що щось є.',
    full: 'En mi calle hay una farmacia.', fullUk: 'На моїй вулиці є аптека.',
    ok: 'Правильно: hay — «є».', bad: 'Ідеться про те, що аптека є на вулиці: En mi calle hay una farmacia.',
  }),
  exact({
    id: 'T12', lesson: L, role: 'supported', family: 'work-study', target: HH_W,
    prompt: [
      uk('Впишіть hay або потрібну форму haber (he, has, ha…). Зразки нижче.'),
      ex('Hay un perro en el parque.', 'У парку є собака.'),
      ex('Ana ha comprado pan.', 'Ана купила хліб.'),
      es('Hoy el profesor ___ hablado con mis padres.'),
    ],
    answers: ['ha'], closed: true,
    errors: [
      ['hay', 'Після пропуску стоїть дієприкметник hablado — потрібне допоміжне ha, а не hay.'],
      ['a', H_SPELL('ha')],
    ],
    rule: HAY_RULE, clue: 'Після пропуску — дієприкметник hablado.',
    glosses: [gloss('hablado', 'hablar', 'говорити')],
    full: 'Hoy el profesor ha hablado con mis padres.', fullUk: 'Сьогодні викладач говорив із моїми батьками.',
    ok: 'Правильно: el profesor ha hablado.', bad: 'Перед дієприкметником hablado потрібне допоміжне ha: el profesor ha hablado.',
  }),
  exact({
    id: 'T13', lesson: L, role: 'independent', family: 'home', target: HH_W,
    prompt: [uk('Впишіть hay або потрібну форму haber.'), es('En la nevera no ___ leche.')],
    answers: ['hay'], closed: true,
    errors: [
      ['ha', 'Тут ідеться про те, чи є молоко в холодильнику; дієприкметника немає → hay.'],
      ['hai', 'Hay пишемо з y в кінці.'],
    ],
    rule: HAY_RULE, clue: 'Ідеться про наявність: чи є молоко.',
    full: 'En la nevera no hay leche.', fullUk: 'У холодильнику немає молока.',
    ok: 'Правильно: no hay — «немає».', bad: 'Ідеться про наявність молока: En la nevera no hay leche.',
  }),
  exact({
    id: 'T14', lesson: L, role: 'independent', family: 'work-study', target: HH_W,
    prompt: [uk('Впишіть hay або потрібну форму haber.'), es('Hoy mi hermana ___ trabajado en casa.')],
    answers: ['ha'], closed: true,
    errors: [
      ['hay', 'Після пропуску — дієприкметник trabajado, тож потрібне допоміжне ha.'],
      ['a', H_SPELL('ha')],
    ],
    rule: HAY_RULE, clue: 'Після пропуску — дієприкметник trabajado; підмет — mi hermana (вона).',
    glosses: [gloss('trabajado', 'trabajar', 'працювати')],
    full: 'Hoy mi hermana ha trabajado en casa.', fullUk: 'Сьогодні моя сестра працювала вдома.',
    ok: 'Правильно: mi hermana ha trabajado.', bad: 'Перед дієприкметником trabajado потрібне ha: Hoy mi hermana ha trabajado en casa.',
  }),
  exact({
    id: 'T15', lesson: L, role: 'delayed', family: 'home', target: HH_W,
    prompt: [uk('Впишіть hay або потрібну форму haber.'), es('¿___ un supermercado cerca de aquí?')],
    answers: ['hay'], closed: true,
    errors: [
      ['ha', 'Питаємо, чи є поблизу супермаркет; дієприкметника немає → hay.'],
      ['hai', 'Hay пишемо з y в кінці.'],
    ],
    rule: HAY_RULE, clue: 'Питаємо, чи існує щось поблизу.',
    full: '¿Hay un supermercado cerca de aquí?', fullUk: 'Тут поблизу є супермаркет?',
    ok: 'Правильно: ¿Hay…? — «Чи є…?»', bad: 'Питаємо про наявність: ¿Hay un supermercado cerca de aquí?',
  }),
  exact({
    id: 'T16', lesson: L, role: 'transfer', family: 'shopping', target: HH_W,
    prompt: [uk('Впишіть hay або потрібну форму haber.'), es('Hoy mi madre ___ comprado fruta en el supermercado.')],
    answers: ['ha'], closed: true,
    errors: [
      ['hay', 'Після пропуску — дієприкметник comprado, тож потрібне допоміжне ha.'],
      ['a', H_SPELL('ha')],
    ],
    rule: HAY_RULE, clue: 'Після пропуску — дієприкметник comprado; підмет — mi madre (вона).',
    glosses: [gloss('comprado', 'comprar', 'купувати')],
    full: 'Hoy mi madre ha comprado fruta en el supermercado.', fullUk: 'Сьогодні моя мама купила фрукти в супермаркеті.',
    ok: 'Правильно: mi madre ha comprado.', bad: 'Перед дієприкметником comprado потрібне ha: Hoy mi madre ha comprado fruta.',
  }),

  // ---------- perfecto.haber-vs-hay: choice in context ----------
  choice({
    id: 'T17', lesson: L, role: 'independent', family: 'home', target: HH_C,
    prompt: [uk('Оберіть слово, яке підходить.'), es('En el parque ___ muchos niños.')],
    options: [
      ['hay', true],
      ['han', false, 'Han — допоміжне дієслово, після нього потрібен дієприкметник. Тут ідеться про те, що в парку є діти → hay.'],
    ],
    rule: HAY_RULE, clue: 'Чи є після пропуску дієприкметник?',
    full: 'En el parque hay muchos niños.', fullUk: 'У парку багато дітей.',
    ok: 'Правильно: hay — «є».', bad: 'Ідеться про те, що діти є в парку: En el parque hay muchos niños.',
  }),
  choice({
    id: 'T18', lesson: L, role: 'independent', family: 'work-study', target: HH_C,
    prompt: [uk('Оберіть слово, яке підходить.'), es('Hoy los estudiantes ___ llegado tarde.')],
    options: [
      ['han', true],
      ['hay', false, 'Після пропуску — дієприкметник llegado: потрібне допоміжне han.'],
    ],
    rule: HAY_RULE, clue: 'Після пропуску — дієприкметник llegado.',
    glosses: [gloss('llegado', 'llegar', 'прибувати, приходити')],
    full: 'Hoy los estudiantes han llegado tarde.', fullUk: 'Сьогодні студенти прийшли пізно.',
    ok: 'Правильно: los estudiantes han llegado.', bad: 'Перед дієприкметником llegado потрібне han: los estudiantes han llegado.',
  }),
  choice({
    id: 'T19', lesson: L, role: 'delayed', family: 'home', target: HH_C,
    prompt: [uk('Оберіть слово, яке підходить.'), es('¿Qué ___ en tu mochila?')],
    options: [
      ['hay', true],
      ['ha', false, 'Ha — допоміжне дієслово складеного часу. Питаємо, що є в рюкзаку → hay.'],
    ],
    rule: HAY_RULE, clue: 'Питаємо, що є в рюкзаку.',
    full: '¿Qué hay en tu mochila?', fullUk: 'Що в тебе в рюкзаку?',
    ok: 'Правильно: ¿Qué hay…? — «Що є…?»', bad: 'Питаємо про наявність: ¿Qué hay en tu mochila?',
  }),
  choice({
    id: 'T20', lesson: L, role: 'transfer', family: 'shopping', target: HH_C,
    prompt: [uk('Оберіть слово, яке підходить.'), es('Hoy Ana ___ comprado un regalo.')],
    options: [
      ['ha', true],
      ['hay', false, 'Після пропуску — дієприкметник comprado: потрібне допоміжне ha.'],
    ],
    rule: HAY_RULE, clue: 'Після пропуску — дієприкметник comprado.',
    glosses: [gloss('comprado', 'comprar', 'купувати')],
    full: 'Hoy Ana ha comprado un regalo.', fullUk: 'Сьогодні Ана купила подарунок.',
    ok: 'Правильно: Ana ha comprado.', bad: 'Перед дієприкметником comprado потрібне ha: Hoy Ana ha comprado un regalo.',
  }),
];

const ids = (...n) => n.map((x) => `${L}-T${String(x).padStart(2, '0')}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Складений минулий час: допоміжне дієслово haber',
    termEs: 'pretérito perfecto compuesto: presente de haber',
    summaryUk:
      'Як побудований pretérito perfecto compuesto (haber + дієприкметник) і які форми має haber у теперішньому часі: he, has, ha, hemos, habéis, han. Чим допоміжне ha відрізняється від знайомого hay.',
    objectives: ['A2-03-O1'],
    situations: ['routine-study-leisure', 'people-family-home'],
    estimatedMinutes: 12,
    introduces: ['perfecto.haber-forms', 'perfecto.haber-vs-hay'],
    revisits: ['hay.existence', 'pron.person-mapping', 'pron.vosotros-ustedes', 'pron.tu-usted'],
    steps: [
      step('s1', 'explanation', 'Минулий час із двох слів', true, {
        blocks: [
          uk('Pretérito perfecto compuesto (далі — perfecto) — складений минулий час. Він має дві частини: дієслово haber у теперішньому часі + дієприкметник основного дієслова.'),
          ex('He comido.', 'Я поїв(-ла).'),
          ex('Ana ha trabajado.', 'Ана попрацювала.'),
          uk('Особу показує лише haber. Дієприкметник (comido, trabajado) однаковий в усіх особах. Як утворювати дієприкметники, вчимо в уроці 2, а в цьому уроці вони вже готові.'),
          uk('Коли доречний саме цей час, розберемо в уроці 6. Поки що всі приклади — про те, що відбулося сьогодні (hoy).'),
        ],
      }),
      step('s2', 'explanation', 'Форми haber', true, {
        blocks: [
          HABER_TABLE,
          uk('H у haber не вимовляється: ha звучить як a, he — як e, han — як an. На письмі h обов’язкова: ha comido, he comido, han comido.'),
          uk('Для vosotros — habéis, зі знаком наголосу на é. Usted уживає ту саму форму, що й él / ella (usted ha comido), а ustedes — ту саму, що й ellos / ellas (ustedes han comido).'),
          uk('Для nosotros у цьому часі — тільки hemos.'),
        ],
      }),
      step('s3', 'explanation', 'Ha чи hay', true, {
        blocks: [
          uk('Hay вам уже знайоме: це безособова форма того самого дієслова haber, вона означає «є, існує».'),
          ex('Hay pan en casa.', 'Удома є хліб.'),
          uk('У складеному минулому часі hay не вживаємо. Після підмета йде форма haber для цієї особи і дієприкметник.'),
          ex('Ana ha comprado pan.', 'Ана купила хліб.'),
          uk('Підказка: якщо після пропуску стоїть дієприкметник (comprado, comido), потрібна форма he, has, ha…; якщо йдеться про те, що щось є, — hay.'),
        ],
      }),
      step('s4', 'examples', 'Приклади', true, {
        blocks: [
          ex('Hoy he trabajado en casa.', 'Сьогодні я працював(-ла) вдома.'),
          ex('¿Has comido?', 'Ти поїв(-ла)?'),
          ex('Hoy Ana ha estudiado mucho.', 'Сьогодні Ана багато вчилася.'),
          ex('Hoy Luis y yo hemos cenado en un restaurante.', 'Сьогодні ми з Луїсом вечеряли в ресторані.'),
          ex('¿Habéis desayunado?', 'Ви (усі) поснідали?'),
          ex('Hoy mis padres han llegado tarde.', 'Сьогодні мої батьки приїхали пізно.'),
          ex('¿Usted ha comido?', 'Ви (ввічливо) пообідали?'),
        ],
      }),
      step('s5', 'supported-practice', 'Практика зі зразком', true, { taskIds: ids(1, 2, 11, 12) }),
      step('s6', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(3, 4, 5, 6, 13, 14, 17, 18) }),
      step('s7', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'Perfecto = haber у теперішньому часі + дієприкметник: he comido, ha trabajado.',
            'Форми haber: he, has, ha, hemos, habéis, han.',
            'Usted → ha, ustedes → han; vosotros → habéis (зі знаком наголосу).',
            'H не вимовляється, але пишеться завжди.',
            'Hay означає «є»; у складеному часі його не вживаємо.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};

export const KEYS = { HF: key(...HF), HH_W: key(...HH_W), HH_C: key(...HH_C) };
