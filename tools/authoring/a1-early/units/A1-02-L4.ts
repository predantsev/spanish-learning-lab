// A1-02-L4 — describing with adjectives: -o agreement, invariable gender, position after the noun,
// muy (CV-02), and short noun-phrase listening.
import { clip, ex, tableUk, transcript, uk, ulUk, es } from '../lib.ts';
import type { OutcomeSpec, Unit } from '../lib.ts';
import { pick, typed } from '../common.ts';

const AO_W = 'adj.agreement.o-a/written-form';
const AO_C = 'adj.agreement.o-a/context-choice';
const AI_W = 'adj.agreement.invariable-gender/written-form';
const AI_C = 'adj.agreement.invariable-gender/context-choice';
const PO_U = 'adj.position.after-noun/construction-use';
const PO_C = 'adj.position.after-noun/context-choice';
const MU_W = 'quant.muy/written-form';
const MU_C = 'quant.muy/context-choice';
const LNP = 'listening.noun-phrase/listening-meaning';

const R_AO = 'Прикметник на -o має чотири форми й узгоджується з іменником у роді та числі: un coche rojo, una casa roja, unos coches rojos, unas casas rojas. Орієнтуйся на рід іменника, а не на його закінчення: un día bonito, la mano pequeña.';
const R_AI = 'Прикметники на -e і на приголосну мають одну форму для обох родів: un coche grande, una casa grande. Змінюється тільки число: -s після голосної (grandes), -es після приголосної (azules).';
const R_PO = 'Описовий прикметник в іспанській зазвичай стоїть після іменника: una casa blanca — «білий будинок», un coche nuevo — «нова машина».';
const R_MU = 'Muy («дуже») ставимо перед прикметником, і воно ніколи не змінює форму: muy grande, muy bonita, muy pequeños.';
const PRE = 'Такий порядок трапляється, але в звичайному описі прикметник стоїть після іменника';

type Err = [string, OutcomeSpec, string];

function phrase(n: number, role: 'supported' | 'independent' | 'delayed' | 'transfer', family: string, targets: string[], prompt: string, answer: string, errors: Err[], why: string, support?: string, also?: string[]) {
  const rules: Array<[string[], string]> = [];
  if (targets.includes(AO_W)) rules.push([[AO_W], R_AO]);
  if (targets.includes(AI_W)) rules.push([[AI_W], R_AI]);
  if (targets.includes(PO_U)) rules.push([[PO_U], R_PO]);
  if (targets.includes(MU_W)) rules.push([[MU_W], R_MU]);
  return typed({ n, role, family, targets, prompt: [...(support ? [uk(support)] : []), uk(prompt)], answer, errors, rules, why, ...(also ? { also } : {}) });
}

export const unit: Unit = {
  lesson: {
    id: 'A1-02-L4',
    titleUk: 'Опис: прикметник і muy',
    termEs: 'el adjetivo calificativo',
    summaryUk: 'Навчишся описувати людей і речі: узгоджувати прикметник з іменником, ставити його після іменника і підсилювати словом muy. Перше слухання коротких описів.',
    objectives: ['A1-02-O4', 'A1-02-O1'],
    cv: ['CV-02'],
    situations: ['people-family-home'],
    estimatedMinutes: 16,
    skippableFoundation: true,
    introduces: ['adj.agreement.o-a', 'adj.agreement.invariable-gender', 'adj.position.after-noun', 'quant.muy', 'listening.noun-phrase'],
    revisits: ['noun.gender.o-a', 'noun.gender.exception.masc-a', 'noun.gender.exception.fem-o', 'article.plural', 'noun.plural.s', 'noun.plural.es', 'noun.plural.accent-change'],
    steps: [
      {
        kind: 'explanation',
        title: 'Прикметник на -o: чотири форми',
        blocks: [
          uk('Прикметник (adjetivo) узгоджується з іменником у роді та числі. Прикметник на -o має чотири форми:'),
          tableUk(['Рід', 'Однина', 'Множина'], [
            ['чоловічий рід', 'un coche rojo', 'unos coches rojos'],
            ['жіночий рід', 'una casa roja', 'unas casas rojas'],
          ]),
          uk('Орієнтуйся на рід іменника, а не на його закінчення: un día bonito (día — чоловічого роду), la mano pequeña (mano — жіночого).'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Прикметники на -e і на приголосну',
        blocks: [
          uk('Прикметники на -e і більшість прикметників на приголосну мають одну форму для обох родів: un coche grande — una casa grande, un libro azul — una mesa azul. Змінюється тільки число: -s після голосної (grandes, verdes), -es після приголосної (azules, fáciles, jóvenes).'),
          uk('У jóvenes з’являється знак наголосу — так само, як у множині іменників: joven → jóvenes.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Де стоїть прикметник',
        blocks: [
          uk('Описовий прикметник зазвичай стоїть після іменника, а не перед ним, як в українській: una casa blanca — «білий будинок», un coche nuevo — «нова машина». Прикметник перед іменником теж трапляється, але це окрема тема на потім.'),
          uk('Кілька прикметників з’єднуємо словом y («і»): una casa blanca y bonita.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Muy — «дуже»',
        blocks: [
          uk('Muy («дуже») ставимо перед прикметником, і воно ніколи не змінюється: un hotel muy grande, una casa muy bonita, unos libros muy nuevos. Узгоджується тільки прикметник.'),
        ],
      },
      {
        kind: 'examples',
        title: 'Приклади',
        blocks: [
          ex('un coche nuevo', 'нова машина'),
          ex('una casa pequeña y bonita', 'маленький і гарний будинок'),
          ex('unos amigos simpáticos', 'якісь приємні друзі'),
          ex('las mesas verdes', 'зелені столи'),
          ex('unas chicas jóvenes', 'якісь молоді дівчата'),
          ex('un piso muy grande', 'дуже велика квартира'),
        ],
      },
      { kind: 'supported-practice', title: 'Тренування з підказкою', tasks: [1, 2, 12, 13, 22, 23, 26] },
      { kind: 'independent-practice', title: 'Самостійно', tasks: [11, 3, 24, 14, 25, 4, 15, 27, 5, 16, 31, 6, 17, 28] },
      { kind: 'listening', title: 'Послухай описи', clips: ['clip.a1-02.casa-blanca', 'clip.a1-02.libros-nuevos'], tasks: [32, 33] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Прикметник на -o: rojo, roja, rojos, rojas — за родом і числом іменника.',
            'Прикметник на -e чи приголосну: одна форма для обох родів, у множині -s або -es.',
            'Прикметник зазвичай стоїть після іменника: una casa blanca.',
            'Muy не змінюється: muy bonita, muy grandes.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- agreement -o ----------
    phrase(1, 'supported', 'agree', [AO_W], 'Напиши словосполучення, узгодивши прикметник nuevo («новий»): una casa + nuevo.', 'una casa nueva', [
      ['una casa nuevo.', 'x', 'Casa — жіночого роду, тому nueva.'],
      ['una casa nuevas.', 'x', 'Іменник в однині, тому nueva.'],
    ], 'Жіночий рід, однина — nueva', 'Пам’ятай: rojo, roja, rojos, rojas — прикметник бере рід і число іменника.', ['nueva.']),
    phrase(2, 'supported', 'agree', [AO_W], 'Напиши словосполучення, узгодивши прикметник rojo («червоний»): unos libros + rojo.', 'unos libros rojos', [
      ['unos libros rojo.', 'x', 'Іменник у множині, тому rojos.'],
      ['unos libros rojas.', 'x', 'Libros — чоловічого роду, тому rojos.'],
    ], 'Чоловічий рід, множина — rojos', 'Пам’ятай: rojo, roja, rojos, rojas — прикметник бере рід і число іменника.', ['rojos.']),
    phrase(3, 'independent', 'translate', [AO_W, PO_U], 'Напиши іспанською з неозначеним артиклем: «нова машина».', 'un coche nuevo', [
      ['un coche nueva.', { [AO_W]: 'x', [PO_U]: 'c' }, 'Coche — чоловічого роду, тому nuevo.'],
      ['un nuevo coche.', { [PO_U]: 'u', [AO_W]: 'c' }, `${PRE}: un coche nuevo.`],
    ], 'Coche — чоловічого роду, прикметник після іменника'),
    phrase(4, 'independent', 'agree', [AO_W], 'Напиши словосполучення, узгодивши прикметник pequeño («маленький»): las mesas + pequeño.', 'las mesas pequeñas', [
      ['las mesas pequeños.', 'x', 'Mesas — жіночого роду, тому pequeñas.'],
      ['las mesas pequeña.', 'x', 'Іменник у множині, тому pequeñas.'],
      ['las mesas pequenas.', 'u', 'Форма правильна, але потрібна літера ñ: pequeñas.'],
    ], 'Жіночий рід, множина — pequeñas', undefined, ['pequeñas.']),
    phrase(5, 'independent', 'translate', [AO_W, PO_U], 'Напиши іспанською з означеним артиклем: «білі квіти» (ті, про які вже йшлося).', 'las flores blancas', [
      ['las flores blancos.', { [AO_W]: 'x', [PO_U]: 'c' }, 'Flores — жіночого роду, тому blancas.'],
      ['las blancas flores.', { [PO_U]: 'x', [AO_W]: 'c' }, 'Колір у звичайному описі стоїть після іменника: las flores blancas.'],
    ], 'Flores — жіночого роду, прикметник після іменника'),
    phrase(6, 'independent', 'agree', [AO_W], 'Напиши словосполучення, узгодивши прикметник bonito («гарний»): un día + bonito.', 'un día bonito', [
      ['un día bonita.', 'x', 'Día — чоловічого роду (виняток), тому bonito.'],
    ], 'Día — чоловічого роду', undefined, ['bonito.']),
    phrase(7, 'delayed', 'translate', [AO_W, PO_U], 'Напиши іспанською з означеним артиклем: «маленька рука».', 'la mano pequeña', [
      ['la mano pequeño.', { [AO_W]: 'x', [PO_U]: 'c' }, 'Mano — жіночого роду, тому pequeña.'],
      ['la pequeña mano.', { [PO_U]: 'u', [AO_W]: 'c' }, `${PRE}: la mano pequeña.`],
      ['la mano pequena.', 'u', 'Форма правильна, але потрібна літера ñ: pequeña.'],
    ], 'Mano — жіночого роду'),
    phrase(8, 'delayed', 'agree', [AO_W], 'Напиши словосполучення, узгодивши прикметник negro («чорний»): unas sillas + negro.', 'unas sillas negras', [
      ['unas sillas negros.', 'x', 'Sillas — жіночого роду, тому negras.'],
      ['unas sillas negra.', 'x', 'Іменник у множині, тому negras.'],
    ], 'Жіночий рід, множина — negras', undefined, ['negras.']),
    phrase(9, 'transfer', 'ad', [AO_W, PO_U], 'Ти пишеш оголошення про продаж. Напиши іспанською з неозначеним артиклем лише: «червоний мотоцикл» (коротке слово moto).', 'una moto roja', [
      ['una moto rojo.', { [AO_W]: 'x', [PO_U]: 'c' }, 'Moto — жіночого роду, тому roja.'],
      ['una roja moto.', { [PO_U]: 'x', [AO_W]: 'c' }, 'Колір у звичайному описі стоїть після іменника: una moto roja.'],
    ], 'Moto — жіночого роду'),
    phrase(10, 'transfer', 'description', [AO_W, PO_U], 'Ти підписуєш фото з виставки. Напиши іспанською з неозначеним артиклем: «старі машини».', 'unos coches viejos', [
      ['unos coches viejas.', { [AO_W]: 'x', [PO_U]: 'c' }, 'Coches — чоловічого роду, тому viejos.'],
      ['unos coches viejo.', { [AO_W]: 'x', [PO_U]: 'c' }, 'Іменник у множині, тому viejos.'],
      ['unos viejos coches.', { [PO_U]: 'u', [AO_W]: 'c' }, `${PRE}: unos coches viejos.`],
    ], 'Чоловічий рід, множина — viejos'),
    pick({
      n: 11, role: 'independent', family: 'choose-form', targets: [AO_C],
      prompt: [uk('Вибери правильну форму прикметника.'), es('unas casas ___ (blanco)')],
      options: [['blancas', 'c'], ['blancos', 'x', 'Casas — жіночого роду.'], ['blanca', 'x', 'Casas — множина.']],
      rules: [[[AO_C], R_AO]],
      ok: 'Так: unas casas blancas.',
      bad: 'Ні. Правильно: unas casas blancas.',
    }),
    // ---------- invariable gender ----------
    phrase(12, 'supported', 'agree', [AI_W], 'Напиши словосполучення, узгодивши прикметник grande («великий»): una casa + grande.', 'una casa grande', [
      ['una casa granda.', 'x', 'Grande має одну форму для обох родів: una casa grande.'],
    ], 'Grande не змінюється за родом', 'Пам’ятай: прикметники на -e і на приголосну мають одну форму для обох родів; змінюється тільки число.', ['grande.']),
    phrase(13, 'supported', 'agree', [AI_W], 'Напиши словосполучення, узгодивши прикметник azul («синій»): unos libros + azul.', 'unos libros azules', [
      ['unos libros azul.', 'x', 'Іменник у множині, тому azules.'],
      ['unos libros azuls.', 'x', 'Після приголосної в множині додаємо -es: azules.'],
    ], 'Множина після приголосної — -es', 'Пам’ятай: прикметники на -e і на приголосну мають одну форму для обох родів; змінюється тільки число.', ['azules.']),
    phrase(14, 'independent', 'translate', [AI_W, PO_U], 'Напиши іспанською з неозначеним артиклем: «зелена машина».', 'un coche verde', [
      ['un coche verdo.', { [AI_W]: 'x', [PO_U]: 'c' }, 'Verde має одну форму для обох родів: verde.'],
      ['un verde coche.', { [PO_U]: 'x', [AI_W]: 'c' }, 'Колір у звичайному описі стоїть після іменника: un coche verde.'],
    ], 'Verde не змінюється за родом, стоїть після іменника'),
    phrase(15, 'independent', 'agree', [AI_W], 'Напиши словосполучення, узгодивши прикметник verde («зелений»): las mesas + verde.', 'las mesas verdes', [
      ['las mesas verde.', 'x', 'Іменник у множині, тому verdes.'],
      ['las mesas verdas.', 'x', 'Verde не має форми на -a; у множині — verdes.'],
    ], 'Множина — verdes', undefined, ['verdes.']),
    phrase(16, 'independent', 'translate', [AI_W, PO_U], 'Напиши іспанською з неозначеним артиклем: «цікаві книжки».', 'unos libros interesantes', [
      ['unos libros interesante.', { [AI_W]: 'x', [PO_U]: 'c' }, 'Іменник у множині, тому interesantes.'],
      ['unos interesantes libros.', { [PO_U]: 'u', [AI_W]: 'c' }, `${PRE}: unos libros interesantes.`],
    ], 'Множина — interesantes, після іменника'),
    phrase(17, 'independent', 'fix', [AI_W], 'Виправ помилку в прикметнику: unas chicas jóvenas.', 'unas chicas jóvenes', [
      ['unas chicas jóvenas.', 'x', 'Joven має одну форму для обох родів; множина — jóvenes.'],
      ['unas chicas jovenes.', 'u', 'Форма правильна, але в jóvenes потрібен знак наголосу.'],
    ], 'Joven не змінюється за родом; множина — jóvenes'),
    phrase(18, 'delayed', 'translate', [AI_W, PO_U], 'Напиши іспанською з неозначеним артиклем: «великий готель».', 'un hotel grande', [
      ['un hotel grando.', { [AI_W]: 'x', [PO_U]: 'c' }, 'Grande має одну форму для обох родів: grande.'],
      ['un gran hotel.', 'u', 'Перед іменником grande скорочується до gran і означає «чудовий, величний»; для «великий» кажемо un hotel grande.'],
    ], 'Grande не змінюється за родом, стоїть після іменника'),
    phrase(19, 'delayed', 'agree', [AI_W], 'Напиши словосполучення, узгодивши прикметник grande («великий»): las ciudades + grande.', 'las ciudades grandes', [
      ['las ciudades grande.', 'x', 'Іменник у множині, тому grandes.'],
    ], 'Множина — grandes', undefined, ['grandes.']),
    phrase(20, 'transfer', 'description', [AI_W, PO_U], 'Ти описуєш кімнату в оголошенні. Напиши іспанською з неозначеним артиклем: «сині стільці».', 'unas sillas azules', [
      ['unas sillas azul.', { [AI_W]: 'x', [PO_U]: 'c' }, 'Іменник у множині, тому azules.'],
      ['unas sillas azulas.', { [AI_W]: 'x', [PO_U]: 'c' }, 'Azul не має форми на -a; у множині — azules.'],
      ['unas azules sillas.', { [PO_U]: 'x', [AI_W]: 'c' }, 'Колір у звичайному описі стоїть після іменника: unas sillas azules.'],
    ], 'Множина — azules, після іменника'),
    phrase(21, 'transfer', 'profile', [AI_W, PO_U], 'Ти описуєш подругу в повідомленні. Напиши іспанською з неозначеним артиклем: «розумна подруга».', 'una amiga inteligente', [
      ['una amiga inteligenta.', { [AI_W]: 'x', [PO_U]: 'c' }, 'Inteligente має одну форму для обох родів.'],
      ['una inteligente amiga.', { [PO_U]: 'u', [AI_W]: 'c' }, `${PRE}: una amiga inteligente.`],
    ], 'Inteligente не змінюється за родом'),
    // ---------- position ----------
    phrase(22, 'supported', 'build', [PO_U], 'Склади словосполучення з цих слів: blanca / una / casa.', 'una casa blanca', [
      ['una blanca casa.', 'x', 'Колір у звичайному описі стоїть після іменника: una casa blanca.'],
    ], 'Прикметник — після іменника', 'Пам’ятай: описовий прикметник зазвичай стоїть після іменника.'),
    phrase(23, 'supported', 'build', [PO_U], 'Склади словосполучення з цих слів: rojo / un / coche.', 'un coche rojo', [
      ['un rojo coche.', 'x', 'Колір у звичайному описі стоїть після іменника: un coche rojo.'],
    ], 'Прикметник — після іменника', 'Пам’ятай: описовий прикметник зазвичай стоїть після іменника.'),
    pick({
      n: 24, role: 'independent', family: 'choose-form', targets: [AI_C],
      prompt: [uk('Вибери правильну форму прикметника.'), es('una mesa ___ (verde)')],
      options: [['verde', 'c'], ['verda', 'x', 'Verde має одну форму для обох родів.']],
      rules: [[[AI_C], R_AI]],
      ok: 'Так: una mesa verde.',
      bad: 'Ні. Правильно: una mesa verde.',
    }),
    pick({
      n: 25, role: 'independent', family: 'choose-order', targets: [PO_C],
      prompt: [uk('Який порядок слів звичайний для опису «чорна машина»?')],
      options: [['un coche negro', 'c'], ['un negro coche', 'x', 'Колір у звичайному описі стоїть після іменника.']],
      rules: [[[PO_C], R_PO]],
      ok: 'Так: un coche negro.',
      bad: 'Ні. Звичайний порядок: un coche negro.',
    }),
    // ---------- muy ----------
    phrase(26, 'supported', 'muy', [MU_W], 'Напиши словосполучення з muy («дуже»): un hotel + muy + grande.', 'un hotel muy grande', [
      ['un hotel grande muy.', 'x', 'Muy ставимо перед прикметником: muy grande.'],
    ], 'Muy — перед прикметником', 'Пам’ятай: muy стоїть перед прикметником і не змінюється.'),
    phrase(27, 'independent', 'translate', [MU_W], 'Напиши іспанською з неозначеним артиклем: «дуже гарний будинок» (casa).', 'una casa muy bonita', [
      ['una casa muya bonita.', 'x', 'Muy ніколи не змінюється: muy bonita.'],
      ['una casa mucho bonita.', 'x', 'Перед прикметником «дуже» — це muy: muy bonita.'],
      ['una casa bonita muy.', 'x', 'Muy ставимо перед прикметником: muy bonita.'],
    ], 'Muy — перед прикметником і не змінюється'),
    phrase(28, 'independent', 'translate', [MU_W], 'Напиши іспанською з означеним артиклем: «дуже маленькі кімнати».', 'las habitaciones muy pequeñas', [
      ['las habitaciones muys pequeñas.', 'x', 'Muy ніколи не змінюється: muy pequeñas.'],
      ['las habitaciones mucho pequeñas.', 'x', 'Перед прикметником «дуже» — це muy.'],
      ['las habitaciones muy pequenas.', 'u', 'Muy правильно, але в pequeñas потрібна літера ñ.'],
    ], 'Muy не змінюється'),
    phrase(29, 'delayed', 'translate', [MU_W], 'Напиши іспанською з неозначеним артиклем: «дуже старий диван».', 'un sofá muy viejo', [
      ['un sofá mucho viejo.', 'x', 'Перед прикметником «дуже» — це muy.'],
      ['un sofá viejo muy.', 'x', 'Muy ставимо перед прикметником: muy viejo.'],
      ['un sofa muy viejo.', 'u', 'Muy правильно, але sofá пишеться зі знаком наголосу.'],
    ], 'Muy — перед прикметником'),
    phrase(30, 'transfer', 'profile', [MU_W], 'Ти описуєш нового знайомого в повідомленні. Напиши іспанською з неозначеним артиклем: «дуже симпатичний хлопець».', 'un chico muy simpático', [
      ['un chico mucho simpático.', 'x', 'Перед прикметником «дуже» — це muy.'],
      ['un chico simpático muy.', 'x', 'Muy ставимо перед прикметником.'],
      ['un chico muy simpatico.', 'u', 'Muy правильно, але simpático пишеться зі знаком наголосу.'],
    ], 'Muy — перед прикметником'),
    pick({
      n: 31, role: 'independent', family: 'choose-form', targets: [MU_C],
      prompt: [uk('Вибери правильний варіант: «дуже гарні квіти».')],
      options: [['unas flores muy bonitas', 'c'], ['unas flores muys bonitas', 'x', 'Muy не змінюється.'], ['unas flores mucho bonitas', 'x', 'Перед прикметником «дуже» — це muy.']],
      rules: [[[MU_C], R_MU]],
      ok: 'Так: unas flores muy bonitas.',
      bad: 'Ні. Правильно: unas flores muy bonitas.',
    }),
    // ---------- listening ----------
    pick({
      n: 32, role: 'supported', family: 'listen-home', targets: [LNP], clips: ['clip.a1-02.casa-blanca'],
      prompt: [uk('Послухай короткий опис. Підказка: закінчення -a показують жіночий рід, -s — множину. Що описують?')],
      options: [
        ['білий і дуже гарний будинок', 'c'],
        ['білі й дуже гарні будинки', 'x', 'У записі однина: una casa — один будинок.'],
        ['червоний будинок', 'x', 'У записі blanca — «білий».'],
      ],
      rules: [[[LNP], 'Закінчення -o/-a та -s допомагають зрозуміти, якого роду предмет і скільки їх.']],
      extraHints: [transcript([LNP], 'Una casa blanca y muy bonita.')],
      ok: 'Так: Una casa blanca y muy bonita — «білий і дуже гарний будинок».',
      bad: 'Ні. У записі: Una casa blanca y muy bonita — «білий і дуже гарний будинок».',
    }),
    pick({
      n: 33, role: 'independent', family: 'listen-objects', targets: [LNP], clips: ['clip.a1-02.libros-nuevos'],
      prompt: [uk('Послухай короткий опис. Що описують?')],
      options: [
        ['якісь нові книжки', 'c'],
        ['якась нова книжка', 'x', 'У записі множина: unos libros.'],
        ['якісь старі книжки', 'x', 'У записі nuevos — «нові».'],
      ],
      rules: [[[LNP], 'Закінчення -o/-a та -s допомагають зрозуміти, якого роду предмет і скільки їх.']],
      extraHints: [transcript([LNP], 'Unos libros nuevos.')],
      ok: 'Так: Unos libros nuevos — «якісь нові книжки».',
      bad: 'Ні. У записі: Unos libros nuevos — «якісь нові книжки».',
    }),
    pick({
      n: 34, role: 'delayed', family: 'listen-furniture', targets: [LNP], clips: ['clip.a1-02.mesas-pequenas'],
      prompt: [uk('Послухай короткий опис. Що описують?')],
      options: [
        ['якісь маленькі зелені столи', 'c'],
        ['маленький зелений стіл', 'x', 'У записі множина: unas mesas.'],
        ['якісь великі зелені столи', 'x', 'У записі pequeñas — «маленькі».'],
      ],
      rules: [[[LNP], 'Закінчення -o/-a та -s допомагають зрозуміти, якого роду предмет і скільки їх.']],
      extraHints: [transcript([LNP], 'Unas mesas pequeñas y verdes.')],
      ok: 'Так: Unas mesas pequeñas y verdes — «якісь маленькі зелені столи».',
      bad: 'Ні. У записі: Unas mesas pequeñas y verdes.',
    }),
    pick({
      n: 35, role: 'transfer', family: 'listen-street', targets: [LNP], clips: ['clip.a1-02.coche-rojo'],
      prompt: [uk('Друг описує свою нову машину. Послухай і вибери, яка вона.')],
      options: [
        ['червона і дуже велика', 'c'],
        ['червона і дуже маленька', 'x', 'У записі muy grande — «дуже велика».'],
        ['чорна і дуже велика', 'x', 'У записі rojo — «червоний».'],
      ],
      rules: [[[LNP], 'Закінчення -o/-a та -s допомагають зрозуміти, якого роду предмет і скільки їх.']],
      extraHints: [transcript([LNP], 'Un coche rojo y muy grande.')],
      ok: 'Так: Un coche rojo y muy grande — «червона і дуже велика машина».',
      bad: 'Ні. У записі: Un coche rojo y muy grande.',
    }),
  ],
  clips: [
    clip({ id: 'clip.a1-02.casa-blanca', lessonId: 'A1-02-L4', kind: 'phrase', family: 'home', transcript: 'Una casa blanca y muy bonita.', translationUk: 'Білий і дуже гарний будинок.', targets: [LNP] }),
    clip({ id: 'clip.a1-02.libros-nuevos', lessonId: 'A1-02-L4', kind: 'phrase', family: 'objects', transcript: 'Unos libros nuevos.', translationUk: 'Якісь нові книжки.', targets: [LNP] }),
    clip({ id: 'clip.a1-02.mesas-pequenas', lessonId: 'A1-02-L4', kind: 'phrase', family: 'furniture', transcript: 'Unas mesas pequeñas y verdes.', translationUk: 'Якісь маленькі зелені столи.', targets: [LNP] }),
    clip({ id: 'clip.a1-02.coche-rojo', lessonId: 'A1-02-L4', kind: 'phrase', family: 'street', transcript: 'Un coche rojo y muy grande.', translationUk: 'Червона і дуже велика машина.', targets: [LNP] }),
  ],
};
