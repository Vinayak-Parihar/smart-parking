const BASE_URL = '/api';

// Staff PIN (only needed when the backend has STAFF_PIN set). Kept for this tab only.
export function saveStaffPin(pin) {
  try {
    sessionStorage.setItem('staffPin', pin);
  } catch {
    // storage blocked: PIN won't be remembered
  }
}

export function staffHeaders() {
  try {
    const pin = sessionStorage.getItem('staffPin');
    return pin ? { 'x-staff-pin': pin } : {};
  } catch {
    return {};
  }
}

export async function checkStaffPin() {
  const res = await fetch(`${BASE_URL}/staff/check`, { headers: staffHeaders() });
  return res.ok;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    // keep status + body so callers can react to e.g. zoneFull / suggestedZone
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
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
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/allocations`, { headers: staffHeaders() });
  return handleResponse(res);
}

export async function allocateSpace(zoneId, plateNumber, isPriority = false) {
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...staffHeaders() },
    body: JSON.stringify({ plateNumber, isPriority })
  });
  return handleResponse(res);
}

export async function unallocateSpace(zoneId, plateNumber) {
  const res = await fetch(`${BASE_URL}/zones/${zoneId}/unallocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...staffHeaders() },
    body: JSON.stringify({ plateNumber })
  });
  return handleResponse(res);
}

export async function scanEntry(zoneId, imageFile, isPriority = false) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('isPriority', String(isPriority));
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

// 404 is a normal "not parked" answer here, so return it instead of throwing.
export async function findMyCar(plateNumber) {
  const res = await fetch(`${BASE_URL}/find-my-car?plateNumber=${encodeURIComponent(plateNumber)}`);
  const data = await res.json();
  if (!res.ok && res.status !== 404) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function getDashboardOccupancy() {
  const res = await fetch(`${BASE_URL}/dashboard/occupancy`);
  return handleResponse(res);
}
