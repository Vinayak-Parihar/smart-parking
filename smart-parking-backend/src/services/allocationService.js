import db from '../data/db.js';
import { randomUUID } from 'crypto';

// Non-priority cars may use reserved spaces only once the general pool is full.
// Set false to keep reserved spaces strictly for priority vehicles.
const ALLOW_RESERVED_SPILLOVER = true;

/**
 * Allocates a space in the zone. Reserved spaces are numbers 1..reservedSpaces
 * of each lot; priority requests try those first, everyone else tries the
 * general range first. Within a range the lowest free number wins, so spaces
 * freed by exits get reused.
 */
export async function allocateSpace(zoneId, plateNumber, { isPriorityRequest = false } = {}) {
  await db.read();

  const lotsInZone = db.data.lots.filter((l) => l.zoneId === zoneId);
  if (lotsInZone.length === 0) {
    throw new Error(`No lots found for zone ${zoneId}`);
  }

  // check plate isn't already parked somewhere active
  const existing = db.data.allocations.find(
    (a) => a.plateNumber === plateNumber && a.status === 'occupied'
  );
  if (existing) {
    throw new Error(`Plate ${plateNumber} already has an active allocation`);
  }

  const pools = isPriorityRequest
    ? ['reserved', 'general']
    : ALLOW_RESERVED_SPILLOVER
      ? ['general', 'reserved']
      : ['general'];

  for (const pool of pools) {
    for (const lot of lotsInZone) {
      const reserved = Math.min(lot.reservedSpaces || 0, lot.totalSpaces);
      const [from, to] = pool === 'reserved' ? [1, reserved] : [reserved + 1, lot.totalSpaces];
      const taken = new Set(
        db.data.allocations
          .filter((a) => a.lotId === lot.id && a.status === 'occupied')
          .map((a) => a.spaceNumber)
      );

      for (let spaceNumber = from; spaceNumber <= to; spaceNumber++) {
        if (taken.has(spaceNumber)) continue;
        const allocation = {
          id: randomUUID(),
          lotId: lot.id,
          zoneId,
          spaceNumber,
          plateNumber,
          status: 'occupied',
          isPriorityAllocation: spaceNumber <= reserved,
          entryTime: new Date().toISOString(),
          exitTime: null
        };
        db.data.allocations.push(allocation);
        await db.write();
        return allocation;
      }
    }
  }

  const err = new Error(`Zone ${zoneId} is full — no available space`);
  err.code = 'ZONE_FULL';
  throw err;
}

/**
 * Finds the active allocation for a plate number and marks it vacated.
 */
export async function unallocateSpace(plateNumber) {
  await db.read();

  const allocation = db.data.allocations.find(
    (a) => a.plateNumber === plateNumber && a.status === 'occupied'
  );

  if (!allocation) {
    throw new Error(`No active allocation found for plate ${plateNumber}`);
  }

  allocation.status = 'vacated';
  allocation.exitTime = new Date().toISOString();
  await db.write();
  return allocation;
}

/**
 * Returns the currently parked vehicles in a zone (used to let a user
 * manually unallocate a specific plate instead of typing it in).
 */
export async function getZoneAllocations(zoneId) {
  await db.read();

  const lotsInZone = db.data.lots.filter((l) => l.zoneId === zoneId);
  const lotNameById = new Map(lotsInZone.map((l) => [l.id, l.name]));

  return db.data.allocations
    .filter((a) => a.zoneId === zoneId && a.status === 'occupied')
    .map((a) => ({
      id: a.id,
      plateNumber: a.plateNumber,
      lotName: lotNameById.get(a.lotId) || a.lotId,
      spaceNumber: a.spaceNumber,
      entryTime: a.entryTime
    }))
    .sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));
}

/**
 * Returns occupancy summary for a zone (used for live status / UI).
 */
export async function getZoneOccupancy(zoneId) {
  await db.read();

  const lotsInZone = db.data.lots.filter((l) => l.zoneId === zoneId);
  return lotsInZone.map((lot) => {
    const occupied = db.data.allocations.filter(
      (a) => a.lotId === lot.id && a.status === 'occupied'
    ).length;
    return {
      lotId: lot.id,
      lotName: lot.name,
      totalSpaces: lot.totalSpaces,
      occupied,
      available: lot.totalSpaces - occupied
    };
  });
}

/**
 * Looks up the active allocation for one plate and joins its lot/zone/area
 * for the "Find My Car" screen. Returns null if the plate isn't parked.
 * Only ever returns the queried plate — never a list.
 */
export async function findActiveAllocationByPlate(plateNumber) {
  await db.read();

  const normalize = (p) => String(p).toUpperCase().replace(/\s+/g, '');
  const plate = normalize(plateNumber);

  const allocation = db.data.allocations.find(
    (a) => normalize(a.plateNumber) === plate && a.status === 'occupied'
  );
  if (!allocation) return null;

  const lot = db.data.lots.find((l) => l.id === allocation.lotId);
  const zone = db.data.zones.find((z) => z.id === allocation.zoneId);
  const area = db.data.areas?.find((ar) => ar.id === zone?.areaId);

  return {
    found: true,
    plateNumber: allocation.plateNumber,
    areaName: area?.name ?? null,
    zoneName: zone?.name ?? allocation.zoneId,
    lotName: lot?.name ?? allocation.lotId,
    spaceNumber: allocation.spaceNumber,
    totalSpacesInLot: lot?.totalSpaces ?? null,
    isPriorityAllocation: !!allocation.isPriorityAllocation,
    entryTime: allocation.entryTime
  };
}

/**
 * Occupancy for every zone, grouped by area (for the big-screen dashboard).
 * Counts only — no plate numbers.
 */
export async function getSystemWideOccupancy() {
  await db.read();

  const occupiedByLot = new Map();
  for (const a of db.data.allocations) {
    if (a.status === 'occupied') occupiedByLot.set(a.lotId, (occupiedByLot.get(a.lotId) || 0) + 1);
  }

  const areas = new Map();
  for (const zone of db.data.zones) {
    const lots = db.data.lots.filter((l) => l.zoneId === zone.id);
    const totalSpaces = lots.reduce((sum, l) => sum + l.totalSpaces, 0);
    const occupied = lots.reduce((sum, l) => sum + (occupiedByLot.get(l.id) || 0), 0);

    if (!areas.has(zone.areaId)) {
      const area = db.data.areas?.find((ar) => ar.id === zone.areaId);
      areas.set(zone.areaId, {
        areaId: zone.areaId,
        areaName: area?.name ?? (zone.areaId === 'admin-added' ? 'Other Parking' : `Area ${zone.areaId}`),
        zones: []
      });
    }
    areas.get(zone.areaId).zones.push({
      zoneId: zone.id,
      zoneName: zone.name,
      totalSpaces,
      occupied,
      available: Math.max(0, totalSpaces - occupied)
    });
  }

  return { areas: [...areas.values()], lastUpdated: new Date().toISOString() };
}

function haversineKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/**
 * For a full zone, returns the nearest sibling zone (same area) that still has
 * space, or null. Falls back to "most available" when coordinates are missing.
 */
export async function suggestAlternativeZone(fullZoneId) {
  const { areas } = await getSystemWideOccupancy();
  const zonesById = new Map(db.data.zones.map((z) => [z.id, z]));
  const coordsOf = (z) => {
    const p = z?.entryPoint ?? z;
    return typeof p?.lat === 'number' && typeof p?.lng === 'number' ? p : null;
  };

  const fullZone = zonesById.get(fullZoneId);
  if (!fullZone) return null;
  const origin = coordsOf(fullZone);

  const candidates = (areas.find((a) => a.areaId === fullZone.areaId)?.zones ?? [])
    .filter((z) => z.zoneId !== fullZoneId && z.available > 0)
    .map((z) => {
      const target = coordsOf(zonesById.get(z.zoneId));
      const distanceKm = origin && target ? Math.round(haversineKm(origin, target) * 10) / 10 : null;
      return { zoneId: z.zoneId, zoneName: z.zoneName, available: z.available, distanceKm };
    });

  candidates.sort((a, b) =>
    a.distanceKm !== null && b.distanceKm !== null ? a.distanceKm - b.distanceKm : b.available - a.available
  );
  return candidates[0] ?? null;
}
