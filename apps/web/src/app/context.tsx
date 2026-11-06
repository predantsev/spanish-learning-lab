import { createContext, useContext } from 'react';
import type { ApiClient } from '../api/client.ts';
import type { OwnerProfile, Session } from '../api/types.ts';
import type { KeyboardPlatform } from '../lib/keyboard.ts';
import type { OutboxStore } from '../outbox/store.ts';

export type ConnectionState = 'ok' | 'unreachable';

export interface AppServices {
  readonly api: ApiClient;
  readonly outbox: OutboxStore;
  readonly session: Session;
  readonly platform: KeyboardPlatform;
  /** Development-only fixture adapter is active (read-only demo data, labelled in the UI). */
  readonly demo: boolean;
  readonly profile: OwnerProfile | null;
  readonly setProfile: (profile: OwnerProfile) => void;
  readonly connection: ConnectionState;
  /** Re-checks /health after a network failure. */
  readonly checkConnection: () => Promise<boolean>;
  readonly epochChanged: boolean;
  readonly authLost: boolean;
  readonly locale: string;
}

export const AppContext = createContext<AppServices | null>(null);

export function useApp(): AppServices {
  const services = useContext(AppContext);
  if (!services) throw new Error('useApp outside AppContext');
  return services;
}

/** Called when a learner opens interface help inside an exercise (recorded as neutral help). */
export const HelpObserverContext = createContext<((topic: string) => void) | null>(null);
