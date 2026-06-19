export default function ConfirmDialog({
  open,
  icon = '🐾',
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: {
  open: boolean;
  icon?: string;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-icon">{icon}</div>
        <h2 className="confirm-dialog-title">{title}</h2>
        {body && <p className="confirm-dialog-body">{body}</p>}
        <div className="confirm-dialog-actions">
          <button className="btn-view-full" onClick={onCancel}>{cancelLabel}</button>
          <button className={danger ? 'btn-reject' : 'btn-approve'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
