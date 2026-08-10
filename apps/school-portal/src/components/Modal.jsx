import { useEffect, useRef } from 'react'

/**
 * Dialog used for every create and edit form.
 *
 * Handles the things a bare <div> overlay gets wrong: Escape to dismiss,
 * backdrop click, locking background scroll, moving focus in on open and
 * putting it back on close, and keeping Tab inside the dialog.
 *
 * Pass `busy` while a write is in flight to block dismissal, so a half-saved
 * form cannot be closed out from under the request.
 */
export default function Modal({ title, subtitle, onClose, busy, children, width }) {
  const cardRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement

    // Focus the first real control rather than the dialog container.
    const card = cardRef.current
    const focusable = card?.querySelectorAll(
      'input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])',
    )
    const first = Array.from(focusable || []).find((el) => !el.dataset.modalClose)
    ;(first || card)?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      const target = previouslyFocused.current
      if (target && typeof target.focus === 'function') target.focus()
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && !busy) {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const card = cardRef.current
      if (!card) return
      const items = Array.from(
        card.querySelectorAll(
          'a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [onClose, busy])

  const titleId = 'modal-title'

  return (
    <div className="modal-layer">
      <div
        className="modal-back"
        onClick={() => { if (!busy) onClose() }}
      />
      <div
        className="modal-card"
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={width ? { maxWidth: width } : undefined}
      >
        <div className="modal-head">
          <div>
            <h2 className="modal-title" id={titleId}>{title}</h2>
            {subtitle ? <div className="modal-sub">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={busy}
            data-modal-close="true"
            aria-label="Close"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/** Standard footer: primary action on the right, cancel beside it. */
export function ModalActions({ onCancel, submitLabel, busy, disabled }) {
  return (
    <div className="modal-actions">
      <button className="btnO" type="button" onClick={onCancel} disabled={busy}>
        Cancel
      </button>
      <button className="btnP" type="submit" disabled={busy || disabled}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </div>
  )
}

/** Labelled field wrapper so every modal form lines up the same way. */
export function Field({ label, htmlFor, children, hint }) {
  return (
    <div className="modal-field">
      <label className="signin-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <div className="modal-hint">{hint}</div> : null}
    </div>
  )
}
