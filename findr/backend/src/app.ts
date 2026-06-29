import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware';

import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import profileRoutes from './routes/profile.routes';
import aiRoutes from './routes/ai.routes';
import matchRoutes from './routes/match.routes';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '12mb' })); // base64 images can get chunky
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'lost-and-found-api', time: new Date().toISOString() });
  });

  // Download the source ZIP via the public preview URL.
  app.get('/api/download', (_req, res) => {
    res.download(path.resolve('/app/findr.zip'), 'findr.zip');
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/users', profileRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/matches', matchRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
  });

  app.use(errorHandler);
  return app;
}
