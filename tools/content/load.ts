// Loads every file under content/source, validates it against its content.schema.json definition
// (Ajv draft 2020-12, strict schema mode, no coercion/defaults/removal) and returns a typed corpus.
// CLI: node tools/content/load.ts [--source <dir>]   (prints a per-kind summary; exit 1 on errors)
import { createRequire } from 'node:module';
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ErrorObject, ValidateFunction } from 'ajv';
import { canonicalSha256 } from './canonical.ts';
import type {
  Clip,
  ClipFile,
  Collection,
  CollectionFile,
  EntityKind,
  LexicalItem,
  LexiconFile,
  Lesson,
  Material,
  MaterialFile,
  Phrase,
  PhraseFile,
  ReviewStatus,
  Situation,
  SituationFile,
  BlockFile,
  CourseBlock,
  Skill,
  SkillFile,
  SourceEntry,
  SourceRegistry,
  Task,
  TaskFile,
} from './types.ts';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DEFAULT_SOURCE_DIR = join(REPO_ROOT, 'content', 'source');
export const DEFAULT_SCHEMA_PATH = join(REPO_ROOT, 'content', 'schemas', 'content.schema.json');
export const DEFAULT_LEDGER_PATH = join(REPO_ROOT, 'docs', 'contracts', 'curriculum-ledger.json');
export const DEFAULT_REVIEWS_DIR = join(REPO_ROOT, 'content', 'reviews');
export const TOOL_VERSION = 'sll-content-tools/0.1.0';

export interface EntityRef {
  kind: EntityKind;
  id: string;
}

export interface Issue {
  level: 'error' | 'warning';
  code: string;
  message: string;
  file?: string;
  entity?: EntityRef;
}

export interface EntityRecord<T> {
  kind: EntityKind;
  id: string;
  /** Path relative to the source directory, POSIX separators. */
  file: string;
  /** Position inside the file's entity array (0 for single-entity files). */
  index: number;
  body: T;
}

export type SchemaDef =
  | 'SourceRegistry'
  | 'SituationFile'
  | 'BlockFile'
  | 'PhraseFile'
  | 'CollectionFile'
  | 'SkillFile'
  | 'LexiconFile'
  | 'Lesson'
  | 'TaskFile'
  | 'ClipFile'
  | 'MaterialFile';

export interface SourceFile {
  file: string;
  def: SchemaDef;
  /** Block or lesson ID named by the file path, when the layout uses one. */
  pathId?: string;
  json: unknown;
  /** SHA-256 of the canonical JSON of the parsed file. */
  sha256: string;
  valid: boolean;
}

export interface Corpus {
  sourceDir: string;
  files: SourceFile[];
  sources: EntityRecord<SourceEntry>[];
  situations: EntityRecord<Situation>[];
  /** content/source/blocks.json (not pack entities: emitted into pack.json `blocks`). */
  blocks: CourseBlock[];
  skills: EntityRecord<Skill>[];
  lexemes: EntityRecord<LexicalItem>[];
  lessons: EntityRecord<Lesson>[];
  tasks: EntityRecord<Task>[];
  clips: EntityRecord<Clip>[];
  phrases: EntityRecord<Phrase>[];
  collections: EntityRecord<Collection>[];
  materials: EntityRecord<Material>[];
}

export interface LoadResult {
  corpus: Corpus;
  issues: Issue[];
}

const BLOCK_ID = 'A[12]-0[1-8]';
const LESSON_ID = `${BLOCK_ID}-(?:L[0-9]{1,2}|C1)`;
const LAYOUT: Array<{ re: RegExp; def: SchemaDef }> = [
  { re: /^sources\.json$/, def: 'SourceRegistry' },
  { re: /^situations\.json$/, def: 'SituationFile' },
  { re: /^blocks\.json$/, def: 'BlockFile' },
  { re: /^phrases\.json$/, def: 'PhraseFile' },
  { re: /^collections\.json$/, def: 'CollectionFile' },
  { re: new RegExp(`^skills/(${BLOCK_ID})\\.json$`), def: 'SkillFile' },
  { re: new RegExp(`^lexicon/(${BLOCK_ID})\\.json$`), def: 'LexiconFile' },
  { re: new RegExp(`^lessons/(${LESSON_ID})\\.json$`), def: 'Lesson' },
  { re: new RegExp(`^tasks/(${LESSON_ID})\\.json$`), def: 'TaskFile' },
  { re: new RegExp(`^audio/(${BLOCK_ID})\\.json$`), def: 'ClipFile' },
  { re: new RegExp(`^materials/(${BLOCK_ID})\\.json$`), def: 'MaterialFile' },
];

/** Files that may live in content/source without being course data (author notes). */
function isIgnoredFile(rel: string): boolean {
  const base = rel.split('/').pop() ?? rel;
  return rel.endsWith('.md') || base === '.DS_Store' || base === '.gitkeep';
}

export interface ContentSchemaValidator {
  validate(def: SchemaDef | string, value: unknown): ErrorObject[] | null;
}

const validatorCache = new Map<string, ContentSchemaValidator>();

/** Strict Ajv 2020 validator over content.schema.json (all errors reported for authoring feedback). */
export function createContentValidator(schemaPath: string = DEFAULT_SCHEMA_PATH): ContentSchemaValidator {
  const cached = validatorCache.get(schemaPath);
  if (cached) return cached;
  const require = createRequire(import.meta.url);
  const Ajv2020 = require('ajv/dist/2020').default as typeof import('ajv').default;
  const addFormats = require('ajv-formats').default as (ajv: unknown) => void;
  const ajv = new Ajv2020({
    strict: true,
    allErrors: true,
    coerceTypes: false,
    useDefaults: false,
    removeAdditional: false,
    allowUnionTypes: false,
    validateFormats: true,
  });
  addFormats(ajv);
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as { $id: string; $defs: Record<string, unknown> };
  ajv.addSchema(schema);
  const compiled = new Map<string, ValidateFunction>();
  const validator: ContentSchemaValidator = {
    validate(def, value) {
      let fn = compiled.get(def);
      if (!fn) {
        if (!(def in schema.$defs)) throw new Error(`unknown content schema definition ${def}`);
        fn = ajv.getSchema(`${schema.$id}#/$defs/${def}`);
        if (!fn) throw new Error(`cannot compile content schema definition ${def}`);
        compiled.set(def, fn);
      }
      return fn(value) ? null : [...(fn.errors ?? [])];
    },
  };
  validatorCache.set(schemaPath, validator);
  return validator;
}

/** Lists files under `dir`; symbolic links are reported, never followed. */
function walk(dir: string, root: string, out: string[], links: string[]): void {
  let names: string[];
  try {
    names = readdirSync(dir).sort();
  } catch {
    return;
  }
  for (const name of names) {
    const full = join(dir, name);
    const st = lstatSync(full);
    const rel = relative(root, full).split(sep).join('/');
    if (st.isSymbolicLink()) links.push(rel);
    else if (st.isDirectory()) walk(full, root, out, links);
    else out.push(rel);
  }
}

export function formatAjvErrors(errors: ErrorObject[], limit = 8): string {
  const parts = errors.slice(0, limit).map((e) => {
    const where = e.instancePath || '/';
    const extra =
      e.keyword === 'additionalProperties'
        ? ` (${String((e.params as { additionalProperty?: string }).additionalProperty)})`
        : e.keyword === 'enum'
          ? ` (${JSON.stringify((e.params as { allowedValues?: unknown }).allowedValues)})`
          : '';
    return `${where} ${e.message ?? e.keyword}${extra}`;
  });
  return parts.join('; ') + (errors.length > limit ? `; … ${errors.length - limit} more` : '');
}

export function emptyCorpus(sourceDir: string): Corpus {
  return {
    sourceDir,
    files: [],
    sources: [],
    situations: [],
    blocks: [],
    skills: [],
    lexemes: [],
    lessons: [],
    tasks: [],
    clips: [],
    phrases: [],
    collections: [],
    materials: [],
  };
}

export interface LoadOptions {
  sourceDir?: string;
  schemaPath?: string;
}

export function loadCorpus(options: LoadOptions = {}): LoadResult {
  const sourceDir = options.sourceDir ?? DEFAULT_SOURCE_DIR;
  const validator = createContentValidator(options.schemaPath ?? DEFAULT_SCHEMA_PATH);
  const corpus = emptyCorpus(sourceDir);
  const issues: Issue[] = [];
  const rels: string[] = [];
  const links: string[] = [];
  walk(sourceDir, sourceDir, rels, links);
  for (const rel of links) issues.push({ level: 'error', code: 'file.symlink', file: rel, message: 'symbolic links are not allowed in content/source' });

  for (const rel of rels) {
    if (isIgnoredFile(rel)) continue;
    const match = LAYOUT.map((l) => ({ l, m: l.re.exec(rel) })).find((x) => x.m);
    if (!match) {
      issues.push({
        level: 'error',
        code: 'file.unknown',
        file: rel,
        message: 'file does not match the content/source layout (content/README.md § Layout)',
      });
      continue;
    }
    const def = match.l.def;
    const pathId = match.m?.[1];
    let json: unknown;
    try {
      json = JSON.parse(readFileSync(join(sourceDir, rel), 'utf8'));
    } catch (error) {
      issues.push({ level: 'error', code: 'file.json', file: rel, message: `invalid JSON: ${(error as Error).message}` });
      continue;
    }
    const errors = validator.validate(def, json);
    const record: SourceFile = {
      file: rel,
      def,
      ...(pathId ? { pathId } : {}),
      json,
      sha256: canonicalSha256(json),
      valid: errors === null,
    };
    corpus.files.push(record);
    if (errors) {
      issues.push({ level: 'error', code: 'schema', file: rel, message: `${def}: ${formatAjvErrors(errors)}` });
      continue;
    }
    collect(corpus, record, issues);
  }
  return { corpus, issues };
}

function pathMismatch(issues: Issue[], file: string, field: string, value: string, expected: string | undefined): void {
  if (expected !== undefined && value !== expected) {
    issues.push({
      level: 'error',
      code: 'file.id-mismatch',
      file,
      message: `${field} ${value} does not match the file name (${expected})`,
    });
  }
}

function collect(corpus: Corpus, f: SourceFile, issues: Issue[]): void {
  const push = <T>(list: EntityRecord<T>[], kind: EntityKind, id: string, index: number, body: T): void => {
    list.push({ kind, id, file: f.file, index, body });
  };
  switch (f.def) {
    case 'SourceRegistry':
      (f.json as SourceRegistry).sources.forEach((s, i) => push(corpus.sources, 'source', s.id, i, s));
      break;
    case 'SituationFile':
      (f.json as SituationFile).situations.forEach((s, i) => push(corpus.situations, 'situation', s.id, i, s));
      break;
    case 'BlockFile':
      corpus.blocks.push(...(f.json as BlockFile).blocks);
      break;
    case 'PhraseFile':
      (f.json as PhraseFile).phrases.forEach((p, i) => push(corpus.phrases, 'phrase', p.id, i, p));
      break;
    case 'CollectionFile':
      (f.json as CollectionFile).collections.forEach((c, i) => push(corpus.collections, 'collection', c.id, i, c));
      break;
    case 'SkillFile': {
      const file = f.json as SkillFile;
      pathMismatch(issues, f.file, 'blockId', file.blockId, f.pathId);
      file.skills.forEach((s, i) => push(corpus.skills, 'skill', s.skillId, i, s));
      break;
    }
    case 'LexiconFile': {
      const file = f.json as LexiconFile;
      pathMismatch(issues, f.file, 'blockId', file.blockId, f.pathId);
      file.items.forEach((x, i) => push(corpus.lexemes, 'lexeme', x.id, i, x));
      break;
    }
    case 'Lesson': {
      const lesson = f.json as Lesson;
      pathMismatch(issues, f.file, 'id', lesson.id, f.pathId);
      push(corpus.lessons, 'lesson', lesson.id, 0, lesson);
      break;
    }
    case 'TaskFile': {
      const file = f.json as TaskFile;
      pathMismatch(issues, f.file, 'lessonId', file.lessonId, f.pathId);
      file.tasks.forEach((t, i) => push(corpus.tasks, 'task', t.id, i, t));
      break;
    }
    case 'ClipFile': {
      const file = f.json as ClipFile;
      pathMismatch(issues, f.file, 'blockId', file.blockId, f.pathId);
      file.clips.forEach((c, i) => push(corpus.clips, 'clip', c.id, i, c));
      break;
    }
    case 'MaterialFile': {
      const file = f.json as MaterialFile;
      pathMismatch(issues, f.file, 'blockId', file.blockId, f.pathId);
      file.materials.forEach((m, i) => push(corpus.materials, 'material', m.id, i, m));
      break;
    }
  }
}

// ---------- entity helpers shared by validator, coverage, pack and review ----------

export type AnyRecord = EntityRecord<
  Lesson | Task | Skill | LexicalItem | Clip | Phrase | Collection | Material | Situation | SourceEntry
>;

const KIND_ORDER: EntityKind[] = ['source', 'situation', 'skill', 'lexeme', 'lesson', 'task', 'clip', 'phrase', 'collection', 'material'];

/** Every entity of the corpus, ordered by kind then logical ID (deterministic). */
export function allEntities(corpus: Corpus): AnyRecord[] {
  const lists: AnyRecord[][] = [
    corpus.sources,
    corpus.situations,
    corpus.skills,
    corpus.lexemes,
    corpus.lessons,
    corpus.tasks,
    corpus.clips,
    corpus.phrases,
    corpus.collections,
    corpus.materials,
  ];
  return lists
    .flat()
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Entity body without its review status: the reviewed/hashed content of a revision. */
export function stripStatus(body: object): Record<string, unknown> {
  const { reviewStatus: _ignored, ...rest } = body as Record<string, unknown>;
  return rest;
}

/** SHA-256 of the canonical body without reviewStatus; review receipts and pack revisions bind to it. */
export function entityHash(record: { body: object }): string {
  return canonicalSha256(stripStatus(record.body));
}

/**
 * Production state of an entity. Sources are citation registry entries without a review lifecycle
 * (always packable); lexemes/situations without the optional reviewStatus count as `draft`.
 */
export function entityState(record: { kind: EntityKind; body: object }): ReviewStatus {
  if (record.kind === 'source') return 'ready';
  const status = (record.body as { reviewStatus?: ReviewStatus }).reviewStatus;
  return status ?? 'draft';
}

/** Canonical source digest: SHA-256 over the sorted [path, canonical sha256] list of loaded files. */
export function sourceDigest(corpus: Corpus): string {
  const files = corpus.files
    .map((f) => ({ path: f.file, sha256: f.sha256 }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return canonicalSha256({ files });
}

// ---------- CLI ----------

export function parseArgs(argv: string[]): { flags: Map<string, string | true>; positional: string[] } {
  const flags = new Map<string, string | true>();
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? '';
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq > 0) flags.set(arg.slice(2, eq), arg.slice(eq + 1));
      else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          flags.set(arg.slice(2), next);
          i++;
        } else flags.set(arg.slice(2), true);
      }
    } else positional.push(arg);
  }
  return { flags, positional };
}

export function flagString(flags: Map<string, string | true>, name: string): string | undefined {
  const v = flags.get(name);
  return typeof v === 'string' ? v : undefined;
}

/** True when the module at `metaUrl` is the script Node was started with. */
export function isMain(metaUrl: string): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(fileURLToPath(metaUrl)) === realpathSync(entry);
  } catch {
    return false;
  }
}

function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const { corpus, issues } = loadCorpus({ sourceDir: flagString(flags, 'source') ?? DEFAULT_SOURCE_DIR });
  const counts: Record<string, number> = {};
  for (const e of allEntities(corpus)) counts[e.kind] = (counts[e.kind] ?? 0) + 1;
  console.log(`content: ${corpus.files.length} files loaded from ${corpus.sourceDir}`);
  console.log(`entities: ${JSON.stringify(counts)}`);
  console.log(`sourceDigest: ${sourceDigest(corpus)}`);
  for (const issue of issues) console.error(`${issue.level.toUpperCase()} [${issue.code}] ${issue.file ?? ''}: ${issue.message}`);
  if (issues.some((i) => i.level === 'error')) process.exit(1);
}

if (isMain(import.meta.url)) main();
