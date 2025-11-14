import './App.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  errorMessage?: string | null;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  errorMessage,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        {errorMessage && (
          <div className="status status-error" style={{ marginBottom: '0.75rem' }}>
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
