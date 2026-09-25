import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardOccupancy } from './api/parkingApi';
import { useOccupancySocket } from './hooks/useOccupancySocket';
import './DashboardView.css';

const POLL_MS = 30000; // safety net if the socket drops

function statusOf({ totalSpaces, available }) {
  if (!totalSpaces || available <= 0) return 'full';
  return available / totalSpaces > 0.15 ? 'open' : 'low';
}

const STATUS_LABEL = { open: 'Available', low: 'Nearly Full', full: 'Full' };

function DashboardView() {
  const [data, setData] = useState(null);
  const [now, setNow] = useState(new Date());
  const scrollRef = useRef(null);

  const refresh = useCallback(() => {
    getDashboardOccupancy().then(setData).catch(() => {}); // keep last good snapshot on error
  }, []);

  useOccupancySocket(refresh);

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, POLL_MS);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [refresh]);

  // Slow auto-scroll when zones overflow the screen; jumps back to top at the end.
  useEffect(() => {
    const el = scrollRef.current;
    const id = setInterval(() => {
      if (!el || el.scrollHeight <= el.clientHeight) return;
      el.scrollTop = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 ? 0 : el.scrollTop + 1;
    }, 50);
    return () => clearInterval(id);
  }, []);

  const areas = data?.areas ?? [];
  const showAreaHeadings = areas.length > 1;

  return (
    <div className="dash" ref={scrollRef}>
      <div className="dash-top">
        <h1>Parking Status</h1>
        <div className="dash-clock">
          <span>{now.toLocaleTimeString()}</span>
          {data && (
            <span className="dash-updated">
              Updated {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {data && areas.length === 0 && <p className="dash-empty">No parking zones configured yet</p>}

      {areas.map((area) => (
        <section key={area.areaId}>
          {showAreaHeadings && <h2 className="dash-area">{area.areaName}</h2>}
          <div className="dash-grid">
            {area.zones.map((zone) => {
              const status = statusOf(zone);
              return (
                // key includes the counts so the card remounts and flashes on change
                <div key={`${zone.zoneId}-${zone.occupied}-${zone.totalSpaces}`} className={`dash-card is-${status}`}>
                  <p className="dash-zone">{zone.zoneName}</p>
                  <p className="dash-status">{STATUS_LABEL[status]}</p>
                  <p className="dash-count">
                    {zone.available} / {zone.totalSpaces} available
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default DashboardView;
