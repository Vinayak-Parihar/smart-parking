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
import './App.css';

function App() {
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [lots, setLots] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleAllocate = async (plateNumber) => {
    setIsLoading(true);
    setMessage('');
    try {
      const allocation = await allocateSpace(selectedZoneId, plateNumber);
      setMessage(`Space #${allocation.spaceNumber} allocated to ${plateNumber}`);
      refreshLots(selectedZoneId);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnallocate = async (plateNumber) => {
    setIsLoading(true);
    setMessage('');
    try {
      await unallocateSpace(selectedZoneId, plateNumber);
      setMessage(`${plateNumber} exited. Space released.`);
      refreshLots(selectedZoneId);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanEntry = async (imageFile) => {
    setIsLoading(true);
    setMessage('Scanning...');
    try {
      const allocation = await scanEntry(selectedZoneId, imageFile);
      setMessage(
        `Detected ${allocation.plateNumber} (${Math.round(allocation.ocrConfidence * 100)}% confidence) — allocated space #${allocation.spaceNumber}`
      );
      refreshLots(selectedZoneId);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanExit = async (imageFile) => {
    setIsLoading(true);
    setMessage('Scanning...');
    try {
      const allocation = await scanExit(selectedZoneId, imageFile);
      setMessage(
        `Detected ${allocation.plateNumber} — exited, space released`
      );
      refreshLots(selectedZoneId);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
          zoneName={zones.find((z) => z.id === selectedZoneId)?.name}
          lots={lots}
          allocations={allocations}
          onAllocate={handleAllocate}
          onUnallocate={handleUnallocate}
          onScanEntry={handleScanEntry}
          onScanExit={handleScanExit}
          isLoading={isLoading}
          message={message}
        />
      </main>
    </div>
  );
}

export default App;
