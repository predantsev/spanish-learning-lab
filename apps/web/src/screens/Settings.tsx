// Settings: review timezone (preview → confirm), default audio speed, theme (system/light/dark),
// interface locale (Ukrainian only), agent tokens (secret shown once), recovery (export download,
// archive upload → restore preview → typed confirmation) and unsaved local drafts.
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useCommandRunner, useOutboxEntries, useResource } from '../app/hooks.ts';
import { makeCommand, receiptEntity } from '../api/commands.ts';
import { ApiRequestError } from '../api/errors.ts';
import type {
  Artifact,
  Envelope,
  ExportRequest,
  OwnerProfile,
  RestoreConfirm,
  RestorePreview,
  RestorePreviewRequest,
  Scope,
  TimezonePreview,
  TokenCreate,
  TokenCreated,
  TokenList,
  TokenMetadata,
} from '../api/types.ts';
import { ConfirmDialog } from '../components/Dialog.tsx';
import { CopyButton, downloadText, PageHeader } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import { getLocale, nativeName } from '../i18n/registry.ts';
import { formatBytes, formatDateTime, shortHash } from '../lib/format.ts';
import { newId } from '../lib/ids.ts';
import { outboxExportText, type OutboxEntry } from '../outbox/store.ts';
import { Link } from '../router/history.tsx';
import { paths } from '../router/routes.ts';

function useProfile() {
  const { api, setProfile } = useApp();
  return useResource('profile', async (signal) => {
    const profile = (await api.get<OwnerProfile>('/profile', signal)).data;
    setProfile(profile);
    return profile;
  });
}

function timeZones(): string[] {
  try {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    return intl.supportedValuesOf ? intl.supportedValuesOf('timeZone') : [];
  } catch {
    return [];
  }
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const profile = useProfile();
  return (
    <div className="page">
      <PageHeader title={t('settings.title')} help="settings.overview" />
      {profile.state.status === 'loading' ? <LoadingState /> : null}
      {profile.state.status === 'error' ? <ErrorState error={profile.state.error} onRetry={profile.reload} /> : null}
      {profile.state.status === 'ready' ? <SettingsContent profile={profile.state.data} reload={profile.reload} /> : null}
      <div className="card-grid">
        <section className="card">
          <h2>{t('settings.agents.title')}</h2>
          <p>{t('settings.agents.summary')}</p>
          <Link className="btn btn-secondary" to={paths.settingsAgents()}>
            {t('settings.agents.open')}
          </Link>
        </section>
        <section className="card">
          <h2>{t('settings.recovery.title')}</h2>
          <p>{t('settings.recovery.summary')}</p>
          <Link className="btn btn-secondary" to={paths.settingsRecovery()}>
            {t('settings.recovery.open')}
          </Link>
        </section>
      </div>
    </div>
  );
}

export function SettingsContent({ profile, reload }: { readonly profile: OwnerProfile; readonly reload: () => void }) {
  const { t } = useTranslation();
  const { api, locale } = useApp();
  const runner = useCommandRunner();
  const previewRunner = useCommandRunner();
  const [zone, setZone] = useState(profile.reviewTimezone);
  const [preview, setPreview] = useState<TimezonePreview | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const zones = useMemo(timeZones, []);
  const zoneListId = useId();
  const localeInfo = getLocale(locale);

  const saveSettings = async (payload: { audioSpeed?: 1 | 0.85; theme?: 'system' | 'light' | 'dark'; reviewTimezone?: string; timezonePreviewId?: string }, expectedRevision: number, messageKey: string) => {
    setSaved(null);
    const receipt = await runner.run(makeCommand('profile.settings', api.profileEpoch, { subjectId: profile.id, expectedRevision, payload }));
    if (receipt) {
      setSaved(t(messageKey));
      setPreview(null);
      reload();
    }
  };

  const requestPreview = async () => {
    setPreview(null);
    const receipt = await previewRunner.run(
      makeCommand('profile.timezone-preview', api.profileEpoch, { subjectId: profile.id, expectedRevision: profile.revision, payload: { reviewTimezone: zone.trim() } }),
    );
    const ref = receipt ? receiptEntity(receipt, 'timezone-preview') : undefined;
    if (ref) setPreview(await api.resource<TimezonePreview>('timezone-preview', ref.id));
  };

  return (
    <>
      {saved ? (
        <p className="notice notice-success" role="status">
          {saved}
        </p>
      ) : null}
      <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
      <section className="card" aria-labelledby="settings-timezone">
        <div className="page-title-row">
          <h2 id="settings-timezone">{t('settings.timezone.title')}</h2>
          <HelpButton topic="settings.timezone" />
        </div>
        <p>{t('settings.timezone.current', { zone: profile.reviewTimezone })}</p>
        <div className="field">
          <label htmlFor="settings-zone">{t('settings.timezone.label')}</label>
          <input id="settings-zone" type="text" list={zoneListId} value={zone} maxLength={80} autoComplete="off" spellCheck={false} onChange={(event) => setZone(event.target.value)} />
          <datalist id={zoneListId}>
            {zones.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          <span className="field-hint">{t('settings.timezone.hint')}</span>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!zone.trim() || zone.trim() === profile.reviewTimezone || previewRunner.status === 'pending'}
          onClick={() => void requestPreview()}
        >
          {t('settings.timezone.preview')}
        </button>
        <ActionError error={previewRunner.status === 'failed' ? previewRunner.error : null} onRetry={previewRunner.canRetry ? () => void previewRunner.retry() : undefined} />
        {preview ? (
          <div className="notice notice-info" data-testid="timezone-preview">
            <div>
              <p>{t('settings.timezone.previewBody', { from: preview.fromZone, to: preview.toZone })}</p>
              <p>{t('settings.timezone.retained')}</p>
              <p className="small">{t('settings.timezone.expires', { date: formatDateTime(preview.expiresAt, locale) })}</p>
              <div className="row">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={runner.status === 'pending'}
                  onClick={() => void saveSettings({ reviewTimezone: preview.toZone, timezonePreviewId: preview.id }, preview.profileRevision, 'settings.timezone.saved')}
                >
                  {t('settings.timezone.confirm')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setPreview(null)}>
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="card" aria-labelledby="settings-audio">
        <fieldset>
          <legend id="settings-audio">
            {t('settings.audio.title')} <HelpButton topic="settings.audio" />
          </legend>
          {([1, 0.85] as const).map((speed) => (
            <label key={speed} className="choice">
              <input
                type="radio"
                name="audio-speed"
                checked={profile.audioSpeed === speed}
                disabled={runner.status === 'pending'}
                onChange={() => void saveSettings({ audioSpeed: speed }, profile.revision, 'settings.audio.saved')}
              />
              {t(speed === 1 ? 'settings.audio.normal' : 'settings.audio.slower')}
            </label>
          ))}
        </fieldset>
      </section>

      <section className="card" aria-labelledby="settings-theme">
        <fieldset>
          <legend id="settings-theme">
            {t('settings.theme.title')} <HelpButton topic="settings.theme" />
          </legend>
          {(['system', 'light', 'dark'] as const).map((theme) => (
            <label key={theme} className="choice">
              <input
                type="radio"
                name="theme"
                checked={profile.theme === theme}
                disabled={runner.status === 'pending'}
                onChange={() => void saveSettings({ theme }, profile.revision, 'settings.theme.saved')}
              />
              {t(`settings.theme.${theme}`)}
            </label>
          ))}
        </fieldset>
      </section>

      <section className="card" aria-labelledby="settings-locale">
        <h2 id="settings-locale">{t('settings.locale.title')}</h2>
        <p>
          {t('settings.locale.current')}: <strong>{nativeName(localeInfo)}</strong>
        </p>
        <p className="muted small">{t('settings.locale.note')}</p>
      </section>
    </>
  );
}

const ALL_SCOPES: readonly Scope[] = ['context:read', 'course:read', 'draft:write', 'help:write', 'practice:write', 'preference:write'];
const DEFAULT_SCOPES: readonly Scope[] = ['context:read', 'course:read', 'draft:write', 'help:write', 'practice:write'];

function tokenStatus(token: TokenMetadata, now: number): 'active' | 'revoked' | 'expired' {
  if (token.revoked) return 'revoked';
  return new Date(token.expiresAt).getTime() <= now ? 'expired' : 'active';
}

export function AgentsScreen() {
  const { t } = useTranslation();
  const { api, locale } = useApp();
  const tokens = useResource('tokens', (signal) => api.get<TokenList>('/auth/tokens', signal).then((envelope) => envelope.data));
  const [label, setLabel] = useState('');
  const [scopes, setScopes] = useState<readonly Scope[]>(DEFAULT_SCOPES);
  const [ttl, setTtl] = useState(7);
  const [secret, setSecret] = useState<TokenCreated | null>(null);
  const [pendingCreate, setPendingCreate] = useState<TokenCreate | null>(null);
  const [createError, setCreateError] = useState<unknown>(null);
  const [orphanTokenId, setOrphanTokenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<TokenMetadata | null>(null);
  const [revokeError, setRevokeError] = useState<unknown>(null);
  const formId = useId();

  const create = async (retryBody?: TokenCreate) => {
    if (tokens.state.status !== 'ready') return;
    setBusy(true);
    setCreateError(null);
    setOrphanTokenId(null);
    // A retry after a lost response resends the identical body (same operationId); the service then
    // answers TOKEN_ALREADY_CREATED instead of creating a second token or revealing the secret again.
    const body: TokenCreate = retryBody ?? {
      operationId: newId(),
      profileEpoch: api.profileEpoch,
      expectedRevision: tokens.state.data.profileRevision,
      label: label.trim().slice(0, 80),
      scopes: [...scopes],
      ttlDays: ttl,
    };
    try {
      const response = await api.ownerWrite<Envelope<TokenCreated>, TokenCreate>('POST', '/auth/tokens', body);
      setSecret(response.data);
      setPendingCreate(null);
      setLabel('');
      tokens.reload();
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === 'TOKEN_ALREADY_CREATED') {
        setPendingCreate(null);
        setOrphanTokenId(error.body?.createdEntityId ?? null);
        tokens.reload();
      } else {
        setPendingCreate(error instanceof ApiRequestError && error.retryable ? body : null);
      }
      setCreateError(error);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (tokenId: string) => {
    if (tokens.state.status !== 'ready') return;
    setRevokeError(null);
    try {
      await api.ownerWrite('DELETE', `/auth/tokens/${encodeURIComponent(tokenId)}`, {
        operationId: newId(),
        profileEpoch: api.profileEpoch,
        expectedRevision: tokens.state.data.profileRevision,
      });
      setRevokeTarget(null);
      setOrphanTokenId(null);
      tokens.reload();
    } catch (error) {
      setRevokeError(error);
    }
  };

  const now = Date.now();
  return (
    <div className="page">
      <Link className="btn btn-ghost back-link" to={paths.settings()}>
        ← {t('settings.title')}
      </Link>
      <PageHeader title={t('agents.title')} lead={t('agents.lead')} help="agents.tokens" />
      {secret ? (
        <section className="card card-focus" role="alert" data-testid="token-secret">
          <h2>{t('agents.secret.title')}</h2>
          <p>{t('agents.secret.body')}</p>
          <p className="token-secret">{secret.token}</p>
          <div className="row">
            <CopyButton text={secret.token} labelKey="agents.secret.copy" />
            <button type="button" className="btn btn-primary" onClick={() => setSecret(null)}>
              {t('agents.secret.done')}
            </button>
          </div>
          <p className="small muted">{t('agents.secret.expires', { date: formatDateTime(secret.expiresAt, locale) })}</p>
        </section>
      ) : null}

      <section className="card" aria-labelledby="agents-create">
        <h2 id="agents-create">{t('agents.create.title')}</h2>
        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <div className="field">
            <label htmlFor={`${formId}-label`}>{t('agents.create.label')}</label>
            <input id={`${formId}-label`} type="text" value={label} maxLength={80} onChange={(event) => setLabel(event.target.value)} />
            <span className="field-hint">{t('agents.create.labelHint')}</span>
          </div>
          <fieldset>
            <legend>
              {t('agents.create.scopes')} <HelpButton topic="agents.scopes" />
            </legend>
            {ALL_SCOPES.map((scope) => (
              <label key={scope} className="choice">
                <input
                  type="checkbox"
                  checked={scopes.includes(scope)}
                  onChange={(event) => setScopes((previous) => (event.target.checked ? [...previous, scope] : previous.filter((value) => value !== scope)))}
                />
                <span>
                  <code>{scope}</code> — {t(`agents.scopes.${scope}`)}
                </span>
              </label>
            ))}
          </fieldset>
          <div className="field">
            <label htmlFor={`${formId}-ttl`}>{t('agents.create.ttl')}</label>
            <input
              id={`${formId}-ttl`}
              type="number"
              min={1}
              max={30}
              value={ttl}
              onChange={(event) => setTtl(Math.max(1, Math.min(30, Math.round(Number(event.target.value) || 7))))}
            />
            <span className="field-hint">{t('agents.create.ttlHint')}</span>
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy || !label.trim() || scopes.length === 0 || tokens.state.status !== 'ready'}>
            {t('agents.create.submit')}
          </button>
        </form>
        {createError ? <ActionError error={createError} onRetry={pendingCreate ? () => void create(pendingCreate) : undefined} /> : null}
        {orphanTokenId ? (
          <div className="notice notice-warning">
            <span>{t('agents.orphan')}</span>
            <button type="button" className="btn btn-small btn-danger" onClick={() => void revoke(orphanTokenId)}>
              {t('agents.revoke')}
            </button>
          </div>
        ) : null}
      </section>

      <section className="card" aria-labelledby="agents-list">
        <h2 id="agents-list">{t('agents.list.title')}</h2>
        {tokens.state.status === 'loading' ? <LoadingState /> : null}
        {tokens.state.status === 'error' ? <ErrorState error={tokens.state.error} onRetry={tokens.reload} /> : null}
        {tokens.state.status === 'ready' ? (
          tokens.state.data.items.length === 0 ? (
            <EmptyState title={t('agents.list.empty')} />
          ) : (
            <ul className="plain-list">
              {tokens.state.data.items.map((token) => {
                const status = tokenStatus(token, now);
                return (
                  <li key={token.id} className="target-row" data-testid="token-row">
                    <p className="strong">{token.label}</p>
                    <p className="small">
                      {t(`agents.status.${status}`)} · {t('agents.list.created', { date: formatDateTime(token.createdAt, locale) })} ·{' '}
                      {t('agents.list.expires', { date: formatDateTime(token.expiresAt, locale) })}
                    </p>
                    <p className="small muted">{token.scopes.join(', ')}</p>
                    {status === 'active' ? (
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => setRevokeTarget(token)}>
                        {t('agents.revoke')}
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )
        ) : null}
        <ActionError error={revokeError} />
      </section>
      <ConfirmDialog
        open={revokeTarget !== null}
        title={t('agents.revokeTitle')}
        body={<p>{t('agents.revokeBody', { label: revokeTarget?.label ?? '' })}</p>}
        confirmLabel={t('agents.revoke')}
        danger
        onConfirm={() => revokeTarget && void revoke(revokeTarget.id)}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
}

export function RecoveryScreen() {
  const { t } = useTranslation();
  const { api, locale, outbox, session } = useApp();
  const profile = useProfile();
  const entries = useOutboxEntries(outbox);
  const [selfContained, setSelfContained] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [exportError, setExportError] = useState<unknown>(null);
  const [busy, setBusy] = useState<'export' | 'upload' | 'confirm' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [restoreError, setRestoreError] = useState<unknown>(null);
  const [typed, setTyped] = useState('');
  const [trust, setTrust] = useState(false);
  const [restored, setRestored] = useState(false);
  const [discard, setDiscard] = useState<OutboxEntry | null>(null);
  const confirmWord = t('recovery.restore.confirmWord');
  const profileRevision = profile.state.status === 'ready' ? profile.state.data.revision : session.profileRevision;

  const doExport = async () => {
    setBusy('export');
    setExportError(null);
    setArtifact(null);
    try {
      const response = await api.ownerWrite<Envelope<Artifact>, ExportRequest>('POST', '/recovery/export', {
        operationId: newId(),
        profileEpoch: api.profileEpoch,
        expectedRevision: profileRevision,
        selfContained,
      });
      setArtifact(response.data);
    } catch (error) {
      setExportError(error);
    } finally {
      setBusy(null);
    }
  };

  const upload = async () => {
    if (!file) return;
    setBusy('upload');
    setRestoreError(null);
    setPreview(null);
    try {
      const uploaded = await api.uploadArchive(file, { operationId: newId(), profileEpoch: api.profileEpoch, expectedRevision: profileRevision });
      const response = await api.ownerWrite<Envelope<RestorePreview>, RestorePreviewRequest>('POST', '/recovery/restore-preview', {
        operationId: newId(),
        profileEpoch: api.profileEpoch,
        expectedRevision: profileRevision,
        uploadId: uploaded.id,
      });
      setPreview(response.data);
      setTyped('');
      setTrust(false);
    } catch (error) {
      setRestoreError(error);
    } finally {
      setBusy(null);
    }
  };

  const confirmRestore = async () => {
    if (!preview) return;
    setBusy('confirm');
    setRestoreError(null);
    try {
      await api.ownerWrite<unknown, RestoreConfirm>('POST', '/recovery/restore-confirm', {
        operationId: newId(),
        profileEpoch: api.profileEpoch,
        expectedRevision: profileRevision,
        previewId: preview.id,
        archiveHash: preview.archiveHash,
        trustImportedProvenance: trust,
        confirmation: preview.confirmation,
      });
      setRestored(true);
      setPreview(null);
    } catch (error) {
      setRestoreError(error);
    } finally {
      setBusy(null);
    }
  };

  const downloadUrl = artifact ? api.downloadUrl(artifact.downloadRoute) : null;
  const localText = outboxExportText(entries, (entry) => `${entry.title} (${entry.updatedAt})`);
  const canConfirm = preview !== null && typed.trim() === confirmWord && (!preview.requiresSourceTrust || trust) && busy === null;

  return (
    <div className="page">
      <Link className="btn btn-ghost back-link" to={paths.settings()}>
        ← {t('settings.title')}
      </Link>
      <PageHeader title={t('recovery.title')} lead={t('recovery.lead')} help="recovery.overview" />

      <section className="card" aria-labelledby="recovery-export">
        <h2 id="recovery-export">{t('recovery.export.title')}</h2>
        <p>{t('recovery.export.body')}</p>
        <label className="choice">
          <input type="checkbox" checked={selfContained} onChange={(event) => setSelfContained(event.target.checked)} />
          {t('recovery.export.selfContained')}
        </label>
        <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={() => void doExport()}>
          {t('recovery.export.submit')}
        </button>
        <ActionError error={exportError} />
        {artifact && downloadUrl ? (
          <div className="notice notice-success" role="status">
            <div>
              <p>
                <a href={downloadUrl} download>
                  {t('recovery.export.download')}
                </a>{' '}
                ({formatBytes(artifact.sizeBytes, locale)})
              </p>
              <p className="small">
                SHA-256: <code>{shortHash(artifact.sha256)}</code> · {t('recovery.export.expires', { date: formatDateTime(artifact.expiresAt, locale) })}
              </p>
              <p className="small">{t('recovery.export.privacy')}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="card" aria-labelledby="recovery-restore">
        <div className="page-title-row">
          <h2 id="recovery-restore">{t('recovery.restore.title')}</h2>
          <HelpButton topic="recovery.restore" />
        </div>
        {restored ? (
          <p className="notice notice-success" role="status">
            {t('recovery.restore.done')}
          </p>
        ) : (
          <>
            <p>{t('recovery.restore.body')}</p>
            <div className="field">
              <label htmlFor="restore-file">{t('recovery.restore.file')}</label>
              <input id="restore-file" type="file" accept=".zip,application/zip" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </div>
            <button type="button" className="btn btn-secondary" disabled={!file || busy !== null} onClick={() => void upload()}>
              {busy === 'upload' ? t('recovery.restore.uploading') : t('recovery.restore.preview')}
            </button>
          </>
        )}
        {preview ? (
          <div className="stack" data-testid="restore-preview">
            <h3>{t('recovery.restore.previewTitle')}</h3>
            <dl className="definition-list">
              <dt>{t('recovery.restore.attempts')}</dt>
              <dd>{preview.attemptCount}</dd>
              <dt>{t('recovery.restore.drafts')}</dt>
              <dd>{preview.draftCount}</dd>
              <dt>{t('recovery.restore.schema')}</dt>
              <dd>{preview.schemaVersion}</dd>
              <dt>{t('recovery.restore.missingAssets')}</dt>
              <dd>{preview.missingAssets.length}</dd>
              <dt>{t('recovery.restore.unverified')}</dt>
              <dd>{preview.unverifiedHistoricalReceiptCount}</dd>
              <dt>{t('recovery.restore.archive')}</dt>
              <dd>
                <code>{shortHash(preview.archiveHash)}</code>
              </dd>
              <dt>{t('recovery.restore.expires')}</dt>
              <dd>{formatDateTime(preview.expiresAt, locale)}</dd>
            </dl>
            <p className="notice notice-warning">{t('recovery.restore.warning')}</p>
            {preview.missingAssets.length > 0 ? <p className="notice notice-warning">{t('recovery.restore.missingWarning')}</p> : null}
            {preview.requiresSourceTrust ? (
              <label className="choice">
                <input type="checkbox" checked={trust} onChange={(event) => setTrust(event.target.checked)} />
                {t('recovery.restore.trust')}
              </label>
            ) : null}
            <div className="field">
              <label htmlFor="restore-typed">{t('recovery.restore.typeLabel', { word: confirmWord })}</label>
              <input id="restore-typed" type="text" value={typed} autoComplete="off" onChange={(event) => setTyped(event.target.value)} />
            </div>
            <button type="button" className="btn btn-danger" disabled={!canConfirm} onClick={() => void confirmRestore()}>
              {t('recovery.restore.confirm')}
            </button>
          </div>
        ) : null}
        <ActionError error={restoreError} />
      </section>

      <section className="card" aria-labelledby="recovery-local" id="local">
        <h2 id="recovery-local">{t('recovery.local.title')}</h2>
        {entries.length === 0 ? (
          <p className="muted">{t('recovery.local.none')}</p>
        ) : (
          <>
            <p>{t('recovery.local.notSavedExplain', { count: entries.length })}</p>
            <p className="small muted">{t('recovery.local.portNote')}</p>
            <ul className="plain-list">
              {entries.map((entry) => (
                <li key={entry.operationId} className="local-draft" data-testid="local-draft">
                  <p className="strong">{entry.title}</p>
                  <p className="small muted">
                    {t(`recovery.local.states.${entry.state}`)} · {formatDateTime(entry.updatedAt, locale)}
                    {entry.epoch !== session.profileEpoch ? ` · ${t('recovery.local.otherProfile')}` : ''}
                  </p>
                  <pre className="draft-text" lang="es-ES">
                    {entry.text}
                  </pre>
                  <div className="row">
                    <CopyButton text={entry.text} />
                    {entry.state === 'conflict' || entry.epoch !== session.profileEpoch ? (
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => setDiscard(entry)}>
                        {t('recovery.local.discard')}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="row">
              <CopyButton text={localText} labelKey="recovery.local.copyAll" />
              <button type="button" className="btn btn-secondary btn-small" onClick={() => downloadText('spanish-learning-lab-drafts.txt', localText)}>
                {t('recovery.local.download')}
              </button>
            </div>
          </>
        )}
        <p className="small muted">{t('recovery.local.storageNote')}</p>
      </section>
      <ConfirmDialog
        open={discard !== null}
        title={t('recovery.local.discardTitle')}
        body={<p>{t('recovery.local.discardBody')}</p>}
        confirmLabel={t('recovery.local.discard')}
        danger
        onConfirm={() => {
          if (discard) void outbox.remove(discard.operationId);
          setDiscard(null);
        }}
        onCancel={() => setDiscard(null)}
      />
    </div>
  );
}
