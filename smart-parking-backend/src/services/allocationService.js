import db from '../data/db.js';
import { randomUUID } from 'crypto';

/**
 * Finds a lot within the zone that has a free space, and allocates one.
 * Picks the first lot in the zone with availability (simple strategy for demo;
 * can be replaced with load-balancing across lots later).
 */
export async function allocateSpace(zoneId, plateNumber) {
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

  for (const lot of lotsInZone) {
    const occupiedCount = db.data.allocations.filter(
      (a) => a.lotId === lot.id && a.status === 'occupied'
    ).length;

    if (occupiedCount < lot.totalSpaces) {
      const allocation = {
        id: randomUUID(),
        lotId: lot.id,
        zoneId,
        spaceNumber: occupiedCount + 1,
        plateNumber,
        status: 'occupied',
        entryTime: new Date().toISOString(),
        exitTime: null
      };
      db.data.allocations.push(allocation);
      await db.write();
      return allocation;
    }
  }

  throw new Error(`Zone ${zoneId} is full — no available space`);
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
