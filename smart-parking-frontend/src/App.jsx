import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ZoneList from './components/ZoneList';
import ZoneDetail from './components/ZoneDetail';
import {
  getZones,
  getZoneLots,
  getZoneAllocations,
  allocateSpace,
  unallocateSpace,
  scanEntry,
  scanExit
} from './api/parkingApi';
import { useOccupancySocket } from './hooks/useOccupancySocket';
import { useTranslation } from './i18n';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [lots, setLots] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [zoneFull, setZoneFull] = useState(null); // { zoneName, suggestedZone }

  useEffect(() => {
    getZones().then(setZones).catch((err) => setMessage(err.message));
  }, []);

  const refreshLots = useCallback((zoneId) => {
    if (!zoneId) return;
    getZoneLots(zoneId).then(setLots).catch((err) => setMessage(err.message));
    getZoneAllocations(zoneId).then(setAllocations).catch((err) => setMessage(err.message));
  }, []);

  useEffect(() => {
    refreshLots(selectedZoneId);
    setZoneFull(null);
  }, [selectedZoneId, refreshLots]);

  const handleOccupancyChanged = useCallback(
    (payload) => {
      if (payload.zoneId === selectedZoneId) {
        refreshLots(selectedZoneId);
      }
    },
    [selectedZoneId, refreshLots]
  );
  useOccupancySocket(handleOccupancyChanged);

  const zoneName = zones.find((z) => z.id === selectedZoneId)?.name;

  // Runs an action with shared loading/message handling.
  const run = async (pendingMessage, action) => {
    setIsLoading(true);
    setMessage(pendingMessage);
    setZoneFull(null);
    try {
      setMessage(await action());
      refreshLots(selectedZoneId);
    } catch (err) {
      if (err.data?.zoneFull) {
        setMessage('');
        setZoneFull({ zoneName, suggestedZone: err.data.suggestedZone });
      } else {
        setMessage(t('errorMsg', { message: err.status === 422 ? t('noPlateDetected') : err.message }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllocate = (plateNumber, isPriority) =>
    run('', async () => {
      const allocation = await allocateSpace(selectedZoneId, plateNumber, isPriority);
      localStorage.setItem('lastEnteredPlate', allocation.plateNumber);
      return t('allocatedMsg', { space: allocation.spaceNumber, plate: plateNumber });
    });

  const handleUnallocate = (plateNumber) =>
    run('', async () => {
      await unallocateSpace(selectedZoneId, plateNumber);
      return t('exitedMsg', { plate: plateNumber });
    });

  const handleScanEntry = (imageFile, isPriority) =>
    run(t('scanning'), async () => {
      const allocation = await scanEntry(selectedZoneId, imageFile, isPriority);
      localStorage.setItem('lastEnteredPlate', allocation.plateNumber);
      return t('scanEntryMsg', {
        plate: allocation.plateNumber,
        confidence: Math.round(allocation.ocrConfidence * 100),
        space: allocation.spaceNumber
      });
    });

  const handleScanExit = (imageFile) =>
    run(t('scanning'), async () => {
      const allocation = await scanExit(selectedZoneId, imageFile);
      return t('scanExitMsg', { plate: allocation.plateNumber });
    });

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <ZoneList
          zones={zones}
          selectedZoneId={selectedZoneId}
          onSelectZone={setSelectedZoneId}
        />
        <ZoneDetail
          zoneId={selectedZoneId}
          zoneName={zoneName}
          lots={lots}
          allocations={allocations}
          onAllocate={handleAllocate}
          onUnallocate={handleUnallocate}
          onScanEntry={handleScanEntry}
          onScanExit={handleScanExit}
          isLoading={isLoading}
          message={message}
          zoneFull={zoneFull}
        />
      </main>
    </div>
  );
}

export default App;
