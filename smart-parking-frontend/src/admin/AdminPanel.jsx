import { useCallback, useEffect, useState } from 'react';
import ParkingMap from './ParkingMap';
import AddParkingView from './AddParkingView';
import { getParkings, createParking } from '../api/adminApi';
import './admin.css';

function vehicleTypeLabel(type) {
  if (type === '2-wheeler') return '2-Wheeler';
  if (type === '4-wheeler') return '4-Wheeler';
  return 'Both';
}

function AdminPanel() {
  const [view, setView] = useState('list'); // 'add' | 'list'
  const [parkings, setParkings] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadParkings = useCallback(() => {
    getParkings()
      .then(setParkings)
      .catch((err) => setMessage(`Error loading parkings: ${err.message}`));
  }, []);

  useEffect(() => {
    loadParkings();
  }, [loadParkings]);

  const handleSaveParking = async (formData) => {
    setIsSaving(true);
    setMessage('');
    try {
      const parking = await createParking(formData);
      setParkings((prev) => [...prev, parking]);
      setMessage(`Saved "${parking.name}".`);
      setView('list');
      return true;
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-panel">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav className="admin-nav">
          <button
            className={view === 'add' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setView('add')}
          >
            Add Parking
          </button>
          <button
            className={view === 'list' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setView('list')}
          >
            All Parkings ({parkings.length})
          </button>
        </nav>

        {view === 'list' && (
          <ul className="admin-parking-list">
            {parkings.map((parking) => (
              <li key={parking.id} className="admin-parking-item">
                <span className="zone-name">{parking.name}</span>
                <span className="zone-coords">
                  {parking.capacity} spots &middot; {vehicleTypeLabel(parking.vehicleType)}
                </span>
              </li>
            ))}
            {parkings.length === 0 && <p className="muted">No parkings added yet.</p>}
          </ul>
        )}

        {message && <p className="scan-message">{message}</p>}
      </aside>

      <div className="admin-content">
        {view === 'add' ? (
          <AddParkingView parkings={parkings} onSubmit={handleSaveParking} isSaving={isSaving} />
        ) : (
          <div className="admin-map-wrap">
            <ParkingMap parkings={parkings} draftPosition={null} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
