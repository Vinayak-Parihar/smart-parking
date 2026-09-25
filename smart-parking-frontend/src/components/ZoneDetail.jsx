import { useState } from 'react';
import CameraCaptureModal from './CameraCaptureModal';
import ZoneFullNotice from './ZoneFullNotice';
import { useTranslation } from '../i18n';

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
  message,
  zoneFull
}) {
  const { t } = useTranslation();
  const [plateNumber, setPlateNumber] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [cameraAction, setCameraAction] = useState(null); // 'entry' | 'exit' | null

  if (!zoneId) {
    return (
      <div className="zone-detail empty-state">
        <p className="muted">{t('selectZonePrompt')}</p>
      </div>
    );
  }

  const totalAvailable = lots.reduce((sum, lot) => sum + lot.available, 0);

  const handleCapture = (file) => {
    if (cameraAction === 'entry') {
      onScanEntry(file, isPriority);
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
                    {t('occupiedOf', { occupied: lot.occupied, total: lot.totalSpaces })} &nbsp;
                    <span className="available-badge">{t('free', { count: lot.available })}</span>
                  </p>
                </div>
              );
            })}
          </div>

          <p className="total-summary">
            {t('totalAvailable')} <strong>{totalAvailable}</strong>
          </p>

          <div className="scan-panel">
            <h3>{t('scan')}</h3>
            <label className="priority-check">
              <input
                type="checkbox"
                checked={isPriority}
                onChange={(e) => setIsPriority(e.target.checked)}
              />
              {t('priorityCheckbox')}
            </label>
            <div className="scan-buttons">
              <button className="btn" disabled={isLoading} onClick={() => setCameraAction('entry')}>
                {t('scanAtEntry')}
              </button>
              <button
                disabled={isLoading}
                className="btn secondary"
                onClick={() => setCameraAction('exit')}
              >
                {t('scanAtExit')}
              </button>
            </div>
            {message && <p className="scan-message">{message}</p>}
            {zoneFull && <ZoneFullNotice {...zoneFull} />}
          </div>

          {cameraAction && (
            <CameraCaptureModal onCapture={handleCapture} onCancel={() => setCameraAction(null)} />
          )}

          <div className="scan-panel scan-panel-manual">
            <h3>{t('manualEntryTitle')}</h3>
            <input
              type="text"
              placeholder={t('platePlaceholder')}
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            />
            <div className="scan-buttons">
              <button
                className="btn"
                disabled={!plateNumber || isLoading}
                onClick={() => onAllocate(plateNumber, isPriority)}
              >
                {t('allocate')}
              </button>
              <button
                disabled={!plateNumber || isLoading}
                className="btn secondary"
                onClick={() => onUnallocate(plateNumber)}
              >
                {t('unallocate')}
              </button>
            </div>
          </div>
        </div>

        <div className="parked-vehicles">
          <h3>{t('parkedVehicles', { count: allocations.length })}</h3>
          {allocations.length === 0 && <p className="muted">{t('noVehiclesParked')}</p>}
          <ul>
            {allocations.map((allocation) => (
              <li key={allocation.id} className="parked-vehicle-item">
                <div>
                  <span className="zone-name">{allocation.plateNumber}</span>
                  <span className="zone-coords">
                    {allocation.lotName} &middot; {t('spaceLabel', { space: allocation.spaceNumber })}
                  </span>
                </div>
                <button
                  className="btn secondary parked-vehicle-unallocate"
                  disabled={isLoading}
                  onClick={() => onUnallocate(allocation.plateNumber)}
                >
                  {t('unallocate')}
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
