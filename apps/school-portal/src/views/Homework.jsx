import { useResource, useAction } from '../api/useResource.js'
import { getHomeworkCompliance, listHomework, sendHomeworkReminders } from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import { fmtRelative, humanize, coverageColor } from '../lib/format.js'

export default function Homework({ active, schoolId, onToast }) {
  const compliance = useResource(() => getHomeworkCompliance(schoolId), [schoolId], { enabled: active })
  const homework = useResource(() => listHomework({ limit: 20 }), [], { enabled: active })
  const remind = useAction()

  const rows = compliance.data ?? []
  const items = homework.data?.data ?? []

  const totals = rows.reduce(
    (acc, r) => ({
      homework: acc.homework + (r.totalHomework || 0),
      submissions: acc.submissions + (r.totalSubmissions || 0),
      pending: acc.pending + (r.pendingCount || 0),
      late: acc.late + (r.lateCount || 0),
    }),
    { homework: 0, submissions: 0, pending: 0, late: 0 },
  )
  const onTime = rows.length
    ? Math.round(rows.reduce((n, r) => n + (r.onTimePercent || 0), 0) / rows.length)
    : 0

  async function nudge(row) {
    const res = await remind.run(() => sendHomeworkReminders({ classId: row.classId }))
    onToast(res.ok ? `Reminder sent for ${row.className}` : res.error.message)
  }

  return (
    <section className={'view' + (active ? ' active' : '')}>
      <div className="tiles">
        <div className="tile">
          <div className="th"><span className="tl">Homework set</span></div>
          <div className="tn">{totals.homework}</div>
          <div className="tf">across all classes</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Submissions</span></div>
          <div className="tn">{totals.submissions}</div>
          <div className="tf">received</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Pending</span></div>
          <div className="tn">{totals.pending}</div>
          <div className="tf">{totals.late} late</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">On time</span></div>
          <div className="tn">{onTime}%</div>
          <div className={'tf' + (onTime >= 85 ? ' up' : '')}>average across classes</div>
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <h3>Compliance by class</h3>
          <button type="button" className="linkbtn" onClick={compliance.reload}>Refresh</button>
        </div>
        {compliance.loading && !compliance.data ? <Loading variant="bars" /> : null}
        {compliance.error ? <ErrorState error={compliance.error} onRetry={compliance.reload} /> : null}
        {compliance.data && rows.length === 0 ? (
          <EmptyState
            title="No homework compliance data yet"
            hint="Figures appear once teachers set homework and parents submit it."
          />
        ) : null}
        {rows.length > 0 ? (
          <table>
            <thead>
              <tr><th>Class</th><th>Set</th><th>Submitted</th><th>Pending</th><th>Late</th><th>On time</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.classId || r.className}>
                  <td className="strong">{r.className}</td>
                  <td>{r.totalHomework}</td>
                  <td>{r.totalSubmissions}</td>
                  <td>{r.pendingCount}</td>
                  <td>{r.lateCount}</td>
                  <td>
                    <span className="cbar">
                      <i style={{ width: `${r.onTimePercent}%`, background: coverageColor(r.onTimePercent) }} />
                    </span>
                    {r.onTimePercent}%
                  </td>
                  <td>
                    {r.classId && r.pendingCount > 0 ? (
                      <button className="btnO" disabled={remind.busy} onClick={() => nudge(r)}>
                        Remind
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <div className="panel">
        <div className="ph">
          <h3>Recent homework</h3>
          <button type="button" className="linkbtn" onClick={homework.reload}>Refresh</button>
        </div>
        {homework.loading && !homework.data ? <Loading variant="bars" /> : null}
        {homework.error ? <ErrorState error={homework.error} onRetry={homework.reload} /> : null}
        {homework.data && items.length === 0 ? (
          <EmptyState title="No homework set yet" hint="Homework your teachers create appears here." />
        ) : null}
        {items.length > 0 ? (
          <table>
            <thead><tr><th>Title</th><th>Status</th><th>Due</th><th>Set</th></tr></thead>
            <tbody>
              {items.map((h) => (
                <tr key={h.id}>
                  <td className="strong">{h.title}</td>
                  <td><span className="badge b-blue">{humanize(h.status)}</span></td>
                  <td>{h.dueAt ? fmtRelative(h.dueAt) : '-'}</td>
                  <td>{fmtRelative(h.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  )
}
