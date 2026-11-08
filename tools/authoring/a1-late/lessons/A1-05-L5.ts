// A1-05-L5 — where something is: spatial expressions for objects and places, de + el = del,
// listening to locations (O5, CV-03).
import { Kit, S, el, es, ex, hTranscript, plink, tableUk, ul, uk } from '../lib.ts';
import type { SlotSpec } from '../lib.ts';
import type { TaskRole } from '../../../content/types.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-05-L5', RULES);

const OB = 'prep.spatial.object/written-form';
const OBC = 'prep.spatial.object/context-choice';
const OBR = 'prep.spatial.object/reading-meaning';
const PL = 'prep.spatial.place/written-form';
const PLC = 'prep.spatial.place/context-choice';
const PLR = 'prep.spatial.place/reading-meaning';
const DL = 'article.contraction-del/written-form';
const DLC = 'article.contraction-del/context-choice';
const LL = 'listening.locations/listening-meaning';

type E = Array<[string, string]>;
const OBJ_UK: Record<string, string> = {
  'encima de': '«на, зверху»',
  'debajo de': '«під»',
  'al lado de': '«поруч із»',
  'delante de': '«перед»',
  'detrás de': '«за, позаду»',
};
const PLACE_UK: Record<string, string> = {
  'cerca de': '«близько від»',
  'lejos de': '«далеко від»',
  'enfrente de': '«навпроти»',
  'a la derecha de': '«праворуч від»',
  'a la izquierda de': '«ліворуч від»',
};
const wrong = (table: Record<string, string>, right: string): E =>
  Object.entries(table)
    .filter(([w]) => w !== right)
    .map(([w, m]) => [w, `«${w}» означає ${m}. Тут потрібно ${table[right] ?? ''}: ${right}.`]);

/** Gap for one spatial expression; the Ukrainian meaning is part of the instruction. */
function gap(n: number, role: TaskRole, fam: string, t: string, table: Record<string, string>, expr: string, s: string, tr: string, model?: string): string {
  return k.exact({
    n,
    role,
    fam,
    t: [t],
    ins: `Впиши вираз зі значенням ${table[expr] ?? ''}.${model ? ` Зразок: ${model}.` : ''}`,
    p: [s],
    acc: [expr],
    err: wrong(table, expr),
    tr,
  });
}

const delErr = (noun: string): E => [
  ['de el', `De + el завжди зливаються: del ${noun}.`],
  ['de la', `${noun} — чоловічого роду (el ${noun}), тож de + el = del.`],
];
const deLaErr = (noun: string): E => [['del', `${noun} — жіночого роду (la ${noun}). Злиття буває лише з el, тож тут de la.`]];
const delGap = (n: number, role: TaskRole, fam: string, s: string, noun: string, tr: string, model?: string): string =>
  k.exact({ n, role, fam, t: [DL], ins: `Впиши de разом з артиклем (злиття, якщо воно потрібне).${model ? ` Зразок: ${model}.` : ''}`, p: [s], acc: ['del'], err: delErr(noun), tr });

// ======================= objects in a room
gap(1, 'supported', 'a105.room', OB, OBJ_UK, 'debajo de', 'El gato está ___ la cama.', 'Кіт під ліжком.', 'El libro está encima de la mesa');
k.exact({
  n: 2,
  role: 'supported',
  fam: 'a105.room',
  t: [OB],
  ins: 'Впиши вираз зі значенням «на, зверху». Зразок: La mochila está debajo de la silla.',
  p: ['Las llaves están ___ la mesa.'],
  acc: ['encima de'],
  err: wrong(OBJ_UK, 'encima de'),
  tr: 'Ключі на столі.',
});
gap(3, 'independent', 'a105.hall', OB, OBJ_UK, 'delante de', 'La mochila está ___ la puerta.', 'Рюкзак перед дверима.');
gap(4, 'independent', 'a105.garden', OB, OBJ_UK, 'detrás de', 'El perro está ___ la casa.', 'Собака за будинком.');
k.exact({
  n: 5,
  role: 'independent',
  fam: 'a105.room',
  t: [OB],
  ins: 'Переклади іспанською: «Книжка лежить на стільці».',
  acc: ['El libro está encima de la silla.', 'El libro está en la silla.'],
  err: [['El libro está debajo de la silla.', 'Debajo de — «під». «На стільці» — encima de la silla або en la silla.']],
});
k.slots({
  n: 6,
  role: 'independent',
  fam: 'a105.living-room',
  t: [OB],
  ins: 'Перепиши речення повністю, щоб воно означало «Стіл між диваном і вікном».',
  p: ['La mesa está ___ el sofá ___ la ventana.'],
  tpl: ['La mesa está ', S('s1'), ' el sofá ', S('s2'), ' la ventana.'],
  slots: [
    { id: 's1', t: OB, acc: ['entre'] },
    { id: 's2', t: OB, acc: ['y'] },
  ],
});
k.exact({
  n: 7,
  role: 'delayed',
  fam: 'a105.room',
  t: [OB],
  ins: 'Переклади іспанською: «Кіт під столом».',
  acc: ['El gato está debajo de la mesa.'],
  err: [['El gato está encima de la mesa.', 'Encima de — «на, зверху». «Під» — debajo de.'], ['El gato es debajo de la mesa.', 'Де щось знаходиться — estar: El gato está…']],
});
k.slots({
  n: 8,
  role: 'delayed',
  fam: 'a105.hall',
  t: [OB],
  ins: 'Перепиши речення повністю, щоб воно означало «Ключі поруч із рюкзаком».',
  p: ['Las llaves están ___ la mochila.'],
  tpl: ['Las llaves están ', S('s1'), ' la mochila.'],
  slots: [{ id: 's1', t: OB, acc: ['al lado de'], err: wrong(OBJ_UK, 'al lado de') } satisfies SlotSpec],
});
k.exact({
  n: 9,
  role: 'transfer',
  fam: 'a105.room-describe',
  t: [OB],
  ins: 'Опиши свою кімнату одним реченням іспанською: «Стілець перед вікном».',
  acc: ['La silla está delante de la ventana.'],
  err: [['La silla está detrás de la ventana.', 'Detrás de — «за, позаду». «Перед» — delante de.']],
});
k.exact({
  n: 10,
  role: 'transfer',
  fam: 'a105.pets',
  t: [OB],
  ins: 'Переклади іспанською: «Собака між стільцем і столом».',
  acc: ['El perro está entre la silla y la mesa.'],
  err: [['El perro es entre la silla y la mesa.', 'Де щось знаходиться — estar: El perro está…']],
});
k.choice({
  n: 11,
  role: 'independent',
  fam: 'a105.room',
  t: [OBC],
  ins: 'Книжка лежить під столом. Обери речення, яке це описує.',
  o: [
    ['El libro está encima de la mesa.', OBC, 'Encima de — «на, зверху».'],
    ['El libro está debajo de la mesa.', true],
    ['El libro está al lado de la mesa.', OBC, 'Al lado de — «поруч із».'],
  ],
});
k.choice({
  n: 12,
  role: 'delayed',
  fam: 'a105.hall',
  t: [OBC],
  ins: 'Рюкзак стоїть позаду стільця. Обери вираз.',
  p: ['La mochila está ___ la silla.'],
  o: [
    ['delante de', OBC, 'Delante de — «перед».'],
    ['detrás de', true],
    ['encima de', OBC, 'Encima de — «на, зверху».'],
  ],
});
const ROOM = 'Mi habitación: la cama está entre la ventana y la puerta. La mesa está al lado de la cama y mi mochila está debajo de la mesa.';
k.choice({ n: 13, role: 'independent', fam: 'a105.r-room', t: [OBR], ins: 'Прочитай опис кімнати. Де ліжко?', p: [ROOM], o: [['Між вікном і дверима.', true], ['Під вікном.', false], ['Поруч із дверима, але не біля вікна.', false]] });
const KITCHEN = 'En la cocina: la mesa está delante de la ventana y las sillas están al lado de la mesa. El gato está debajo de una silla.';
k.choice({ n: 14, role: 'delayed', fam: 'a105.r-kitchen', t: [OBR], ins: 'Прочитай опис кухні. Де кіт?', p: [KITCHEN], o: [['На столі.', false], ['Під стільцем.', true], ['Перед вікном.', false]] });

// ======================= places in town
gap(21, 'supported', 'a105.town', PL, PLACE_UK, 'cerca de', 'La farmacia está ___ la estación.', 'Аптека близько від станції.', 'El hotel está lejos de la playa');
gap(22, 'supported', 'a105.holiday', PL, PLACE_UK, 'lejos de', 'Mi casa está ___ la playa.', 'Мій будинок далеко від пляжу.', 'La farmacia está cerca de la plaza');
gap(23, 'independent', 'a105.town', PL, PLACE_UK, 'enfrente de', 'El banco está ___ la farmacia.', 'Банк навпроти аптеки.');
gap(24, 'independent', 'a105.town', PL, PLACE_UK, 'a la derecha de', 'El supermercado está ___ la escuela.', 'Супермаркет праворуч від школи.');
k.exact({
  n: 25,
  role: 'independent',
  fam: 'a105.hotel',
  t: [PL],
  ins: 'Переклади іспанською: «Готель близько від станції».',
  acc: ['El hotel está cerca de la estación.'],
  err: [['El hotel está lejos de la estación.', 'Lejos de — «далеко від». «Близько від» — cerca de.'], ['El hotel es cerca de la estación.', 'Де щось знаходиться — estar: El hotel está…']],
});
k.slots({
  n: 26,
  role: 'independent',
  fam: 'a105.walk',
  t: [PL],
  ins: 'Перепиши речення повністю, щоб воно означало «Площа далеко звідси».',
  p: ['La plaza está ___ aquí.'],
  tpl: ['La plaza está ', S('s1'), ' aquí.'],
  slots: [{ id: 's1', t: PL, acc: ['lejos de'], err: wrong(PLACE_UK, 'lejos de') }],
});
gap(27, 'delayed', 'a105.town', PL, PLACE_UK, 'a la izquierda de', 'La escuela está ___ la plaza.', 'Школа ліворуч від площі.');
k.exact({
  n: 28,
  role: 'delayed',
  fam: 'a105.square',
  t: [PL],
  ins: 'Переклади іспанською: «Аптека навпроти площі».',
  acc: ['La farmacia está enfrente de la plaza.'],
  err: [['La farmacia está en frente de la plaza.', 'Пишемо разом: enfrente de.']],
});
k.exact({
  n: 29,
  role: 'transfer',
  fam: 'a105.ask-way',
  t: [PL],
  ins: 'Турист питає: «¿Dónde está el supermercado?» Відповідай іспанською: близько від станції.',
  acc: ['Está cerca de la estación.', 'El supermercado está cerca de la estación.', 'Cerca de la estación.'],
  err: [['Es cerca de la estación.', 'Де щось знаходиться — estar: Está cerca de la estación.']],
});
k.exact({
  n: 30,
  role: 'transfer',
  fam: 'a105.my-school',
  t: [PL],
  ins: 'Переклади іспанською: «Моя школа ліворуч від аптеки».',
  acc: ['Mi escuela está a la izquierda de la farmacia.'],
  err: [['Mi escuela está a la derecha de la farmacia.', 'A la derecha de — «праворуч від». «Ліворуч від» — a la izquierda de.']],
});
k.choice({
  n: 31,
  role: 'independent',
  fam: 'a105.walk',
  t: [PLC],
  ins: 'Аптека за дві хвилини пішки. Обери вираз.',
  p: ['La farmacia está ___ aquí.'],
  o: [
    ['cerca de', true],
    ['lejos de', PLC, 'Lejos de — «далеко від», а аптека зовсім поруч.'],
  ],
});
k.choice({
  n: 32,
  role: 'delayed',
  fam: 'a105.town',
  t: [PLC],
  ins: 'Банк стоїть через дорогу від станції, якраз навпроти неї. Обери вираз.',
  p: ['El banco está ___ la estación.'],
  o: [
    ['detrás de', PLC, 'Detrás de — «за, позаду».'],
    ['enfrente de', true],
    ['debajo de', PLC, 'Debajo de — «під»; так кажуть про предмети.'],
  ],
});
const TOWN = 'En mi calle hay un hotel. El hotel está enfrente de la estación. A la derecha del hotel hay una farmacia y a la izquierda hay un restaurante.';
k.choice({ n: 33, role: 'independent', fam: 'a105.r-town', t: [PLR], ins: 'Прочитай опис вулиці. Що навпроти готелю?', p: [TOWN], o: [['Аптека.', false], ['Станція.', true], ['Ресторан.', false]] });
const HOME = 'Mi casa está cerca del centro. Enfrente de mi casa hay un parque y al lado del parque hay un museo.';
k.choice({ n: 34, role: 'delayed', fam: 'a105.r-home', t: [PLR], ins: 'Прочитай опис. Що навпроти будинку?', p: [HOME], o: [['Музей.', false], ['Парк.', true], ['Центр.', false]] });

// ======================= de + el = del
delGap(41, 'supported', 'a105.town', 'El cine está al lado ___ banco.', 'banco', 'Кінотеатр поруч із банком.', 'cerca del hotel');
delGap(42, 'supported', 'a105.hotel', 'La farmacia está cerca ___ hotel.', 'hotel', 'Аптека близько від готелю.', 'al lado del banco');
delGap(43, 'independent', 'a105.town', 'El hotel está enfrente ___ museo.', 'museo', 'Готель навпроти музею.');
delGap(44, 'independent', 'a105.centre', 'La estación está lejos ___ centro.', 'centro', 'Станція далеко від центру.');
k.exact({
  n: 45,
  role: 'independent',
  fam: 'a105.square',
  t: [DL],
  ins: 'Впиши de разом з артиклем (злиття, якщо воно потрібне).',
  p: ['La plaza está cerca ___ estación.'],
  acc: ['de la'],
  err: deLaErr('estación'),
  tr: 'Площа близько від станції.',
});
k.exact({
  n: 46,
  role: 'independent',
  fam: 'a105.living-room',
  t: [DL],
  ins: 'Переклади іспанською: «Ключі поруч із диваном».',
  acc: ['Las llaves están al lado del sofá.'],
  err: [['Las llaves están al lado de el sofá.', 'De + el завжди зливаються: al lado del sofá.']],
});
delGap(47, 'delayed', 'a105.shops', 'El parque está a la derecha ___ supermercado.', 'supermercado', 'Парк праворуч від супермаркету.');
k.slots({
  n: 48,
  role: 'delayed',
  fam: 'a105.owner',
  t: [DL],
  ins: 'Перепиши речення повністю, щоб воно означало «Це машина викладача».',
  p: ['Es el coche ___ profesor.'],
  tpl: ['Es el coche ', S('s1'), ' profesor.'],
  slots: [{ id: 's1', t: DL, acc: ['del'], err: delErr('profesor') }],
});
k.exact({
  n: 49,
  role: 'transfer',
  fam: 'a105.dinner-place',
  t: [DL],
  ins: 'Переклади іспанською: «Ресторан навпроти готелю».',
  acc: ['El restaurante está enfrente del hotel.'],
  err: [['El restaurante está enfrente de el hotel.', 'De + el завжди зливаються: enfrente del hotel.']],
});
k.exact({
  n: 50,
  role: 'transfer',
  fam: 'a105.bank-place',
  t: [DL],
  ins: 'Переклади іспанською: «Банк ліворуч від ресторану».',
  acc: ['El banco está a la izquierda del restaurante.'],
  err: [['El banco está a la izquierda de el restaurante.', 'De + el завжди зливаються: a la izquierda del restaurante.']],
});
k.choice({
  n: 51,
  role: 'independent',
  fam: 'a105.hotel',
  t: [DLC],
  ins: 'Обери правильний варіант.',
  p: ['El banco está cerca ___ hotel.'],
  o: [
    ['de el', DLC, 'De + el завжди зливаються: del.'],
    ['del', true],
    ['de la', DLC, 'Hotel — чоловічого роду: el hotel → del hotel.'],
  ],
  tr: 'Банк близько від готелю.',
});
k.choice({
  n: 52,
  role: 'delayed',
  fam: 'a105.shops',
  t: [DLC],
  ins: 'Обери правильний варіант.',
  p: ['El banco está al lado ___ farmacia.'],
  o: [
    ['del', DLC, 'Farmacia — жіночого роду: злиття немає, de la farmacia.'],
    ['de la', true],
  ],
  tr: 'Банк поруч з аптекою.',
});

// ======================= listening: where is it?
const L1 = 'La farmacia está al lado del banco.';
const L2 = 'Las llaves están encima de la mesa.';
const l1 = k.clip({ id: 'clip.a1-05.locations.farmacia', kind: 'sentence', es: L1, uk: 'Аптека поруч із банком.', t: [LL], fam: 'a105.l-town' });
const l2 = k.clip({ id: 'clip.a1-05.locations.llaves', kind: 'sentence', es: L2, uk: 'Ключі на столі.', t: [LL], fam: 'a105.l-home' });
k.choice({ n: 61, role: 'independent', fam: 'a105.l-town', t: [LL], clips: [l1], ins: 'Послухай. Де аптека?', o: [['Навпроти банку.', false], ['Поруч із банком.', true], ['Далеко від банку.', false]], hints: [hTranscript([LL], L1)] });
k.choice({ n: 62, role: 'independent', fam: 'a105.l-home', t: [LL], clips: [l2], ins: 'Послухай. Де ключі?', o: [['Під столом.', false], ['На столі.', true], ['Поруч зі стільцем.', false]], hints: [hTranscript([LL], L2)] });

k.material({
  id: 'material.a1-05.places',
  topic: 'A1-05-L5',
  title: 'Де це? Вирази місця',
  blocks: [
    tableUk(
      ['предмети', 'місто'],
      [
        ['encima de — на, зверху', 'cerca de — близько від'],
        ['debajo de — під', 'lejos de — далеко від'],
        ['al lado de — поруч із', 'enfrente de — навпроти'],
        ['delante de — перед', 'a la derecha de — праворуч від'],
        ['detrás de — за, позаду', 'a la izquierda de — ліворуч від'],
        ['entre … y … — між … і …', 'aquí — тут, allí — там'],
      ],
    ),
    el('de + el = del: al lado del banco', 'de + la: al lado de la plaza'),
    plink('Потренувати вирази місця', [OB, PL, DL], 'written', 12),
  ],
  linked: [OB, PL, DL],
});

export default k.build({
  title: 'Де це? Предмети й місця',
  termEs: 'expresiones de lugar',
  summary: 'Кажемо, де лежить предмет у кімнаті й де місце в місті (encima de, al lado de, cerca de, enfrente de…), і зливаємо de + el в del.',
  objectives: ['A1-05-O5'],
  cv: ['CV-03'],
  situations: ['people-family-home', 'places-accommodation'],
  minutes: 18,
  introduces: ['prep.spatial.object', 'prep.spatial.place', 'article.contraction-del', 'listening.locations'],
  revisits: ['estar.location', 'prep.en.location', 'hay.existence', 'contrast.hay-estar', 'article.contraction-al', 'prep.de.possession', 'question.word.donde'],
  steps: [
    {
      kind: 'explanation',
      title: 'Крок 1. Де предмет?',
      blocks: [
        uk('Де щось знаходиться — estar. Щоб сказати точніше, після estar ставимо вираз місця з de: encima de — «на, зверху», debajo de — «під», al lado de — «поруч із», delante de — «перед», detrás de — «за, позаду», entre … y … — «між … і …».'),
        ex('El libro está encima de la mesa.', 'Книжка на столі.'),
        ex('La mochila está debajo de la silla.', 'Рюкзак під стільцем.'),
        ex('La cama está entre la puerta y la ventana.', 'Ліжко між дверима й вікном.'),
        uk('Про предмет на поверхні часто можна сказати й просто en: El libro está en la mesa.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 1: практика зі зразком', tasks: [k.id(1), k.id(2)] },
    { kind: 'independent-practice', title: 'Крок 1: самостійно', tasks: [k.id(11), k.id(3), k.id(4), k.id(5), k.id(6)] },
    { kind: 'reading', title: 'Читаємо опис кімнати', blocks: [es(ROOM)], tasks: [k.id(13)] },
    {
      kind: 'explanation',
      title: 'Крок 2. Де місце в місті? De + el = del',
      blocks: [
        uk('У місті: cerca de — «близько від», lejos de — «далеко від», enfrente de — «навпроти», a la derecha de — «праворуч від», a la izquierda de — «ліворуч від». Aquí — «тут», allí — «там».'),
        uk('Прийменник de і артикль el зливаються в del, як a + el = al. З la, los, las злиття немає.'),
        ex('El hotel está lejos de la playa.', 'Готель далеко від пляжу.'),
        ex('La farmacia está cerca del hotel.', 'Аптека близько від готелю.'),
        ex('La estación está a la derecha del museo.', 'Станція праворуч від музею.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 2: практика зі зразком', tasks: [k.id(21), k.id(22), k.id(41), k.id(42)] },
    { kind: 'independent-practice', title: 'Крок 2: самостійно', tasks: [k.id(31), k.id(23), k.id(24), k.id(25), k.id(26), k.id(51), k.id(43), k.id(44), k.id(45), k.id(46)] },
    { kind: 'reading', title: 'Читаємо опис вулиці', blocks: [es(TOWN)], tasks: [k.id(33)] },
    { kind: 'listening', title: 'Послухай: де це?', required: false, clips: [l1, l2], tasks: [k.id(61), k.id(62)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Estar + вираз місця: El libro está encima de la mesa.',
          'Предмети: encima de, debajo de, al lado de, delante de, detrás de, entre … y …',
          'Місто: cerca de, lejos de, enfrente de, a la derecha / izquierda de.',
          'De + el = del: cerca del hotel; але de la estación.',
        ),
      ],
    },
  ],
});
