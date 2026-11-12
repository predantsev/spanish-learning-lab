// SYNTHETIC, UNREVIEWED test fixture (ACCEPTANCE §Automated fixtures). Not course content and not a
// production Spanish answer key: texts exist only to exercise the server. Targets:
// participle.hecho/written-form, perfecto.haber/written-form, perfecto.choice/context-choice,
// shop.more/listening-meaning — two prompt/context families each, clips A/B with distinct hashes,
// one supported task, one intentionally unresolved free-text task, one quarantined task.
/* eslint-disable */

export const NOTICE = 'SYNTHETIC test fixture — unreviewed, not teaching content, not a production answer key.';
const SYN = '(синтетичний тестовий приклад)';
const POLICY = { case: 'insensitive', terminalPunctuation: 'optional' } as const;

const t = (skillId: string, modality: string) => ({ skillId, modality });
const para = (language: 'uk' | 'es-ES', text: string) => ({ type: 'paragraph', language, text });
const src = [{ sourceId: 'S7', section: 'synthetic fixture anchor' }];

export interface SyntheticEntities {
  lessons: any[];
  tasks: any[];
  skills: any[];
  clips: any[];
  phrases: any[];
  collections: any[];
  materials: any[];
  situations: any[];
  lexemes: any[];
  sources: any[];
}

export function syntheticEntities(): SyntheticEntities {
  const skills = [
    {
      skillId: 'perfecto.haber', parentObjectives: ['A2-03-O1'], kind: 'form', modalities: ['written-form'],
      titleUk: `Форми haber у perfecto ${SYN}`, termEs: 'haber', scope: { forms: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'], noteUk: SYN },
      firstLesson: 'A2-03-L1', prerequisites: [], ruleUk: `Допоміжне дієслово haber + причастя ${SYN}`, assessed: true,
      returns: { practice: ['A2-03-L2'], check: ['A2-03-C1'], later: [] }, sources: src, reviewStatus: 'ready',
    },
    {
      skillId: 'perfecto.choice', parentObjectives: ['A2-03-O2'], kind: 'contrast', modalities: ['context-choice'],
      titleUk: `Вибір perfecto за контекстом ${SYN}`, termEs: 'pretérito perfecto', scope: { noteUk: SYN },
      firstLesson: 'A2-03-L1', prerequisites: ['perfecto.haber'], ruleUk: `Період, що триває (hoy, este año) ${SYN}`, assessed: true,
      returns: { practice: [], check: ['A2-03-C1'], later: [] }, sources: src, reviewStatus: 'ready',
    },
    {
      skillId: 'participle.hecho', parentObjectives: ['A2-03-O1'], kind: 'exception', modalities: ['written-form'],
      titleUk: `Неправильне причастя hecho ${SYN}`, termEs: 'hecho', scope: { forms: ['hecho'], exceptionOf: 'perfecto.haber', noteUk: SYN },
      firstLesson: 'A2-03-L2', prerequisites: ['perfecto.haber'], ruleUk: `hacer → hecho ${SYN}`, assessed: true,
      returns: { practice: [], check: ['A2-03-C1'], later: [] }, sources: src, reviewStatus: 'ready',
    },
    {
      skillId: 'phrase.shop-more', parentObjectives: ['A1-05-O1'], kind: 'phrase', modalities: ['phrase-recall'],
      titleUk: `Фрази «Хочу ще …» ${SYN}`, termEs: 'Quiero más …', scope: { noteUk: SYN },
      firstLesson: 'A1-05-L1', prerequisites: [], ruleUk: `Готова фраза для магазину ${SYN}`, assessed: true,
      returns: { practice: [], check: [], later: [] }, sources: src, reviewStatus: 'ready',
    },
    {
      skillId: 'shop.more', parentObjectives: ['A1-05-O1'], kind: 'listening', modalities: ['listening-meaning'],
      titleUk: `Почути «ще/більше» в магазині ${SYN}`, termEs: 'más', scope: { forms: ['más'], noteUk: SYN },
      firstLesson: 'A1-05-L1', prerequisites: [], ruleUk: `más — ще, більше ${SYN}`, assessed: true,
      returns: { practice: [], check: [], later: [] }, sources: src, reviewStatus: 'ready',
    },
  ];

  const hechoHints = [
    { kind: 'rule', targets: ['participle.hecho/written-form'], blocks: [para('uk', `hacer має неправильне причастя ${SYN}`)] },
    { kind: 'reveal', targets: ['participle.hecho/written-form'], blocks: [para('es-ES', 'hecho')] },
  ];
  const tasks = [
    // perfecto.haber/written-form — families f.daily (supported) and f.travel (independent), f.work (delayed)
    {
      id: 'A2-03-L1-T01', lessonId: 'A2-03-L1', role: 'supported', family: 'f.daily', mode: 'exact-variants',
      targets: [t('perfecto.haber', 'written-form')], prompt: [para('uk', `Допишіть форму ${SYN}`), para('es-ES', 'Hoy (yo) ___ comido paella.')],
      input: 'short', accepted: [{ id: 'v1', text: 'he' }], errors: [{ id: 'e1', text: 'ha', outcomes: { 'perfecto.haber/written-form': 'incorrect' }, feedbackUk: `Особа: yo → he ${SYN}` }],
      closed: true, policy: POLICY,
      hints: [{ kind: 'rule', targets: ['perfecto.haber/written-form'], blocks: [para('uk', `yo → he ${SYN}`)] }, { kind: 'reveal', targets: ['perfecto.haber/written-form'], blocks: [para('es-ES', 'he')] }],
      referenceAnswer: 'he', feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    {
      id: 'A2-03-L1-T02', lessonId: 'A2-03-L1', role: 'independent', family: 'f.travel', mode: 'exact-variants',
      targets: [t('perfecto.haber', 'written-form')], prompt: [para('es-ES', 'Este año (nosotros) ___ viajado a Sevilla.')],
      input: 'short', accepted: [{ id: 'v1', text: 'hemos' }], closed: true, policy: POLICY,
      hints: [
        { kind: 'targeted-clue', targets: ['perfecto.haber/written-form'], blocks: [para('uk', `nosotros ${SYN}`)] },
        // Untargeted vocabulary gloss: supports no assessed target, so it never affects evidence.
        { kind: 'translation', targets: [], blocks: [para('uk', `Sevilla — Севілья ${SYN}`)] },
      ],
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    {
      id: 'A2-03-L1-T05', lessonId: 'A2-03-L1', role: 'delayed', family: 'f.work', mode: 'exact-variants',
      targets: [t('perfecto.haber', 'written-form')], prompt: [para('es-ES', 'Esta semana (ellos) ___ trabajado mucho.')],
      input: 'short', accepted: [{ id: 'v1', text: 'han' }], closed: true, policy: POLICY,
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    // perfecto.choice/context-choice — families f.daily and f.experience
    {
      id: 'A2-03-L1-T03', lessonId: 'A2-03-L1', role: 'independent', family: 'f.daily', mode: 'choice',
      targets: [t('perfecto.choice', 'context-choice')], prompt: [para('uk', `Оберіть форму ${SYN}`), para('es-ES', 'Esta mañana ___ un café.')],
      input: 'options',
      options: [
        { id: 'a', label: 'he tomado', outcomes: { 'perfecto.choice/context-choice': 'correct' } },
        { id: 'b', label: 'tomaré', outcomes: { 'perfecto.choice/context-choice': 'incorrect' }, feedbackUk: `Майбутній час ${SYN}` },
      ],
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    {
      id: 'A2-03-L1-T04', lessonId: 'A2-03-L1', role: 'delayed', family: 'f.experience', mode: 'choice',
      targets: [t('perfecto.choice', 'context-choice')], prompt: [para('es-ES', '¿Alguna vez ___ en Madrid?')],
      input: 'options',
      options: [
        { id: 'a', label: 'has estado', outcomes: { 'perfecto.choice/context-choice': 'correct' } },
        { id: 'b', label: 'estarás', outcomes: { 'perfecto.choice/context-choice': 'incorrect' } },
      ],
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    // participle.hecho/written-form — families f.home (supported), f.office (independent), f.party (delayed)
    {
      id: 'A2-03-L2-T01', lessonId: 'A2-03-L2', role: 'supported', family: 'f.home', mode: 'exact-variants',
      targets: [t('participle.hecho', 'written-form')], prompt: [para('uk', `Причастя від hacer ${SYN}`), para('es-ES', '¿Qué has ___ hoy?')],
      input: 'short', accepted: [{ id: 'v1', text: 'hecho' }],
      errors: [{ id: 'e.hacido', text: 'hacido', outcomes: { 'participle.hecho/written-form': 'incorrect' }, feedbackUk: `hacer має неправильне причастя ${SYN}` }],
      closed: true, policy: POLICY, hints: hechoHints, referenceAnswer: 'hecho',
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    {
      id: 'A2-03-L2-T02', lessonId: 'A2-03-L2', role: 'independent', family: 'f.office', mode: 'exact-variants',
      targets: [t('participle.hecho', 'written-form')], prompt: [para('es-ES', 'Ya he ___ los deberes.')],
      input: 'short', accepted: [{ id: 'v1', text: 'hecho' }], closed: true, policy: POLICY, hints: hechoHints,
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    {
      id: 'A2-03-L2-T03', lessonId: 'A2-03-L2', role: 'delayed', family: 'f.party', mode: 'exact-variants',
      targets: [t('participle.hecho', 'written-form')], prompt: [para('es-ES', 'Hemos ___ una tarta.')],
      input: 'short', accepted: [{ id: 'v1', text: 'hecho' }], closed: true, policy: POLICY,
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    // intentionally unresolved free-text task (rubric-review)
    {
      id: 'A2-03-L2-T04', lessonId: 'A2-03-L2', role: 'transfer', family: 'f.message', mode: 'rubric-review',
      targets: [t('participle.hecho', 'written-form')], prompt: [para('uk', `Напишіть речення про те, що ви зробили сьогодні ${SYN}`)],
      input: 'multiline', policy: POLICY,
      rubric: { criteriaUk: [`Використано hecho ${SYN}`], exemplars: [{ id: 'x1', text: 'Hoy he hecho la compra.' }] },
      referenceAnswer: 'Hoy he hecho la compra.',
      feedback: { correctUk: `Збігається зі зразком ${SYN}`, incorrectUk: `Ще раз ${SYN}`, unresolvedUk: `Відповідь потребує перевірки ${SYN}` }, reviewStatus: 'ready',
    },
    // quarantined task (disputed key)
    {
      id: 'A2-03-L2-T05', lessonId: 'A2-03-L2', role: 'independent', family: 'f.broken', mode: 'exact-variants',
      targets: [t('participle.hecho', 'written-form')], prompt: [para('es-ES', 'Han ___ la cama.')],
      input: 'short', accepted: [{ id: 'v1', text: 'hecho' }], closed: true, policy: POLICY,
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'quarantined',
    },
    // shop.more/listening-meaning — clips A/B
    {
      id: 'A1-05-L1-T01', lessonId: 'A1-05-L1', role: 'independent', family: 'f.shop-a', mode: 'choice',
      targets: [t('shop.more', 'listening-meaning')], prompt: [para('uk', `Послухайте. Що хоче покупець? ${SYN}`)], input: 'options', clipIds: ['clip.shop.more.a'],
      options: [
        { id: 'a', label: 'Ще хліба', outcomes: { 'shop.more/listening-meaning': 'correct' } },
        { id: 'b', label: 'Менше хліба', outcomes: { 'shop.more/listening-meaning': 'incorrect' } },
      ],
      hints: [
        { kind: 'transcript', targets: ['shop.more/listening-meaning'], blocks: [para('es-ES', 'Quiero más pan, por favor.')] },
        { kind: 'translation', targets: ['shop.more/listening-meaning'], blocks: [para('uk', `Я хочу ще хліба, будь ласка ${SYN}`)] },
      ],
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    {
      id: 'A1-05-L1-T02', lessonId: 'A1-05-L1', role: 'delayed', family: 'f.shop-b', mode: 'choice',
      targets: [t('shop.more', 'listening-meaning')], prompt: [para('uk', `Послухайте ще раз ${SYN}`)], input: 'options', clipIds: ['clip.shop.more.b'],
      options: [
        { id: 'a', label: 'Ще сиру', outcomes: { 'shop.more/listening-meaning': 'correct' } },
        { id: 'b', label: 'Без сиру', outcomes: { 'shop.more/listening-meaning': 'incorrect' } },
      ],
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    // phrase-recall/written: exact recall of a course phrase from its Ukrainian meaning
    {
      id: 'A1-05-L1-T03', lessonId: 'A1-05-L1', role: 'independent', family: 'f.phrase-recall', mode: 'exact-variants',
      targets: [t('phrase.shop-more', 'phrase-recall')], prompt: [para('uk', `Як сказати іспанською: «Я хочу ще хліба» ${SYN}`)],
      input: 'short', accepted: [{ id: 'v1', text: 'Quiero más pan.' }], closed: true, policy: POLICY,
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
    {
      id: 'A2-03-C1-T01', lessonId: 'A2-03-C1', role: 'delayed', family: 'f.check', mode: 'choice',
      targets: [t('perfecto.choice', 'context-choice')], prompt: [para('es-ES', 'Hoy ___ mucho.')], input: 'options',
      options: [
        { id: 'a', label: 'he trabajado', outcomes: { 'perfecto.choice/context-choice': 'correct' } },
        { id: 'b', label: 'trabajaré', outcomes: { 'perfecto.choice/context-choice': 'incorrect' } },
      ],
      feedback: { correctUk: `Правильно ${SYN}`, incorrectUk: `Ще раз ${SYN}` }, reviewStatus: 'ready',
    },
  ];

  const lessons = [
    {
      schemaVersion: 1, id: 'A1-05-L1', kind: 'lesson', blockId: 'A1-05', titleUk: `У магазині: «ще» ${SYN}`, termEs: 'más',
      summaryUk: `Синтетичний урок аудіювання ${SYN}`, objectives: ['A1-05-O1'], situations: ['shop'], estimatedMinutes: 6,
      introduces: ['shop.more'], revisits: [],
      steps: [
        { id: 's1', kind: 'explanation', titleUk: `Пояснення ${SYN}`, required: true, blocks: [para('uk', `más означає «ще» ${SYN}`)] },
        { id: 's2', kind: 'listening', titleUk: `Слухання ${SYN}`, required: true, clipIds: ['clip.shop.more.a'], taskIds: ['A1-05-L1-T01'] },
      ],
      reviewStatus: 'ready',
    },
    {
      schemaVersion: 1, id: 'A2-03-L1', kind: 'lesson', blockId: 'A2-03', titleUk: `Perfecto: haber ${SYN}`, termEs: 'pretérito perfecto',
      summaryUk: `Синтетичний урок perfecto ${SYN}`, objectives: ['A2-03-O1', 'A2-03-O2'], situations: ['everyday'], estimatedMinutes: 10,
      introduces: ['perfecto.haber', 'perfecto.choice'], revisits: [],
      steps: [
        { id: 's1', kind: 'explanation', titleUk: `Пояснення ${SYN}`, required: true, blocks: [para('uk', `haber + причастя ${SYN}`), { type: 'example', spanish: 'He comido.', ukrainian: `Я поїв ${SYN}` }] },
        { id: 's2', kind: 'supported-practice', titleUk: `З підтримкою ${SYN}`, required: true, taskIds: ['A2-03-L1-T01'] },
        { id: 's3', kind: 'independent-practice', titleUk: `Самостійно ${SYN}`, required: true, taskIds: ['A2-03-L1-T02', 'A2-03-L1-T03'] },
        { id: 's4', kind: 'summary', titleUk: `Підсумок ${SYN}`, required: false, blocks: [para('uk', `Підсумок ${SYN}`)] },
      ],
      reviewStatus: 'ready',
    },
    {
      schemaVersion: 1, id: 'A2-03-L2', kind: 'lesson', blockId: 'A2-03', titleUk: `Причастя hecho ${SYN}`, termEs: 'hecho',
      summaryUk: `Синтетичний урок hecho ${SYN}`, objectives: ['A2-03-O1'], situations: ['everyday'], estimatedMinutes: 10,
      introduces: ['participle.hecho'], revisits: ['perfecto.haber'],
      steps: [
        { id: 's1', kind: 'explanation', titleUk: `Пояснення ${SYN}`, required: true, blocks: [para('uk', `hacer → hecho ${SYN}`)] },
        { id: 's2', kind: 'supported-practice', titleUk: `З підтримкою ${SYN}`, required: true, taskIds: ['A2-03-L2-T01'] },
        { id: 's3', kind: 'independent-practice', titleUk: `Самостійно ${SYN}`, required: true, taskIds: ['A2-03-L2-T02', 'A2-03-L2-T05'] },
        { id: 's4', kind: 'writing', titleUk: `Письмо ${SYN}`, required: false, taskIds: ['A2-03-L2-T04'] },
      ],
      reviewStatus: 'ready',
    },
    {
      schemaVersion: 1, id: 'A2-03-C1', kind: 'optional-check', blockId: 'A2-03', titleUk: `Необов'язкова перевірка ${SYN}`,
      summaryUk: `Синтетична перевірка ${SYN}`, objectives: ['A2-03-O2'], situations: [], estimatedMinutes: 5,
      introduces: [], revisits: ['perfecto.choice'],
      steps: [
        { id: 's1', kind: 'self-check', titleUk: `Перевірка ${SYN}`, required: false, taskIds: ['A2-03-C1-T01'] },
        { id: 's2', kind: 'summary', titleUk: `Підсумок ${SYN}`, required: false, blocks: [para('uk', `Готово ${SYN}`)] },
      ],
      reviewStatus: 'ready',
    },
  ];

  const clips = [
    { id: 'clip.shop.more.a', lessonId: 'A1-05-L1', kind: 'sentence', transcript: 'Quiero más pan, por favor.', translationUk: `Я хочу ще хліба ${SYN}`, targets: [t('shop.more', 'listening-meaning')], family: 'f.shop-a', reviewStatus: 'ready' },
    { id: 'clip.shop.more.b', lessonId: 'A1-05-L1', kind: 'sentence', transcript: '¿Me pone un poco más de queso?', translationUk: `Дайте ще трохи сиру ${SYN}`, targets: [t('shop.more', 'listening-meaning')], family: 'f.shop-b', reviewStatus: 'ready' },
  ];

  const phraseWords = ['pan', 'queso', 'agua', 'café', 'leche', 'fruta', 'vino', 'aceite', 'arroz', 'sal', 'té', 'zumo'];
  const phrases = phraseWords.map((w, i) => ({
    id: `phrase.mas-${['pan', 'queso', 'agua', 'cafe', 'leche', 'fruta', 'vino', 'aceite', 'arroz', 'sal', 'te', 'zumo'][i]}`,
    spanish: `Quiero más ${w}.`,
    ukrainian: `Я хочу ще (${w}) ${SYN}`,
    firstLesson: 'A1-05-L1',
    skills: i < 2 ? ['shop.more', 'phrase.shop-more'] : ['shop.more'],
    situations: ['shop'],
    recall: { accepted: [{ id: 'v1', text: `Quiero más ${w}.` }], policy: POLICY },
    variationTaskIds: i === 0 ? ['A1-05-L1-T01'] : [],
    reviewStatus: 'ready',
  }));

  const collections = [
    { id: 'collection.shop', titleUk: `У магазині ${SYN}`, descriptionUk: `Дванадцять синтетичних фраз ${SYN}`, phraseIds: phrases.map((p) => p.id), reviewStatus: 'ready' },
  ];

  const materials = [
    {
      id: 'material.perfecto-table', topicId: 'A2-03', titleUk: `Таблиця haber ${SYN}`,
      blocks: [para('uk', `Форми haber ${SYN}`), { type: 'table', language: 'es-ES', columns: ['persona', 'haber'], rows: [['yo', 'he'], ['tú', 'has'], ['nosotros', 'hemos']] }],
      linkedTargets: ['perfecto.haber/written-form'], reviewStatus: 'ready',
    },
    {
      id: 'material.hecho-note', topicId: 'A2-03-L2', titleUk: `Примітка про hecho ${SYN}`,
      blocks: [para('uk', `hacer → hecho ${SYN}`), { type: 'practice-link', labelUk: `Потренувати hecho ${SYN}`, targets: [t('participle.hecho', 'written-form')], mode: 'written', maxItems: 5 }],
      linkedTargets: ['participle.hecho/written-form'], reviewStatus: 'ready',
    },
  ];

  const situations = [
    { id: 'shop', titleUk: `Магазин ${SYN}`, firstLessons: ['A1-05-L1'] },
    { id: 'everyday', titleUk: `Щоденні справи ${SYN}`, firstLessons: ['A2-03-L1'] },
  ];
  const lexemes = [{ id: 'lex.pan', lemma: 'pan', pos: 'noun', gender: 'm', meaningUk: `хліб ${SYN}`, firstLesson: 'A1-05-L1' }];
  const sources = [{ id: 'S7', title: 'RAE/ASALE, El buen uso del español: Conjugación española', url: 'https://www.rae.es/buen-uso-espa%C3%B1ol/conjugaci%C3%B3n-espa%C3%B1ola', useNote: 'Synthetic fixture anchor only.' }];

  return { lessons, tasks, skills, clips, phrases, collections, materials, situations, lexemes, sources };
}

export const BLOCK_TITLES = [
  { id: 'A1-05', titleUk: `Конкретна інформація ${SYN}`, termEs: 'información concreta', summaryUk: `Синтетичний блок ${SYN}`, reviewStatus: 'ready' },
  { id: 'A2-03', titleUk: `Pretérito perfecto compuesto ${SYN}`, termEs: 'pretérito perfecto compuesto', summaryUk: `Синтетичний блок ${SYN}`, reviewStatus: 'ready' },
];
