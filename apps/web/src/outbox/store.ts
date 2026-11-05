// Recovery outbox: IndexedDB store keyed by operationId holding unacknowledged draft text
// ({epoch, contextId, draftId, baseRevision, text, createdAt}). The service database stays
// authoritative; this is recovery support only. Browser storage is not encrypted and is not
// available at another origin (a changed port), so the UI also offers copy/export of these texts.
import type { Command } from '../api/types.ts';

export type OutboxState = 'pending' | 'failed' | 'conflict';

export interface OutboxEntry {
  readonly operationId: string;
  readonly epoch: number;
  readonly contextId: string;
  readonly draftId: string;
  readonly taskRevisionId: string;
  readonly baseRevision: number;
  readonly text: string;
  readonly cursor: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Learner-facing title of the task, for the recovery list. */
  readonly title: string;
  readonly state: OutboxState;
  /** Exact body last sent for this operation; retries reuse it unchanged. */
  readonly command?: Command;
}

const DB_NAME = 'sll-recovery';
const DB_VERSION = 1;
const STORE = 'outbox';

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'operationId' });
        store.createIndex('draftId', 'draftId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function run(db: IDBDatabase, mode: IDBTransactionMode, action: (store: IDBObjectStore) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('outbox transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('outbox transaction aborted'));
    action(tx.objectStore(STORE));
  });
}

function readAll(db: IDBDatabase): Promise<OutboxEntry[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result as OutboxEntry[]);
    request.onerror = () => reject(request.error ?? new Error('outbox read failed'));
  });
}

export class OutboxStore {
  private readonly entries = new Map<string, OutboxEntry>();
  private readonly listeners = new Set<() => void>();
  private db: IDBDatabase | null = null;
  private snapshot: readonly OutboxEntry[] = [];
  /** False when IndexedDB is unavailable or failed: entries then live in memory only. */
  persistent = false;
  readonly ready: Promise<void>;

  constructor(useIndexedDb = true) {
    this.ready = useIndexedDb ? this.load() : Promise.resolve();
  }

  private async load(): Promise<void> {
    this.db = await openDatabase();
    this.persistent = this.db !== null;
    if (!this.db) return;
    try {
      for (const entry of await readAll(this.db)) this.entries.set(entry.operationId, entry);
    } catch {
      this.persistent = false;
    }
    this.changed();
  }

  private changed(): void {
    this.snapshot = [...this.entries.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const listener of this.listeners) listener();
  }

  private async persist(action: (store: IDBObjectStore) => void): Promise<void> {
    if (!this.db) return;
    try {
      await run(this.db, 'readwrite', action);
    } catch {
      this.persistent = false;
      this.changed();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  all(): readonly OutboxEntry[] {
    return this.snapshot;
  }

  forDraft(draftId: string): OutboxEntry | undefined {
    return this.snapshot.filter((entry) => entry.draftId === draftId).at(-1);
  }

  /** Stores the entry and drops older entries of the same draft (only the newest text matters). */
  async put(entry: OutboxEntry): Promise<void> {
    const stale = [...this.entries.values()].filter(
      (other) => other.draftId === entry.draftId && other.operationId !== entry.operationId,
    );
    for (const other of stale) this.entries.delete(other.operationId);
    this.entries.set(entry.operationId, entry);
    this.changed();
    await this.persist((store) => {
      for (const other of stale) store.delete(other.operationId);
      store.put(entry);
    });
  }

  async remove(operationId: string): Promise<void> {
    if (!this.entries.delete(operationId)) return;
    this.changed();
    await this.persist((store) => store.delete(operationId));
  }

  async removeDraft(draftId: string): Promise<void> {
    const ids = [...this.entries.values()].filter((entry) => entry.draftId === draftId).map((entry) => entry.operationId);
    if (ids.length === 0) return;
    for (const id of ids) this.entries.delete(id);
    this.changed();
    await this.persist((store) => {
      for (const id of ids) store.delete(id);
    });
  }
}

/** Plain-text export of unacknowledged drafts (copy/download when the service cannot be reached). */
export function outboxExportText(entries: readonly OutboxEntry[], heading: (entry: OutboxEntry) => string): string {
  return entries.map((entry) => `${heading(entry)}\n${entry.text}`).join('\n\n---\n\n');
}
