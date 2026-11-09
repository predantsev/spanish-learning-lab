// A1-03-L2 — ser for identity, origin, nationality, profession and description; introductions
// (CV-01), a synthetic personal-data form (CV-06), first short-sentence listening.
import { clip, ex, gloss, tableEs, tableUk, transcript, uk, ulUk, es, LOOSE } from '../lib.ts';
import type { OutcomeSpec, TaskSpec, Unit } from '../lib.ts';
import type { Block } from '../../../content/types.ts';
import { U, pick, typed } from '../common.ts';
import type { TaskRole } from '../../../content/types.ts';

const ID_U = 'ser.identity/construction-use';
const ID_C = 'ser.identity/context-choice';
const OR_U = 'ser.origin/construction-use';
const OR_W = 'ser.origin/written-form';
const OR_C = 'ser.origin/context-choice';
const NA_U = 'ser.nationality/construction-use';
const NA_C = 'ser.nationality/context-choice';
const AN_W = 'adj.agreement.nationality/written-form';
const AN_C = 'adj.agreement.nationality/context-choice';
const PR_U = 'ser.profession/construction-use';
const PR_C = 'ser.profession/context-choice';
const DS_U = 'ser.description/construction-use';
const DS_C = 'ser.description/context-choice';
const FI_P = 'formula.introduction/phrase-recall';
const FI_R = 'formula.introduction/reading-meaning';
const FI_L = 'formula.introduction/listening-meaning';
const PD_R = 'text.personal-data-form/reading-meaning';
const PD_W = 'text.personal-data-form/written-form';
const LS_L = 'listening.short-sentences/listening-meaning';
const LS_D = 'listening.short-sentences/dictation';

const R: Record<string, string> = {
  [ID_U]: 'Щоб сказати, хто або що це, вживаємо ser: Soy Ana. Es mi hermano. Es un libro. Українське «це» перед іменником часто відповідає просто es: «Це моя сестра» — Es mi hermana. Про кількох — son: Son mis amigos.',
  [OR_U]: 'Звідки людина — ser de + місто чи країна: Soy de Kiev. Ana es de Madrid. Прийменник de обов’язковий: не «Soy Kiev», а Soy de Kiev. Питання: ¿De dónde eres? — «Звідки ти?».',
  [NA_U]: 'Національність — ser + прикметник, узгоджений з людиною: Soy ucraniano (каже чоловік), Soy ucraniana (каже жінка), Somos ucranianos. Національності пишуться з малої літери.',
  [AN_W]: 'Національності на приголосну мають жіночу форму на -a: español — española, inglés — inglesa, francés — francesa, alemán — alemana. У жіночому роді й у множині знак наголосу зникає: inglés, але inglesa, ingleses; alemán — alemanes.',
  [PR_U]: 'Коли називаємо професію чи рід занять, після ser артикль зазвичай не ставимо: Soy profesora. Pablo es médico. Somos estudiantes.',
  [DS_U]: 'Ser + прикметник описує, яка людина чи річ є — вигляд, характер, риси: Ana es alta. El piso es pequeño. Прикметник узгоджується з підметом у роді й числі.',
  [FI_P]: 'Me llamo Ana — «мене звати Ана». ¿Cómo te llamas? — «як тебе звати?», ввічливо: ¿Cómo se llama usted? Encantado (каже чоловік), Encantada (каже жінка) або Mucho gusto — «приємно познайомитися». Представити когось: Este es Pablo, Esta es Ana.',
  [PD_W]: 'В анкеті поле заповнюють коротко, без речення: Nombre: Ana. Nacionalidad: ucraniana. País: Ucrania.',
};
R[OR_W] = R[OR_U] as string;
const rulesOf = (targets: string[]): Array<[string[], string]> => targets.filter((t) => R[t]).map((t) => [[t], R[t] as string]);

interface Opts {
  also?: Array<string | [string, string]>;
  support?: string;
  shown?: string;
  gl?: Block[];
}
function t(n: number, role: TaskRole, family: string, targets: string[], prompt: string, answer: string, errors: Array<[string, OutcomeSpec, string]>, why: string, opts: Opts = {}): TaskSpec {
  return typed({
    n, role, family, targets,
    prompt: [...(opts.support ? [uk(opts.support)] : []), uk(prompt), ...(opts.shown ? [es(opts.shown)] : [])],
    answer, errors, rules: rulesOf(targets), why,
    ...(opts.also ? { also: opts.also } : {}),
    ...(opts.gl ? { extraHints: [gloss(...opts.gl)] } : {}),
  });
}
const Y: Block[] = [ex('y', 'і, та; а')];

const FORM_LUCIA: Block = tableEs(['Campo', 'Datos'], [
  ['Nombre', 'Lucía'],
  ['Apellidos', 'García López'],
  ['Nacionalidad', 'española'],
  ['Ciudad', 'Valencia'],
  ['País', 'España'],
  ['Teléfono', '600 123 456'],
  ['Correo electrónico', 'lucia.garcia@ejemplo.es'],
]);
const FORM_TARAS: Block = tableEs(['Campo', 'Datos'], [
  ['Nombre', 'Taras'],
  ['Apellidos', 'Kovalenko'],
  ['Nacionalidad', 'ucraniana'],
  ['Ciudad', 'Madrid'],
  ['País', 'España'],
  ['Correo electrónico', 'taras.k@ejemplo.es'],
]);

export const unit: Unit = {
  lesson: {
    id: 'A1-03-L2',
    titleUk: 'Ser: хто, звідки, ким працює і яка людина',
    termEs: 'usos de ser',
    summaryUk: 'Навчишся казати, хто це, звідки людина, якої вона національності, ким працює і яка вона, а також знайомитися й заповнювати просту анкету. Почуєш перші короткі речення на слух.',
    objectives: ['A1-03-O1', 'A1-03-O2'],
    cv: ['CV-01', 'CV-03', 'CV-06'],
    situations: ['greetings-introductions'],
    estimatedMinutes: 20,
    introduces: ['ser.identity', 'ser.origin', 'ser.nationality', 'adj.agreement.nationality', 'ser.profession', 'ser.description', 'formula.introduction', 'text.personal-data-form', 'listening.short-sentences'],
    revisits: ['present.ser', 'pron.subject', 'pron.subject.plural', 'pron.subject-omission', 'writing.short-statement', 'adj.agreement.o-a', 'adj.agreement.invariable-gender', 'noun.gender.people', 'poss.mi-tu-su', 'formula.greeting'],
    steps: [
      {
        kind: 'explanation',
        title: 'Частина 1. Хто це і звідки',
        blocks: [
          uk('Ser відповідає на питання «хто це? що це?». Українське «це» перед іменником часто передається просто формою es: «Це мій брат» — Es mi hermano. Про кількох — son: Son mis amigos. Питання «Хто це?» — ¿Quién es?'),
          uk('Звідки людина — ser de + місто чи країна: Soy de Kiev. Ana es de Madrid. Прийменник de обов’язковий. Щоб спитати: ¿De dónde eres? — «Звідки ти?».'),
          tableUk(['Українською', 'Іспанською'], [
            ['Це моя сестра.', 'Es mi hermana.'],
            ['Це мої батьки.', 'Son mis padres.'],
            ['Я з Києва.', 'Soy de Kiev.'],
            ['Ми з України.', 'Somos de Ucrania.'],
          ]),
        ],
      },
      {
        kind: 'explanation',
        title: 'Частина 1. Національність',
        blocks: [
          uk('Національність — ser + прикметник, який узгоджується з людиною: Soy ucraniano (каже чоловік), Soy ucraniana (каже жінка), Somos ucranianos. В іспанській національності пишуться з малої літери.'),
          uk('Прикметники національності на приголосну — виняток: вони мають жіночу форму на -a. Знак наголосу в жіночому роді й у множині зникає.'),
          tableEs(['Él', 'Ella', 'Ellos', 'Ellas'], [
            ['ucraniano', 'ucraniana', 'ucranianos', 'ucranianas'],
            ['español', 'española', 'españoles', 'españolas'],
            ['inglés', 'inglesa', 'ingleses', 'inglesas'],
            ['francés', 'francesa', 'franceses', 'francesas'],
            ['alemán', 'alemana', 'alemanes', 'alemanas'],
          ]),
        ],
      },
      {
        kind: 'examples',
        title: 'Частина 1. Приклади',
        blocks: [
          ex('Es mi hermano Pablo.', 'Це мій брат Пабло.'),
          ex('¿De dónde eres? — Soy de Lviv.', 'Звідки ти? — Я зі Львова.'),
          ex('Ana es española y Taras es ucraniano.', 'Ана — іспанка, а Тарас — українець.'),
          ex('Mis amigas son inglesas.', 'Мої подруги — англійки.'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 1. Тренування з підказкою', tasks: [1, 2, 13, 14, 25, 26] },
      { kind: 'independent-practice', title: 'Частина 1. Самостійно', tasks: [3, 15, 27, 11, 4, 16, 28, 23, 5, 17, 29, 35, 6, 18, 30, 37] },
      {
        kind: 'explanation',
        title: 'Частина 2. Професія і опис',
        blocks: [
          uk('Коли називаємо професію чи рід занять, після ser артикль зазвичай не ставимо: Soy profesora. Pablo es médico. Mis hermanos son camareros. У простому повідомленні про професію «Soy una profesora» звучить неприродно; артикль з’являється в інших значеннях, які ми поки не вивчаємо.'),
          uk('Ser + прикметник описує, яка людина чи річ є: вигляд, характер, риси. Прикметник узгоджується з підметом: Ana es alta. Pablo es moreno. Mis amigos son simpáticos. La casa es bonita.'),
          tableUk(['Слово', 'Значення'], [
            ['médico / médica', 'лікар / лікарка'],
            ['camarero / camarera', 'офіціант / офіціантка'],
            ['ingeniero / ingeniera', 'інженер / інженерка'],
            ['programador / programadora', 'програміст / програмістка'],
            ['guapo, rubio, moreno', 'гарний (про людину), білявий, темноволосий'],
          ]),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 2. Тренування з підказкою', tasks: [38, 39, 49, 50] },
      { kind: 'independent-practice', title: 'Частина 2. Самостійно', tasks: [40, 51, 48, 41, 52, 42, 53, 59, 43, 54] },
      {
        kind: 'explanation',
        title: 'Частина 3. Знайомство й анкета',
        blocks: [
          uk('Цілі фрази для знайомства (граматику всередині них вивчатимемо пізніше): Me llamo Ana — «мене звати Ана». ¿Cómo te llamas? — «як тебе звати?», ввічливо: ¿Cómo se llama usted? Відповідь: Encantado (якщо говорить чоловік), Encantada (якщо жінка) або Mucho gusto — «приємно познайомитися». Представити когось: Este es Pablo, Esta es Ana.'),
          uk('В анкеті кожне поле має підпис: Nombre — ім’я, Apellidos — прізвище (в Іспанії людина зазвичай має два прізвища), Nacionalidad — громадянство, Ciudad — місто, País — країна, Teléfono — телефон, Correo electrónico — електронна пошта. Поле заповнюють коротко, без речення.'),
          ex('— Hola, me llamo Pablo. ¿Cómo te llamas? — Me llamo Ana. — Encantado. — Encantada.', '— Привіт, мене звати Пабло. Як тебе звати? — Мене звати Ана. — Приємно познайомитися. — Приємно познайомитися.'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 3. Знайомство', tasks: [60, 65, 61, 62] },
      { kind: 'reading', title: 'Частина 3. Анкета', blocks: [uk('Прочитай синтетичні анкети (дані вигадані) і заповни поля. Підписи полів — у поясненні вище.')], tasks: [69, 71, 70, 72] },
      { kind: 'listening', title: 'Частина 3. Послухай', clips: ['clip.a1-03.me-llamo-pablo', 'clip.a1-03.soy-de-valencia', 'clip.a1-03.ana-es-medica'], tasks: [67, 75, 76, 77] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Хто це: Es mi hermano. Son mis amigos. ¿Quién es?',
            'Звідки: Soy de Kiev. ¿De dónde eres?',
            'Національність: Soy ucraniana; español — española, inglés — inglesa (без знака наголосу).',
            'Професія без артикля: Soy profesora. Pablo es médico.',
            'Опис: Ana es alta. Mis amigos son simpáticos.',
            'Знайомство: Me llamo…, ¿Cómo te llamas?, Encantado / Encantada, Mucho gusto.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- ser.identity ----------
    t(1, 'supported', 'this-is', [ID_U], 'Напиши іспанською: «Це мій брат».', 'Es mi hermano.', [
      ['Mi hermano.', 'x', 'Потрібне дієслово: «це» перед іменником — es.'],
    ], '«Це мій брат»', { support: 'Пам’ятай: «Це …» перед іменником — es: Es mi amiga.', also: ['Este es mi hermano.', 'Él es mi hermano.'] }),
    t(2, 'supported', 'who', [ID_U], 'Напиши іспанською: «Це Пабло».', 'Es Pablo.', [
      ['Pablo.', 'x', 'Потрібне дієслово: Es Pablo.'],
    ], '«Це Пабло»', { support: 'Пам’ятай: «Це …» — es.', also: ['Este es Pablo.', 'Él es Pablo.'] }),
    t(3, 'independent', 'this-is', [ID_U], 'Напиши іспанською: «Це моя сестра».', 'Es mi hermana.', [
      ['Mi hermana.', 'x', 'Потрібне дієслово: Es mi hermana.'],
      ['Es mi hermano.', 'u', 'Hermano — «брат»; «сестра» — hermana.'],
    ], '«Це моя сестра»', { also: ['Esta es mi hermana.', 'Ella es mi hermana.'] }),
    t(4, 'independent', 'this-is', [ID_U], 'Напиши іспанською: «Це книжка».', 'Es un libro.', [
      ['Un libro.', 'x', 'Потрібне дієслово: Es un libro.'],
      ['Es libro.', 'u', 'Дієслово на місці, але перед іменником тут потрібен артикль: un libro.'],
    ], '«Це книжка»', { also: [['Esto es un libro.', 'Esto («це») ми ще не вивчали, але речення правильне.']] }),
    t(5, 'independent', 'people', [ID_U], 'Напиши іспанською: «Це мої друзі».', 'Son mis amigos.', [
      ['Es mis amigos.', 'x', 'Друзів кілька, тому son: Son mis amigos.'],
      ['Mis amigos.', 'x', 'Потрібне дієслово: Son mis amigos.'],
    ], '«Це мої друзі»', { also: ['Ellos son mis amigos.', ['Estos son mis amigos.', 'Estos — форма множини від este; правильно.']] }),
    t(6, 'independent', 'who', [ID_U], 'Напиши іспанською: «Це моя мама».', 'Es mi madre.', [
      ['Mi madre.', 'x', 'Потрібне дієслово: Es mi madre.'],
    ], '«Це моя мама»', { also: ['Esta es mi madre.', 'Ella es mi madre.', ['Es mi mamá.', 'Mamá — розмовне «мама»; правильно.'], ['Esta es mi mamá.', 'Mamá — розмовне «мама»; правильно.']] }),
    t(7, 'delayed', 'this-is', [ID_U], 'Напиши іспанською: «Це мій кіт».', 'Es mi gato.', [
      ['Mi gato.', 'x', 'Потрібне дієслово: Es mi gato.'],
    ], '«Це мій кіт»', { also: ['Este es mi gato.'] }),
    t(8, 'delayed', 'people', [ID_U], 'Напиши іспанською: «Це мої батьки».', 'Son mis padres.', [
      ['Es mis padres.', 'x', 'Батьків двоє, тому son: Son mis padres.'],
      ['Mis padres.', 'x', 'Потрібне дієслово: Son mis padres.'],
    ], '«Це мої батьки»', { also: ['Ellos son mis padres.', ['Estos son mis padres.', 'Estos — форма множини від este; правильно.']] }),
    t(9, 'transfer', 'photo', [ID_U], 'Ти показуєш подрузі фото й пишеш: «Це мій брат Пабло». Напиши іспанською.', 'Es mi hermano Pablo.', [
      ['Mi hermano Pablo.', 'x', 'Потрібне дієслово: Es mi hermano Pablo.'],
    ], '«Це мій брат Пабло»', { also: ['Este es mi hermano Pablo.', 'Él es mi hermano Pablo.'] }),
    t(10, 'transfer', 'door', [ID_U], 'Хтось дзвонить у двері. Ти питаєш іспанською: «Хто це?»', '¿Quién es?', [
      ['¿Quien es?', 'u', 'Питання правильне, але quién пишеться зі знаком наголосу: ¿Quién es?'],
      ['¿Quién?', 'u', 'Так теж можна спитати, але тут потрібне повне питання з дієсловом: ¿Quién es?'],
    ], '«Хто це?»', { gl: [ex('quién', 'хто')] }),
    pick({
      n: 11, role: 'independent', family: 'choose-photo', targets: [ID_C],
      prompt: [uk('Ти показуєш колезі фото своєї сестри. Що написати під фото?')],
      options: [['Es mi hermana.', 'c'], ['Mi hermana es.', 'x', 'Дієслово стоїть перед тим, ким є людина: Es mi hermana.'], ['Soy mi hermana.', 'x', 'Soy — «я є»; про сестру — es.']],
      rules: [[[ID_C], R[ID_U] as string]],
      ok: 'Так: Es mi hermana — «Це моя сестра».', bad: 'Ні. «Це моя сестра» — Es mi hermana.',
    }),
    pick({
      n: 12, role: 'delayed', family: 'choose-photo', targets: [ID_C],
      prompt: [uk('Ти показуєш фото двох своїх друзів і пишеш під ним повне речення з ser: «Це мої друзі». Яке речення правильне?')],
      options: [['Son mis amigos.', 'c'], ['Es mis amigos.', 'x', 'Друзів двоє, тому son.'], ['Mis amigos.', 'x', 'Як короткий підпис це можливо, але тут потрібне повне речення з ser: Son mis amigos.']],
      rules: [[[ID_C], R[ID_U] as string]],
      ok: 'Так: Son mis amigos.', bad: 'Ні. Про кількох — Son mis amigos.',
    }),
    // ---------- ser.origin ----------
    t(13, 'supported', 'fill', [OR_W], 'Допиши пропущене слово (можна написати лише його або все речення): «Я з Києва».', 'Soy de Kiev.', [
      ['Soy Kiev.', 'x', 'Після ser перед містом потрібне de: Soy de Kiev.'],
    ], 'Soy de + місто', { support: 'Пам’ятай: звідки людина — ser de + місто чи країна.', shown: 'Soy ___ Kiev.', also: ['de.', 'Soy de Kyiv.'] }),
    t(14, 'supported', 'sentence', [OR_U], 'Напиши іспанською: «Ана з Мадрида».', 'Ana es de Madrid.', [
      ['Ana es Madrid.', 'x', 'Перед містом потрібне de: Ana es de Madrid.'],
      ['Ana de Madrid.', 'x', 'Потрібне дієслово: Ana es de Madrid.'],
    ], 'Ser de + місто', { support: 'Пам’ятай: ser de + місто: Soy de Kiev.' }),
    t(15, 'independent', 'sentence', [OR_U], 'Напиши іспанською: «Я з України».', 'Soy de Ucrania.', [
      ['Soy Ucrania.', 'x', 'Перед країною потрібне de: Soy de Ucrania.'],
      ['Soy de Ukrania.', 'u', 'Конструкція правильна, але Україна іспанською пишеться Ucrania.'],
    ], 'Soy de + країна', { also: ['Yo soy de Ucrania.'] }),
    t(16, 'independent', 'sentence', [OR_U], 'Напиши іспанською: «Ми з Києва».', 'Somos de Kiev.', [
      ['Somos Kiev.', 'x', 'Перед містом потрібне de: Somos de Kiev.'],
    ], 'Somos de + місто', { also: ['Nosotros somos de Kiev.', 'Nosotras somos de Kiev.', 'Somos de Kyiv.', 'Nosotros somos de Kyiv.', 'Nosotras somos de Kyiv.'] }),
    t(17, 'independent', 'fill', [OR_W], 'Допиши дієслово й прийменник і напиши речення повністю: «Пабло й Ана із Севільї».', 'Pablo y Ana son de Sevilla.', [
      ['Pablo y Ana son Sevilla.', 'x', 'Перед містом потрібне de.'],
      ['Pablo y Ana es de Sevilla.', 'u', 'De на місці, але Pablo y Ana — «вони», тому son.'],
    ], 'Son de + місто', { shown: 'Pablo y Ana ___ ___ Sevilla.' }),
    t(18, 'independent', 'question', [OR_U], 'Спитай іспанською друга: «Звідки ти?»', '¿De dónde eres?', [
      ['¿Dónde eres?', 'x', 'Коли питаємо про походження, de стоїть перед dónde: ¿De dónde eres?'],
      ['¿De donde eres?', 'u', 'Питання правильне, але dónde пишеться зі знаком наголосу.'],
      ['¿De dónde es?', 'u', 'Так питають ввічливо (usted) або про третю особу; другові — ¿De dónde eres?'],
    ], '«Звідки ти?»'),
    t(19, 'delayed', 'sentence', [OR_U], 'Напиши іспанською: «Мій тато з Одеси».', 'Mi padre es de Odesa.', [
      ['Mi padre es Odesa.', 'x', 'Перед містом потрібне de.'],
      ['Mi padre de Odesa.', 'x', 'Потрібне дієслово: Mi padre es de Odesa.'],
    ], 'Es de + місто', { also: ['Mi padre es de Odessa.'] }),
    t(20, 'delayed', 'fill', [OR_W], 'Допиши пропущене слово (можна написати лише його або все речення): «Мої друзі з Барселони».', 'Mis amigos son de Barcelona.', [
      ['Mis amigos son Barcelona.', 'x', 'Перед містом потрібне de.'],
    ], 'Son de + місто', { shown: 'Mis amigos son ___ Barcelona.', also: ['de.'] }),
    t(21, 'transfer', 'chat', [OR_U], 'Нова знайома в чаті питає: «¿De dónde eres?». Відповідай реченням: «Я зі Львова».', 'Soy de Lviv.', [
      ['Soy Lviv.', 'x', 'Перед містом потрібне de: Soy de Lviv.'],
    ], 'Soy de + місто', { also: ['Yo soy de Lviv.', 'Soy de Leópolis.', 'Yo soy de Leópolis.'] }),
    t(22, 'transfer', 'caption', [OR_U], 'Ти підписуєш фото з друзями повним реченням з ser: «Мої друзі — з Іспанії».', 'Mis amigos son de España.', [
      ['Mis amigos son España.', 'x', 'Перед країною потрібне de.'],
      ['Mis amigos es de España.', 'u', 'De на місці, але друзів кілька — son.'],
    ], 'Son de + країна'),
    pick({
      n: 23, role: 'independent', family: 'choose-origin', targets: [OR_C],
      prompt: [uk('Ана народилася в Мадриді. Як сказати, звідки вона?')],
      options: [['Ana es de Madrid.', 'c'], ['Ana es Madrid.', 'x', 'Без de це не означає «з Мадрида».'], ['Ana de Madrid.', 'x', 'Бракує дієслова es.']],
      rules: [[[OR_C], R[OR_U] as string]],
      ok: 'Так: Ana es de Madrid.', bad: 'Ні. Звідки людина — ser de: Ana es de Madrid.',
    }),
    pick({
      n: 24, role: 'delayed', family: 'choose-origin', targets: [OR_C],
      prompt: [uk('Ти хочеш дізнатися в нового знайомого, звідки він. Яке питання доречне?')],
      options: [['¿De dónde eres?', 'c'], ['¿Dónde eres?', 'x', 'Про походження питають з de: ¿De dónde eres?'], ['¿Quién eres?', 'x', '¿Quién eres? — «хто ти?», а не «звідки ти?».']],
      rules: [[[OR_C], R[OR_U] as string]],
      extraHints: [gloss(ex('quién', 'хто'))],
      ok: 'Так: ¿De dónde eres? — «Звідки ти?».', bad: 'Ні. «Звідки ти?» — ¿De dónde eres?',
    }),
    // ---------- ser.nationality (+ adj.agreement.nationality) ----------
    t(25, 'supported', 'self', [NA_U], 'Напиши іспанською: «Я українка» (говорить жінка).', 'Soy ucraniana.', [
      ['Soy ucraniano.', 'x', 'Говорить жінка, тому ucraniana.'],
      ['Soy de Ucrania.', 'u', 'Речення правильне, але означає «Я з України»; тут потрібна національність: ucraniana.'],
    ], 'Soy + національність', { support: 'Пам’ятай: національність — ser + прикметник у роді людини: ucraniano / ucraniana.', also: ['Yo soy ucraniana.'] }),
    t(26, 'supported', 'other', [NA_U, AN_W], 'Напиши іспанською: «Ана — іспанка».', 'Ana es española.', [
      ['Ana es español.', { [AN_W]: 'x', [NA_U]: 'c' }, 'Ана — жінка: español → española.'],
      ['Ana es espanola.', { [AN_W]: 'u', [NA_U]: 'c' }, 'Форма правильна, але бракує літери ñ: española.'],
    ], 'Es + española', { support: 'Пам’ятай: español → española (жіночий рід на -a).' }),
    t(27, 'independent', 'self', [NA_U], 'Напиши іспанською: «Ми українці» (група змішана).', 'Somos ucranianos.', [
      ['Somos ucranianas.', 'x', 'Група змішана, тому ucranianos.'],
      ['Somos ucraniano.', 'x', 'Нас кілька, тому множина: ucranianos.'],
    ], 'Somos + національність у множині', { also: ['Nosotros somos ucranianos.'] }),
    t(28, 'independent', 'other', [NA_U, AN_W], 'Напиши іспанською: «Пабло — іспанець».', 'Pablo es español.', [
      ['Pablo es española.', { [AN_W]: 'x', [NA_U]: 'c' }, 'Пабло — чоловік: español.'],
      ['Pablo es espanol.', { [AN_W]: 'u', [NA_U]: 'c' }, 'Бракує літери ñ: español.'],
    ], 'Es + español'),
    t(29, 'independent', 'other', [NA_U, AN_W], 'Напиши іспанською: «Мої подруги — англійки».', 'Mis amigas son inglesas.', [
      ['Mis amigas son inglésas.', { [AN_W]: 'x', [NA_U]: 'c' }, 'У жіночому роді знак наголосу зникає: inglesas.'],
      ['Mis amigas son ingleses.', { [AN_W]: 'x', [NA_U]: 'c' }, 'Подруги — жінки: inglesas.'],
      ['Mis amigas es inglesas.', { [NA_U]: 'u', [AN_W]: 'c' }, 'Inglesas правильно, але подруг кілька — son.'],
    ], 'Son + inglesas'),
    t(30, 'independent', 'self', [NA_U, AN_W], 'Напиши іспанською: «Я француженка» (говорить жінка).', 'Soy francesa.', [
      ['Soy francésa.', { [AN_W]: 'x', [NA_U]: 'c' }, 'У жіночому роді знак наголосу зникає: francesa.'],
      ['Soy francés.', { [AN_W]: 'x', [NA_U]: 'c' }, 'Говорить жінка: francesa.'],
    ], 'Soy + francesa', { also: ['Yo soy francesa.'] }),
    t(31, 'delayed', 'other', [NA_U], 'Напиши іспанською: «Вона українка».', 'Es ucraniana.', [
      ['Es ucraniano.', 'x', 'Про жінку — ucraniana.'],
    ], 'Es + ucraniana', { also: ['Ella es ucraniana.'] }),
    t(32, 'delayed', 'other', [NA_U, AN_W], 'Напиши іспанською: «Мої батьки — німці».', 'Mis padres son alemanes.', [
      ['Mis padres son alemánes.', { [AN_W]: 'x', [NA_U]: 'c' }, 'У множині знак наголосу зникає: alemanes.'],
      ['Mis padres son alemanos.', { [AN_W]: 'x', [NA_U]: 'c' }, 'Alemán у множині — alemanes.'],
    ], 'Son + alemanes'),
    t(33, 'transfer', 'chat', [NA_U], 'Іспанський друг у чаті питає про твою національність. Напиши: «Я українець» (ти — чоловік).', 'Soy ucraniano.', [
      ['Soy ucraniana.', 'x', 'Пише чоловік, тому ucraniano.'],
    ], 'Soy + ucraniano', { also: ['Yo soy ucraniano.'] }),
    t(34, 'transfer', 'caption', [NA_U, AN_W], 'Підпис під фото: «Ана й Лусія — іспанки».', 'Ana y Lucía son españolas.', [
      ['Ana y Lucía son españoles.', { [AN_W]: 'x', [NA_U]: 'c' }, 'Обидві — жінки: españolas.'],
      ['Ana y Lucía son española.', { [AN_W]: 'x', [NA_U]: 'c' }, 'Їх дві — множина: españolas.'],
    ], 'Son + españolas'),
    pick({
      n: 35, role: 'independent', family: 'choose-form', targets: [AN_C],
      prompt: [uk('Мама — з Англії. Яка форма потрібна?'), es('Mi madre es ___.')],
      options: [['inglesa', 'c'], ['inglés', 'x', 'Мама — жінка: inglesa.'], ['inglésa', 'x', 'У жіночому роді знак наголосу зникає: inglesa.']],
      rules: [[[AN_C], R[AN_W] as string]],
      ok: 'Так: Mi madre es inglesa.', bad: 'Ні. Про жінку — inglesa, без знака наголосу.',
    }),
    t(36, 'delayed', 'fill', [AN_W], 'Допиши національність (Німеччина); можна написати лише її або все речення.', 'Ella es alemana.', [
      ['Ella es alemán.', 'x', 'Про жінку — alemana.'],
      ['Ella es alemána.', 'x', 'У жіночому роді знак наголосу зникає: alemana.'],
    ], 'Alemán → alemana', { shown: 'Ella es ___.', also: ['alemana.'] }),
    pick({
      n: 37, role: 'independent', family: 'choose-self', targets: [NA_C],
      prompt: [uk('Ти — жінка з України. Як написати про свою національність?')],
      options: [['Soy ucraniana.', 'c'], ['Soy ucraniano.', 'x', 'Про жінку — ucraniana.'], ['Soy Ucrania.', 'x', 'Ucrania — країна; національність — ucraniana.']],
      rules: [[[NA_C], R[NA_U] as string]],
      ok: 'Так: Soy ucraniana.', bad: 'Ні. Жінка з України — Soy ucraniana.',
    }),
    // ---------- ser.profession ----------
    t(38, 'supported', 'self-job', [PR_U], 'Напиши іспанською: «Я викладачка».', 'Soy profesora.', [
      ['Soy una profesora.', 'x', 'Коли кажемо, ким працюємо, артикль після ser не ставимо: Soy profesora.'],
    ], 'Soy + професія без артикля', { support: 'Пам’ятай: професія після ser — без un/una.', also: ['Yo soy profesora.'] }),
    t(39, 'supported', 'other-job', [PR_U], 'Напиши іспанською: «Пабло — лікар».', 'Pablo es médico.', [
      ['Pablo es un médico.', 'x', 'Професія після ser — без артикля: Pablo es médico.'],
      ['Pablo es medico.', 'u', 'Конструкція правильна, але médico пишеться зі знаком наголосу.'],
    ], 'Es + професія без артикля', { support: 'Пам’ятай: Ana es estudiante — без артикля.' }),
    t(40, 'independent', 'other-job', [PR_U], 'Напиши іспанською: «Ана — інженерка».', 'Ana es ingeniera.', [
      ['Ana es una ingeniera.', 'x', 'Професія після ser — без артикля.'],
      ['Ana es ingeniero.', 'u', 'Без артикля — добре; про жінку зазвичай кажуть ingeniera.'],
    ], 'Es + професія без артикля'),
    t(41, 'independent', 'self-job', [PR_U], 'Напиши іспанською: «Я програміст» (говорить чоловік).', 'Soy programador.', [
      ['Soy un programador.', 'x', 'Професія після ser — без артикля.'],
    ], 'Soy + професія без артикля', { also: ['Yo soy programador.'] }),
    t(42, 'independent', 'other-job', [PR_U], 'Напиши іспанською: «Мої брати — офіціанти».', 'Mis hermanos son camareros.', [
      ['Mis hermanos son unos camareros.', 'x', 'Професія після ser — без артикля.'],
      ['Mis hermanos son camarero.', 'u', 'Без артикля — добре, але братів кілька: camareros.'],
    ], 'Son + професія без артикля'),
    t(43, 'independent', 'self-job', [PR_U], 'Напиши іспанською подрузі: «Ти — студентка».', 'Eres estudiante.', [
      ['Eres una estudiante.', 'x', 'Коли кажемо, хто людина за заняттям, артикль не ставимо.'],
    ], 'Eres + estudiante', { also: ['Tú eres estudiante.'] }),
    t(44, 'delayed', 'other-job', [PR_U], 'Напиши іспанською: «Моя мама — лікарка».', 'Mi madre es médica.', [
      ['Mi madre es una médica.', 'x', 'Професія після ser — без артикля.'],
      ['Mi madre es médico.', 'u', 'Без артикля — добре; про жінку здебільшого кажуть médica.'],
    ], 'Es + професія без артикля'),
    t(45, 'delayed', 'self-job', [PR_U], 'Напиши іспанською: «Ми програмісти» (група змішана).', 'Somos programadores.', [
      ['Somos unos programadores.', 'x', 'Професія після ser — без артикля.'],
    ], 'Somos + професія без артикля', { also: ['Nosotros somos programadores.'] }),
    t(46, 'transfer', 'party', [PR_U], 'На вечірці тебе питають, ким ти працюєш. Відповідай іспанською: «Я інженер» (ти — чоловік).', 'Soy ingeniero.', [
      ['Soy un ingeniero.', 'x', 'Професія після ser — без артикля.'],
    ], 'Soy + професія без артикля', { also: ['Yo soy ingeniero.'] }),
    t(47, 'transfer', 'family-card', [PR_U], 'Ти пишеш про родину: «Мій брат — офіціант, а моя сестра — викладачка».', 'Mi hermano es camarero y mi hermana es profesora.', [
      ['Mi hermano es un camarero y mi hermana es una profesora.', 'x', 'Професія після ser — без артикля.'],
      ['Mi hermano es un camarero y mi hermana es profesora.', 'x', 'Перед camarero артикль не потрібен.'],
      ['Mi hermano es camarero y mi hermana es una profesora.', 'x', 'Перед profesora артикль не потрібен.'],
    ], 'Обидві професії без артикля', { gl: Y }),
    pick({
      n: 48, role: 'independent', family: 'choose-job', targets: [PR_C],
      prompt: [uk('Ти розповідаєш, ким працюєш. Яке речення правильне?')],
      options: [['Soy médico.', 'c'], ['Soy un médico.', 'x', 'Професія після ser — без артикля.'], ['Soy de médico.', 'x', 'De тут зайве.']],
      rules: [[[PR_C], R[PR_U] as string]],
      ok: 'Так: Soy médico.', bad: 'Ні. Професія після ser — без артикля: Soy médico.',
    }),
    // ---------- ser.description ----------
    t(49, 'supported', 'person', [DS_U], 'Напиши іспанською: «Ана висока».', 'Ana es alta.', [
      ['Ana es alto.', 'x', 'Ана — жінка, тому alta.'],
      ['Ana alta.', 'x', 'Потрібне дієслово: Ana es alta.'],
    ], 'Es + прикметник', { support: 'Пам’ятай: ser + прикметник, узгоджений з підметом.' }),
    t(50, 'supported', 'thing', [DS_U], 'Напиши іспанською: «Квартира маленька» (квартира — el piso).', 'El piso es pequeño.', [
      ['El piso es pequeña.', 'x', 'Piso — чоловічого роду: pequeño.'],
      ['El piso pequeño.', 'x', 'Без дієслова це «маленька квартира»; потрібне речення: El piso es pequeño.'],
    ], 'Es + прикметник', { support: 'Пам’ятай: прикметник узгоджується з іменником-підметом.' }),
    t(51, 'independent', 'person', [DS_U], 'Напиши іспанською: «Мої друзі — симпатичні».', 'Mis amigos son simpáticos.', [
      ['Mis amigos son simpático.', 'x', 'Друзів кілька: simpáticos.'],
      ['Mis amigos es simpáticos.', 'u', 'Прикметник правильний, але друзів кілька — son.'],
    ], 'Son + прикметник у множині'),
    t(52, 'independent', 'person', [DS_U], 'Напиши іспанською: «Пабло темноволосий і високий».', 'Pablo es moreno y alto.', [
      ['Pablo es morena y alta.', 'x', 'Пабло — чоловік: moreno, alto.'],
      ['Pablo moreno y alto.', 'x', 'Потрібне дієслово: Pablo es moreno y alto.'],
    ], 'Es + прикметники', { also: ['Pablo es alto y moreno.'], gl: Y }),
    t(53, 'independent', 'thing', [DS_U], 'Напиши іспанською: «Мій дім великий і гарний» (дім — la casa).', 'Mi casa es grande y bonita.', [
      ['Mi casa es grande y bonito.', 'x', 'Casa — жіночого роду: bonita.'],
    ], 'Es + прикметники', { also: ['Mi casa es bonita y grande.'], gl: Y }),
    t(54, 'independent', 'person', [DS_U], 'Напиши іспанською двом друзям (на «ти»): «Ви дуже розумні».', 'Sois muy inteligentes.', [
      ['Sois muy inteligente.', 'x', 'Вас кілька: inteligentes.'],
      ['Son muy inteligentes.', 'u', 'У більшості Іспанії до друзів на «ти» кажуть vosotros — sois; son — для ellos або ввічливого ustedes. У цьому курсі тренуємо систему vosotros.'],
    ], 'Sois + прикметник у множині', { also: ['Vosotros sois muy inteligentes.'] }),
    t(55, 'delayed', 'person', [DS_U], 'Напиши іспанською: «Моя сестра білява».', 'Mi hermana es rubia.', [
      ['Mi hermana es rubio.', 'x', 'Сестра — жінка: rubia.'],
    ], 'Es + прикметник'),
    t(56, 'delayed', 'thing', [DS_U], 'Напиши іспанською: «Книжки цікаві» (про конкретні книжки: los libros).', 'Los libros son interesantes.', [
      ['Los libros son interesante.', 'x', 'Книжок кілька: interesantes.'],
      ['Los libros es interesantes.', 'u', 'Прикметник правильний, але книжок кілька — son.'],
    ], 'Son + прикметник у множині'),
    t(57, 'transfer', 'message', [DS_U], 'Ти пишеш подрузі про нового викладача: «Він дуже симпатичний».', 'Es muy simpático.', [
      ['Es muy simpática.', 'x', 'Про чоловіка — simpático.'],
    ], 'Es + прикметник', { also: ['Él es muy simpático.'] }),
    t(58, 'transfer', 'ad', [DS_U], 'Ти пишеш оголошення про оренду: «Квартира нова й дуже гарна» (квартира — el piso).', 'El piso es nuevo y muy bonito.', [
      ['El piso es nueva y muy bonita.', 'x', 'Piso — чоловічого роду: nuevo, bonito.'],
      ['El piso nuevo y muy bonito.', 'x', 'Потрібне дієслово: El piso es nuevo y muy bonito.'],
    ], 'Es + прикметники', { also: ['El piso es muy bonito y nuevo.'], gl: Y }),
    pick({
      n: 59, role: 'independent', family: 'choose-desc', targets: [DS_C],
      prompt: [uk('Яка форма прикметника потрібна?'), es('Mis amigas son ___.')],
      options: [['simpáticas', 'c'], ['simpáticos', 'x', 'Подруги — жінки: simpáticas.'], ['simpática', 'x', 'Подруг кілька: simpáticas.']],
      rules: [[[DS_C], R[DS_U] as string]],
      ok: 'Так: Mis amigas son simpáticas.', bad: 'Ні. Mis amigas — жіночий рід, множина: simpáticas.',
    }),
    // ---------- formula.introduction ----------
    t(60, 'supported', 'intro', [FI_P], 'Напиши іспанською: «Мене звати Ана».', 'Me llamo Ana.', [
      ['Yo llamo Ana.', 'x', 'Фраза звучить так: Me llamo Ana.'],
      ['Me llamo es Ana.', 'x', 'Es тут зайве: Me llamo Ana.'],
      ['Soy Ana.', 'u', 'Так теж представляються, але тут потрібна фраза Me llamo…'],
    ], '«Мене звати…»', { support: 'Пам’ятай: «мене звати» — me llamo.' }),
    t(61, 'independent', 'intro', [FI_P], 'Спитай іспанською нового однокурсника: «Як тебе звати?»', '¿Cómo te llamas?', [
      ['¿Como te llamas?', 'u', 'Фраза правильна, але cómo у питанні пишеться зі знаком наголосу.'],
      ['¿Cómo se llama usted?', 'u', 'Це ввічлива форма; однокурсника на «ти» питають ¿Cómo te llamas?'],
    ], '«Як тебе звати?»'),
    t(62, 'independent', 'intro', [FI_P], 'Тобі представили нового колегу. Ти — жінка. Напиши іспанською: «Приємно познайомитися».', 'Encantada.', [
      ['Encantado.', 'x', 'Encantado каже чоловік; жінка каже Encantada.'],
    ], '«Приємно познайомитися» (каже жінка)', { also: [['Mucho gusto.', 'Теж правильно: mucho gusto однакове для всіх.']] }),
    t(63, 'delayed', 'intro', [FI_P], 'Спитай ввічливо іспанською літню пані: «Як Вас звати?»', '¿Cómo se llama usted?', [
      ['¿Cómo te llamas?', 'x', 'Це питання на «ти»; ввічливо — ¿Cómo se llama usted?'],
    ], '«Як Вас звати?»', { also: ['¿Cómo se llama?'] }),
    t(64, 'transfer', 'present-friend', [FI_P], 'Ти представляєш колегам свою подругу Ану. Напиши іспанською: «Це Ана».', 'Esta es Ana.', [
      ['Este es Ana.', 'x', 'Ана — жінка: Esta es Ana.'],
      ['Es Ana.', 'u', 'Речення правильне, але коли когось представляють, кажуть Esta es Ana.'],
    ], 'Представити когось'),
    pick({
      n: 65, role: 'supported', family: 'read-dialogue', targets: [FI_R],
      prompt: [uk('Прочитай діалог. Як звати дівчину?'), es('— Hola, me llamo Pablo. ¿Cómo te llamas?'), es('— Me llamo Lucía.'), es('— Encantado.'), es('— Encantada.')],
      options: [['Лусія', 'c'], ['Пабло', 'x', 'Пабло — хлопець: це він питає ¿Cómo te llamas?'], ['Енкантада', 'x', 'Encantada — «приємно познайомитися», а не ім’я.']],
      rules: [[[FI_R], R[FI_P] as string]],
      ok: 'Так: Me llamo Lucía — «мене звати Лусія».', bad: 'Ні. Дівчина каже: Me llamo Lucía.',
    }),
    pick({
      n: 66, role: 'delayed', family: 'read-phrase', targets: [FI_R],
      prompt: [uk('Що означає питання?'), es('¿Cómo se llama usted?')],
      options: [['Як Вас звати?', 'c'], ['Як тебе звати?', 'x', 'Це ввічлива форма з usted: «Як Вас звати?».'], ['Звідки Ви?', 'x', '«Звідки Ви?» — ¿De dónde es usted?']],
      rules: [[[FI_R], R[FI_P] as string]],
      ok: 'Так: «Як Вас звати?».', bad: 'Ні. ¿Cómo se llama usted? — «Як Вас звати?».',
    }),
    pick({
      n: 67, role: 'independent', family: 'listen-intro', targets: [FI_L], clips: ['clip.a1-03.me-llamo-pablo'],
      prompt: [uk('Послухай. Що каже чоловік?')],
      options: [['Його звати Пабло, і йому приємно познайомитися.', 'c'], ['Він питає, як звати співрозмовника.', 'x', 'У записі немає питання: Hola, me llamo Pablo. Encantado.'], ['Він представляє свого брата Пабло.', 'x', 'Me llamo — «мене звати»: він називає своє ім’я.']],
      rules: [[[FI_L], R[FI_P] as string]],
      extraHints: [transcript([FI_L], 'Hola, me llamo Pablo. Encantado.')],
      ok: 'Так: Hola, me llamo Pablo. Encantado.', bad: 'Ні. У записі: Hola, me llamo Pablo. Encantado.',
    }),
    pick({
      n: 68, role: 'delayed', family: 'listen-present', targets: [FI_L], clips: ['clip.a1-03.esta-es-lucia'],
      prompt: [uk('Послухай. Кого представляють?')],
      options: [['сестру Лусію', 'c'], ['подругу Лусію', 'x', 'У записі mi hermana — «моя сестра».'], ['маму Лусію', 'x', 'У записі mi hermana — «моя сестра».']],
      rules: [[[FI_L], R[FI_P] as string]],
      extraHints: [transcript([FI_L], 'Esta es Lucía, mi hermana.')],
      ok: 'Так: Esta es Lucía, mi hermana — «Це Лусія, моя сестра».', bad: 'Ні. У записі: Esta es Lucía, mi hermana.',
    }),
    // ---------- text.personal-data-form ----------
    pick({
      n: 69, role: 'supported', family: 'form-read', targets: [PD_R],
      prompt: [uk('Прочитай анкету. Підказка: Apellidos — прізвище. Яке прізвище в Лусії?'), FORM_LUCIA],
      options: [['García López', 'c'], ['Lucía', 'x', 'Lucía — ім’я (Nombre).'], ['Valencia', 'x', 'Valencia — місто (Ciudad).']],
      rules: [[[PD_R], 'Nombre — ім’я, Apellidos — прізвище, Nacionalidad — громадянство, Ciudad — місто, País — країна, Teléfono — телефон, Correo electrónico — електронна пошта.']],
      ok: 'Так: Apellidos — García López (в Іспанії людина зазвичай має два прізвища).', bad: 'Ні. Прізвище — у полі Apellidos: García López.',
    }),
    pick({
      n: 70, role: 'independent', family: 'form-read', targets: [PD_R],
      prompt: [uk('Прочитай анкету. Яке громадянство в Тараса і яке місто вказано в анкеті?'), FORM_TARAS],
      options: [['українське; Мадрид', 'c'], ['іспанське; Мадрид', 'x', 'España — у полі País (країна); громадянство — у полі Nacionalidad: ucraniana.'], ['українське; Київ', 'x', 'У полі Ciudad — Madrid.']],
      rules: [[[PD_R], 'Nombre — ім’я, Apellidos — прізвище, Nacionalidad — громадянство, Ciudad — місто, País — країна, Correo electrónico — електронна пошта.']],
      ok: 'Так: Nacionalidad: ucraniana, Ciudad: Madrid.', bad: 'Ні. Nacionalidad — ucraniana (українське), Ciudad — Madrid.',
    }),
    t(71, 'supported', 'form-fill', [PD_W], 'Заповни поле анкети для Олени — вона українка. Напиши лише те, що треба вписати в поле.', 'ucraniana', [
      ['ucraniano.', 'x', 'Олена — жінка: ucraniana.'],
      ['Soy ucraniana.', 'u', 'Слово правильне, але в анкеті поле заповнюють без речення: ucraniana.'],
    ], 'Nacionalidad: ucraniana', { support: 'Пам’ятай: поле анкети заповнюють коротко, без речення.', shown: 'Nacionalidad: ___' }),
    t(72, 'independent', 'form-fill', [PD_W], 'Заповни поле анкети для Пабло, який живе в Іспанії. Напиши лише те, що треба вписати в поле.', 'España', [
      ['español.', 'x', 'País — країна: España; español — національність.'],
      ['Espana.', 'u', 'Поле вибране правильно, але бракує літери ñ: España.'],
    ], 'País: España', { shown: 'País: ___' }),
    t(73, 'delayed', 'form-fill', [PD_W], 'Заповни поле анкети для Хав’єра — він іспанець. Напиши лише те, що треба вписати в поле.', 'español', [
      ['España.', 'x', 'España — країна; у полі Nacionalidad пишемо національність: español.'],
    ], 'Nacionalidad: español', { shown: 'Nacionalidad: ___', also: [['española.', 'Теж правильно: у полі анкети прикметник може узгоджуватися зі словом nacionalidad (жіночого роду). Про себе Хав’єр скаже: Soy español.']] }),
    t(74, 'transfer', 'course-form', [PD_W, AN_W], 'Ти заповнюєш анкету на мовні курси за свою подругу Ганну — вона німкеня. Що вписати в поле?', 'alemana', [
      ['alemán.', { [AN_W]: 'x', [PD_W]: 'c' }, 'Ганна — жінка: alemana.'],
      ['alemána.', { [AN_W]: 'x', [PD_W]: 'c' }, 'У жіночому роді знак наголосу зникає: alemana.'],
      ['Alemania.', { [PD_W]: 'x', [AN_W]: 'u' }, 'Alemania — країна; у полі Nacionalidad пишемо національність: alemana.'],
    ], 'Nacionalidad: alemana', { shown: 'Nacionalidad: ___' }),
    // ---------- listening.short-sentences ----------
    pick({
      n: 75, role: 'supported', family: 'listen-origin', targets: [LS_L], clips: ['clip.a1-03.soy-de-valencia'],
      prompt: [uk('Послухай. Підказка: ser de + місто — звідки людина. Звідки Марта?')],
      options: [['з Валенсії', 'c'], ['з Мадрида', 'x', 'У записі de Valencia.'], ['із Севільї', 'x', 'У записі de Valencia.']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано: хто, звідки, де, що є.']],
      extraHints: [transcript([LS_L], 'Hola, soy Marta y soy de Valencia.')],
      ok: 'Так: Hola, soy Marta y soy de Valencia.', bad: 'Ні. У записі: Hola, soy Marta y soy de Valencia — «з Валенсії».',
    }),
    pick({
      n: 76, role: 'independent', family: 'listen-job', targets: [LS_L], clips: ['clip.a1-03.ana-es-medica'],
      prompt: [uk('Послухай. Ким працює Ана і яка вона?')],
      options: [['лікарка, дуже симпатична', 'c'], ['викладачка, дуже симпатична', 'x', 'У записі médica — «лікарка».'], ['лікарка, дуже висока', 'x', 'У записі muy simpática — «дуже симпатична».']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано: хто, звідки, де, що є.']],
      extraHints: [transcript([LS_L], 'Ana es médica y es muy simpática.')],
      ok: 'Так: Ana es médica y es muy simpática.', bad: 'Ні. У записі: Ana es médica y es muy simpática.',
    }),
    {
      n: 77, role: 'independent', family: 'dictation', mode: 'exact-variants', targets: [LS_D], clips: ['clip.a1-03.soy-de-valencia'], policy: LOOSE,
      prompt: [uk('Необов’язково. Послухай ще раз і запиши почуте іспанською.')],
      accepted: ['Hola, soy Marta y soy de Valencia.', 'Hola, soy Marta, y soy de Valencia.', 'Hola. Soy Marta y soy de Valencia.', '¡Hola! Soy Marta y soy de Valencia.'],
      errors: [
        ['Hola, soy Marta y soy de Balencia.', 'x', 'Місто пишеться з V: Valencia (b і v звучать однаково).'],
        ['Ola, soy Marta y soy de Valencia.', 'x', 'Hola пишеться з h, хоча h не читається.'],
      ],
      hints: [transcript([LS_D], 'Hola, soy Marta y soy de Valencia.')],
      ref: 'Hola, soy Marta y soy de Valencia.',
      ok: 'Правильно: Hola, soy Marta y soy de Valencia.',
      bad: 'Ще ні. У записі: Hola, soy Marta y soy de Valencia.',
      unres: U('Hola, soy Marta y soy de Valencia.'),
    },
    pick({
      n: 78, role: 'delayed', family: 'listen-question', targets: [LS_L], clips: ['clip.a1-03.de-donde-eres'],
      prompt: [uk('Послухай. Про що питають Пабло?')],
      options: [['звідки він', 'c'], ['як його звати', 'x', 'Ім’я вже названо: Hola, Pablo. Питають ¿De dónde eres?'], ['ким він працює', 'x', 'У записі питання ¿De dónde eres? — «Звідки ти?».']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано: хто, звідки, де, що є. De dónde — «звідки»: так питають про походження.']],
      extraHints: [transcript([LS_L], 'Hola, Pablo. ¿De dónde eres?')],
      ok: 'Так: ¿De dónde eres? — «Звідки ти?».', bad: 'Ні. У записі: Hola, Pablo. ¿De dónde eres?',
    }),
  ],
  clips: [
    clip({ id: 'clip.a1-03.me-llamo-pablo', lessonId: 'A1-03-L2', kind: 'sentence', family: 'introduction', transcript: 'Hola, me llamo Pablo. Encantado.', translationUk: 'Привіт, мене звати Пабло. Приємно познайомитися.', targets: [FI_L] }),
    clip({ id: 'clip.a1-03.esta-es-lucia', lessonId: 'A1-03-L2', kind: 'sentence', family: 'presenting', transcript: 'Esta es Lucía, mi hermana.', translationUk: 'Це Лусія, моя сестра.', targets: [FI_L] }),
    clip({ id: 'clip.a1-03.soy-de-valencia', lessonId: 'A1-03-L2', kind: 'sentence', family: 'origin', transcript: 'Hola, soy Marta y soy de Valencia.', translationUk: 'Привіт, я Марта, я з Валенсії.', targets: [LS_L, LS_D] }),
    clip({ id: 'clip.a1-03.ana-es-medica', lessonId: 'A1-03-L2', kind: 'sentence', family: 'profession', transcript: 'Ana es médica y es muy simpática.', translationUk: 'Ана — лікарка, і вона дуже симпатична.', targets: [LS_L] }),
    clip({ id: 'clip.a1-03.de-donde-eres', lessonId: 'A1-03-L2', kind: 'sentence', family: 'question-origin', transcript: 'Hola, Pablo. ¿De dónde eres?', translationUk: 'Привіт, Пабло. Звідки ти?', targets: [LS_L] }),
  ],
};
