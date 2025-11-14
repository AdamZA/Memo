const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

// Memo types based on API schema
// Note: Keep in sync with api/src/schemas/memo.schema.ts

export type Memo = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type MemoListResponse = {
  data: Memo[];
  total: number;
  page: number;
  limit: number;
};

export type MemoListParams = {
  page?: number;
  limit?: number;
  query?: string;
};

export type MemoCreateInput = {
  title: string;
  body: string;
};

export type MemoUpdateInput = {
  title?: string;
  body?: string;
};

// API client functions

// Fetch memos from the API with (optional) pagination and (optional) query filtering
async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed with ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listMemos(params: MemoListParams = {}): Promise<MemoListResponse> {
  const url = new URL(`${API_BASE_URL}/memos`);
  url.searchParams.set('page', String(params.page));
  url.searchParams.set('limit', String(params.limit));
  if (params.query?.trim()) {
    url.searchParams.set('query', params.query.trim());
  }

  const res = await fetch(url.toString());
  return handleJson<MemoListResponse>(res);
}

export async function getMemo(id: string): Promise<Memo> {
  const res = await fetch(`${API_BASE_URL}/memos/${encodeURIComponent(id)}`);
  return handleJson<Memo>(res);
}

export async function createMemo(input: MemoCreateInput): Promise<Memo> {
  const res = await fetch(`${API_BASE_URL}/memos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleJson<Memo>(res);
}

export async function updateMemo(id: string, patch: MemoUpdateInput): Promise<Memo> {
  const res = await fetch(`${API_BASE_URL}/memos/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleJson<Memo>(res);
}

export async function deleteMemo(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/memos/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 404) {
    // 404 is safe to ignore client-side
    const text = await res.text();
    throw new Error(`Delete failed with ${res.status}: ${text || res.statusText}`);
  }
}
