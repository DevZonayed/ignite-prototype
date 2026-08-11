import { useState } from 'react'
import { useResource } from '../api/useResource.js'
import { listAudit, getAuditEntry, getAuditFacets } from '../api/endpoints.js'
import { ErrorState, EmptyState, TableSkeleton, Loading } from '../components/States.jsx'
import { fmtDateTime, fmtRelative, humanize } from '../lib/format.js'

const PAGE_SIZE = 25

/** Blank means "no filter", so an empty string must not reach the query string. */
function clean(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null),
  )
}

function resultBadge(result) {
  if (result === 'ok') return 'b-green'
  if (result === 'blocked') return 'b-amber'
  return 'b-red'
}

/** 2xx reads as success, 4xx as the caller's fault, 5xx as ours. */
function statusBadgeClass(code) {
  if (!code) return ''
  if (code < 300) return 'b-green'
  if (code < 500) return 'b-amber'
  return 'b-red'
}

/** Pretty-print the stored JSON, falling back to the raw string if it is not. */
function PayloadBlock({ label, json }) {
  if (!json) return null

  let body = json
  try {
    body = JSON.stringify(JSON.parse(json), null, 2)
  } catch {
    /* Stored truncated or non-JSON — show it as it is rather than nothing. */
  }

  return (
    <>
      <div className="dsec">{label}</div>
      <pre className="auditjson">{body}</pre>
    </>
  )
}

function DetailBody({ id }) {
  const entry = useResource(() => getAuditEntry(id), [id])

  if (entry.loading && !entry.data) return <Loading label="Loading entry…" variant="rows" rows={4} />
  if (entry.error) return <ErrorState error={entry.error} onRetry={entry.reload} />
  if (!entry.data) return null

  const a = entry.data

  return (
    <>
      <div className="dsec">Action</div>
      <div className="dlist">
        <div className="di"><span className="dil">Event</span><span className="dv">{a.event}</span></div>
        <div className="di"><span className="dil">When</span><span className="dv">{fmtDateTime(a.timestamp || a.createdAt)}</span></div>
        <div className="di"><span className="dil">Result</span><span className="dv"><span className={'badge ' + resultBadge(a.result)}>{humanize(a.result) || '-'}</span></span></div>
        <div className="di"><span className="dil">Status</span><span className="dv"><span className={'badge ' + statusBadgeClass(a.statusCode)}>{a.statusCode ?? '-'}</span></span></div>
        <div className="di"><span className="dil">Duration</span><span className="dv">{a.durationMs != null ? `${a.durationMs} ms` : '-'}</span></div>
      </div>

      <div className="dsec">Who</div>
      <div className="dlist">
        <div className="di"><span className="dil">Name</span><span className="dv">{a.actorName || 'Unauthenticated'}</span></div>
        <div className="di"><span className="dil">Email</span><span className="dv">{a.actorEmail || '-'}</span></div>
        <div className="di"><span className="dil">Role</span><span className="dv">{humanize(a.actorRole) || '-'}</span></div>
        <div className="di"><span className="dil">User ID</span><span className="dv mono">{a.actorId || '-'}</span></div>
        <div className="di"><span className="dil">School ID</span><span className="dv mono">{a.actorSchoolId || '-'}</span></div>
        <div className="di"><span className="dil">From</span><span className="dv">{humanize(a.source) || '-'}</span></div>
      </div>

      <div className="dsec">Request</div>
      <div className="dlist">
        <div className="di"><span className="dil">Method</span><span className="dv">{a.method || '-'}</span></div>
        <div className="di"><span className="dil">Path</span><span className="dv mono">{a.path || '-'}</span></div>
        <div className="di"><span className="dil">Resource</span><span className="dv">{a.targetType || '-'}</span></div>
        <div className="di"><span className="dil">Record ID</span><span className="dv mono">{a.targetId || '-'}</span></div>
        <div className="di"><span className="dil">IP address</span><span className="dv mono">{a.ip || '-'}</span></div>
      </div>

      {a.userAgent ? (
        <>
          <div className="dsec">Device</div>
          <pre className="auditjson">{a.userAgent}</pre>
        </>
      ) : null}

      <PayloadBlock label="Query parameters" json={a.requestQuery} />
      <PayloadBlock label="Request body" json={a.requestBody} />

      {a.errorMessage ? (
        <>
          <div className="dsec">Failure</div>
          <pre className="auditjson err">{a.errorMessage}</pre>
        </>
      ) : null}

      <div className="auditnote">
        Passwords, tokens and invite codes are replaced with [redacted] before an
        entry is stored, so they never appear here.
      </div>
    </>
  )
}

export default function Security({ active }) {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [source, setSource] = useState('')
  const [method, setMethod] = useState('')
  const [result, setResult] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)

  const filters = { search, actorRole: role, source, method, result }

  const audit = useResource(
    () => listAudit(clean({ ...filters, page, limit: PAGE_SIZE })),
    [search, role, source, method, result, page],
    { enabled: active },
  )

  const facets = useResource(() => getAuditFacets(), [], { enabled: active })

  const rows = audit.data?.data ?? []
  const total = audit.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const filtered = !!(search || role || source || method || result)

  function applySearch(e) {
    e.preventDefault()
    setSearch(query.trim())
    setPage(1)
  }

  function pick(setter) {
    return (e) => { setter(e.target.value); setPage(1) }
  }

  function clearAll() {
    setQuery(''); setSearch(''); setRole(''); setSource(''); setMethod(''); setResult(''); setPage(1)
  }

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-security">
      <form className="toolbar" onSubmit={applySearch}>
        <input
          className="search"
          placeholder="Search event, person, email or path"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btnO" type="submit">Search</button>

        <select className="filter" value={role} onChange={pick(setRole)}>
          <option value="">All roles</option>
          {(facets.data?.roles ?? []).map((r) => (
            <option key={r} value={r}>{humanize(r)}</option>
          ))}
        </select>

        <select className="filter" value={source} onChange={pick(setSource)}>
          <option value="">All apps</option>
          {(facets.data?.sources ?? []).map((s) => (
            <option key={s} value={s}>{humanize(s)}</option>
          ))}
        </select>

        <select className="filter" value={method} onChange={pick(setMethod)}>
          <option value="">All actions</option>
          <option value="GET">Viewed</option>
          <option value="POST">Created</option>
          <option value="PATCH">Updated</option>
          <option value="PUT">Replaced</option>
          <option value="DELETE">Deleted</option>
        </select>

        <select className="filter" value={result} onChange={pick(setResult)}>
          <option value="">Any outcome</option>
          <option value="ok">Succeeded</option>
          <option value="blocked">Blocked</option>
          <option value="failed">Failed</option>
        </select>

        {filtered ? (
          <button className="btnO" type="button" onClick={clearAll}>Clear</button>
        ) : null}

        <span className="sp" />
        <span className="count">{total} entr{total === 1 ? 'y' : 'ies'}</span>
      </form>

      {audit.error ? <ErrorState error={audit.error} onRetry={audit.reload} /> : (
        <div className="panel" style={{ padding: '6px 8px' }}>
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Target</th>
                <th>From</th>
                <th>Result</th>
                <th />
              </tr>
            </thead>
            {audit.loading && !audit.data ? <TableSkeleton rows={10} cols={7} /> : (
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="rowlink" onClick={() => setOpenId(a.id)}>
                    <td title={fmtDateTime(a.timestamp || a.createdAt)}>
                      {fmtRelative(a.timestamp || a.createdAt)}
                    </td>
                    <td>
                      <div className="strong">{a.actorName || 'Unauthenticated'}</div>
                      <div className="sub">{humanize(a.actorRole) || '-'}</div>
                    </td>
                    <td className="strong">{a.event}</td>
                    <td className="mono sub">{a.method} {a.path || a.target || '-'}</td>
                    <td>{humanize(a.source) || '-'}</td>
                    <td>
                      <span className={'badge ' + resultBadge(a.result)}>
                        {humanize(a.result) || '-'}
                      </span>
                      {a.statusCode ? <span className="sub"> {a.statusCode}</span> : null}
                    </td>
                    <td>
                      <button
                        className="linkbtn"
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setOpenId(a.id) }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {!audit.loading && rows.length === 0 ? (
            <EmptyState
              title={filtered ? 'No entries match these filters' : 'No activity logged yet'}
              hint={filtered
                ? 'Try widening the date, role or outcome filter.'
                : 'Every action taken in any portal or app is recorded here.'}
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

      <div className={'drawerback' + (openId ? ' on' : '')} onClick={() => setOpenId(null)} />
      <aside className={'drawer' + (openId ? ' on' : '')}>
        <div className="dh">
          <span className="dav" style={{ background: '#e0e7ff', color: '#4338ca' }}>◉</span>
          <div><div className="dn">Activity detail</div><div className="dr">Full request record</div></div>
          <button className="dclose" onClick={() => setOpenId(null)} aria-label="Close">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="dbody">{openId ? <DetailBody id={openId} /> : null}</div>
      </aside>
    </section>
  )
}
