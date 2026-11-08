// A1-02-C1 — optional mixed check: practice links over the block's targets (held-out bank) plus new
// mixed-context transfer prompts that join that bank. No new teaching, no lock.
import { clip, link, material, tableUk, transcript, uk, ulUk, es } from '../lib.ts';
import type { Unit } from '../lib.ts';
import { pick, typed } from '../common.ts';

const NOUN_TARGETS = [
  'noun.gender.o-a/written-form', 'noun.gender.e-consonant/written-form', 'noun.gender.cion-dad/written-form',
  'noun.gender.exception.masc-a/written-form', 'noun.gender.exception.fem-o/written-form', 'noun.gender.people/written-form',
  'article.definite/written-form', 'article.indefinite/written-form', 'article.plural/written-form',
  'noun.plural.s/written-form', 'noun.plural.es/written-form', 'noun.plural.z-ces/written-form', 'noun.plural.accent-change/written-form',
];
const DESC_TARGETS = [
  'adj.agreement.o-a/written-form', 'adj.agreement.invariable-gender/written-form', 'adj.position.after-noun/construction-use',
  'quant.muy/written-form', 'poss.mi-tu-su/written-form', 'poss.number-agreement/written-form', 'poss.nuestro-vuestro/written-form',
  'prep.de.possession/construction-use',
];
const CHOICE_TARGETS = ['article.definite-indefinite/context-choice', 'article.definite-indefinite/reading-meaning', 'poss.su-reference/reading-meaning', 'poss.su-reference/context-choice'];
const LNP = 'listening.noun-phrase/listening-meaning';

const AO_W = 'adj.agreement.o-a/written-form';
const AI_W = 'adj.agreement.invariable-gender/written-form';
const NV_W = 'poss.nuestro-vuestro/written-form';
const MTS_W = 'poss.mi-tu-su/written-form';
const NUM_W = 'poss.number-agreement/written-form';
const DE_U = 'prep.de.possession/construction-use';
const AP_W = 'article.plural/written-form';
const PES_W = 'noun.plural.es/written-form';
const ZC_W = 'noun.plural.z-ces/written-form';
const AC_W = 'noun.plural.accent-change/written-form';

export const unit: Unit = {
  lesson: {
    id: 'A1-02-C1',
    titleUk: 'Перевір себе: артикль, іменник, опис і належність',
    summaryUk: 'Необов’язкова перевірка блоку A1-02: нові завдання, у яких поєднуються артикль, рід і число, прикметник і присвійні слова. Кожне вміння оцінюється окремо, допомога доступна, нічого не блокується.',
    objectives: ['A1-02-O1', 'A1-02-O2', 'A1-02-O3', 'A1-02-O4', 'A1-02-O5'],
    cv: ['CV-02', 'CV-03'],
    situations: ['people-family-home'],
    estimatedMinutes: 12,
    introduces: [],
    revisits: [
      'noun.gender.o-a', 'noun.gender.e-consonant', 'noun.gender.cion-dad', 'noun.gender.exception.masc-a', 'noun.gender.exception.fem-o',
      'noun.gender.people', 'article.definite', 'article.indefinite', 'article.definite-indefinite', 'article.plural', 'noun.plural.s',
      'noun.plural.es', 'noun.plural.z-ces', 'noun.plural.accent-change', 'adj.agreement.o-a', 'adj.agreement.invariable-gender',
      'adj.position.after-noun', 'quant.muy', 'listening.noun-phrase', 'poss.mi-tu-su', 'poss.number-agreement', 'poss.nuestro-vuestro',
      'poss.su-reference', 'prep.de.possession',
    ],
    steps: [
      {
        kind: 'self-check',
        title: 'Іменник, артикль і множина',
        blocks: [
          uk('Ця перевірка необов’язкова й нічого не блокує. Завдання нові, без зразка; правило й підказку можна відкрити будь-коли — допомогу буде записано лише для того вміння, яке вона пояснює. Кожне вміння в завданні оцінюється окремо.'),
          link('Рід, артиклі й множина', NOUN_TARGETS, 'written', 10),
        ],
      },
      { kind: 'self-check', title: 'Опис і належність', blocks: [link('Прикметник, muy, присвійні слова, de', DESC_TARGETS, 'written', 10)] },
      { kind: 'self-check', title: 'Вибір у контексті та слухання', blocks: [link('El чи un, чий саме su, короткі описи на слух', [...CHOICE_TARGETS, LNP], 'mixed', 8)] },
      {
        kind: 'summary',
        title: 'Що далі',
        blocks: [
          ulUk(
            'Результат показується окремо для кожного вміння; нерозв’язані відповіді не вважаються помилками.',
            'У блоці A1-03 ці словосполучення стануть частиною речень: Es mi amiga. El libro está en la mesa.',
          ),
        ],
      },
    ],
  },
  tasks: [
    typed({
      n: 1, role: 'transfer', family: 'c1-description', targets: [NV_W, AO_W],
      prompt: [uk('Ти описуєш свою кухню в повідомленні. Напиши іспанською: «наші білі стільці».')],
      answer: 'nuestras sillas blancas',
      errors: [
        ['nuestros sillas blancas.', { [NV_W]: 'x', [AO_W]: 'c' }, 'Sillas — жіночого роду, тому nuestras.'],
        ['nuestras sillas blancos.', { [AO_W]: 'x', [NV_W]: 'c' }, 'Sillas — жіночого роду, тому blancas.'],
      ],
      rules: [[[NV_W], 'Nuestro змінюється за родом і числом того, що належить.'], [[AO_W], 'Прикметник на -o узгоджується з іменником у роді та числі.']],
      why: 'Наші білі стільці — nuestras sillas blancas',
    }),
    typed({
      n: 2, role: 'transfer', family: 'c1-description', targets: [MTS_W, NUM_W, AI_W],
      prompt: [uk('Ти шукаєш свої ключі й пишеш сусідові: «мої зелені ключі». Напиши іспанською.')],
      answer: 'mis llaves verdes',
      errors: [
        ['mi llaves verdes.', { [NUM_W]: 'x', [MTS_W]: 'c', [AI_W]: 'c' }, 'Ключів кілька, тому mis.'],
        ['mis llaves verde.', { [AI_W]: 'x', [MTS_W]: 'c', [NUM_W]: 'c' }, 'Іменник у множині, тому verdes.'],
        ['tus llaves verdes.', { [MTS_W]: 'x', [NUM_W]: 'c', [AI_W]: 'c' }, 'Ключі твої — mis, а не tus.'],
      ],
      rules: [[[MTS_W, NUM_W], 'Mi, tu, su перед іменником без артикля; у множині — mis, tus, sus.'], [[AI_W], 'Прикметник на -e має одну форму для обох родів, у множині — -s.']],
      why: 'Мої зелені ключі — mis llaves verdes',
    }),
    typed({
      n: 3, role: 'transfer', family: 'c1-whose', targets: [DE_U, AO_W],
      prompt: [uk('Ти підписуєш фото: «червоний мотоцикл мого брата». Напиши іспанською з означеним артиклем (коротке слово moto).')],
      answer: 'la moto roja de mi hermano',
      errors: [
        ['la moto rojo de mi hermano.', { [AO_W]: 'x', [DE_U]: 'c' }, 'Moto — жіночого роду, тому roja.'],
        ['la moto roja mi hermano.', { [DE_U]: 'x', [AO_W]: 'c' }, 'Між річчю і власником потрібен de.'],
      ],
      rules: [[[DE_U], 'Спершу те, що належить, потім de і власник.'], [[AO_W], 'Прикметник узгоджується з родом іменника: la moto — жіночий рід.']],
      why: 'La moto roja de mi hermano',
    }),
    typed({
      n: 4, role: 'transfer', family: 'c1-plural', targets: [AP_W, PES_W, AI_W],
      prompt: [uk('Напиши у множині разом з артиклем і прикметником.'), es('el hotel grande')],
      answer: 'los hoteles grandes',
      errors: [
        ['los hoteles grande.', { [AI_W]: 'x', [AP_W]: 'c', [PES_W]: 'c' }, 'Прикметник теж іде в множину: grandes.'],
        ['los hotels grandes.', { [PES_W]: 'x', [AP_W]: 'c', [AI_W]: 'c' }, 'Після приголосної додаємо -es: hoteles.'],
        ['las hoteles grandes.', { [AP_W]: 'x', [PES_W]: 'c', [AI_W]: 'c' }, 'Hotel — чоловічого роду, тому los.'],
      ],
      rules: [[[AP_W], 'Артиклі в множині: el → los, la → las.'], [[PES_W], 'Після приголосної в множині додаємо -es.'], [[AI_W], 'Grande має одну форму для обох родів, у множині — grandes.']],
      why: 'Множина — los hoteles grandes',
    }),
    typed({
      n: 5, role: 'transfer', family: 'c1-plural', targets: [ZC_W, AC_W],
      prompt: [uk('Напиши множину обох слів без артиклів, через кому: luz, autobús.')],
      answer: 'luces, autobuses',
      errors: [
        ['luzes, autobuses.', { [ZC_W]: 'x', [AC_W]: 'c' }, 'Перед e пишемо c: luces.'],
        ['luces, autobúses.', { [AC_W]: 'x', [ZC_W]: 'c' }, 'У множині знак зникає: autobuses.'],
        ['luzes, autobúses.', { [ZC_W]: 'x', [AC_W]: 'x' }, 'Luces (z → c) і autobuses (знак зникає).'],
      ],
      rules: [[[ZC_W], 'Закінчення -z у множині змінюється на -ces: luz → luces.'], [[AC_W], 'Наголос не переходить, тому знак може зникнути: autobús → autobuses.']],
      why: 'Luces, autobuses',
    }),
    pick({
      n: 6, role: 'transfer', family: 'c1-listen', targets: [LNP], clips: ['clip.a1-02.flores-rojas'],
      prompt: [uk('Послухай опис букета. Що описують?')],
      options: [
        ['якісь червоні й дуже гарні квіти', 'c'],
        ['червона й дуже гарна квітка', 'x', 'У записі множина: unas flores.'],
        ['якісь білі квіти', 'x', 'У записі rojas — «червоні».'],
      ],
      rules: [[[LNP], 'Закінчення -o/-a та -s допомагають зрозуміти рід і кількість.']],
      extraHints: [transcript([LNP], 'Unas flores rojas y muy bonitas.')],
      ok: 'Так: Unas flores rojas y muy bonitas.',
      bad: 'Ні. У записі: Unas flores rojas y muy bonitas — «якісь червоні й дуже гарні квіти».',
    }),
    pick({
      n: 7, role: 'transfer', family: 'c1-context', targets: ['article.definite-indefinite/context-choice'],
      prompt: [uk('Ти вперше пишеш у листі про подругу, якої адресат зовсім не знає. Як ти її назвеш?')],
      options: [['una amiga', 'c'], ['la amiga', 'x', 'Адресат не знає цієї подруги — це нова інформація, тому una.']],
      rules: [[['article.definite-indefinite/context-choice'], 'Un/una — нове, «якийсь»; el/la — відоме, «саме той».']],
      ok: 'Так: про нову для адресата людину — una amiga.',
      bad: 'Ні. Перша згадка, нова інформація — una amiga.',
    }),
    pick({
      n: 8, role: 'transfer', family: 'c1-caption', targets: ['poss.su-reference/reading-meaning'],
      prompt: [uk('Підпис під фото Пабло:'), es('Pablo y su hermana Ana'), uk('Хто така Ана?')],
      options: [['сестра Пабло', 'c'], ['твоя сестра', 'x', '«Твоя» — tu.'], ['моя сестра', 'x', '«Моя» — mi.']],
      rules: [[['poss.su-reference/reading-meaning'], 'Su — «його, її, їхній, Ваш»; власника видно з контексту.']],
      ok: 'Так: su hermana — сестра Пабло.',
      bad: 'Ні. Su тут — «його»: Ана — сестра Пабло.',
    }),
  ],
  clips: [
    clip({ id: 'clip.a1-02.flores-rojas', lessonId: 'A1-02-C1', kind: 'phrase', family: 'bouquet', transcript: 'Unas flores rojas y muy bonitas.', translationUk: 'Якісь червоні й дуже гарні квіти.', targets: [LNP] }),
  ],
  materials: [
    material({
      id: 'material.a1-02.noun-phrase',
      topicId: 'A1-02',
      titleUk: 'Іменникова група: артикль, рід, число, прикметник, належність',
      blocks: [
        uk('Коротка довідка до блоку A1-02.'),
        tableUk(['Що', 'Правило', 'Приклад'], [
          ['рід', '-o — зазвичай чоловічий, -a — жіночий; -ción, -dad — жіночий; на -e і приголосну — запам’ятовуємо', 'el libro, la casa, la ciudad, el coche, la flor'],
          ['винятки', 'el día, el mapa, el problema, el idioma, el sofá; la mano, la foto, la moto, la radio', 'un día bonito, la mano pequeña'],
          ['артиклі', 'el / la, un / una; у множині los / las, unos / unas', 'unos amigos, las casas'],
          ['el чи un', 'un — нове, «якийсь»; el — відоме, «саме той»', 'una mochila… la mochila'],
          ['множина', 'голосна + -s, приголосна + -es, -z → -ces; наголос не переходить', 'cafés, hoteles, lápices, estaciones, jóvenes'],
          ['прикметник', 'після іменника; -o: 4 форми; -e і приголосна: рід не змінюється', 'una casa blanca, unos coches grandes'],
          ['muy', 'перед прикметником, не змінюється', 'muy bonita, muy grandes'],
          ['належність', 'mi, tu, su (+ -s); nuestro, vuestro за родом і числом; річ + de + власник', 'mis libros, nuestra casa, el libro de Ana'],
        ]),
        link('Потренувати іменник і артикль', NOUN_TARGETS, 'written', 10),
        link('Потренувати опис і належність', DESC_TARGETS, 'written', 10),
        link('Послухати короткі описи', [LNP], 'listening', 5),
      ],
      linkedTargets: [...NOUN_TARGETS, ...DESC_TARGETS.slice(0, 8), LNP],
    }),
  ],
};
