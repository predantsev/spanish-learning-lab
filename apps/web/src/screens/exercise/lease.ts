// Active-context lease (API.md): GET /contexts/{id} issues a 60-second snapshotToken bound to the
// context id/revision. Commands that need it (draft.save, attempt.submit, support.request/observe,
// context.activity) take a fresh lease; any change of the context revision invalidates the token,
// so the next command re-reads the context first. Reads do not count as learner activity.
import type { ApiClient } from '../../api/client.ts';
import type { ContextLease } from '../../api/commands.ts';
import type { Context } from '../../api/types.ts';

const LEASE_MAX_AGE_MS = 40_000;

export class ContextLeaseManager {
  private readonly api: ApiClient;
  private context: Context;
  private fetchedAt: number;
  private refreshing: Promise<Context> | null = null;

  constructor(api: ApiClient, context: Context, now: number = Date.now()) {
    this.api = api;
    this.context = context;
    this.fetchedAt = now;
  }

  get current(): Context {
    return this.context;
  }

  get contextId(): string {
    return this.context.metadata.id;
  }

  get revision(): number {
    return this.context.metadata.revision;
  }

  /** A command changed the context revision: the snapshot token is no longer valid. */
  markStale(): void {
    this.fetchedAt = 0;
  }

  refresh(): Promise<Context> {
    if (!this.refreshing) {
      this.refreshing = this.api
        .get<Context>(`/contexts/${encodeURIComponent(this.contextId)}`)
        .then((envelope) => {
          this.context = envelope.data;
          this.fetchedAt = Date.now();
          return envelope.data;
        })
        .finally(() => {
          this.refreshing = null;
        });
    }
    return this.refreshing;
  }

  async lease(): Promise<ContextLease> {
    if (Date.now() - this.fetchedAt > LEASE_MAX_AGE_MS) await this.refresh();
    return {
      contextId: this.context.metadata.id,
      contextRevision: this.context.metadata.revision,
      contextSnapshot: this.context.snapshotToken,
    };
  }
}
