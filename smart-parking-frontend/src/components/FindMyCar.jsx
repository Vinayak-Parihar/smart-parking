import { useState, useEffect } from 'react';
import Header from './Header';
import { findMyCar } from '../api/parkingApi';
import { useTranslation } from '../i18n';
import '../App.css';

export function CarCard({ result }) {
  const { t } = useTranslation();
  const mins = Math.max(0, Math.floor((Date.now() - new Date(result.entryTime)) / 60000));
  const h = Math.floor(mins / 60);
  const time = h ? t('hoursMinutes', { h, m: mins % 60 }) : t('minutes', { m: mins });

  return (
    <div className="car-card">
      <p className="muted">{t('isIn', { plate: result.plateNumber })}</p>
      <p className="car-space">{t('spaceLabel', { space: result.spaceNumber })}</p>
      {result.isPriorityAllocation && <span className="priority-badge">♿ {t('prioritySpace')}</span>}
      <p>{[result.areaName, result.zoneName, result.lotName].filter(Boolean).join(' · ')}</p>
      <p className="muted">{t('parkedAgo', { time })}</p>

      {result.totalSpacesInLot && (
        <div
          className="lot-map"
          role="img"
          aria-label={t('lotMapLabel', { space: result.spaceNumber, total: result.totalSpacesInLot })}
        >
          {Array.from({ length: result.totalSpacesInLot }, (_, i) => (
            <span key={i} className={i + 1 === result.spaceNumber ? 'is-mine' : ''} />
          ))}
        </div>
      )}
    </div>
  );
}

function FindMyCar() {
  const { t } = useTranslation();
  const [plate, setPlate] = useState(() => localStorage.getItem('lastEnteredPlate') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const lookup = async (plateNumber) => {
    setIsLoading(true);
    setError('');
    try {
      setResult(await findMyCar(plateNumber));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (plate) lookup(plate);
  }, []);

  const trimmed = plate.replace(/\s+/g, '');
  const isValid = trimmed.length >= 4 && trimmed.length <= 12;

  return (
    <div className="app">
      <Header />
      <main className="find-my-car">
        <h2>{t('findMyCar')}</h2>

        {result?.found && <CarCard result={result} />}
        {result && !result.found && <p className="scan-message">{t('notParked')}</p>}
        {error && <p className="scan-message">{t('errorMsg', { message: error })}</p>}

        <form
          className="scan-panel scan-panel-manual"
          onSubmit={(e) => {
            e.preventDefault();
            lookup(trimmed);
          }}
        >
          <h3>{result?.found ? t('lookupDifferent') : t('enterYourPlate')}</h3>
          <input
            type="text"
            placeholder={t('platePlaceholderShort')}
            value={plate}
            maxLength={16}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
          />
          <div className="scan-buttons">
            <button className="btn" disabled={!isValid || isLoading}>
              {isLoading ? t('lookingUp') : t('findMyCar')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default FindMyCar;
