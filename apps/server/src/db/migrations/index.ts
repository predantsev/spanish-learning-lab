// Ordered migration registry. Append new migrations; never edit an applied one (checksums are verified).
import { migration0001 } from './0001_initial.ts';

export interface Migration {
  readonly version: number;
  readonly name: string;
  readonly sql: string;
}

export const migrations: readonly Migration[] = [migration0001];

/** Tables whose rows are portable profile data (logical export/restore). Credentials/sessions are excluded. */
export const PORTABLE_TABLES = [
  'profiles', 'curriculum_nodes', 'content_revisions', 'active_content', 'packs', 'assets', 'skills',
  'event_log', 'target_states', 'sessions', 'lesson_progress', 'summaries', 'contexts', 'drafts',
  'attempts', 'target_results', 'support_events', 'review_reports', 'adjudications',
  'learner_preferences', 'phrase_records', 'collections', 'collection_members', 'practice_sets',
  'mutation_receipts', 'backup_records', 'import_attestations',
] as const;

/** Never exported: active credentials and browser sessions. */
export const NON_PORTABLE_TABLES = ['auth_tokens', 'owner_sessions', 'schema_migrations'] as const;
