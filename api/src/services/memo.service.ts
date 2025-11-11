import type { Memo, MemoId } from '../schemas/memo.schema';
import type { MemoRepo } from '../repos/memo.repo';
import {
  MemoCreate as MemoCreateSchema,
  MemoUpdate as MemoUpdateSchema,
} from '../schemas/memo.schema';

export interface MemoService {
  list(params?: { page?: number; limit?: number; query?: string }): Memo[];
  get(id: MemoId): Memo | undefined;
  create(input: unknown): Memo; // Unknown to enforce runtime validation
  update(id: MemoId, input: unknown): Memo | undefined;
  delete(id: MemoId): boolean;
}

export function createMemoService(repo: MemoRepo): MemoService {
  function list(params?: { page?: number; limit?: number; query?: string }): Memo[] {
    const { data } = repo.list(params);
    return data;
  }

  function get(id: MemoId): Memo | undefined {
    return repo.get(id);
  }

  function create(input: unknown): Memo {
    // Validate runtime input. Will throw ZodError if invalid.
    const parsed = MemoCreateSchema.parse(input);
    return repo.create(parsed);
  }

  function update(id: MemoId, input: unknown): Memo | undefined {
    // Validate runtime input. Will throw ZodError if invalid.
    const parsed = MemoUpdateSchema.parse(input);
    return repo.update(id, parsed);
  }

  // 'Delete' is a reserved word in JS/TS, so we use 'remove' internally
  function remove(id: MemoId): boolean {
    return repo.delete(id);
  }

  return { list, get, create, update, delete: remove };
}
