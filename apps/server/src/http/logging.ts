// Service log: request id, status, operation kind and duration only — never bodies, answers, drafts,
// auth headers, tokens or imported text. File rotation 5 MiB × 3 files (server.log, .1, .2) in paths.logs.
import { closeSync, existsSync, fstatSync, openSync, renameSync, rmSync, writeSync } from 'node:fs';
import { join } from 'node:path';

export const LOG_FILE_BYTES = 5 * 1024 * 1024;
export const LOG_FILES = 3;

/** Minimal synchronous rotating destination for pino. Files are created 0600. */
export class RotatingLogStream {
  readonly dir: string;
  readonly maxBytes: number;
  readonly files: number;
  private fd: number;
  private size: number;

  constructor(dir: string, maxBytes = LOG_FILE_BYTES, files = LOG_FILES) {
    this.dir = dir;
    this.maxBytes = maxBytes;
    this.files = files;
    this.fd = openSync(this.path(0), 'a', 0o600);
    this.size = fstatSync(this.fd).size;
  }

  path(i: number): string {
    return join(this.dir, i === 0 ? 'server.log' : `server.log.${i}`);
  }

  write(chunk: string): boolean {
    const bytes = Buffer.byteLength(chunk, 'utf8');
    if (this.size + bytes > this.maxBytes && this.size > 0) this.rotate();
    writeSync(this.fd, chunk);
    this.size += bytes;
    return true;
  }

  private rotate(): void {
    closeSync(this.fd);
    const last = this.path(this.files - 1);
    if (existsSync(last)) rmSync(last);
    for (let i = this.files - 2; i >= 0; i--) {
      if (existsSync(this.path(i))) renameSync(this.path(i), this.path(i + 1));
    }
    this.fd = openSync(this.path(0), 'a', 0o600);
    this.size = 0;
  }

  close(): void {
    try {
      closeSync(this.fd);
    } catch {
      // already closed
    }
  }
}

export interface LogSink {
  write(chunk: string): unknown;
}

export interface ServiceLogOptions {
  readonly sink: LogSink;
  readonly level?: 'fatal' | 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Fastify/pino logger options with no request/response serializers: the server logs explicit
 * allowlisted fields only (request id, status, operation kind, duration). pino is created by Fastify.
 */
export function fastifyLoggerOptions(options: ServiceLogOptions): Record<string, unknown> {
  return {
    level: options.level ?? 'info',
    stream: options.sink,
    base: null,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    serializers: { req: () => undefined, res: () => undefined, err: (e: { code?: unknown }) => ({ code: typeof e?.code === 'string' ? e.code : 'ERROR' }) },
    redact: { paths: ['req', 'res', 'headers', 'body', 'authorization', 'cookie'], remove: true },
  };
}
