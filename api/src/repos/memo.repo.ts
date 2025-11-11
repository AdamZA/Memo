import { customAlphabet } from 'nanoid';
import type { Memo, MemoCreate, MemoUpdate, MemoId } from '../schemas/memo.schema';

// Injectable ID generator and clock for easy mocking/testing
export type IdGen = () => string;
export type Clock = () => number;

// Repository types
export type ListArgs = { page?: number; limit?: number; query?: string };
export type ListResult = { data: Memo[]; total: number; page: number; limit: number };

// Memo repository interface
export interface MemoRepo {
  list(args?: ListArgs): ListResult;
  get(id: MemoId): Memo | undefined;
  create(input: MemoCreate): Memo;
  update(id: MemoId, patch: MemoUpdate): Memo | undefined;
  delete(id: MemoId): boolean;
  clear(): void; // For testing purposes only
}

// URL-Safe NanoID generator (21 chars)
const defaultIdGen: IdGen = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-',
  21,
);
const defaultClock: Clock = () => Date.now();

// Pagination defaults
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Case insensitive substring match -> Used for filter queries
function matchesQuery(memo: Memo, query: string) {
  const needle = query.toLowerCase().trim();
  return memo.title.toLowerCase().includes(needle) || memo.body.toLowerCase().includes(needle);
}

// In-memory implementation of data repository, with query and pagination support
export function createInMemoryMemoRepo(opts?: { idGen?: IdGen; clock?: Clock }): MemoRepo {
  const idGen = opts?.idGen ?? defaultIdGen;
  const clock = opts?.clock ?? defaultClock;
  const store = new Map<MemoId, Memo>();

  function list(args: ListArgs = {}): ListResult {
    // Normalize pagination args
    const page = Math.max(1, Math.floor(args.page ?? DEFAULT_PAGE));
    const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(args.limit ?? DEFAULT_LIMIT)));
    const query = args.query?.trim();

    let rows = Array.from(store.values());
    if (query && query.length > 0) {
      rows = rows.filter((m) => matchesQuery(m, query));
    }

    const total = rows.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = rows.slice(startIndex, endIndex);

    return { data, total, page, limit };
  }

  function get(id: MemoId): Memo | undefined {
    return store.get(id);
  }

  function create(input: MemoCreate): Memo {
    const now = new Date(clock()).toISOString();
    const memo: Memo = {
      id: idGen(),
      title: input.title,
      body: input.body,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    store.set(memo.id, memo);
    return memo;
  }

  function update(id: MemoId, patch: MemoUpdate): Memo | undefined {
    const existing = store.get(id);
    if (!existing) return undefined;

    const now = new Date(clock()).toISOString();
    const updated: Memo = {
      ...existing,
      title: patch.title ?? existing.title,
      body: patch.body ?? existing.body,
      updatedAt: now,
      version: existing.version + 1,
    };
    store.set(id, updated);
    return updated;
  }

  function _delete(id: MemoId): boolean {
    return store.delete(id);
  }

  function clear() {
    store.clear();
  }

  return { list, get, create, update, delete: _delete, clear };
}
