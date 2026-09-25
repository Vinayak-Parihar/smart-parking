import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ZoneFullNotice from '../components/ZoneFullNotice';
import { getZones, allocateSpace, unallocateSpace } from '../api/parkingApi';
import '../App.css';

// Staff tool: allocate/free a space by plate when ANPR fails. Same endpoints as a scan.
function StaffOverride() {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [plate, setPlate] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [message, setMessage] = useState('');
  const [zoneFull, setZoneFull] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getZones().then(setZones).catch((err) => setMessage(`Error: ${err.message}`));
  }, []);

  const zoneName = zones.find((z) => z.id === zoneId)?.name;
  const plateNumber = plate.replace(/\s+/g, '');

  const run = async (action) => {
    setIsLoading(true);
    setMessage('');
    setZoneFull(null);
    try {
      setMessage(await action());
      setPlate('');
      setIsPriority(false);
    } catch (err) {
      if (err.data?.zoneFull) {
        setZoneFull({ zoneName, suggestedZone: err.data.suggestedZone });
      } else {
        setMessage(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllocate = () =>
    run(async () => {
      const a = await allocateSpace(zoneId, plateNumber, isPriority);
      return `Space #${a.spaceNumber}${a.isPriorityAllocation ? ' (priority)' : ''} allocated to ${a.plateNumber} in ${zoneName}`;
    });

  const handleUnallocate = () =>
    run(async () => {
      const a = await unallocateSpace(zoneId, plateNumber);
      return `${a.plateNumber} exited — space #${a.spaceNumber} released`;
    });

  const ready = zoneId && plateNumber && !isLoading;

  return (
    <div className="app">
      <Header />
      <main className="find-my-car">
        <h2>Staff · Manual Override</h2>
        <p className="muted">Use when a scan fails or a camera is down.</p>

        <form className="scan-panel" onSubmit={(e) => e.preventDefault()}>
          <select className="staff-select" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            <option value="">Select zone…</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Plate number e.g. MH12AB1234"
            value={plate}
            maxLength={16}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
          />
          <label className="priority-check">
            <input type="checkbox" checked={isPriority} onChange={(e) => setIsPriority(e.target.checked)} />
            Priority/accessible parking
          </label>
          <div className="scan-buttons">
            <button type="button" className="btn" disabled={!ready} onClick={handleAllocate}>
              Allocate (Entry)
            </button>
            <button type="button" className="btn secondary" disabled={!ready} onClick={handleUnallocate}>
              Unallocate (Exit)
            </button>
          </div>
          {message && <p className="scan-message">{message}</p>}
          {zoneFull && <ZoneFullNotice {...zoneFull} />}
        </form>
      </main>
    </div>
  );
}

export default StaffOverride;
