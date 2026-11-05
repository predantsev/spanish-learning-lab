import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { ApiClient, type Transport } from './api/client.ts';
import { takeFragmentNonce } from './api/nonce.ts';
import { App } from './app/App.tsx';
import { createI18n } from './i18n/index.ts';
import { DEFAULT_LOCALE } from './i18n/registry.ts';
import { applyStoredTheme } from './lib/theme.ts';
import { OutboxStore } from './outbox/store.ts';
import { installHistory } from './router/history.tsx';
import './styles/tokens.css';
import './styles/app.css';

// 1. Take the one-use launcher nonce out of the URL before anything else runs.
const nonce = takeFragmentNonce(window.location, window.history);
applyStoredTheme();
installHistory();

// 2. Development-only fixture adapter (read-only "демо-дані"); removed from production builds.
let transport: Transport | undefined;
let demo = false;
if (import.meta.env.DEV) {
  const { demoRequested, createDemoTransport } = await import('./dev/demo.ts');
  if (demoRequested()) {
    transport = createDemoTransport();
    demo = true;
  }
}

const i18n = await createI18n(DEFAULT_LOCALE);
const api = new ApiClient({ transport });
const outbox = new OutboxStore(true);

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <App api={api} outbox={outbox} nonce={nonce} demo={demo} locale={i18n.language} />
      </I18nextProvider>
    </StrictMode>,
  );
}
