// Typed builders for POST /commands bodies. operationId doubles as the Idempotency-Key; a retry must
// resend the identical Command object (same id, same body). A changed body needs a new operation.
import { newId } from '../lib/ids.ts';
import type { Command, Receipt, Ref } from './types.ts';

export type CommandKind = Command['kind'];
export type CommandOf<K extends CommandKind> = Extract<Command, { readonly kind: K }>;
export type CommandFields<K extends CommandKind> = Omit<CommandOf<K>, 'kind' | 'operationId' | 'profileEpoch'>;

export function makeCommand<K extends CommandKind>(
  kind: K,
  profileEpoch: number,
  fields: CommandFields<K>,
  operationId: string = newId(),
): CommandOf<K> {
  return { ...fields, kind, operationId, profileEpoch } as unknown as CommandOf<K>;
}

/** Active-context binding required by draft.save, attempt.submit, support.request/observe, context.activity. */
export interface ContextLease {
  readonly contextId: string;
  readonly contextRevision: number;
  readonly contextSnapshot: string;
}

export function receiptEntity(receipt: Receipt, type: Ref['resourceType']): Ref | undefined {
  return receipt.entities.find((entity) => entity.resourceType === type);
}

export function receiptEntities(receipt: Receipt, type: Ref['resourceType']): Ref[] {
  return receipt.entities.filter((entity) => entity.resourceType === type);
}
