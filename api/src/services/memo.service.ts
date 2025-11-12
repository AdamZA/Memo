import type { Memo, MemoId } from '../schemas/memo.schema';
import type { ListArgs, ListResult, AsyncMemoRepo } from '../repos/memo.repo';
import {
  MemoCreate as MemoCreateSchema,
  MemoUpdate as MemoUpdateSchema,
} from '../schemas/memo.schema';

export interface AsyncMemoService {
  list(params?: ListArgs): Promise<ListResult>;
  get(id: MemoId): Promise<Memo | undefined>;
  create(input: unknown): Promise<Memo>; // Unknown to enforce runtime validation
  update(id: MemoId, input: unknown): Promise<Memo | undefined>;
  delete(id: MemoId): Promise<boolean>;
}

// Service implementation that wraps the repo with input validation
// Note: Designed as async to allow for future async integrations (e.g. external APIs, queues)
export function createAsyncMemoService(repo: AsyncMemoRepo): AsyncMemoService {
  async function list(params?: ListArgs): Promise<ListResult> {
    return repo.list(params);
  }

  async function get(id: MemoId): Promise<Memo | undefined> {
    return repo.get(id);
  }

  async function create(input: unknown): Promise<Memo> {
    // Validate runtime input. Will throw ZodError if invalid.
    const parsed = MemoCreateSchema.parse(input);
    return repo.create(parsed);
  }

  async function update(id: MemoId, input: unknown): Promise<Memo | undefined> {
    // Validate runtime input. Will throw ZodError if invalid.
    const parsed = MemoUpdateSchema.parse(input);
    return repo.update(id, parsed);
  }

  // 'Delete' is a reserved word in JS/TS, so we use 'remove' internally
  async function remove(id: MemoId): Promise<boolean> {
    return repo.delete(id);
  }

  return { list, get, create, update, delete: remove };
}
