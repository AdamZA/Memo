import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../constants/memoConstants';

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

// API client functions

// Fetch memos from the API with (optional) pagination and (optional) query filtering
export async function listMemos(params: MemoListParams = {}): Promise<MemoListResponse> {
  const url = new URL('/memos', API_BASE_URL);

  if (params.page !== undefined) url.searchParams.set('page', String(params.page));
  if (params.limit !== undefined) url.searchParams.set('limit', String(params.limit));
  if (params.query && params.query.trim().length > 0) {
    url.searchParams.set('query', params.query.trim());
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    // Surface error to UI
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to fetch memos (${response.status}): ${text || 'Unknown error'}`);
  }

  const responseJson = await response.json();

  // Try to get total from header first (preferred), then fallback to body
  const totalHeader = response.headers.get('x-total-count');
  const totalFromHeader = totalHeader ? Number(totalHeader) : undefined;

  // Return normalized MemoListResponse
  return {
    data: responseJson.data ?? responseJson, // Handle case where body is just an array
    total:
      totalFromHeader ??
      responseJson.total ??
      (Array.isArray(responseJson.data) ? responseJson.data.length : 0),
    page: responseJson.page ?? params.page ?? DEFAULT_PAGE,
    limit: responseJson.limit ?? params.limit ?? DEFAULT_PAGE_LIMIT,
  };
}
