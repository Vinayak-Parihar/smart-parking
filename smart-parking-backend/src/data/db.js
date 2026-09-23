import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, 'db.json');

const defaultData = {
  zones: [
    { id: 'z1', areaId: 'a1', name: 'MG Road Zone', lat: 18.5204, lng: 73.8567 },
    { id: 'z2', areaId: 'a1', name: 'FC Road Zone', lat: 18.5236, lng: 73.8478 }
  ],
  lots: [
    { id: 'l1', zoneId: 'z1', name: 'MG Road Lot A', totalSpaces: 200 },
    { id: 'l2', zoneId: 'z2', name: 'FC Road Lot A', totalSpaces: 200 }
  ],
  allocations: [],
  parkings: []
};

const adapter = new JSONFile(dbFile);
const db = new Low(adapter, defaultData);

export async function initDb() {
  await db.read();
  // if db.json didn't exist, db.data will be null -> seed it
  db.data ||= defaultData;
  // backfill collections added after the db.json file was first created
  db.data.parkings ||= [];
  await db.write();
  return db;
}

export default db;
