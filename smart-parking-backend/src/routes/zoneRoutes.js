import { Router } from 'express';
import multer from 'multer';
import db from '../data/db.js';
import {
  allocateSpace,
  unallocateSpace,
  getZoneOccupancy,
  getZoneAllocations
} from '../services/allocationService.js';
import { scanPlate } from '../services/anprClient.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// ---- Manual plate entry (kept for quick testing without a camera) ----

router.post('/zones/:id/allocate', async (req, res) => {
  const { plateNumber } = req.body;
  if (!plateNumber) {
    return res.status(400).json({ error: 'plateNumber is required' });
  }
  try {
    const allocation = await allocateSpace(req.params.id, plateNumber);
    req.app.get('io').emit('occupancy-changed', { zoneId: req.params.id });
    res.status(201).json(allocation);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

    const allocation = await allocateSpace(req.params.id, scanResult.plateNumber);
    req.app.get('io').emit('occupancy-changed', { zoneId: req.params.id });

    res.status(201).json({
      ...allocation,
      ocrConfidence: scanResult.confidence
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
