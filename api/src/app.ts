import express from 'express';
import cors from 'cors';
import { badJson, generalError, notFound } from './middleware/errors';
import { createMemosRouter } from './routes/memos.routes';
import { createMemoService, type MemoService } from './services/memo.service';
import { createInMemoryMemoRepo, MemoRepo } from './repos/memo.repo';

type AppDependencies = {
  repo?: MemoRepo;
  service?: MemoService;
};

export function createApp(dependencies: AppDependencies) {
  const app = express();
  // Provide warning if both repo and service are provided (service depends on repo)
  if (dependencies.repo && dependencies.service) {
    console.warn(
      '[createApp] Both `repo` and `service` were provided. The `service` will be used and the `repo` will be ignored for service creation. ' +
        'Ensure that the service was created with the intended repo instance.',
    );
  }

  // Setup dependencies with defaults if not provided
  const repo = dependencies.repo ?? createInMemoryMemoRepo();
  const service = dependencies.service ?? createMemoService(repo);
  const memosRouter = createMemosRouter(service);

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
