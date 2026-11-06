// Strict validation of pack entity bodies against content/schemas/content.schema.json, using the same
// strict Ajv configuration as the wire contracts (no coercion/defaults/removal).
import { createContractValidator } from '@sll/contracts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ValidateFunction } from 'ajv';
import type { EntityKind } from './pack-format.ts';

const CONTENT_SCHEMA_PATH = fileURLToPath(new URL('../../../../content/schemas/content.schema.json', import.meta.url));

const DEF_FOR_KIND: Record<Exclude<EntityKind, 'source'>, string> = {
  lesson: 'Lesson',
  task: 'Task',
  skill: 'Skill',
  lexeme: 'LexicalItem',
  clip: 'Clip',
  phrase: 'Phrase',
  collection: 'Collection',
  material: 'Material',
  situation: 'Situation',
};

let compiled: Map<EntityKind, ValidateFunction> | undefined;

function compileAll(): Map<EntityKind, ValidateFunction> {
  const v = createContractValidator();
  const schema = JSON.parse(readFileSync(CONTENT_SCHEMA_PATH, 'utf8')) as { $id: string; $defs: Record<string, { properties: { sources: { items: unknown } } }> };
  v.compileInline(schema as unknown as Record<string, unknown>);
  const out = new Map<EntityKind, ValidateFunction>();
  for (const [kind, def] of Object.entries(DEF_FOR_KIND)) {
    out.set(kind as EntityKind, v.compileInline({ $ref: `${schema.$id}#/$defs/${def}` }));
  }
  // A `source` entity is one item of SourceRegistry.sources.
  out.set('source', v.compileInline({ $ref: `${schema.$id}#/$defs/SourceRegistry/properties/sources/items` }));
  return out;
}

export function validateContentBody(kind: EntityKind, body: unknown): { ok: true } | { ok: false; message: string } {
  compiled ??= compileAll();
  const fn = compiled.get(kind);
  if (!fn) return { ok: false, message: `unknown entity kind ${kind}` };
  if (fn(body)) return { ok: true };
  const e = fn.errors?.[0];
  return { ok: false, message: e ? `${e.instancePath || '/'} ${e.message ?? 'invalid'}` : 'invalid' };
}

/** Logical id field of a body per kind (bodies carry their own id). */
export function bodyLogicalId(kind: EntityKind, body: Record<string, unknown>): string | undefined {
  const v = kind === 'skill' ? body.skillId : body.id;
  return typeof v === 'string' ? v : undefined;
}
