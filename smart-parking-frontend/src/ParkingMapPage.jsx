import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ParkingMap from './admin/ParkingMap';
import { getZones } from './api/parkingApi';
import { LanguageToggle, useTranslation } from './i18n';
import './ParkingMapPage.css';

function ParkingMapPage() {
  const { t } = useTranslation();
  const [zones, setZones] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getZones().then(setZones).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="map-page">
      <header className="map-page-header">
        <Link to="/" className="landing-wordmark">
          <span className="landing-mark" aria-hidden="true">
            P
          </span>
          Smart Parking
        </Link>
        <div className="app-header-actions">
          <LanguageToggle />
          <Link to="/app" className="btn map-page-cta">
            {t('findSpot')}
          </Link>
        </div>
      </header>

      <p className="map-page-hint">
        {error
          ? t('mapError', { error })
          : zones.length === 1
            ? t('mapHintOne')
            : t('mapHint', { count: zones.length })}
      </p>

      <div className="map-page-map-wrap">
        <ParkingMap parkings={zones} draftPosition={null} />
      </div>
    </div>
  );
}

export default ParkingMapPage;
