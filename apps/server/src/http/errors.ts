// Error envelope (schemas.json#/$defs/Error): code, Ukrainian display key, requestId, retryable,
// optional currentRevision/createdEntityId. Never a stack, SQL text or private answer.
import type { ApiError } from '@sll/contracts';

export type HttpStatus = 400 | 401 | 403 | 404 | 409 | 413 | 416 | 422 | 429 | 503;

export class HttpError extends Error {
  readonly status: HttpStatus;
  readonly code: string;
  readonly retryable: boolean;
  readonly currentRevision: number | undefined;
  readonly createdEntityId: string | undefined;
  readonly headers: Record<string, string> | undefined;
  constructor(
    status: HttpStatus,
    code: string,
    options: { retryable?: boolean; currentRevision?: number; createdEntityId?: string; headers?: Record<string, string> } = {},
  ) {
    super(code);
    this.status = status;
    this.code = code;
    this.retryable = options.retryable ?? false;
    this.currentRevision = options.currentRevision;
    this.createdEntityId = options.createdEntityId;
    this.headers = options.headers;
  }
}

/** STALE_REVISION → error.staleRevision (examples.json convention). */
export function messageKeyFor(code: string): string {
  const parts = code.toLowerCase().split('_');
  return `error.${parts[0]}${parts
    .slice(1)
    .map((p) => (p.length ? p[0]!.toUpperCase() + p.slice(1) : p))
    .join('')}`;
}

export function envelope(requestId: string, err: HttpError): ApiError {
  const out: { -readonly [K in keyof ApiError]: ApiError[K] } = {
    apiVersion: '1',
    requestId,
    code: err.code,
    messageKey: messageKeyFor(err.code),
    retryable: err.retryable,
  };
  if (err.currentRevision !== undefined) out.currentRevision = err.currentRevision;
  if (err.createdEntityId !== undefined) out.createdEntityId = err.createdEntityId;
  return out;
}

export const badRequest = (code: string): HttpError => new HttpError(400, code);
export const unauthorized = (code = 'AUTH_REQUIRED'): HttpError => new HttpError(401, code);
export const forbidden = (code: string): HttpError => new HttpError(403, code);
export const notFound = (code = 'NOT_FOUND'): HttpError => new HttpError(404, code);
export const conflict = (code: string, currentRevision?: number): HttpError =>
  currentRevision === undefined ? new HttpError(409, code) : new HttpError(409, code, { currentRevision });
export const unprocessable = (code: string): HttpError => new HttpError(422, code);
export const unavailable = (code: string, retryable = true): HttpError => new HttpError(503, code, { retryable });

const STORAGE_CODES = new Set(['SQLITE_FULL', 'SQLITE_BUSY', 'SQLITE_LOCKED', 'SQLITE_IOERR', 'SQLITE_CANTOPEN', 'SQLITE_READONLY', 'SQLITE_CORRUPT', 'SQLITE_NOTADB', 'SQLITE_PROTOCOL']);

/** Disk-full/locked/corrupt storage failures become a retryable 503 (the transaction already rolled back). */
export function isStorageFailure(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = (err as { code?: unknown }).code;
  if (typeof code !== 'string') return false;
  return STORAGE_CODES.has(code) || [...STORAGE_CODES].some((c) => code.startsWith(`${c}_`));
}
