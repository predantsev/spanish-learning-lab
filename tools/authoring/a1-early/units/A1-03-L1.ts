// A1-03-L1 — the short sentence: subject pronouns, ser forms, person mapping, subject omission,
// tú/tu and él/el (CV-03).
import { ex, tableUk, uk, ulUk, es } from '../lib.ts';
import type { OutcomeSpec, TaskSpec, Unit } from '../lib.ts';
import { pick, typed } from '../common.ts';
import type { TaskRole } from '../../../content/types.ts';

const PS_W = 'pron.subject/written-form';
const PS_C = 'pron.subject/context-choice';
const PS_R = 'pron.subject/reading-meaning';
const PP_W = 'pron.subject.plural/written-form';
const PP_C = 'pron.subject.plural/context-choice';
const PP_R = 'pron.subject.plural/reading-meaning';
const TU_C = 'pron.tu-usted/context-choice';
const VO_C = 'pron.vosotros-ustedes/context-choice';
const SER_W = 'present.ser/written-form';
const SER_C = 'present.ser/context-choice';
const MAP_C = 'pron.person-mapping/context-choice';
const OM_R = 'pron.subject-omission/reading-meaning';
const OM_U = 'pron.subject-omission/construction-use';
const ATU_C = 'ortho.accent-pair.tu/context-choice';
const ATU_W = 'ortho.accent-pair.tu/written-form';
const AEL_C = 'ortho.accent-pair.el/context-choice';
const AEL_W = 'ortho.accent-pair.el/written-form';
const ST_U = 'writing.short-statement/construction-use';

const R: Record<string, string> = {
  [PS_W]: 'Yo — «я», tú — «ти», él — «він», ella — «вона», usted — ввічливе «Ви» до однієї людини.',
  [PP_W]: 'Nosotros — «ми», vosotros — «ви» (кільком людям на «ти»), ellos — «вони», ustedes — ввічливе «ви» до кількох. Якщо в групі лише жінки: nosotras, vosotras, ellas.',
  [SER_W]: 'Форми дієслова ser: yo soy, tú eres, él/ella/usted es, nosotros somos, vosotros sois, ellos/ellas/ustedes son.',
  [OM_U]: 'Форма дієслова вже показує особу, тому займенник часто пропускають: Soy Ana. Займенник додають для наголосу чи протиставлення.',
  [ATU_W]: 'Tú зі знаком — «ти»: Tú eres Ana. Tu без знака — «твій, твоя»: tu casa, tu nuevo libro. Tu стоїть перед іменником (між ними може бути прикметник), після tú — зазвичай дієслово.',
  [AEL_W]: 'Él зі знаком — «він»: Él es Pablo. El без знака — артикль: el libro, el nuevo libro. Артикль стоїть перед іменником (між ними може бути прикметник).',
  [ST_U]: 'Просте речення: (хто) + дієслово + решта: Ana es mi amiga. Дієслово не пропускаємо, навіть коли в українській його немає.',
};
// The tú/él accent hints also model the written pronoun itself, so they support pron.subject when it is assessed.
const rulesOf = (targets: string[]): Array<[string[], string]> =>
  targets.filter((t) => R[t]).map((t) => [(t === ATU_W || t === AEL_W) && targets.includes(PS_W) ? [t, PS_W] : [t], R[t] as string]);

// Flagged in three review batches (A1-03-L1.r1, .r2, .r3): repair cap reached (brief 13, round 2),
// so these tasks are quarantined instead of being repaired a third time.
const QUARANTINED = new Set([1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 45]);

function t(n: number, role: TaskRole, family: string, targets: string[], prompt: string, answer: string, errors: Array<[string, OutcomeSpec, string]>, why: string, opts: { also?: Array<string | [string, string]>; support?: string; shown?: string } = {}): TaskSpec {
  return typed({
    n, role, family, targets,
    prompt: [...(opts.support ? [uk(opts.support)] : []), uk(prompt), ...(opts.shown ? [es(opts.shown)] : [])],
    answer, errors, rules: rulesOf(targets), why, ...(opts.also ? { also: opts.also } : {}),
  });
}

export const unit: Unit = {
  lesson: {
    id: 'A1-03-L1',
    titleUk: 'Коротке речення: хто + ser',
    termEs: 'la oración simple con ser',
    summaryUk: 'Вивчиш особові займенники (yo, tú, él… nosotros, vosotros, ellos), усі форми дієслова ser і навчишся будувати коротке речення. Розрізниш tú і tu, él і el.',
    objectives: ['A1-03-O1'],
    cv: ['CV-03'],
    situations: [],
    estimatedMinutes: 20,
    introduces: ['pron.subject', 'pron.subject.plural', 'pron.tu-usted', 'pron.vosotros-ustedes', 'present.ser', 'pron.person-mapping', 'pron.subject-omission', 'ortho.accent-pair.tu', 'ortho.accent-pair.el', 'writing.short-statement'],
    revisits: ['poss.mi-tu-su', 'article.definite', 'noun.gender.people', 'text.grammar-terms'],
    steps: [
      {
        kind: 'explanation',
        title: 'Частина 1. Хто: займенники',
        blocks: [
          tableUk(['Особа', 'Однина', 'Множина'], [
            ['1-ша', 'yo — я', 'nosotros / nosotras — ми'],
            ['2-га', 'tú — ти', 'vosotros / vosotras — ви (кільком на «ти»)'],
            ['3-тя', 'él — він, ella — вона, usted — Ви (ввічливо)', 'ellos / ellas — вони, ustedes — ви (ввічливо, кільком)'],
          ]),
          uk('Форми на -as — коли в групі лише жінки: nosotras, vosotras, ellas. Якщо група змішана — nosotros, vosotros, ellos.'),
          uk('Tú — до друга, родича, дитини, колеги; в Іспанії на «ти» говорять дуже часто. Usted — ввічливо до незнайомої старшої людини чи в офіційній ситуації. До кількох людей на «ти» в Іспанії кажуть vosotros, ввічливо — ustedes. Usted і ustedes поєднуються з формою дієслова 3-ї особи, як él чи ellos.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Частина 1. Дієслово ser',
        blocks: [
          uk('Ser («бути») — перше дієслово курсу, його форми треба запам’ятати. В українській «є» часто пропускають («Я — Ана»), а в іспанській дієслово потрібне: Soy Ana.'),
          tableEs(),
          uk('Ім’я чи іменник в однині — це «він/вона»: Ana es mi amiga. Якщо в групі є я — завжди «ми»: Ana y yo somos amigas, tú y yo somos amigos. Ти і ще хтось, але без мене, — vosotros: Pablo y tú sois amigos.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Частина 1. Займенник можна пропустити',
        blocks: [
          uk('Форма дієслова вже показує особу, тому займенник часто пропускають: Soy Ana. Somos amigos. Займенник додають, щоб підкреслити чи протиставити: Yo soy Ana, y él es Pablo. Якщо з форми es незрозуміло, хто це — він, вона чи Ви, — назви підмет.'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 1. Тренування з підказкою', tasks: [60, 1, 11, 21, 26, 31, 36, 41, 46, 51] },
      { kind: 'independent-practice', title: 'Частина 1. Самостійно', tasks: [62, 52, 22, 2, 61, 27, 53, 12, 32, 3, 28, 54, 37, 23, 42, 63, 55, 38, 47, 13, 33, 43, 48, 56] },
      {
        kind: 'explanation',
        title: 'Частина 2. Tú чи tu, él чи el',
        blocks: [
          uk('Знак наголосу розрізняє слова. Tú зі знаком — займенник «ти»: Tú eres Ana. Tu без знака — присвійне «твій, твоя»: tu casa. Él зі знаком — «він»: Él es Pablo. El без знака — артикль: el libro.'),
          uk('Як перевірити: tu та el стоять перед іменником або групою з іменником — між ними може бути прикметник (tu libro, el libro, el nuevo libro); після tú та él зазвичай іде дієслово (tú eres, él es).'),
        ],
      },
      {
        kind: 'examples',
        title: 'Приклади',
        blocks: [
          ex('Soy Ana. / Yo soy Ana.', 'Я — Ана.'),
          ex('Él es Pablo.', 'Він — Пабло.'),
          ex('Tú eres mi amiga.', 'Ти — моя подруга.'),
          ex('Es tu libro.', 'Це твоя книжка.'),
          ex('Somos estudiantes.', 'Ми студенти.'),
          ex('Vosotros sois mis amigos.', 'Ви — мої друзі.'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 2. Тренування з підказкою', tasks: [6, 16, 57] },
      { kind: 'independent-practice', title: 'Частина 2. Самостійно', tasks: [7, 17, 58, 8, 18, 59] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Ser: soy, eres, es, somos, sois, son; дієслово в реченні не пропускаємо.',
            'Займенник часто пропускають: Soy Ana = Yo soy Ana.',
            'Tú/él — «ти/він», tu/el — «твій» і артикль.',
            'До кількох на «ти» в Іспанії — vosotros; ввічливо — usted, ustedes (з формою 3-ї особи).',
          ),
        ],
      },
    ],
  },
  tasks: ([
    // A: él (+ pron.subject)
    t(1, 'supported', 'pronoun', [PS_W, AEL_W], 'Допиши займенник «він».', 'Él es Pablo.', [
      ['El es Pablo.', { [AEL_W]: 'x', [PS_W]: 'c' }, 'Займенник «він» пишеться зі знаком наголосу: él. El без знака — артикль.'],
      ['Ella es Pablo.', { [PS_W]: 'x', [AEL_W]: 'u' }, 'Ella — «вона»; «він» — él.'],
    ], 'Він — él', { support: 'Пам’ятай: él зі знаком — «він», el без знака — артикль.', shown: '___ es Pablo.', also: ['Él.'] }),
    t(2, 'independent', 'pronoun', [PS_W, AEL_W], 'Допиши займенник «він».', 'Él es mi hermano.', [
      ['El es mi hermano.', { [AEL_W]: 'x', [PS_W]: 'c' }, 'Займенник «він» пишеться зі знаком наголосу: él.'],
      ['Yo es mi hermano.', { [PS_W]: 'x', [AEL_W]: 'u' }, 'Yo — «я»; «він» — él.'],
    ], 'Він — él', { shown: '___ es mi hermano.', also: ['Él.'] }),
    t(3, 'independent', 'pronoun', [PS_W, AEL_W], 'Напиши іспанською займенник «він».', 'él', [
      ['el.', { [AEL_W]: 'x', [PS_W]: 'c' }, 'Займенник пишеться зі знаком наголосу: él.'],
      ['ella.', { [PS_W]: 'x', [AEL_W]: 'u' }, 'Ella — «вона»; «він» — él.'],
    ], 'Він — él'),
    t(4, 'delayed', 'pronoun', [PS_W, AEL_W], 'Допиши займенник «він».', 'Él es profesor.', [
      ['El es profesor.', { [AEL_W]: 'x', [PS_W]: 'c' }, 'Займенник «він» пишеться зі знаком наголосу: él.'],
    ], 'Він — él', { shown: '___ es profesor.', also: ['Él.'] }),
    t(5, 'transfer', 'chat', [PS_W, AEL_W], 'Ти пишеш у чаті, показуючи на фото: «Він — Пабло, а вона — Ана». Напиши іспанською.', 'Él es Pablo y ella es Ana.', [
      ['El es Pablo y ella es Ana.', { [AEL_W]: 'x', [PS_W]: 'c' }, 'Займенник «він» пишеться зі знаком наголосу: él.'],
      ['Él es Pablo y él es Ana.', { [PS_W]: 'x', [AEL_W]: 'c' }, 'Про Ану — ella.'],
    ], 'Él es Pablo y ella es Ana'),
    // D: el article
    t(6, 'supported', 'fill', [AEL_W], 'Допиши el або él.', 'Es el libro de Ana.', [
      ['Es él libro de Ana.', 'x', 'Перед іменником — артикль el без знака.'],
    ], 'Артикль — el', { support: 'Пам’ятай: після артикля el йде іменник.', shown: 'Es ___ libro de Ana.', also: ['el.'] }),
    t(7, 'independent', 'fill', [AEL_W], 'Допиши el або él.', 'Es el coche de Pablo.', [
      ['Es él coche de Pablo.', 'x', 'Перед іменником — артикль el без знака.'],
    ], 'Артикль — el', { shown: 'Es ___ coche de Pablo.', also: ['el.'] }),
    t(8, 'independent', 'fill', [AEL_W], 'Допиши el або él у кожен пропуск і напиши речення повністю.', 'Él es el profesor.', [
      ['El es el profesor.', 'x', 'Займенник «він» — él зі знаком.'],
      ['Él es él profesor.', 'x', 'Перед іменником — артикль el без знака.'],
      ['El es él profesor.', 'x', 'Навпаки: «він» — él, артикль — el.'],
    ], 'Él (він) + el (артикль)', { shown: '___ es ___ profesor.' }),
    t(9, 'delayed', 'fill', [AEL_W], 'Допиши el або él.', 'Es el piso de mi hermano.', [
      ['Es él piso de mi hermano.', 'x', 'Перед іменником — артикль el без знака.'],
    ], 'Артикль — el', { shown: 'Es ___ piso de mi hermano.', also: ['el.'] }),
    t(10, 'transfer', 'caption', [AEL_W], 'Підпис під фото: «Він і собака». Напиши іспанською (собака — el perro).', 'Él y el perro', [
      ['El y el perro.', 'x', '«Він» — él зі знаком.'],
      ['Él y él perro.', 'x', 'Перед іменником — артикль el без знака.'],
    ], 'Él y el perro'),
    // B: tú (+ pron.subject)
    t(11, 'supported', 'pronoun', [PS_W, ATU_W], 'Допиши займенник «ти».', 'Tú eres Ana.', [
      ['Tu eres Ana.', { [ATU_W]: 'x', [PS_W]: 'c' }, 'Займенник «ти» пишеться зі знаком наголосу: tú.'],
      ['Yo eres Ana.', { [PS_W]: 'x', [ATU_W]: 'u' }, 'Yo — «я»; з eres вживаємо tú.'],
    ], 'Ти — tú', { support: 'Пам’ятай: tú зі знаком — «ти», tu без знака — «твій».', shown: '___ eres Ana.', also: ['Tú.'] }),
    t(12, 'independent', 'pronoun', [PS_W, ATU_W], 'Допиши займенник «ти».', 'Tú eres mi amigo.', [
      ['Tu eres mi amigo.', { [ATU_W]: 'x', [PS_W]: 'c' }, 'Займенник «ти» пишеться зі знаком наголосу: tú.'],
    ], 'Ти — tú', { shown: '___ eres mi amigo.', also: ['Tú.'] }),
    t(13, 'independent', 'pronoun', [PS_W, ATU_W], 'Напиши іспанською займенник «ти».', 'tú', [
      ['tu.', { [ATU_W]: 'x', [PS_W]: 'c' }, 'Займенник пишеться зі знаком наголосу: tú.'],
      ['usted.', { [PS_W]: 'x', [ATU_W]: 'u' }, 'Usted — ввічливе «Ви»; «ти» — tú.'],
    ], 'Ти — tú'),
    t(14, 'delayed', 'pronoun', [PS_W, ATU_W], 'Допиши займенник «ти».', 'Tú eres estudiante.', [
      ['Tu eres estudiante.', { [ATU_W]: 'x', [PS_W]: 'c' }, 'Займенник «ти» пишеться зі знаком наголосу: tú.'],
    ], 'Ти — tú', { shown: '___ eres estudiante.', also: ['Tú.'] }),
    t(15, 'transfer', 'chat', [PS_W, ATU_W], 'Ти пишеш подрузі листівку. Напиши іспанською з займенником: «Ти — моя подруга».', 'Tú eres mi amiga.', [
      ['Tu eres mi amiga.', { [ATU_W]: 'x', [PS_W]: 'c' }, 'Займенник «ти» пишеться зі знаком наголосу: tú.'],
      ['Eres mi amiga.', { [PS_W]: 'u', [ATU_W]: 'u' }, 'Речення правильне, і займенник справді можна пропустити, але тут завдання — написати його: Tú eres mi amiga.'],
    ], 'Tú eres mi amiga'),
    // C: tu possessive
    t(16, 'supported', 'fill', [ATU_W], 'Допиши tu або tú.', 'Es tu libro.', [
      ['Es tú libro.', 'x', 'Перед іменником — присвійне tu без знака.'],
    ], 'Присвійне — tu', { support: 'Пам’ятай: після tu («твій») йде іменник.', shown: 'Es ___ libro.', also: ['tu.'] }),
    t(17, 'independent', 'fill', [ATU_W], 'Допиши tu або tú.', 'Es tu hermana.', [
      ['Es tú hermana.', 'x', 'Перед іменником — присвійне tu без знака.'],
    ], 'Присвійне — tu', { shown: 'Es ___ hermana.', also: ['tu.'] }),
    t(18, 'independent', 'fill', [ATU_W], 'Допиши tu або tú у кожен пропуск і напиши речення повністю.', 'Tú eres Ana y tu hermano es Pablo.', [
      ['Tu eres Ana y tu hermano es Pablo.', 'x', '«Ти» — tú зі знаком.'],
      ['Tú eres Ana y tú hermano es Pablo.', 'x', 'Перед іменником — присвійне tu без знака.'],
    ], 'Tú (ти) + tu (твій)', { shown: '___ eres Ana y ___ hermano es Pablo.' }),
    t(19, 'delayed', 'fill', [ATU_W], 'Допиши tu або tú.', 'Es tu perro.', [
      ['Es tú perro.', 'x', 'Перед іменником — присвійне tu без знака.'],
    ], 'Присвійне — tu', { shown: 'Es ___ perro.', also: ['tu.'] }),
    t(20, 'transfer', 'chat', [ATU_W], 'Ти пишеш подрузі: «Ти і твій брат». Напиши іспанською.', 'Tú y tu hermano', [
      ['Tu y tu hermano.', 'x', '«Ти» — tú зі знаком.'],
      ['Tú y tú hermano.', 'x', 'Перед іменником — присвійне tu без знака.'],
    ], 'Tú y tu hermano'),
    // E: plural pronoun + ser
    t(21, 'supported', 'pronoun-ser', [PP_W, SER_W], 'Допиши займенник і форму ser: «Ми (Ана і я, обидві жінки) — подруги».', 'Nosotras somos amigas.', [
      ['Nosotros somos amigas.', { [PP_W]: 'x', [SER_W]: 'c' }, 'У групі лише жінки, тому nosotras.'],
      ['Nosotras son amigas.', { [SER_W]: 'x', [PP_W]: 'c' }, 'З nosotras — somos.'],
      ['Somos amigas.', { [PP_W]: 'u', [SER_W]: 'c' }, 'Речення правильне, але тут треба було написати займенник: nosotras.'],
    ], 'Nosotras somos', { support: 'Пам’ятай: nosotros/nosotras somos, vosotros/vosotras sois, ellos/ellas son.', shown: '___ ___ amigas.' }),
    t(22, 'independent', 'pronoun-ser', [PP_W, SER_W], 'Допиши займенник і форму ser: «Ви (до двох друзів-хлопців, на «ти») — студенти».', 'Vosotros sois estudiantes.', [
      ['Vosotros son estudiantes.', { [SER_W]: 'x', [PP_W]: 'c' }, 'З vosotros — sois.'],
      ['Ustedes son estudiantes.', 'u', 'Ustedes — ввічливе «ви» до кількох; до друзів на «ти» в Іспанії кажуть vosotros sois. Відповідь не оцінено як помилку.'],
      ['Vosotras sois estudiantes.', { [PP_W]: 'x', [SER_W]: 'c' }, 'Друзі — хлопці, тому vosotros.'],
    ], 'Vosotros sois', { shown: '___ ___ estudiantes.' }),
    t(23, 'independent', 'pronoun-ser', [PP_W, SER_W], 'Допиши займенник і форму ser: «Вони (Пабло й Ана) — мої друзі».', 'Ellos son mis amigos.', [
      ['Ellas son mis amigos.', { [PP_W]: 'x', [SER_W]: 'c' }, 'Група змішана, тому ellos.'],
      ['Ellos sois mis amigos.', { [SER_W]: 'x', [PP_W]: 'c' }, 'З ellos — son.'],
    ], 'Ellos son', { shown: '___ ___ mis amigos.' }),
    t(24, 'delayed', 'pronoun-ser', [PP_W, SER_W], 'Допиши займенник і форму ser: «Вони (дві сестри) — студентки».', 'Ellas son estudiantes.', [
      ['Ellos son estudiantes.', { [PP_W]: 'x', [SER_W]: 'c' }, 'У групі лише жінки, тому ellas.'],
      ['Ellas es estudiantes.', { [SER_W]: 'x', [PP_W]: 'c' }, 'З ellas — son.'],
    ], 'Ellas son', { shown: '___ ___ estudiantes.' }),
    t(25, 'transfer', 'chat', [PP_W, SER_W], 'Ти пишеш двом подругам у груповому чаті: «Ви — мої подруги». Напиши іспанською з займенником.', 'Vosotras sois mis amigas.', [
      ['Vosotras son mis amigas.', { [SER_W]: 'x', [PP_W]: 'c' }, 'З vosotras — sois.'],
      ['Vosotros sois mis amigas.', { [PP_W]: 'x', [SER_W]: 'c' }, 'Подруги — лише жінки, тому vosotras.'],
      ['Ustedes son mis amigas.', 'u', 'До подруг на «ти» в Іспанії кажуть vosotras sois; ustedes — ввічливе «ви» до кількох. Відповідь не оцінено як помилку.'],
    ], 'Vosotras sois'),
    // F: plural pronoun alone
    t(26, 'supported', 'recall', [PP_W], 'Напиши займенник: «ми» (група змішана).', 'nosotros', [
      ['nosotras.', 'x', 'Група змішана, тому nosotros.'],
    ], 'Змішана група — nosotros', { support: 'Пам’ятай: -as — лише якщо всі в групі жінки.' }),
    t(27, 'independent', 'recall', [PP_W], 'Напиши займенник «вони» про кількох жінок.', 'ellas', [
      ['ellos.', 'x', 'Усі в групі жінки, тому ellas.'],
    ], 'Лише жінки — ellas'),
    t(28, 'independent', 'recall', [PP_W], 'Напиши займенник: ввічливе «ви» до кількох людей.', 'ustedes', [
      ['vosotros.', 'x', 'Vosotros — до кількох на «ти»; ввічливо — ustedes.'],
      ['usted.', 'x', 'Usted — до однієї людини; до кількох — ustedes.'],
    ], 'Ввічливо до кількох — ustedes'),
    t(29, 'delayed', 'recall', [PP_W], 'Напиши займенник «ви» до кількох подруг, з якими ти на «ти».', 'vosotras', [
      ['vosotros.', 'x', 'Усі — жінки, тому vosotras.'],
      ['ustedes.', 'u', 'Ustedes — ввічливе «ви» до кількох; до подруг на «ти» в Іспанії кажуть vosotras.'],
    ], 'Подругам — vosotras'),
    t(30, 'transfer', 'form', [PP_W], 'Ти — жінка. В анкеті на курси треба написати, хто ви з чоловіком, одним займенником «ми». Напиши його.', 'nosotros', [
      ['nosotras.', 'x', 'Пара змішана, тому nosotros.'],
    ], 'Змішана група — nosotros'),
    // G: statement + ser
    t(31, 'supported', 'sentence', [ST_U], 'Напиши речення іспанською: «Ана — моя подруга».', 'Ana es mi amiga.', [
      ['Ana mi amiga.', 'x', 'В іспанському реченні дієслово потрібне: Ana es mi amiga.'],
      ['Ana eres mi amiga.', 'u', 'Ana — «вона», тому es.'],
    ], 'Ana es mi amiga', { support: 'Пам’ятай: хто + дієслово + решта; дієслово не пропускаємо.' }),
    t(32, 'independent', 'sentence', [ST_U], 'Напиши речення іспанською: «Пабло — мій брат».', 'Pablo es mi hermano.', [
      ['Pablo mi hermano.', 'x', 'Дієслово потрібне: Pablo es mi hermano.'],
      ['Pablo son mi hermano.', 'u', 'Pablo — «він», тому es.'],
    ], 'Pablo es mi hermano'),
    t(33, 'independent', 'sentence', [ST_U], 'Напиши речення іспанською: «Ви (кілька друзів, на «ти») — мої друзі».', 'Sois mis amigos.', [
      ['Son mis amigos.', 'u', 'Son підходить для ellos або ввічливого ustedes; до друзів на «ти» в Іспанії — sois. Відповідь не оцінено як помилку.'],
      ['Vosotros mis amigos.', 'x', 'Дієслово потрібне: Vosotros sois mis amigos.'],
      ['Sois mi amigos.', 'u', 'Дієслово правильне; присвійне перед множиною — mis amigos.'],
    ], 'Sois mis amigos', { also: ['Vosotros sois mis amigos.'] }),
    t(34, 'delayed', 'sentence', [ST_U], 'Напиши речення іспанською: «Мій тато — викладач».', 'Mi padre es profesor.', [
      ['Mi padre profesor.', 'x', 'Дієслово потрібне: Mi padre es profesor.'],
      ['Mi padre soy profesor.', 'u', 'Mi padre — «він», тому es.'],
    ], 'Mi padre es profesor'),
    t(35, 'transfer', 'intro-card', [ST_U], 'Ти підписуєш фото для іспанської подруги: «Ми — студенти». Напиши іспанською.', 'Somos estudiantes.', [
      ['Nosotros estudiantes.', 'x', 'Дієслово потрібне: Somos estudiantes.'],
      ['Son estudiantes.', 'u', '«Ми» — somos.'],
    ], 'Somos estudiantes', { also: ['Nosotros somos estudiantes.', 'Nosotras somos estudiantes.'] }),
    // H: statement + omission
    t(36, 'supported', 'sentence', [ST_U, OM_U], 'Напиши речення іспанською: «Я — Пабло». Можна з займенником або без.', 'Soy Pablo.', [
      ['Yo Pablo.', { [ST_U]: 'x', [OM_U]: 'u' }, 'Дієслово потрібне: Soy Pablo.'],
    ], 'Soy Pablo', { support: 'Пам’ятай: Soy Ana = Yo soy Ana.', also: ['Yo soy Pablo.'] }),
    t(37, 'independent', 'sentence', [ST_U, OM_U], 'Напиши речення іспанською: «Я — студентка».', 'Soy estudiante.', [
      ['Yo estudiante.', { [ST_U]: 'x', [OM_U]: 'u' }, 'Дієслово потрібне: Soy estudiante.'],
    ], 'Soy estudiante', { also: ['Yo soy estudiante.'] }),
    t(38, 'independent', 'sentence', [ST_U, OM_U], 'Напиши речення іспанською: «Ми — брати» (hermanos).', 'Somos hermanos.', [
      ['Nosotros hermanos.', { [ST_U]: 'x', [OM_U]: 'u' }, 'Дієслово потрібне: Somos hermanos.'],
    ], 'Somos hermanos', { also: ['Nosotros somos hermanos.'] }),
    t(39, 'delayed', 'sentence', [ST_U, OM_U], 'Напиши речення іспанською: «Я — Ана».', 'Soy Ana.', [
      ['Yo Ana.', { [ST_U]: 'x', [OM_U]: 'u' }, 'Дієслово потрібне: Soy Ana.'],
    ], 'Soy Ana', { also: ['Yo soy Ana.'] }),
    t(40, 'transfer', 'chat', [ST_U, OM_U], 'Нова знайома в чаті питає, хто ти. Напиши іспанською: «Я — студент».', 'Soy estudiante.', [
      ['Yo estudiante.', { [ST_U]: 'x', [OM_U]: 'u' }, 'Дієслово потрібне: Soy estudiante.'],
    ], 'Soy estudiante', { also: ['Yo soy estudiante.'] }),
    // O: omission rewrite
    t(41, 'supported', 'rewrite', [OM_U], 'Перепиши речення без займенника.', 'Somos amigos.', [
      ['Nosotros somos amigos.', 'x', 'Займенник лишився; форма somos уже показує «ми».'],
    ], 'Somos amigos', { support: 'Пам’ятай: форма дієслова вже показує особу.', shown: 'Nosotros somos amigos.' }),
    t(42, 'independent', 'rewrite', [OM_U], 'Перепиши речення без займенника.', 'Eres mi amiga.', [
      ['Tú eres mi amiga.', 'x', 'Займенник лишився; форма eres уже показує «ти».'],
      ['Es mi amiga.', 'x', 'Es — «він, вона, Ви»; без займенника «ти» — eres.'],
    ], 'Eres mi amiga', { shown: 'Tú eres mi amiga.' }),
    t(43, 'independent', 'rewrite', [OM_U], 'Перепиши речення без займенника.', 'Sois estudiantes.', [
      ['Vosotros sois estudiantes.', 'x', 'Займенник лишився; форма sois уже показує «ви».'],
    ], 'Sois estudiantes', { shown: 'Vosotros sois estudiantes.' }),
    t(44, 'delayed', 'rewrite', [OM_U], 'Перепиши речення без займенника.', 'Soy profesora.', [
      ['Yo soy profesora.', 'x', 'Займенник лишився; форма soy уже показує «я».'],
    ], 'Soy profesora', { shown: 'Yo soy profesora.' }),
    t(45, 'transfer', 'contrast', [OM_U], 'Ти пишеш новому знайомому про себе й колегу, якого він ще не бачив: «Я — студентка, а він — викладач». Напиши іспанською (а — y).', 'Yo soy estudiante y él es profesor.', [
      ['Soy estudiante y es profesor.', 'x', 'Без él незрозуміло, хто викладач: es може означати «він», «вона» чи «Ви». Додай él; yo можна залишити або пропустити.'],
      ['Yo soy estudiante y el es profesor.', 'u', 'Займенники на місці, але «він» — él зі знаком наголосу.'],
    ], 'Yo soy estudiante y él es profesor', { also: ['Soy estudiante y él es profesor.'] }),
    // ser forms
    t(46, 'supported', 'fill', [SER_W], 'Допиши форму ser.', 'Yo soy Ana.', [
      ['Yo es Ana.', 'x', 'З yo — soy.'],
      ['Yo eres Ana.', 'x', 'Eres — з tú; з yo — soy.'],
    ], 'Yo soy', { support: 'Пам’ятай: soy, eres, es, somos, sois, son.', shown: 'Yo ___ Ana.', also: ['soy.'] }),
    t(47, 'independent', 'fill', [SER_W], 'Допиши форму ser.', 'Ellos son mis padres.', [
      ['Ellos es mis padres.', 'x', 'З ellos — son.'],
      ['Ellos sois mis padres.', 'x', 'Sois — з vosotros; з ellos — son.'],
    ], 'Ellos son', { shown: 'Ellos ___ mis padres.', also: ['son.'] }),
    t(48, 'independent', 'fill', [SER_W], 'Допиши форму ser.', 'Usted es la profesora.', [
      ['Usted eres la profesora.', 'x', 'Usted поєднується з формою 3-ї особи: es.'],
    ], 'Usted es', { shown: 'Usted ___ la profesora.', also: ['es.'] }),
    t(49, 'delayed', 'fill', [SER_W], 'Допиши форму ser.', 'Tú eres mi hermano.', [
      ['Tú es mi hermano.', 'x', 'З tú — eres.'],
    ], 'Tú eres', { shown: 'Tú ___ mi hermano.', also: ['eres.'] }),
    t(50, 'delayed', 'fill', [SER_W], 'Допиши форму ser.', 'Ustedes son los profesores.', [
      ['Ustedes sois los profesores.', 'x', 'Ustedes поєднується з формою 3-ї особи множини: son.'],
    ], 'Ustedes son', { shown: 'Ustedes ___ los profesores.', also: ['son.'] }),
    // choices
    pick({ n: 51, role: 'supported', family: 'choose', targets: [MAP_C], prompt: [uk('Пам’ятай: якщо в групі є я — «ми»; ти і хтось, але без мене, — vosotros; кілька інших людей — «вони».'), es('Ana y yo ___ amigas.')], options: [['somos', 'c'], ['son', 'x', 'Ana y yo — це «ми»: somos.'], ['es', 'x', 'Підмет — дві людини разом зі мною: somos.']], rules: [[[MAP_C], 'Ана і я — це «ми» (nosotras), тому somos.']], ok: 'Так: Ana y yo somos amigas.', bad: 'Ні. Ana y yo = «ми» → somos.' }),
    pick({ n: 52, role: 'independent', family: 'choose', targets: [MAP_C], prompt: [es('Pablo y tú ___ hermanos.')], options: [['sois', 'c'], ['son', 'x', 'Pablo y tú — це «ви» (vosotros): sois.'], ['somos', 'x', '«Ми» — якщо серед них є я; тут ти і Пабло.']], rules: [[[MAP_C], 'Ти і ще хтось, але без мене, = vosotros → sois. Якщо в групі є я — «ми»: somos.']], ok: 'Так: Pablo y tú sois hermanos.', bad: 'Ні. Pablo y tú = vosotros → sois.' }),
    pick({ n: 53, role: 'independent', family: 'choose', targets: [MAP_C], prompt: [es('Mi amigo ___ estudiante.')], options: [['es', 'c'], ['soy', 'x', 'Mi amigo — «він»: es.'], ['son', 'x', 'Підмет в однині: es.']], rules: [[[MAP_C], 'Іменник в однині — «він/вона» → es.']], ok: 'Так: Mi amigo es estudiante.', bad: 'Ні. Mi amigo — «він» → es.' }),
    pick({ n: 54, role: 'independent', family: 'choose', targets: [TU_C], prompt: [uk('У банку ти офіційно, ввічливо звертаєшся до літньої незнайомої пані й питаєш, чи вона — пані Гарсія. Як до неї звернутися?')], options: [['usted', 'c'], ['tú', 'x', 'До незнайомої старшої людини в офіційній ситуації — usted.']], rules: [[[TU_C], 'Usted — ввічливо до незнайомої старшої людини чи в офіційній ситуації; tú — до друзів, родичів, колег.']], ok: 'Так: тут доречне usted.', bad: 'Ні. Тут доречне ввічливе usted.' }),
    pick({ n: 55, role: 'independent', family: 'choose', targets: [VO_C], prompt: [uk('Ти звертаєшся до двох однокурсників у кав’ярні в Мадриді. Як сказати «ви»?')], options: [['vosotros', 'c'], ['ellos', 'x', 'Ellos — «вони», а не «ви».']], rules: [[[VO_C], 'До кількох людей на «ти» в Іспанії — vosotros; ввічливо — ustedes.']], ok: 'Так: vosotros.', bad: 'Ні. До однокурсників на «ти» — vosotros.' }),
    pick({ n: 56, role: 'independent', family: 'choose', targets: [SER_C], prompt: [es('Nosotros ___ profesores.')], options: [['somos', 'c'], ['sois', 'x', 'Sois — з vosotros.'], ['son', 'x', 'Son — з ellos.']], rules: [[[SER_C], R[SER_W] as string]], ok: 'Так: somos.', bad: 'Ні. З nosotros — somos.' }),
    pick({ n: 57, role: 'supported', family: 'choose', targets: [ATU_C], prompt: [uk('Пам’ятай: tú — «ти», tu — «твій».'), es('___ casa es grande.'), uk('Яке слово тут — «твій»?')], options: [['Tu', 'c'], ['Tú', 'x', 'Перед іменником — присвійне tu без знака.']], rules: [[[ATU_C], R[ATU_W] as string]], ok: 'Так: Tu casa — «твій дім».', bad: 'Ні. Перед іменником — tu.' }),
    pick({ n: 58, role: 'independent', family: 'choose', targets: [AEL_C], prompt: [es('___ es mi amigo.'), uk('Що потрібно в пропуску?')], options: [['Él', 'c'], ['El', 'x', 'Тут потрібен займенник «він» — él; el без знака — артикль.']], rules: [[[AEL_C], R[AEL_W] as string]], ok: 'Так: Él es mi amigo.', bad: 'Ні. «Він» — él.' }),
    pick({ n: 59, role: 'independent', family: 'meaning', targets: [OM_R], prompt: [uk('Що означає речення?'), es('Somos de Kiev.')], options: [['Ми з Києва.', 'c'], ['Вони з Києва.', 'x', 'Somos — «ми».'], ['Я з Києва.', 'x', '«Я» — soy.']], rules: [[[OM_R], 'Форма дієслова показує особу: somos — «ми», навіть без nosotros.']], extraHints: [{ kind: 'translation', targets: [], blocks: [ex('de Kiev', 'з Києва')] }], ok: 'Так: somos — «ми».', bad: 'Ні. Somos — «ми»: Ми з Києва.' }),
    pick({ n: 60, role: 'supported', family: 'meaning', targets: [PS_R], prompt: [uk('Що означає займенник?'), es('ella')], options: [['вона', 'c'], ['він', 'x', '«Він» — él.'], ['Ви', 'x', '«Ви» — usted.']], rules: [[[PS_R], R[PS_W] as string]], ok: 'Так: ella — «вона».', bad: 'Ні. Ella — «вона».' }),
    pick({ n: 61, role: 'independent', family: 'meaning', targets: [PP_R], prompt: [uk('Що означає займенник?'), es('vosotras')], options: [['ви (кільком жінкам, на «ти»)', 'c'], ['вони (жінки)', 'x', '«Вони» — ellas.'], ['ми (жінки)', 'x', '«Ми» — nosotras.']], rules: [[[PP_R], R[PP_W] as string]], ok: 'Так.', bad: 'Ні. Vosotras — «ви» до кількох жінок на «ти».' }),
    pick({ n: 62, role: 'independent', family: 'choose', targets: [PS_C], prompt: [uk('Ти розповідаєш про сестру. Який займенник?'), es('___ es mi hermana.')], options: [['Ella', 'c'], ['Él', 'x', 'Él — «він».'], ['Yo', 'x', 'Yo — «я»; з yo — soy.']], rules: [[[PS_C], R[PS_W] as string]], ok: 'Так: Ella es mi hermana.', bad: 'Ні. Про сестру — ella.' }),
    pick({ n: 63, role: 'independent', family: 'choose', targets: [PP_C], prompt: [uk('Ти розповідаєш про двох подруг. Який займенник?'), es('___ son mis amigas.')], options: [['Ellas', 'c'], ['Ellos', 'x', 'Обидві — жінки, тому ellas.'], ['Nosotras', 'x', 'Nosotras — «ми»; з ним — somos.']], rules: [[[PP_C], R[PP_W] as string]], ok: 'Так: Ellas son mis amigas.', bad: 'Ні. Про двох подруг — ellas.' }),
    pick({ n: 64, role: 'delayed', family: 'choose', targets: [TU_C], prompt: [uk('Ти пишеш повідомлення своїй сестрі. Як до неї звертатися?')], options: [['tú', 'c'], ['usted', 'x', 'До сестри — на «ти»: tú.']], rules: [[[TU_C], 'Tú — до друзів, родичів, колег; usted — ввічливо, офіційно.']], ok: 'Так: tú.', bad: 'Ні. До сестри — tú.' }),
    pick({ n: 65, role: 'delayed', family: 'choose', targets: [VO_C], prompt: [uk('Ти вітаєш на офіційній зустрічі двох незнайомих літніх панів. Як сказати «ви»?')], options: [['ustedes', 'c'], ['vosotros', 'x', 'Vosotros — до кількох людей на «ти»; офіційно — ustedes.']], rules: [[[VO_C], 'Ввічливо до кількох — ustedes; на «ти» — vosotros.']], ok: 'Так: ustedes.', bad: 'Ні. Офіційно до кількох — ustedes.' }),
  ] as TaskSpec[]).map((spec) => (QUARANTINED.has(spec.n) ? { ...spec, status: 'quarantined' as const } : spec)),
};

function tableEs() {
  return tableUk(['Займенник', 'Ser', 'Приклад'], [
    ['yo', 'soy', 'Soy Ana.'],
    ['tú', 'eres', 'Eres mi amigo.'],
    ['él / ella / usted', 'es', 'Es mi hermana.'],
    ['nosotros / nosotras', 'somos', 'Somos estudiantes.'],
    ['vosotros / vosotras', 'sois', 'Sois mis amigos.'],
    ['ellos / ellas / ustedes', 'son', 'Son mis padres.'],
  ]);
}
