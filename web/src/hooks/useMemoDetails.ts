import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getMemo, type Memo } from '../api/memoClient';
import { DEFAULT_STALE_TIME_MS, REFRESH_INTERVAL_MS } from '../constants/memoConstants';

type MemoQueryKey = readonly ['memo', string];

interface MemoDetailsOptions {
  enabled?: boolean;
  onSuccess?: (memo: Memo) => void;
}

export function useMemoDetails(id: string | undefined, options?: MemoDetailsOptions) {
  const baseOptions = {
    queryKey: ['memo', id ?? ''] as MemoQueryKey,
    queryFn: () => {
      if (!id) {
        throw new Error('Missing memo id');
      }
      return getMemo(id);
    },
    enabled: options?.enabled ?? Boolean(id),
    staleTime: DEFAULT_STALE_TIME_MS,
    refetchInterval: REFRESH_INTERVAL_MS,
    ...(options?.onSuccess ? { onSuccess: options.onSuccess } : {}),
  } as const;

  // Cast through `unknown` to sidestep the noisy overload helpers,
  // but still end up with a properly typed UseQueryOptions.
  const typedOptions = baseOptions as unknown as UseQueryOptions<Memo, Error, Memo, MemoQueryKey>;

  return useQuery(typedOptions);
}
