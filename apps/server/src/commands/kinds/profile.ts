// preference.set, profile.timezone-preview, profile.settings
import { randomUUID } from 'node:crypto';
import type { Payload_preference_set, Payload_profile_settings, Payload_profile_timezone_preview } from '@sll/contracts';
import { conflict, unprocessable } from '../../http/errors.ts';
import { isValidTimeZone } from '../../domain-adapter.ts';
import { targetKey } from '../../content/types.ts';
import { applyToTarget } from '../../learning/targets.ts';
import { TIMEZONE_PREVIEW_TTL_MS } from '../../state.ts';
import { ref, requireRevision, type CommandEnv, type CommandResult } from '../env.ts';

/** Frequency and pause are orthogonal; explicit targets only; reversible; never a grade change. */
export function preferenceSet(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_preference_set;
  const existing = env.db.prepare('SELECT revision FROM learner_preferences WHERE id = ?').get(env.cmd.subjectId) as { revision: number } | undefined;
  requireRevision(existing?.revision ?? 0, env.cmd.expectedRevision);
  if (env.cmd.expectedRevision !== 0) throw conflict('STALE_REVISION', 0);
  if (p.frequency === undefined && p.paused === undefined) throw unprocessable('PREFERENCE_EMPTY');
  for (const t of p.targets) if (!env.repo.skill(t.skillId)?.body.modalities.includes(t.modality)) throw unprocessable('UNKNOWN_TARGET');
  const id = env.cmd.subjectId;
  env.db
    .prepare('INSERT INTO learner_preferences (id, revision, targets, frequency, paused, source, created_at) VALUES (?, 1, ?, ?, ?, ?, ?)')
    .run(id, JSON.stringify(p.targets), p.frequency ?? null, p.paused === undefined ? null : p.paused ? 1 : 0, env.principal.kind === 'agent' ? 'agent' : 'ui', env.now.toISOString());
  const seq = env.event('preference.set', 'preference', id, { targets: p.targets.map(targetKey), ...(p.frequency ? { frequency: p.frequency } : {}), ...(p.paused !== undefined ? { paused: p.paused } : {}) });
  for (const t of p.targets) {
    applyToTarget(env.db, targetKey(t), { type: 'preference-set', date: env.today, ...(p.frequency ? { frequency: p.frequency } : {}), ...(p.paused !== undefined ? { paused: p.paused } : {}) }, seq);
  }
  env.markCommitted('preference.set');
  return { entities: [ref(id, 1, 'preference')], outcome: 'updated', createdEntityId: id };
}

export function profileTimezonePreview(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_profile_timezone_preview;
  const profile = env.state.store.profile();
  if (env.cmd.subjectId.toLowerCase() !== profile.id.toLowerCase()) throw unprocessable('SUBJECT_MISMATCH');
  requireRevision(profile.revision, env.cmd.expectedRevision);
  if (!isValidTimeZone(p.reviewTimezone)) throw unprocessable('INVALID_TIMEZONE');
  const id = randomUUID();
  env.state.previews.set(id, {
    id,
    revision: 1,
    profileEpoch: profile.epoch,
    profileRevision: profile.revision,
    fromZone: profile.reviewTimezone,
    toZone: p.reviewTimezone,
    expiresAt: new Date(env.now.getTime() + TIMEZONE_PREVIEW_TTL_MS).toISOString(),
  });
  return { entities: [ref(id, 1, 'timezone-preview')], outcome: 'created', createdEntityId: id };
}

/** At least one setting; a timezone change needs its matching unexpired preview (bound to epoch + profile revision). */
export function profileSettings(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_profile_settings;
  const profile = env.state.store.profile();
  if (env.cmd.subjectId.toLowerCase() !== profile.id.toLowerCase()) throw unprocessable('SUBJECT_MISMATCH');
  requireRevision(profile.revision, env.cmd.expectedRevision);
  if (p.reviewTimezone === undefined && p.audioSpeed === undefined && p.theme === undefined) throw unprocessable('SETTINGS_EMPTY');
  const row = env.db.prepare('SELECT audio_speed, theme FROM profiles WHERE id = ?').get(profile.id) as { audio_speed: number; theme: string };
  const changes: Record<string, unknown> = {};
  if (p.reviewTimezone !== undefined && p.reviewTimezone !== profile.reviewTimezone) {
    const preview = p.timezonePreviewId ? env.state.previews.get(p.timezonePreviewId.toLowerCase()) ?? env.state.previews.get(p.timezonePreviewId) : undefined;
    if (!preview || preview.toZone !== p.reviewTimezone || Date.parse(preview.expiresAt) <= env.now.getTime()) throw unprocessable('TIMEZONE_PREVIEW_REQUIRED');
    if (preview.profileEpoch !== profile.epoch || preview.profileRevision !== profile.revision) throw conflict('STALE_REVISION', profile.revision);
    changes.reviewTimezone = { from: profile.reviewTimezone, to: p.reviewTimezone };
    env.state.previews.delete(preview.id);
  }
  if (p.audioSpeed !== undefined && p.audioSpeed !== row.audio_speed) changes.audioSpeed = p.audioSpeed;
  if (p.theme !== undefined && p.theme !== row.theme) changes.theme = p.theme;
  if (Object.keys(changes).length === 0) return { entities: [ref(profile.id, profile.revision, 'profile')], outcome: 'unchanged' };
  env.db
    .prepare(
      `UPDATE profiles SET review_timezone = coalesce(?, review_timezone), audio_speed = coalesce(?, audio_speed), theme = coalesce(?, theme),
       revision = revision + 1, updated_at = ? WHERE id = ?`,
    )
    .run(changes.reviewTimezone ? p.reviewTimezone : null, changes.audioSpeed !== undefined ? p.audioSpeed : null, changes.theme !== undefined ? p.theme : null, env.now.toISOString(), profile.id);
  // Historical UTC/local dates and existing dueDate labels are kept; only future dates use the new zone.
  env.event(changes.reviewTimezone ? 'profile.timezone-changed' : 'profile.settings-changed', 'profile', profile.id, changes);
  env.markCommitted('profile.settings');
  return { entities: [ref(profile.id, profile.revision + 1, 'profile')], outcome: 'updated' };
}
