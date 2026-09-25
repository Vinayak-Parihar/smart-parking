// Self-check for allocation rules. Run: node src/services/allocation.check.js
// Uses a throwaway db file, never the real db.json.
import assert from 'assert/strict';
import os from 'os';
import path from 'path';
import fs from 'fs';

process.env.DB_FILE = path.join(os.tmpdir(), `smart-parking-check-${Date.now()}.json`);
const { initDb, default: db } = await import('../data/db.js');
const svc = await import('./allocationService.js');

await initDb();
db.data.zones = [
  { id: 'za', areaId: 'x', name: 'A', lat: 18.52, lng: 73.85 },
  { id: 'zb', areaId: 'x', name: 'B', lat: 18.53, lng: 73.85 },
  { id: 'zc', areaId: 'x', name: 'C', lat: 18.6, lng: 73.85 },
  { id: 'zd', areaId: 'y', name: 'D', lat: 18.52, lng: 73.85 }
];
db.data.lots = [
  { id: 'la', zoneId: 'za', name: 'LA', totalSpaces: 4, reservedSpaces: 2 },
  { id: 'lb', zoneId: 'zb', name: 'LB', totalSpaces: 5 },
  { id: 'lc', zoneId: 'zc', name: 'LC', totalSpaces: 50 },
  { id: 'ld', zoneId: 'zd', name: 'LD', totalSpaces: 50 }
];
db.data.allocations = [];
await db.write();

try {
  const p1 = await svc.allocateSpace('za', 'P1', { isPriorityRequest: true });
  assert.equal(p1.spaceNumber, 1, 'priority gets a reserved space');
  assert.equal(p1.isPriorityAllocation, true);

  assert.equal((await svc.allocateSpace('za', 'G1')).spaceNumber, 3, 'general skips reserved range');
  assert.equal((await svc.allocateSpace('za', 'G2')).spaceNumber, 4);

  const spill = await svc.allocateSpace('za', 'G3');
  assert.equal(spill.spaceNumber, 2, 'general spills into reserved once general is full');

  await assert.rejects(svc.allocateSpace('za', 'G4'), (e) => e.code === 'ZONE_FULL');

  const suggestion = await svc.suggestAlternativeZone('za');
  assert.equal(suggestion.zoneId, 'zb', 'nearest sibling in same area');
  assert.equal(suggestion.distanceKm, 1.1);

  await svc.unallocateSpace('G1');
  const p2 = await svc.allocateSpace('za', 'P2', { isPriorityRequest: true });
  assert.equal(p2.spaceNumber, 3, 'priority falls back to general when reserved is full');
  assert.equal(p2.isPriorityAllocation, false);

  assert.equal((await svc.findActiveAllocationByPlate(' p1 ')).spaceNumber, 1);
  assert.equal(await svc.findActiveAllocationByPlate('G1'), null, 'exited plate not found');

  console.log('allocation checks passed');
} finally {
  fs.rmSync(process.env.DB_FILE, { force: true });
}
