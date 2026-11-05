import type { ApiErrorBody } from './types.ts';

export type ApiFailureKind = 'http' | 'network' | 'invalid-response';

/** A failed API call with the typed Error envelope when the service returned one. */
export class ApiRequestError extends Error {
  readonly kind: ApiFailureKind;
  readonly status: number;
  readonly body: ApiErrorBody | undefined;

  constructor(kind: ApiFailureKind, status: number, body?: ApiErrorBody, message?: string) {
    super(message ?? body?.code ?? `${kind}:${status}`);
    this.name = 'ApiRequestError';
    this.kind = kind;
    this.status = status;
    this.body = body;
  }

  get code(): string {
    if (this.body?.code) return this.body.code;
    if (this.kind === 'network') return 'NETWORK';
    if (this.kind === 'invalid-response') return 'INVALID_RESPONSE';
    return `HTTP_${this.status}`;
  }

  /** Safe to resend the identical operation (same operationId and body). */
  get retryable(): boolean {
    if (this.kind === 'network') return true;
    if (this.status === 503 || this.status === 429 || this.status === 502 || this.status === 504) return true;
    return this.body?.retryable === true;
  }

  /** The write was not saved because the service or the connection is unavailable. */
  get notSaved(): boolean {
    return this.kind === 'network' || this.status === 503 || this.status >= 500;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }
}

/** True for responses that call for an authenticated session refresh and one retry of the same operation. */
export function needsSessionRefresh(status: number, body: ApiErrorBody | undefined): boolean {
  if (status === 401) return true;
  if (status === 403 && body && /CSRF/i.test(body.code)) return true;
  return false;
}

/** True when the service reports that the profile was replaced (restore) under this client. */
export function isEpochMismatch(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 409 && /EPOCH/i.test(error.code);
}

export function isMissing(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 404;
}

/**
 * Locale key for an error. Resolution order: `errors.<CODE>` (interface catalogue), then the
 * service's `messageKey` when the locale knows it, then a status-based generic key.
 */
export function errorMessageKey(error: unknown, hasKey: (key: string) => boolean): string {
  if (error instanceof ApiRequestError) {
    const byCode = `errors.${error.code}`;
    if (hasKey(byCode)) return byCode;
    const serviceKey = error.body?.messageKey;
    if (serviceKey && hasKey(serviceKey)) return serviceKey;
    if (error.kind === 'network') return 'errors.NETWORK';
    if (error.status === 401) return 'errors.generic401';
    if (error.status === 403) return 'errors.generic403';
    if (error.status === 404) return 'errors.generic404';
    if (error.status === 409) return 'errors.generic409';
    if (error.status === 413) return 'errors.generic413';
    if (error.status === 422) return 'errors.generic422';
    if (error.status === 429) return 'errors.generic429';
    if (error.status >= 500) return 'errors.generic503';
  }
  return 'errors.generic';
}
