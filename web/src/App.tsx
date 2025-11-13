import { useState, useEffect } from 'react';
import './App.css';
import { useMemosList } from './hooks/useMemosList';
import { DEBOUNCE_DELAY_MS, DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from './constants/memoConstants';

export default function App() {
  // Pagination state
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit] = useState(DEFAULT_PAGE_LIMIT);

  // Searches after short delay when user stops typing
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');

  // Search after short pause
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPage(DEFAULT_PAGE);
      setQuery(queryInput.trim());
    }, DEBOUNCE_DELAY_MS);

    // Cleanup on new effect run
    return () => clearTimeout(debounceTimer);
  }, [queryInput]); // Dependency on raw input

  const { data, isLoading, isError, error, isFetching } = useMemosList({
    page,
    limit,
    query,
  });

  useEffect(() => {
    if (!data) return;

    const { total, limit } = data;
    const maxPage = Math.max(1, Math.ceil(total / limit));

    if (page > maxPage) {
      // Intentionally synchronous to ensure refetch with valid page
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(1);
    }
  }, [data?.total, data?.limit, page]);

  const total = data?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>Memo Dashboard</h1>
          <p className="app-subtitle">Search, browse and manage your memos.</p>
        </div>
      </header>

      <section className="toolbar">
        <div className="search-form">
          <label className="search-label">
            <input
              id="search-input"
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Filter memos by title or body"
            />
          </label>
        </div>

        <div className="toolbar-meta">
          {isFetching && !isLoading && <span className="pill pill-sync">Refreshing memos…</span>}
          {data && (
            <span className="pill pill-count">
              Showing {data.data?.length ?? 0} of {total} memo
              {total === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </section>

      <main className="content">
        {isLoading && (
          <div className="status status-loading">
            <span className="spinner" aria-hidden="true" />
            <span>Loading memos…</span>
          </div>
        )}

        {isError && (
          <div className="status status-error">
            <p>Unable to load memos.</p>
            <p className="status-error-details">{(error as Error).message}</p>
          </div>
        )}

        {!isLoading && !isError && data && data.data?.length === 0 && (
          <div className="status status-empty">No memos found.</div>
        )}

        {!isLoading && !isError && data && data.data?.length > 0 && (
          <>
            <table className="memo-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Body</th>
                  <th>Version</th>
                  <th>Date Created</th>
                  <th>Date Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((memo) => (
                  <tr key={memo.id}>
                    <td>{memo.title}</td>
                    <td className="memo-body-cell">{memo.body}</td>
                    <td>{memo.version}</td>
                    <td>{new Date(memo.createdAt).toLocaleString()}</td>
                    <td>{new Date(memo.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <footer className="pagination">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => canGoPrev && setPage(page - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => canGoNext && setPage(page + 1)}
              >
                Next
              </button>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
