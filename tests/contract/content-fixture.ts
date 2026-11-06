// Synthetic content corpus + mini ledger for content-tool tests. SYNTHETIC, UNREVIEWED: these
// texts are test data only, never course material or production Spanish keys (ACCEPTANCE fixtures).
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export type Json = any; // test data is mutated freely before being written

export interface Fixture {
  ledger: Json;
  files: Record<string, Json>;
}

const H = 'participle.hecho/written-form';
const CHOICE = 'perfecto.choice/context-choice';
const SHOP = 'shop.more/listening-meaning';

const ukPara = (text: string): Json => ({ type: 'paragraph', language: 'uk', text });
const esPara = (text: string): Json => ({ type: 'paragraph', language: 'es-ES', text });

function hechoExact(n: number, role: string, family: string): Json {
  return {
    id: `A1-01-L1-T${String(n).padStart(2, '0')}`,
    lessonId: 'A1-01-L1',
    role,
    family,
    mode: 'exact-variants',
    targets: [{ skillId: 'participle.hecho', modality: 'written-form' }],
    prompt: [ukPara(`Синтетичне завдання ${n}: напишіть дієприкметник дієслова hacer.`), esPara('Hoy he ___ la cena.')],
    input: 'short',
    accepted: [{ id: 'v1', text: 'hecho' }],
    errors: [{ id: 'e1', text: 'hacido', outcomes: { [H]: 'incorrect' }, feedbackUk: 'Синтетичний відгук: форма hacer неправильна.' }],
    closed: true,
    policy: { case: 'sensitive', terminalPunctuation: 'optional' },
    hints: [{ kind: 'rule', targets: [H], blocks: [ukPara('Синтетична підказка: hacer має неправильний дієприкметник.')] }],
    feedback: { correctUk: 'Синтетично: правильно.', incorrectUk: 'Синтетично: неправильно.' },
    reviewStatus: 'draft',
  };
}

function hechoSlots(n: number, role: string, family: string): Json {
  return {
    id: `A1-01-L1-T${String(n).padStart(2, '0')}`,
    lessonId: 'A1-01-L1',
    role,
    family,
    mode: 'finite-slots',
    targets: [{ skillId: 'participle.hecho', modality: 'written-form' }],
    prompt: [ukPara(`Синтетичне завдання ${n}: доповніть речення.`), esPara('Esta semana he ___ muchas cosas.')],
    input: 'short',
    policy: { case: 'sensitive', terminalPunctuation: 'optional' },
    template: ['Esta semana he ', { slot: 'part' }, ' muchas cosas.'],
    slots: [{ id: 'part', target: H, accepted: ['hecho'], errors: [{ text: 'hacido', feedbackUk: 'Синтетично: це неправильна форма.' }], closed: false }],
    feedback: { correctUk: 'Синтетично: правильно.', incorrectUk: 'Синтетично: неправильно.', unresolvedUk: 'Синтетично: відповідь не вдалося перевірити.' },
    reviewStatus: 'draft',
  };
}

function choiceTask(id: string, lessonId: string, role: string, family: string): Json {
  return {
    id,
    lessonId,
    role,
    family,
    mode: 'choice',
    targets: [{ skillId: 'perfecto.choice', modality: 'context-choice' }],
    prompt: [ukPara('Синтетичне завдання: оберіть форму для контексту «сьогодні».'), esPara('Hoy ___ la cena.')],
    input: 'options',
    options: [
      { id: 'a', label: 'he hecho', outcomes: { [CHOICE]: 'correct' } },
      { id: 'b', label: 'hice', outcomes: { [CHOICE]: 'incorrect' }, feedbackUk: 'Синтетично: у цьому контексті очікується perfecto.' },
    ],
    feedback: { correctUk: 'Синтетично: правильно.', incorrectUk: 'Синтетично: неправильно.' },
    reviewStatus: 'draft',
  };
}

function listeningTask(id: string, clipId: string, family: string): Json {
  return {
    id,
    lessonId: 'A1-01-L2',
    role: 'independent',
    family,
    mode: 'choice',
    targets: [{ skillId: 'shop.more', modality: 'listening-meaning' }],
    prompt: [ukPara('Синтетичне аудіозавдання: що питає продавець?')],
    input: 'options',
    clipIds: [clipId],
    options: [
      { id: 'a', label: 'Чи потрібно ще щось', outcomes: { [SHOP]: 'correct' } },
      { id: 'b', label: 'Скільки це коштує', outcomes: { [SHOP]: 'incorrect' } },
    ],
    hints: [{ kind: 'transcript', targets: [SHOP], blocks: [esPara('¿Algo más?')] }],
    feedback: { correctUk: 'Синтетично: правильно.', incorrectUk: 'Синтетично: неправильно.' },
    reviewStatus: 'draft',
  };
}

function skill(skillId: string, extra: Json): Json {
  return {
    skillId,
    parentObjectives: ['A1-01-O1'],
    kind: 'form',
    modalities: ['written-form'],
    titleUk: `Синтетична навичка ${skillId}`,
    scope: { noteUk: 'Синтетичний обсяг для тесту.' },
    firstLesson: 'A1-01-L1',
    prerequisites: [],
    ruleUk: 'Синтетичне правило для тесту.',
    assessed: true,
    returns: { practice: ['A1-01-L2'], check: ['A1-01-C1'], later: [] },
    sources: [{ sourceId: 'S1', section: 'synthetic 1.1' }],
    reviewStatus: 'draft',
    ...extra,
  };
}

const PHRASES: Array<[string, string]> = [
  ['Hola.', 'Привіт.'],
  ['Buenos días.', 'Доброго ранку.'],
  ['Gracias.', 'Дякую.'],
  ['Por favor.', 'Будь ласка.'],
  ['¿Algo más?', 'Щось іще?'],
  ['Nada más, gracias.', 'Більше нічого, дякую.'],
  ['Hasta luego.', 'До побачення.'],
  ['Perdón.', 'Перепрошую.'],
  ['Un café, por favor.', 'Каву, будь ласка.'],
  ['¿Cuánto es?', 'Скільки це коштує?'],
  ['Aquí tiene.', 'Ось, будь ласка.'],
  ['Adiós.', 'Бувайте.'],
];

export function makeFixture(): Fixture {
  const ledger = {
    schemaVersion: 1,
    source: 'synthetic',
    notice: 'SYNTHETIC test ledger',
    counts: { objective: 2, lesson: 2, 'optional-check': 1 },
    supportingAllocations: ['CV-01'],
    rows: [
      { id: 'A1-01-O1', kind: 'objective', blockId: 'A1-01', description: 'synthetic' },
      { id: 'A1-01-O2', kind: 'objective', blockId: 'A1-01', description: 'synthetic' },
      { id: 'A1-01-L1', kind: 'lesson', blockId: 'A1-01', description: 'synthetic' },
      { id: 'A1-01-L2', kind: 'lesson', blockId: 'A1-01', description: 'synthetic' },
      { id: 'A1-01-C1', kind: 'optional-check', blockId: 'A1-01', description: 'synthetic' },
    ],
  };

  const l1Tasks = [
    hechoExact(1, 'supported', 'fam.home'),
    hechoExact(2, 'supported', 'fam.home'),
    hechoExact(3, 'independent', 'fam.home'),
    hechoExact(4, 'independent', 'fam.home'),
    hechoSlots(5, 'independent', 'fam.work'),
    hechoSlots(6, 'independent', 'fam.work'),
    hechoExact(7, 'delayed', 'fam.home'),
    hechoSlots(8, 'delayed', 'fam.work'),
    hechoExact(9, 'transfer', 'fam.travel'),
    hechoSlots(10, 'transfer', 'fam.travel'),
  ];

  const files: Record<string, Json> = {
    'sources.json': {
      schemaVersion: 1,
      sources: [{ id: 'S1', title: 'Synthetic source', url: 'https://example.invalid/synthetic', useNote: 'Synthetic test anchor.' }],
    },
    'situations.json': {
      schemaVersion: 1,
      situations: [{ id: 'greetings', titleUk: 'Синтетичні привітання', firstLessons: ['A1-01-L1'] }],
    },
    'skills/A1-01.json': {
      schemaVersion: 1,
      blockId: 'A1-01',
      skills: [
        skill('participle.hecho', { cv: ['CV-01'], scope: { forms: ['hecho'], noteUk: 'Синтетично: лише форма hecho.' } }),
        skill('perfecto.choice', {
          parentObjectives: ['A1-01-O2'],
          kind: 'contrast',
          modalities: ['context-choice'],
          firstLesson: 'A1-01-L2',
          prerequisites: ['participle.hecho'],
          returns: { practice: [], check: ['A1-01-C1'], later: [] },
        }),
        skill('shop.more', {
          parentObjectives: ['A1-01-O2'],
          kind: 'function',
          modalities: ['listening-meaning'],
          firstLesson: 'A1-01-L2',
          returns: { practice: [], check: [], later: [] },
        }),
      ],
    },
    'lexicon/A1-01.json': {
      schemaVersion: 1,
      blockId: 'A1-01',
      items: [{ id: 'lex.hacer', lemma: 'hacer', pos: 'verb', meaningUk: 'робити', firstLesson: 'A1-01-L1' }],
    },
    'lessons/A1-01-L1.json': {
      schemaVersion: 1,
      id: 'A1-01-L1',
      kind: 'lesson',
      blockId: 'A1-01',
      titleUk: 'Синтетичний урок 1',
      summaryUk: 'Синтетичний підсумок уроку.',
      objectives: ['A1-01-O1'],
      cv: ['CV-01'],
      situations: ['greetings'],
      estimatedMinutes: 10,
      introduces: ['participle.hecho'],
      revisits: [],
      steps: [
        { id: 's1', kind: 'explanation', titleUk: 'Пояснення', required: true, blocks: [ukPara('Синтетичне пояснення.'), { type: 'example', spanish: 'He hecho la cena.', ukrainian: 'Я приготував вечерю.' }] },
        { id: 's2', kind: 'supported-practice', titleUk: 'Практика з підтримкою', required: true, taskIds: ['A1-01-L1-T01', 'A1-01-L1-T02'] },
        { id: 's3', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: ['A1-01-L1-T03', 'A1-01-L1-T04', 'A1-01-L1-T05', 'A1-01-L1-T06'] },
      ],
      reviewStatus: 'draft',
    },
    'lessons/A1-01-L2.json': {
      schemaVersion: 1,
      id: 'A1-01-L2',
      kind: 'lesson',
      blockId: 'A1-01',
      titleUk: 'Синтетичний урок 2',
      summaryUk: 'Синтетичний підсумок уроку.',
      objectives: ['A1-01-O2'],
      situations: [],
      estimatedMinutes: 12,
      introduces: ['perfecto.choice', 'shop.more'],
      revisits: ['participle.hecho'],
      steps: [
        { id: 's1', kind: 'explanation', titleUk: 'Пояснення', required: true, blocks: [ukPara('Синтетичне пояснення вибору.')] },
        { id: 's2', kind: 'supported-practice', titleUk: 'Практика', required: true, taskIds: ['A1-01-L2-T01', 'A1-01-L2-T02'] },
        { id: 's3', kind: 'listening', titleUk: 'Аудіювання', required: false, clipIds: ['clip.shop-more-a', 'clip.shop-more-b'], taskIds: ['A1-01-L2-T03', 'A1-01-L2-T04'] },
      ],
      reviewStatus: 'draft',
    },
    'lessons/A1-01-C1.json': {
      schemaVersion: 1,
      id: 'A1-01-C1',
      kind: 'optional-check',
      blockId: 'A1-01',
      titleUk: 'Синтетична перевірка',
      summaryUk: 'Синтетична необовʼязкова перевірка.',
      objectives: ['A1-01-O1', 'A1-01-O2'],
      situations: [],
      estimatedMinutes: 5,
      introduces: [],
      revisits: ['participle.hecho', 'perfecto.choice'],
      steps: [
        { id: 's1', kind: 'explanation', titleUk: 'Вступ', required: false, blocks: [ukPara('Синтетична перевірка без підказок.')] },
        { id: 's2', kind: 'self-check', titleUk: 'Перевірка', required: false, taskIds: ['A1-01-C1-T01'] },
      ],
      reviewStatus: 'draft',
    },
    'tasks/A1-01-L1.json': { schemaVersion: 1, lessonId: 'A1-01-L1', tasks: l1Tasks },
    'tasks/A1-01-L2.json': {
      schemaVersion: 1,
      lessonId: 'A1-01-L2',
      tasks: [
        choiceTask('A1-01-L2-T01', 'A1-01-L2', 'supported', 'fam.home'),
        choiceTask('A1-01-L2-T02', 'A1-01-L2', 'supported', 'fam.work'),
        listeningTask('A1-01-L2-T03', 'clip.shop-more-a', 'fam.shop-a'),
        listeningTask('A1-01-L2-T04', 'clip.shop-more-b', 'fam.shop-b'),
      ],
    },
    'tasks/A1-01-C1.json': {
      schemaVersion: 1,
      lessonId: 'A1-01-C1',
      tasks: [choiceTask('A1-01-C1-T01', 'A1-01-C1', 'independent', 'fam.check')],
    },
    'audio/A1-01.json': {
      schemaVersion: 1,
      blockId: 'A1-01',
      clips: [
        { id: 'clip.shop-more-a', lessonId: 'A1-01-L2', kind: 'sentence', transcript: '¿Algo más?', translationUk: 'Щось іще?', targets: [{ skillId: 'shop.more', modality: 'listening-meaning' }], family: 'fam.shop-a', reviewStatus: 'draft' },
        { id: 'clip.shop-more-b', lessonId: 'A1-01-L2', kind: 'sentence', transcript: '¿Quiere algo más?', translationUk: 'Бажаєте ще щось?', targets: [{ skillId: 'shop.more', modality: 'listening-meaning' }], family: 'fam.shop-b', reviewStatus: 'draft' },
      ],
    },
    'phrases.json': {
      schemaVersion: 1,
      phrases: PHRASES.map(([es, uk], i) => ({
        id: `phrase.p${String(i + 1).padStart(2, '0')}`,
        spanish: es,
        ukrainian: uk,
        firstLesson: 'A1-01-L2',
        skills: ['shop.more'],
        situations: ['greetings'],
        recall: { accepted: [{ id: 'r1', text: es }], policy: { case: 'insensitive', terminalPunctuation: 'optional' } },
        reviewStatus: 'draft',
      })),
    },
    'collections.json': {
      schemaVersion: 1,
      collections: Array.from({ length: 8 }, (_, i) => ({
        id: `collection.c${i + 1}`,
        titleUk: `Синтетична збірка ${i + 1}`,
        descriptionUk: 'Синтетична збірка для тесту.',
        phraseIds: PHRASES.map((_p, j) => `phrase.p${String(j + 1).padStart(2, '0')}`),
        reviewStatus: 'draft',
      })),
    },
    'materials/A1-01.json': {
      schemaVersion: 1,
      blockId: 'A1-01',
      materials: [
        {
          id: 'material.hecho-table',
          topicId: 'A1-01-L1',
          titleUk: 'Синтетична таблиця',
          blocks: [{ type: 'table', language: 'es-ES', columns: ['infinitivo', 'participio'], rows: [['hacer', 'hecho']] }],
          linkedTargets: [H],
          reviewStatus: 'draft',
        },
      ],
    },
  };
  return { ledger, files };
}

export interface WrittenFixture {
  root: string;
  sourceDir: string;
  ledgerPath: string;
  reviewsDir: string;
}

export function writeFixture(fixture: Fixture, root: string = mkdtempSync(join(tmpdir(), 'sll-content-'))): WrittenFixture {
  const sourceDir = join(root, 'content', 'source');
  for (const [rel, json] of Object.entries(fixture.files)) {
    const path = join(sourceDir, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  }
  const ledgerPath = join(root, 'ledger.json');
  writeFileSync(ledgerPath, JSON.stringify(fixture.ledger, null, 2));
  const reviewsDir = join(root, 'content', 'reviews');
  return { root, sourceDir, ledgerPath, reviewsDir };
}
