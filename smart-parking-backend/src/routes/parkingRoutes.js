import { Router } from 'express';
import { randomUUID } from 'crypto';
import db from '../data/db.js';

const router = Router();

const VEHICLE_TYPES = ['2-wheeler', '4-wheeler', 'both'];

function validateParkingInput(body) {
  const { name, capacity, vehicleType, lat, lng } = body;

  if (typeof name !== 'string' || !name.trim()) {
    return 'name is required';
  }
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return 'capacity must be a positive integer';
  }
  if (!VEHICLE_TYPES.includes(vehicleType)) {
    return `vehicleType must be one of: ${VEHICLE_TYPES.join(', ')}`;
  }
  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    return 'lat must be a number between -90 and 90';
  }
  if (typeof lng !== 'number' || lng < -180 || lng > 180) {
    return 'lng must be a number between -180 and 180';
  }
  return null;
}

// GET /api/parkings - list all admin-added parking locations
router.get('/parkings', async (req, res) => {
  await db.read();
  res.json(db.data.parkings);
});

// POST /api/parkings - add a new parking location (admin map pin + form)
router.post('/parkings', async (req, res) => {
  const validationError = validateParkingInput(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, capacity, vehicleType, lat, lng } = req.body;

  await db.read();
  const parking = {
    id: randomUUID(),
    name: name.trim(),
    capacity,
    vehicleType,
    lat,
    lng,
    createdAt: new Date().toISOString()
  };
  db.data.parkings.push(parking);

  // Mirror the parking into a zone + lot so it plugs into the existing
  // allocate/unallocate/scan machinery and shows up in the user view.
  db.data.zones.push({
    id: parking.id,
    areaId: 'admin-added',
    name: parking.name,
    lat,
    lng
  });
  db.data.lots.push({
    id: randomUUID(),
    zoneId: parking.id,
    name: `${parking.name} Lot`,
    totalSpaces: capacity
  });

  await db.write();

  req.app.get('io').emit('parking-added', parking);
  res.status(201).json(parking);
});

export default router;
