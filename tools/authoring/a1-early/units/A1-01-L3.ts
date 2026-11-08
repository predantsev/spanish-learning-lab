// A1-01-L3 — a short written phrase: ¿? ¡!, comma/period, capitalization, learning terms, and the
// CV-01 fixed-phrase starter (greetings, leave-taking, please/thanks, apology) with listening.
// Presentation is split into two labeled parts under the same lesson ID (CONTENT-PLAN: long
// presentation → labeled resumable steps).
import { LOOSE, OPT, STRICT, clip, es, ex, gloss, link, material, reveal, rule, tableUk, transcript, uk, ulUk } from '../lib.ts';
import type { Unit } from '../lib.ts';
import { U } from '../common.ts';

const Q_W = 'ortho.question-marks/written-form';
const Q_C = 'ortho.question-marks/context-choice';
const E_W = 'ortho.exclamation-marks/written-form';
const E_C = 'ortho.exclamation-marks/context-choice';
const C_W = 'ortho.capitalization/written-form';
const C_C = 'ortho.capitalization/context-choice';
const P_W = 'ortho.sentence-punctuation/written-form';
const G_R = 'formula.greeting/phrase-recall';
const G_M = 'formula.greeting/reading-meaning';
const G_L = 'formula.greeting/listening-meaning';
const G_D = 'formula.greeting/dictation';
const T_C = 'formula.greeting.time-of-day/context-choice';
const L_R = 'formula.leave-taking/phrase-recall';
const L_M = 'formula.leave-taking/reading-meaning';
const L_L = 'formula.leave-taking/listening-meaning';
const L_D = 'formula.leave-taking/dictation';
const PT_R = 'formula.please-thanks/phrase-recall';
const PT_M = 'formula.please-thanks/reading-meaning';
const PT_L = 'formula.please-thanks/listening-meaning';
const PT_D = 'formula.please-thanks/dictation';
const A_R = 'formula.apology/phrase-recall';
const A_M = 'formula.apology/reading-meaning';
const A_L = 'formula.apology/listening-meaning';
const A_D = 'formula.apology/dictation';

const RULE_Q = 'Питання має два знаки: ¿ на початку і ? в кінці. ¿ ставимо там, де починається саме питання. Якщо перед ним стоїть привітання чи звертання з комою, питання починається після коми й з малої літери: Hola, ¿qué tal?';
const RULE_E = 'Оклик має два знаки: ¡ на початку і ! в кінці. ¡ ставимо там, де починається сам оклик: Ana, ¡muchas gracias! Привітання можна писати й з крапкою (Hola.), але знак оклику без пари — помилка.';
const RULE_C = 'З великої літери пишемо перше слово речення, імена й прізвища, назви міст і країн: Ana, García, Madrid, España. Señor і señora перед прізвищем — з малої: Buenos días, señora García.';
const RULE_P = 'Твердження закінчується крапкою. Звертання — ім’я чи слово, яким звертаємося до людини, — відокремлюємо комою: Hola, Ana. Gracias, Pablo.';
const RULE_G = 'Hola — «привіт; добрий день». Buenos días — до обіду, buenas tardes — після обіду до вечора, buenas noches — пізно ввечері й уночі. ¿Qué tal? — «як справи?».';
const RULE_T = 'Buenos días — зранку й до обіду (приблизно до 14:00). Buenas tardes — після обіду до вечора (зазвичай до 20–21:00). Buenas noches — пізно ввечері, уночі й на прощання.';
const RULE_L = 'Adiós — «до побачення». Hasta luego — «бувай, до зустрічі»: в Іспанії це найчастіше щоденне прощання. Hasta mañana — «до завтра».';
const RULE_PT = 'Por favor — «будь ласка» у проханні. Gracias — «дякую», muchas gracias — «дуже дякую». На подяку відповідають de nada — «нема за що».';
const RULE_A = 'Perdón — «перепрошую»: коли випадково заважаєш або хочеш до когось звернутися. Lo siento — «мені шкода»: коли щось сталося або доводиться відмовити. Lo siento mucho — «мені дуже шкода».';

const REMIND_G = 'Пам’ятай: buenos días — до обіду, buenas tardes — після обіду до вечора, buenas noches — пізно ввечері.';

export const unit: Unit = {
  lesson: {
    id: 'A1-01-L3',
    titleUk: 'Коротка фраза: розділові знаки, велика літера і ввічливі слова',
    termEs: 'signos de puntuación y saludos',
    summaryUk: 'Навчишся ставити ¿ ? і ¡ !, кому при звертанні, крапку й велику літеру, а також вивчиш перші цілі фрази: привітання, прощання, подяку й вибачення — на письмі та на слух.',
    objectives: ['A1-01-O3', 'A1-01-O4', 'A1-01-O2'],
    cv: ['CV-01'],
    situations: ['greetings-introductions'],
    estimatedMinutes: 20,
    skippableFoundation: true,
    introduces: [
      'ortho.question-marks', 'ortho.exclamation-marks', 'ortho.capitalization', 'ortho.sentence-punctuation', 'text.grammar-terms',
      'formula.greeting', 'formula.greeting.time-of-day', 'formula.leave-taking', 'formula.please-thanks', 'formula.apology',
    ],
    revisits: ['ortho.written-accent.familiar-words', 'ortho.n-tilde', 'text.exercise-instructions'],
    steps: [
      {
        kind: 'explanation',
        title: 'Частина 1. Знаки ¿ ? і ¡ !',
        blocks: [
          uk('Питання в іспанській має два знаки: перевернутий ¿ на початку і звичайний ? в кінці: ¿Qué tal? Так само оклик: ¡Hola! ¡Hasta luego!'),
          uk('Перевернутий знак ставлять там, де починається саме питання чи оклик. Якщо перед ним є привітання чи звертання з комою, знак стоїть після коми, а питання чи оклик продовжується з малої літери: Hola, ¿qué tal? Ana, ¡muchas gracias!'),
          uk('Привітання можна писати з окликом або з крапкою: ¡Hola! або Hola. Помилка — лише один знак без пари: Hola! без ¡.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Частина 1. Кома, крапка і велика літера',
        blocks: [
          uk('Твердження закінчується крапкою. Звертання — ім’я чи слово, яким звертаємося до людини, — відокремлюємо комою, як і в українській: Hola, Ana. Gracias, Pablo. Buenos días, señor.'),
          uk('З великої літери пишемо перше слово речення, імена й прізвища, назви міст і країн: Ana, García, Madrid, España. Слова señor і señora перед прізвищем — з малої: Buenos días, señora García.'),
          uk('На відміну від англійської, дні тижня, місяці, мови й національності в іспанській пишуться з малої літери. Ти вже знаєш sábado — «субота»: його пишемо з малої.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Терміни в поясненнях',
        required: false,
        blocks: [
          uk('У поясненнях поруч з українським терміном іноді стоїть іспанський. Окремо вчити терміни не треба: коротке пояснення завжди можна відкрити біля завдання.'),
          tableUk(['Українською', 'Іспанською'], [
            ['іменник', 'sustantivo'],
            ['дієслово', 'verbo'],
            ['прикметник', 'adjetivo'],
            ['артикль', 'artículo'],
            ['особа', 'persona'],
            ['однина / множина', 'singular / plural'],
            ['чоловічий / жіночий рід', 'masculino / femenino'],
            ['знак наголосу ´', 'tilde'],
          ]),
          uk('Іспанське слово tilde означає знак наголосу ´; українська «тильда» — це лише хвилька ~ над ñ.'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 1. Тренування зі зразком', tasks: [1, 2, 3, 4, 5, 6] },
      { kind: 'independent-practice', title: 'Частина 1. Самостійно', tasks: [12, 7, 9, 11, 13, 8, 10] },
      {
        kind: 'explanation',
        title: 'Частина 2. Привітання',
        blocks: [
          uk('Ці фрази вчимо цілими: чому buenos, а не buenas, пояснимо пізніше.'),
          tableUk(['Фраза', 'Значення', 'Коли кажуть'], [
            ['Hola.', 'привіт; добрий день', 'майже завжди'],
            ['Buenos días.', 'добрий ранок; добрий день', 'зранку й до обіду (приблизно до 14:00)'],
            ['Buenas tardes.', 'добрий день; добрий вечір', 'після обіду до вечора (зазвичай до 20–21:00)'],
            ['Buenas noches.', 'добрий вечір; на добраніч', 'пізно ввечері, уночі й на прощання'],
            ['¿Qué tal?', 'як справи?', 'неформально, часто після hola'],
          ]),
          uk('В Іспанії обід пізніший, ніж в Україні, тому buenas tardes кажуть і о 17:00, і о 18:00. Межі приблизні: о 14:00 чи о 20:30 підійдуть обидва сусідні привітання.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Частина 2. Прощання, подяка, вибачення',
        blocks: [
          tableUk(['Фраза', 'Значення'], [
            ['Adiós.', 'до побачення'],
            ['Hasta luego.', 'бувай, до зустрічі (найчастіше щоденне прощання в Іспанії)'],
            ['Hasta mañana.', 'до завтра'],
            ['Por favor.', 'будь ласка (у проханні)'],
            ['Gracias. / Muchas gracias.', 'дякую / дуже дякую'],
            ['De nada.', 'нема за що'],
            ['Perdón.', 'перепрошую, вибачте'],
            ['Lo siento. / Lo siento mucho.', 'мені шкода / мені дуже шкода'],
          ]),
          uk('Українське «будь ласка» у відповідь на «дякую» — це de nada, а не por favor.'),
          uk('Perdón кажуть, коли випадково заважаєш або хочеш до когось звернутися; lo siento — коли щось сталося або доводиться відмовити.'),
        ],
      },
      {
        kind: 'examples',
        title: 'Частина 2. Приклади',
        blocks: [
          ex('Hola, Ana, ¿qué tal?', 'Привіт, Ано, як справи?'),
          ex('Buenos días, señor.', 'Добрий день, пане.'),
          ex('Un café, por favor.', 'Каву, будь ласка. (un café — одна кава; слово un пояснимо пізніше)'),
          ex('—Muchas gracias. —De nada.', '— Дуже дякую. — Нема за що.'),
          ex('Perdón, señora.', 'Перепрошую, пані.'),
          ex('Lo siento, Ana.', 'Мені шкода, Ано.'),
          ex('¡Hasta luego!', 'Бувай!'),
          ex('Hasta mañana.', 'До завтра.'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 2. Тренування з підказкою', tasks: [21, 29, 30, 35, 42, 49] },
      { kind: 'independent-practice', title: 'Частина 2. Самостійно', tasks: [22, 31, 23, 36, 32, 37, 43, 44, 50, 51] },
      {
        kind: 'listening',
        title: 'Частина 2. Послухай фрази',
        clips: ['clip.a1-01.buenos-dias-garcia', 'clip.a1-01.hola-pablo-que-tal', 'clip.a1-01.hasta-luego-pablo', 'clip.a1-01.muchas-gracias-garcia', 'clip.a1-01.lo-siento-pablo'],
        tasks: [25, 26, 27, 39, 40, 46, 47, 53, 54],
      },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Питання й оклик мають по два знаки: ¿…? і ¡…!; перевернутий знак стоїть там, де починається питання чи оклик: Hola, ¿qué tal?',
            'Звертання відокремлюємо комою, твердження закінчуємо крапкою: Gracias, Pablo.',
            'З великої літери — початок речення, імена, міста, країни; señor і señora перед прізвищем — з малої.',
            'Привітання залежить від часу доби: buenos días, buenas tardes, buenas noches; прощання — adiós, hasta luego, hasta mañana.',
            'Por favor — у проханні; на gracias відповідають de nada; perdón — «перепрошую», lo siento — «мені шкода».',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ================= Part 1: punctuation and capitalization =================
    {
      n: 1, role: 'supported', family: 'restore', mode: 'exact-variants', targets: [Q_W], policy: STRICT,
      prompt: [uk('Пам’ятай: питання має два знаки — ¿ на початку і ? в кінці.'), uk('Додай знаки питання.'), es('Qué tal')],
      accepted: ['¿Qué tal?'],
      errors: [
        ['Qué tal?', 'x', 'Бракує перевернутого ¿ на початку: ¿Qué tal?'],
        ['¿Qué tal', 'x', 'Бракує ? в кінці: ¿Qué tal?'],
        ['¿Qué tal¿', 'x', 'У кінці питання ставлять звичайний ?: ¿Qué tal?'],
      ],
      hints: [rule([Q_W], RULE_Q), reveal(es('¿Qué tal?'))],
      ref: '¿Qué tal?',
      ok: 'Правильно: ¿Qué tal?',
      bad: 'Ще ні. Питання має два знаки: ¿Qué tal?',
      unres: U('¿Qué tal?'),
    },
    {
      n: 2, role: 'supported', family: 'restore', mode: 'exact-variants', targets: [E_W], policy: STRICT,
      prompt: [uk('Пам’ятай: оклик має два знаки — ¡ на початку і ! в кінці.'), uk('Додай знаки оклику.'), es('Hasta luego')],
      accepted: ['¡Hasta luego!'],
      errors: [
        ['Hasta luego!', 'x', 'Бракує перевернутого ¡ на початку: ¡Hasta luego!'],
        ['¡Hasta luego', 'x', 'Бракує ! в кінці: ¡Hasta luego!'],
        ['¡Hasta luego¡', 'x', 'У кінці оклику ставлять звичайний !: ¡Hasta luego!'],
      ],
      hints: [rule([E_W], RULE_E), reveal(es('¡Hasta luego!'))],
      ref: '¡Hasta luego!',
      ok: 'Правильно: ¡Hasta luego!',
      bad: 'Ще ні. Оклик має два знаки: ¡Hasta luego!',
      unres: U('¡Hasta luego!'),
    },
    {
      n: 3, role: 'supported', family: 'restore', mode: 'exact-variants', targets: [P_W], policy: STRICT,
      prompt: [uk('Пам’ятай: звертання відокремлюємо комою, а твердження закінчуємо крапкою.'), uk('Додай кому і крапку.'), es('Hola Ana')],
      accepted: ['Hola, Ana.', ['¡Hola, Ana!', 'Оклик замість крапки теж правильний.']],
      errors: [
        ['Hola Ana.', 'x', 'Бракує коми перед звертанням: Hola, Ana.'],
        ['Hola, Ana', 'x', 'Бракує крапки в кінці: Hola, Ana.'],
      ],
      hints: [rule([P_W], RULE_P), reveal(es('Hola, Ana.'))],
      ref: 'Hola, Ana.',
      ok: 'Правильно: Hola, Ana.',
      bad: 'Ще ні. Кома перед звертанням і крапка в кінці: Hola, Ana.',
      unres: U('Hola, Ana.'),
    },
    {
      n: 4, role: 'supported', family: 'choose', mode: 'choice', targets: [Q_C],
      prompt: [uk('Пам’ятай: ¿ на початку питання, ? в кінці.'), uk('Яке питання написане правильно?')],
      options: [
        ['¿Qué tal?', 'c'],
        ['Qué tal?', 'x', 'Бракує ¿ на початку.'],
        ['¿Qué tal¿', 'x', 'У кінці питання ставлять звичайний ?.'],
      ],
      hints: [rule([Q_C], RULE_Q)],
      ok: 'Так: ¿Qué tal?',
      bad: 'Ні. Правильно: ¿Qué tal? — два знаки.',
    },
    {
      n: 5, role: 'supported', family: 'choose', mode: 'choice', targets: [E_C],
      prompt: [uk('Пам’ятай: ¡ на початку оклику, ! в кінці.'), uk('Який оклик написаний правильно?')],
      options: [
        ['¡Hola!', 'c'],
        ['Hola!', 'x', 'Бракує ¡ на початку.'],
        ['¡Hola¡', 'x', 'У кінці оклику ставлять звичайний !.'],
      ],
      hints: [rule([E_C], RULE_E)],
      ok: 'Так: ¡Hola!',
      bad: 'Ні. Правильно: ¡Hola! — два знаки.',
    },
    {
      n: 6, role: 'supported', family: 'choose', mode: 'choice', targets: [C_C],
      prompt: [uk('Пам’ятай: з великої літери — перше слово речення та імена; señor і señora перед прізвищем — з малої.'), uk('Яке привітання написане правильно?')],
      options: [
        ['Buenos días, señora García.', 'c'],
        ['buenos días, señora García.', 'x', 'Перше слово речення пишемо з великої літери.'],
        ['Buenos días, Señora García.', 'x', 'Señora перед прізвищем пишемо з малої літери.'],
        ['Buenos días, señora garcía.', 'x', 'Прізвище пишемо з великої літери: García.'],
      ],
      hints: [rule([C_C], RULE_C)],
      ok: 'Так: Buenos días, señora García.',
      bad: 'Ні. Правильно: Buenos días, señora García.',
    },
    {
      n: 7, role: 'independent', family: 'restore', mode: 'exact-variants', targets: [Q_W, P_W, C_W], policy: STRICT,
      prompt: [uk('Додай розділові знаки: це привітання і питання «як справи?».'), es('Hola qué tal')],
      accepted: ['Hola, ¿qué tal?', ['¡Hola! ¿Qué tal?', 'Два окремі речення — теж правильно.'], ['Hola. ¿Qué tal?', 'Два окремі речення — теж правильно.']],
      errors: [
        ['Hola, qué tal?', { [Q_W]: 'x', [P_W]: 'c', [C_W]: 'c' }, 'Бракує перевернутого ¿ перед qué: Hola, ¿qué tal?'],
        ['Hola ¿qué tal?', { [Q_W]: 'c', [P_W]: 'x', [C_W]: 'c' }, 'Бракує коми після hola: Hola, ¿qué tal?'],
        ['Hola, ¿Qué tal?', { [Q_W]: 'c', [P_W]: 'c', [C_W]: 'x' }, 'Після коми питання продовжується з малої літери: Hola, ¿qué tal?'],
        ['¿Hola, qué tal?', { [Q_W]: 'x', [P_W]: 'c', [C_W]: 'c' }, 'Hola — не частина питання, тому ¿ ставимо після коми: Hola, ¿qué tal?'],
      ],
      hints: [rule([Q_W, C_W], RULE_Q), rule([P_W], RULE_P), reveal(es('Hola, ¿qué tal?'))],
      ref: 'Hola, ¿qué tal?',
      ok: 'Правильно: Hola, ¿qué tal?',
      bad: 'Ще ні. Правильний варіант: Hola, ¿qué tal?',
      unres: U('Hola, ¿qué tal?'),
    },
    {
      n: 8, role: 'independent', family: 'restore', mode: 'exact-variants', targets: [E_W, P_W], policy: STRICT,
      prompt: [uk('Додай кому й знаки оклику: ти звертаєшся до Ани й палко дякуєш.'), es('Ana muchas gracias')],
      accepted: ['Ana, ¡muchas gracias!'],
      errors: [
        ['Ana, muchas gracias!', { [E_W]: 'x', [P_W]: 'c' }, 'Бракує перевернутого ¡ перед muchas: Ana, ¡muchas gracias!'],
        ['Ana ¡muchas gracias!', { [E_W]: 'c', [P_W]: 'x' }, 'Бракує коми після звертання: Ana, ¡muchas gracias!'],
        ['Ana, ¡muchas gracias¡', { [E_W]: 'x', [P_W]: 'c' }, 'У кінці оклику ставлять звичайний !: Ana, ¡muchas gracias!'],
      ],
      hints: [rule([E_W], RULE_E), rule([P_W], RULE_P), reveal(es('Ana, ¡muchas gracias!'))],
      ref: 'Ana, ¡muchas gracias!',
      ok: 'Правильно: Ana, ¡muchas gracias!',
      bad: 'Ще ні. Кома після звертання, оклик починається після коми: Ana, ¡muchas gracias!',
      unres: U('Ana, ¡muchas gracias!'),
    },
    {
      n: 9, role: 'independent', family: 'fix-case', mode: 'exact-variants', targets: [C_W], policy: OPT,
      prompt: [uk('Виправ великі й малі літери.'), es('hola, ana.')],
      accepted: ['Hola, Ana.'],
      errors: [
        ['Hola, ana.', 'x', 'Ім’я пишемо з великої літери: Ana.'],
        ['hola, Ana.', 'x', 'Перше слово речення пишемо з великої літери: Hola.'],
      ],
      hints: [rule([C_W], RULE_C), reveal(es('Hola, Ana.'))],
      ref: 'Hola, Ana.',
      ok: 'Правильно: Hola, Ana.',
      bad: 'Ще ні. Перше слово й ім’я — з великої: Hola, Ana.',
      unres: U('Hola, Ana.'),
    },
    {
      n: 10, role: 'independent', family: 'fix-case', mode: 'exact-variants', targets: [C_W], policy: OPT,
      prompt: [uk('Виправ великі й малі літери.'), es('buenos días, Señora garcía.')],
      accepted: ['Buenos días, señora García.'],
      errors: [
        ['Buenos días, Señora García.', 'x', 'Señora перед прізвищем пишемо з малої літери.'],
        ['buenos días, señora García.', 'x', 'Перше слово речення пишемо з великої літери.'],
        ['Buenos días, señora garcía.', 'x', 'Прізвище пишемо з великої літери: García.'],
      ],
      hints: [rule([C_W], RULE_C), reveal(es('Buenos días, señora García.'))],
      ref: 'Buenos días, señora García.',
      ok: 'Правильно: Buenos días, señora García.',
      bad: 'Ще ні. Правильно: Buenos días, señora García.',
      unres: U('Buenos días, señora García.'),
    },
    {
      n: 11, role: 'independent', family: 'restore', mode: 'exact-variants', targets: [P_W], policy: STRICT,
      prompt: [uk('Додай кому і крапку.'), es('Gracias Pablo')],
      accepted: ['Gracias, Pablo.', ['¡Gracias, Pablo!', 'Оклик замість крапки теж правильний.']],
      errors: [
        ['Gracias Pablo.', 'x', 'Бракує коми перед звертанням: Gracias, Pablo.'],
        ['Gracias, Pablo', 'x', 'Бракує крапки в кінці: Gracias, Pablo.'],
      ],
      hints: [rule([P_W], RULE_P), reveal(es('Gracias, Pablo.'))],
      ref: 'Gracias, Pablo.',
      ok: 'Правильно: Gracias, Pablo.',
      bad: 'Ще ні. Кома перед звертанням і крапка в кінці: Gracias, Pablo.',
      unres: U('Gracias, Pablo.'),
    },
    {
      n: 12, role: 'independent', family: 'choose', mode: 'choice', targets: [Q_C],
      prompt: [uk('Яке речення написане правильно?')],
      options: [
        ['Hola, ¿qué tal?', 'c'],
        ['¿Hola, qué tal?', 'x', 'Hola — не частина питання, тому ¿ ставимо після коми.'],
        ['Hola, qué tal?', 'x', 'Бракує ¿ на початку питання.'],
      ],
      hints: [rule([Q_C], RULE_Q)],
      ok: 'Так: Hola, ¿qué tal?',
      bad: 'Ні. Питання починається після коми: Hola, ¿qué tal?',
    },
    {
      n: 13, role: 'independent', family: 'choose', mode: 'choice', targets: [E_C],
      prompt: [uk('Ти пишеш Пабло «Бувай, Пабло!». Який варіант правильний?')],
      options: [
        ['¡Hasta luego, Pablo!', 'c'],
        ['Hasta luego, Pablo!', 'x', 'Бракує ¡ на початку оклику.'],
        ['¡Hasta luego, Pablo¡', 'x', 'У кінці оклику ставлять звичайний !.'],
      ],
      hints: [rule([E_C], RULE_E)],
      ok: 'Так: ¡Hasta luego, Pablo!',
      bad: 'Ні. Правильно: ¡Hasta luego, Pablo!',
    },
    {
      n: 14, role: 'delayed', family: 'restore', mode: 'exact-variants', targets: [Q_W, P_W], policy: STRICT,
      prompt: [uk('Додай розділові знаки: це звертання до Пабло і питання «як справи?».'), es('Pablo qué tal')],
      accepted: ['Pablo, ¿qué tal?'],
      errors: [
        ['Pablo, qué tal?', { [Q_W]: 'x', [P_W]: 'c' }, 'Бракує ¿ перед qué: Pablo, ¿qué tal?'],
        ['Pablo ¿qué tal?', { [Q_W]: 'c', [P_W]: 'x' }, 'Бракує коми після звертання: Pablo, ¿qué tal?'],
        ['¿Pablo, qué tal?', { [Q_W]: 'x', [P_W]: 'c' }, 'Звертання на початку стоїть поза питанням: Pablo, ¿qué tal?'],
      ],
      hints: [rule([Q_W], RULE_Q), rule([P_W], RULE_P), reveal(es('Pablo, ¿qué tal?'))],
      ref: 'Pablo, ¿qué tal?',
      ok: 'Правильно: Pablo, ¿qué tal?',
      bad: 'Ще ні. Правильно: Pablo, ¿qué tal?',
      unres: U('Pablo, ¿qué tal?'),
    },
    {
      n: 15, role: 'delayed', family: 'restore', mode: 'exact-variants', targets: [E_W], policy: STRICT,
      prompt: [uk('Додай знаки оклику.'), es('Muchas gracias')],
      accepted: ['¡Muchas gracias!'],
      errors: [
        ['Muchas gracias!', 'x', 'Бракує ¡ на початку: ¡Muchas gracias!'],
        ['¡Muchas gracias', 'x', 'Бракує ! в кінці: ¡Muchas gracias!'],
      ],
      hints: [rule([E_W], RULE_E), reveal(es('¡Muchas gracias!'))],
      ref: '¡Muchas gracias!',
      ok: 'Правильно: ¡Muchas gracias!',
      bad: 'Ще ні. Оклик має два знаки: ¡Muchas gracias!',
      unres: U('¡Muchas gracias!'),
    },
    {
      n: 16, role: 'delayed', family: 'fix-case', mode: 'exact-variants', targets: [C_W], policy: OPT,
      prompt: [uk('Виправ великі й малі літери.'), es('adiós, Señor garcía.')],
      accepted: ['Adiós, señor García.'],
      errors: [
        ['adiós, señor García.', 'x', 'Перше слово речення пишемо з великої літери.'],
        ['Adiós, Señor García.', 'x', 'Señor перед прізвищем пишемо з малої літери.'],
        ['Adiós, señor garcía.', 'x', 'Прізвище пишемо з великої літери: García.'],
      ],
      hints: [rule([C_W], RULE_C), reveal(es('Adiós, señor García.'))],
      ref: 'Adiós, señor García.',
      ok: 'Правильно: Adiós, señor García.',
      bad: 'Ще ні. Правильно: Adiós, señor García.',
      unres: U('Adiós, señor García.'),
    },
    {
      n: 17, role: 'delayed', family: 'restore', mode: 'exact-variants', targets: [P_W], policy: STRICT,
      prompt: [uk('Додай кому і крапку.'), es('Buenos días señor')],
      accepted: ['Buenos días, señor.', ['¡Buenos días, señor!', 'Оклик замість крапки теж правильний.']],
      errors: [
        ['Buenos días señor.', 'x', 'Бракує коми перед звертанням: Buenos días, señor.'],
        ['Buenos días, señor', 'x', 'Бракує крапки в кінці: Buenos días, señor.'],
      ],
      hints: [rule([P_W], RULE_P), reveal(es('Buenos días, señor.'))],
      ref: 'Buenos días, señor.',
      ok: 'Правильно: Buenos días, señor.',
      bad: 'Ще ні. Кома перед звертанням і крапка в кінці: Buenos días, señor.',
      unres: U('Buenos días, señor.'),
    },
    {
      n: 18, role: 'transfer', family: 'message', mode: 'exact-variants', targets: [P_W, Q_W], policy: STRICT,
      prompt: [uk('Напиши повідомлення в чаті іспанською: «Привіт, Пабло, як справи?»')],
      accepted: ['Hola, Pablo, ¿qué tal?', ['¡Hola, Pablo! ¿Qué tal?', 'Оклик і окреме питання — теж правильно.'], ['Hola, Pablo. ¿Qué tal?', 'Два речення — теж правильно.']],
      errors: [
        ['Hola Pablo, ¿qué tal?', { [P_W]: 'x', [Q_W]: 'c' }, 'Бракує коми перед звертанням: Hola, Pablo, ¿qué tal?'],
        ['Hola, Pablo ¿qué tal?', { [P_W]: 'x', [Q_W]: 'c' }, 'Звертання з обох боків відокремлюємо комами: Hola, Pablo, ¿qué tal?'],
        ['Hola, Pablo, qué tal?', { [P_W]: 'c', [Q_W]: 'x' }, 'Бракує ¿ перед qué: Hola, Pablo, ¿qué tal?'],
        ['¿Hola, Pablo, qué tal?', { [P_W]: 'c', [Q_W]: 'x' }, '¿ ставимо там, де починається питання: Hola, Pablo, ¿qué tal?'],
      ],
      hints: [rule([P_W], RULE_P), rule([Q_W], RULE_Q), reveal(es('Hola, Pablo, ¿qué tal?'))],
      ref: 'Hola, Pablo, ¿qué tal?',
      ok: 'Правильно: Hola, Pablo, ¿qué tal?',
      bad: 'Ще ні. Звертання між комами, питання — з ¿ і ?: Hola, Pablo, ¿qué tal?',
      unres: U('Hola, Pablo, ¿qué tal?'),
    },
    {
      n: 19, role: 'transfer', family: 'card', mode: 'exact-variants', targets: [E_W, C_W], policy: STRICT,
      prompt: [uk('Напиши на листівці іспанською з окликом: «Дуже дякую, Ано!»')],
      accepted: ['¡Muchas gracias, Ana!'],
      errors: [
        ['Muchas gracias, Ana!', { [E_W]: 'x', [C_W]: 'c' }, 'Бракує ¡ на початку оклику: ¡Muchas gracias, Ana!'],
        ['¡Muchas gracias, Ana¡', { [E_W]: 'x', [C_W]: 'c' }, 'У кінці оклику ставлять звичайний !: ¡Muchas gracias, Ana!'],
        ['¡Muchas gracias, ana!', { [E_W]: 'c', [C_W]: 'x' }, 'Ім’я пишемо з великої літери: Ana.'],
        ['¡muchas gracias, Ana!', { [E_W]: 'c', [C_W]: 'x' }, 'Перше слово речення пишемо з великої літери: Muchas.'],
      ],
      hints: [rule([E_W], RULE_E), rule([C_W], RULE_C), reveal(es('¡Muchas gracias, Ana!'))],
      ref: '¡Muchas gracias, Ana!',
      ok: 'Правильно: ¡Muchas gracias, Ana!',
      bad: 'Ще ні. Правильно: ¡Muchas gracias, Ana!',
      unres: U('¡Muchas gracias, Ana!'),
    },
    {
      n: 20, role: 'transfer', family: 'caption', mode: 'exact-variants', targets: [C_W], policy: OPT,
      prompt: [uk('Підпиши фото з подорожі іспанською: «Мадрид, Іспанія».')],
      accepted: ['Madrid, España.'],
      errors: [
        ['madrid, españa.', 'x', 'Назви міст і країн пишемо з великої літери: Madrid, España.'],
        ['Madrid, españa.', 'x', 'Назву країни пишемо з великої літери: España.'],
        ['madrid, España.', 'x', 'Назву міста пишемо з великої літери: Madrid.'],
      ],
      hints: [rule([C_W], RULE_C), reveal(es('Madrid, España.'))],
      ref: 'Madrid, España.',
      ok: 'Правильно: Madrid, España.',
      bad: 'Ще ні. Місто й країна — з великої літери: Madrid, España.',
      unres: U('Madrid, España.'),
    },
    // ================= Part 2: greetings =================
    {
      n: 21, role: 'supported', family: 'meaning', mode: 'choice', targets: [G_M],
      prompt: [uk(REMIND_G), uk('Що означає це привітання?'), es('Buenos días.')],
      options: [
        ['Добрий день (до обіду).', 'c'],
        ['Добрий вечір.', 'x', 'Добрий вечір — buenas tardes або buenas noches. Buenos días кажуть до обіду.'],
        ['До побачення.', 'x', 'До побачення — adiós.'],
      ],
      hints: [rule([G_M], RULE_G)],
      ok: 'Так: buenos días — «добрий ранок; добрий день» до обіду.',
      bad: 'Ні. Buenos días — «добрий ранок; добрий день» до обіду.',
    },
    {
      n: 22, role: 'independent', family: 'meaning', mode: 'choice', targets: [G_M],
      prompt: [uk('Друг пише тобі в чаті:'), es('Hola, ¿qué tal?'), uk('Що він питає?')],
      options: [
        ['Як справи?', 'c'],
        ['Що це?', 'x', '¿Qué tal? — це «як справи?», а не «що це?».'],
        ['Де ти?', 'x', '¿Qué tal? — це «як справи?».'],
      ],
      hints: [rule([G_M], RULE_G)],
      ok: 'Так: ¿qué tal? — «як справи?».',
      bad: 'Ні. ¿Qué tal? означає «як справи?».',
    },
    {
      n: 23, role: 'independent', family: 'recall', mode: 'exact-variants', targets: [G_R], policy: LOOSE,
      prompt: [uk('Напиши іспанською: «Привіт, як справи?»')],
      accepted: ['Hola, ¿qué tal?', '¡Hola! ¿Qué tal?', 'Hola. ¿Qué tal?'],
      errors: [
        ['Hola, ¿que tal?', 'x', 'У фразі ¿qué tal? над e стоїть знак наголосу: ¿qué tal?'],
        ['Ola, ¿qué tal?', 'x', 'Hola пишеться з h, хоча h не читається.'],
      ],
      hints: [rule([G_R], RULE_G), reveal(es('Hola, ¿qué tal?'))],
      ref: 'Hola, ¿qué tal?',
      ok: 'Правильно: Hola, ¿qué tal?',
      bad: 'Ще ні. «Привіт, як справи?» — Hola, ¿qué tal?',
      unres: U('Hola, ¿qué tal?'),
    },
    {
      n: 24, role: 'delayed', family: 'recall', mode: 'exact-variants', targets: [G_R], policy: LOOSE,
      prompt: [uk('Напиши іспанською привітання пізно ввечері, коли вже темно: «Добрий вечір».')],
      accepted: ['Buenas noches.', '¡Buenas noches!'],
      errors: [
        ['Buenos noches.', 'x', 'У цій фразі buenas, а не buenos: buenas noches.'],
        ['Buenas tardes.', 'x', 'Buenas tardes кажуть до темряви; пізно ввечері — buenas noches.'],
      ],
      hints: [rule([G_R], RULE_G), reveal(es('Buenas noches.'))],
      ref: 'Buenas noches.',
      ok: 'Правильно: Buenas noches.',
      bad: 'Ще ні. Пізно ввечері вітаються buenas noches.',
      unres: U('Buenas noches.'),
    },
    {
      n: 25, role: 'supported', family: 'listen-greeting', mode: 'choice', targets: [G_L], clips: ['clip.a1-01.buenos-dias-garcia'],
      prompt: [uk('Послухай привітання. Що сказала людина?')],
      options: [
        ['Добрий день, пані Гарсія.', 'c'],
        ['До побачення, пані Гарсія.', 'x', 'Adiós не звучить; у записі — buenos días.'],
        ['Дякую, пані Гарсія.', 'x', 'Gracias не звучить; у записі — buenos días.'],
      ],
      hints: [transcript([G_L], 'Buenos días, señora García.'), rule([G_L], RULE_G)],
      ok: 'Так: Buenos días, señora García — «Добрий день, пані Гарсія».',
      bad: 'Ні. У записі звучить Buenos días, señora García — «Добрий день, пані Гарсія».',
    },
    {
      n: 26, role: 'independent', family: 'listen-greeting', mode: 'choice', targets: [G_L], clips: ['clip.a1-01.hola-pablo-que-tal'],
      prompt: [uk('Послухай. Що сказала людина?')],
      options: [
        ['Привіт, Пабло, як справи?', 'c'],
        ['Привіт, Пабло, до завтра!', 'x', 'У записі звучить ¿qué tal? — «як справи?».'],
        ['Перепрошую, Пабло.', 'x', 'У записі звучить hola — «привіт».'],
      ],
      hints: [transcript([G_L], 'Hola, Pablo, ¿qué tal?')],
      ok: 'Так: Hola, Pablo, ¿qué tal? — «Привіт, Пабло, як справи?».',
      bad: 'Ні. У записі звучить Hola, Pablo, ¿qué tal? — «Привіт, Пабло, як справи?».',
    },
    {
      n: 27, role: 'independent', family: 'dictation', mode: 'exact-variants', targets: [G_D], clips: ['clip.a1-01.hola-pablo-que-tal'], policy: LOOSE,
      prompt: [uk('Послухай ще раз і запиши почуте іспанською.')],
      accepted: ['Hola, Pablo, ¿qué tal?', 'Hola, Pablo. ¿Qué tal?', '¡Hola, Pablo! ¿Qué tal?'],
      errors: [
        ['Hola Pablo, ¿qué tal?', 'u', 'Слова записані правильно, але звертання відокремлюємо комою: Hola, Pablo, ¿qué tal?'],
        ['Hola, Pablo, ¿que tal?', 'x', 'У qué є знак наголосу: ¿qué tal?'],
        ['Ola, Pablo, ¿qué tal?', 'x', 'Hola пишеться з h, хоча h не читається.'],
      ],
      hints: [transcript([G_D], 'Hola, Pablo, ¿qué tal?')],
      ref: 'Hola, Pablo, ¿qué tal?',
      ok: 'Правильно: Hola, Pablo, ¿qué tal?',
      bad: 'Ще ні. У записі: Hola, Pablo, ¿qué tal?',
      unres: U('Hola, Pablo, ¿qué tal?'),
    },
    {
      n: 28, role: 'delayed', family: 'listen-greeting', mode: 'choice', targets: [G_L], clips: ['clip.a1-01.buenas-tardes-ana'],
      prompt: [uk('Послухай привітання. Що сказала людина?')],
      options: [
        ['Добрий день, Ано! (після обіду)', 'c'],
        ['Добрий ранок, Ано!', 'x', 'Добрий ранок — buenos días; у записі buenas tardes.'],
        ['На добраніч, Ано!', 'x', 'На добраніч — buenas noches; у записі buenas tardes.'],
      ],
      hints: [transcript([G_L], 'Buenas tardes, Ana.')],
      ok: 'Так: Buenas tardes, Ana — «Добрий день, Ано» (після обіду).',
      bad: 'Ні. У записі звучить Buenas tardes, Ana — привітання після обіду.',
    },
    // ---- time of day ----
    {
      n: 29, role: 'supported', family: 'time', mode: 'choice', targets: [T_C],
      prompt: [uk(REMIND_G), uk('9:00, ти заходиш у пекарню. Як привітатися?')],
      options: [
        ['Buenos días.', 'c'],
        ['Buenas tardes.', 'x', 'Buenas tardes кажуть після обіду.'],
        ['Buenas noches.', 'x', 'Buenas noches кажуть пізно ввечері.'],
      ],
      hints: [rule([T_C], RULE_T)],
      ok: 'Так: о 9:00 — buenos días.',
      bad: 'Ні. Зранку вітаються buenos días.',
    },
    {
      n: 30, role: 'supported', family: 'time', mode: 'choice', targets: [T_C],
      prompt: [uk(REMIND_G), uk('17:00, ти телефонуєш у готель. Як привітатися?')],
      options: [
        ['Buenas tardes.', 'c'],
        ['Buenos días.', 'x', 'Після обіду в Іспанії вже кажуть buenas tardes.'],
        ['Buenas noches.', 'x', 'О 17:00 ще не пізній вечір: buenas tardes.'],
      ],
      hints: [rule([T_C], RULE_T)],
      ok: 'Так: о 17:00 — buenas tardes.',
      bad: 'Ні. Після обіду вітаються buenas tardes.',
    },
    {
      n: 31, role: 'independent', family: 'time', mode: 'choice', targets: [T_C],
      prompt: [uk('23:00, сусід повертається додому. Як привітатися?')],
      options: [
        ['Buenas noches.', 'c'],
        ['Buenas tardes.', 'x', 'О 23:00 вже кажуть buenas noches.'],
        ['Buenos días.', 'x', 'Buenos días кажуть зранку.'],
      ],
      hints: [rule([T_C], RULE_T)],
      ok: 'Так: пізно ввечері — buenas noches.',
      bad: 'Ні. О 23:00 вітаються buenas noches.',
    },
    {
      n: 32, role: 'independent', family: 'time', mode: 'choice', targets: [T_C],
      prompt: [uk('10:30, ти заходиш в аптеку. Як привітатися?')],
      options: [
        ['Buenos días.', 'c'],
        ['Buenas tardes.', 'x', 'Buenas tardes — після обіду; о 10:30 ще ранок.'],
        ['Buenas noches.', 'x', 'Buenas noches — пізно ввечері.'],
      ],
      hints: [rule([T_C], RULE_T)],
      ok: 'Так: о 10:30 — buenos días.',
      bad: 'Ні. До обіду вітаються buenos días.',
    },
    {
      n: 33, role: 'delayed', family: 'time', mode: 'choice', targets: [T_C],
      prompt: [uk('18:00, надворі ще світло; ти заходиш у кав’ярню. Як привітатися?')],
      options: [
        ['Buenas tardes.', 'c'],
        ['Buenas noches.', 'x', 'О 18:00 в Іспанії ще кажуть buenas tardes.'],
        ['Buenos días.', 'x', 'Buenos días кажуть до обіду.'],
      ],
      hints: [rule([T_C], RULE_T)],
      ok: 'Так: о 18:00 — buenas tardes.',
      bad: 'Ні. О 18:00 в Іспанії вітаються buenas tardes.',
    },
    {
      n: 34, role: 'transfer', family: 'farewell-night', mode: 'choice', targets: [T_C],
      prompt: [uk('22:30, ти йдеш додому з гостей. Яку з цих фраз можна сказати на прощання?')],
      options: [
        ['Buenas noches.', 'c'],
        ['Buenos días.', 'x', 'Buenos días кажуть зранку.'],
        ['Buenas tardes.', 'x', 'О 22:30 вже кажуть buenas noches.'],
      ],
      hints: [rule([T_C], RULE_T)],
      ok: 'Так: пізно ввечері на прощання кажуть buenas noches — «на добраніч».',
      bad: 'Ні. Пізно ввечері прощаються buenas noches.',
    },
    // ---- leave-taking ----
    {
      n: 35, role: 'supported', family: 'meaning', mode: 'choice', targets: [L_M],
      prompt: [uk('Пам’ятай: adiós — «до побачення», hasta luego — «бувай, до зустрічі», hasta mañana — «до завтра».'), uk('Що означає ця фраза?'), es('Hasta mañana.')],
      options: [
        ['До завтра.', 'c'],
        ['Добрий ранок.', 'x', 'Добрий ранок — buenos días.'],
        ['Дякую.', 'x', 'Дякую — gracias.'],
      ],
      hints: [rule([L_M], RULE_L)],
      ok: 'Так: hasta mañana — «до завтра».',
      bad: 'Ні. Hasta mañana — «до завтра».',
    },
    {
      n: 36, role: 'independent', family: 'meaning', mode: 'choice', targets: [L_M],
      prompt: [uk('Колега о 15:00 йде з офісу й каже:'), es('¡Hasta luego!'), uk('Що це означає?')],
      options: [
        ['Бувай, до зустрічі!', 'c'],
        ['Добрий день!', 'x', 'Hasta luego — прощання, а не привітання.'],
        ['Нема за що!', 'x', 'Нема за що — de nada.'],
      ],
      hints: [rule([L_M], RULE_L)],
      ok: 'Так: hasta luego — «бувай, до зустрічі».',
      bad: 'Ні. Hasta luego — щоденне прощання: «бувай, до зустрічі».',
    },
    {
      n: 37, role: 'independent', family: 'recall', mode: 'exact-variants', targets: [L_R], policy: LOOSE,
      prompt: [uk('Напиши іспанською: «До завтра».')],
      accepted: ['Hasta mañana.', '¡Hasta mañana!'],
      errors: [
        ['Hasta manana.', 'x', 'У mañana потрібна літера ñ: hasta mañana.'],
        ['¡Hasta manana!', 'x', 'У mañana потрібна літера ñ: hasta mañana.'],
      ],
      hints: [rule([L_R], RULE_L), reveal(es('Hasta mañana.'))],
      ref: 'Hasta mañana.',
      ok: 'Правильно: Hasta mañana.',
      bad: 'Ще ні. «До завтра» — Hasta mañana.',
      unres: U('Hasta mañana.'),
    },
    {
      n: 38, role: 'delayed', family: 'recall', mode: 'exact-variants', targets: [L_R], policy: LOOSE,
      prompt: [uk('Напиши іспанською щоденне прощання «Бувай, до зустрічі».')],
      accepted: ['Hasta luego.', '¡Hasta luego!'],
      errors: [
        ['Asta luego.', 'x', 'Hasta пишеться з h, хоча h не читається.'],
        ['¡Asta luego!', 'x', 'Hasta пишеться з h, хоча h не читається.'],
      ],
      hints: [rule([L_R], RULE_L), reveal(es('Hasta luego.'))],
      ref: 'Hasta luego.',
      ok: 'Правильно: Hasta luego.',
      bad: 'Ще ні. «Бувай, до зустрічі» — Hasta luego.',
      unres: U('Hasta luego.'),
    },
    {
      n: 39, role: 'independent', family: 'listen-farewell', mode: 'choice', targets: [L_L], clips: ['clip.a1-01.hasta-luego-pablo'],
      prompt: [uk('Послухай. Що сказала людина?')],
      options: [
        ['Бувай, Пабло!', 'c'],
        ['Привіт, Пабло!', 'x', 'Hola — «привіт»; у записі hasta luego — прощання.'],
        ['Дякую, Пабло!', 'x', 'Gracias не звучить; у записі hasta luego.'],
      ],
      hints: [transcript([L_L], '¡Hasta luego, Pablo!')],
      ok: 'Так: ¡Hasta luego, Pablo! — «Бувай, Пабло!».',
      bad: 'Ні. У записі звучить ¡Hasta luego, Pablo! — «Бувай, Пабло!».',
    },
    {
      n: 40, role: 'independent', family: 'dictation', mode: 'exact-variants', targets: [L_D], clips: ['clip.a1-01.hasta-luego-pablo'], policy: LOOSE,
      prompt: [uk('Послухай ще раз і запиши почуте іспанською.')],
      accepted: ['¡Hasta luego, Pablo!', 'Hasta luego, Pablo.'],
      errors: [
        ['Hasta luego Pablo.', 'u', 'Слова записані правильно, але звертання відокремлюємо комою: Hasta luego, Pablo.'],
        ['¡Asta luego, Pablo!', 'x', 'Hasta пишеться з h, хоча h не читається.'],
        ['Asta luego, Pablo.', 'x', 'Hasta пишеться з h, хоча h не читається.'],
      ],
      hints: [transcript([L_D], '¡Hasta luego, Pablo!')],
      ref: '¡Hasta luego, Pablo!',
      ok: 'Правильно: ¡Hasta luego, Pablo!',
      bad: 'Ще ні. У записі: ¡Hasta luego, Pablo!',
      unres: U('¡Hasta luego, Pablo!'),
    },
    {
      n: 41, role: 'delayed', family: 'listen-farewell', mode: 'choice', targets: [L_L], clips: ['clip.a1-01.hasta-manana-garcia'],
      prompt: [uk('Послухай. Що сказала людина?')],
      options: [
        ['До завтра, пані Гарсія.', 'c'],
        ['Добрий ранок, пані Гарсія.', 'x', 'Добрий ранок — buenos días; у записі hasta mañana.'],
        ['Дякую, пані Гарсія.', 'x', 'Gracias не звучить; у записі hasta mañana.'],
      ],
      hints: [transcript([L_L], 'Hasta mañana, señora García.')],
      ok: 'Так: Hasta mañana, señora García — «До завтра, пані Гарсія».',
      bad: 'Ні. У записі звучить Hasta mañana, señora García — «До завтра, пані Гарсія».',
    },
    // ---- please / thanks ----
    {
      n: 42, role: 'supported', family: 'situation', mode: 'choice', targets: [PT_M],
      prompt: [uk('Пам’ятай: por favor — «будь ласка» у проханні, gracias — «дякую», de nada — «нема за що».'), uk('Тобі кажуть «Gracias». Що відповісти?')],
      options: [
        ['De nada.', 'c'],
        ['Por favor.', 'x', 'Por favor — «будь ласка» у проханні. У відповідь на подяку кажуть de nada.'],
        ['Lo siento.', 'x', 'Lo siento — «мені шкода».'],
      ],
      hints: [rule([PT_M], RULE_PT)],
      ok: 'Так: на gracias відповідають de nada.',
      bad: 'Ні. На подяку відповідають de nada — «нема за що».',
    },
    {
      n: 43, role: 'independent', family: 'meaning', mode: 'choice', targets: [PT_M],
      prompt: [uk('У кав’ярні відвідувач каже:'), es('Un café, por favor.'), uk('Що означає por favor у цій фразі?')],
      options: [
        ['будь ласка', 'c'],
        ['дякую', 'x', 'Дякую — gracias.'],
        ['нема за що', 'x', 'Нема за що — de nada.'],
      ],
      hints: [rule([PT_M], RULE_PT), gloss(ex('un café', 'кава (одна чашка)'))],
      ok: 'Так: por favor — «будь ласка» у проханні.',
      bad: 'Ні. Por favor — «будь ласка».',
    },
    {
      n: 44, role: 'independent', family: 'recall', mode: 'exact-variants', targets: [PT_R], policy: LOOSE,
      prompt: [uk('Тобі подякували. Напиши іспанською: «Нема за що».')],
      accepted: ['De nada.'],
      errors: [['Por favor.', 'x', 'Por favor кажуть у проханні. У відповідь на подяку — de nada.']],
      hints: [rule([PT_R], RULE_PT), reveal(es('De nada.'))],
      ref: 'De nada.',
      ok: 'Правильно: De nada.',
      bad: 'Ще ні. «Нема за що» — De nada.',
      unres: U('De nada.'),
    },
    {
      n: 45, role: 'delayed', family: 'recall', mode: 'exact-variants', targets: [PT_R], policy: LOOSE,
      prompt: [uk('Напиши іспанською: «Дуже дякую».')],
      accepted: ['Muchas gracias.', '¡Muchas gracias!'],
      errors: [
        ['Muchos gracias.', 'x', 'У цій фразі muchas: muchas gracias.'],
        ['¡Muchos gracias!', 'x', 'У цій фразі muchas: muchas gracias.'],
      ],
      hints: [rule([PT_R], RULE_PT), reveal(es('Muchas gracias.'))],
      ref: 'Muchas gracias.',
      ok: 'Правильно: Muchas gracias.',
      bad: 'Ще ні. «Дуже дякую» — Muchas gracias.',
      unres: U('Muchas gracias.'),
    },
    {
      n: 46, role: 'independent', family: 'listen-thanks', mode: 'choice', targets: [PT_L], clips: ['clip.a1-01.muchas-gracias-garcia'],
      prompt: [uk('Послухай. Що сказала людина?')],
      options: [
        ['Дуже дякую, пане Гарсія.', 'c'],
        ['Будь ласка, пане Гарсія.', 'x', 'Por favor не звучить; у записі muchas gracias.'],
        ['Мені шкода, пане Гарсія.', 'x', 'Lo siento не звучить; у записі muchas gracias.'],
      ],
      hints: [transcript([PT_L], 'Muchas gracias, señor García.')],
      ok: 'Так: Muchas gracias, señor García — «Дуже дякую, пане Гарсія».',
      bad: 'Ні. У записі звучить Muchas gracias, señor García — «Дуже дякую, пане Гарсія».',
    },
    {
      n: 47, role: 'independent', family: 'dictation', mode: 'exact-variants', targets: [PT_D], clips: ['clip.a1-01.muchas-gracias-garcia'], policy: LOOSE,
      prompt: [uk('Послухай ще раз і запиши почуте іспанською.')],
      accepted: ['Muchas gracias, señor García.', '¡Muchas gracias, señor García!'],
      errors: [
        ['Muchas gracias señor García.', 'u', 'Слова записані правильно, але звертання відокремлюємо комою: Muchas gracias, señor García.'],
        ['Muchas gracias, senor García.', 'x', 'У señor потрібна літера ñ.'],
        ['Muchas gracias, señor Garcia.', 'x', 'У прізвищі García є знак наголосу над í.'],
      ],
      hints: [transcript([PT_D], 'Muchas gracias, señor García.')],
      ref: 'Muchas gracias, señor García.',
      ok: 'Правильно: Muchas gracias, señor García.',
      bad: 'Ще ні. У записі: Muchas gracias, señor García.',
      unres: U('Muchas gracias, señor García.'),
    },
    {
      n: 48, role: 'delayed', family: 'listen-thanks', mode: 'choice', targets: [PT_L], clips: ['clip.a1-01.si-por-favor'],
      prompt: [uk('Тобі пропонують каву. Послухай відповідь. Що вона означає?')],
      options: [
        ['Так, будь ласка.', 'c'],
        ['Ні, дякую.', 'x', 'У записі звучить sí, por favor — «так, будь ласка».'],
        ['Так, дякую.', 'x', 'Gracias не звучить; у записі por favor — «будь ласка».'],
      ],
      hints: [transcript([PT_L], 'Sí, por favor.')],
      ok: 'Так: Sí, por favor — «Так, будь ласка».',
      bad: 'Ні. У записі звучить Sí, por favor — «Так, будь ласка».',
    },
    // ---- apology ----
    {
      n: 49, role: 'supported', family: 'situation', mode: 'choice', targets: [A_M],
      prompt: [uk('Пам’ятай: perdón — «перепрошую», коли заважаєш або звертаєшся; lo siento — «мені шкода», коли щось сталося.'), uk('Ти випадково штовхнув когось у черзі. Що сказати?')],
      options: [
        ['Perdón.', 'c'],
        ['De nada.', 'x', 'De nada — «нема за що».'],
        ['Hasta luego.', 'x', 'Hasta luego — прощання.'],
      ],
      hints: [rule([A_M], RULE_A)],
      ok: 'Так: perdón — «перепрошую».',
      bad: 'Ні. Коли випадково заважаєш, кажуть perdón.',
    },
    {
      n: 50, role: 'independent', family: 'meaning', mode: 'choice', targets: [A_M],
      prompt: [uk('Подруга пише, що захворіла й не прийде. Ти відповідаєш:'), es('Lo siento mucho.'), uk('Що означає твоя відповідь?')],
      options: [
        ['Мені дуже шкода.', 'c'],
        ['Дуже дякую.', 'x', 'Дуже дякую — muchas gracias.'],
        ['Перепрошую, що заважаю.', 'x', 'Так кажуть perdón; lo siento mucho — «мені дуже шкода».'],
      ],
      hints: [rule([A_M], RULE_A)],
      ok: 'Так: lo siento mucho — «мені дуже шкода».',
      bad: 'Ні. Lo siento mucho — «мені дуже шкода».',
    },
    {
      n: 51, role: 'independent', family: 'recall', mode: 'exact-variants', targets: [A_R], policy: LOOSE,
      prompt: [uk('Напиши іспанською: «Мені дуже шкода».')],
      accepted: ['Lo siento mucho.'],
      errors: [['Lo siento.', 'x', 'Це «мені шкода». Щоб сказати «дуже», додай mucho: lo siento mucho.']],
      hints: [rule([A_R], RULE_A), reveal(es('Lo siento mucho.'))],
      ref: 'Lo siento mucho.',
      ok: 'Правильно: Lo siento mucho.',
      bad: 'Ще ні. «Мені дуже шкода» — Lo siento mucho.',
      unres: U('Lo siento mucho.'),
    },
    {
      n: 52, role: 'delayed', family: 'recall', mode: 'exact-variants', targets: [A_R], policy: LOOSE,
      prompt: [uk('Ти хочеш пройти повз людину в автобусі. Напиши одним словом, що скажеш: «Перепрошую».')],
      accepted: ['Perdón.', '¡Perdón!'],
      errors: [
        ['Perdon.', 'x', 'Perdón пишеться зі знаком наголосу над ó.'],
        ['¡Perdon!', 'x', 'Perdón пишеться зі знаком наголосу над ó.'],
      ],
      hints: [rule([A_R], RULE_A), reveal(es('Perdón.'))],
      ref: 'Perdón.',
      ok: 'Правильно: Perdón.',
      bad: 'Ще ні. «Перепрошую» — Perdón.',
      unres: U('Perdón.'),
    },
    {
      n: 53, role: 'independent', family: 'listen-apology', mode: 'choice', targets: [A_L], clips: ['clip.a1-01.lo-siento-pablo'],
      prompt: [uk('Послухай. Що сказала людина?')],
      options: [
        ['Мені шкода, Пабло.', 'c'],
        ['Дякую, Пабло.', 'x', 'Gracias не звучить; у записі lo siento.'],
        ['Бувай, Пабло.', 'x', 'Hasta luego не звучить; у записі lo siento.'],
      ],
      hints: [transcript([A_L], 'Lo siento, Pablo.')],
      ok: 'Так: Lo siento, Pablo — «Мені шкода, Пабло».',
      bad: 'Ні. У записі звучить Lo siento, Pablo — «Мені шкода, Пабло».',
    },
    {
      n: 54, role: 'independent', family: 'dictation', mode: 'exact-variants', targets: [A_D], clips: ['clip.a1-01.lo-siento-pablo'], policy: LOOSE,
      prompt: [uk('Послухай ще раз і запиши почуте іспанською.')],
      accepted: ['Lo siento, Pablo.'],
      errors: [['Lo sento, Pablo.', 'x', 'У siento після s пишемо ie: lo siento.'], ['Lo siento Pablo.', 'u', 'Слова записані правильно, але звертання відокремлюємо комою: Lo siento, Pablo.']],
      hints: [transcript([A_D], 'Lo siento, Pablo.')],
      ref: 'Lo siento, Pablo.',
      ok: 'Правильно: Lo siento, Pablo.',
      bad: 'Ще ні. У записі: Lo siento, Pablo.',
      unres: U('Lo siento, Pablo.'),
    },
    {
      n: 55, role: 'delayed', family: 'listen-apology', mode: 'choice', targets: [A_L], clips: ['clip.a1-01.lo-siento-mucho-garcia'],
      prompt: [uk('Послухай. Що сказала людина?')],
      options: [
        ['Мені дуже шкода, пані Гарсія.', 'c'],
        ['Дуже дякую, пані Гарсія.', 'x', 'Muchas gracias не звучить; у записі lo siento mucho.'],
        ['Добрий день, пані Гарсія.', 'x', 'У записі lo siento mucho — «мені дуже шкода».'],
      ],
      hints: [transcript([A_L], 'Lo siento mucho, señora García.')],
      ok: 'Так: Lo siento mucho, señora García — «Мені дуже шкода, пані Гарсія».',
      bad: 'Ні. У записі звучить Lo siento mucho, señora García — «Мені дуже шкода, пані Гарсія».',
    },
  ],
  clips: [
    clip({ id: 'clip.a1-01.buenos-dias-garcia', lessonId: 'A1-01-L3', kind: 'phrase', family: 'greeting-formal', transcript: 'Buenos días, señora García.', translationUk: 'Добрий день, пані Гарсія.', targets: [G_L] }),
    clip({ id: 'clip.a1-01.hola-pablo-que-tal', lessonId: 'A1-01-L3', kind: 'phrase', family: 'greeting-friend', transcript: 'Hola, Pablo, ¿qué tal?', translationUk: 'Привіт, Пабло, як справи?', targets: [G_L, G_D] }),
    clip({ id: 'clip.a1-01.buenas-tardes-ana', lessonId: 'A1-01-L3', kind: 'phrase', family: 'greeting-afternoon', transcript: 'Buenas tardes, Ana.', translationUk: 'Добрий день, Ано (після обіду).', targets: [G_L] }),
    clip({ id: 'clip.a1-01.hasta-luego-pablo', lessonId: 'A1-01-L3', kind: 'phrase', family: 'farewell-friend', transcript: '¡Hasta luego, Pablo!', translationUk: 'Бувай, Пабло!', targets: [L_L, L_D], pronunciationNoteUk: 'H у hasta не читається.' }),
    clip({ id: 'clip.a1-01.hasta-manana-garcia', lessonId: 'A1-01-L3', kind: 'phrase', family: 'farewell-formal', transcript: 'Hasta mañana, señora García.', translationUk: 'До завтра, пані Гарсія.', targets: [L_L] }),
    clip({ id: 'clip.a1-01.muchas-gracias-garcia', lessonId: 'A1-01-L3', kind: 'phrase', family: 'thanks-formal', transcript: 'Muchas gracias, señor García.', translationUk: 'Дуже дякую, пане Гарсія.', targets: [PT_L, PT_D] }),
    clip({ id: 'clip.a1-01.si-por-favor', lessonId: 'A1-01-L3', kind: 'phrase', family: 'offer-reply', transcript: 'Sí, por favor.', translationUk: 'Так, будь ласка.', targets: [PT_L] }),
    clip({ id: 'clip.a1-01.lo-siento-pablo', lessonId: 'A1-01-L3', kind: 'phrase', family: 'apology-friend', transcript: 'Lo siento, Pablo.', translationUk: 'Мені шкода, Пабло.', targets: [A_L, A_D] }),
    clip({ id: 'clip.a1-01.lo-siento-mucho-garcia', lessonId: 'A1-01-L3', kind: 'phrase', family: 'apology-formal', transcript: 'Lo siento mucho, señora García.', translationUk: 'Мені дуже шкода, пані Гарсія.', targets: [A_L] }),
  ],
  materials: [
    material({
      id: 'material.a1-01.letters-punctuation-phrases',
      topicId: 'A1-01',
      titleUk: 'Іспанські літери, розділові знаки й ввічливі фрази',
      blocks: [
        uk('Коротка довідка до блоку A1-01: що писати зі знаками і які фрази вчимо цілими.'),
        tableUk(['Що', 'Як пишемо', 'Приклад'], [
          ['знак наголосу', '´ над наголошеною голосною', 'café, sí, adiós, número'],
          ['літера ñ', 'окрема літера, не n і не ny', 'España, año, mañana'],
          ['літера ü', 'лише в güe, güi, коли u читається', 'pingüino, bilingüe'],
          ['питання', '¿ на початку, ? в кінці', 'Hola, ¿qué tal?'],
          ['оклик', '¡ на початку, ! в кінці', 'Ana, ¡muchas gracias!'],
          ['звертання', 'відокремлюємо комою', 'Gracias, Pablo.'],
          ['велика літера', 'початок речення, імена, міста, країни', 'Buenos días, señora García.'],
        ]),
        tableUk(['Фраза', 'Значення'], [
          ['Hola. / ¿Qué tal?', 'привіт / як справи?'],
          ['Buenos días. / Buenas tardes. / Buenas noches.', 'до обіду / після обіду / пізно ввечері'],
          ['Adiós. / Hasta luego. / Hasta mañana.', 'до побачення / бувай / до завтра'],
          ['Por favor. / Gracias. / De nada.', 'будь ласка / дякую / нема за що'],
          ['Perdón. / Lo siento.', 'перепрошую / мені шкода'],
        ]),
        link('Потренувати написання', ['ortho.accented-vowels/written-form', 'ortho.n-tilde/written-form', 'ortho.written-accent.familiar-words/written-form', Q_W, E_W, C_W, P_W], 'written', 10),
        link('Потренувати фрази', [G_R, L_R, PT_R, A_R, G_M, L_M, PT_M, A_M, T_C], 'written', 10),
        link('Послухати фрази', ['listening.familiar-words/listening-meaning', G_L, L_L, PT_L, A_L], 'listening', 8),
      ],
      linkedTargets: [
        'ortho.accented-vowels/written-form', 'ortho.n-tilde/written-form', 'ortho.u-dieresis/written-form', 'ortho.written-accent.familiar-words/written-form',
        Q_W, E_W, C_W, P_W, G_R, L_R, PT_R, A_R, 'listening.familiar-words/listening-meaning', G_L, L_L, PT_L, A_L,
      ],
    }),
  ],
};
