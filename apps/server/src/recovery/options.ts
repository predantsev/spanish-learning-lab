// Factory options of the recovery module. Everything time-, fault- or integration-dependent is injectable
// so the A-05/A-06/A-07 tests can drive it deterministically.
import { join } from 'node:path';
import type { Db } from '../db/connection.ts';
import type { PrivatePaths } from '../db/paths.ts';

export interface TimerHandle {
  cancel(): void;
}

export interface Timers {
  setTimeout(fn: () => void, ms: number): TimerHandle;
}

/** Real timers are unref'd: a pending backup never keeps a process alive (no wakeups when stopped). */
export const realTimers: Timers = {
  setTimeout(fn, ms) {
    const t = setTimeout(fn, ms);
    t.unref();
    return { cancel: () => clearTimeout(t) };
  },
};

export interface RecoveryLogger {
  info(msg: string, fields?: Record<string, unknown>): void;
  warn(msg: string, fields?: Record<string, unknown>): void;
  error(msg: string, fields?: Record<string, unknown>): void;
}

export const silentLogger: RecoveryLogger = { info() {}, warn() {}, error() {} };

/** Named points where tests inject crashes, corruption or I/O errors. */
export type FaultPoint =
  | 'backup:after-temp-write'
  | 'backup:before-verify'
  | 'backup:before-rename'
  | 'export:before-finalize'
  | 'restore:shadow-built'
  | 'restore:after-journal'
  | 'restore:before-switch'
  | 'restore:after-live-moved'
  | 'restore:after-switch'
  | 'restore:verify-reopen';

export interface FaultContext {
  readonly path?: string;
  readonly kind?: string;
}

export type FaultInjector = (point: FaultPoint, ctx: FaultContext) => void | Promise<void>;

/**
 * Thrown by a fault injector to simulate process death: the module stops immediately and performs
 * no in-process cleanup or rollback, leaving the filesystem exactly as a crash would.
 */
export class SimulatedCrash extends Error {
  readonly simulatedCrash = true;
  constructor(point: string) {
    super(`simulated crash at ${point}`);
  }
}

export interface ArchiveLimits {
  readonly maxCompressedBytes: number;
  readonly maxExpandedBytes: number;
  readonly maxEntries: number;
  readonly maxPathBytes: number;
  readonly maxManifestBytes: number;
  readonly maxLineBytes: number;
}

export const DEFAULT_LIMITS: ArchiveLimits = {
  maxCompressedBytes: 512 * 1024 * 1024,
  maxExpandedBytes: 2 * 1024 * 1024 * 1024,
  maxEntries: 10_000,
  maxPathBytes: 240,
  maxManifestBytes: 16 * 1024 * 1024,
  maxLineBytes: 32 * 1024 * 1024,
};

export interface RetentionPolicy {
  readonly daily: number;
  readonly weekly: number;
  readonly preChange: number;
  readonly rollback: number;
}

export const DEFAULT_RETENTION: RetentionPolicy = { daily: 7, weekly: 4, preChange: 5, rollback: 1 };

export interface RecoveryOptions {
  readonly timers?: Timers;
  readonly faults?: FaultInjector;
  /**
   * Dry rebuild of projections on the isolated import DB (DOMAIN-SPEC). Must throw on failure.
   * TODO(integrator): wire @sll/domain's projection rebuild once the domain package is merged; the
   * default is a no-op so the restore pipeline can be exercised before that.
   */
  readonly rebuildProjections?: (db: Db) => void | Promise<void>;
  readonly logger?: RecoveryLogger;
  readonly appVersion?: string;
  readonly limits?: Partial<ArchiveLimits>;
  readonly retention?: Partial<RetentionPolicy>;
  /** Directory of an installed pack; default `paths.packs/<packId>/<version>` (integrator: align with pack install). */
  readonly resolvePackDir?: (packId: string, version: string) => string;
  /** Absolute file of an `assets.rel_path`; default `paths.assets/<relPath>` (integrator: align with pack install). */
  readonly resolveAssetFile?: (relPath: string) => string;
  /**
   * HMAC key of a review-receipt keyId from the local key store, or undefined when unknown.
   * TODO(integrator): wire tools/review's key store; the default knows no key, so every historical
   * receipt counts as unverified and restore requires explicit source trust (the safe direction).
   */
  readonly reviewKey?: (keyId: string) => Buffer | undefined;
  readonly backupTimeoutMs?: number;
  readonly debounceMs?: number;
  readonly minIntervalMs?: number;
  readonly artifactTtlMs?: number;
  readonly confirmationTtlMs?: number;
}

export interface ResolvedOptions {
  readonly timers: Timers;
  readonly faults: FaultInjector;
  readonly rebuildProjections: (db: Db) => void | Promise<void>;
  readonly logger: RecoveryLogger;
  readonly appVersion: string;
  readonly limits: ArchiveLimits;
  readonly retention: RetentionPolicy;
  readonly resolvePackDir: (packId: string, version: string) => string;
  readonly resolveAssetFile: (relPath: string) => string;
  readonly reviewKey: (keyId: string) => Buffer | undefined;
  readonly backupTimeoutMs: number;
  readonly debounceMs: number;
  readonly minIntervalMs: number;
  readonly artifactTtlMs: number;
  readonly confirmationTtlMs: number;
}

export function resolveOptions(paths: PrivatePaths, o: RecoveryOptions = {}): ResolvedOptions {
  return {
    timers: o.timers ?? realTimers,
    faults: o.faults ?? (() => {}),
    rebuildProjections: o.rebuildProjections ?? (() => {}),
    logger: o.logger ?? silentLogger,
    appVersion: o.appVersion ?? '0.1.0',
    limits: { ...DEFAULT_LIMITS, ...o.limits },
    retention: { ...DEFAULT_RETENTION, ...o.retention },
    resolvePackDir: o.resolvePackDir ?? ((packId, version) => join(paths.packs, packId, version)),
    resolveAssetFile: o.resolveAssetFile ?? ((relPath) => join(paths.assets, relPath)),
    reviewKey: o.reviewKey ?? (() => undefined),
    backupTimeoutMs: o.backupTimeoutMs ?? 30_000,
    debounceMs: o.debounceMs ?? 60_000,
    minIntervalMs: o.minIntervalMs ?? 15 * 60_000,
    artifactTtlMs: o.artifactTtlMs ?? 15 * 60_000,
    confirmationTtlMs: o.confirmationTtlMs ?? 5 * 60_000,
  };
}
