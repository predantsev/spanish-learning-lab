// A1-03-C1 — optional mixed check: practice links over the block's targets (held-out bank) plus new
// mixed-context transfer prompts that join that bank. No new teaching, no lock.
import { CI, clip, ex, link, material, tableUk, transcript, uk, ulUk } from '../lib.ts';
import type { Unit } from '../lib.ts';
import { pick, typed } from '../common.ts';

const SER_TARGETS = [
  'present.ser/written-form', 'pron.subject/written-form', 'pron.subject.plural/written-form', 'pron.subject-omission/construction-use',
  'writing.short-statement/construction-use', 'ser.identity/construction-use', 'ser.origin/construction-use', 'ser.nationality/construction-use',
  'adj.agreement.nationality/written-form', 'ser.profession/construction-use', 'ser.description/construction-use', 'formula.introduction/phrase-recall',
  'text.personal-data-form/written-form', 'ortho.accent-pair.tu/written-form', 'ortho.accent-pair.el/written-form',
];
const EHT_TARGETS = [
  'present.estar/written-form', 'prep.en.location/written-form', 'estar.location/construction-use', 'estar.state/construction-use',
  'hay.existence/construction-use', 'contrast.hay-estar/construction-use', 'present.tener/written-form', 'tener.possession/construction-use',
  'tener.physical-states/construction-use',
];
const QN_TARGETS = [
  'question.yes-no/construction-use', 'question.word-order/construction-use', 'ortho.interrogative-accent/written-form',
  'question.word.que/written-form', 'question.word.quien/written-form', 'question.word.donde/written-form', 'question.word.como/written-form',
  'neg.no-before-verb/construction-use',
];
const CHOICE_TARGETS = [
  'pron.tu-usted/context-choice', 'pron.vosotros-ustedes/context-choice', 'pron.person-mapping/context-choice', 'contrast.ser-estar/context-choice',
  'contrast.hay-estar/context-choice', 'ser.origin/context-choice', 'estar.state/context-choice', 'tener.physical-states/context-choice',
  'question.yes-no/reading-meaning', 'formula.introduction/reading-meaning', 'text.personal-data-form/reading-meaning',
];
const LISTEN_TARGETS = ['listening.short-sentences/listening-meaning', 'formula.introduction/listening-meaning'];

const OR_U = 'ser.origin/construction-use';
const NA_U = 'ser.nationality/construction-use';
const AN_W = 'adj.agreement.nationality/written-form';
const PR_U = 'ser.profession/construction-use';
const DS_U = 'ser.description/construction-use';
const ID_U = 'ser.identity/construction-use';
const EL_U = 'estar.location/construction-use';
const ST_U = 'estar.state/construction-use';
const HY_U = 'hay.existence/construction-use';
const HE_U = 'contrast.hay-estar/construction-use';
const TP_U = 'tener.possession/construction-use';
const PS_U = 'tener.physical-states/construction-use';
const YN_U = 'question.yes-no/construction-use';
const YN_W = 'question.yes-no/written-form';
const QC_W = 'question.word.como/written-form';
const WO_U = 'question.word-order/construction-use';
const NG_U = 'neg.no-before-verb/construction-use';
const LS_L = 'listening.short-sentences/listening-meaning';

const R: Record<string, string> = {
  [OR_U]: 'Звідки людина — ser de + місто чи країна: Soy de Kiev.',
  [NA_U]: 'Національність — ser + прикметник у роді й числі людини: Soy ucraniana.',
  [AN_W]: 'Національності на приголосну: español — española, inglés — inglesa, francés — francesa; у жіночому роді й множині знак наголосу зникає: ingleses, franceses.',
  [PR_U]: 'Професія після ser — без артикля: Pablo es médico.',
  [DS_U]: 'Ser + прикметник описує риси; прикметник узгоджується з підметом: Es alta y rubia.',
  [ID_U]: 'Хто це — ser: Es mi hermano. Son mis padres.',
  [EL_U]: 'Де знаходиться відома людина чи річ — estar en: Ana está en casa.',
  [ST_U]: 'Стан — estar + прикметник: Estoy enferma.',
  [HY_U]: 'Що десь є — hay (одна форма), після нього un/una або без артикля: En mi calle hay un parque.',
  [HE_U]: 'Hay — що десь є (нова річ); estar — де знаходиться відома річ: Mi hotel está en la plaza. En la plaza hay un restaurante.',
  [TP_U]: '«У мене є» — tengo: Tengo una hermana.',
  [PS_U]: '«Я голодна», «хочу пити» — tener + іменник, без estar: No tengo hambre. Tengo sed.',
  [YN_U]: 'Питання «так чи ні» — твердження між знаками ¿ ?: ¿Tienes bicicleta?',
  [YN_W]: 'Питання пишуть між знаками ¿ на початку і ? в кінці.',
  [QC_W]: 'Cómo — «як? який?», зі знаком наголосу: ¿Cómo es…?',
  [WO_U]: 'Питальне слово → дієслово → підмет: ¿Cómo es tu profesor?',
  [NG_U]: 'No стоїть безпосередньо перед дієсловом: No tengo hambre.',
};
const rulesOf = (targets: string[]): Array<[string[], string]> => targets.filter((t) => R[t]).map((t) => [[t], R[t] as string]);

export const unit: Unit = {
  lesson: {
    id: 'A1-03-C1',
    titleUk: 'Перевір себе: короткі речення з ser, estar, hay, tener',
    summaryUk: 'Необов’язкова перевірка блоку A1-03: нові завдання, у яких поєднуються ser, estar, hay і tener, питання й заперечення. Кожне вміння оцінюється окремо, допомога доступна, нічого не блокується.',
    objectives: ['A1-03-O1', 'A1-03-O2', 'A1-03-O3', 'A1-03-O4', 'A1-03-O5', 'A1-03-O6'],
    cv: ['CV-01', 'CV-03'],
    situations: ['greetings-introductions', 'people-family-home'],
    estimatedMinutes: 14,
    introduces: [],
    revisits: [
      'pron.subject', 'pron.subject.plural', 'pron.tu-usted', 'pron.vosotros-ustedes', 'present.ser', 'pron.person-mapping', 'pron.subject-omission',
      'ortho.accent-pair.tu', 'ortho.accent-pair.el', 'writing.short-statement', 'ser.identity', 'ser.origin', 'ser.nationality', 'adj.agreement.nationality',
      'ser.profession', 'ser.description', 'formula.introduction', 'text.personal-data-form', 'listening.short-sentences', 'present.estar', 'prep.en.location',
      'estar.location', 'estar.state', 'contrast.ser-estar', 'hay.existence', 'contrast.hay-estar', 'present.tener', 'tener.possession',
      'tener.physical-states', 'question.yes-no', 'question.word-order', 'ortho.interrogative-accent', 'question.word.que', 'question.word.quien',
      'question.word.donde', 'question.word.como', 'neg.no-before-verb',
    ],
    steps: [
      {
        kind: 'self-check',
        title: 'Ser: хто, звідки, яка людина',
        blocks: [
          uk('Ця перевірка необов’язкова й нічого не блокує. Завдання нові, без зразка; правило й підказку можна відкрити будь-коли — допомогу буде записано лише для того вміння, яке вона пояснює. Кожне вміння в завданні оцінюється окремо.'),
          link('Ser, займенники, знайомство', SER_TARGETS, 'written', 10),
        ],
      },
      { kind: 'self-check', title: 'Estar, hay, tener: де, що є, що маєш', blocks: [link('Де і як, що є, що маєш', EHT_TARGETS, 'written', 10)] },
      { kind: 'self-check', title: 'Питання й заперечення', blocks: [link('Питання та no', QN_TARGETS, 'written', 8)] },
      { kind: 'self-check', title: 'Вибір у контексті та слухання', blocks: [link('Ser чи estar, hay чи estar, tú чи usted; короткі речення на слух', [...CHOICE_TARGETS, ...LISTEN_TARGETS], 'mixed', 8)] },
      {
        kind: 'summary',
        title: 'Що далі',
        blocks: [
          ulUk(
            'Результат показується окремо для кожного вміння; відповіді, яких немає серед перевірених варіантів, не вважаються помилками.',
            'У блоці A1-04 до ser, estar, hay і tener додадуться дієслова дії й розповідь про день.',
          ),
        ],
      },
    ],
  },
  tasks: [
    typed({
      n: 1, role: 'transfer', family: 'c1-chat-intro', targets: [OR_U, NA_U],
      prompt: [uk('Ти (жінка) знайомишся в чаті. Напиши: «Я з Києва, я українка».')],
      answer: 'Soy de Kiev y soy ucraniana',
      also: ['Soy de Kiev, soy ucraniana.', 'Soy de Kiev. Soy ucraniana.', 'Yo soy de Kiev y soy ucraniana.', 'Soy de Kyiv y soy ucraniana.', 'Soy de Kyiv, soy ucraniana.', 'Soy de Kyiv. Soy ucraniana.', 'Soy ucraniana, de Kiev.', 'Soy ucraniana y soy de Kiev.'],
      errors: [
        ['Soy Kiev y soy ucraniana.', { [OR_U]: 'x', [NA_U]: 'c' }, 'Звідки людина — ser de: Soy de Kiev.'],
        ['Soy de Kiev y soy ucraniano.', { [NA_U]: 'x', [OR_U]: 'c' }, 'Пише жінка: ucraniana.'],
      ],
      rules: rulesOf([OR_U, NA_U]), why: 'Ser de + місто; національність у жіночому роді',
      extraHints: [{ kind: 'translation', targets: [], blocks: [ex('y', 'і, та')] }],
    }),
    typed({
      n: 2, role: 'transfer', family: 'c1-sick-note', targets: [EL_U, ST_U],
      prompt: [uk('Ти (жінка) пишеш колезі, чому тебе немає в офісі: «Я вдома, я хвора».')],
      answer: 'Estoy en casa y estoy enferma',
      also: ['Estoy en casa, estoy enferma.', 'Estoy en casa. Estoy enferma.', 'Estoy en casa porque estoy enferma.', 'Estoy enferma y estoy en casa.', 'Estoy enferma, estoy en casa.'],
      errors: [
        ['Soy en casa y estoy enferma.', { [EL_U]: 'x', [ST_U]: 'c' }, 'Де ти — estar: Estoy en casa.'],
        ['Estoy en casa y estoy enfermo.', { [ST_U]: 'x', [EL_U]: 'c' }, 'Пише жінка: enferma.'],
        ['Estoy en casa y soy enferma.', { [ST_U]: 'x', [EL_U]: 'c' }, 'Стан зараз — estar: estoy enferma.'],
      ],
      rules: rulesOf([EL_U, ST_U]), why: 'Estar для місця і стану',
    }),
    typed({
      n: 3, role: 'transfer', family: 'c1-street', targets: [HY_U, DS_U],
      prompt: [uk('Ти пишеш про свою вулицю два речення: «На моїй вулиці є парк. Парк дуже гарний».')],
      answer: 'En mi calle hay un parque. El parque es muy bonito.',
      also: ['Hay un parque en mi calle. El parque es muy bonito.', 'En mi calle hay un parque. Es muy bonito.', 'Hay un parque en mi calle. Es muy bonito.'],
      errors: [
        ['En mi calle está un parque. El parque es muy bonito.', { [HY_U]: 'x', [DS_U]: 'c' }, 'Що десь є — hay: hay un parque.'],
        ['En mi calle hay un parque. El parque es muy bonita.', { [DS_U]: 'x', [HY_U]: 'c' }, 'Parque — чоловічого роду: bonito.'],
        ['En mi calle hay un parque. El parque está muy bonito.', { [DS_U]: 'u', [HY_U]: 'c' }, 'Está bonito теж буває («гарно виглядає зараз»); щоб описати рису парку, кажемо es muy bonito.'],
      ],
      rules: rulesOf([HY_U, DS_U]), why: 'Hay + un; ser для опису',
    }),
    typed({
      n: 4, role: 'transfer', family: 'c1-family-profile', targets: [TP_U, DS_U],
      prompt: [uk('Ти пишеш про родину: «У мене є сестра. Вона висока й білява».')],
      answer: 'Tengo una hermana. Es alta y rubia.',
      also: ['Tengo una hermana. Ella es alta y rubia.', 'Tengo una hermana, es alta y rubia.', 'Tengo una hermana. Es rubia y alta.', 'Yo tengo una hermana. Es alta y rubia.'],
      errors: [
        ['Hay una hermana. Es alta y rubia.', { [TP_U]: 'x', [DS_U]: 'c' }, '«У мене є» — tengo.'],
        ['Tengo una hermana. Es alto y rubio.', { [DS_U]: 'x', [TP_U]: 'c' }, 'Про сестру — alta, rubia.'],
        ['Tengo una hermana. Está alta y rubia.', { [DS_U]: 'x', [TP_U]: 'c' }, 'Риси людини — ser: Es alta y rubia.'],
      ],
      rules: rulesOf([TP_U, DS_U]), why: 'Tengo + una; ser + прикметники',
    }),
    typed({
      n: 5, role: 'transfer', family: 'c1-visit-reply', targets: [NG_U, PS_U],
      prompt: [uk('У гостях тебе (жінку) питають: «¿Tienes hambre?». Відповідай: «Ні, я не голодна. Я хочу пити».')],
      answer: 'No, no tengo hambre. Tengo sed.',
      also: ['No, no tengo hambre, tengo sed.', 'No. No tengo hambre. Tengo sed.', 'No, no tengo hambre. Pero tengo sed.', 'No, no tengo hambre, pero tengo sed.'],
      errors: [
        ['No, tengo no hambre. Tengo sed.', { [NG_U]: 'x', [PS_U]: 'c' }, 'No стоїть перед дієсловом: no tengo.'],
        ['No, no estoy hambre. Tengo sed.', { [PS_U]: 'x', [NG_U]: 'c' }, 'У цьому виразі — tener: no tengo hambre.'],
      ],
      rules: rulesOf([NG_U, PS_U]), why: 'No + tengo; tener sed',
    }),
    typed({
      n: 6, role: 'transfer', family: 'c1-family-origin', targets: [PR_U, OR_U],
      prompt: [uk('Ти пишеш про тата: «Мій тато — лікар, він з Одеси».')],
      answer: 'Mi padre es médico y es de Odesa.',
      also: ['Mi padre es médico. Es de Odesa.', 'Mi padre es médico, es de Odesa.', 'Mi padre es médico y es de Odessa.', 'Mi padre es médico. Él es de Odesa.', 'Mi padre es médico y él es de Odesa.'],
      errors: [
        ['Mi padre es un médico y es de Odesa.', { [PR_U]: 'x', [OR_U]: 'c' }, 'Професія після ser — без артикля.'],
        ['Mi padre es médico y es Odesa.', { [OR_U]: 'x', [PR_U]: 'c' }, 'Звідки людина — ser de: es de Odesa.'],
      ],
      rules: rulesOf([PR_U, OR_U]), why: 'Ser + професія без артикля; ser de',
      extraHints: [{ kind: 'translation', targets: [], blocks: [ex('y', 'і, та')] }],
    }),
    typed({
      n: 7, role: 'transfer', family: 'c1-ask-friend', targets: [YN_U, YN_W], policy: CI,
      prompt: [uk('Ти хочеш покататися з подругою в парку. Спитай її: «У тебе є велосипед?»')],
      answer: '¿Tienes bicicleta?',
      also: ['¿Tienes una bicicleta?', '¿Tú tienes bicicleta?', '¿Tú tienes una bicicleta?'],
      errors: [
        ['Tienes bicicleta?', { [YN_W]: 'x', [YN_U]: 'c' }, 'На початку питання потрібен знак ¿.'],
        ['Tienes bicicleta.', { [YN_U]: 'x', [YN_W]: 'u' }, 'Це твердження; питання пишемо між знаками ¿ ?.'],
      ],
      rules: rulesOf([YN_U, YN_W]), why: 'Питання між ¿ ?',
    }),
    typed({
      n: 8, role: 'transfer', family: 'c1-ask-teacher', targets: [QC_W, WO_U],
      prompt: [uk('Подруга має нового викладача. Спитай її: «Який твій новий викладач?» (який він за вдачею)')],
      answer: '¿Cómo es tu profesor nuevo?',
      also: ['¿Cómo es tu nuevo profesor?'],
      errors: [
        ['¿Cómo tu profesor nuevo es?', { [WO_U]: 'x', [QC_W]: 'c' }, 'Після питального слова йде дієслово: ¿Cómo es tu profesor nuevo?'],
        ['¿Como es tu profesor nuevo?', { [QC_W]: 'x', [WO_U]: 'c' }, 'Cómo у питанні пишеться зі знаком наголосу.'],
        ['¿Cómo está tu profesor nuevo?', { [QC_W]: 'u', [WO_U]: 'c' }, 'Так питають про самопочуття; про вдачу — ¿Cómo es…?'],
      ],
      rules: rulesOf([QC_W, WO_U]), why: 'Cómo + es + підмет',
    }),
    typed({
      n: 9, role: 'transfer', family: 'c1-hotel-message', targets: [HE_U],
      prompt: [uk('Ти пишеш другові, як тебе знайти: «Мій готель на площі. На площі є ресторан».')],
      answer: 'Mi hotel está en la plaza. En la plaza hay un restaurante.',
      also: ['Mi hotel está en la plaza. Hay un restaurante en la plaza.', 'Mi hotel está en la plaza y en la plaza hay un restaurante.'],
      errors: [
        ['Mi hotel hay en la plaza. En la plaza hay un restaurante.', 'x', 'Мій готель — відомий: está.'],
        ['Mi hotel está en la plaza. En la plaza está un restaurante.', 'x', 'Що десь є — hay un restaurante.'],
      ],
      rules: rulesOf([HE_U]), why: 'Відоме — está; нове — hay',
    }),
    typed({
      n: 10, role: 'transfer', family: 'c1-caption', targets: [ID_U, EL_U],
      prompt: [uk('Ти підписуєш фото: «Це мої батьки. Вони в Іспанії».')],
      answer: 'Son mis padres. Están en España.',
      also: ['Estos son mis padres. Están en España.', 'Son mis padres y están en España.', 'Son mis padres. Ellos están en España.', 'Estos son mis padres y están en España.'],
      errors: [
        ['Son mis padres. Son en España.', { [EL_U]: 'x', [ID_U]: 'c' }, 'Де люди знаходяться — estar: Están en España.'],
        ['Es mis padres. Están en España.', { [ID_U]: 'x', [EL_U]: 'c' }, 'Про кількох — son: Son mis padres.'],
      ],
      rules: rulesOf([ID_U, EL_U]), why: 'Ser — хто це; estar — де',
    }),
    typed({
      n: 11, role: 'transfer', family: 'c1-friends-caption', targets: [NA_U, AN_W],
      prompt: [uk('Підпис під фото з друзями (група змішана): «Мої друзі — англійці й французи».')],
      answer: 'Mis amigos son ingleses y franceses.',
      also: ['Mis amigos son franceses e ingleses.'],
      errors: [
        ['Mis amigos son ingléses y franceses.', { [AN_W]: 'x', [NA_U]: 'c' }, 'У множині знак наголосу зникає: ingleses.'],
        ['Mis amigos son ingleses y francéses.', { [AN_W]: 'x', [NA_U]: 'c' }, 'У множині знак наголосу зникає: franceses.'],
        ['Mis amigos son inglesas y francesas.', { [AN_W]: 'x', [NA_U]: 'c' }, 'Група змішана — чоловічий рід: ingleses, franceses.'],
      ],
      rules: rulesOf([NA_U, AN_W]), why: 'Ser + національність у множині',
      extraHints: [{ kind: 'translation', targets: [], blocks: [ex('y', 'і, та')] }],
    }),
    pick({
      n: 12, role: 'transfer', family: 'c1-listen-neg', targets: [LS_L], clips: ['clip.a1-03.ana-no-esta'],
      prompt: [uk('Послухай. Де зараз Ана?')],
      options: [['у парку', 'c'], ['вдома', 'x', 'У записі no está en casa — «її немає вдома».'], ['в офісі', 'x', 'У записі está en el parque.']],
      rules: [[[LS_L], 'Послухай речення й визнач, що в ньому сказано. Зверни увагу на no перед дієсловом.']],
      extraHints: [transcript([LS_L], 'Ana no está en casa. Está en el parque.')],
      ok: 'Так: Ana no está en casa. Está en el parque.', bad: 'Ні. У записі: Ana no está en casa. Está en el parque.',
    }),
  ],
  clips: [
    clip({ id: 'clip.a1-03.ana-no-esta', lessonId: 'A1-03-C1', kind: 'sentence', family: 'negation-location', transcript: 'Ana no está en casa. Está en el parque.', translationUk: 'Ани немає вдома. Вона в парку.', targets: [LS_L] }),
  ],
  materials: [
    material({
      id: 'material.a1-03.short-sentences',
      topicId: 'A1-03',
      titleUk: 'Коротке речення: ser, estar, hay, tener, питання й заперечення',
      blocks: [
        uk('Коротка довідка до блоку A1-03.'),
        tableUk(['Що', 'Правило', 'Приклад'], [
          ['ser', 'хто це, звідки, національність, професія (без артикля), риси', 'Es mi hermano. Soy de Kiev. Soy ucraniana. Es médico. Es alta.'],
          ['estar', 'де знаходиться відома людина чи річ; стан', 'Ana está en casa. Estoy cansada. La tienda está cerrada.'],
          ['hay', 'що десь є; одна форма; після hay — un/una або без артикля', 'En mi calle hay una farmacia. No hay leche.'],
          ['tener', '«у мене є»; tener hambre / sed / frío / calor / sueño', 'Tengo un coche. Tengo frío.'],
          ['питання', '¿ ? для «так чи ні»; питальне слово (зі знаком наголосу) → дієслово → підмет', '¿Eres de Madrid? ¿De dónde es Ana?'],
          ['заперечення', 'no перед дієсловом; у відповіді: No, no…', 'No tengo coche. No, no soy profesora.'],
        ]),
        tableUk(['Особа', 'ser', 'estar', 'tener'], [
          ['yo', 'soy', 'estoy', 'tengo'],
          ['tú', 'eres', 'estás', 'tienes'],
          ['él / ella / usted', 'es', 'está', 'tiene'],
          ['nosotros / nosotras', 'somos', 'estamos', 'tenemos'],
          ['vosotros / vosotras', 'sois', 'estáis', 'tenéis'],
          ['ellos / ellas / ustedes', 'son', 'están', 'tienen'],
        ]),
        link('Потренувати ser', SER_TARGETS, 'written', 10),
        link('Потренувати estar, hay, tener', EHT_TARGETS, 'written', 10),
        link('Потренувати питання й заперечення', QN_TARGETS, 'written', 8),
        link('Послухати короткі речення', LISTEN_TARGETS, 'listening', 5),
      ],
      linkedTargets: [...SER_TARGETS, ...EHT_TARGETS, 'question.yes-no/construction-use', 'question.word-order/construction-use', 'ortho.interrogative-accent/written-form', 'neg.no-before-verb/construction-use', ...LISTEN_TARGETS],
    }),
  ],
};
