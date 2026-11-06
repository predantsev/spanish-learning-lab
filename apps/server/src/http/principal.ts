import type { Scope } from '@sll/contracts';
import type { OwnerSession } from '../auth/sessions.ts';
import type { AgentToken } from '../auth/tokens.ts';

export type AuthMode = 'public' | 'exchange' | 'any' | 'owner';

export interface OwnerPrincipal {
  readonly kind: 'owner';
  /** Stable principal key for receipts/leases: `session:<id>`. */
  readonly key: string;
  readonly session: OwnerSession;
  readonly cookie: string;
}

export interface AgentPrincipal {
  readonly kind: 'agent';
  /** `token:<id>` */
  readonly key: string;
  readonly token: AgentToken;
  readonly scopes: ReadonlySet<Scope>;
}

export type Principal = OwnerPrincipal | AgentPrincipal;

export function hasScope(p: Principal, scope: Scope): boolean {
  return p.kind === 'owner' || p.scopes.has(scope);
}

declare module 'fastify' {
  interface FastifyRequest {
    principal: Principal | null;
  }
  interface FastifyContextConfig {
    op?: string;
    auth?: AuthMode;
  }
}
