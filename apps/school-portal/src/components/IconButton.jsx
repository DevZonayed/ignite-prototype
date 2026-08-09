/**
 * Icon-only action button for table rows.
 *
 * The label is required and does real work: it becomes the accessible name and
 * the hover tooltip, so the action stays discoverable without a visible caption.
 */
export default function IconButton({ label, icon, onClick, tone = 'default', disabled, busy }) {
  return (
    <button
      type="button"
      className={'iconact' + (tone === 'danger' ? ' danger' : '')}
      onClick={onClick}
      disabled={disabled || busy}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  )
}

/** Row action container: keeps spacing consistent and stops wrapping. */
export function Actions({ children }) {
  return <div className="act-group">{children}</div>
}
