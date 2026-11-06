// Start-up screens shown before the authenticated app: honest service/auth status, never a fake
// success. Unacknowledged draft texts stay in the browser outbox and can be copied or exported.
import { useTranslation } from 'react-i18next';
import { CopyButton, downloadText } from '../components/Common.tsx';
import { outboxExportText, type OutboxStore } from '../outbox/store.ts';
import { useOutboxEntries } from './hooks.ts';

function LocalDrafts({ outbox }: { readonly outbox: OutboxStore }) {
  const { t } = useTranslation();
  const entries = useOutboxEntries(outbox);
  if (entries.length === 0) return null;
  const text = outboxExportText(entries, (entry) => `${entry.title} (${entry.updatedAt})`);
  return (
    <section className="card" aria-labelledby="boot-local-drafts">
      <h2 id="boot-local-drafts">{t('recovery.local.title')}</h2>
      <p>{t('recovery.local.notSavedExplain', { count: entries.length })}</p>
      <ul className="plain-list">
        {entries.map((entry) => (
          <li key={entry.operationId} className="local-draft">
            <p className="strong">{entry.title}</p>
            <pre className="draft-text">{entry.text}</pre>
          </li>
        ))}
      </ul>
      <div className="row">
        <CopyButton text={text} labelKey="recovery.local.copyAll" />
        <button type="button" className="btn btn-secondary btn-small" onClick={() => downloadText('spanish-learning-lab-drafts.txt', text)}>
          {t('recovery.local.download')}
        </button>
      </div>
    </section>
  );
}

export function CheckingScreen() {
  const { t } = useTranslation();
  return (
    <main className="boot" id="main">
      <div className="boot-card" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <p>{t('boot.checking')}</p>
      </div>
    </main>
  );
}

export function ServiceDownScreen({ outbox, onRetry }: { readonly outbox: OutboxStore; readonly onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <main className="boot" id="main">
      <div className="boot-card">
        <h1 tabIndex={-1}>{t('boot.serviceDown.title')}</h1>
        <p>{t('boot.serviceDown.body')}</p>
        <ol>
          <li>{t('boot.serviceDown.step1')}</li>
          <li>{t('boot.serviceDown.step2')}</li>
        </ol>
        <p className="muted">{t('boot.serviceDown.offline')}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      </div>
      <LocalDrafts outbox={outbox} />
    </main>
  );
}

export function AuthRequiredScreen({ outbox, onRetry }: { readonly outbox: OutboxStore; readonly onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <main className="boot" id="main">
      <div className="boot-card">
        <h1 tabIndex={-1}>{t('boot.auth.title')}</h1>
        <p>{t('boot.auth.body')}</p>
        <p className="muted">{t('boot.auth.privacy')}</p>
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      </div>
      <LocalDrafts outbox={outbox} />
    </main>
  );
}
