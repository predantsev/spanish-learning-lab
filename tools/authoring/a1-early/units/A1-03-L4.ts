// A1-03-L4 — hay (existence) versus estar (location of a known person/thing).
import { clip, ex, gloss, tableEs, transcript, uk, ulUk, es } from '../lib.ts';
import type { OutcomeSpec, TaskSpec, Unit } from '../lib.ts';
import type { Block } from '../../../content/types.ts';
import { pick, typed } from '../common.ts';
import type { TaskRole } from '../../../content/types.ts';

const HY_U = 'hay.existence/construction-use';
const HY_W = 'hay.existence/written-form';
const HY_C = 'hay.existence/context-choice';
const HE_C = 'contrast.hay-estar/context-choice';
const HE_U = 'contrast.hay-estar/construction-use';
const LS_L = 'listening.short-sentences/listening-meaning';

const R: Record<string, string> = {
  [HY_U]: 'Hay означає «є, існує, знаходиться» і не змінюється: Hay un libro en la mesa. Hay unas sillas. Після hay зазвичай стоїть un/una/unos/unas або іменник без артикля, але не el/la: Hay leche.',
  [HY_W]: 'Hay пишеться з h (вона не читається) і має одну форму для однини й множини: Hay un banco. Hay unos coches.',
  [HE_U]: 'Hay — коли повідомляємо, що щось є (нове, ще не відоме): En la calle hay un banco. Estar — коли кажемо, де знаходиться конкретна, уже відома річ чи людина: El banco está en la calle. Тому зазвичай після hay стоїть un/una або іменник без артикля, а з estar — el/la, mi або ім’я; але вирішує зміст, а не сам артикль.',
};
R[HY_C] = R[HY_U] as string;
R[HE_C] = R[HE_U] as string;
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
    id: 'A1-03-L4',
    titleUk: 'Hay чи estar: що є — і де воно',
    termEs: 'hay / estar',
    summaryUk: 'Навчишся казати, що десь щось є (hay), і відрізняти це від того, де знаходиться відома річ чи людина (estar).',
    objectives: ['A1-03-O1', 'A1-03-O4'],
    cv: [],
    situations: [],
    estimatedMinutes: 15,
    introduces: ['hay.existence', 'contrast.hay-estar'],
    revisits: ['estar.location', 'present.estar', 'prep.en.location', 'article.indefinite', 'article.definite-indefinite', 'article.plural', 'listening.short-sentences'],
    steps: [
      {
        kind: 'explanation',
        title: 'Hay — «є»',
        blocks: [
          uk('Hay означає «є, існує, знаходиться». Це одна незмінна форма для однини й множини: Hay un libro en la mesa. Hay unas sillas en la cocina. H у hay не читається.'),
          uk('Після hay зазвичай стоїть un, una, unos, unas або іменник без артикля, але не el/la: Hay leche. Hay pan. Питання: ¿Hay un hotel aquí? — «Тут є готель?».'),
          ex('En mi calle hay una farmacia.', 'На моїй вулиці є аптека.'),
          ex('Hay pan y leche en la cocina.', 'На кухні є хліб і молоко.'),
        ],
      },
      { kind: 'supported-practice', title: 'Тренування з підказкою', tasks: [1, 2, 11] },
      { kind: 'independent-practice', title: 'Самостійно', tasks: [3, 12, 15, 4, 6] },
      {
        kind: 'explanation',
        title: 'Hay чи estar',
        blocks: [
          uk('Hay кажемо, коли повідомляємо, що щось є — це нова, ще не відома річ: En la calle hay un banco. Estar — коли говоримо, де знаходиться конкретна, уже відома річ чи людина: El banco está en la calle.'),
          uk('Підказка — слово перед іменником: hay + un/una або без артикля; estar + el/la, mi чи ім’я.'),
          tableEs(['Hay', 'Estar'], [
            ['En la calle hay un banco.', 'El banco está en la calle.'],
            ['¿Hay un hotel aquí?', '¿Dónde está el hotel?'],
            ['En la mesa hay unas llaves.', 'Mis llaves están en la mesa.'],
          ]),
        ],
      },
      { kind: 'supported-practice', title: 'Hay чи estar: з підказкою', tasks: [21, 31, 33] },
      { kind: 'independent-practice', title: 'Hay чи estar: самостійно', tasks: [22, 32, 23, 37, 24, 39, 25, 40] },
      { kind: 'listening', title: 'Послухай', clips: ['clip.a1-03.calle-farmacia', 'clip.a1-03.donde-estacion'], tasks: [51] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Hay — «є»: одна форма для однини й множини: Hay un banco. Hay unas sillas.',
            'Після hay — un/una/unos/unas або без артикля, не el/la.',
            'Відома річ чи людина — estar: El banco está en la calle. ¿Dónde está el hotel?',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- hay.existence (construction-use) ----------
    t(1, 'supported', 'room', [HY_U], 'Напиши іспанською: «На столі є книжка».', 'Hay un libro en la mesa.', [
      ['Hay el libro en la mesa.', 'x', 'Тут повідомляємо, що на столі є якась книжка: Hay un libro en la mesa. Про відому книжку сказали б El libro está en la mesa.'],
      ['Está un libro en la mesa.', 'x', 'Що десь є (нова річ) — hay: Hay un libro en la mesa.'],
      ['Es un libro en la mesa.', 'x', 'Що десь є — hay: Hay un libro en la mesa.'],
    ], 'Hay + un/una', { support: 'Пам’ятай: «є» — hay, після нього зазвичай un/una.', also: ['En la mesa hay un libro.'] }),
    t(2, 'supported', 'room', [HY_U], 'Напиши іспанською: «На кухні є стільці».', 'Hay sillas en la cocina.', [
      ['Hay las sillas en la cocina.', 'x', 'Тут повідомляємо, що на кухні є стільці: Hay sillas / Hay unas sillas.'],
      ['Están unas sillas en la cocina.', 'x', 'Що десь є — hay, і він не змінюється: Hay sillas.'],
    ], 'Hay — одна форма', { support: 'Пам’ятай: hay не змінюється й у множині.', also: ['Hay unas sillas en la cocina.', 'En la cocina hay sillas.', 'En la cocina hay unas sillas.'] }),
    t(3, 'independent', 'street', [HY_U], 'Напиши іспанською: «На моїй вулиці є аптека».', 'En mi calle hay una farmacia.', [
      ['En mi calle hay la farmacia.', 'x', 'Тут повідомляємо, що на вулиці є аптека: hay una farmacia.'],
      ['En mi calle está una farmacia.', 'x', 'Що десь є — hay.'],
    ], 'Hay + una', { also: ['Hay una farmacia en mi calle.'] }),
    t(4, 'independent', 'street', [HY_U], 'Спитай іспанською перехожого: «Тут є готель?»', '¿Hay un hotel aquí?', [
      ['¿Está un hotel aquí?', 'x', 'Чи щось є — hay: ¿Hay un hotel aquí?'],
      ['¿Hay el hotel aquí?', 'x', 'Питаємо, чи тут узагалі є готель: ¿Hay un hotel aquí?'],
    ], '¿Hay…?', { also: ['¿Aquí hay un hotel?', '¿Hay hotel aquí?', '¿Hay un hotel por aquí?'] }),
    t(6, 'independent', 'street', [HY_U], 'Напиши іспанською: «На площі є ресторан».', 'En la plaza hay un restaurante.', [
      ['En la plaza está un restaurante.', 'x', 'Що десь є — hay.'],
      ['En la plaza es un restaurante.', 'x', 'Що десь є — hay.'],
    ], 'Hay + un', { also: ['Hay un restaurante en la plaza.'] }),
    t(7, 'delayed', 'street', [HY_U], 'Напиши іспанською: «У парку є кав’ярня» (кав’ярня — un café).', 'En el parque hay un café.', [
      ['En el parque está un café.', 'x', 'Що десь є — hay.'],
      ['En el parque hay el café.', 'x', 'Тут повідомляємо, що в парку є кав’ярня: hay un café.'],
    ], 'Hay + un', { also: ['Hay un café en el parque.', ['En el parque hay una cafetería.', 'Cafetería ми ще не вивчали, але речення правильне.'], ['Hay una cafetería en el parque.', 'Cafetería ми ще не вивчали, але речення правильне.']] }),
    t(9, 'transfer', 'ad', [HY_U], 'Ти пишеш оголошення про квартиру: «У квартирі є велика кухня».', 'En el piso hay una cocina grande.', [
      ['En el piso está una cocina grande.', 'x', 'Що десь є — hay.'],
      ['En el piso hay la cocina grande.', 'x', 'Тут повідомляємо, що в квартирі є велика кухня: hay una cocina grande.'],
    ], 'Hay + una', { also: ['Hay una cocina grande en el piso.'] }),
    t(10, 'transfer', 'message', [HY_U], 'Ти пишеш другові, який шукає, де купити їжу: «На моїй вулиці є супермаркет».', 'En mi calle hay un supermercado.', [
      ['En mi calle está un supermercado.', 'x', 'Що десь є — hay.'],
      ['En mi calle hay el supermercado.', 'x', 'Тут повідомляємо, що на вулиці є супермаркет: hay un supermercado.'],
    ], 'Hay + un', { also: ['Hay un supermercado en mi calle.'] }),
    // ---------- hay.existence (written-form) ----------
    t(11, 'supported', 'fill', [HY_W], 'Допиши пропущене слово (можна написати лише його або все речення): «На площі є банк».', 'Hay un banco en la plaza.', [
      ['Ay un banco en la plaza.', 'x', 'Hay пишеться з h, хоча вона не читається.'],
      ['Está un banco en la plaza.', 'x', 'Що десь є — hay.'],
    ], 'Hay', { support: 'Пам’ятай: «є» — hay, з h на початку.', shown: '___ un banco en la plaza.', also: ['Hay.'] }),
    t(12, 'independent', 'fill', [HY_W], 'Допиши пропущене слово (можна написати лише його або все речення): «На столі є квіти».', 'Hay unas flores en la mesa.', [
      ['Ay unas flores en la mesa.', 'x', 'Hay пишеться з h.'],
      ['Son unas flores en la mesa.', 'x', 'Що десь є — hay.'],
    ], 'Hay — одна форма', { shown: '___ unas flores en la mesa.', also: ['Hay.'] }),
    t(13, 'delayed', 'fill', [HY_W], 'Допиши пропущене слово (можна написати лише його або все речення): «На вулиці є машини».', 'En la calle hay unos coches.', [
      ['En la calle están unos coches.', 'x', 'Що десь є — hay, і він не змінюється.'],
      ['En la calle ay unos coches.', 'x', 'Hay пишеться з h.'],
    ], 'Hay — одна форма', { shown: 'En la calle ___ unos coches.', also: ['hay.'] }),
    choice(15, 'independent', 'choose-hay', HY_C, [uk('Ти повідомляєш другові новину: у місті відкрили новий ресторан. Що ти напишеш?')], [
      ['Hay un restaurante nuevo.', 'c'], ['Está un restaurante nuevo.', 'x', 'Що десь є — hay.'], ['Es el restaurante nuevo.', 'x', 'Тут треба сказати, що ресторан є: Hay un restaurante nuevo.'],
    ], 'Так: Hay un restaurante nuevo.', 'Ні. Що десь є — hay: Hay un restaurante nuevo.'),
    choice(16, 'delayed', 'choose-hay', HY_C, [uk('Ти кажеш гостеві, що на кухні є хліб і молоко. Що потрібно в пропуску?'), es('En la cocina ___ pan y leche.')], [
      ['hay', 'c'], ['están', 'x', 'Що десь є — hay, і він не змінюється.'], ['son', 'x', 'Що десь є — hay.'],
    ], 'Так: En la cocina hay pan y leche.', 'Ні. Що десь є — hay: En la cocina hay pan y leche.'),
    // ---------- contrast.hay-estar (context-choice) ----------
    choice(21, 'supported', 'hay-estar', HE_C, [uk('Пам’ятай: щоб повідомити, що щось є, — hay; щоб сказати, де відома річ, — estar.'), uk('Турист не знає, чи є поруч банк. Ти повідомляєш йому, що на вулиці є банк. Що потрібно?'), es('En la calle ___ un banco.')], [
      ['hay', 'c'], ['está', 'x', 'Ти повідомляєш, що банк є, а не де знаходиться відомий банк: hay.'],
    ], 'Так: En la calle hay un banco.', 'Ні. Повідомляємо, що банк є, — hay.'),
    choice(22, 'independent', 'hay-estar', HE_C, [es('El banco ___ en la plaza.')], [
      ['está', 'c'], ['hay', 'x', 'El banco — конкретний, відомий банк: está.'],
    ], 'Так: El banco está en la plaza.', 'Ні. Відома річ (el banco) — está.'),
    choice(23, 'independent', 'hay-estar', HE_C, [uk('Ти в новому місті й не знаєш, чи є тут готель.'), es('¿___ un hotel aquí?')], [
      ['Hay', 'c'], ['Está', 'x', 'Питаєш, чи готель взагалі є: ¿Hay un hotel aquí?'],
    ], 'Так: ¿Hay un hotel aquí?', 'Ні. Чи щось є — ¿Hay…?'),
    choice(24, 'independent', 'hay-estar', HE_C, [uk('Ти знаєш назву свого готелю й питаєш, де він.'), es('¿Dónde ___ el hotel?')], [
      ['está', 'c'], ['hay', 'x', 'Відомий готель (el hotel) — está.'],
    ], 'Так: ¿Dónde está el hotel?', 'Ні. Де знаходиться відома річ — ¿Dónde está…?'),
    choice(25, 'independent', 'hay-estar', HE_C, [es('Mi coche ___ en la calle.')], [
      ['está', 'c'], ['hay', 'x', 'Mi coche — конкретна, моя машина: está.'],
    ], 'Так: Mi coche está en la calle.', 'Ні. Моя машина — відома річ: está.'),
    choice(26, 'delayed', 'hay-estar', HE_C, [uk('Ти заходиш у кімнату й бачиш на столі якісь ключі — не знаєш, чиї. Ти повідомляєш, що вони там є.'), es('En la mesa ___ unas llaves.')], [
      ['hay', 'c'], ['están', 'x', 'Ти повідомляєш, що на столі є якісь ключі, — для цього hay.'],
    ], 'Так: En la mesa hay unas llaves.', 'Ні. Повідомляємо, що ключі є, — hay.'),
    choice(27, 'delayed', 'hay-estar', HE_C, [es('Las llaves ___ en la mesa.')], [
      ['están', 'c'], ['hay', 'x', 'Las llaves — конкретні ключі: están.'],
    ], 'Так: Las llaves están en la mesa.', 'Ні. Відомі ключі (las llaves) — están.'),
    choice(28, 'transfer', 'hay-estar-text', HE_C, [uk('Ти пишеш гостеві, як знайти аптеку. Що потрібно в пропусках?'), es('En la plaza ___ una farmacia. La farmacia ___ abierta.')], [
      ['hay … está', 'c'], ['está … hay', 'x', 'Спершу повідомляємо, що аптека є (hay); далі — її стан (está).'], ['hay … hay', 'x', 'Друге речення — стан відомої аптеки: está abierta.'],
    ], 'Так: En la plaza hay una farmacia. La farmacia está abierta.', 'Ні. En la plaza hay una farmacia. La farmacia está abierta.'),
    // ---------- contrast.hay-estar (construction-use) ----------
    t(31, 'supported', 'rewrite', [HE_U], 'Перепиши речення так, щоб сказати, де знаходиться ця (уже відома) книжка: el libro.', 'El libro está en la mesa.', [
      ['El libro hay en la mesa.', 'x', 'З el libro (відома річ) — está.'],
      ['Hay el libro en la mesa.', 'x', 'Тут говоримо про місце відомої книжки: El libro está en la mesa.'],
    ], 'Відома річ — está', { support: 'Пам’ятай: що десь є — hay; де відома річ — estar.', shown: 'Hay un libro en la mesa.' }),
    t(32, 'independent', 'dialogue', [HE_U], 'Тебе питають: «¿Dónde está la farmacia?». Відповідай: «Аптека на площі».', 'La farmacia está en la plaza.', [
      ['Hay la farmacia en la plaza.', 'x', 'Про відому аптеку (la farmacia) — está.'],
      ['En la plaza hay una farmacia.', 'u', 'Речення правильне, але повідомляє, що аптека є; на питання «де?» відповідаємо: La farmacia está en la plaza.'],
    ], 'Відома річ — está', { also: ['Está en la plaza.'] }),
    t(33, 'supported', 'found', [HE_U], 'Ти шукав свої ключі й нарешті побачив їх. Напиши: «Мої ключі на столі!»', '¡Mis llaves están en la mesa!', [
      ['¡Hay mis llaves en la mesa!', 'x', 'Мої ключі — відома річ: están.'],
      ['Hay mis llaves en la mesa.', 'x', 'Мої ключі — відома річ: están.'],
    ], 'Mis llaves — están', { support: 'Пам’ятай: з mi, mis, el, la — estar.', also: ['Mis llaves están en la mesa.'] }),
    t(34, 'delayed', 'question', [HE_U], 'Друг питає, чи є поблизу супермаркет. Напиши його питання: «Тут є супермаркет?»', '¿Hay un supermercado aquí?', [
      ['¿Está un supermercado aquí?', 'x', 'Чи щось є — ¿Hay…?'],
      ['¿Dónde está el supermercado?', 'u', 'Питання правильне, але так питають про відомий супермаркет; тут — чи він узагалі є: ¿Hay un supermercado aquí?'],
    ], '¿Hay…?', { also: ['¿Aquí hay un supermercado?', '¿Hay supermercado aquí?', '¿Hay un supermercado por aquí?'] }),
    t(35, 'transfer', 'host-note', [HE_U], 'Гість знає, що ти залишиш йому ключ від квартири, і знає, про який ключ ідеться. Ти пишеш йому записку: «Ключ на столі».', 'La llave está en la mesa.', [
      ['Hay la llave en la mesa.', 'x', 'Ключ — відомий, конкретний: está.'],
      ['Hay una llave en la mesa.', 'x', 'Так повідомляють, що на столі є якийсь ключ. Гість уже знає, про який ключ ідеться, тому кажемо, де він: La llave está en la mesa.'],
    ], 'La llave — está'),
    t(36, 'transfer', 'ad-text', [HE_U], 'Ти пишеш в оголошенні два речення: «На площі є ресторан. Ресторан відчинений».', 'En la plaza hay un restaurante. El restaurante está abierto.', [
      ['En la plaza está un restaurante. El restaurante está abierto.', 'x', 'Спершу повідомляємо, що ресторан є: hay un restaurante.'],
      ['En la plaza hay un restaurante. Hay el restaurante abierto.', 'x', 'Про відомий ресторан — está abierto.'],
    ], 'Hay … / El restaurante está …', { also: ['Hay un restaurante en la plaza. El restaurante está abierto.', 'En la plaza hay un restaurante. Está abierto.', 'Hay un restaurante en la plaza. Está abierto.'], gl: Y }),
    t(37, 'independent', 'question', [HE_U], 'Спитай перехожого про відомий тобі банк: «Де банк?»', '¿Dónde está el banco?', [
      ['¿Dónde hay el banco?', 'x', 'Про відомий банк (el banco) — está.'],
      ['¿Donde está el banco?', 'u', 'Питання правильне, але dónde пишеться зі знаком наголосу.'],
    ], '¿Dónde está…?', { gl: [ex('dónde', 'де')] }),
    t(38, 'delayed', 'family-text', [HE_U], 'Напиши два речення: «Мій тато в офісі. В офісі є кав’ярня» (кав’ярня — un café).', 'Mi padre está en la oficina. En la oficina hay un café.', [
      ['Hay mi padre en la oficina. En la oficina hay un café.', 'x', 'Про тата (відома людина) — está.'],
      ['Mi padre está en la oficina. En la oficina está un café.', 'x', 'Що десь є — hay un café.'],
    ], 'Está … / hay …', { also: ['Mi padre está en la oficina. Hay un café en la oficina.'] }),
    t(39, 'independent', 'family', [HE_U], 'Напиши іспанською: «Моя мама на кухні».', 'Mi madre está en la cocina.', [
      ['Hay mi madre en la cocina.', 'x', 'Мама — конкретна, відома людина: está.'],
    ], 'Mi madre — está'),
    t(40, 'independent', 'room', [HE_U], 'Напиши іспанською: «На кухні є стіл».', 'En la cocina hay una mesa.', [
      ['En la cocina está una mesa.', 'x', 'Що десь є — hay una mesa.'],
      ['En la cocina hay la mesa.', 'x', 'Тут повідомляємо, що на кухні є стіл: En la cocina hay una mesa.'],
    ], 'Hay + una', { also: ['Hay una mesa en la cocina.'] }),
    // ---------- listening ----------
    pick({
      n: 51, role: 'independent', family: 'listen-street', targets: [LS_L], clips: ['clip.a1-03.calle-farmacia'],
      prompt: [uk('Послухай. Що є на вулиці?')],
      options: [['аптека', 'c'], ['супермаркет', 'x', 'У записі una farmacia — «аптека».'], ['банк', 'x', 'У записі una farmacia.']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано: хто, звідки, де, що є.']],
      extraHints: [transcript([LS_L], 'En mi calle hay una farmacia.')],
      ok: 'Так: En mi calle hay una farmacia.', bad: 'Ні. У записі: En mi calle hay una farmacia — «аптека».',
    }),
    pick({
      n: 52, role: 'delayed', family: 'listen-question-where', targets: [LS_L], clips: ['clip.a1-03.donde-estacion'],
      prompt: [uk('Послухай. Що питає людина?')],
      options: [['де вокзал', 'c'], ['чи є тут вокзал', 'x', 'У записі ¿Dónde está la estación? — «Де вокзал?».'], ['де готель', 'x', 'У записі la estación — «вокзал».']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано. Dónde — «де»: це слово показує, що питають про місце.']],
      extraHints: [transcript([LS_L], 'Perdón, ¿dónde está la estación?')],
      ok: 'Так: Perdón, ¿dónde está la estación?', bad: 'Ні. У записі: Perdón, ¿dónde está la estación? — «Де вокзал?».',
    }),
  ],
  clips: [
    clip({ id: 'clip.a1-03.calle-farmacia', lessonId: 'A1-03-L4', kind: 'sentence', family: 'existence', transcript: 'En mi calle hay una farmacia.', translationUk: 'На моїй вулиці є аптека.', targets: [LS_L] }),
    clip({ id: 'clip.a1-03.donde-estacion', lessonId: 'A1-03-L4', kind: 'sentence', family: 'question-where', transcript: 'Perdón, ¿dónde está la estación?', translationUk: 'Перепрошую, де вокзал?', targets: [LS_L] }),
  ],
};
