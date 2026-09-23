import { useState } from 'react';
import CameraCaptureModal from './CameraCaptureModal';

function ZoneDetail({
  zoneId,
  zoneName,
  lots,
  allocations,
  onAllocate,
  onUnallocate,
  onScanEntry,
  onScanExit,
  isLoading,
  message
}) {
  const [plateNumber, setPlateNumber] = useState('');
  const [cameraAction, setCameraAction] = useState(null); // 'entry' | 'exit' | null

  if (!zoneId) {
    return (
      <div className="zone-detail empty-state">
        <p className="muted">Select a zone on the left to see its lots and try a scan.</p>
      </div>
    );
  }

  const totalAvailable = lots.reduce((sum, lot) => sum + lot.available, 0);

  const handleCapture = (file) => {
    if (cameraAction === 'entry') {
      onScanEntry(file);
    } else if (cameraAction === 'exit') {
      onScanExit(file);
    }
    setCameraAction(null);
  };

  return (
    <div className="zone-detail">
      <h2>{zoneName || zoneId}</h2>

      <div className="zone-detail-grid">
        <div className="zone-detail-main">
          <div className="lots-grid">
            {lots.map((lot) => {
              const percentFull = Math.round((lot.occupied / lot.totalSpaces) * 100);
              return (
                <div key={lot.lotId} className="lot-card">
                  <h3>{lot.lotName}</h3>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percentFull}%` }} />
                  </div>
                  <p>
                    {lot.occupied} / {lot.totalSpaces} occupied &nbsp;
                    <span className="available-badge">{lot.available} free</span>
                  </p>
                </div>
              );
            })}
          </div>

          <p className="total-summary">
            Total available in this zone: <strong>{totalAvailable}</strong>
          </p>

          <div className="scan-panel">
            <h3>ANPR Scan</h3>
            <div className="scan-buttons">
              <button className="btn" disabled={isLoading} onClick={() => setCameraAction('entry')}>
                Scan at Entry
              </button>
              <button
                disabled={isLoading}
                className="btn secondary"
                onClick={() => setCameraAction('exit')}
              >
                Scan at Exit
              </button>
            </div>
            {message && <p className="scan-message">{message}</p>}
          </div>

          {cameraAction && (
            <CameraCaptureModal onCapture={handleCapture} onCancel={() => setCameraAction(null)} />
          )}

          <div className="scan-panel scan-panel-manual">
            <h3>Manual Entry (fallback / testing)</h3>
            <input
              type="text"
              placeholder="Enter plate number e.g. MH12AB1234"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            />
            <div className="scan-buttons">
              <button
                className="btn"
                disabled={!plateNumber || isLoading}
                onClick={() => onAllocate(plateNumber)}
              >
                Allocate
              </button>
              <button
                disabled={!plateNumber || isLoading}
                className="btn secondary"
                onClick={() => onUnallocate(plateNumber)}
              >
                Unallocate
              </button>
            </div>
          </div>
        </div>

        <div className="parked-vehicles">
          <h3>Parked Vehicles ({allocations.length})</h3>
          {allocations.length === 0 && <p className="muted">No vehicles currently parked in this zone.</p>}
          <ul>
            {allocations.map((allocation) => (
              <li key={allocation.id} className="parked-vehicle-item">
                <div>
                  <span className="zone-name">{allocation.plateNumber}</span>
                  <span className="zone-coords">
                    {allocation.lotName} &middot; Space #{allocation.spaceNumber}
                  </span>
                </div>
                <button
                  className="btn secondary parked-vehicle-unallocate"
                  disabled={isLoading}
                  onClick={() => onUnallocate(allocation.plateNumber)}
                >
                  Unallocate
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ZoneDetail;
