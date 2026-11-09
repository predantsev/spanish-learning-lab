// A1-02-L3 — singular and plural: -s, -es, z → ces, accent changes, plural articles.
import { es, ex, tableUk, uk, ulUk } from '../lib.ts';
import type { OutcomeSpec, Unit } from '../lib.ts';
import { pick, typed } from '../common.ts';

const AP_W = 'article.plural/written-form';
const AP_C = 'article.plural/context-choice';
const PS_W = 'noun.plural.s/written-form';
const PS_C = 'noun.plural.s/context-choice';
const PES_W = 'noun.plural.es/written-form';
const PES_C = 'noun.plural.es/context-choice';
const ZC_W = 'noun.plural.z-ces/written-form';
const ZC_C = 'noun.plural.z-ces/context-choice';
const AC_W = 'noun.plural.accent-change/written-form';
const AC_C = 'noun.plural.accent-change/context-choice';

const R_AP = 'Артиклі у множині: el → los, la → las, un → unos, una → unas. Рід лишається тим самим: la mano → las manos, el día → los días.';
const R_PS = 'Якщо іменник закінчується на голосну, у множині додаємо -s: libro → libros, coche → coches, café → cafés.';
const R_PES = 'Іменники на -d, -l, -r (як у цьому уроці) у множині отримують -es: ciudad → ciudades, hotel → hoteles, profesor → profesores. Інші кінцеві приголосні мають свої правила.';
const R_ZC = 'Якщо іменник закінчується на -z, у множині z змінюється на c і додається -es: lápiz → lápices, luz → luces, vez → veces.';
const R_AC = 'У цих словах наголос у множині лишається на тому самому складі, тому знак наголосу може зникнути (estación → estaciones, autobús → autobuses) або з’явитися (joven → jóvenes, examen → exámenes).';

type Err = [string, OutcomeSpec, string];

/** Plural with article: targets [article.plural, noun plural skill]. */
function plArt(n: number, role: 'supported' | 'independent' | 'delayed' | 'transfer', family: string, nounSkill: string, nounRule: string, shown: string, answer: string, errors: Err[], why: string, support?: string) {
  // family 'recall': `shown` is a Ukrainian instruction (meaning → plural with article); otherwise a Spanish singular.
  const ask = family === 'recall' ? [uk(shown)] : [uk('Напиши у множині разом з артиклем.'), es(shown)];
  return typed({
    n, role, family, targets: [AP_W, nounSkill],
    prompt: [...(support ? [uk(support)] : []), ...ask],
    answer,
    errors,
    rules: [[[AP_W], R_AP], [[nounSkill], nounRule]],
    why,
  });
}

export const unit: Unit = {
  lesson: {
    id: 'A1-02-L3',
    titleUk: 'Однина і множина',
    termEs: 'singular y plural',
    summaryUk: 'Навчишся утворювати множину іменників (-s, -es, z → ces), змінювати разом з ними артиклі (los, las, unos, unas) і зберігати правильний знак наголосу.',
    objectives: ['A1-02-O3'],
    cv: [],
    situations: ['people-family-home'],
    estimatedMinutes: 15,
    skippableFoundation: true,
    introduces: ['article.plural', 'noun.plural.s', 'noun.plural.es', 'noun.plural.z-ces', 'noun.plural.accent-change'],
    revisits: ['article.definite', 'article.indefinite', 'noun.gender.exception.fem-o', 'ortho.stress-awareness', 'article.el-stressed-a'],
    steps: [
      {
        kind: 'explanation',
        title: 'Множина іменника',
        blocks: [
          tableUk(['Іменник закінчується на', 'Що робимо', 'Приклади'], [
            ['голосну', 'додаємо -s', 'libro → libros, casa → casas, coche → coches, café → cafés'],
            ['-d, -l, -r', 'додаємо -es', 'ciudad → ciudades, hotel → hoteles, profesor → profesores, mujer → mujeres'],
            ['-z', 'z → c і додаємо -es', 'lápiz → lápices, luz → luces, vez → veces'],
          ]),
          uk('Перед e в іспанському письмі зазвичай пишуть c, а не z, тому lápices, а не lápizes.'),
          uk('Слова на -s і -n розберемо окремо далі в цьому уроці (autobús, joven, examen); інші кінцеві приголосні мають свої правила.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Артиклі у множині',
        blocks: [
          tableUk(['Рід', 'Однина', 'Множина'], [
            ['чоловічий рід', 'el libro / un libro', 'los libros / unos libros'],
            ['жіночий рід', 'la casa / una casa', 'las casas / unas casas'],
          ]),
          uk('Артикль змінюється разом з іменником, а рід лишається тим самим, навіть у винятків: la mano → las manos, el día → los días. Unos / unas означає «кілька, якісь»: unos amigos — «якісь друзі, кілька друзів».'),
          uk('El agua у множині — las aguas: слово жіночого роду.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Знак наголосу в множині',
        blocks: [
          uk('У наведених нижче словах у множині додається -es, і кількість складів збільшується на один. Наголос лишається на тому самому складі, але знак наголосу може зникнути або з’явитися.'),
          tableUk(['Однина', 'Множина', 'Що сталося'], [
            ['estación (es-ta-CIÓN)', 'estaciones (es-ta-CIO-nes)', 'знак зникає'],
            ['autobús (au-to-BÚS)', 'autobuses (au-to-BU-ses)', 'знак зникає'],
            ['joven (JO-ven)', 'jóvenes (JÓ-ve-nes)', 'знак з’являється'],
            ['examen (e-XA-men)', 'exámenes (e-XÁ-me-nes)', 'знак з’являється'],
          ]),
        ],
      },
      {
        kind: 'examples',
        title: 'Приклади',
        blocks: [
          ex('los libros y las mesas', 'книжки і столи'),
          ex('unos amigos', 'якісь друзі, кілька друзів'),
          ex('las ciudades', 'міста'),
          ex('las luces', 'світло, вогні'),
          ex('los autobuses', 'автобуси'),
          ex('los exámenes', 'іспити'),
        ],
      },
      { kind: 'supported-practice', title: 'Тренування з підказкою', tasks: [1, 2, 12, 13, 25, 31] },
      { kind: 'independent-practice', title: 'Самостійно', tasks: [11, 3, 14, 23, 4, 15, 5, 16, 26, 22, 6, 17, 32, 27, 30, 33, 36] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Голосна → -s (casas); -d, -l, -r → -es (ciudades, hoteles, flores); -z → -ces (lápices).',
            'Артиклі: el → los, la → las, un → unos, una → unas; рід не змінюється.',
            'У цих словах наголос не переходить: estación → estaciones, joven → jóvenes.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- -s (+ article.plural) ----------
    plArt(1, 'supported', 'plural-with-article', PS_W, R_PS, 'el libro', 'los libros', [
      ['los libro.', { [PS_W]: 'x', [AP_W]: 'c' }, 'Артикль правильний, але іменник теж змінюється: libros.'],
      ['el libros.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Артикль теж іде в множину: el → los.'],
      ['las libros.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Libro — чоловічого роду, тому los.'],
      ['los libroes.', { [PS_W]: 'x', [AP_W]: 'c' }, 'Після голосної додаємо лише -s: libros.'],
    ], 'Множина — los libros', 'Пам’ятай: у множині el → los, la → las; до слова на голосну додаємо -s.'),
    typed({
      n: 2, role: 'supported', family: 'plural', targets: [PS_W],
      prompt: [uk('Пам’ятай: до слова на голосну додаємо -s.'), uk('Напиши множину слова (без артикля).'), es('casa')],
      answer: 'casas',
      errors: [['casa.', 'x', 'Слово не змінилося: у множині додаємо -s.'], ['casaes.', 'x', 'Після голосної додаємо лише -s: casas.']],
      rules: [[[PS_W], R_PS]],
      why: 'Після голосної — -s',
    }),
    plArt(3, 'independent', 'plural-with-article', PS_W, R_PS, 'la llave', 'las llaves', [
      ['las llave.', { [PS_W]: 'x', [AP_W]: 'c' }, 'Іменник теж змінюється: llaves.'],
      ['los llaves.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Llave — жіночого роду, тому las.'],
      ['la llaves.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Артикль теж іде в множину: la → las.'],
    ], 'Llave закінчується на голосну: las llaves'),
    plArt(4, 'independent', 'plural-with-article', PS_W, R_PS, 'un amigo', 'unos amigos', [
      ['unos amigo.', { [PS_W]: 'x', [AP_W]: 'c' }, 'Іменник теж змінюється: amigos.'],
      ['unas amigos.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Amigo — чоловічого роду, тому unos.'],
      ['un amigos.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Артикль теж іде в множину: un → unos.'],
      ['los amigos.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Було un — неозначений артикль, тому unos.'],
    ], 'Множина — unos amigos'),
    typed({
      n: 5, role: 'independent', family: 'plural', targets: [PS_W],
      prompt: [uk('Напиши множину слова (без артикля).'), es('café')],
      answer: 'cafés',
      errors: [['café.', 'x', 'Слово не змінилося: у множині додаємо -s.'], ['caféses.', 'x', 'Café закінчується на голосну — додаємо лише -s: cafés.'], ['cafées.', 'x', 'Після é додаємо лише -s: cafés.'], ['cafes.', 'u', 'Множина утворена правильно, але знак наголосу лишається: cafés.']],
      rules: [[[PS_W], R_PS]],
      why: 'Після голосної — -s',
    }),
    typed({
      n: 6, role: 'independent', family: 'fix', targets: [PS_W],
      prompt: [uk('Виправ помилку в множині.'), es('las mesaes')],
      answer: 'las mesas',
      errors: [['las mesaes.', 'x', 'Нічого не змінилося: після голосної додаємо лише -s.']],
      rules: [[[PS_W], R_PS]],
      why: 'Після голосної — лише -s',
    }),
    plArt(7, 'delayed', 'recall', PS_W, R_PS, 'Напиши іспанською у множині з означеним артиклем: «фото» (ті самі, про які вже йшлося).', 'las fotos', [
      ['los fotos.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Foto — жіночого роду, тому las.'],
      ['las foto.', { [PS_W]: 'x', [AP_W]: 'c' }, 'Іменник теж змінюється: fotos.'],
    ], 'Foto — жіночого роду: las fotos'),
    plArt(8, 'delayed', 'recall', PS_W, R_PS, 'Напиши іспанською у множині з неозначеним артиклем: «якісь рюкзаки».', 'unas mochilas', [
      ['unos mochilas.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Mochila — жіночого роду, тому unas.'],
      ['unas mochila.', { [PS_W]: 'x', [AP_W]: 'c' }, 'Іменник теж змінюється: mochilas.'],
      ['una mochilas.', { [AP_W]: 'x', [PS_W]: 'c' }, 'Артикль теж іде в множину: unas.'],
    ], 'Множина — unas mochilas'),
    typed({
      n: 9, role: 'transfer', family: 'list', targets: [PS_W],
      prompt: [uk('Ти складаєш список речей для переїзду. Напиши іспанською без артикля: «стільці».')],
      answer: 'sillas',
      errors: [['silla.', 'x', 'Потрібна множина: sillas.'], ['sillaes.', 'x', 'Після голосної додаємо лише -s: sillas.']],
      rules: [[[PS_W], R_PS]],
      why: 'Множина — sillas',
    }),
    typed({
      n: 10, role: 'transfer', family: 'list', targets: [PS_W],
      prompt: [uk('Ти складаєш список меблів для нової квартири. Напиши іспанською без артикля: «дивани».')],
      answer: 'sofás',
      errors: [['sofá.', 'x', 'Потрібна множина: sofás.'], ['sofáes.', 'x', 'Після голосної додаємо лише -s: sofás.'], ['sofas.', 'u', 'Множина утворена правильно, але знак наголосу лишається: sofás.']],
      rules: [[[PS_W], R_PS]],
      why: 'Множина — sofás',
    }),
    pick({
      n: 11, role: 'independent', family: 'choose-plural', targets: [PS_C],
      prompt: [uk('Вибери правильну множину.'), es('el día')],
      options: [['los días', 'c'], ['los díaes', 'x', 'Día закінчується на голосну — додаємо лише -s.'], ['los día', 'x', 'Іменник теж іде в множину: días.']],
      rules: [[[PS_C], R_PS]],
      ok: 'Так: los días.',
      bad: 'Ні. Правильно: los días.',
    }),
    // ---------- -es (+ article.plural) ----------
    plArt(12, 'supported', 'plural-with-article', PES_W, R_PES, 'el hotel', 'los hoteles', [
      ['los hotels.', { [PES_W]: 'x', [AP_W]: 'c' }, 'Hotel закінчується на приголосну — додаємо -es: hoteles.'],
      ['los hotel.', { [PES_W]: 'x', [AP_W]: 'c' }, 'Іменник теж змінюється: hoteles.'],
      ['las hoteles.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Hotel — чоловічого роду, тому los.'],
      ['el hoteles.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Артикль теж іде в множину: el → los.'],
    ], 'Множина — los hoteles', 'Пам’ятай: до слова на -d, -l, -r додаємо -es.'),
    typed({
      n: 13, role: 'supported', family: 'plural', targets: [PES_W],
      prompt: [uk('Пам’ятай: до слова на -d, -l, -r додаємо -es.'), uk('Напиши множину слова (без артикля).'), es('ciudad')],
      answer: 'ciudades',
      errors: [['ciudads.', 'x', 'Після -d, -l, -r додаємо -es: ciudades.'], ['ciudad.', 'x', 'Слово не змінилося: у множині додаємо -es.']],
      rules: [[[PES_W], R_PES]],
      why: 'Після -d, -l, -r — -es',
    }),
    plArt(14, 'independent', 'plural-with-article', PES_W, R_PES, 'la flor', 'las flores', [
      ['las flors.', { [PES_W]: 'x', [AP_W]: 'c' }, 'Після -d, -l, -r додаємо -es: flores.'],
      ['los flores.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Flor — жіночого роду, тому las.'],
      ['la flores.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Артикль теж іде в множину: la → las.'],
    ], 'Множина — las flores'),
    plArt(15, 'independent', 'plural-with-article', PES_W, R_PES, 'un profesor', 'unos profesores', [
      ['unos profesors.', { [PES_W]: 'x', [AP_W]: 'c' }, 'Після -d, -l, -r додаємо -es: profesores.'],
      ['unas profesores.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Profesor — чоловічого роду, тому unos.'],
      ['un profesores.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Артикль теж іде в множину: un → unos.'],
      ['los profesores.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Було un — неозначений артикль, тому unos.'],
    ], 'Множина — unos profesores'),
    typed({
      n: 16, role: 'independent', family: 'plural', targets: [PES_W],
      prompt: [uk('Напиши множину слова (без артикля).'), es('mujer')],
      answer: 'mujeres',
      errors: [['mujers.', 'x', 'Після -d, -l, -r додаємо -es: mujeres.']],
      rules: [[[PES_W], R_PES]],
      why: 'Після -d, -l, -r — -es',
    }),
    typed({
      n: 17, role: 'independent', family: 'fix', targets: [PES_W],
      prompt: [uk('Виправ помилку в множині.'), es('los móvils')],
      answer: 'los móviles',
      errors: [['los móvils.', 'x', 'Нічого не змінилося: після -l додаємо -es.'], ['los moviles.', 'u', 'Множина утворена правильно, але знак наголосу лишається: móviles.']],
      rules: [[[PES_W], R_PES]],
      why: 'Після -d, -l, -r — -es',
    }),
    plArt(18, 'delayed', 'recall', PES_W, R_PES, 'Напиши іспанською у множині з означеним артиклем: «університети» (ті, про які вже йшлося).', 'las universidades', [
      ['las universidads.', { [PES_W]: 'x', [AP_W]: 'c' }, 'Після -d, -l, -r додаємо -es: universidades.'],
      ['los universidades.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Universidad — жіночого роду, тому las.'],
    ], 'Множина — las universidades'),
    plArt(19, 'delayed', 'recall', PES_W, R_PES, 'Напиши іспанською у множині з неозначеним артиклем: «якісь комп’ютери».', 'unos ordenadores', [
      ['unos ordenadors.', { [PES_W]: 'x', [AP_W]: 'c' }, 'Після -d, -l, -r додаємо -es: ordenadores.'],
      ['unas ordenadores.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Ordenador — чоловічого роду, тому unos.'],
      ['un ordenadores.', { [AP_W]: 'x', [PES_W]: 'c' }, 'Артикль теж іде в множину: unos.'],
    ], 'Множина — unos ordenadores'),
    typed({
      n: 20, role: 'transfer', family: 'letter', targets: [PES_W],
      prompt: [uk('Ти пишеш офіційне звертання до кількох чоловіків. Напиши без артикля множину слова señor («пан»).')],
      answer: 'señores',
      errors: [['señors.', 'x', 'Після -d, -l, -r додаємо -es: señores.'], ['senores.', 'u', 'Множина утворена правильно, але потрібна літера ñ: señores.']],
      rules: [[[PES_W], R_PES]],
      why: 'Множина — señores',
    }),
    typed({
      n: 21, role: 'transfer', family: 'list', targets: [PES_W],
      prompt: [uk('Ти складаєш маршрут подорожі. Напиши в нотатках іспанською без артикля: «міста».')],
      answer: 'ciudades',
      errors: [['ciudads.', 'x', 'Після -d, -l, -r додаємо -es: ciudades.'], ['ciudad.', 'x', 'Потрібна множина: ciudades.']],
      rules: [[[PES_W], R_PES]],
      why: 'Множина — ciudades',
    }),
    pick({
      n: 22, role: 'independent', family: 'choose-plural', targets: [PES_C],
      prompt: [uk('Вибери правильну множину.'), es('el profesor')],
      options: [['los profesores', 'c'], ['los profesors', 'x', 'Після -r додаємо -es.'], ['los profesor', 'x', 'Іменник теж іде в множину.']],
      rules: [[[PES_C], R_PES]],
      ok: 'Так: los profesores.',
      bad: 'Ні. Правильно: los profesores.',
    }),
    // ---------- article.plural choice ----------
    pick({
      n: 23, role: 'independent', family: 'choose-article', targets: [AP_C],
      prompt: [uk('Вибери артикль: ___ casas.')],
      options: [['las', 'c'], ['los', 'x', 'Casa — жіночого роду, тому las.']],
      rules: [[[AP_C], R_AP]],
      ok: 'Так: las casas.',
      bad: 'Ні. Правильно: las casas.',
    }),
    pick({
      n: 24, role: 'delayed', family: 'choose-article', targets: [AP_C],
      prompt: [uk('Ти розповідаєш про якихось друзів (не конкретних). Вибери артикль: ___ amigos.')],
      options: [['unos', 'c'], ['unas', 'x', 'Amigos — чоловічого роду, тому unos.']],
      rules: [[[AP_C], R_AP]],
      ok: 'Так: unos amigos.',
      bad: 'Ні. Правильно: unos amigos.',
    }),
    // ---------- z → ces ----------
    typed({
      n: 25, role: 'supported', family: 'plural', targets: [ZC_W],
      prompt: [uk('Пам’ятай: -z → -ces: lápiz → lápices.'), uk('Напиши множину слова (без артикля).'), es('luz')],
      answer: 'luces',
      errors: [['luzes.', 'x', 'Перед e пишемо c: luces.'], ['luzs.', 'x', 'Після -z додаємо -es і змінюємо z на c: luces.']],
      rules: [[[ZC_W], R_ZC]],
      why: 'Z → c + -es',
    }),
    typed({
      n: 26, role: 'independent', family: 'plural', targets: [ZC_W],
      prompt: [uk('Напиши множину слова (без артикля).'), es('lápiz')],
      answer: 'lápices',
      errors: [['lápizes.', 'x', 'Перед e пишемо c: lápices.'], ['lapizes.', 'x', 'Перед e пишемо c, а знак наголосу лишається: lápices.'], ['lapices.', 'u', 'Z → c правильно, але знак наголосу лишається: lápices.']],
      rules: [[[ZC_W], R_ZC]],
      why: 'Z → c + -es',
    }),
    typed({
      n: 27, role: 'independent', family: 'plural', targets: [ZC_W],
      prompt: [uk('Напиши множину слова vez («раз») без артикля.')],
      answer: 'veces',
      errors: [['vezes.', 'x', 'Перед e пишемо c: veces.'], ['vezs.', 'x', 'Після -z додаємо -es і змінюємо z на c: veces.']],
      rules: [[[ZC_W], R_ZC]],
      why: 'Z → c + -es',
    }),
    plArt(28, 'delayed', 'plural-with-article', ZC_W, R_ZC, 'la luz', 'las luces', [
      ['las luzes.', { [ZC_W]: 'x', [AP_W]: 'c' }, 'Перед e пишемо c: luces.'],
      ['las luzs.', { [ZC_W]: 'x', [AP_W]: 'c' }, 'Після -z додаємо -es і змінюємо z на c: luces.'],
      ['la luces.', { [AP_W]: 'x', [ZC_W]: 'c' }, 'Артикль теж іде в множину: la → las.'],
      ['los luces.', { [AP_W]: 'x', [ZC_W]: 'c' }, 'Luz — жіночого роду, тому las.'],
    ], 'Множина — las luces'),
    typed({
      n: 29, role: 'transfer', family: 'list', targets: [ZC_W],
      prompt: [uk('Ти складаєш список канцтоварів для навчання. Напиши іспанською без артикля: «олівці».')],
      answer: 'lápices',
      errors: [['lápizes.', 'x', 'Перед e пишемо c: lápices.'], ['lapices.', 'u', 'Z → c правильно, але знак наголосу лишається: lápices.']],
      rules: [[[ZC_W], R_ZC]],
      why: 'Множина — lápices',
    }),
    pick({
      n: 30, role: 'independent', family: 'choose-plural', targets: [ZC_C],
      prompt: [uk('Вибери правильну множину.'), es('la vez')],
      options: [['las veces', 'c'], ['las vezes', 'x', 'Перед e пишемо c, а не z.']],
      rules: [[[ZC_C], R_ZC]],
      ok: 'Так: las veces.',
      bad: 'Ні. Правильно: las veces.',
    }),
    // ---------- accent change ----------
    typed({
      n: 31, role: 'supported', family: 'plural', targets: [AC_W],
      prompt: [uk('Пам’ятай: у цих словах наголос не переходить, тому знак може зникнути: estación → estaciones.'), uk('Напиши множину слова (без артикля).'), es('autobús')],
      answer: 'autobuses',
      errors: [['autobúses.', 'x', 'У множині наголошений склад BU вже не останній, тому знак зникає: autobuses.']],
      rules: [[[AC_W], R_AC]],
      why: 'Знак зникає',
    }),
    typed({
      n: 32, role: 'independent', family: 'plural', targets: [AC_W],
      prompt: [uk('Напиши множину слова examen («іспит») без артикля.')],
      answer: 'exámenes',
      errors: [['examenes.', 'x', 'Наголос лишається на XA, тому в множині з’являється знак: exámenes.'], ['examénes.', 'x', 'Наголошений склад — XA, тому знак над á: exámenes.']],
      rules: [[[AC_W], R_AC]],
      why: 'Знак з’являється',
    }),
    typed({
      n: 33, role: 'independent', family: 'plural', targets: [AC_W],
      prompt: [uk('Напиши множину слова (без артикля).'), es('habitación')],
      answer: 'habitaciones',
      errors: [['habitaciónes.', 'x', 'У множині знак зникає: habitaciones.']],
      rules: [[[AC_W], R_AC]],
      why: 'Знак зникає',
    }),
    typed({
      n: 34, role: 'delayed', family: 'plural', targets: [AC_W],
      prompt: [uk('Напиши множину слова joven («молода людина») без артикля.')],
      answer: 'jóvenes',
      errors: [['jovenes.', 'x', 'Наголос лишається на JO, тому в множині з’являється знак: jóvenes.'], ['jovénes.', 'x', 'Наголошений склад — JO, тому знак над ó: jóvenes.']],
      rules: [[[AC_W], R_AC]],
      why: 'Знак з’являється',
    }),
    typed({
      n: 35, role: 'transfer', family: 'sign', targets: [AC_W],
      prompt: [uk('На вокзалі вказівник веде до кількох станцій приміських поїздів. Напиши «станції» іспанською без артикля.')],
      answer: 'estaciones',
      errors: [['estaciónes.', 'x', 'У множині знак зникає: estaciones.']],
      rules: [[[AC_W], R_AC]],
      why: 'Знак зникає',
    }),
    pick({
      n: 36, role: 'independent', family: 'choose-plural', targets: [AC_C],
      prompt: [uk('Вибери правильну множину.'), es('el examen')],
      options: [['los exámenes', 'c'], ['los examenes', 'x', 'Наголос лишається на XA, тому в множині потрібен знак.'], ['los examénes', 'x', 'Наголошений склад — XA: exámenes.']],
      rules: [[[AC_C], R_AC]],
      ok: 'Так: los exámenes.',
      bad: 'Ні. Правильно: los exámenes.',
    }),
  ],
};
