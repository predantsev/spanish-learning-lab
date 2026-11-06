// Normative wire contracts (docs/contracts) exposed to the server, web app, tools and tests.
// The JSON documents are generated copies; never edit them here.
import { createRequire } from 'node:module';
import type { ErrorObject, ValidateFunction } from 'ajv';

export * from './generated/types.ts';

const require = createRequire(import.meta.url);
export const schemas = require('./generated/schemas.json') as {
  $id: string;
  $defs: Record<string, Record<string, unknown>>;
};
export const openapi = require('./generated/openapi.json') as Record<string, unknown>;

export const API_VERSION = '1' as const;
export const SCHEMA_VERSION = 1 as const;

export type SchemaName = keyof typeof schemas.$defs & string;

export interface ContractValidator {
  validate(name: string, value: unknown): { ok: true } | { ok: false; errors: ErrorObject[] };
  compile(name: string): ValidateFunction;
  /** Validates against an arbitrary schema that may $ref the contract definitions. */
  compileInline(schema: Record<string, unknown>): ValidateFunction;
}

/**
 * Strict Ajv instance: no coercion, no defaults, no removal of additional properties,
 * first error only (API.md). Only application-owned schemas are ever compiled.
 */
export function createContractValidator(): ContractValidator {
  const Ajv2020 = require('ajv/dist/2020').default as typeof import('ajv').default;
  const addFormats = require('ajv-formats').default as (ajv: unknown) => void;
  const ajv = new Ajv2020({
    strict: true,
    allErrors: false,
    coerceTypes: false,
    useDefaults: false,
    removeAdditional: false,
    allowUnionTypes: false,
    validateFormats: true,
  });
  addFormats(ajv);
  ajv.addSchema(schemas, schemas.$id);
  const cache = new Map<string, ValidateFunction>();
  const compile = (name: string): ValidateFunction => {
    let fn = cache.get(name);
    if (!fn) {
      if (!(name in schemas.$defs)) throw new Error(`unknown contract schema ${name}`);
      fn = ajv.getSchema(`${schemas.$id}#/$defs/${name}`);
      if (!fn) throw new Error(`cannot compile contract schema ${name}`);
      cache.set(name, fn);
    }
    return fn;
  };
  return {
    compile,
    compileInline(schema) {
      const rewritten = JSON.parse(
        JSON.stringify(schema).replaceAll('./schemas.json#', `${schemas.$id}#`),
      ) as Record<string, unknown>;
      return ajv.compile(rewritten);
    },
    validate(name, value) {
      const fn = compile(name);
      return fn(value) ? { ok: true } : { ok: false, errors: [...(fn.errors ?? [])] };
    },
  };
}
