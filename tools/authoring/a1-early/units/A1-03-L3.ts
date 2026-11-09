// A1-03-L3 — estar: forms, en + place, location of a known person/thing, a small state set,
// first ser/estar contrast where the meaning is unambiguous (CV-03 en frame).
import { clip, ex, gloss, tableEs, tableUk, transcript, uk, ulUk, es } from '../lib.ts';
import type { OutcomeSpec, TaskSpec, Unit } from '../lib.ts';
import type { Block } from '../../../content/types.ts';
import { pick, typed } from '../common.ts';
import type { TaskRole } from '../../../content/types.ts';

const ES_W = 'present.estar/written-form';
const ES_C = 'present.estar/context-choice';
const EN_W = 'prep.en.location/written-form';
const EN_C = 'prep.en.location/context-choice';
const EL_U = 'estar.location/construction-use';
const EL_C = 'estar.location/context-choice';
const ST_U = 'estar.state/construction-use';
const ST_C = 'estar.state/context-choice';
const SE_C = 'contrast.ser-estar/context-choice';
const LS_L = 'listening.short-sentences/listening-meaning';

const R: Record<string, string> = {
  [ES_W]: 'Форми estar: yo estoy, tú estás, él/ella/usted está, nosotros estamos, vosotros estáis, ellos/ellas/ustedes están. Знак наголосу — у estás, está, estáis, están.',
  [EN_W]: 'Прийменник en відповідає українським «у/в» і «на», коли йдеться про місце: en la mesa, en el parque, en Madrid. «Вдома» — en casa, без артикля.',
  [EL_U]: 'Де знаходиться конкретна людина чи річ — estar + en + місце: Ana está en casa. El libro está en la mesa. Питання: ¿Dónde está el hotel?',
  [ST_U]: 'Як почувається людина або в якому стані щось перебуває — estar + прикметник: Estoy cansada. La tienda está cerrada. Прикметник узгоджується з підметом; bien і mal не змінюються: Estamos bien.',
  [SE_C]: 'Ser — хто це, звідки, яким є за своїми рисами, ким працює: Es alta. Es de Madrid. Estar — де знаходиться і в якому стані перебуває: Está en Madrid. Está cansada.',
};
// The estar.location hint teaches the whole estar + en + place frame, so it also supports prep.en.location when assessed.
const rulesOf = (targets: string[]): Array<[string[], string]> =>
  targets.filter((t) => R[t]).map((t) => [t === EL_U && targets.includes(EN_W) ? [t, EN_W] : [t], R[t] as string]);

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
const LOC = [EL_U, EN_W];
const SER_ESTAR_RULE: Array<[string[], string]> = [[[SE_C], R[SE_C] as string]];

export const unit: Unit = {
  lesson: {
    id: 'A1-03-L3',
    titleUk: 'Estar: де і як',
    termEs: 'estar: ubicación y estado',
    summaryUk: 'Вивчиш форми дієслова estar, прийменник en і навчишся казати, де знаходиться знайома людина чи річ і як хтось почувається. Порівняєш ser і estar там, де значення однозначне.',
    objectives: ['A1-03-O1', 'A1-03-O3'],
    cv: ['CV-03'],
    situations: ['people-family-home'],
    estimatedMinutes: 18,
    introduces: ['present.estar', 'prep.en.location', 'estar.location', 'estar.state', 'contrast.ser-estar'],
    revisits: ['present.ser', 'ser.description', 'ser.origin', 'ser.identity', 'pron.subject', 'pron.subject.plural', 'pron.subject-omission', 'writing.short-statement', 'adj.agreement.o-a', 'article.definite', 'listening.short-sentences'],
    steps: [
      {
        kind: 'explanation',
        title: 'Частина 1. Дієслово estar і прийменник en',
        blocks: [
          uk('Estar («бути, перебувати») — друге неправильне дієслово. Зверни увагу на знаки наголосу: без знака esta — інше слово («ця»).'),
          tableUk(['Займенник', 'Estar', 'Приклад'], [
            ['yo', 'estoy', 'Estoy en casa.'],
            ['tú', 'estás', 'Estás en el parque.'],
            ['él / ella / usted', 'está', 'Ana está en la oficina.'],
            ['nosotros / nosotras', 'estamos', 'Estamos bien.'],
            ['vosotros / vosotras', 'estáis', 'Estáis en Madrid.'],
            ['ellos / ellas / ustedes', 'están', 'Mis padres están en Kiev.'],
          ]),
          uk('Прийменник en відповідає українським «у, в, на», коли йдеться про місце: en la mesa — «на столі», en el parque — «у парку», en Madrid — «у Мадриді». «Вдома» — en casa, без артикля.'),
          uk('Щоб сказати, де знаходиться конкретна, відома людина чи річ, вживаємо estar: El libro está en la mesa. Питання: ¿Dónde está el hotel? — «Де готель?».'),
        ],
      },
      {
        kind: 'examples',
        title: 'Частина 1. Приклади',
        blocks: [
          ex('Ana está en casa.', 'Ана вдома.'),
          ex('Las llaves están en la cocina.', 'Ключі на кухні.'),
          ex('Estamos en el parque.', 'Ми в парку.'),
          ex('¿Dónde está el banco?', 'Де банк?'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 1. Тренування з підказкою', tasks: [1, 2, 11, 12] },
      { kind: 'independent-practice', title: 'Частина 1. Самостійно', tasks: [3, 13, 31, 4, 14, 32, 5, 15, 33, 6, 16, 21, 34] },
      {
        kind: 'explanation',
        title: 'Частина 2. Як почуваєшся: estar + стан',
        blocks: [
          uk('Estar описує, як почувається людина або в якому стані щось перебуває в момент, про який говоримо: Estoy cansada. Ana está contenta. La tienda está cerrada. Прикметник узгоджується з підметом; bien («добре») і mal («погано») не змінюються: Estamos bien.'),
          tableUk(['Слово', 'Значення'], [
            ['bien / mal', 'добре / погано'],
            ['cansado, cansada', 'втомлений, втомлена'],
            ['contento, contenta', 'задоволений, задоволена; радий, рада'],
            ['enfermo, enferma', 'хворий, хвора'],
            ['ocupado, ocupada', 'зайнятий, зайнята'],
            ['abierto / cerrado', 'відчинений / зачинений'],
          ]),
          ex('¿Cómo estás? — Estoy bien, gracias.', 'Як ти? — Добре, дякую.'),
        ],
      },
      { kind: 'supported-practice', title: 'Частина 2. Тренування з підказкою', tasks: [41, 42] },
      { kind: 'independent-practice', title: 'Частина 2. Самостійно', tasks: [43, 35, 44, 45, 36, 46] },
      {
        kind: 'explanation',
        title: 'Частина 3. Ser чи estar',
        blocks: [
          uk('Ser відповідає на питання «хто це, звідки, яким є за своїми рисами, ким працює». Estar — «де знаходиться» і «в якому стані перебуває». Тому «Es de Madrid» — походження, а «Está en Madrid» — де людина зараз.'),
          tableEs(['Ser', 'Estar'], [
            ['Ana es alta.', 'Ana está cansada.'],
            ['Pablo es de Madrid.', 'Pablo está en Madrid.'],
            ['La tienda es grande.', 'La tienda está cerrada.'],
          ]),
        ],
      },
      { kind: 'independent-practice', title: 'Частина 3. Ser чи estar', tasks: [51, 52, 53, 54] },
      { kind: 'listening', title: 'Послухай', clips: ['clip.a1-03.hermana-oficina', 'clip.a1-03.estoy-cansado'], tasks: [61, 62] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Estar: estoy, estás, está, estamos, estáis, están — зі знаками наголосу.',
            'Де: estar + en + місце: Ana está en casa. ¿Dónde está el hotel?',
            'Стан: Estoy cansada. La tienda está cerrada. Estamos bien.',
            'Ser — хто, звідки, які риси; estar — де і в якому стані.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- estar.location + en ----------
    t(1, 'supported', 'where', LOC, 'Напиши іспанською: «Ана вдома».', 'Ana está en casa.', [
      ['Ana es en casa.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де знаходиться людина — estar: Ana está en casa.'],
      ['Ana está casa.', { [EN_W]: 'x', [EL_U]: 'c' }, 'Перед місцем потрібне en: en casa.'],
      ['Ana está en la casa.', { [EL_U]: 'c', [EN_W]: 'u' }, 'Так кажуть «у будинку»; «вдома» — en casa, без артикля.'],
    ], 'Está en casa', { support: 'Пам’ятай: де знаходиться людина — estar + en + місце.' }),
    t(2, 'supported', 'where-thing', LOC, 'Напиши іспанською: «Книжка на столі» (про конкретну книжку: el libro).', 'El libro está en la mesa.', [
      ['El libro es en la mesa.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де знаходиться річ — estar: está.'],
      ['El libro está la mesa.', { [EN_W]: 'x', [EL_U]: 'c' }, 'Перед місцем потрібне en: en la mesa.'],
      ['El libro está sobre la mesa.', { [EL_U]: 'c', [EN_W]: 'u' }, 'Теж правильно: sobre — «на, зверху». Тут тренуємо en: en la mesa.'],
    ], 'Está en la mesa', { support: 'Пам’ятай: «на столі» — en la mesa.' }),
    t(3, 'independent', 'where', LOC, 'Напиши іспанською: «Мої батьки в Києві».', 'Mis padres están en Kiev.', [
      ['Mis padres son en Kiev.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де знаходяться люди — estar: están.'],
      ['Mis padres están Kiev.', { [EN_W]: 'x', [EL_U]: 'c' }, 'Перед містом потрібне en.'],
      ['Mis padres son de Kiev.', { [EL_U]: 'u', [EN_W]: 'u' }, 'Речення правильне, але означає «Мої батьки з Києва» (походження). Тут потрібне, де вони: están en Kiev.'],
    ], 'Están en + місто', { also: ['Mis padres están en Kyiv.'] }),
    t(4, 'independent', 'where-thing', LOC, 'Напиши іспанською: «Ключі на кухні» (про конкретні ключі: las llaves).', 'Las llaves están en la cocina.', [
      ['Las llaves son en la cocina.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де знаходиться річ — estar: están.'],
      ['Las llaves están la cocina.', { [EN_W]: 'x', [EL_U]: 'c' }, 'Перед місцем потрібне en.'],
      ['Las llaves está en la cocina.', { [EL_U]: 'u', [EN_W]: 'c' }, 'En і estar на місці, але ключів кілька — están.'],
    ], 'Están en la cocina'),
    t(5, 'independent', 'where', LOC, 'Напиши іспанською: «Ми в парку».', 'Estamos en el parque.', [
      ['Somos en el parque.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де ми знаходимося — estar: estamos.'],
      ['Estamos el parque.', { [EN_W]: 'x', [EL_U]: 'c' }, 'Перед місцем потрібне en.'],
    ], 'Estamos en el parque', { also: ['Nosotros estamos en el parque.', 'Nosotras estamos en el parque.'] }),
    t(6, 'independent', 'question', [EL_U], 'Спитай іспанською на вулиці: «Де готель?»', '¿Dónde está el hotel?', [
      ['¿Dónde es el hotel?', 'x', 'Де знаходиться відома річ — estar: ¿Dónde está el hotel?'],
      ['¿Donde está el hotel?', 'u', 'Питання правильне, але dónde пишеться зі знаком наголосу.'],
    ], '¿Dónde está…?', { gl: [ex('dónde', 'де')] }),
    t(7, 'delayed', 'where', LOC, 'Напиши іспанською: «Пабло в офісі».', 'Pablo está en la oficina.', [
      ['Pablo es en la oficina.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де знаходиться людина — estar.'],
      ['Pablo está la oficina.', { [EN_W]: 'x', [EL_U]: 'c' }, 'Перед місцем потрібне en.'],
    ], 'Está en la oficina'),
    t(8, 'delayed', 'where', LOC, 'Напиши іспанською: «Моя сестра в Мадриді».', 'Mi hermana está en Madrid.', [
      ['Mi hermana es en Madrid.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де знаходиться людина — estar.'],
      ['Mi hermana es de Madrid.', { [EL_U]: 'u', [EN_W]: 'u' }, 'Речення правильне, але означає «Моя сестра з Мадрида». Тут потрібне, де вона: está en Madrid.'],
    ], 'Está en + місто'),
    t(9, 'transfer', 'chat', LOC, 'Друг пише в чаті й питає, де ти. Відповідай іспанською: «Я в банку».', 'Estoy en el banco.', [
      ['Soy en el banco.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де ти знаходишся — estar: estoy.'],
      ['Estoy el banco.', { [EN_W]: 'x', [EL_U]: 'c' }, 'Перед місцем потрібне en.'],
    ], 'Estoy en el banco', { also: ['Yo estoy en el banco.'] }),
    t(10, 'transfer', 'note', LOC, 'Ти залишаєш записку сусідові: «Ключ у кімнаті Ани».', 'La llave está en la habitación de Ana.', [
      ['La llave es en la habitación de Ana.', { [EL_U]: 'x', [EN_W]: 'c' }, 'Де знаходиться річ — estar.'],
      ['La llave está la habitación de Ana.', { [EN_W]: 'x', [EL_U]: 'c' }, 'Перед місцем потрібне en.'],
    ], 'Está en la habitación de Ana'),
    // ---------- present.estar forms ----------
    t(11, 'supported', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Yo estoy en casa.', [
      ['Yo está en casa.', 'x', 'З yo — estoy.'],
    ], 'Yo estoy', { support: 'Пам’ятай: estoy, estás, está, estamos, estáis, están.', shown: 'Yo ___ en casa.', also: ['estoy.'] }),
    t(12, 'supported', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Tú estás en el parque.', [
      ['Tú estas en el parque.', 'x', 'Estás пишеться зі знаком наголосу.'],
      ['Tú está en el parque.', 'x', 'З tú — estás.'],
    ], 'Tú estás', { support: 'Пам’ятай: у estás, está, estáis, están є знак наголосу.', shown: 'Tú ___ en el parque.', also: ['estás.'] }),
    t(13, 'independent', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Vosotros estáis en Madrid.', [
      ['Vosotros están en Madrid.', 'x', 'З vosotros — estáis.'],
      ['Vosotros estais en Madrid.', 'x', 'Estáis пишеться зі знаком наголосу.'],
    ], 'Vosotros estáis', { shown: 'Vosotros ___ en Madrid.', also: ['estáis.'] }),
    t(14, 'independent', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Ellos están bien.', [
      ['Ellos estan bien.', 'x', 'Están пишеться зі знаком наголосу.'],
      ['Ellos estáis bien.', 'x', 'Estáis — з vosotros; з ellos — están.'],
    ], 'Ellos están', { shown: 'Ellos ___ bien.', also: ['están.'] }),
    t(15, 'independent', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Usted está en el hotel.', [
      ['Usted estás en el hotel.', 'x', 'Usted поєднується з формою 3-ї особи: está.'],
      ['Usted esta en el hotel.', 'x', 'Está пишеться зі знаком наголосу; esta без знака — інше слово.'],
    ], 'Usted está', { shown: 'Usted ___ en el hotel.', also: ['está.'] }),
    t(16, 'independent', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Ustedes están ocupados.', [
      ['Ustedes estáis ocupados.', 'x', 'Ustedes поєднується з формою 3-ї особи множини: están.'],
    ], 'Ustedes están', { shown: 'Ustedes ___ ocupados.', also: ['están.'] }),
    t(17, 'delayed', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Nosotras estamos contentas.', [
      ['Nosotras están contentas.', 'x', 'З nosotras — estamos.'],
    ], 'Nosotras estamos', { shown: 'Nosotras ___ contentas.', also: ['estamos.'] }),
    t(18, 'delayed', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Ella está en la oficina.', [
      ['Ella esta en la oficina.', 'x', 'Está пишеться зі знаком наголосу; esta без знака — інше слово.'],
      ['Ella estoy en la oficina.', 'x', 'Estoy — з yo; з ella — está.'],
    ], 'Ella está', { shown: 'Ella ___ en la oficina.', also: ['está.'] }),
    t(19, 'transfer', 'chat-form', [ES_W], 'Ти пишеш подрузі: «Ми з друзями в Мадриді». Допиши форму estar (можна написати лише її або все речення).', 'Mis amigos y yo estamos en Madrid.', [
      ['Mis amigos y yo están en Madrid.', 'x', 'Mis amigos y yo — це «ми»: estamos.'],
    ], 'Mis amigos y yo estamos', { shown: 'Mis amigos y yo ___ en Madrid.', also: ['estamos.'] }),
    t(20, 'delayed', 'fill', [ES_W], 'Допиши форму estar (можна написати лише її або все речення).', 'Mis hermanas están en Valencia.', [
      ['Mis hermanas está en Valencia.', 'x', 'Сестер кілька — «вони»: están.'],
      ['Mis hermanas estan en Valencia.', 'x', 'Están пишеться зі знаком наголосу.'],
    ], 'Ellas están', { shown: 'Mis hermanas ___ en Valencia.', also: ['están.'] }),
    // ---------- prep.en.location own ----------
    t(21, 'independent', 'fill-en', [EN_W], 'Допиши прийменник (можна написати лише його або все речення): «Мобільний у сумці».', 'El móvil está en el bolso.', [
      ['El móvil está de el bolso.', 'x', 'Місце — en: en el bolso.'],
      ['El móvil está el bolso.', 'x', 'Перед місцем потрібне en.'],
    ], 'En + місце', { shown: 'El móvil está ___ el bolso.', also: ['en.'] }),
    t(22, 'delayed', 'fill-en', [EN_W], 'Допиши прийменник (можна написати лише його або все речення): «Ми у Валенсії».', 'Estamos en Valencia.', [
      ['Estamos de Valencia.', 'x', 'De — «з, звідки»; місце — en.'],
    ], 'En + місто', { shown: 'Estamos ___ Valencia.', also: ['en.'] }),
    // ---------- choices: forms, en, location ----------
    pick({
      n: 31, role: 'independent', family: 'choose-form', targets: [ES_C],
      prompt: [uk('Яка форма estar потрібна?'), es('Nosotros ___ en casa.')],
      options: [['estamos', 'c'], ['estáis', 'x', 'Estáis — з vosotros.'], ['están', 'x', 'Están — з ellos/ustedes.']],
      rules: [[[ES_C], R[ES_W] as string]],
      ok: 'Так: Nosotros estamos en casa.', bad: 'Ні. З nosotros — estamos.',
    }),
    pick({
      n: 32, role: 'independent', family: 'choose-en', targets: [EN_C],
      prompt: [uk('Який прийменник потрібен? «Ана — у Мадриді (зараз)».'), es('Ana está ___ Madrid.')],
      options: [['en', 'c'], ['de', 'x', 'De — «з, звідки»; де людина зараз — en.']],
      rules: [[[EN_C], R[EN_W] as string]],
      ok: 'Так: Ana está en Madrid.', bad: 'Ні. Місце — en: Ana está en Madrid.',
    }),
    pick({
      n: 33, role: 'independent', family: 'choose-where', targets: [EL_C],
      prompt: [uk('Ти кажеш, де стоїть твоя машина. Яке речення правильне?')],
      options: [['Mi coche está en la calle.', 'c'], ['Mi coche es en la calle.', 'x', 'Де знаходиться річ — estar.'], ['Mi coche está la calle.', 'x', 'Бракує en перед місцем.']],
      rules: [[[EL_C], R[EL_U] as string]],
      ok: 'Так: Mi coche está en la calle.', bad: 'Ні. Де знаходиться річ — estar + en: Mi coche está en la calle.',
    }),
    pick({
      n: 34, role: 'independent', family: 'choose-where', targets: [EL_C],
      prompt: [uk('Ти питаєш, де знаходиться банк. Яке питання правильне?')],
      options: [['¿Dónde está el banco?', 'c'], ['¿Dónde es el banco?', 'x', 'Де знаходиться будівля — estar: ¿Dónde está…?'], ['¿De dónde es el banco?', 'x', '¿De dónde…? — «звідки?», це про походження.']],
      rules: [[[EL_C], R[EL_U] as string]],
      ok: 'Так: ¿Dónde está el banco?', bad: 'Ні. ¿Dónde está el banco? — «Де банк?».',
    }),
    pick({
      n: 35, role: 'independent', family: 'choose-state', targets: [ST_C],
      prompt: [uk('Ти (чоловік) багато працював і дуже хочеш відпочити. Що ти скажеш?')],
      options: [['Estoy cansado.', 'c'], ['Soy cansado.', 'x', 'Як ти почуваєшся зараз — estar.'], ['Estoy contento.', 'x', 'Contento — «задоволений», а не «втомлений».']],
      rules: [[[ST_C], R[ST_U] as string]],
      ok: 'Так: Estoy cansado — «Я втомився».', bad: 'Ні. Стан — estar: Estoy cansado.',
    }),
    pick({
      n: 36, role: 'independent', family: 'choose-state', targets: [ST_C],
      prompt: [uk('Яка форма потрібна? Ти пишеш про двері.'), es('La puerta está ___.')],
      options: [['abierta', 'c'], ['abierto', 'x', 'Puerta — жіночого роду: abierta.'], ['abiertas', 'x', 'Двері тут одні — однина: abierta.']],
      rules: [[[ST_C], R[ST_U] as string]],
      ok: 'Так: La puerta está abierta.', bad: 'Ні. La puerta — жіночий рід, однина: abierta.',
    }),
    pick({
      n: 37, role: 'delayed', family: 'choose-form', targets: [ES_C],
      prompt: [uk('Яка форма estar потрібна?'), es('Pablo y tú ___ en el parque.')],
      options: [['estáis', 'c'], ['están', 'x', 'Pablo y tú — це vosotros: estáis.'], ['estamos', 'x', '«Ми» — якщо серед них є я.']],
      rules: [[[ES_C], R[ES_W] as string]],
      ok: 'Так: Pablo y tú estáis en el parque.', bad: 'Ні. Pablo y tú = vosotros → estáis.',
    }),
    pick({
      n: 38, role: 'delayed', family: 'choose-en', targets: [EN_C],
      prompt: [uk('Як сказати «вдома»?'), es('Mis hijos están ___.')],
      options: [['en casa', 'c'], ['casa', 'x', 'Бракує en: en casa.'], ['de casa', 'x', 'De — «з»; «вдома» — en casa.']],
      rules: [[[EN_C], R[EN_W] as string]],
      ok: 'Так: Mis hijos están en casa.', bad: 'Ні. «Вдома» — en casa.',
    }),
    // ---------- estar.state ----------
    t(41, 'supported', 'feel', [ST_U], 'Напиши іспанською: «Я втомлена» (говорить жінка).', 'Estoy cansada.', [
      ['Estoy cansado.', 'x', 'Говорить жінка: cansada.'],
      ['Soy cansada.', 'x', 'Як почуваєшся — estar: Estoy cansada.'],
    ], 'Estoy + стан', { support: 'Пам’ятай: стан — estar + прикметник у роді людини.', also: ['Yo estoy cansada.'] }),
    t(42, 'supported', 'feel', [ST_U], 'Напиши іспанською: «Ана задоволена».', 'Ana está contenta.', [
      ['Ana está contento.', 'x', 'Ана — жінка: contenta.'],
      ['Ana es contenta.', 'x', 'Стан — estar: Ana está contenta.'],
    ], 'Está + стан', { support: 'Пам’ятай: Ana está cansada — estar для стану.' }),
    t(43, 'independent', 'feel', [ST_U], 'Друг питає, як у вас справи загалом. Відповідай іспанською: «У нас усе добре» (дослівно: «Ми добре»).', 'Estamos bien.', [
      ['Estamos buenos.', 'x', 'Тут потрібен прислівник bien — «добре», він не змінюється: Estamos bien. Bueno — окремий прикметник «добрий»; estar bueno має інші значення (наприклад, «одужати»), а не «у нас усе добре».'],
      ['Somos bien.', 'x', 'Як почуваємося — estar: Estamos bien.'],
    ], 'Estamos bien', { also: ['Nosotros estamos bien.', 'Nosotras estamos bien.'] }),
    t(44, 'independent', 'feel', [ST_U], 'Пабло сьогодні не прийшов на роботу. Напиши іспанською: «Пабло хворий».', 'Pablo está enfermo.', [
      ['Pablo está enferma.', 'x', 'Пабло — чоловік: enfermo.'],
      ['Pablo es enfermo.', 'x', 'Тут ідеться про стан зараз — estar: Pablo está enfermo.'],
    ], 'Está + стан'),
    t(45, 'independent', 'feel', [ST_U], 'Напиши іспанською: «Мої батьки зайняті».', 'Mis padres están ocupados.', [
      ['Mis padres están ocupadas.', 'x', 'Батьки — змішана група: ocupados.'],
      ['Mis padres está ocupados.', 'u', 'Прикметник правильний, але батьків двоє — están.'],
    ], 'Están + стан'),
    t(46, 'independent', 'thing-state', [ST_U], 'Напиши іспанською: «Крамниця зачинена» (la tienda).', 'La tienda está cerrada.', [
      ['La tienda está cerrado.', 'x', 'Tienda — жіночого роду: cerrada.'],
      ['La tienda es cerrada.', 'x', 'Стан зараз — estar: está cerrada.'],
    ], 'Está + стан'),
    t(47, 'delayed', 'question', [ST_U], 'Спитай іспанською друга, як він почувається: «Як ти?»', '¿Cómo estás?', [
      ['¿Cómo eres?', 'x', '¿Cómo eres? — про риси («який ти?»); про самопочуття — ¿Cómo estás?'],
      ['¿Como estás?', 'u', 'Питання правильне, але cómo пишеться зі знаком наголосу.'],
    ], '¿Cómo estás?', { gl: [ex('cómo', 'як')] }),
    t(48, 'delayed', 'thing-state', [ST_U], 'Напиши іспанською: «Банк відчинений».', 'El banco está abierto.', [
      ['El banco está abierta.', 'x', 'Banco — чоловічого роду: abierto.'],
      ['El banco es abierto.', 'x', 'Стан зараз — estar: está abierto.'],
    ], 'Está + стан'),
    t(49, 'transfer', 'reply', [ST_U], 'Подруга пише: «¿Cómo estás?». Відповідай повним реченням: «Я добре, дякую».', 'Estoy bien, gracias.', [
      ['Soy bien, gracias.', 'x', 'Самопочуття — estar: Estoy bien.'],
      ['Bien, gracias.', 'u', 'Так відповідають у розмові, але тут потрібне повне речення: Estoy bien, gracias.'],
    ], 'Estoy bien', { also: ['Yo estoy bien, gracias.', 'Estoy bien. Gracias.'] }),
    t(50, 'transfer', 'sign', [ST_U], 'На дверях кав’ярні табличка «Cerrado». Напиши подрузі: «Кав’ярня зачинена» (кав’ярня — el café).', 'El café está cerrado.', [
      ['El café está cerrada.', 'x', 'Café — чоловічого роду: cerrado.'],
      ['El café es cerrado.', 'x', 'Стан зараз — estar: está cerrado.'],
    ], 'Está + стан', { also: [['La cafetería está cerrada.', 'Cafetería («кафе, кав’ярня») ми ще не вивчали, але речення правильне.']] }),
    // ---------- contrast.ser-estar ----------
    pick({
      n: 51, role: 'independent', family: 'ser-estar', targets: [SE_C],
      prompt: [uk('Ана — висока дівчина. Що потрібно?'), es('Ana ___ alta.')],
      options: [['es', 'c'], ['está', 'x', 'Зріст — риса людини: ser.']],
      rules: SER_ESTAR_RULE,
      ok: 'Так: Ana es alta — риса.', bad: 'Ні. Риса людини — ser: Ana es alta.',
    }),
    pick({
      n: 52, role: 'independent', family: 'ser-estar', targets: [SE_C],
      prompt: [uk('Ана цілий день працювала, і тепер їй треба відпочити. Що потрібно?'), es('Ana ___ cansada.')],
      options: [['está', 'c'], ['es', 'x', 'Тут ідеться про стан зараз: estar.']],
      rules: SER_ESTAR_RULE,
      ok: 'Так: Ana está cansada — стан.', bad: 'Ні. Стан — estar: Ana está cansada.',
    }),
    pick({
      n: 53, role: 'independent', family: 'ser-estar', targets: [SE_C],
      prompt: [uk('Пабло народився в Мадриді. Що потрібно?'), es('Pablo ___ de Madrid.')],
      options: [['es', 'c'], ['está', 'x', 'Походження — ser de.']],
      rules: SER_ESTAR_RULE,
      ok: 'Так: Pablo es de Madrid — походження.', bad: 'Ні. Звідки людина — ser de: Pablo es de Madrid.',
    }),
    pick({
      n: 54, role: 'independent', family: 'ser-estar', targets: [SE_C],
      prompt: [uk('Пабло з Валенсії, але зараз він у відрядженні в Мадриді. Що потрібно?'), es('Pablo ___ en Madrid.')],
      options: [['está', 'c'], ['es', 'x', 'Де людина зараз — estar en.']],
      rules: SER_ESTAR_RULE,
      ok: 'Так: Pablo está en Madrid — де він зараз.', bad: 'Ні. Де людина знаходиться — estar: Pablo está en Madrid.',
    }),
    pick({
      n: 55, role: 'delayed', family: 'ser-estar', targets: [SE_C],
      prompt: [uk('Крамниця дуже велика. Що потрібно?'), es('La tienda ___ grande.')],
      options: [['es', 'c'], ['está', 'x', 'Розмір — риса: ser.']],
      rules: SER_ESTAR_RULE,
      ok: 'Так: La tienda es grande.', bad: 'Ні. Риса — ser: La tienda es grande.',
    }),
    pick({
      n: 56, role: 'delayed', family: 'ser-estar', targets: [SE_C],
      prompt: [uk('Сьогодні неділя, і крамниця не працює. Що потрібно?'), es('La tienda ___ cerrada.')],
      options: [['está', 'c'], ['es', 'x', 'Стан зараз — estar.']],
      rules: SER_ESTAR_RULE,
      ok: 'Так: La tienda está cerrada.', bad: 'Ні. Стан — estar: La tienda está cerrada.',
    }),
    pick({
      n: 57, role: 'transfer', family: 'ser-estar-text', targets: [SE_C],
      prompt: [uk('Ти пишеш про подругу: «Марія — викладачка. Зараз вона в Києві». Що потрібно в пропусках?'), es('María ___ profesora. Ahora ___ en Kiev.'), ex('ahora', 'зараз')],
      options: [['es … está', 'c'], ['está … es', 'x', 'Професія — ser; де людина зараз — estar.'], ['es … es', 'x', 'Де людина зараз — estar: está en Kiev.']],
      rules: SER_ESTAR_RULE,
      ok: 'Так: María es profesora. Ahora está en Kiev.', bad: 'Ні. Професія — es, місце — está: María es profesora. Ahora está en Kiev.',
    }),
    // ---------- listening ----------
    pick({
      n: 61, role: 'supported', family: 'listen-where', targets: [LS_L], clips: ['clip.a1-03.hermana-oficina'],
      prompt: [uk('Послухай. Підказка: está en + місце — де людина. Де сестра?')],
      options: [['в офісі', 'c'], ['вдома', 'x', 'У записі en la oficina — «в офісі».'], ['у парку', 'x', 'У записі en la oficina.']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано: хто, звідки, де, що є.']],
      extraHints: [transcript([LS_L], 'Mi hermana está en la oficina.')],
      ok: 'Так: Mi hermana está en la oficina.', bad: 'Ні. У записі: Mi hermana está en la oficina — «в офісі».',
    }),
    pick({
      n: 62, role: 'independent', family: 'listen-state', targets: [LS_L], clips: ['clip.a1-03.estoy-cansado'],
      prompt: [uk('Послухай. Як почувається Пабло?')],
      options: [['Він дуже втомлений.', 'c'], ['Він дуже задоволений.', 'x', 'У записі cansado — «втомлений».'], ['Він хворий.', 'x', 'У записі muy cansado — «дуже втомлений».']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано: хто, звідки, де, що є.']],
      extraHints: [transcript([LS_L], 'Hola, Ana. Estoy muy cansado.')],
      ok: 'Так: Estoy muy cansado — «Я дуже втомлений».', bad: 'Ні. У записі: Hola, Ana. Estoy muy cansado.',
    }),
  ],
  clips: [
    clip({ id: 'clip.a1-03.hermana-oficina', lessonId: 'A1-03-L3', kind: 'sentence', family: 'location', transcript: 'Mi hermana está en la oficina.', translationUk: 'Моя сестра в офісі.', targets: [LS_L] }),
    clip({ id: 'clip.a1-03.estoy-cansado', lessonId: 'A1-03-L3', kind: 'sentence', family: 'state', transcript: 'Hola, Ana. Estoy muy cansado.', translationUk: 'Привіт, Ано. Я дуже втомлений.', targets: [LS_L] }),
  ],
};
