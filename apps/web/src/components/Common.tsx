import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Target } from '../api/types.ts';
import type { SaveStatus } from '../outbox/draftMachine.ts';
import { HelpButton } from './HelpButton.tsx';

/** Page heading: sets the document title and receives focus after route changes. */
export function PageHeader({
  title,
  lead,
  help,
  actions,
  langEs,
}: {
  readonly title: string;
  readonly lead?: ReactNode;
  readonly help?: string;
  readonly actions?: ReactNode;
  /** The title itself is Spanish. */
  readonly langEs?: boolean;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = `${title} · ${t('app.title')}`;
  }, [title, t]);
  return (
    <header className="page-header">
      <div className="page-title-row">
        <h1 id="page-title" tabIndex={-1} lang={langEs ? 'es-ES' : undefined}>
          {title}
        </h1>
        {help ? <HelpButton topic={help} /> : null}
      </div>
      {lead ? <div className="page-lead">{lead}</div> : null}
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

/** Spanish text inline. */
export function Es({ children }: { readonly children: ReactNode }) {
  return <span lang="es-ES">{children}</span>;
}

/** Target = skill + modality. Shows the reviewed Ukrainian title when known, else the stable skill id. */
export function TargetLabel({ target, title }: { readonly target: Target; readonly title?: string }) {
  const { t } = useTranslation();
  return (
    <span className="target-label">
      {title ? <span>{title}</span> : <code className="skill-id">{target.skillId}</code>}
      <span className="muted"> · {t(`modalities.${target.modality}`)}</span>
    </span>
  );
}

export function targetKey(target: Target): string {
  return `${target.skillId}/${target.modality}`;
}

/** Save-state pill with a polite live region (zberigaietsia / zberezheno / ne zberezheno). */
export function SavePill({ status, onRetry }: { readonly status: SaveStatus; readonly onRetry?: () => void }) {
  const { t } = useTranslation();
  const label =
    status === 'saving' || status === 'pending'
      ? t('save.saving')
      : status === 'saved'
        ? t('save.saved')
        : status === 'failed'
          ? t('save.failed')
          : '';
  return (
    <span className={`save-pill save-${status}`}>
      <span role="status" aria-live="polite">
        {label ? (
          <>
            <span className="save-icon" aria-hidden="true">
              {status === 'saved' ? '✓' : status === 'failed' ? '!' : '…'}
            </span>{' '}
            {label}
          </>
        ) : null}
      </span>
      {status === 'failed' && onRetry ? (
        <button type="button" className="btn btn-small btn-secondary" onClick={onRetry}>
          {t('save.retry')}
        </button>
      ) : null}
    </span>
  );
}

/** Copies text (Clipboard API with execCommand fallback) and announces the result. */
export function CopyButton({ text, labelKey = 'common.copy' }: { readonly text: string; readonly labelKey?: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.className = 'visually-hidden';
      document.body.appendChild(area);
      area.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      area.remove();
    }
    setState(ok ? 'copied' : 'failed');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 4000);
  };
  return (
    <span className="copy">
      <button type="button" className="btn btn-secondary btn-small" onClick={() => void copy()}>
        {t(labelKey)}
      </button>
      <span role="status" aria-live="polite" className="muted small">
        {state === 'copied' ? t('common.copied') : state === 'failed' ? t('common.copyFailed') : ''}
      </span>
    </span>
  );
}

/** Saves text as a local file (export of unacknowledged drafts or a token-free note). */
export function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Undo bar shown after a reversible destructive action (polite live region). */
export function UndoBar({ message, onUndo, onDismiss }: { readonly message: string; readonly onUndo: () => void; readonly onDismiss: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="undo-bar" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" className="btn btn-small btn-secondary" onClick={onUndo}>
        {t('common.undo')}
      </button>
      <button type="button" className="btn btn-small btn-ghost" onClick={onDismiss} aria-label={t('common.close')}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

/** Readiness badge for content (draft vs reviewed/ready). Text + icon, never colour alone. */
export function StateBadge({ state }: { readonly state: string }) {
  const { t } = useTranslation();
  const tone = state === 'ready' || state === 'reviewed' ? 'ready' : state === 'quarantined' || state === 'retired' ? 'blocked' : 'draft';
  return (
    <span className={`badge badge-${tone}`}>
      <span aria-hidden="true">{tone === 'ready' ? '✓' : tone === 'blocked' ? '⊘' : '✎'}</span> {t(`contentStates.${state}`)}
    </span>
  );
}
