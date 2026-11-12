// Initial profile schema (DOMAIN-SPEC §Identity, revisions and transactions).
// JSON columns are TEXT checked with json_valid; timestamps are UTC ISO-8601; local dates YYYY-MM-DD.
export const migration0001 = {
  version: 1,
  name: 'initial profile schema',
  sql: `
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  epoch INTEGER NOT NULL CHECK (epoch >= 1),
  revision INTEGER NOT NULL DEFAULT 1,
  review_timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
  audio_speed REAL NOT NULL DEFAULT 1 CHECK (audio_speed IN (1, 0.85)),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system','light','dark')),
  locale TEXT NOT NULL DEFAULT 'uk',
  queue_state TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(queue_state)),
  last_restore_operation_id TEXT,
  last_restore_archive_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE curriculum_nodes (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('block','objective','lesson','optional-check','supporting-allocation')),
  block_id TEXT,
  position INTEGER NOT NULL,
  title_uk TEXT NOT NULL,
  pack_id TEXT
) STRICT;

CREATE TABLE content_revisions (
  revision_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('lesson','task','skill','lexeme','clip','phrase','collection','material','situation','source')),
  logical_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('draft','needs-review','reviewed','ready','retired','quarantined')),
  sha256 TEXT NOT NULL CHECK (length(sha256) = 64),
  body TEXT NOT NULL CHECK (json_valid(body)),
  origin TEXT NOT NULL CHECK (origin IN ('course','personal','agent')),
  parent_revision_id TEXT REFERENCES content_revisions(revision_id),
  pack_id TEXT,
  provenance TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(provenance)),
  created_at TEXT NOT NULL,
  UNIQUE (kind, logical_id, sha256)
) STRICT;
CREATE INDEX content_revisions_logical ON content_revisions(kind, logical_id);

CREATE TABLE active_content (
  kind TEXT NOT NULL,
  logical_id TEXT NOT NULL,
  revision_id TEXT NOT NULL REFERENCES content_revisions(revision_id),
  activated_at TEXT NOT NULL,
  PRIMARY KEY (kind, logical_id)
) STRICT;

CREATE TABLE packs (
  pack_id TEXT NOT NULL,
  version TEXT NOT NULL,
  manifest_sha256 TEXT NOT NULL CHECK (length(manifest_sha256) = 64),
  manifest TEXT NOT NULL CHECK (json_valid(manifest)),
  state TEXT NOT NULL CHECK (state IN ('staged','active','retained','failed')),
  preview INTEGER NOT NULL DEFAULT 0 CHECK (preview IN (0,1)),
  installed_at TEXT NOT NULL,
  activated_at TEXT,
  PRIMARY KEY (pack_id, version)
) STRICT;

CREATE TABLE assets (
  sha256 TEXT PRIMARY KEY CHECK (length(sha256) = 64),
  mime TEXT NOT NULL CHECK (mime IN ('audio/mpeg')),
  bytes INTEGER NOT NULL CHECK (bytes > 0),
  rel_path TEXT NOT NULL,
  duration_ms INTEGER,
  clip_logical_id TEXT,
  rights TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(rights)),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE skills (
  skill_id TEXT PRIMARY KEY,
  revision_id TEXT NOT NULL REFERENCES content_revisions(revision_id),
  title_uk TEXT NOT NULL,
  modalities TEXT NOT NULL CHECK (json_valid(modalities)),
  first_lesson TEXT NOT NULL
) STRICT;

CREATE TABLE event_log (
  event_seq INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  profile_epoch INTEGER NOT NULL,
  kind TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  operation_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(payload))
) STRICT;
CREATE INDEX event_log_entity ON event_log(entity_type, entity_id);

CREATE TABLE target_states (
  skill_id TEXT NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('written-form','context-choice','reading-meaning','listening-meaning','dictation','phrase-recall','construction-use')),
  revision INTEGER NOT NULL DEFAULT 1,
  stage INTEGER NOT NULL DEFAULT 0 CHECK (stage BETWEEN 0 AND 4),
  due_date TEXT,
  pending_need INTEGER NOT NULL DEFAULT 0 CHECK (pending_need IN (0,1)),
  frequency TEXT NOT NULL DEFAULT 'usual' CHECK (frequency IN ('usual','repeat-more','known')),
  paused INTEGER NOT NULL DEFAULT 0 CHECK (paused IN (0,1)),
  introduced_date TEXT,
  last_offered_sequence INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(state)),
  projection_version INTEGER NOT NULL,
  last_event_seq INTEGER NOT NULL,
  PRIMARY KEY (skill_id, modality)
) STRICT;
CREATE INDEX target_states_due ON target_states(due_date);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  mode TEXT NOT NULL CHECK (mode IN ('learn','practice','review','listening')),
  source TEXT NOT NULL CHECK (source IN ('lesson','practice-set','recommended')),
  source_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active','finished')),
  queue_snapshot TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(queue_snapshot)),
  task_revision_ids TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(task_revision_ids)),
  seed TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  summary_id TEXT
) STRICT;

CREATE TABLE lesson_progress (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  lesson_id TEXT NOT NULL UNIQUE,
  visited_step_ids TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(visited_step_ids)),
  status TEXT NOT NULL CHECK (status IN ('visited','completed')),
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE summaries (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  session_id TEXT REFERENCES sessions(id),
  body TEXT NOT NULL CHECK (json_valid(body)),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE contexts (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  task_revision_id TEXT NOT NULL REFERENCES content_revisions(revision_id),
  open INTEGER NOT NULL DEFAULT 1 CHECK (open IN (0,1)),
  title TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('learn','practice','review','listening')),
  last_activity_at TEXT NOT NULL,
  last_typing_at TEXT,
  created_at TEXT NOT NULL,
  closed_at TEXT
) STRICT;

CREATE TABLE drafts (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  context_id TEXT NOT NULL REFERENCES contexts(id),
  task_revision_id TEXT NOT NULL REFERENCES content_revisions(revision_id),
  text TEXT NOT NULL DEFAULT '',
  cursor INTEGER NOT NULL DEFAULT 0,
  recovered_from_operation_id TEXT,
  saved_at TEXT NOT NULL
) STRICT;

CREATE TABLE attempts (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  context_id TEXT NOT NULL REFERENCES contexts(id),
  draft_id TEXT REFERENCES drafts(id),
  draft_revision INTEGER,
  task_revision_id TEXT NOT NULL REFERENCES content_revisions(revision_id),
  previous_attempt_id TEXT REFERENCES attempts(id),
  response_kind TEXT NOT NULL CHECK (response_kind IN ('text','option')),
  original_answer TEXT NOT NULL,
  normalized_answer TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('checked','unresolved')),
  support_snapshot TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(support_snapshot)),
  pinned TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(pinned)),
  submitted_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  saved_for_review INTEGER NOT NULL DEFAULT 0 CHECK (saved_for_review IN (0,1))
) STRICT;

CREATE TABLE target_results (
  attempt_id TEXT NOT NULL REFERENCES attempts(id),
  skill_id TEXT NOT NULL,
  modality TEXT NOT NULL,
  correctness TEXT NOT NULL CHECK (correctness IN ('correct','incorrect','unresolved','invalid-item')),
  independence TEXT NOT NULL CHECK (independence IN ('independent','supported','unknown','not-assessed')),
  explanation_key TEXT NOT NULL,
  matched_variant_id TEXT,
  context_family TEXT,
  clip_hash TEXT,
  eligible INTEGER NOT NULL DEFAULT 0 CHECK (eligible IN (0,1)),
  PRIMARY KEY (attempt_id, skill_id, modality)
) STRICT;

CREATE TABLE support_events (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  context_id TEXT REFERENCES contexts(id),
  attempt_id TEXT REFERENCES attempts(id),
  task_revision_id TEXT REFERENCES content_revisions(revision_id),
  kind TEXT NOT NULL CHECK (kind IN ('interface-help','replay','speed-change','learner-reported-help','rule','targeted-clue','translation','transcript','reveal','external-help','delivery-unknown')),
  source TEXT NOT NULL CHECK (source IN ('ui','agent','learner-report')),
  delivery TEXT NOT NULL CHECK (delivery IN ('prepared','delivered','confirmed-undelivered','delivery-unknown','neutral')),
  delivery_route TEXT CHECK (delivery_route IN ('app','external')),
  phase TEXT CHECK (phase IN ('before-submit','after-submit','unknown')),
  targets TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(targets)),
  blocks TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(blocks)),
  content_hash TEXT,
  detail_key TEXT,
  delivery_id TEXT,
  client_id TEXT,
  reported_delivered_at TEXT,
  recorded_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  expires_at TEXT
) STRICT;
CREATE INDEX support_events_context ON support_events(context_id);

CREATE TABLE review_reports (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  attempt_id TEXT REFERENCES attempts(id),
  content_revision_id TEXT REFERENCES content_revisions(revision_id),
  state TEXT NOT NULL CHECK (state IN ('draft','needs-review','validated','rejected')),
  report TEXT NOT NULL CHECK (json_valid(report)),
  answer_hash TEXT,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE adjudications (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES attempts(id),
  review_report_id TEXT REFERENCES review_reports(id),
  supersedes_id TEXT REFERENCES adjudications(id),
  verdicts TEXT NOT NULL CHECK (json_valid(verdicts)),
  provenance TEXT NOT NULL CHECK (json_valid(provenance)),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE learner_preferences (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  targets TEXT NOT NULL CHECK (json_valid(targets)),
  frequency TEXT CHECK (frequency IN ('usual','repeat-more','known')),
  paused INTEGER CHECK (paused IN (0,1)),
  source TEXT NOT NULL CHECK (source IN ('ui','agent')),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE phrase_records (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL CHECK (source IN ('course','spanish','uk-intent')),
  course_revision_id TEXT REFERENCES content_revisions(revision_id),
  course_logical_id TEXT,
  spanish TEXT NOT NULL DEFAULT '',
  meaning TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL CHECK (state IN ('draft','needs-review','reviewed','ready','retired','quarantined')),
  archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0,1)),
  priority INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL CHECK (created_by IN ('ui','agent','course')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;
CREATE UNIQUE INDEX phrase_records_course ON phrase_records(course_logical_id) WHERE source = 'course';

CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('course','personal')),
  course_logical_id TEXT,
  archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0,1)),
  created_by TEXT NOT NULL CHECK (created_by IN ('ui','agent','course')),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE collection_members (
  collection_id TEXT NOT NULL REFERENCES collections(id),
  phrase_id TEXT NOT NULL REFERENCES phrase_records(id),
  position INTEGER NOT NULL,
  PRIMARY KEY (collection_id, phrase_id)
) STRICT;

CREATE TABLE practice_sets (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  targets TEXT NOT NULL CHECK (json_valid(targets)),
  task_revision_ids TEXT NOT NULL CHECK (json_valid(task_revision_ids)),
  phrase_ids TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(phrase_ids)),
  mode TEXT NOT NULL CHECK (mode IN ('written','listening','mixed')),
  created_by TEXT NOT NULL CHECK (created_by IN ('ui','agent')),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE mutation_receipts (
  operation_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  body_digest TEXT NOT NULL CHECK (length(body_digest) = 64),
  principal TEXT NOT NULL,
  profile_epoch INTEGER NOT NULL,
  receipt TEXT NOT NULL CHECK (json_valid(receipt)),
  created_entity_id TEXT,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE backup_records (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('daily','weekly','pre-change','rollback','manual')),
  reason TEXT,
  local_date TEXT NOT NULL,
  iso_week TEXT NOT NULL,
  rel_path TEXT NOT NULL,
  sha256 TEXT NOT NULL CHECK (length(sha256) = 64),
  bytes INTEGER NOT NULL,
  event_seq INTEGER NOT NULL,
  profile_epoch INTEGER NOT NULL,
  schema_version INTEGER NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('verified','superseded','failed')),
  created_at TEXT NOT NULL,
  verified_at TEXT
) STRICT;

CREATE TABLE import_attestations (
  id TEXT PRIMARY KEY,
  archive_hash TEXT NOT NULL CHECK (length(archive_hash) = 64),
  operation_id TEXT NOT NULL,
  source_trust TEXT NOT NULL CHECK (source_trust IN ('verified-key','imported-unverified','none-required')),
  unverified_receipt_count INTEGER NOT NULL DEFAULT 0,
  details TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(details)),
  imported_at TEXT NOT NULL
) STRICT;

CREATE TABLE auth_tokens (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  scopes TEXT NOT NULL CHECK (json_valid(scopes)),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT
) STRICT;

CREATE TABLE owner_sessions (
  id TEXT PRIMARY KEY,
  cookie_hash TEXT NOT NULL UNIQUE CHECK (length(cookie_hash) = 64),
  csrf_token TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  profile_epoch INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  absolute_expires_at TEXT NOT NULL,
  revoked_at TEXT
) STRICT;
`,
} as const;
