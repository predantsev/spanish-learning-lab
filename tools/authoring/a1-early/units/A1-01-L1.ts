// A1-01-L1 — letters and written marks: á é í ó ú, ñ, ü; keyboard entry; exercise instructions.
import { LOOSE, OPT, clue, es, ex, reveal, rule, tableUk, uk, ulUk } from '../lib.ts';
import type { Unit } from '../lib.ts';
import { U } from '../common.ts';

const AV_W = 'ortho.accented-vowels/written-form';
const AV_C = 'ortho.accented-vowels/context-choice';
const NT_W = 'ortho.n-tilde/written-form';
const NT_C = 'ortho.n-tilde/context-choice';
const UD_W = 'ortho.u-dieresis/written-form';
const UD_C = 'ortho.u-dieresis/context-choice';

const RULE_AV = 'Над голосною в іспанській буває лише один знак наголосу — ´ (нахил управо вгору): á, é, í, ó, ú. Знак — частина правильного написання, його не пропускають.';
const RULE_NT = 'Ñ — окрема літера іспанської абетки. Її не замінюють ні на n, ні на ny.';
const RULE_UD = 'У сполученнях gue і gui літера u не читається. Якщо u треба вимовити, над нею пишуть дві крапки: güe, güi.';

export const unit: Unit = {
  lesson: {
    id: 'A1-01-L1',
    titleUk: 'Літери та знаки: á, é, í, ó, ú, ñ, ü',
    termEs: 'letras y signos',
    summaryUk: 'Упізнаєш іспанські літери зі знаком наголосу, літери ñ та ü і навчишся вводити їх звичайною клавіатурою.',
    objectives: ['A1-01-O1', 'A1-01-O4'],
    cv: [],
    situations: [],
    estimatedMinutes: 10,
    skippableFoundation: true,
    introduces: ['text.exercise-instructions', 'ortho.keyboard-entry', 'ortho.accented-vowels', 'ortho.n-tilde', 'ortho.u-dieresis'],
    revisits: [],
    steps: [
      {
        kind: 'explanation',
        title: 'Як виконувати вправи і вводити символи',
        required: false,
        blocks: [
          uk('Кожне завдання починається з інструкції українською: що треба зробити — вибрати, переписати, виправити чи написати. Правило, підказку або готову відповідь можна відкрити будь-коли. Мовна допомога записується лише для того вміння, яке вона пояснює.'),
          uk('Іспанські літери вводь звичайною клавіатурою: окремої панелі символів немає. Ці поради стосуються інтерфейсу, а не мови, тому їх використання не впливає на результати.'),
          ulUk(
            'Mac: затисни a, e, i, o, u чи n і вибери потрібний варіант у меню.',
            'Mac, знаки ¡ і ¿: у розкладці ABC ¡ — Option+1, ¿ — Option+Shift+/; в іспанській розкладці для них є окрема клавіша в ряду цифр (¿ — разом із Shift).',
            'iPhone: затисни літеру й вибери варіант у меню; ¿ і ¡ — затисни клавіші ? та ! на клавіатурі з цифрами й символами.',
          ),
        ],
      },
      {
        kind: 'explanation',
        title: 'Знак наголосу ´ над голосними',
        blocks: [
          uk('Над іспанською голосною може стояти знак наголосу ´: á, é, í, ó, ú. Це та сама голосна — знак лише показує наголошений склад, а іноді розрізняє слова. Тому його не пропускають: café, sí, adiós.'),
          uk('Знак завжди нахилений управо вгору: ´. Знаків ` і ˆ в іспанській немає. На великій літері знак теж пишуть: CAFÉ, ADIÓS.'),
          tableUk(['Літера', 'Слово', 'Значення'], [
            ['é', 'café', 'кава'],
            ['í', 'sí', 'так'],
            ['ó', 'adiós', 'до побачення'],
          ]),
        ],
      },
      {
        kind: 'explanation',
        title: 'Літери ñ і ü',
        blocks: [
          uk('Ñ (eñe) — окрема літера іспанської абетки, а не n зі значком. Вона звучить приблизно як українське «нь» перед голосною: España [еспанья], mañana [маньяна]. Замість ñ не можна писати n чи ny: без ñ слово написане з помилкою або стає іншим словом. Хвилька ~ над ñ називається тильдою; не плутай її зі знаком наголосу ´.'),
          uk('Ü трапляється рідко. У сполученнях gue і gui літера u не читається: guitarra [ґітарра]. Якщо u треба вимовити, над нею ставлять дві крапки: pingüino [пінґвіно], bilingüe [білінґве]. В інших сполученнях ü не пишуть.'),
        ],
      },
      {
        kind: 'examples',
        title: 'Слова з уроку',
        blocks: [
          ex('café', 'кава'),
          ex('sí', 'так'),
          ex('adiós', 'до побачення'),
          ex('España', 'Іспанія'),
          ex('niño', 'хлопчик; дитина'),
          ex('señor / señora', 'пан / пані'),
          ex('año', 'рік'),
          ex('mañana', 'завтра'),
          ex('pingüino', 'пінгвін'),
          ex('bilingüe', 'двомовний'),
          ex('guitarra', 'гітара (u не читається, тому ü не потрібна)'),
        ],
      },
      { kind: 'supported-practice', title: 'Тренування зі зразком', tasks: [1, 2, 3, 4, 5, 6] },
      { kind: 'independent-practice', title: 'Самостійно', tasks: [12, 8, 7, 13, 10, 9, 11] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Знак наголосу ´ над голосною — частина слова: café, sí, adiós; на великій літері теж: CAFÉ.',
            'Ñ — окрема літера: España, niño, señora, año, mañana.',
            'Ü пишуть лише в güe і güi, коли u вимовляється: pingüino, bilingüe.',
            'Наступний урок: над якою голосною стоїть знак наголосу в знайомих словах.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---- supported: model or rule visible ----
    {
      n: 1, role: 'supported', family: 'copy', mode: 'exact-variants', targets: [AV_W], policy: LOOSE,
      prompt: [uk('Перепиши слово так, як воно написане, разом зі знаком наголосу.'), ex('café', 'кава')],
      accepted: ['café.'],
      errors: [
        ['cafe.', 'x', 'Бракує знака наголосу над é. Без нього слово написане з помилкою: café.'],
        ['cafè.', 'x', 'Знак нахилений не в той бік: в іспанській пишуть лише ´ — café.'],
      ],
      hints: [rule([AV_W], RULE_AV), reveal(es('café'))],
      ref: 'café',
      ok: 'Правильно: café — зі знаком наголосу над é.',
      bad: 'Ще ні. Знак наголосу ´ стоїть над останньою літерою: café.',
      unres: U('café'),
    },
    {
      n: 2, role: 'supported', family: 'copy', mode: 'exact-variants', targets: [NT_W], policy: LOOSE,
      prompt: [uk('Перепиши назву країни з літерою ñ.'), ex('España', 'Іспанія')],
      accepted: ['España.'],
      errors: [
        ['Espana.', 'x', 'Замість ñ написано n. Ñ — окрема літера: España.'],
        ['Espanya.', 'x', 'Сполучення ny не замінює ñ: España.'],
      ],
      hints: [rule([NT_W], RULE_NT), reveal(es('España'))],
      ref: 'España',
      ok: 'Правильно: España — з літерою ñ.',
      bad: 'Ще ні. У цьому слові потрібна літера ñ: España.',
      unres: U('España'),
    },
    {
      n: 3, role: 'supported', family: 'choose', mode: 'choice', targets: [AV_C],
      prompt: [uk('Пам’ятай: знак наголосу в іспанській — лише ´ (нахил управо вгору).'), uk('Яке слово зі значенням «до побачення» написане правильно?')],
      options: [
        ['adiós', 'c'],
        ['adiòs', 'x', 'Знака ` в іспанській немає. Правильно: adiós.'],
        ['adiôs', 'x', 'Знака ˆ в іспанській немає. Правильно: adiós.'],
      ],
      hints: [rule([AV_C], RULE_AV)],
      ok: 'Так: adiós — зі знаком ´ над ó.',
      bad: 'Ні. Знак наголосу в іспанській — лише ´: adiós.',
    },
    {
      n: 4, role: 'supported', family: 'choose', mode: 'choice', targets: [NT_C],
      prompt: [uk('Пам’ятай: ñ — окрема літера, її не замінюють на n чи ny.'), uk('Як правильно пишеться слово «хлопчик; дитина»?')],
      options: [
        ['niño', 'c'],
        ['nino', 'x', 'Без ñ слово написане з помилкою: niño.'],
        ['ninyo', 'x', 'Сполучення ny не замінює ñ: niño.'],
      ],
      hints: [rule([NT_C], RULE_NT)],
      ok: 'Так: niño — з літерою ñ.',
      bad: 'Ні. Потрібна літера ñ: niño.',
    },
    {
      n: 5, role: 'supported', family: 'choose', mode: 'choice', targets: [UD_C],
      prompt: [uk('Пам’ятай: у gue і gui літера u не читається; щоб її було чути, пишуть ü.'), uk('Слово «пінгвін» вимовляють [пінґвіно] — u в ньому чути. Як воно пишеться?')],
      options: [
        ['pingüino', 'c'],
        ['pinguino', 'x', 'Без двох крапок u в gui не читалася б — вийшло б [пінґіно]. Правильно: pingüino.'],
        ['pinguïno', 'x', 'Дві крапки ставлять над u, а не над i: pingüino.'],
      ],
      hints: [rule([UD_C], RULE_UD)],
      ok: 'Так: pingüino — з ü, бо u вимовляється.',
      bad: 'Ні. Щоб u в gui читалася, над нею пишуть дві крапки: pingüino.',
    },
    {
      n: 6, role: 'supported', family: 'copy', mode: 'exact-variants', targets: [UD_W], policy: LOOSE,
      prompt: [uk('Перепиши слово з літерою ü.'), ex('bilingüe', 'двомовний')],
      accepted: ['bilingüe.'],
      errors: [['bilingue.', 'x', 'Бракує двох крапок над u. Без них u в gue не читалася б: bilingüe.']],
      hints: [rule([UD_W], RULE_UD), reveal(es('bilingüe'))],
      ref: 'bilingüe',
      ok: 'Правильно: bilingüe — з ü.',
      bad: 'Ще ні. Над u потрібні дві крапки: bilingüe.',
      unres: U('bilingüe'),
    },
    // ---- independent: no visible model ----
    {
      n: 7, role: 'independent', family: 'recall', mode: 'exact-variants', targets: [NT_W], policy: LOOSE,
      prompt: [uk('Напиши іспанською слово з уроку, яке означає «завтра».')],
      accepted: ['mañana.'],
      errors: [
        ['manana.', 'x', 'Потрібна літера ñ: mañana.'],
        ['manyana.', 'x', 'Сполучення ny не замінює ñ: mañana.'],
      ],
      hints: [clue([NT_W], 'У цьому слові є літера ñ.'), rule([NT_W], RULE_NT), reveal(es('mañana'))],
      ref: 'mañana',
      ok: 'Правильно: mañana.',
      bad: 'Ще ні. «Завтра» — mañana, з літерою ñ.',
      unres: U('mañana'),
    },
    {
      n: 8, role: 'independent', family: 'recall', mode: 'exact-variants', targets: [AV_W], policy: LOOSE,
      prompt: [uk('Напиши іспанською слово з уроку, яке означає «так» (відповідь на питання).')],
      accepted: ['sí.'],
      errors: [
        ['si.', 'x', 'Без знака наголосу si — інше слово («якщо»). «Так» — sí.'],
        ['sì.', 'x', 'Знак нахилений не в той бік: sí.'],
      ],
      hints: [clue([AV_W], 'Над голосною цього короткого слова стоїть знак наголосу.'), rule([AV_W], RULE_AV), reveal(es('sí'))],
      ref: 'sí',
      ok: 'Правильно: sí — зі знаком наголосу.',
      bad: 'Ще ні. «Так» — sí, зі знаком ´ над í.',
      unres: U('sí'),
    },
    {
      n: 9, role: 'independent', family: 'fix', mode: 'exact-variants', targets: [UD_W], policy: LOOSE,
      prompt: [uk('Виправ написання слова «пінгвін» так, щоб u читалася.'), es('pinguino')],
      accepted: ['pingüino.'],
      errors: [
        ['pinguino.', 'x', 'Слово не змінилося: без двох крапок u не читається. Правильно: pingüino.'],
        ['pinguïno.', 'x', 'Дві крапки ставлять над u: pingüino.'],
      ],
      hints: [rule([UD_W], RULE_UD), reveal(es('pingüino'))],
      ref: 'pingüino',
      ok: 'Правильно: pingüino.',
      bad: 'Ще ні. Над u потрібні дві крапки: pingüino.',
      unres: U('pingüino'),
    },
    {
      n: 10, role: 'independent', family: 'fix', mode: 'exact-variants', targets: [NT_W], policy: LOOSE,
      prompt: [uk('Виправ написання слова «пані».'), es('senora')],
      accepted: ['señora.'],
      errors: [
        ['senora.', 'x', 'Слово не змінилося. «Пані» — señora, з літерою ñ.'],
        ['senyora.', 'x', 'Сполучення ny не замінює ñ: señora.'],
      ],
      hints: [rule([NT_W], RULE_NT), reveal(es('señora'))],
      ref: 'señora',
      ok: 'Правильно: señora.',
      bad: 'Ще ні. Тут потрібна літера ñ: señora.',
      unres: U('señora'),
    },
    {
      n: 11, role: 'independent', family: 'sign', mode: 'exact-variants', targets: [AV_W], policy: OPT,
      prompt: [uk('Напиши слово café великими літерами, як на вивісці кав’ярні.')],
      accepted: ['CAFÉ.'],
      errors: [
        ['CAFE.', 'x', 'На великій літері знак наголосу теж пишуть: CAFÉ.'],
        ['CAFÈ.', 'x', 'Знака ` в іспанській немає: CAFÉ.'],
      ],
      hints: [clue([AV_W], 'Велика літера зберігає знак наголосу.'), reveal(es('CAFÉ'))],
      ref: 'CAFÉ',
      ok: 'Правильно: CAFÉ — знак наголосу зберігається й на великій літері.',
      bad: 'Ще ні. На великій літері знак наголосу теж пишуть: CAFÉ.',
      unres: U('CAFÉ'),
    },
    {
      n: 12, role: 'independent', family: 'choose', mode: 'choice', targets: [AV_C],
      prompt: [uk('На листівці великими літерами написано «До побачення». Який напис правильний?')],
      options: [
        ['ADIÓS', 'c'],
        ['ADIOS', 'x', 'На великій літері знак наголосу теж пишуть: ADIÓS.'],
        ['ADIÒS', 'x', 'Знака ` в іспанській немає: ADIÓS.'],
      ],
      hints: [rule([AV_C], RULE_AV)],
      ok: 'Так: ADIÓS — велика літера зберігає знак наголосу.',
      bad: 'Ні. Правильно ADIÓS: знак ´ стоїть і на великій літері.',
    },
    {
      n: 13, role: 'independent', family: 'choose', mode: 'choice', targets: [NT_C],
      prompt: [uk('Як правильно пишеться ввічливе звертання «пан»?')],
      options: [
        ['señor', 'c'],
        ['senor', 'x', 'Бракує ñ: señor.'],
        ['senyor', 'x', 'Сполучення ny не замінює ñ: señor.'],
      ],
      hints: [rule([NT_C], RULE_NT)],
      ok: 'Так: señor — з літерою ñ.',
      bad: 'Ні. Потрібна літера ñ: señor.',
    },
    // ---- held-out (delayed / transfer): not shown in the lesson ----
    {
      n: 14, role: 'delayed', family: 'recall', mode: 'exact-variants', targets: [NT_W], policy: LOOSE,
      prompt: [uk('Напиши іспанською слово «рік».')],
      accepted: ['año.'],
      errors: [
        ['ano.', 'x', 'Без ñ це зовсім інше слово. «Рік» — año.'],
        ['anyo.', 'x', 'Сполучення ny не замінює ñ: año.'],
      ],
      hints: [clue([NT_W], 'У цьому слові є літера ñ.'), reveal(es('año'))],
      ref: 'año',
      ok: 'Правильно: año.',
      bad: 'Ще ні. «Рік» — año, з літерою ñ.',
      unres: U('año'),
    },
    {
      n: 15, role: 'delayed', family: 'recall', mode: 'exact-variants', targets: [AV_W], policy: LOOSE,
      prompt: [uk('Напиши іспанською слово «до побачення».')],
      accepted: ['Adiós.', '¡Adiós!'],
      errors: [
        ['Adios.', 'x', 'Бракує знака наголосу над ó: adiós.'],
        ['¡Adios!', 'x', 'Бракує знака наголосу над ó: adiós.'],
        ['Adiòs.', 'x', 'Знак нахилений не в той бік: adiós.'],
      ],
      hints: [clue([AV_W], 'Знак наголосу стоїть над останньою голосною.'), reveal(es('adiós'))],
      ref: 'adiós',
      ok: 'Правильно: adiós.',
      bad: 'Ще ні. «До побачення» — adiós, зі знаком наголосу над ó.',
      unres: U('adiós'),
    },
    {
      n: 16, role: 'transfer', family: 'label', mode: 'exact-variants', targets: [UD_W], policy: LOOSE,
      prompt: [uk('Ти підписуєш обкладинку двомовного словника. Допиши слово «двомовний».'), es('Diccionario ___'), ex('diccionario', 'словник')],
      accepted: ['bilingüe.', 'Diccionario bilingüe.'],
      errors: [
        ['bilingue.', 'x', 'Бракує двох крапок над u: bilingüe.'],
        ['Diccionario bilingue.', 'x', 'Бракує двох крапок над u: bilingüe.'],
      ],
      hints: [rule([UD_W], RULE_UD), reveal(es('bilingüe'))],
      ref: 'bilingüe',
      ok: 'Правильно: Diccionario bilingüe.',
      bad: 'Ще ні. «Двомовний» — bilingüe, з ü.',
      unres: U('bilingüe'),
    },
    {
      n: 17, role: 'transfer', family: 'label', mode: 'exact-variants', targets: [AV_W, NT_W], policy: LOOSE,
      prompt: [
        uk('Допиши напис на пакунку кави з Іспанії: встав у рамку іспанські слова «кава» та «Іспанія». Слово de між ними вже дано.'),
        es('___ de ___'),
        ex('de', 'з (звідки)'),
      ],
      accepted: ['Café de España.'],
      errors: [
        ['Cafe de España.', { [AV_W]: 'x', [NT_W]: 'c' }, 'Бракує знака наголосу: café.'],
        ['Café de Espana.', { [AV_W]: 'c', [NT_W]: 'x' }, 'Бракує літери ñ: España.'],
        ['Cafe de Espana.', { [AV_W]: 'x', [NT_W]: 'x' }, 'Бракує знака наголосу в café і літери ñ в España.'],
      ],
      hints: [rule([AV_W], RULE_AV), rule([NT_W], RULE_NT), reveal(es('Café de España'))],
      ref: 'Café de España',
      ok: 'Правильно: Café de España.',
      bad: 'Ще ні. Перевір знак наголосу в café і літеру ñ в España.',
      unres: U('Café de España'),
    },
  ],
};
