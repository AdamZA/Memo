import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('./hooks/useMemosList', () => ({
  useMemosList: vi.fn(),
}));

import { useMemosList } from './hooks/useMemosList';
import App from './App';
import type { MemoListResponse } from './api/memoClient';

// Render helper
function renderWithQueryClient() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}

describe('Tests for Memo Dashboard', () => {
  beforeEach(() => {
    const mockedUseMemosList = useMemosList as Mock;

    mockedUseMemosList.mockReset();

    const fakeData: MemoListResponse = {
      data: [
        {
          id: 'test-id-1',
          title: 'Test memo',
          body: 'Hello world',
          version: 1,
          createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
          updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
    };

    mockedUseMemosList.mockReturnValue({
      data: fakeData,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    });
  });

  it('Renders header and search input', () => {
    renderWithQueryClient();

    expect(screen.getByRole('heading', { name: 'Memo Dashboard' })).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Filter memos by title or body')).toBeInTheDocument();
  });
});
