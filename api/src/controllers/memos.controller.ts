import type { Request, Response, NextFunction } from 'express';
import type { AsyncMemoService } from '../services/memo.service';
import { MemoListQuerySchema } from '../schemas/memo.list.schema';
import { MemoIdSchema } from '../schemas/memo.schema';
import { ERROR_MESSAGES } from '../constants/errors';

export function createMemosController(service: AsyncMemoService) {
  // GET /memos
  async function listMemos(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = MemoListQuerySchema.parse(req.query);
      const { data, total, page, limit } = await service.list(parsed);
      res.set('X-Total-Count', String(total));

      return res.json({ data, total, page, limit });
    } catch (err) {
      return next(err); // Pass ZodError to error handling middleware
    }
  }

  // GET /memos/:id
  async function getMemoById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = MemoIdSchema.parse(req.params.id);
      const memo = await service.get(id);
      if (!memo) {
        return res.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      } 
      return res.json(memo);
    } catch (err) {
      return next(err);
    }
  }

  // TODO: INTERVIEW-07 - Implement the create, update, and delete controller functions
  async function createMemo(_req: Request, res: Response) {
    res.status(201).json({ id: 'placeholder', title: 'created', body: 'created' });
  }

  async function updateMemo(req: Request, res: Response) {
    res.status(200).json({ id: req.params.id, title: 'updated', body: 'updated' });
  }

  async function deleteMemo(_req: Request, res: Response) {
    res.status(204).send();
  }
  return { listMemos, getMemoById, createMemo, updateMemo, deleteMemo };
}
