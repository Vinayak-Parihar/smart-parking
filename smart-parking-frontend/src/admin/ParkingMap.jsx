import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Self-drawn SVG pins instead of Leaflet's default PNG marker images —
// bundler-resolved image paths for those PNGs are unreliable across
// dev/build/browsers, so we draw the pin ourselves (also matches our theme).
const PIN_SVG = `
  <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.8 0 0 5.8 0 13c0 9.3 13 21 13 21s13-11.7 13-21C26 5.8 20.2 0 13 0z" fill="currentColor"/>
    <circle cx="13" cy="13" r="5" fill="#fff"/>
  </svg>
`;

const pinIcon = L.divIcon({
  className: 'parking-pin',
  html: PIN_SVG,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -30]
});

const draftIcon = L.divIcon({
  className: 'parking-pin parking-pin--draft',
  html: PIN_SVG,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -30]
});

const DEFAULT_CENTER = [18.5204, 73.8567]; // Pune, matches existing seeded zones
const DEFAULT_ZOOM = 13;

function vehicleTypeLabel(type) {
  if (type === '2-wheeler') return '2-Wheeler';
  if (type === '4-wheeler') return '4-Wheeler';
  return 'Both (2W & 4W)';
}

function ParkingMap({ parkings, draftPosition, onMapClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const draftMarkerRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  useEffect(() => {
    const map = L.map(containerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], DEFAULT_ZOOM);
          L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#3FB27F',
            fillColor: '#3FB27F',
            fillOpacity: 0.8
          })
            .bindPopup('Your current location')
            .addTo(map);
        },
        () => {
          // geolocation denied/unavailable — keep the default center
        }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    parkings.forEach((parking) => {
      const marker = L.marker([parking.lat, parking.lng], { icon: pinIcon });
      let popup = `<strong>${parking.name}</strong>`;
      if (parking.capacity != null) {
        popup += `<br/>Capacity: ${parking.capacity}`;
      }
      if (parking.vehicleType) {
        popup += `<br/>Vehicle type: ${vehicleTypeLabel(parking.vehicleType)}`;
      }
      marker.bindPopup(popup);
      marker.addTo(layer);
    });
  }, [parkings]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (draftMarkerRef.current) {
      map.removeLayer(draftMarkerRef.current);
      draftMarkerRef.current = null;
    }

    if (draftPosition) {
      draftMarkerRef.current = L.marker([draftPosition.lat, draftPosition.lng], {
        icon: draftIcon,
        opacity: 0.85
      }).addTo(map);
    }
  }, [draftPosition]);

  return <div ref={containerRef} className="parking-map" />;
}

export default ParkingMap;
