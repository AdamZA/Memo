import type { Memo, MemoCreate, MemoId, MemoUpdate } from '../schemas/memo.schema';
import type { ListArgs, ListResult, AsyncMemoRepo } from '../repos/memo.repo';

export interface AsyncMemoService {
  list(params?: ListArgs): Promise<ListResult>;
  get(id: MemoId): Promise<Memo | undefined>;
  create(input: MemoCreate): Promise<Memo>;
  update(id: MemoId, input: MemoUpdate): Promise<Memo | undefined>;
  delete(id: MemoId): Promise<boolean>;
}

// Service implementation that communicates with the repository
// Note: Designed as async to allow for future async integrations (e.g. external APIs, queues)
export function createAsyncMemoService(repo: AsyncMemoRepo): AsyncMemoService {
  async function list(params?: ListArgs): Promise<ListResult> {
    return repo.list(params);
  }

  async function get(id: MemoId): Promise<Memo | undefined> {
    return repo.get(id);
  }

  async function create(input: MemoCreate): Promise<Memo> {
    return repo.create(input);
  }

  async function update(id: MemoId, input: MemoUpdate): Promise<Memo | undefined> {
    return repo.update(id, input);
  }

  // 'Delete' is a reserved word in JS/TS, so we use 'remove' internally
  async function remove(id: MemoId): Promise<boolean> {
    return repo.delete(id);
  }

  return { list, get, create, update, delete: remove };
}
