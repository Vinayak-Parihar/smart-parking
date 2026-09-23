import { useState } from 'react';
import ParkingMap from './ParkingMap';

function LocationPickerModal({ parkings, initialPosition, onConfirm, onCancel }) {
  const [position, setPosition] = useState(initialPosition || null);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Choose parking location</h3>
        <p className="muted">
          Showing your current location — click anywhere on the map to drop the pin.
        </p>

        <div className="modal-map-wrap">
          <ParkingMap
            parkings={parkings}
            draftPosition={position}
            onMapClick={(lat, lng) => setPosition({ lat, lng })}
          />
        </div>

        {position && (
          <p className="parking-form-coords">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
        )}

        <div className="scan-buttons">
          <button
            type="button"
            className="btn"
            disabled={!position}
            onClick={() => onConfirm(position)}
          >
            Use this location
          </button>
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationPickerModal;
