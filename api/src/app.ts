import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import memosRouter from './routes/memos';
import { notFound } from './middleware/errors';
import { ERROR_MESSAGES, PARSE_ERROR_TYPE } from './constants/errors';
import { JsonParseError } from './types/errors';

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
  app.use(notFound);

  // 400 responses for bad JSON
  app.use((err: JsonParseError, _req: Request, res: Response, next: NextFunction) => {
    if (err?.type === PARSE_ERROR_TYPE) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_JSON });
    }
    return next(err);
  });

  // General, catch-all error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  });

  return app;
}
