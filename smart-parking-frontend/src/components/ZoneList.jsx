function ZoneList({ zones, selectedZoneId, onSelectZone }) {
  return (
    <div className="zone-list">
      <h2>Nearby Zones</h2>
      {zones.length === 0 && <p className="muted">No zones found nearby.</p>}
      <ul>
        {zones.map((zone) => (
          <li
            key={zone.id}
            className={zone.id === selectedZoneId ? 'zone-item active' : 'zone-item'}
            onClick={() => onSelectZone(zone.id)}
          >
            <span className="zone-name">{zone.name}</span>
            <span className="zone-coords">
              {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ZoneList;
