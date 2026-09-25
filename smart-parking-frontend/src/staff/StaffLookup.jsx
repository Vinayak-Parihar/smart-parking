import { useState, useRef } from 'react';
import Header from '../components/Header';
import { CarCard } from '../components/FindMyCar';
import { findMyCar } from '../api/parkingApi';
import '../App.css';

// Staff tool: look up any plate. Clears and refocuses after each search for rapid use.
function StaffLookup() {
  const [plate, setPlate] = useState('');
  const [searched, setSearched] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const plateNumber = plate.replace(/\s+/g, '');
    setIsLoading(true);
    setError('');
    try {
      setResult(await findMyCar(plateNumber));
      setSearched(plateNumber);
      setPlate('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="find-my-car">
        <h2>Staff · Vehicle Lookup</h2>

        <form className="scan-panel" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            autoFocus
            placeholder="Plate number e.g. MH12AB1234"
            value={plate}
            maxLength={16}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
          />
          <div className="scan-buttons">
            <button className="btn" disabled={!plate.trim() || isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && <p className="scan-message">Error: {error}</p>}
        {result?.found && <CarCard result={result} />}
        {result && !result.found && (
          <p className="scan-message">
            No active parking found for {searched} — double-check the number, or the vehicle may have
            already exited.
          </p>
        )}
      </main>
    </div>
  );
}

export default StaffLookup;
