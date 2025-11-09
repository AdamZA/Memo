import express from 'express';
import cors from 'cors';

export function createApp() {
  const app = express();
  // Vite’s default dev server port is 5173
  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // error handler placeholder
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}
