// A1-03-L5 — tener: forms, possession, and the small set tener hambre / sed / frío / calor / sueño.
import { clip, ex, gloss, tableUk, transcript, uk, ulUk, es } from '../lib.ts';
import type { OutcomeSpec, TaskSpec, Unit } from '../lib.ts';
import type { Block } from '../../../content/types.ts';
import { pick, typed } from '../common.ts';
import type { TaskRole } from '../../../content/types.ts';

const TN_W = 'present.tener/written-form';
const TN_C = 'present.tener/context-choice';
const TP_U = 'tener.possession/construction-use';
const TP_C = 'tener.possession/context-choice';
const PS_U = 'tener.physical-states/construction-use';
const PS_C = 'tener.physical-states/context-choice';
const LS_L = 'listening.short-sentences/listening-meaning';

const R: Record<string, string> = {
  [TN_W]: 'Форми tener: yo tengo, tú tienes, él/ella/usted tiene, nosotros tenemos, vosotros tenéis, ellos/ellas/ustedes tienen. У nosotros і vosotros основа ten-, у tienes, tiene, tienen — tien-.',
  [TP_U]: 'Українське «у мене є» іспанською — tengo: Tengo un coche. «У тебе є собака?» — ¿Tienes perro? Не плутай з hay: hay повідомляє, що щось є десь, а tener — що щось належить комусь.',
  [PS_U]: 'Там, де українською кажемо «мені холодно» чи «я голодний», іспанською вживають tener + іменник: Tengo frío. Tengo calor. Tengo hambre — «я голодний». Tengo sed — «хочу пити». Tengo sueño — «хочу спати». Estar у цих виразах не вживається.',
};
R[TN_C] = R[TN_W] as string;
R[TP_C] = R[TP_U] as string;
R[PS_C] = R[PS_U] as string;
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
function choice(n: number, role: TaskRole, family: string, target: string, prompt: Block[], options: Array<[string, OutcomeSpec, string?]>, ok: string, bad: string): TaskSpec {
  return pick({ n, role, family, targets: [target], prompt, options, rules: rulesOf([target]), ok, bad });
}
const Y: Block[] = [ex('y', 'і, та')];

export const unit: Unit = {
  lesson: {
    id: 'A1-03-L5',
    titleUk: 'Tener: «у мене є» і «мені холодно»',
    termEs: 'tener',
    summaryUk: 'Вивчиш форми дієслова tener і навчишся казати, що в тебе є (речі, родина), а також «я голодний», «хочу пити», «мені холодно», «мені спекотно», «хочу спати».',
    objectives: ['A1-03-O1', 'A1-03-O5'],
    cv: [],
    situations: ['people-family-home'],
    estimatedMinutes: 16,
    introduces: ['present.tener', 'tener.possession', 'tener.physical-states'],
    revisits: ['poss.mi-tu-su', 'article.indefinite', 'adj.agreement.o-a', 'hay.existence', 'estar.state', 'pron.subject-omission', 'writing.short-statement', 'listening.short-sentences'],
    steps: [
      {
        kind: 'explanation',
        title: 'Дієслово tener',
        blocks: [
          uk('Tener («мати») — неправильне дієслово. У nosotros і vosotros основа ten-, а в tienes, tiene, tienen — tien-.'),
          tableUk(['Займенник', 'Tener', 'Приклад'], [
            ['yo', 'tengo', 'Tengo un perro.'],
            ['tú', 'tienes', '¿Tienes coche?'],
            ['él / ella / usted', 'tiene', 'Ana tiene una hermana.'],
            ['nosotros / nosotras', 'tenemos', 'Tenemos un gato.'],
            ['vosotros / vosotras', 'tenéis', 'Tenéis una casa bonita.'],
            ['ellos / ellas / ustedes', 'tienen', 'Mis padres tienen una bicicleta.'],
          ]),
        ],
      },
      { kind: 'supported-practice', title: 'Форми tener: з підказкою', tasks: [41, 42] },
      { kind: 'independent-practice', title: 'Форми tener: самостійно', tasks: [43, 44, 50, 45, 46] },
      {
        kind: 'explanation',
        title: '«У мене є»: tener',
        blocks: [
          uk('Українське «у мене є» передаємо особовою формою tener: Tengo un coche — «У мене є машина». Tengo una hermana — «У мене є сестра». У питанні та після заперечення артикль часто пропускають: ¿Tienes perro? Tengo coche.'),
          uk('Не плутай з hay: hay повідомляє, що щось є десь (En la calle hay un banco), а tener — що щось належить комусь (Ana tiene un piso).'),
          uk('Зовнішність теж часто описують через tener: Ana tiene el pelo largo — «У Ани довге волосся».'),
          ex('¿Tienes perro? — Sí, tengo un perro y un gato.', 'У тебе є собака? — Так, у мене є собака й кіт.'),
        ],
      },
      { kind: 'supported-practice', title: '«У мене є»: з підказкою', tasks: [1, 2] },
      { kind: 'independent-practice', title: '«У мене є»: самостійно', tasks: [3, 11, 4, 5, 6] },
      {
        kind: 'explanation',
        title: 'Як почуваєшся: tener hambre, sed, frío, calor, sueño',
        blocks: [
          uk('Там, де українською кажемо «мені холодно» чи «я голодний», іспанською вживають tener + іменник. Estar тут не вживається.'),
          tableUk(['Іспанською', 'Українською'], [
            ['Tengo hambre.', 'Я голодний / голодна.'],
            ['Tengo sed.', 'Я хочу пити.'],
            ['Tengo frío.', 'Мені холодно.'],
            ['Tengo calor.', 'Мені спекотно.'],
            ['Tengo sueño.', 'Я хочу спати.'],
          ]),
        ],
      },
      { kind: 'supported-practice', title: 'Як почуваєшся: з підказкою', tasks: [21, 22] },
      { kind: 'independent-practice', title: 'Як почуваєшся: самостійно', tasks: [23, 31, 24, 25, 26] },
      { kind: 'listening', title: 'Послухай', clips: ['clip.a1-03.hermana-perro'], tasks: [61] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Tener: tengo, tienes, tiene, tenemos, tenéis, tienen.',
            '«У мене є» — tengo: Tengo un coche. ¿Tienes perro?',
            'Hay — щось є десь; tener — щось належить комусь.',
            'Tengo hambre / sed / frío / calor / sueño — без estar.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- tener.possession ----------
    t(1, 'supported', 'have', [TP_U], 'Напиши іспанською: «У мене є машина».', 'Tengo un coche.', [
      ['Hay un coche.', 'x', 'Hay — «десь є»; «у мене є» — tengo.'],
      ['Tengo una coche.', 'u', 'Tengo правильно, але coche — чоловічого роду: un coche.'],
    ], '«У мене є» — tengo', { support: 'Пам’ятай: «у мене є» — tengo.', also: ['Yo tengo un coche.', 'Tengo coche.'] }),
    t(2, 'supported', 'family', [TP_U], 'Напиши іспанською: «У мене є сестра».', 'Tengo una hermana.', [
      ['Hay una hermana.', 'x', '«У мене є» — tengo: Tengo una hermana.'],
      ['Soy una hermana.', 'x', 'Soy una hermana — «я сестра»; «у мене є сестра» — Tengo una hermana.'],
    ], '«У мене є» — tengo', { support: 'Пам’ятай: «у мене є» — tengo + un/una.', also: ['Yo tengo una hermana.'] }),
    t(3, 'independent', 'have', [TP_U], 'Спитай іспанською подругу: «У тебе є собака?»', '¿Tienes perro?', [
      ['¿Hay perro?', 'x', '«У тебе є» — tienes.'],
      ['¿Tiene perro?', 'u', 'Tiene — для él/ella/usted; подругу на «ти» питаємо ¿Tienes…?'],
    ], '«У тебе є» — tienes', { also: ['¿Tienes un perro?', '¿Tú tienes perro?', '¿Tú tienes un perro?'] }),
    t(4, 'independent', 'have', [TP_U], 'Напиши іспанською: «У Ани нова квартира».', 'Ana tiene un piso nuevo.', [
      ['Ana tengo un piso nuevo.', 'u', 'Конструкція правильна, але Ana — «вона»: tiene.'],
      ['Hay un piso nuevo de Ana.', 'x', 'Про те, що належить людині, кажемо tener: Ana tiene un piso nuevo.'],
    ], '«У неї є» — tiene', { also: [['Ana tiene un nuevo piso.', 'Теж правильно: nuevo може стояти й перед іменником.']] }),
    t(5, 'independent', 'family', [TP_U], 'Напиши іспанською: «У нас є кіт».', 'Tenemos un gato.', [
      ['Hay un gato.', 'x', '«У нас є» — tenemos.'],
      ['Tenemos una gata.', 'u', 'Tenemos правильно; «кіт» — un gato (una gata — «кішка»).'],
    ], '«У нас є» — tenemos', { also: ['Tenemos gato.', 'Nosotros tenemos un gato.'] }),
    t(6, 'independent', 'looks', [TP_U], 'Напиши іспанською: «У Пабло довге волосся».', 'Pablo tiene el pelo largo.', [
      ['Pablo tiene el pelo larga.', 'x', 'Pelo — чоловічого роду: largo.'],
      ['Pablo es el pelo largo.', 'x', 'Про волосся кажемо tener: Pablo tiene el pelo largo.'],
      ['Pablo tiene pelo largo.', 'u', 'Так теж кажуть; найчастіше — з артиклем: Pablo tiene el pelo largo.'],
    ], 'Tiene el pelo…'),
    t(7, 'delayed', 'have', [TP_U], 'Напиши іспанською: «У моїх батьків є велосипед».', 'Mis padres tienen una bicicleta.', [
      ['Mis padres tiene una bicicleta.', 'u', 'Конструкція правильна, але батьків двоє — tienen.'],
      ['Hay una bicicleta de mis padres.', 'x', 'Про те, що належить людям, кажемо tener.'],
    ], '«У них є» — tienen'),
    t(8, 'delayed', 'family', [TP_U], 'Напиши іспанською: «У мене є брат і сестра».', 'Tengo un hermano y una hermana.', [
      ['Hay un hermano y una hermana.', 'x', '«У мене є» — tengo.'],
      ['Soy un hermano y una hermana.', 'x', '«У мене є» — tengo.'],
    ], '«У мене є» — tengo', { also: ['Yo tengo un hermano y una hermana.'], gl: Y }),
    t(9, 'transfer', 'chat', [TP_U], 'Друг пише: «¿Tienes coche?». Відповідай: «Так, у мене є машина».', 'Sí, tengo coche.', [
      ['Sí, hay coche.', 'x', '«У мене є» — tengo.'],
      ['Sí, tienes coche.', 'u', 'Tienes — «у тебе є»; про себе — tengo.'],
    ], '«У мене є» — tengo', { also: ['Sí, tengo un coche.', 'Sí, yo tengo coche.', 'Sí, yo tengo un coche.', 'Sí. Tengo coche.', 'Sí. Tengo un coche.'] }),
    t(10, 'transfer', 'profile', [TP_U], 'Ти заповнюєш профіль на сайті й пишеш про себе: «У мене є кіт і собака».', 'Tengo un gato y un perro.', [
      ['Hay un gato y un perro.', 'x', '«У мене є» — tengo.'],
    ], '«У мене є» — tengo', { also: ['Yo tengo un gato y un perro.', 'Tengo un perro y un gato.'], gl: Y }),
    choice(11, 'independent', 'choose-have', TP_C, [uk('Як сказати «у мене є брат»?')], [
      ['Tengo un hermano.', 'c'], ['Hay un hermano.', 'x', 'Hay — «десь є»; «у мене є» — tengo.'], ['Soy un hermano.', 'x', 'Soy un hermano — «я брат».'],
    ], 'Так: Tengo un hermano.', 'Ні. «У мене є» — tengo: Tengo un hermano.'),
    choice(12, 'delayed', 'choose-have', TP_C, [uk('Що потрібно в пропуску? «У Ани є велосипед».'), es('Ana ___ una bicicleta.')], [
      ['tiene', 'c'], ['hay', 'x', 'Що належить людині — tener: tiene.'], ['es', 'x', 'Es una bicicleta — «це велосипед».'],
    ], 'Так: Ana tiene una bicicleta.', 'Ні. Ana tiene una bicicleta.'),
    // ---------- tener.physical-states ----------
    t(21, 'supported', 'feel', [PS_U], 'Напиши іспанською: «Я голодний».', 'Tengo hambre.', [
      ['Estoy hambre.', 'x', 'У цьому виразі — tener: Tengo hambre.'],
      ['Soy hambre.', 'x', 'У цьому виразі — tener: Tengo hambre.'],
    ], 'Tengo hambre', { support: 'Пам’ятай: «я голодний» — tengo hambre (tener + іменник).', also: ['Yo tengo hambre.'] }),
    t(22, 'supported', 'feel', [PS_U], 'Напиши іспанською: «Мені холодно».', 'Tengo frío.', [
      ['Estoy frío.', 'x', '«Мені холодно» — tengo frío.'],
      ['Soy frío.', 'x', '«Мені холодно» — tengo frío.'],
      ['Tengo frio.', 'u', 'Вираз правильний, але frío пишеться зі знаком наголосу.'],
    ], 'Tengo frío', { support: 'Пам’ятай: «мені холодно» — tengo frío.', also: ['Yo tengo frío.'] }),
    t(23, 'independent', 'ask', [PS_U], 'Спитай іспанською подругу: «Ти хочеш пити?»', '¿Tienes sed?', [
      ['¿Estás sed?', 'x', '«Хочеш пити?» — ¿Tienes sed?'],
    ], '¿Tienes sed?', { also: ['¿Tú tienes sed?'] }),
    t(24, 'independent', 'feel', [PS_U], 'Напиши іспанською: «Нам спекотно».', 'Tenemos calor.', [
      ['Estamos calor.', 'x', '«Нам спекотно» — tenemos calor.'],
    ], 'Tenemos calor', { also: ['Nosotros tenemos calor.', 'Nosotras tenemos calor.'] }),
    t(25, 'independent', 'feel', [PS_U], 'Напиши іспанською: «Пабло хоче спати».', 'Pablo tiene sueño.', [
      ['Pablo está sueño.', 'x', '«Хоче спати» — tiene sueño.'],
      ['Pablo tiene sueno.', 'u', 'Вираз правильний, але бракує літери ñ: sueño.'],
    ], 'Tiene sueño'),
    t(26, 'independent', 'feel', [PS_U], 'Напиши іспанською: «Діти голодні» (діти — los niños).', 'Los niños tienen hambre.', [
      ['Los niños están hambre.', 'x', '«Голодні» — tienen hambre.'],
      ['Los niños tiene hambre.', 'u', 'Вираз правильний, але дітей кілька — tienen.'],
    ], 'Tienen hambre'),
    t(27, 'delayed', 'feel', [PS_U], 'Напиши іспанською: «Мені спекотно».', 'Tengo calor.', [
      ['Estoy calor.', 'x', '«Мені спекотно» — tengo calor.'],
    ], 'Tengo calor', { also: ['Yo tengo calor.'] }),
    t(28, 'delayed', 'ask', [PS_U], 'Спитай іспанською двох друзів (на «ти»): «Ви хочете пити?»', '¿Tenéis sed?', [
      ['¿Estáis sed?', 'x', '«Хочете пити?» — ¿Tenéis sed?'],
      ['¿Tienen sed?', 'u', 'Tienen — для ellos або ввічливого ustedes; друзям на «ти» — ¿Tenéis sed?'],
    ], '¿Tenéis sed?', { also: ['¿Vosotros tenéis sed?', '¿Vosotras tenéis sed?'] }),
    t(29, 'transfer', 'message', [PS_U], 'Ти пишеш мамі ввечері: «Я втомлена й хочу спати» (ти — жінка).', 'Estoy cansada y tengo sueño.', [
      ['Estoy cansada y estoy sueño.', 'x', '«Хочу спати» — tengo sueño.'],
    ], 'Tengo sueño', { also: ['Estoy cansada y tengo mucho sueño.'], gl: Y }),
    t(30, 'transfer', 'visit', [PS_U], 'У гостях тебе питають: «¿Tienes hambre?». Відповідай: «Так, я голодний і хочу пити».', 'Sí, tengo hambre y sed.', [
      ['Sí, estoy hambre y sed.', 'x', 'У цих виразах — tener: tengo hambre y sed.'],
    ], 'Tengo hambre y sed', { also: ['Sí, tengo hambre y tengo sed.', 'Sí. Tengo hambre y sed.', 'Sí, tengo sed y hambre.'], gl: Y }),
    choice(31, 'independent', 'choose-feel', PS_C, [uk('Узимку на вулиці тобі холодно. Що ти скажеш?')], [
      ['Tengo frío.', 'c'], ['Estoy frío.', 'x', '«Мені холодно» — tengo frío.'], ['Tengo calor.', 'x', 'Calor — «спекотно».'],
    ], 'Так: Tengo frío.', 'Ні. «Мені холодно» — Tengo frío.'),
    choice(32, 'delayed', 'choose-feel', PS_C, [uk('Ти не спав усю ніч. Що ти скажеш?')], [
      ['Tengo sueño.', 'c'], ['Tengo sed.', 'x', 'Sed — «спрага»; «хочу спати» — tengo sueño.'], ['Estoy sueño.', 'x', 'У цьому виразі — tener.'],
    ], 'Так: Tengo sueño.', 'Ні. «Хочу спати» — Tengo sueño.'),
    // ---------- present.tener forms ----------
    t(41, 'supported', 'fill', [TN_W], 'Допиши форму tener і напиши речення повністю.', 'Yo tengo un perro.', [
      ['Yo tieno un perro.', 'x', 'З yo — tengo.'],
      ['Yo tiene un perro.', 'x', 'Tiene — з él/ella; з yo — tengo.'],
    ], 'Yo tengo', { support: 'Пам’ятай: tengo, tienes, tiene, tenemos, tenéis, tienen.', shown: 'Yo ___ un perro.', also: ['tengo.'] }),
    t(42, 'supported', 'fill', [TN_W], 'Допиши форму tener і напиши речення повністю.', 'Tú tienes sed.', [
      ['Tú tenes sed.', 'x', 'З tú основа tien-: tienes.'],
    ], 'Tú tienes', { support: 'Пам’ятай: у tienes, tiene, tienen основа tien-.', shown: 'Tú ___ sed.', also: ['tienes.'] }),
    t(43, 'independent', 'fill', [TN_W], 'Допиши форму tener і напиши речення повністю.', 'Nosotros tenemos un coche.', [
      ['Nosotros tienemos un coche.', 'x', 'З nosotros основа ten-: tenemos.'],
    ], 'Nosotros tenemos', { shown: 'Nosotros ___ un coche.', also: ['tenemos.'] }),
    t(44, 'independent', 'fill', [TN_W], 'Допиши форму tener і напиши речення повністю.', 'Vosotros tenéis frío.', [
      ['Vosotros tienéis frío.', 'x', 'З vosotros основа ten-: tenéis.'],
      ['Vosotros teneis frío.', 'x', 'Tenéis пишеться зі знаком наголосу.'],
    ], 'Vosotros tenéis', { shown: 'Vosotros ___ frío.', also: ['tenéis.'] }),
    t(45, 'independent', 'fill', [TN_W], 'Допиши форму tener і напиши речення повністю.', 'Ella tiene una bicicleta.', [
      ['Ella tene una bicicleta.', 'x', 'З ella — tiene.'],
    ], 'Ella tiene', { shown: 'Ella ___ una bicicleta.', also: ['tiene.'] }),
    t(46, 'independent', 'fill', [TN_W], 'Допиши форму tener і напиши речення повністю.', 'Ellos tienen calor.', [
      ['Ellos tenen calor.', 'x', 'З ellos основа tien-: tienen.'],
    ], 'Ellos tienen', { shown: 'Ellos ___ calor.', also: ['tienen.'] }),
    t(47, 'delayed', 'fill', [TN_W], 'Допиши форму tener і напиши речення повністю.', 'Usted tiene un hijo.', [
      ['Usted tienes un hijo.', 'x', 'Usted поєднується з формою 3-ї особи: tiene.'],
    ], 'Usted tiene', { shown: 'Usted ___ un hijo.', also: ['tiene.'] }),
    t(48, 'delayed', 'fill', [TN_W], 'Допиши форму tener і напиши речення повністю.', 'Ustedes tienen hambre.', [
      ['Ustedes tenéis hambre.', 'x', 'Ustedes поєднується з формою 3-ї особи множини: tienen.'],
    ], 'Ustedes tienen', { shown: 'Ustedes ___ hambre.', also: ['tienen.'] }),
    t(49, 'transfer', 'chat-form', [TN_W], 'Ти пишеш другові: «У нас із братом є мотоцикл». Допиши форму tener і напиши речення повністю.', 'Mi hermano y yo tenemos una moto.', [
      ['Mi hermano y yo tienen una moto.', 'x', 'Mi hermano y yo — це «ми»: tenemos.'],
    ], 'Mi hermano y yo tenemos', { shown: 'Mi hermano y yo ___ una moto.', also: ['tenemos.'] }),
    choice(50, 'independent', 'choose-form', TN_C, [uk('Яка форма tener потрібна?'), es('Pablo y tú ___ un gato.')], [
      ['tenéis', 'c'], ['tienen', 'x', 'Pablo y tú — це vosotros: tenéis.'], ['tenemos', 'x', '«Ми» — якщо серед них є я.'],
    ], 'Так: Pablo y tú tenéis un gato.', 'Ні. Pablo y tú = vosotros → tenéis.'),
    // ---------- listening ----------
    pick({
      n: 61, role: 'independent', family: 'listen-have', targets: [LS_L], clips: ['clip.a1-03.hermana-perro'],
      prompt: [uk('Послухай. Що є в сестри?')],
      options: [['дуже гарний собака', 'c'], ['дуже гарний кіт', 'x', 'У записі un perro — «собака».'], ['новий велосипед', 'x', 'У записі un perro muy bonito.']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано: хто, що має, де, що є.']],
      extraHints: [transcript([LS_L], 'Mi hermana tiene un perro muy bonito.')],
      ok: 'Так: Mi hermana tiene un perro muy bonito.', bad: 'Ні. У записі: Mi hermana tiene un perro muy bonito.',
    }),
    pick({
      n: 62, role: 'delayed', family: 'listen-question-feel', targets: [LS_L], clips: ['clip.a1-03.tienes-hambre'],
      prompt: [uk('Послухай. Про що питають Пабло?')],
      options: [['чи ти голодний', 'c'], ['чи тобі холодно', 'x', 'У записі hambre — «голод».'], ['чи ти хочеш спати', 'x', 'У записі ¿Tienes hambre?']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано. У питанні голос у кінці підвищується.']],
      extraHints: [transcript([LS_L], 'Pablo, ¿tienes hambre?')],
      ok: 'Так: Pablo, ¿tienes hambre? — «Пабло, ти голодний?».', bad: 'Ні. У записі: Pablo, ¿tienes hambre?',
    }),
  ],
  clips: [
    clip({ id: 'clip.a1-03.hermana-perro', lessonId: 'A1-03-L5', kind: 'sentence', family: 'possession', transcript: 'Mi hermana tiene un perro muy bonito.', translationUk: 'У моєї сестри дуже гарний собака.', targets: [LS_L] }),
    clip({ id: 'clip.a1-03.tienes-hambre', lessonId: 'A1-03-L5', kind: 'sentence', family: 'question-feel', transcript: 'Pablo, ¿tienes hambre?', translationUk: 'Пабло, ти голодний?', targets: [LS_L] }),
  ],
};
