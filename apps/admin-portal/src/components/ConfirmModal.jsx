import Modal from './Modal.jsx'

/**
 * Confirmation for actions that cannot be undone.
 * `tone="danger"` colours the primary button for destructive work.
 */
export default function ConfirmModal({
  title,
  body,
  confirmLabel = 'Confirm',
  tone = 'default',
  busy,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} onClose={onClose} busy={busy} width={440}>
      <div className="confirm-body">{body}</div>
      {error ? <div className="signin-err">{error.message}</div> : null}
      <div className="modal-actions">
        <button className="btnO" type="button" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          className={tone === 'danger' ? 'btnP btn-danger' : 'btnP'}
          type="button"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
