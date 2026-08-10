/** Placeholder rows that keep table height stable while loading. */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}><span className="skel" style={{ width: c === 0 ? '58%' : '34%' }} /></td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="state">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-err" role="alert">
      <div className="state-title">Could not load this</div>
      <div className="state-msg">{error?.message || 'Unknown error'}</div>
      {onRetry ? <button className="btnO" onClick={onRetry}>Try again</button> : null}
    </div>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="state">
      <div className="state-title">{title}</div>
      {hint ? <div className="state-msg">{hint}</div> : null}
    </div>
  )
}

/**
 * Standard load/error/empty/content switch so every view behaves the same.
 * `isEmpty` is only consulted once data has arrived.
 */
export function Resource({ query, isEmpty, empty, children, loadingLabel }) {
  if (query.loading && query.data == null) return <Loading label={loadingLabel} />
  if (query.error) return <ErrorState error={query.error} onRetry={query.reload} />
  if (query.data == null) return null
  if (isEmpty && isEmpty(query.data)) {
    return <EmptyState title={empty?.title || 'Nothing here yet'} hint={empty?.hint} />
  }
  return children(query.data)
}
