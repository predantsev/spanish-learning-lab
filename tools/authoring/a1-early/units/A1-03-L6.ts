// A1-03-L6 — yes/no questions, question words qué / quién / dónde / cómo with their written accent and
// word order, and negation with no before the verb.
import { CI, clip, ex, gloss, tableUk, transcript, uk, ulUk, es } from '../lib.ts';
import type { OutcomeSpec, TaskSpec, Unit } from '../lib.ts';
import type { Block, Policy } from '../../../content/types.ts';
import { pick, typed } from '../common.ts';
import type { TaskRole } from '../../../content/types.ts';

const YN_U = 'question.yes-no/construction-use';
const YN_W = 'question.yes-no/written-form';
const YN_R = 'question.yes-no/reading-meaning';
const WO_U = 'question.word-order/construction-use';
const WO_C = 'question.word-order/context-choice';
const IA_W = 'ortho.interrogative-accent/written-form';
const IA_C = 'ortho.interrogative-accent/context-choice';
const QQ_W = 'question.word.que/written-form';
const QQ_C = 'question.word.que/context-choice';
const QQ_R = 'question.word.que/reading-meaning';
const QN_W = 'question.word.quien/written-form';
const QN_C = 'question.word.quien/context-choice';
const QN_R = 'question.word.quien/reading-meaning';
const QD_W = 'question.word.donde/written-form';
const QD_C = 'question.word.donde/context-choice';
const QD_R = 'question.word.donde/reading-meaning';
const QC_W = 'question.word.como/written-form';
const QC_C = 'question.word.como/context-choice';
const QC_R = 'question.word.como/reading-meaning';
const NG_U = 'neg.no-before-verb/construction-use';
const NG_W = 'neg.no-before-verb/written-form';
const NG_C = 'neg.no-before-verb/context-choice';
const LS_L = 'listening.short-sentences/listening-meaning';

const R: Record<string, string> = {
  [YN_U]: 'Щоб поставити питання «так чи ні», часто досить узяти твердження й додати знаки ¿ ?: Eres de Madrid. → ¿Eres de Madrid? Підмет можна залишити на місці або поставити після дієслова: ¿Ana es profesora? / ¿Es Ana profesora?',
  [YN_W]: 'Питання пишуть між двома знаками: ¿ на початку і ? в кінці: ¿Tienes coche?',
  [WO_U]: 'Базовий порядок, який ми тренуємо в таких питаннях: питальне слово → дієслово → підмет (якщо він є окремо): ¿Dónde está el hotel? ¿De dónde es Ana? У ¿Qué hay en la mesa? окремого підмета немає: qué + hay + місце. Прийменник стоїть перед питальним словом: ¿De dónde eres? Інші порядки теж бувають, але їх ми поки не тренуємо.',
  [IA_W]: 'Питальні слова завжди пишуться зі знаком наголосу: qué, quién, quiénes, dónde, cómo.',
  [QQ_W]: 'Qué — «що?»: ¿Qué es? ¿Qué tienes? ¿Qué hay en la mesa?',
  [QN_W]: 'Quién — «хто?»: ¿Quién es? У питанні «хто це?» про кількох людей кажемо quiénes, а дієслово ser — у множині: ¿Quiénes son?',
  [QD_W]: 'Dónde — «де?»: ¿Dónde está el banco? De dónde — «звідки?»: ¿De dónde eres?',
  [QC_W]: 'Cómo — «як? який?»: ¿Cómo estás? — про самопочуття; ¿Cómo es tu casa? — про опис; ¿Cómo te llamas? — «як тебе звати?».',
  [NG_U]: 'Щоб заперечити, ставимо no перед дієсловом: No soy de Madrid. Ana no está en casa. No tengo coche. No hay leche.',
  [NG_W]: 'У відповіді часто буває два no: ¿Eres profesora? — No, no soy profesora. Перше no означає «ні» (після нього кома), друге — «не».',
};
for (const [k, base] of [[YN_R, YN_U], [WO_C, WO_U], [IA_C, IA_W], [QQ_C, QQ_W], [QQ_R, QQ_W], [QN_C, QN_W], [QN_R, QN_W], [QD_C, QD_W], [QD_R, QD_W], [QC_C, QC_W], [QC_R, QC_W], [NG_C, NG_U]] as const) R[k] = R[base] as string;
// The yes/no construction hint also explains the ¿ ? marks, so it supports the written-form target when that is assessed.
const ALSO: Record<string, string> = { [YN_U]: YN_W };
const rulesOf = (targets: string[]): Array<[string[], string]> =>
  targets.filter((t) => R[t]).map((t) => [ALSO[t] && targets.includes(ALSO[t] as string) ? [t, ALSO[t] as string] : [t], R[t] as string]);

interface Opts {
  also?: Array<string | [string, string]>;
  support?: string;
  shown?: string;
  gl?: Block[];
  policy?: Policy;
}
function t(n: number, role: TaskRole, family: string, targets: string[], prompt: string, answer: string, errors: Array<[string, OutcomeSpec, string]>, why: string, opts: Opts = {}): TaskSpec {
  return typed({
    n, role, family, targets,
    prompt: [...(opts.support ? [uk(opts.support)] : []), uk(prompt), ...(opts.shown ? [es(opts.shown)] : [])],
    answer, errors, rules: rulesOf(targets), why,
    ...(opts.also ? { also: opts.also } : {}),
    ...(opts.gl ? { extraHints: [gloss(...opts.gl)] } : {}),
    ...(opts.policy ? { policy: opts.policy } : {}),
  });
}
function choice(n: number, role: TaskRole, family: string, target: string, prompt: Block[], options: Array<[string, OutcomeSpec, string?]>, ok: string, bad: string): TaskSpec {
  return pick({ n, role, family, targets: [target], prompt, options, rules: rulesOf([target]), ok, bad });
}
const YNT = [YN_U, YN_W];
/** Errors shared by every statement → question transformation (punctuation is assessed: CI policy). */
function ynErrors(statement: string, noOpening: string): Array<[string, OutcomeSpec, string]> {
  return [
    [noOpening, { [YN_W]: 'x', [YN_U]: 'c' }, 'Питання правильне, але на початку потрібен знак ¿.'],
    [statement, { [YN_U]: 'x', [YN_W]: 'u' }, 'Це твердження; питання пишемо між знаками ¿ ?.'],
  ];
}

export const unit: Unit = {
  lesson: {
    id: 'A1-03-L6',
    titleUk: 'Питання й заперечення',
    termEs: 'preguntas y negación',
    summaryUk: 'Навчишся ставити питання «так чи ні», питати qué, quién, dónde, cómo (зі знаком наголосу й правильним порядком слів) і заперечувати з no перед дієсловом.',
    objectives: ['A1-03-O1', 'A1-03-O6'],
    cv: [],
    situations: [],
    estimatedMinutes: 20,
    introduces: ['question.yes-no', 'question.word-order', 'ortho.interrogative-accent', 'question.word.que', 'question.word.quien', 'question.word.donde', 'question.word.como', 'neg.no-before-verb'],
    revisits: ['ortho.question-marks', 'present.ser', 'present.estar', 'present.tener', 'hay.existence', 'ser.origin', 'ser.identity', 'ser.profession', 'estar.location', 'estar.state', 'tener.possession', 'tener.physical-states', 'pron.tu-usted', 'formula.introduction', 'listening.short-sentences'],
    steps: [
      {
        kind: 'explanation',
        title: 'Частина 1. Питання «так чи ні»',
        blocks: [
          uk('Щоб поставити питання «так чи ні», часто досить узяти твердження й додати знаки ¿ ?: Eres de Madrid. → ¿Eres de Madrid? Підмет можна залишити на місці або поставити після дієслова: ¿Ana es profesora? / ¿Es Ana profesora? На слух загальне питання часто впізнаємо за інтонацією: голос у кінці зазвичай підвищується.'),
          ex('¿Tienes coche? — Sí. / No.', 'У тебе є машина? — Так. / Ні.'),
          ex('¿Hay leche?', 'Є молоко?'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 1. Тренування з підказкою', tasks: [1, 2] },
      { kind: 'independent-practice', title: 'Частина 1. Самостійно', tasks: [3, 11, 4, 5, 6] },
      {
        kind: 'explanation',
        title: 'Частина 2. Питальні слова',
        blocks: [
          tableUk(['Слово', 'Значення', 'Приклад'], [
            ['qué', 'що?', '¿Qué tienes?'],
            ['quién / quiénes', 'хто?', '¿Quién es? ¿Quiénes son?'],
            ['dónde / de dónde', 'де? / звідки?', '¿Dónde está el banco? ¿De dónde eres?'],
            ['cómo', 'як? який?', '¿Cómo estás? ¿Cómo es tu casa?'],
          ]),
          uk('Питальні слова завжди пишуться зі знаком наголосу: qué, quién, dónde, cómo. Знак ставимо й тоді, коли питання починається після коми: Hola, ¿cómo estás?'),
          uk('Базовий порядок слів, який ми тренуємо: питальне слово → дієслово → підмет: ¿Dónde está el hotel? ¿De dónde es Ana? Прийменник стоїть перед питальним словом, а не в кінці: ¿De dónde eres? Інші порядки теж трапляються, але поки тренуємо цей.'),
          uk('¿Cómo estás? питає про самопочуття (estar), ¿Cómo es…? — про опис, риси (ser).'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 2. Тренування з підказкою', tasks: [21, 31, 41, 51, 61] },
      { kind: 'independent-practice', title: 'Частина 2. Самостійно', tasks: [22, 32, 42, 52, 66, 71, 23, 33, 43, 53, 72, 76, 77, 78, 79, 81, 82, 83, 84] },
      {
        kind: 'explanation',
        title: 'Частина 3. Заперечення: no',
        blocks: [
          uk('Щоб заперечити, ставимо no перед дієсловом: No soy de Madrid. Ana no está en casa. No tengo coche. No hay leche. Після no з tener і hay артикль un/una часто пропускають: No tengo coche.'),
          uk('У короткій відповіді буває два no: ¿Eres profesora? — No, no soy profesora. Перше no — «ні» (після нього кома), друге — «не».'),
          ex('¿Estás en casa? — No, no estoy en casa. Estoy en la oficina.', 'Ти вдома? — Ні, я не вдома. Я в офісі.'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 3. Тренування з підказкою', tasks: [91, 92] },
      { kind: 'independent-practice', title: 'Частина 3. Самостійно', tasks: [93, 101, 94, 95, 96] },
      { kind: 'listening', title: 'Послухай', clips: ['clip.a1-03.no-tengo-coche', 'clip.a1-03.quien-profesora'], tasks: [111] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Питання «так чи ні»: ¿Eres de Madrid? ¿Es Ana profesora?',
            'Qué, quién, dónde, cómo — завжди зі знаком наголосу.',
            'Базовий порядок: питальне слово → дієслово → підмет: ¿De dónde es Ana?',
            'No — перед дієсловом: No tengo coche. No, no soy profesora.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- question.yes-no (construction-use + written-form); punctuation assessed ----------
    t(1, 'supported', 'transform', YNT, 'Перетвори твердження на питання «так чи ні».', '¿Eres de Madrid?', ynErrors('Eres de Madrid.', 'Eres de Madrid?'), 'Питання — між ¿ ?', { support: 'Пам’ятай: додай ¿ на початку і ? в кінці.', shown: 'Eres de Madrid.', policy: CI }),
    t(2, 'supported', 'transform', YNT, 'Перетвори твердження на питання «так чи ні».', '¿Ana es profesora?', ynErrors('Ana es profesora.', 'Ana es profesora?'), 'Питання — між ¿ ?', { support: 'Пам’ятай: підмет можна залишити на місці або поставити після дієслова.', shown: 'Ana es profesora.', also: ['¿Es Ana profesora?', '¿Es profesora Ana?'], policy: CI }),
    t(3, 'independent', 'transform', YNT, 'Перетвори твердження на питання «так чи ні».', '¿Tienes coche?', ynErrors('Tienes coche.', 'Tienes coche?'), 'Питання — між ¿ ?', { shown: 'Tienes coche.', also: ['¿Tú tienes coche?'], policy: CI }),
    t(4, 'independent', 'transform', YNT, 'Перетвори твердження на питання «так чи ні».', '¿Hay leche?', ynErrors('Hay leche.', 'Hay leche?'), 'Питання — між ¿ ?', { shown: 'Hay leche.', policy: CI }),
    t(5, 'independent', 'ask', YNT, 'Спитай іспанською подругу: «Ти втомлена?»', '¿Estás cansada?', ynErrors('Estás cansada.', 'Estás cansada?'), 'Питання — між ¿ ?', { also: ['¿Tú estás cansada?'], policy: CI }),
    t(6, 'independent', 'ask', YNT, 'Спитай іспанською: «Пабло вдома?»', '¿Pablo está en casa?', ynErrors('Pablo está en casa.', 'Pablo está en casa?'), 'Питання — між ¿ ?', { also: ['¿Está Pablo en casa?'], policy: CI }),
    t(7, 'delayed', 'transform', YNT, 'Перетвори твердження на питання «так чи ні».', '¿Sois hermanos?', ynErrors('Sois hermanos.', 'Sois hermanos?'), 'Питання — між ¿ ?', { shown: 'Sois hermanos.', also: ['¿Vosotros sois hermanos?'], policy: CI }),
    t(8, 'delayed', 'ask', YNT, 'Спитай ввічливо іспанською незнайомого пана: «Ви з Іспанії?»', '¿Es usted de España?', [
      ...ynErrors('Usted es de España.', 'Es usted de España?'),
      ['¿Eres de España?', 'u', 'Питання правильне, але це звертання на «ти»; ввічливо — ¿Es usted de España?'],
    ], 'Питання — між ¿ ?', { also: ['¿Usted es de España?', '¿Es de España?', '¿Es usted español?', '¿Usted es español?'], policy: CI }),
    t(9, 'transfer', 'cafe', YNT, 'У кав’ярні ти питаєш офіціанта: «Є молоко?»', '¿Hay leche?', ynErrors('Hay leche.', 'Hay leche?'), 'Питання — між ¿ ?', { also: ['¿Tiene leche?', '¿Tienen leche?'], policy: CI }),
    t(10, 'transfer', 'neighbour', YNT, 'Ти знайомишся з новим сусідом свого віку. Спитай: «Ти студент?»', '¿Eres estudiante?', ynErrors('Eres estudiante.', 'Eres estudiante?'), 'Питання — між ¿ ?', { also: ['¿Tú eres estudiante?'], policy: CI }),
    choice(11, 'independent', 'read-question', YN_R, [uk('Що означає питання?'), es('¿Tienes hambre?')], [
      ['Ти голодний?', 'c'], ['Я голодний.', 'x', 'Tienes — «ти маєш», і це питання (¿ ?).'], ['У тебе є хліб?', 'x', 'Hambre — «голод»: «Ти голодний?».'],
    ], 'Так: ¿Tienes hambre? — «Ти голодний?».', 'Ні. ¿Tienes hambre? — «Ти голодний?».'),
    choice(12, 'delayed', 'read-question', YN_R, [uk('Що означає питання?'), es('¿Es Ana de Valencia?')], [
      ['Ана з Валенсії?', 'c'], ['Ана у Валенсії?', 'x', 'Es de — походження; «у Валенсії» — está en Valencia.'], ['Ана з Валенсії.', 'x', 'Знаки ¿ ? показують питання.'],
    ], 'Так: «Ана з Валенсії?».', 'Ні. ¿Es Ana de Valencia? — «Ана з Валенсії?».'),
    // ---------- qué ----------
    t(21, 'supported', 'what', [QQ_W, IA_W], 'Спитай іспанською: «Що це?»', '¿Qué es?', [
      ['¿Que es?', { [IA_W]: 'x', [QQ_W]: 'c' }, 'Слово правильне, але в питанні qué пишеться зі знаком наголосу.'],
      ['¿Quién es?', { [QQ_W]: 'x', [IA_W]: 'c' }, 'Quién — «хто?»; «що?» — qué.'],
    ], '«Що?» — qué', { support: 'Пам’ятай: «що?» — qué, зі знаком наголосу.' }),
    t(22, 'independent', 'what', [QQ_W, IA_W], 'Спитай іспанською подругу: «Що в тебе є?»', '¿Qué tienes?', [
      ['¿Que tienes?', { [IA_W]: 'x', [QQ_W]: 'c' }, 'У питанні qué пишеться зі знаком наголосу.'],
      ['¿Quién tienes?', { [QQ_W]: 'x', [IA_W]: 'c' }, 'Quién — «хто?»; «що?» — qué.'],
    ], '«Що?» — qué'),
    t(23, 'independent', 'what-place', [QQ_W, WO_U], 'Спитай іспанською: «Що є на столі?»', '¿Qué hay en la mesa?', [
      ['¿Qué en la mesa hay?', { [WO_U]: 'x', [QQ_W]: 'c' }, 'Після питального слова йде дієслово: ¿Qué hay en la mesa?'],
      ['¿Que hay en la mesa?', { [QQ_W]: 'u', [WO_U]: 'c' }, 'Слово й порядок правильні, але qué пишеться зі знаком наголосу.'],
    ], 'Qué + дієслово'),
    t(24, 'delayed', 'what-place', [QQ_W, IA_W], 'Спитай іспанською: «Що є в сумці?»', '¿Qué hay en el bolso?', [
      ['¿Que hay en el bolso?', { [IA_W]: 'x', [QQ_W]: 'c' }, 'У питанні qué пишеться зі знаком наголосу.'],
    ], '«Що?» — qué'),
    t(25, 'transfer', 'friend-bag', [QQ_W], 'Подруга несе важкий рюкзак. Спитай її: «Що в тебе в рюкзаку?»', '¿Qué tienes en la mochila?', [
      ['¿Que tienes en la mochila?', 'u', 'Слово вибране правильно, але qué пишеться зі знаком наголосу.'],
      ['¿Quién tienes en la mochila?', 'x', '«Що?» — qué.'],
    ], '«Що?» — qué', { also: ['¿Qué hay en la mochila?', '¿Qué hay en tu mochila?', '¿Qué llevas en la mochila?'] }),
    // ---------- quién ----------
    t(31, 'supported', 'who', [QN_W, IA_W], 'Спитай іспанською: «Хто це?»', '¿Quién es?', [
      ['¿Quien es?', { [IA_W]: 'x', [QN_W]: 'c' }, 'У питанні quién пишеться зі знаком наголосу.'],
      ['¿Qué es?', { [QN_W]: 'x', [IA_W]: 'c' }, 'Qué — «що?»; «хто?» — quién.'],
    ], '«Хто?» — quién', { support: 'Пам’ятай: «хто?» — quién, зі знаком наголосу.' }),
    t(32, 'independent', 'who', [QN_W, IA_W, WO_U], 'Спитай іспанською: «Хто твоя викладачка?»', '¿Quién es tu profesora?', [
      ['¿Quién tu profesora es?', { [WO_U]: 'x', [QN_W]: 'c', [IA_W]: 'c' }, 'Після питального слова йде дієслово: ¿Quién es tu profesora?'],
      ['¿Quien es tu profesora?', { [IA_W]: 'x', [QN_W]: 'c', [WO_U]: 'c' }, 'Quién пишеться зі знаком наголосу.'],
    ], 'Quién + дієслово + підмет'),
    t(33, 'independent', 'who-many', [QN_W], 'Ти бачиш на фото кількох незнайомих людей. Спитай: «Хто вони?»', '¿Quiénes son?', [
      ['¿Quién son?', 'x', 'Про кількох людей — quiénes: ¿Quiénes son?'],
      ['¿Quienes son?', 'u', 'Слово вибране правильно, але quiénes пишеться зі знаком наголосу.'],
    ], 'Про кількох — quiénes', { also: ['¿Quiénes son ellos?'] }),
    t(34, 'delayed', 'who-many', [QN_W, WO_U], 'Спитай іспанською: «Хто твої друзі?»', '¿Quiénes son tus amigos?', [
      ['¿Quién son tus amigos?', { [QN_W]: 'x', [WO_U]: 'c' }, 'Про кількох людей — quiénes.'],
      ['¿Quiénes tus amigos son?', { [WO_U]: 'x', [QN_W]: 'c' }, 'Після питального слова йде дієслово: ¿Quiénes son tus amigos?'],
    ], 'Quiénes + son'),
    t(35, 'transfer', 'phone', [QN_W, IA_W], 'Тобі пише незнайомий номер. Спитай: «Хто це?»', '¿Quién es?', [
      ['¿Quien es?', { [IA_W]: 'x', [QN_W]: 'c' }, 'Quién пишеться зі знаком наголосу.'],
    ], '«Хто?» — quién', { also: ['¿Quién eres?', '¿Quién es usted?', 'Perdón, ¿quién es?', 'Perdón, ¿quién eres?'] }),
    // ---------- dónde ----------
    t(41, 'supported', 'where', [QD_W, IA_W, WO_U], 'Спитай іспанською: «Де банк?»', '¿Dónde está el banco?', [
      ['¿Donde está el banco?', { [IA_W]: 'x', [QD_W]: 'c', [WO_U]: 'c' }, 'Dónde пишеться зі знаком наголосу.'],
      ['¿Dónde el banco está?', { [WO_U]: 'x', [QD_W]: 'c', [IA_W]: 'c' }, 'Після питального слова йде дієслово: ¿Dónde está el banco?'],
    ], 'Dónde + está + підмет', { support: 'Пам’ятай: базовий порядок — питальне слово → дієслово → підмет.' }),
    t(42, 'independent', 'origin', [QD_W, IA_W], 'Спитай іспанською друга: «Звідки ти?»', '¿De dónde eres?', [
      ['¿De donde eres?', { [IA_W]: 'x', [QD_W]: 'c' }, 'Dónde пишеться зі знаком наголосу.'],
      ['¿Dónde eres?', { [QD_W]: 'x', [IA_W]: 'c' }, '«Звідки?» — de dónde.'],
    ], '«Звідки?» — de dónde'),
    t(43, 'independent', 'origin', [QD_W, WO_U], 'Спитай іспанською за базовим порядком, який ми тренуємо: «Звідки Ана?»', '¿De dónde es Ana?', [
      ['¿Dónde es Ana de?', { [WO_U]: 'x', [QD_W]: 'c' }, 'Прийменник стоїть перед питальним словом: ¿De dónde es Ana?'],
      ['¿De dónde Ana es?', { [WO_U]: 'x', [QD_W]: 'c' }, 'Після питального слова йде дієслово: ¿De dónde es Ana?'],
      ['¿Ana de dónde es?', { [WO_U]: 'x', [QD_W]: 'c' }, 'Так теж кажуть у розмові (Ana винесено вперед), але завдання просить базовий порядок: ¿De dónde es Ana?'],
    ], 'De dónde + es + Ana'),
    t(44, 'delayed', 'where', [QD_W, IA_W], 'Спитай іспанською друга: «Де ти?»', '¿Dónde estás?', [
      ['¿Donde estás?', { [IA_W]: 'x', [QD_W]: 'c' }, 'Dónde пишеться зі знаком наголосу.'],
    ], '«Де?» — dónde', { also: ['¿Dónde estás tú?'] }),
    t(45, 'transfer', 'hotel', [QD_W, WO_U], 'У готелі ти не можеш знайти свій ключ. Спитай: «Де ключ?»', '¿Dónde está la llave?', [
      ['¿Dónde la llave está?', { [WO_U]: 'x', [QD_W]: 'c' }, 'Після питального слова йде дієслово: ¿Dónde está la llave?'],
      ['¿Donde está la llave?', { [QD_W]: 'u', [WO_U]: 'c' }, 'Слово й порядок правильні, але dónde пишеться зі знаком наголосу.'],
    ], 'Dónde + está + підмет', { also: ['¿Dónde está mi llave?', 'Perdón, ¿dónde está la llave?', 'Perdón, ¿dónde está mi llave?'] }),
    // ---------- cómo ----------
    t(51, 'supported', 'how', [QC_W, IA_W], 'Спитай іспанською друга, як він почувається: «Як ти?»', '¿Cómo estás?', [
      ['¿Como estás?', { [IA_W]: 'x', [QC_W]: 'c' }, 'Cómo пишеться зі знаком наголосу.'],
      ['¿Cómo eres?', 'u', 'Cómo правильно, але ¿Cómo eres? питає про риси; про самопочуття — ¿Cómo estás?'],
    ], '«Як?» — cómo', { support: 'Пам’ятай: «як?» — cómo, зі знаком наголосу.' }),
    t(52, 'independent', 'describe', [QC_W, WO_U], 'Спитай іспанською: «Який твій дім?» (який він — великий, гарний…)', '¿Cómo es tu casa?', [
      ['¿Cómo tu casa es?', { [WO_U]: 'x', [QC_W]: 'c' }, 'Після питального слова йде дієслово: ¿Cómo es tu casa?'],
      ['¿Cómo está tu casa?', 'u', 'Так питають про стан; про опис, риси — ¿Cómo es tu casa?'],
      ['¿Como es tu casa?', { [QC_W]: 'u', [WO_U]: 'c' }, 'Слово й порядок правильні, але cómo пишеться зі знаком наголосу.'],
    ], 'Cómo + es + підмет'),
    t(53, 'independent', 'name', [QC_W, IA_W], 'Спитай іспанською однокурсника: «Як тебе звати?»', '¿Cómo te llamas?', [
      ['¿Como te llamas?', { [IA_W]: 'x', [QC_W]: 'c' }, 'Cómo пишеться зі знаком наголосу.'],
    ], '«Як тебе звати?»'),
    t(54, 'delayed', 'describe', [QC_W, WO_U], 'Спитай іспанською: «Яка твоя сестра?» (яка вона за вдачею й зовні)', '¿Cómo es tu hermana?', [
      ['¿Cómo tu hermana es?', { [WO_U]: 'x', [QC_W]: 'c' }, 'Після питального слова йде дієслово.'],
      ['¿Cómo está tu hermana?', 'u', 'Так питають про самопочуття; про риси — ¿Cómo es tu hermana?'],
    ], 'Cómo + es + підмет'),
    t(55, 'transfer', 'sick-friend', [QC_W, IA_W], 'Подруга хворіє. Напиши їй: «Привіт! Як ти?»', 'Hola, ¿cómo estás?', [
      ['Hola, ¿como estás?', { [IA_W]: 'x', [QC_W]: 'c' }, 'Знак наголосу в cómo потрібен і тоді, коли питання стоїть після коми.'],
    ], '¿Cómo estás?', { also: ['¡Hola! ¿Cómo estás?', 'Hola. ¿Cómo estás?', 'Hola, ¿cómo estás tú?'] }),
    // ---------- word order: arrange ----------
    t(61, 'supported', 'arrange', [WO_U], 'Склади з цих слів питання за базовим порядком: «Де Пабло?»', '¿Dónde está Pablo?', [
      ['¿Dónde Pablo está?', 'x', 'Після питального слова йде дієслово: ¿Dónde está Pablo?'],
      ['¿Pablo dónde está?', 'x', 'Так теж кажуть у розмові (Pablo винесено вперед), але завдання просить базовий порядок: ¿Dónde está Pablo?'],
    ], 'Питальне слово → дієслово → підмет', { support: 'Пам’ятай: базовий порядок — питальне слово → дієслово → підмет.', shown: 'está / Pablo / dónde' }),
    t(62, 'delayed', 'arrange', [WO_U], 'Склади питання з цих слів: «Звідки твій викладач?»', '¿De dónde es tu profesor?', [
      ['¿Dónde es tu profesor de?', 'x', 'Прийменник стоїть перед питальним словом: ¿De dónde…?'],
      ['¿De dónde tu profesor es?', 'x', 'Після питального слова йде дієслово.'],
    ], 'De dónde → es → підмет', { shown: 'es / tu profesor / de dónde' }),
    choice(66, 'independent', 'choose-order', WO_C, [uk('Яке питання побудоване правильно?')], [
      ['¿De dónde es Ana?', 'c'], ['¿Dónde es Ana de?', 'x', 'Прийменник стоїть перед питальним словом.'], ['¿De dónde Ana es?', 'x', 'Після питального слова йде дієслово.'],
    ], 'Так: ¿De dónde es Ana?', 'Ні. Правильно: ¿De dónde es Ana?'),
    choice(67, 'delayed', 'choose-order', WO_C, [uk('Ти вперше питаєш перехожого про готель (не перепитуєш). Яке питання побудоване за звичайним порядком?')], [
      ['¿Dónde está el hotel?', 'c'], ['¿Dónde el hotel está?', 'x', 'Після питального слова йде дієслово.'], ['¿El hotel está dónde?', 'x', 'Питальне слово в кінці теж трапляється в розмові, але це не той звичайний порядок, який тут просять: ¿Dónde está el hotel?'],
    ], 'Так: ¿Dónde está el hotel?', 'Ні. Правильно: ¿Dónde está el hotel?'),
    // ---------- interrogative accent: choice ----------
    choice(71, 'independent', 'choose-accent', IA_C, [uk('Яке питання написане правильно?')], [
      ['¿Qué tienes?', 'c'], ['¿Que tienes?', 'x', 'У питанні qué пишеться зі знаком наголосу.'],
    ], 'Так: ¿Qué tienes?', 'Ні. Qué у питанні — зі знаком наголосу.'),
    choice(72, 'independent', 'choose-accent', IA_C, [uk('Яке питання написане правильно?')], [
      ['Hola, ¿cómo estás?', 'c'], ['Hola, ¿como estás?', 'x', 'Знак наголосу в cómo потрібен і після коми.'],
    ], 'Так: Hola, ¿cómo estás?', 'Ні. Cómo у питанні — зі знаком наголосу.'),
    // ---------- question word choice by context ----------
    choice(76, 'independent', 'choose-word', QQ_C, [uk('Ти хочеш дізнатися, яку річ тримає друг. Яке слово потрібне?'), es('¿___ es?')], [
      ['Qué', 'c'], ['Quién', 'x', 'Quién — про людину; про річ — qué.'], ['Dónde', 'x', 'Dónde — «де?».'],
    ], 'Так: ¿Qué es? — «Що це?».', 'Ні. Про річ — ¿Qué es?'),
    choice(77, 'independent', 'choose-word', QN_C, [uk('У двері дзвонять. Ти хочеш знати, яка людина там. Яке слово потрібне?'), es('¿___ es?')], [
      ['Quién', 'c'], ['Qué', 'x', 'Qué — про річ; про людину — quién.'], ['Cómo', 'x', 'Cómo — «як?».'],
    ], 'Так: ¿Quién es? — «Хто це?».', 'Ні. Про людину — ¿Quién es?'),
    choice(78, 'independent', 'choose-word', QD_C, [uk('Ти хочеш знати місце, де знаходиться аптека. Яке слово потрібне?'), es('¿___ está la farmacia?')], [
      ['Dónde', 'c'], ['Cómo', 'x', 'Cómo — «як?»; місце — dónde.'], ['Quién', 'x', 'Quién — «хто?».'],
    ], 'Так: ¿Dónde está la farmacia?', 'Ні. Місце — ¿Dónde está…?'),
    choice(79, 'independent', 'choose-word', QC_C, [uk('Ти хочеш знати, як почувається подруга. Яке слово потрібне?'), es('¿___ estás?')], [
      ['Cómo', 'c'], ['Dónde', 'x', '¿Dónde estás? — «Де ти?»; самопочуття — ¿Cómo estás?'], ['Qué', 'x', 'Qué — «що?».'],
    ], 'Так: ¿Cómo estás?', 'Ні. Самопочуття — ¿Cómo estás?'),
    // ---------- question word reading ----------
    choice(81, 'independent', 'read-word', QQ_R, [uk('Що означає питання?'), es('¿Qué hay en la mesa?')], [
      ['Що є на столі?', 'c'], ['Хто за столом?', 'x', 'Qué — «що?».'], ['Де стіл?', 'x', 'Qué hay — «що є».'],
    ], 'Так: «Що є на столі?».', 'Ні. ¿Qué hay en la mesa? — «Що є на столі?».'),
    choice(82, 'independent', 'read-word', QN_R, [uk('Що означає питання?'), es('¿Quién es tu profesor?')], [
      ['Хто твій викладач?', 'c'], ['Звідки твій викладач?', 'x', '«Звідки?» — de dónde; quién — «хто?».'], ['Який твій викладач?', 'x', '«Який?» — cómo; quién — «хто?».'],
    ], 'Так: «Хто твій викладач?».', 'Ні. Quién — «хто?»: «Хто твій викладач?».'),
    choice(83, 'independent', 'read-word', QD_R, [uk('Що означає питання?'), es('¿De dónde son tus padres?')], [
      ['Звідки твої батьки?', 'c'], ['Де твої батьки?', 'x', '«Де?» — dónde; de dónde — «звідки?».'], ['Хто твої батьки?', 'x', '«Хто?» — quiénes.'],
    ], 'Так: «Звідки твої батьки?».', 'Ні. De dónde — «звідки?».'),
    choice(84, 'independent', 'read-word', QC_R, [uk('Що означає питання?'), es('¿Cómo es tu piso?')], [
      ['Яка твоя квартира?', 'c'], ['Де твоя квартира?', 'x', '«Де?» — dónde.'], ['Як ти почуваєшся у квартирі?', 'x', '¿Cómo es…? — про опис: «Яка твоя квартира?».'],
    ], 'Так: «Яка твоя квартира?».', 'Ні. ¿Cómo es tu piso? — «Яка твоя квартира?».'),
    // ---------- negation ----------
    t(91, 'supported', 'negate', [NG_U], 'Зроби речення запереченням.', 'No soy de Madrid.', [
      ['Soy no de Madrid.', 'x', 'No ставимо перед дієсловом: No soy de Madrid.'],
      ['Yo soy no de Madrid.', 'x', 'No ставимо перед дієсловом: Yo no soy de Madrid.'],
    ], 'No перед дієсловом', { support: 'Пам’ятай: no ставимо перед дієсловом.', shown: 'Soy de Madrid.', also: ['Yo no soy de Madrid.'] }),
    t(92, 'supported', 'negate', [NG_U], 'Зроби речення запереченням.', 'Ana no está en casa.', [
      ['No Ana está en casa.', 'x', 'No ставимо перед дієсловом: Ana no está en casa.'],
      ['Ana está no en casa.', 'x', 'No стоїть перед дієсловом, а не після нього.'],
    ], 'No перед дієсловом', { support: 'Пам’ятай: підмет → no → дієслово.', shown: 'Ana está en casa.' }),
    t(93, 'independent', 'translate', [NG_U], 'Напиши іспанською: «У мене немає машини».', 'No tengo coche.', [
      ['Tengo no coche.', 'x', 'No ставимо перед дієсловом: No tengo coche.'],
      ['No hay coche.', 'u', 'Речення правильне, але означає «Машини немає (тут)»; «у мене немає» — No tengo coche.'],
    ], 'No + tengo', { also: ['No tengo un coche.', 'Yo no tengo coche.'] }),
    t(94, 'independent', 'translate', [NG_U], 'Напиши іспанською: «Тут немає молока».', 'Aquí no hay leche.', [
      ['Aquí hay no leche.', 'x', 'No ставимо перед дієсловом: no hay.'],
    ], 'No + hay', { also: ['No hay leche aquí.', 'No hay leche.'] }),
    t(95, 'independent', 'answer', [NG_U, NG_W], 'Тебе питають: «¿Eres profesora?». Відповідай: «Ні, я не викладачка».', 'No, no soy profesora.', [
      ['No, soy no profesora.', { [NG_U]: 'x', [NG_W]: 'c' }, 'Друге no — перед дієсловом: no soy.'],
      ['No no soy profesora.', { [NG_W]: 'x', [NG_U]: 'c' }, 'Після першого no («ні») ставимо кому: No, no soy profesora.'],
      ['No soy profesora.', { [NG_U]: 'c', [NG_W]: 'u' }, 'Речення правильне; у повній відповіді зазвичай два no: No, no soy profesora.'],
    ], 'No, no + дієслово', { also: ['No, yo no soy profesora.', 'No. No soy profesora.'] }),
    t(96, 'independent', 'translate', [NG_U], 'Напиши іспанською: «Мої батьки не в Мадриді».', 'Mis padres no están en Madrid.', [
      ['Mis padres están no en Madrid.', 'x', 'No стоїть перед дієсловом.'],
      ['No mis padres están en Madrid.', 'x', 'No ставимо перед дієсловом: Mis padres no están…'],
    ], 'No перед дієсловом'),
    t(97, 'delayed', 'negate', [NG_U], 'Зроби речення запереченням.', 'Pablo no es médico.', [
      ['Pablo es no médico.', 'x', 'No стоїть перед дієсловом: Pablo no es médico.'],
    ], 'No перед дієсловом', { shown: 'Pablo es médico.' }),
    t(98, 'delayed', 'answer', [NG_U, NG_W], 'Тебе питають: «¿Tienes hambre?». Відповідай: «Ні, я не голодний».', 'No, no tengo hambre.', [
      ['No, tengo no hambre.', { [NG_U]: 'x', [NG_W]: 'c' }, 'Друге no — перед дієсловом: no tengo.'],
      ['No no tengo hambre.', { [NG_W]: 'x', [NG_U]: 'c' }, 'Після першого no ставимо кому.'],
    ], 'No, no + дієслово', { also: ['No, yo no tengo hambre.', 'No. No tengo hambre.'] }),
    t(99, 'transfer', 'chat', [NG_U], 'Друг пише, що чекає тебе біля дому. Відповідай: «Я не вдома, я в офісі».', 'No estoy en casa, estoy en la oficina.', [
      ['Estoy no en casa, estoy en la oficina.', 'x', 'No стоїть перед дієсловом: No estoy en casa.'],
    ], 'No перед дієсловом', { also: ['No estoy en casa. Estoy en la oficina.', 'Yo no estoy en casa, estoy en la oficina.', 'No estoy en casa; estoy en la oficina.'] }),
    t(100, 'transfer', 'neighbour-reply', [NG_U, NG_W], 'Сусід питає: «¿Eres española?». Відповідай (ти — жінка): «Ні, я не іспанка, я українка».', 'No, no soy española, soy ucraniana.', [
      ['No, soy no española, soy ucraniana.', { [NG_U]: 'x', [NG_W]: 'c' }, 'Друге no — перед дієсловом: no soy.'],
      ['No no soy española, soy ucraniana.', { [NG_W]: 'x', [NG_U]: 'c' }, 'Після першого no ставимо кому.'],
    ], 'No, no + дієслово', { also: ['No, no soy española. Soy ucraniana.', 'No. No soy española, soy ucraniana.', 'No, no soy española; soy ucraniana.'] }),
    choice(101, 'independent', 'choose-neg', NG_C, [uk('Яке заперечення правильне?')], [
      ['Ana no está en casa.', 'c'], ['Ana está no en casa.', 'x', 'No стоїть перед дієсловом.'], ['No Ana está en casa.', 'x', 'No ставимо перед дієсловом, а не перед підметом.'],
    ], 'Так: Ana no está en casa.', 'Ні. No — перед дієсловом: Ana no está en casa.'),
    choice(102, 'delayed', 'choose-neg', NG_C, [uk('Удома скінчився хліб. Як сказати «Хліба немає»?')], [
      ['No hay pan.', 'c'], ['Hay no pan.', 'x', 'No стоїть перед дієсловом: No hay pan.'], ['No hay el pan.', 'x', 'Тут ідеться про хліб загалом, тому після hay артикль el не потрібен: No hay pan.'],
    ], 'Так: No hay pan.', 'Ні. No hay pan.'),
    // ---------- listening ----------
    pick({
      n: 111, role: 'independent', family: 'listen-neg', targets: [LS_L], clips: ['clip.a1-03.no-tengo-coche'],
      prompt: [uk('Послухай. Що каже людина про машину й велосипед?')],
      options: [['Машини в неї немає, а велосипед є.', 'c'], ['У неї є машина й велосипед.', 'x', 'У записі no tengo coche — «у мене немає машини».'], ['У неї немає ні машини, ні велосипеда.', 'x', 'У записі tengo una bicicleta — велосипед є.']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано. Зверни увагу на no перед дієсловом.']],
      extraHints: [transcript([LS_L], 'No, no tengo coche. Tengo una bicicleta.')],
      ok: 'Так: No, no tengo coche. Tengo una bicicleta.', bad: 'Ні. У записі: No, no tengo coche. Tengo una bicicleta.',
    }),
    pick({
      n: 112, role: 'delayed', family: 'listen-question-who', targets: [LS_L], clips: ['clip.a1-03.quien-profesora'],
      prompt: [uk('Послухай. Про що питають?')],
      options: [['хто викладачка', 'c'], ['звідки викладачка', 'x', 'У записі ¿Quién es…? — «Хто…?».'], ['де викладачка', 'x', 'У записі ¿Quién es tu profesora?']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано. Знайди питальне слово: quién — «хто», тобто питають про людину.']],
      extraHints: [transcript([LS_L], 'Ana, ¿quién es tu profesora?')],
      ok: 'Так: ¿Quién es tu profesora? — «Хто твоя викладачка?».', bad: 'Ні. У записі: ¿Quién es tu profesora?',
    }),
  ],
  clips: [
    clip({ id: 'clip.a1-03.no-tengo-coche', lessonId: 'A1-03-L6', kind: 'sentence', family: 'negation', transcript: 'No, no tengo coche. Tengo una bicicleta.', translationUk: 'Ні, у мене немає машини. У мене є велосипед.', targets: [LS_L] }),
    clip({ id: 'clip.a1-03.quien-profesora', lessonId: 'A1-03-L6', kind: 'sentence', family: 'question-who', transcript: 'Ana, ¿quién es tu profesora?', translationUk: 'Ано, хто твоя викладачка?', targets: [LS_L] }),
  ],
};
