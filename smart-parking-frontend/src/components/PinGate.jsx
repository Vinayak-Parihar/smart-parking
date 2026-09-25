import { useState, useEffect } from 'react';
import Header from './Header';
import { checkStaffPin, saveStaffPin } from '../api/parkingApi';
import '../App.css';

// Asks for the staff PIN before showing staff/admin pages. The backend enforces
// the same PIN on the protected endpoints; this screen just collects it.
function PinGate({ children }) {
  const [status, setStatus] = useState('checking'); // checking | locked | ok
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkStaffPin()
      .then((ok) => setStatus(ok ? 'ok' : 'locked'))
      .catch(() => setStatus('locked'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    saveStaffPin(pin);
    if (await checkStaffPin().catch(() => false)) {
      setStatus('ok');
    } else {
      setError('Wrong PIN.');
      setPin('');
    }
  };

  if (status === 'ok') return children;

  return (
    <div className="app">
      <Header />
      <main className="find-my-car">
        {status === 'locked' && (
          <form className="scan-panel" onSubmit={handleSubmit}>
            <h3>Staff PIN</h3>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <div className="scan-buttons">
              <button className="btn" disabled={!pin}>
                Unlock
              </button>
            </div>
            {error && <p className="scan-message">{error}</p>}
          </form>
        )}
      </main>
    </div>
  );
}

export default PinGate;
