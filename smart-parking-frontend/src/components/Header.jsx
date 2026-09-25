import { Link } from 'react-router-dom';
import { LanguageToggle, useTranslation } from '../i18n';

function Header() {
  const { t } = useTranslation();
  return (
    <header className="app-header">
      <Link to="/" className="landing-wordmark">
        <span className="landing-mark" aria-hidden="true">
          P
        </span>
        Smart Parking
      </Link>
      <div className="app-header-actions">
        <LanguageToggle />
        <Link to="/my-car" className="btn secondary">
          {t('myCar')}
        </Link>
      </div>
    </header>
  );
}

export default Header;
