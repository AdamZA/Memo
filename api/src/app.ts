import express from 'express';
import cors from 'cors';
import memosRouter from './routes/memos';
import { badJson, generalError, notFound } from './middleware/errors';

export function createApp() {
  const app = express();

  // Vite’s default dev server port is 5173 - which we use for serving our UI
  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json());

  // Basic health check route
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Defined memo routes
  app.use('/memos', memosRouter);

  // Handling of poor requests and error states
  app.use(badJson);
  app.use(notFound);

  // General, catch-all error handler
  app.use(generalError);

  return app;
}
