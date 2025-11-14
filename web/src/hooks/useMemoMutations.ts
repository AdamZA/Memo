import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMemo, updateMemo, deleteMemo, type Memo } from '../api/memoClient';

type CreateMemoInput = {
  title: string;
  body: string;
};

type UpdateMemoInput = {
  id: string;
  patch: {
    title?: string;
    body?: string;
  };
};

export function useCreateMemo() {
  const queryClient = useQueryClient();

  return useMutation<Memo, Error, CreateMemoInput>({
    mutationFn: (input) => createMemo(input),
    onSuccess: (created) => {
      // Update detail cache for new memo
      queryClient.setQueryData<Memo>(['memo', created.id], created);

      // Invalidate the memo list so it refetches
      queryClient.invalidateQueries({ queryKey: ['memos'] });
    },
  });
}

export function useUpdateMemo() {
  const queryClient = useQueryClient();

  return useMutation<Memo, Error, UpdateMemoInput>({
    mutationFn: ({ id, patch }) => updateMemo(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<Memo>(['memo', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['memos'] });
    },
  });
}

export function useDeleteMemo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteMemo(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['memo', id], exact: true });
      queryClient.invalidateQueries({ queryKey: ['memos'] });
    },
  });
}
