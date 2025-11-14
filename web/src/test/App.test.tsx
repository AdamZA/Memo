import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../hooks/useMemosList', () => ({
  useMemosList: vi.fn(),
}));

vi.mock('../hooks/useMemoDetails', () => ({
  useMemoDetails: vi.fn(),
}));

vi.mock('../hooks/useMemoMutations', () => ({
  useCreateMemo: vi.fn(),
  useUpdateMemo: vi.fn(),
  useDeleteMemo: vi.fn(),
}));

import { useMemosList } from '../hooks/useMemosList';
import { useMemoDetails } from '../hooks/useMemoDetails';
import { useCreateMemo, useUpdateMemo, useDeleteMemo } from '../hooks/useMemoMutations';
import App from '../App';
import { MemoEditorPage } from '../MemoEditorPage';
import type { MemoListResponse, Memo } from '../api/memoClient';

// --- Test helpers ---

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

// Generic render helper with QueryClient + Router
function renderWithClientAndRouter(ui: React.ReactElement, route = '/') {
  const client = createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

// Render the dashboard (App) at "/"
function renderDashboard() {
  return renderWithClientAndRouter(<App />, '/');
}

// Render the editor page via routes to make useParams work
function renderEditorAtRoute(_mode: 'create' | 'edit', route: string) {
  const client = createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/memos/new" element={<MemoEditorPage mode="create" />} />
          <Route path="/memos/:id/edit" element={<MemoEditorPage mode="edit" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// --- Dashboard tests ---

describe('Memo Dashboard tests', () => {
  const mockedUseMemosList = useMemosList as Mock;
  const mockedUseDeleteMemo = useDeleteMemo as Mock;

  beforeEach(() => {
    mockedUseMemosList.mockReset();
    mockedUseDeleteMemo.mockReset();

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

    mockedUseDeleteMemo.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });
  });

  it('Test that header and search input renders', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Memo Dashboard' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter memos by title or body')).toBeInTheDocument();
  });

  it('Test that table row with memo data and actions renders', () => {
    renderDashboard();

    expect(screen.getByText('Test memo')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();

    // Actions: Edit + Delete buttons
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('Test loading state', () => {
    mockedUseMemosList.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      error: null,
    });

    renderDashboard();

    expect(screen.getByText('Loading memos…')).toBeInTheDocument();
  });

  it('Test error state for list call', () => {
    mockedUseMemosList.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      error: new Error('Boom'),
    });

    renderDashboard();

    expect(screen.getByText('Unable to load memos.')).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();
  });

  it('Test state when no memos provided', () => {
    mockedUseMemosList.mockReturnValueOnce({
      data: { data: [], total: 0, page: 1, limit: 20 } as MemoListResponse,
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    });

    renderDashboard();

    expect(screen.getByText('No memos found.')).toBeInTheDocument();
  });
});

// --- MemoEditorPage tests ---

describe('MemoEditorPage - create mode tests', () => {
  const mockedUseMemoDetails = useMemoDetails as Mock;
  const mockedUseCreateMemo = useCreateMemo as Mock;
  const mockedUseUpdateMemo = useUpdateMemo as Mock;
  const mockedUseDeleteMemo = useDeleteMemo as Mock;

  beforeEach(() => {
    mockedUseMemoDetails.mockReset();
    mockedUseCreateMemo.mockReset();
    mockedUseUpdateMemo.mockReset();
    mockedUseDeleteMemo.mockReset();

    // In create mode, details query is disabled, but we mock it anyway
    mockedUseMemoDetails.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });

    mockedUseCreateMemo.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });

    mockedUseUpdateMemo.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });

    mockedUseDeleteMemo.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });
  });

  it('Test that API not called when title/body are empty', async () => {
    renderEditorAtRoute('create', '/memos/new');

    const createButton = screen.getByRole('button', { name: 'Create memo' });
    await userEvent.click(createButton);

    const createMutation = mockedUseCreateMemo.mock.results[0].value;

    await waitFor(() => {
      expect(createMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });

  it('Test that createMutation that calls API runs with valid data', async () => {
    renderEditorAtRoute('create', '/memos/new');

    const titleInput = screen.getByLabelText('Title');
    const bodyTextarea = screen.getByLabelText('Body');

    await userEvent.type(titleInput, 'New memo title');
    await userEvent.type(bodyTextarea, 'New memo body');

    const createButton = screen.getByRole('button', { name: 'Create memo' });
    await userEvent.click(createButton);

    const createMutation = mockedUseCreateMemo.mock.results[0].value;

    await waitFor(() => {
      expect(createMutation.mutateAsync).toHaveBeenCalledWith({
        title: 'New memo title',
        body: 'New memo body',
      });
    });
  });
});

describe('MemoEditorPage - edit mode tests', () => {
  const mockedUseMemoDetails = useMemoDetails as Mock;
  const mockedUseUpdateMemo = useUpdateMemo as Mock;
  const mockedUseDeleteMemo = useDeleteMemo as Mock;

  const existingMemo: Memo = {
    id: 'edit-id-1',
    title: 'Existing memo title',
    body: 'Existing memo body',
    version: 3,
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-02T00:00:00Z').toISOString(),
  };

  beforeEach(() => {
    mockedUseMemoDetails.mockReset();
    mockedUseUpdateMemo.mockReset();
    mockedUseDeleteMemo.mockReset();

    mockedUseMemoDetails.mockReturnValue({
      data: existingMemo,
      isLoading: false,
      isError: false,
      error: null,
    });

    mockedUseUpdateMemo.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });

    mockedUseDeleteMemo.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });
  });

  it('Test that form pre-populates with existing memo data on Edit', () => {
    renderEditorAtRoute('edit', '/memos/edit-id-1/edit');

    expect(screen.getByDisplayValue('Existing memo title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing memo body')).toBeInTheDocument();
  });

  it('Test update mutation call which calls API update with valid data', async () => {
    renderEditorAtRoute('edit', '/memos/edit-id-1/edit');

    const titleInput = screen.getByLabelText('Title');
    const bodyTextarea = screen.getByLabelText('Body');

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated title');

    await userEvent.clear(bodyTextarea);
    await userEvent.type(bodyTextarea, 'Updated body text');

    const saveButton = screen.getByRole('button', { name: 'Save changes' });
    await userEvent.click(saveButton);

    const updateMutation = mockedUseUpdateMemo.mock.results[0].value;

    await waitFor(() => {
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'edit-id-1',
        patch: { title: 'Updated title', body: 'Updated body text' },
      });
    });
  });

  it('Test error state for memo details page', () => {
    mockedUseMemoDetails.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch memo'),
    });

    renderEditorAtRoute('edit', '/memos/bad-id/edit');

    expect(screen.getByText('Unable to load memo.')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch memo')).toBeInTheDocument();
  });
});
