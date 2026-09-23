import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDb } from './data/db.js';
import zoneRoutes from './routes/zoneRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';

const PORT = process.env.PORT || 4000;

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

  httpServer.listen(PORT, () => {
    console.log(`Smart Parking backend running on http://localhost:${PORT}`);
  });
}

start();
