// Loads listening clip scripts (content/source/audio/<blockId>.json, `$defs/ClipFile`) and
// validates them against content/schemas/content.schema.json with a strict Ajv 2020 instance.
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { ValidateFunction } from 'ajv';

const require = createRequire(import.meta.url);

export interface ClipTarget {
  readonly skillId: string;
  readonly modality: string;
}

export interface Clip {
  readonly id: string;
  readonly lessonId: string;
  readonly kind: 'phrase' | 'sentence' | 'dialogue-line' | 'text';
  readonly transcript: string;
  readonly translationUk: string;
  readonly targets: readonly ClipTarget[];
  readonly family: string;
  readonly pronunciationNoteUk?: string;
  readonly reviewStatus: string;
}

export interface ClipFile {
  readonly schemaVersion: 1;
  readonly blockId: string;
  readonly clips: readonly Clip[];
}

export interface LoadedClip {
  readonly clip: Clip;
  readonly blockId: string;
  readonly sourceFile: string;
}

let validator: ValidateFunction | null = null;

function clipFileValidator(schemaPath: string): ValidateFunction {
  if (validator) return validator;
  const Ajv2020 = require('ajv/dist/2020').default as typeof import('ajv').default;
  const ajv = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false });
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as { $id: string };
  ajv.addSchema(schema);
  const fn = ajv.getSchema(`${schema.$id}#/$defs/ClipFile`);
  if (!fn) throw new Error('content schema has no $defs/ClipFile');
  validator = fn;
  return fn;
}

/** Expands files and directories (non-recursive, *.json) into a sorted list of clip files. */
export function expandInputs(inputs: readonly string[]): string[] {
  const files: string[] = [];
  for (const input of inputs) {
    const abs = resolve(input);
    if (!existsSync(abs)) throw new Error(`input not found: ${input}`);
    if (statSync(abs).isDirectory()) {
      for (const name of readdirSync(abs).sort()) if (name.endsWith('.json')) files.push(join(abs, name));
    } else {
      files.push(abs);
    }
  }
  return files;
}

/** Loads and validates clip files; throws with every schema error and duplicate clip id. */
export function loadClips(inputs: readonly string[], schemaPath: string): LoadedClip[] {
  const validate = clipFileValidator(schemaPath);
  const out: LoadedClip[] = [];
  const seen = new Map<string, string>();
  const problems: string[] = [];
  for (const file of expandInputs(inputs)) {
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
      problems.push(`${file}: invalid JSON (${(error as Error).message})`);
      continue;
    }
    if (!validate(data)) {
      for (const e of validate.errors ?? []) problems.push(`${file}: ${e.instancePath || '/'} ${e.message ?? ''}`);
      continue;
    }
    const clipFile = data as ClipFile;
    for (const clip of clipFile.clips) {
      const prior = seen.get(clip.id);
      if (prior) problems.push(`${file}: duplicate clip id ${clip.id} (also in ${prior})`);
      seen.set(clip.id, file);
      if (!clip.lessonId.startsWith(`${clipFile.blockId}-`)) {
        problems.push(`${file}: clip ${clip.id} lesson ${clip.lessonId} is outside block ${clipFile.blockId}`);
      }
      out.push({ clip, blockId: clipFile.blockId, sourceFile: file });
    }
  }
  if (problems.length > 0) throw new Error(`clip input invalid:\n${problems.join('\n')}`);
  return out;
}
