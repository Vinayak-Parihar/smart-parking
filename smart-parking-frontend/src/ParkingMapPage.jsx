import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ParkingMap from './admin/ParkingMap';
import { getZones } from './api/parkingApi';
import './ParkingMapPage.css';

function ParkingMapPage() {
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
        <Link to="/app" className="btn map-page-cta">
          Find a Spot
        </Link>
      </header>

      <p className="map-page-hint">
        {error
          ? `Error loading parking locations: ${error}`
          : `${zones.length} parking location${zones.length === 1 ? '' : 's'} on the map — click a pin for details.`}
      </p>

      <div className="map-page-map-wrap">
        <ParkingMap parkings={zones} draftPosition={null} />
      </div>
    </div>
  );
}

export default ParkingMapPage;
