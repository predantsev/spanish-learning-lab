// Validates a calibration review packet (content/reviews/calibration/*.json) before it is sent to reviewers.
// Every case task must be a schema-valid `$defs/Task` and every clip a `$defs/Clip`, so that seeded defects are
// linguistic/contract defects and never mere schema breakage. Also checks the content/README checking contract
// (outcome keys, hint targets, slot templates, `closed`) and that no hidden-label field leaked into the packet.
// Usage: node tools/calibration/validate-cases.ts [packet.json ...]
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ErrorObject, ValidateFunction } from 'ajv';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

type Json = Record<string, unknown>;
interface Target { skillId: string; modality: string }
interface Task extends Json {
  id: string;
  lessonId: string;
  mode: string;
  targets: Target[];
  clipIds?: string[];
  options?: Array<{ id: string; outcomes: Record<string, string> }>;
  accepted?: Array<{ id: string; text: string }>;
  errors?: Array<{ id: string; text: string; outcomes: Record<string, string> }>;
  closed?: boolean;
  template?: Array<string | { slot: string }>;
  slots?: Array<{ id: string; target: string }>;
  hints?: Array<{ kind: string; targets: string[] }>;
}
interface Case { caseId: string; context: Json; clips?: Json[]; task: Task }

/** Fields that belong to hidden labels and must never appear anywhere in a reviewer packet. */
const LABEL_KEYS = ['class', 'defectType', 'wrongElement', 'releaseBlocking', 'expectedFinding', 'authoringKey', 'sourceRefs'];

export function createContentValidator(): { task: ValidateFunction; clip: ValidateFunction } {
  const Ajv2020 = require('ajv/dist/2020').default as typeof import('ajv').default;
  // Same strictness as @sll/contracts createContractValidator, separate instance for the content schema.
  const ajv = new Ajv2020({
    strict: true,
    allErrors: true,
    coerceTypes: false,
    useDefaults: false,
    removeAdditional: false,
    allowUnionTypes: false,
    validateFormats: true,
  });
  const schema = JSON.parse(readFileSync(join(root, 'content', 'schemas', 'content.schema.json'), 'utf8')) as Json & { $id: string };
  ajv.addSchema(schema, schema.$id);
  const get = (name: string): ValidateFunction => {
    const fn = ajv.getSchema(`${schema.$id}#/$defs/${name}`);
    if (!fn) throw new Error(`cannot compile content schema ${name}`);
    return fn;
  };
  return { task: get('Task'), clip: get('Clip') };
}

function fmt(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message ?? ''} ${JSON.stringify(e.params)}`).join('; ');
}

function collectKeys(value: unknown, out: Set<string>): void {
  if (Array.isArray(value)) for (const v of value) collectKeys(v, out);
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      out.add(k);
      collectKeys(v, out);
    }
  }
}

export function validatePacket(packet: { cases: Case[] }): string[] {
  const problems: string[] = [];
  const v = createContentValidator();
  const keys = new Set<string>();
  collectKeys(packet, keys);
  for (const k of LABEL_KEYS) if (keys.has(k)) problems.push(`packet contains hidden-label field "${k}"`);
  const caseIds = new Set<string>();
  const taskIds = new Set<string>();
  for (const c of packet.cases) {
    const where = c.caseId;
    if (caseIds.has(c.caseId)) problems.push(`${where}: duplicate caseId`);
    caseIds.add(c.caseId);
    if (!v.task(c.task)) problems.push(`${where}: Task schema: ${fmt(v.task.errors)}`);
    const t = c.task;
    if (taskIds.has(t.id)) problems.push(`${where}: duplicate task id ${t.id}`);
    taskIds.add(t.id);
    if (!/-T9\d\d$/.test(t.id)) problems.push(`${where}: task id ${t.id} outside the reserved calibration band T9xx`);
    const clipIds = new Set<string>();
    for (const clip of c.clips ?? []) {
      if (!v.clip(clip)) problems.push(`${where}: Clip schema: ${fmt(v.clip.errors)}`);
      clipIds.add(String(clip.id));
    }
    for (const id of t.clipIds ?? []) if (!clipIds.has(id)) problems.push(`${where}: clipId ${id} not provided in case`);
    const own = new Set(t.targets.map((x) => `${x.skillId}/${x.modality}`));
    const checkOutcomes = (label: string, outcomes: Record<string, string>): void => {
      for (const k of Object.keys(outcomes)) if (!own.has(k)) problems.push(`${where}: ${label} outcome key ${k} is not a task target`);
    };
    for (const o of t.options ?? []) checkOutcomes(`option ${o.id}`, o.outcomes);
    for (const e of t.errors ?? []) checkOutcomes(`error ${e.id}`, e.outcomes);
    for (const h of t.hints ?? []) for (const k of h.targets) if (!own.has(k)) problems.push(`${where}: hint target ${k} is not a task target`);
    for (const s of t.slots ?? []) if (!own.has(s.target)) problems.push(`${where}: slot ${s.id} target ${s.target} is not a task target`);
    if (t.mode === 'choice' && !(t.options ?? []).some((o) => Object.values(o.outcomes).every((x) => x === 'correct'))) {
      problems.push(`${where}: choice task has no option marking all its targets correct`);
    }
    if (t.closed !== undefined && !(t.mode === 'exact-variants' && t.targets.length === 1)) {
      problems.push(`${where}: closed is only meaningful on single-target exact-variants`);
    }
    if (t.mode === 'finite-slots') {
      const tpl = t.template ?? [];
      for (let i = 1; i < tpl.length; i += 1) {
        if (typeof tpl[i] !== 'string' && typeof tpl[i - 1] !== 'string') problems.push(`${where}: adjacent template slots`);
      }
      const declared = new Set((t.slots ?? []).map((s) => s.id));
      for (const part of tpl) if (typeof part !== 'string' && !declared.has(part.slot)) problems.push(`${where}: template slot ${part.slot} undeclared`);
    }
    const ids = (t.options ?? []).map((o) => o.id).concat((t.accepted ?? []).map((a) => a.id), (t.errors ?? []).map((e) => e.id));
    if (new Set(ids).size !== ids.length) problems.push(`${where}: duplicate option/variant ids`);
  }
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = process.argv.slice(2);
  if (files.length === 0) files.push(join(root, 'content', 'reviews', 'calibration', 'cases.json'));
  let failed = false;
  for (const file of files) {
    const packet = JSON.parse(readFileSync(file, 'utf8')) as { cases: Case[] };
    const problems = validatePacket(packet);
    const clips = packet.cases.reduce((n, c) => n + (c.clips?.length ?? 0), 0);
    if (problems.length > 0) {
      failed = true;
      console.error(`${file}: ${problems.length} problem(s)`);
      for (const p of problems) console.error(`  - ${p}`);
    } else {
      console.log(`${file}: OK — ${packet.cases.length} cases, ${clips} clips, all tasks/clips schema-valid, no label fields`);
    }
  }
  process.exit(failed ? 1 : 0);
}
