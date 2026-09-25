import { Link } from 'react-router-dom';
import { LanguageToggle, useTranslation } from './i18n';
import './LandingPage.css';

function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="landing-wordmark">
          <span className="landing-mark" aria-hidden="true">
            P
          </span>
          Smart Parking
        </Link>
        <div className="app-header-actions">
          <LanguageToggle />
          <Link to="/app" className="btn landing-nav-cta">
            {t('openApp')}
          </Link>
        </div>
      </nav>

      <header className="landing-hero">
        <div className="landing-hero-copy">
          <h1 className="landing-headline">
            {t('heroA')}
            <em className="hl">{t('heroEm')}</em>
            {t('heroB')}
          </h1>
          <p className="landing-subhead">
            {t('heroSub')}
          </p>
          <div className="landing-actions">
            <Link to="/app" className="btn">
              {t('findSpot')}
            </Link>
            <Link to="/map" className="btn secondary">
              {t('viewMap')}
            </Link>
          </div>
        </div>

        <div className="landing-hero-art" aria-hidden="true">
          <div className="landing-blob">
            <span>P</span>
          </div>
          <div className="landing-note">{t('heroNote')}</div>
        </div>
      </header>

      <main className="landing-features">
        <article className="feature-tile feature-tile--lead">
          <div className="feature-scan" aria-hidden="true">
            <span className="feature-scan-plate">MH12 AB1234</span>
            <span className="feature-scan-beam" />
          </div>
          <h2>{t('featAnprTitle')}</h2>
          <p>{t('featAnprBody')}</p>
        </article>

        <article className="feature-tile">
          <span className="feature-tag">{t('tagLive')}</span>
          <h2>{t('featLiveTitle')}</h2>
          <p>{t('featLiveBody')}</p>
        </article>

        <article className="feature-tile">
          <span className="feature-tag">{t('tagZones')}</span>
          <h2>{t('featZonesTitle')}</h2>
          <p>{t('featZonesBody')}</p>
        </article>
      </main>

      <footer className="landing-footer">
        <p className="landing-footer-line">{t('footerLine')}</p>
        <div className="landing-footer-meta">
          <span className="landing-wordmark landing-wordmark--small">
            <span className="landing-mark" aria-hidden="true">
              P
            </span>
            Smart Parking
          </span>
          <span className="muted">{t('footerMeta')}</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
