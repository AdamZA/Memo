import { useQuery } from '@tanstack/react-query';
import { listMemos, type MemoListParams, type MemoListResponse } from '../api/memoClient';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../constants/memoConstants';

function makeEmptyList(params: MemoListParams): MemoListResponse {
  return {
    data: [],
    total: 0,
    page: params.page ?? DEFAULT_PAGE,
    limit: params.limit ?? DEFAULT_PAGE_LIMIT,
  };
}

export function useMemosList(params: MemoListParams) {
  return useQuery<MemoListResponse, Error>({
    queryKey: ['memos', params] as const,
    queryFn: () => listMemos(params),
    initialData: makeEmptyList(params),
  });
}
