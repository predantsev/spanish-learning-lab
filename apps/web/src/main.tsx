import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import uk from './locales/uk.json' with { type: 'json' };
import './styles/tokens.css';

await i18next.use(initReactI18next).init({
  lng: 'uk',
  resources: { uk: { translation: uk } },
  interpolation: { escapeValue: false },
});

function Probe() {
  const { t } = useTranslation();
  return <h1>{t('app.title')}</h1>;
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <Probe />
    </StrictMode>,
  );
}
