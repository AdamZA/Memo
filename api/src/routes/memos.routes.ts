import { Router } from 'express';
import type { AsyncMemoService } from '../services/memo.service';
import { createMemosController } from '../controllers/memos.controller';
import { methodNotAllowed } from '../middleware/errors';

export function createMemosRouter(service: AsyncMemoService) {
  const router = Router();
  const { listMemos, getMemoById, createMemo, updateMemo, deleteMemo } =
    createMemosController(service);

  // Define routes and associate controller methods
  router.get('/', listMemos);
  router.get('/:id', getMemoById);
  router.post('/', createMemo);
  router.put('/:id', updateMemo);
  router.delete('/:id', deleteMemo);

  // Throw 405 on unsupported methods, return allowed methods in 'Allow' header
  router.all('/', methodNotAllowed(['GET', 'POST']));
  router.all('/:id', methodNotAllowed(['GET', 'PUT', 'DELETE']));

  return router;
}
