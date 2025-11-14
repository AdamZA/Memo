import { Link, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import { useMemoDetails } from './hooks/useMemoDetails';
import { useDeleteMemo } from './hooks/useMemoMutations';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from './ConfirmDialog';
import { useState } from 'react';

export function MemoDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useMemoDetails(id);
  const deleteMutation = useDeleteMemo();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function openConfirm() {
    setIsConfirmOpen(true);
  }

  function closeConfirm() {
    setIsConfirmOpen(false);
  }

  async function handleConfirmDelete() {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);

      // ensure list is fresh when we go back
      await queryClient.invalidateQueries({ queryKey: ['memos'], exact: false });

      closeConfirm();
      navigate('/');
    } catch (err) {
      console.error(err);
      closeConfirm();
    }
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>Memo Details</h1>
          <p className="app-subtitle">View a single memo by ID.</p>
        </div>

        <div className="app-header-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(`/memos/${id}/edit`)}
          >
            Edit
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={openConfirm}
            disabled={deleteMutation.isPending}
          >
            Delete
          </button>

          <Link className="primary-button" to="/">
            Back to list
          </Link>
        </div>
      </header>

      <main className="content">
        {isLoading && (
          <div className="status status-loading">
            <span className="spinner" aria-hidden="true" />
            <span>Loading memo…</span>
          </div>
        )}

        {isError && (
          <div className="status status-error">
            <p>Unable to load memo.</p>
            <p className="status-error-details">{(error as Error).message}</p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <article className="memo-detail">
            <h2 className="memo-detail-heading">Memo overview</h2>

            <table className="memo-detail-table">
              <tbody>
                <tr>
                  <th scope="row">Title</th>
                  <td>{data.title}</td>
                </tr>
                {/* you already moved Body up here, leaving metadata below */}
                <tr>
                  <th scope="row">Body</th>
                  <td className="memo-detail-body-cell">
                    <p className="memo-detail-body">{data.body}</p>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Version</th>
                  <td>{data.version}</td>
                </tr>
                <tr>
                  <th scope="row">Created</th>
                  <td>{new Date(data.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <th scope="row">Updated</th>
                  <td>{new Date(data.updatedAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </article>
        )}
      </main>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete memo"
        message="Are you sure you want to delete this memo? This action cannot be undone."
        confirmLabel="Delete memo"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
}
