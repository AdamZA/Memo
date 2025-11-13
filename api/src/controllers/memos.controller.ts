import type { Request, Response, NextFunction } from 'express';
import type { AsyncMemoService } from '../services/memo.service';
import { MemoListQuerySchema } from '../schemas/memo.list.schema';
import { MemoCreateSchema, MemoIdSchema, MemoUpdateSchema } from '../schemas/memo.schema';
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

  // POST /memos
  async function createMemo(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate payload using Zod
      const payload = MemoCreateSchema.parse(req.body);

      const created = await service.create(payload);
      // 201 Created with entity in body
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  }

  // PUT /memos/:id
  async function updateMemo(req: Request, res: Response, next: NextFunction) {
    try {
      const id = MemoIdSchema.parse(req.params.id);
      const patch = MemoUpdateSchema.parse(req.body);

      const updated = await service.update(id, patch);
      if (!updated) {
        return res.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      }
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  }

  // DELETE /memos/:id
  async function deleteMemo(req: Request, res: Response, next: NextFunction) {
    try {
      const id = MemoIdSchema.parse(req.params.id);
      const deleted = await service.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
      }
      // 204 No Content on successful deletion
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }

  return { listMemos, getMemoById, createMemo, updateMemo, deleteMemo };
}
