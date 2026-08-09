import { useState } from 'react'
import { useResource } from '../api/useResource.js'
import { listAudit } from '../api/endpoints.js'
import { ErrorState, EmptyState, TableSkeleton } from '../components/States.jsx'
import { fmtDateTime } from '../lib/format.js'

const PAGE_SIZE = 25

export default function Security({ active }) {
  const [event, setEvent] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const audit = useResource(
    () => listAudit({ event, page, limit: PAGE_SIZE }),
    [event, page],
    { enabled: active },
  )

  const rows = audit.data?.data ?? []
  const total = audit.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function applySearch(e) {
    e.preventDefault()
    setEvent(query.trim())
    setPage(1)
  }

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-security">
      <form className="toolbar" onSubmit={applySearch}>
        <input
          className="search"
          placeholder="Type event name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btnO" type="submit">Search</button>
        {event ? (
          <button className="btnO" type="button" onClick={() => { setQuery(''); setEvent(''); setPage(1) }}>
            Clear
          </button>
        ) : null}
        <span className="sp" />
        <span className="count">{total} entr{total === 1 ? 'y' : 'ies'}</span>
      </form>

      {audit.error ? <ErrorState error={audit.error} onRetry={audit.reload} /> : (
        <div className="panel" style={{ padding: '6px 8px' }}>
          <table>
            <thead>
              <tr><th>Event</th><th>Actor</th><th>Target</th><th>When</th><th>Result</th></tr>
            </thead>
            {audit.loading && !audit.data ? <TableSkeleton rows={8} cols={5} /> : (
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td className="strong">{a.event}</td>
                    <td>{a.actorName || '-'}</td>
                    <td>{a.target || '-'}</td>
                    <td>{fmtDateTime(a.timestamp || a.createdAt)}</td>
                    <td>
                      <span className={'badge ' + (a.result === 'OK' ? 'b-green' : 'b-amber')}>
                        {a.result || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {!audit.loading && rows.length === 0 ? (
            <EmptyState
              title={event ? 'No entries match that filter' : 'No audit entries yet'}
              hint={event ? 'Try a different event name.' : 'Actions taken in the platform will be logged here.'}
            />
          ) : null}
        </div>
      )}

      {pages > 1 ? (
        <div className="pager">
          <button className="btnO" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="btnO" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      ) : null}
    </section>
  )
}
