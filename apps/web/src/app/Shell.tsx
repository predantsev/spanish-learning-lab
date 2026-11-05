// Layout: left navigation on desktop (≥768 px), labelled bottom navigation on phones, skip link,
// global status banners (connection, session, restored profile, unsaved local drafts, demo data).
import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from '../router/history.tsx';
import { paths, sectionOf, type Route } from '../router/routes.ts';
import { useApp } from './context.tsx';
import { useOutboxEntries } from './hooks.ts';

const NAV = [
  { section: 'home', to: paths.home(), labelKey: 'nav.home', icon: '⌂' },
  { section: 'course', to: paths.catalog(), labelKey: 'nav.course', icon: '☰' },
  { section: 'practice', to: paths.review(), labelKey: 'nav.practice', icon: '✎' },
  { section: 'phrases', to: paths.phrases(), labelKey: 'nav.phrases', icon: '❝' },
  { section: 'progress', to: paths.progress(), labelKey: 'nav.progress', icon: '▤' },
] as const;

function NavList({ route, variant }: { readonly route: Route; readonly variant: 'side' | 'bottom' }) {
  const { t } = useTranslation();
  const active = sectionOf(route);
  return (
    <ul className={`nav-list nav-${variant}`}>
      {NAV.map((item) => (
        <li key={item.section}>
          <Link to={item.to} className="nav-link" aria-current={active === item.section ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="nav-label">{t(item.labelKey)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Banners() {
  const { t } = useTranslation();
  const app = useApp();
  const entries = useOutboxEntries(app.outbox);
  const unsaved = entries.filter((entry) => entry.epoch === app.session.profileEpoch);
  return (
    <div className="banners">
      {app.demo ? (
        <p className="banner banner-demo" role="note">
          <strong>{t('demo.badge')}</strong> {t('demo.explain')}
        </p>
      ) : null}
      {app.connection === 'unreachable' ? (
        <div className="banner banner-error" role="alert">
          <span>{t('banners.unreachable')}</span>
          <button type="button" className="btn btn-small btn-secondary" onClick={() => void app.checkConnection()}>
            {t('banners.checkAgain')}
          </button>
        </div>
      ) : null}
      {app.authLost ? (
        <p className="banner banner-error" role="alert">
          {t('banners.authLost')}
        </p>
      ) : null}
      {app.epochChanged ? (
        <div className="banner banner-warning" role="alert">
          <span>{t('banners.epochChanged')}</span>
          <button type="button" className="btn btn-small btn-secondary" onClick={() => window.location.reload()}>
            {t('banners.reload')}
          </button>
        </div>
      ) : null}
      {!app.outbox.persistent ? <p className="banner banner-warning">{t('banners.noLocalStorage')}</p> : null}
      {unsaved.length > 0 ? (
        <p className="banner banner-info">
          {t('banners.unsavedDrafts', { count: unsaved.length })}{' '}
          <Link to={paths.settingsRecovery()}>{t('banners.unsavedDraftsLink')}</Link>
        </p>
      ) : null}
    </div>
  );
}

export function Shell({ route, children }: { readonly route: Route; readonly children: ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const first = useRef(true);

  // After a route change, move focus to the page heading unless the screen placed focus itself
  // (e.g. the exercise restores the caret in the answer field).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body) document.getElementById('page-title')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.key]);

  const settingsActive = sectionOf(route) === 'settings';
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {t('nav.skip')}
      </a>
      <header className="topbar">
        <Link to={paths.home()} className="brand">
          {t('app.title')}
        </Link>
        <Link to={paths.settings()} className="topbar-settings btn btn-ghost btn-icon" aria-current={settingsActive ? 'page' : undefined} aria-label={t('nav.settings')}>
          <span aria-hidden="true">⚙</span>
        </Link>
      </header>
      <nav className="sidebar" aria-label={t('nav.label')}>
        <Link to={paths.home()} className="brand brand-side">
          {t('app.title')}
        </Link>
        <NavList route={route} variant="side" />
        <Link to={paths.settings()} className="nav-link nav-settings" aria-current={settingsActive ? 'page' : undefined}>
          <span className="nav-icon" aria-hidden="true">
            ⚙
          </span>
          <span className="nav-label">{t('nav.settings')}</span>
        </Link>
      </nav>
      <main id="main" className="main" tabIndex={-1}>
        <Banners />
        {children}
      </main>
      <nav className="bottom-nav" aria-label={t('nav.label')}>
        <NavList route={route} variant="bottom" />
      </nav>
    </div>
  );
}
