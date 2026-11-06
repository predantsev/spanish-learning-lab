// Bounded single-range file responses (audio media, recovery downloads).
import { createReadStream, statSync } from 'node:fs';
import type { FastifyReply } from 'fastify';
import { HttpError } from './errors.ts';

export type RangeResult = { readonly start: number; readonly end: number } | 'unsatisfiable' | undefined;

/** One `bytes=` range only; multiple, malformed or out-of-bounds ranges are unsatisfiable (416). */
export function parseRange(header: string | undefined, size: number): RangeResult {
  if (header === undefined) return undefined;
  const m = /^bytes=(\d{0,15})-(\d{0,15})$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '') || size <= 0) return 'unsatisfiable';
  if (m[1] === '') {
    const n = Number(m[2]);
    if (n <= 0) return 'unsatisfiable';
    return { start: Math.max(0, size - n), end: size - 1 };
  }
  const start = Number(m[1]);
  const end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  if (start >= size || start > end) return 'unsatisfiable';
  return { start, end };
}

export function sendFileRange(reply: FastifyReply, path: string, mime: string, rangeHeader: string | undefined): FastifyReply {
  const size = statSync(path).size;
  const range = parseRange(rangeHeader, size);
  reply.header('accept-ranges', 'bytes');
  if (range === 'unsatisfiable') throw new HttpError(416, 'RANGE_NOT_SATISFIABLE', { headers: { 'content-range': `bytes */${size}` } });
  if (range === undefined) {
    reply.header('content-length', String(size));
    return reply.code(200).type(mime).send(createReadStream(path));
  }
  reply.header('content-range', `bytes ${range.start}-${range.end}/${size}`);
  reply.header('content-length', String(range.end - range.start + 1));
  return reply.code(206).type(mime).send(createReadStream(path, { start: range.start, end: range.end }));
}
