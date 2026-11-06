// ExecutionReceipt signing and verification (docs/contracts/schemas.json#/$defs/ExecutionReceipt,
// API.md § Commands): signature = hex HMAC-SHA256 over the canonical sorted-key UTF-8 JSON of all
// receipt fields except `signature`, under the local review key identified by keyId.
import { randomUUID } from 'node:crypto';
import { createContractValidator } from '@sll/contracts';
import type { ExecutionReceipt } from '@sll/contracts';
import { hexEqual, hmacHex } from '../content/canonical.ts';
import type { ReviewKey } from './keys.ts';

export const VERIFIER_VERSION = 'sll-review-tool/0.1.0';

export type UnsignedReceipt = Omit<ExecutionReceipt, 'signature'>;

export type ReceiptCheck = { ok: true } | { ok: false; reason: string };

let validator: ReturnType<typeof createContractValidator> | undefined;
function contractValidator(): ReturnType<typeof createContractValidator> {
  validator ??= createContractValidator();
  return validator;
}

export function receiptFields(receipt: ExecutionReceipt | UnsignedReceipt): UnsignedReceipt {
  const { signature: _signature, ...fields } = receipt as ExecutionReceipt;
  return fields;
}

export interface ReceiptInput {
  id?: string;
  jobId: string;
  provider: string;
  model: string;
  effort: string;
  artifactHash: string;
  reportHash: string;
  completedAt: string;
  verifierVersion?: string;
}

export function signReceipt(fields: ReceiptInput, key: ReviewKey): ExecutionReceipt {
  const unsigned: UnsignedReceipt = {
    id: fields.id ?? randomUUID(),
    keyId: key.keyId,
    jobId: fields.jobId,
    provider: fields.provider,
    model: fields.model,
    effort: fields.effort,
    artifactHash: fields.artifactHash,
    reportHash: fields.reportHash,
    completedAt: fields.completedAt,
    verifierVersion: fields.verifierVersion ?? VERIFIER_VERSION,
  };
  const receipt: ExecutionReceipt = { ...unsigned, signature: hmacHex(key.key, unsigned) };
  const check = contractValidator().validate('ExecutionReceipt', receipt);
  if (!check.ok) throw new Error(`receipt does not match the ExecutionReceipt contract: ${JSON.stringify(check.errors[0])}`);
  return receipt;
}

/** Schema + keyId + constant-time HMAC verification. */
export function verifyReceipt(receipt: unknown, key: ReviewKey | undefined): ReceiptCheck {
  const check = contractValidator().validate('ExecutionReceipt', receipt);
  if (!check.ok) return { ok: false, reason: `not an ExecutionReceipt: ${check.errors[0]?.instancePath ?? ''} ${check.errors[0]?.message ?? ''}`.trim() };
  const r = receipt as ExecutionReceipt;
  if (!key) return { ok: false, reason: 'no local review key available to verify the signature' };
  if (r.keyId !== key.keyId) return { ok: false, reason: `receipt keyId ${r.keyId} is not the local key ${key.keyId}` };
  const expected = hmacHex(key.key, receiptFields(r));
  if (!hexEqual(expected, r.signature)) return { ok: false, reason: 'signature mismatch (receipt altered or signed with another key)' };
  return { ok: true };
}
