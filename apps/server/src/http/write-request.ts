// Shared checks for every mutation request: body present and schema-valid (strict, 422), and the
// Idempotency-Key / X-Profile-Epoch / If-Match headers matching the body (400).
import type { FastifyRequest } from 'fastify';
import type { ServerState } from '../state.ts';
import { HttpError, badRequest } from './errors.ts';
import { readHeader, UUID_RE } from './reply.ts';

export interface WriteEnvelope {
  readonly operationId: string;
  readonly profileEpoch: number;
  readonly expectedRevision: number;
}

export function requireBody<T>(state: ServerState, request: FastifyRequest, schema: string): T {
  const body = request.body;
  if (body === undefined || body === null) throw badRequest('BODY_REQUIRED');
  if (typeof body !== 'object' || Array.isArray(body)) throw new HttpError(422, 'INVALID_SHAPE');
  const r = state.validator.validate(schema, body);
  if (!r.ok) throw new HttpError(422, 'INVALID_SHAPE');
  return body as T;
}

/** Headers must restate the body: Idempotency-Key = operationId, X-Profile-Epoch = profileEpoch, If-Match = "expectedRevision". */
export function checkWriteHeaders(request: FastifyRequest, w: WriteEnvelope): void {
  const key = readHeader(request, 'idempotency-key');
  const epoch = readHeader(request, 'x-profile-epoch');
  const ifMatch = readHeader(request, 'if-match');
  if (key === undefined || epoch === undefined || ifMatch === undefined) throw badRequest('WRITE_HEADERS_REQUIRED');
  if (!UUID_RE.test(key) || key.toLowerCase() !== w.operationId.toLowerCase()) throw badRequest('IDEMPOTENCY_KEY_MISMATCH');
  if (!/^[0-9]{1,16}$/.test(epoch) || Number(epoch) !== w.profileEpoch) throw badRequest('EPOCH_HEADER_MISMATCH');
  if (!/^"[0-9]{1,16}"$/.test(ifMatch) || Number(ifMatch.slice(1, -1)) !== w.expectedRevision) throw badRequest('IF_MATCH_MISMATCH');
}

/** Header-only writes (streamed uploads): the operation identity comes from the headers. */
export function readWriteHeaders(request: FastifyRequest): WriteEnvelope {
  const key = readHeader(request, 'idempotency-key');
  const epoch = readHeader(request, 'x-profile-epoch');
  const ifMatch = readHeader(request, 'if-match');
  if (key === undefined || epoch === undefined || ifMatch === undefined) throw badRequest('WRITE_HEADERS_REQUIRED');
  if (!UUID_RE.test(key)) throw badRequest('IDEMPOTENCY_KEY_MISMATCH');
  if (!/^[0-9]{1,16}$/.test(epoch)) throw badRequest('EPOCH_HEADER_MISMATCH');
  if (!/^"[0-9]{1,16}"$/.test(ifMatch)) throw badRequest('IF_MATCH_MISMATCH');
  return { operationId: key.toLowerCase(), profileEpoch: Number(epoch), expectedRevision: Number(ifMatch.slice(1, -1)) };
}
