import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { initDb } from './data/db.js';
import zoneRoutes from './routes/zoneRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import { requireStaff } from './requireStaff.js';

const PORT = process.env.PORT || 4000;
const FRONTEND_DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../smart-parking-frontend/dist');

async function start() {
  await initDb();

  const app = express();
  app.use(cors());
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // make io accessible inside route handlers via req.app.get('io')
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', zoneRoutes);
  app.use('/api', parkingRoutes);
  app.get('/api/staff/check', requireStaff, (req, res) => res.json({ ok: true }));

  // In production the built frontend is served from here (one app, one URL).
  if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.get(/^\/(?!api\/|socket\.io\/|health$).*/, (req, res) =>
      res.sendFile(path.join(FRONTEND_DIST, 'index.html'))
    );
  }

  httpServer.listen(PORT, () => {
    console.log(`Smart Parking backend running on http://localhost:${PORT}`);
  });
}

start();
