import { Router } from 'express';
import {
  listMemos,
  getMemoById,
  createMemo,
  updateMemo,
  deleteMemo,
} from '../controllers/memos.controller';
import { methodNotAllowed } from '../middleware/errors';

const router = Router();

router.get('/', listMemos); //default get path
router.get('/:id', getMemoById);
router.post('/', createMemo); //default post path
router.put('/:id', updateMemo);
router.delete('/:id', deleteMemo);

// Throw 405 on unsupported methods, return allowed methods in 'Allow' header
router.all('/', methodNotAllowed(['GET', 'POST']));
router.all('/:id', methodNotAllowed(['GET', 'PUT', 'DELETE']));

export default router;
