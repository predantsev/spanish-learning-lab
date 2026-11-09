// A1-02-L2 — definite and indefinite articles in introduced contexts; el agua as an unassessed note.
import { ex, tableUk, uk, ulUk, es } from '../lib.ts';
import type { Unit } from '../lib.ts';
import { pick, typed } from '../common.ts';

const IND_W = 'article.indefinite/written-form';
const IND_C = 'article.indefinite/context-choice';
const DI_C = 'article.definite-indefinite/context-choice';
const DI_R = 'article.definite-indefinite/reading-meaning';
const OA_W = 'noun.gender.o-a/written-form';
const EC_W = 'noun.gender.e-consonant/written-form';
const CD_W = 'noun.gender.cion-dad/written-form';
const MA_W = 'noun.gender.exception.masc-a/written-form';
const FO_W = 'noun.gender.exception.fem-o/written-form';
const PE_W = 'noun.gender.people/written-form';

const R_IND = 'Неозначений артикль: un — перед іменником чоловічого роду в однині, una — перед іменником жіночого роду: un libro, una casa.';
const R_DI = 'Un/una — коли предмет згадують уперше або це «якийсь, один із багатьох». El/la — коли зрозуміло, про який саме предмет ідеться: його вже згадували, він єдиний у ситуації або відомий усім.';
const R_GENDER: Record<string, string> = {
  [OA_W]: 'Більшість іменників на -o — чоловічого роду, на -a — жіночого.',
  [EC_W]: 'Рід іменників на -e та на приголосну запам’ятовуємо з артиклем: la calle, el hotel.',
  [CD_W]: 'Іменники на -ción і -dad — жіночого роду.',
  [MA_W]: 'El mapa, el día, el problema, el idioma, el sofá — чоловічого роду, хоча закінчуються на -a.',
  [FO_W]: 'La radio, la mano, la foto, la moto — жіночого роду, хоча закінчуються на -o.',
  [PE_W]: 'Estudiante має одну форму; рід видно з артикля: el estudiante (чоловік), la estudiante (жінка).',
};
const REMIND_DI = 'Пам’ятай: un/una — нове, «якийсь, один із багатьох»; el/la — відоме, «саме той».';

/** Indefinite + gender: wrong-gender indefinite → gender incorrect, article unresolved. */
function indRecall(n: number, role: 'independent' | 'delayed' | 'transfer', family: string, gender: string, prompt: string, answer: string, wrongGender: string, definite: string, bare: string, why: string) {
  return typed({
    n, role, family, targets: [IND_W, gender],
    prompt: [uk(prompt)],
    answer,
    errors: [
      [`${wrongGender}.`, { [gender]: 'x', [IND_W]: 'u' }, `Рід іменника інший: ${answer}.`],
      [`${definite}.`, { [IND_W]: 'x', [gender]: 'c' }, `Рід правильний, але тут потрібен неозначений артикль un/una: ${answer}.`],
      [`${bare}.`, { [IND_W]: 'x', [gender]: 'u' }, `Перед іменником потрібен артикль: ${answer}.`],
    ],
    rules: [[[IND_W], R_IND], [[gender], R_GENDER[gender] ?? '']],
    why,
  });
}

export const unit: Unit = {
  lesson: {
    id: 'A1-02-L2',
    titleUk: 'Означений і неозначений артикль',
    termEs: 'el artículo determinado e indeterminado',
    summaryUk: 'Вивчиш неозначений артикль un, una і навчишся вибирати між el/la та un/una залежно від того, чи відомо, про який саме предмет ідеться.',
    objectives: ['A1-02-O2'],
    cv: [],
    situations: ['people-family-home'],
    estimatedMinutes: 14,
    skippableFoundation: true,
    introduces: ['article.el-stressed-a', 'article.indefinite', 'article.definite-indefinite'],
    revisits: ['article.definite', 'noun.gender.o-a', 'noun.gender.e-consonant', 'noun.gender.cion-dad', 'noun.gender.exception.masc-a', 'noun.gender.exception.fem-o', 'noun.gender.people'],
    steps: [
      {
        kind: 'explanation',
        title: 'Неозначений артикль un, una',
        blocks: [
          uk('Крім el і la, є неозначений артикль: un — перед іменником чоловічого роду в однині, una — перед іменником жіночого роду: un libro, una casa. Він часто відповідає українським «якийсь, один»: un hotel — «(якийсь) готель».'),
          tableUk(['Рід', 'Означений', 'Неозначений'], [
            ['чоловічий', 'el libro, el piso', 'un libro, un piso'],
            ['жіночий', 'la casa, la tienda', 'una casa, una tienda'],
          ]),
        ],
      },
      {
        kind: 'explanation',
        title: 'El чи un: відоме чи нове',
        blocks: [
          uk('Un/una кажемо, коли предмет згадуємо вперше або це «якийсь, один із багатьох»: un piso — якась квартира. El/la — коли зрозуміло, про який саме предмет ідеться: його вже згадували, він єдиний у ситуації або всім відомий: el piso — та сама квартира, про яку вже йшлося.'),
          uk('Часто буває так: спершу un, потім el. Una mochila… La mochila es… — «Якийсь рюкзак… Цей рюкзак…».'),
          uk('Окремий випадок: слово agua («вода») жіночого роду, але в однині з артиклем el: el agua. Так буває з жіночими іменниками, що починаються з наголошеного a-. Поки що просто запам’ятай el agua; оцінювати це не будемо.'),
        ],
      },
      {
        kind: 'examples',
        title: 'Приклади',
        blocks: [
          ex('un ordenador', 'комп’ютер (якийсь)'),
          ex('una tienda', 'крамниця (якась)'),
          ex('el piso', 'квартира (та, про яку вже йшлося)'),
          ex('la mochila', 'рюкзак (саме той)'),
          ex('el agua', 'вода (жіночий рід, але el)'),
        ],
      },
      { kind: 'supported-practice', title: 'Тренування з підказкою', tasks: [1, 2, 12, 13] },
      { kind: 'independent-practice', title: 'Самостійно', tasks: [3, 11, 14, 4, 5, 15, 6, 16] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Неозначений артикль: un — чоловічий рід, una — жіночий.',
            'Un/una — нове або «якийсь»; el/la — відоме, «саме той».',
            'El agua: жіночий рід, але в однині el.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- article.indefinite ----------
    typed({
      n: 1, role: 'supported', family: 'with-article', targets: [IND_W],
      prompt: [uk('Пам’ятай: un — перед чоловічим родом, una — перед жіночим.'), uk('Іменник ordenador («комп’ютер») — чоловічого роду. Напиши його з неозначеним артиклем.')],
      answer: 'un ordenador',
      errors: [
        ['una ordenador.', 'x', 'Ordenador — чоловічого роду, тому un.'],
        ['el ordenador.', 'x', 'El — означений артикль; тут потрібен неозначений: un.'],
      ],
      rules: [[[IND_W], R_IND]],
      why: 'Чоловічий рід — un',
    }),
    typed({
      n: 2, role: 'supported', family: 'with-article', targets: [IND_W],
      prompt: [uk('Пам’ятай: un — перед чоловічим родом, una — перед жіночим.'), uk('Іменник mochila («рюкзак») — жіночого роду. Напиши його з неозначеним артиклем.')],
      answer: 'una mochila',
      errors: [
        ['un mochila.', 'x', 'Mochila — жіночого роду, тому una.'],
        ['la mochila.', 'x', 'La — означений артикль; тут потрібен неозначений: una.'],
      ],
      rules: [[[IND_W], R_IND]],
      why: 'Жіночий рід — una',
    }),
    indRecall(3, 'independent', 'recall', OA_W, 'Напиши іспанською з неозначеним артиклем: «якась крамниця».', 'una tienda', 'un tienda', 'la tienda', 'tienda', 'Tienda — жіночого роду'),
    indRecall(4, 'independent', 'recall', OA_W, 'Напиши іспанською з неозначеним артиклем: «якась квартира».', 'un piso', 'una piso', 'el piso', 'piso', 'Piso — чоловічого роду, хоча «квартира» жіночого'),
    indRecall(5, 'independent', 'recall', EC_W, 'Напиши іспанською з неозначеним артиклем: «якась вулиця».', 'una calle', 'un calle', 'la calle', 'calle', 'Calle — жіночого роду'),
    typed({
      n: 6, role: 'independent', family: 'with-article', targets: [IND_W],
      prompt: [uk('Іменник bolso («сумка») — чоловічого роду. Напиши іспанською з неозначеним артиклем: «якась сумка».')],
      answer: 'un bolso',
      errors: [
        ['una bolso.', 'x', 'Bolso — чоловічого роду, тому un.'],
        ['el bolso.', 'x', 'El — означений артикль; тут потрібен неозначений: un.'],
      ],
      rules: [[[IND_W], R_IND]],
      why: 'Чоловічий рід — un',
    }),
    indRecall(7, 'delayed', 'recall', MA_W, 'Напиши іспанською з неозначеним артиклем: «якась мапа».', 'un mapa', 'una mapa', 'el mapa', 'mapa', 'Mapa — чоловічого роду'),
    typed({
      n: 8, role: 'delayed', family: 'recall', targets: [IND_W, CD_W],
      prompt: [uk('Напиши іспанською з неозначеним артиклем: «якась станція».')],
      answer: 'una estación',
      errors: [
        ['un estación.', { [CD_W]: 'x', [IND_W]: 'u' }, 'Слова на -ción — жіночого роду: una estación.'],
        ['la estación.', { [IND_W]: 'x', [CD_W]: 'c' }, 'Рід правильний, але тут потрібен неозначений артикль: una estación.'],
        ['una estacion.', 'u', 'Артикль правильний, але estación пишеться зі знаком наголосу.'],
      ],
      rules: [[[IND_W], R_IND], [[CD_W], R_GENDER[CD_W] ?? '']],
      why: 'Estación — жіночого роду',
    }),
    indRecall(9, 'transfer', 'message', PE_W, 'Ти пишеш подрузі, що в кав’ярні сидів якийсь студент (хлопець). Напиши іспанською лише: «якийсь студент».', 'un estudiante', 'una estudiante', 'el estudiante', 'estudiante', 'Студент-хлопець — un estudiante'),
    indRecall(10, 'transfer', 'gift-list', FO_W, 'Ти складаєш список подарунків. Напиши іспанською з неозначеним артиклем: «якесь радіо».', 'una radio', 'un radio', 'la radio', 'radio', 'Radio в Іспанії — жіночого роду'),
    pick({
      n: 11, role: 'independent', family: 'choose-form', targets: [IND_C],
      prompt: [uk('Іменник flor — жіночого роду. Вибери неозначений артикль: ___ flor.')],
      options: [['una', 'c'], ['un', 'x', 'Un — для чоловічого роду; flor — жіночого.']],
      rules: [[[IND_C], R_IND]],
      ok: 'Так: una flor.',
      bad: 'Ні. Правильно: una flor.',
    }),
    // ---------- article.definite-indefinite ----------
    pick({
      n: 12, role: 'supported', family: 'context', targets: [DI_C],
      prompt: [uk(REMIND_DI), uk('Ти розповідаєш подрузі новину: на твоїй вулиці відкрили кав’ярню, вона про неї ще нічого не чула. Як назвеш кав’ярню?')],
      options: [['un café', 'c'], ['el café', 'x', 'Подруга ще не знає про цю кав’ярню — це нова інформація, тому un.']],
      rules: [[[DI_C], R_DI]],
      ok: 'Так: про нове кажемо un café.',
      bad: 'Ні. Кав’ярню згадують уперше, тому un café.',
    }),
    pick({
      n: 13, role: 'supported', family: 'context', targets: [DI_C],
      prompt: [uk(REMIND_DI), uk('У кімнаті стоїть лише один стіл, і ти показуєш на нього. Як назвеш стіл?')],
      options: [['la mesa', 'c'], ['una mesa', 'x', 'Стіл у кімнаті один, і зрозуміло, про який ідеться, тому la.']],
      rules: [[[DI_C], R_DI]],
      ok: 'Так: зрозуміло, про який стіл ідеться, — la mesa.',
      bad: 'Ні. Стіл єдиний у ситуації, тому la mesa.',
    }),
    pick({
      n: 14, role: 'independent', family: 'context', targets: [DI_C],
      prompt: [uk('Ана питає про книжку, яку ти вчора в неї взяла. Як назвеш цю книжку?')],
      options: [['el libro', 'c'], ['un libro', 'x', 'Ідеться про конкретну книжку, яку обидві знаєте, тому el.']],
      rules: [[[DI_C], R_DI]],
      ok: 'Так: відома обом книжка — el libro.',
      bad: 'Ні. Ви обидві знаєте, про яку книжку йдеться, тому el libro.',
    }),
    pick({
      n: 15, role: 'independent', family: 'context', targets: [DI_C],
      prompt: [uk('Ти хочеш купити рюкзак — будь-який, ще не знаєш який. Як назвеш його?')],
      options: [['una mochila', 'c'], ['la mochila', 'x', 'Рюкзак ще не конкретний — «якийсь», тому una.']],
      rules: [[[DI_C], R_DI]],
      ok: 'Так: будь-який рюкзак — una mochila.',
      bad: 'Ні. Ідеться про якийсь рюкзак, тому una mochila.',
    }),
    pick({
      n: 16, role: 'independent', family: 'meaning', targets: [DI_R],
      prompt: [uk('Прочитай записку від сусіда по квартирі.'), es('La llave, por favor.'), uk('Про який ключ ідеться?')],
      options: [
        ['Про той ключ, який обидва знають.', 'c'],
        ['Про будь-який ключ, один із багатьох.', 'x', 'La вказує на відомий, конкретний ключ.'],
      ],
      rules: [[[DI_R], R_DI]],
      ok: 'Так: la llave — конкретний, відомий обом ключ.',
      bad: 'Ні. La llave — саме той ключ, про який обидва знають.',
    }),
    pick({
      n: 17, role: 'delayed', family: 'meaning', targets: [DI_R],
      prompt: [uk('Ви ще не говорили ні про яке фото. Подруга пише:'), es('Una foto, por favor.'), uk('Що вона просить?')],
      options: [
        ['Фото, про яке ви ще не говорили.', 'c'],
        ['Те саме фото, про яке вже говорили.', 'x', 'Una — нове, «якесь»; про відоме фото сказали б la foto.'],
      ],
      rules: [[[DI_R], R_DI]],
      ok: 'Так: una foto вводить фото, про яке ще не йшлося.',
      bad: 'Ні. Una не вказує на фото, про яке вже говорили: його вводять уперше.',
    }),
    pick({
      n: 18, role: 'delayed', family: 'context', targets: [DI_C],
      prompt: [uk('Ви з другом живете в одному номері готелю, і в номері є лише один ключ — обидва знаєте, який саме. Ти питаєш друга про цей ключ. Як його назвеш: ___ llave?')],
      options: [['la llave', 'c'], ['una llave', 'x', 'Обидва знаєте, про який ключ ідеться, тому la.']],
      rules: [[[DI_C], R_DI]],
      ok: 'Так: конкретний ключ — la llave.',
      bad: 'Ні. Ключ відомий обом, тому la llave.',
    }),
    pick({
      n: 19, role: 'transfer', family: 'story', targets: [DI_C],
      prompt: [uk('Ти пишеш коротку історію: спершу вперше згадуєш рюкзак, а потім ще раз — той самий. Яка пара правильна?')],
      options: [
        ['una mochila … la mochila', 'c'],
        ['la mochila … una mochila', 'x', 'Навпаки: перша згадка — una, повторна — la.'],
        ['una mochila … una mochila', 'x', 'Повторно про той самий рюкзак кажемо la mochila.'],
      ],
      rules: [[[DI_C], R_DI]],
      ok: 'Так: спершу una mochila, потім la mochila.',
      bad: 'Ні. Перша згадка — una mochila, повторна — la mochila.',
    }),
  ],
};
