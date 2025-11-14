import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemoDetails } from './hooks/useMemoDetails';
import { useCreateMemo, useUpdateMemo } from './hooks/useMemoMutations';
import './App.css';

type MemoEditorMode = 'create' | 'edit';

interface MemoEditorPageProps {
  mode: MemoEditorMode;
}

export function MemoEditorPage({ mode }: MemoEditorPageProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isEdit = mode === 'edit';

  // Fetch memo only in edit mode
  const { data, isLoading, isError, error } = useMemoDetails(id, {
    enabled: isEdit && Boolean(id),
  });

  // Mutations
  const createMutation = useCreateMemo();
  const updateMutation = useUpdateMemo();

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (isEdit && id) {
      navigate(`/memos/${id}`);
    } else {
      navigate('/');
    }
  }

  async function handleSubmitCore(title: string, body: string) {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle || !trimmedBody) {
      throw new Error('Title and body are required.');
    }

    if (!isEdit) {
      await createMutation.mutateAsync({
        title: trimmedTitle,
        body: trimmedBody,
      });
    } else if (id) {
      await updateMutation.mutateAsync({
        id,
        patch: { title: trimmedTitle, body: trimmedBody },
      });
    }

    goBack();
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>{isEdit ? 'Edit Memo' : 'Create Memo'}</h1>
          <p className="app-subtitle">{isEdit ? 'Update memo details.' : 'Create a new memo.'}</p>
        </div>
      </header>

      <main className="content">
        {isEdit && isLoading && (
          <div className="status status-loading">
            <span className="spinner" aria-hidden="true" />
            <span>Loading memo…</span>
          </div>
        )}

        {isEdit && isError && (
          <div className="status status-error">
            <p>Unable to load memo.</p>
            <p className="status-error-details">{(error as Error).message}</p>
          </div>
        )}

        {(!isEdit || data) && (
          <MemoEditorForm
            mode={mode}
            initialTitle={isEdit && data ? data.title : ''}
            initialBody={isEdit && data ? data.body : ''}
            isPending={isPending}
            onSubmit={handleSubmitCore}
            onCancel={goBack}
          />
        )}
      </main>
    </div>
  );
}

interface MemoEditorFormProps {
  mode: MemoEditorMode;
  initialTitle: string;
  initialBody: string;
  isPending: boolean;
  onSubmit: (title: string, body: string) => Promise<void>;
  onCancel: () => void;
}

function MemoEditorForm({
  mode,
  initialTitle,
  initialBody,
  isPending,
  onSubmit,
  onCancel,
}: MemoEditorFormProps) {
  const isEdit = mode === 'edit';

  const [formTitle, setFormTitle] = useState(initialTitle);
  const [formBody, setFormBody] = useState(initialBody);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setFormError(null);
      await onSubmit(formTitle, formBody);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unable to save memo, please try again.';
      setFormError(message);
    }
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <label className="editor-field">
        <span>Title</span>
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          required
        />
      </label>

      <label className="editor-field">
        <span>Body</span>
        <textarea
          rows={5}
          value={formBody}
          onChange={(e) => setFormBody(e.target.value)}
          required
        />
      </label>

      {formError && (
        <div className="status status-error" style={{ marginTop: '0.5rem' }}>
          <p>{formError}</p>
        </div>
      )}

      <div className="editor-actions">
        <button type="submit" className="primary-button" disabled={isPending}>
          {isEdit ? 'Save changes' : 'Create memo'}
        </button>

        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
