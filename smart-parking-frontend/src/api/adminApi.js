const BASE_URL = 'http://localhost:4000/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function getParkings() {
  const res = await fetch(`${BASE_URL}/parkings`);
  return handleResponse(res);
}

export async function createParking({ name, capacity, reservedSpaces, vehicleType, lat, lng }) {
  const res = await fetch(`${BASE_URL}/parkings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, capacity, reservedSpaces, vehicleType, lat, lng })
  });
  return handleResponse(res);
}
