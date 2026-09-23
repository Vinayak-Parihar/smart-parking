const BASE_URL = 'http://localhost:4000/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function getZones() {
  const res = await fetch(`${BASE_URL}/zones`);
  return handleResponse(res);
}

export async function getZoneLots(zoneId) {
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/lots`);
  return handleResponse(res);
}

export async function getZoneAllocations(zoneId) {
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/allocations`);
  return handleResponse(res);
}

export async function allocateSpace(zoneId, plateNumber) {
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plateNumber })
  });
  return handleResponse(res);
}

export async function unallocateSpace(zoneId, plateNumber) {
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/unallocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plateNumber })
  });
  return handleResponse(res);
}

export async function scanEntry(zoneId, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/scan-entry`, {
    method: 'POST',
    body: formData
  });
  return handleResponse(res);
}

export async function scanExit(zoneId, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/scan-exit`, {
    method: 'POST',
    body: formData
  });
  return handleResponse(res);
}
