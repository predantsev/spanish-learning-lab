import type { FastifyRequest } from 'fastify';

export interface Envelope<T> {
  readonly apiVersion: '1';
  readonly requestId: string;
  readonly profileEpoch: number;
  readonly data: T;
}

export function ok<T>(request: FastifyRequest, profileEpoch: number, data: T): Envelope<T> {
  return { apiVersion: '1', requestId: request.id, profileEpoch, data };
}

export function readHeader(request: FastifyRequest, name: string): string | undefined {
  const v = request.headers[name];
  if (Array.isArray(v)) return undefined;
  return typeof v === 'string' ? v : undefined;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const HASH_RE = /^[a-f0-9]{64}$/;
