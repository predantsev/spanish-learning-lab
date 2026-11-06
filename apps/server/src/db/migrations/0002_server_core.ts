// Server-core additions (WP-02/WP-07, issue #111). Appended migration; 0001 is never edited.
// - support_events.context_revision: support confirm/cancel bind the ORIGINAL context identifiers
//   (API.md §Commands), so the context revision at reservation time is stored with the reservation.
// - profiles.scheduler_state: profile-level part of the @sll/domain SchedulerState (timezone,
//   lastEventSeq, lastInstant, lastLocalDate, invalidatedTaskRevisions, diagnostics); per-target
//   TargetState JSON lives in target_states.state. Both are projections rebuildable from event_log.
// - mutation_receipts(created_entity_id, principal): object-level read checks ("draft:write reads
//   its created records") resolve the creating principal through the receipt of the creating write.
// - drafts.recovered_from_operation_id unique: a stale draft.save keeps its text exactly once as a
//   recovered draft, even when the same operation is retried.
export const migration0002 = {
  version: 2,
  name: 'server core indexes, support context revision and scheduler state',
  sql: `
ALTER TABLE support_events ADD COLUMN context_revision INTEGER;
ALTER TABLE profiles ADD COLUMN scheduler_state TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(scheduler_state));
CREATE INDEX mutation_receipts_created ON mutation_receipts(created_entity_id, principal);
CREATE UNIQUE INDEX drafts_recovered_operation ON drafts(recovered_from_operation_id) WHERE recovered_from_operation_id IS NOT NULL;
CREATE INDEX contexts_activity ON contexts(last_activity_at);
CREATE INDEX attempts_context ON attempts(context_id);
CREATE INDEX attempts_task ON attempts(task_revision_id);
CREATE INDEX target_results_target ON target_results(skill_id, modality);
CREATE INDEX content_revisions_kind_state ON content_revisions(kind, state);
`,
} as const;
