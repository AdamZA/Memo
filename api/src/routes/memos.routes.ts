import { Router } from 'express';
import type { MemoService } from '../services/memo.service';
import { createMemosController } from '../controllers/memos.controller';
import { methodNotAllowed } from '../middleware/errors';

export function createMemosRouter(service: MemoService) {
  const router = Router();
  const { listMemos, getMemoById, createMemo, updateMemo, deleteMemo } =
    createMemosController(service);

  router.get('/', listMemos);
  router.get('/:id', getMemoById);

  // TODO: INTERVIEW-07 - Implement the routes for creating, updating, and deleting memos
  router.post('/', createMemo);
  router.put('/:id', updateMemo);
  router.delete('/:id', deleteMemo);

  // Throw 405 on unsupported methods, return allowed methods in 'Allow' header
  router.all('/', methodNotAllowed(['GET', 'POST']));
  router.all('/:id', methodNotAllowed(['GET', 'PUT', 'DELETE']));

  return router;
}
