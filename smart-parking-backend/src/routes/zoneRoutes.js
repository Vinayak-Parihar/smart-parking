import { Router } from 'express';
import multer from 'multer';
import db from '../data/db.js';
import {
  allocateSpace,
  unallocateSpace,
  getZoneOccupancy,
  getZoneAllocations,
  findActiveAllocationByPlate,
  getSystemWideOccupancy,
  suggestAlternativeZone
} from '../services/allocationService.js';
import { scanPlate } from '../services/anprClient.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Zone-full errors carry a suggested nearby zone (if any) instead of a dead end.
async function sendAllocationError(res, err, zoneId) {
  if (err.code !== 'ZONE_FULL') {
    return res.status(400).json({ error: err.message });
  }
  const suggestedZone = await suggestAlternativeZone(zoneId);
  res.status(400).json({ error: err.message, zoneFull: true, ...(suggestedZone && { suggestedZone }) });
}

// GET /zones - list all zones (later: filter by lat/lng within 1km)
router.get('/zones', async (req, res) => {
  await db.read();
  res.json(db.data.zones);
});

// GET /zones/:id/lots - lots + live occupancy for a zone
router.get('/zones/:id/lots', async (req, res) => {
  try {
    const occupancy = await getZoneOccupancy(req.params.id);
    res.json(occupancy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /zones/:id/allocations - currently parked vehicles in the zone
router.get('/zones/:id/allocations', async (req, res) => {
  try {
    const allocations = await getZoneAllocations(req.params.id);
    res.json(allocations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /dashboard/occupancy - every zone's occupancy, grouped by area
router.get('/dashboard/occupancy', async (req, res) => {
  res.json(await getSystemWideOccupancy());
});

// GET /find-my-car?plateNumber=MH12AB1234 - active allocation for one plate
router.get('/find-my-car', async (req, res) => {
  const { plateNumber } = req.query;
  if (typeof plateNumber !== 'string' || !plateNumber.trim()) {
    return res.status(400).json({ found: false, error: 'plateNumber is required' });
  }
  const result = await findActiveAllocationByPlate(plateNumber);
  if (!result) {
    return res.status(404).json({ found: false, message: 'No active parking found for this plate.' });
  }
  res.json(result);
});

// ---- Manual plate entry (kept for quick testing without a camera) ----

router.post('/zones/:id/allocate', async (req, res) => {
  const { plateNumber, isPriority } = req.body;
  if (!plateNumber) {
    return res.status(400).json({ error: 'plateNumber is required' });
  }
  try {
    const allocation = await allocateSpace(req.params.id, plateNumber, {
      isPriorityRequest: isPriority === true
    });
    req.app.get('io').emit('occupancy-changed', { zoneId: req.params.id });
    res.status(201).json(allocation);
  } catch (err) {
    await sendAllocationError(res, err, req.params.id);
  }
});

router.post('/zones/:id/unallocate', async (req, res) => {
  const { plateNumber } = req.body;
  if (!plateNumber) {
    return res.status(400).json({ error: 'plateNumber is required' });
  }
  try {
    const allocation = await unallocateSpace(plateNumber);
    req.app.get('io').emit('occupancy-changed', { zoneId: req.params.id });
    res.json(allocation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- ANPR-based entry/exit (real camera/image flow) ----

// POST /zones/:id/scan-entry  (multipart form, field "image")
router.post('/zones/:id/scan-entry', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'image file is required' });
  }
  try {
    const scanResult = await scanPlate(req.file.buffer, req.file.originalname);
    if (!scanResult) {
      return res.status(422).json({ error: 'No plate detected in image' });
    }

    const allocation = await allocateSpace(req.params.id, scanResult.plateNumber, {
      isPriorityRequest: req.body.isPriority === 'true'
    });
    req.app.get('io').emit('occupancy-changed', { zoneId: req.params.id });

    res.status(201).json({
      ...allocation,
      ocrConfidence: scanResult.confidence
    });
  } catch (err) {
    await sendAllocationError(res, err, req.params.id);
  }
});

// POST /zones/:id/scan-exit  (multipart form, field "image")
router.post('/zones/:id/scan-exit', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'image file is required' });
  }
  try {
    const scanResult = await scanPlate(req.file.buffer, req.file.originalname);
    if (!scanResult) {
      return res.status(422).json({ error: 'No plate detected in image' });
    }

    const allocation = await unallocateSpace(scanResult.plateNumber);
    req.app.get('io').emit('occupancy-changed', { zoneId: req.params.id });

    res.json({
      ...allocation,
      ocrConfidence: scanResult.confidence
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
