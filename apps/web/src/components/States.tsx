import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isMissing } from '../api/errors.ts';

export function LoadingState({ labelKey = 'states.loading' }: { readonly labelKey?: string }) {
  const { t } = useTranslation();
  return (
    <div className="state state-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{t(labelKey)}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry, titleKey = 'states.errorTitle' }: { readonly error: unknown; readonly onRetry?: () => void; readonly titleKey?: string }) {
  const { t, i18n } = useTranslation();
  const key = isMissing(error) ? 'states.notFound' : errorMessageKey(error, (k) => i18n.exists(k));
  return (
    <div className="state state-error" role="alert">
      <p className="state-title">{t(titleKey)}</p>
      <p>{t(key)}</p>
      {onRetry ? (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, body, action }: { readonly title: string; readonly body?: string; readonly action?: ReactNode }) {
  return (
    <div className="state state-empty">
      <p className="state-title">{title}</p>
      {body ? <p>{body}</p> : null}
      {action ? <div className="state-actions">{action}</div> : null}
    </div>
  );
}

/** Inline error message for a failed action (with optional retry of the same operation). */
export function ActionError({ error, onRetry }: { readonly error: unknown; readonly onRetry?: () => void }) {
  const { t, i18n } = useTranslation();
  if (!error) return null;
  return (
    <div className="notice notice-error" role="alert">
      <span>{t(errorMessageKey(error, (k) => i18n.exists(k)))}</span>
      {onRetry ? (
        <button type="button" className="btn btn-small btn-secondary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      ) : null}
    </div>
  );
}
