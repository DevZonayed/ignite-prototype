import { useResource } from '../api/useResource.js'
import {
  getSchoolDashboard, getLessonsDelivered, getCoverage, listAnnouncements,
} from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import { fmtNumber, fmtRelative, coverageColor } from '../lib/format.js'

function Bars({ points }) {
  const max = Math.max(1, ...points.map((p) => p.count))
  return (
    <div className="chart">
      {points.map((p) => (
        <div className="chart-col" key={p.day} title={`${p.day}: ${p.count}`}>
          <div className="chart-bar" style={{ height: `${Math.round((p.count / max) * 100)}%` }}>
            <span className="chart-val">{p.count}</span>
          </div>
          <span className="chart-lbl">{p.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function Overview({ schoolId, onNavigate }) {
  const dash = useResource(() => getSchoolDashboard(schoolId), [schoolId])
  const delivered = useResource(() => getLessonsDelivered(), [])
  const coverage = useResource(() => getCoverage(schoolId), [schoolId])
  const news = useResource(() => listAnnouncements({ limit: 5 }), [])

  if (dash.loading && !dash.data) {
    return <section className="view active"><Loading label="Loading your school…" variant="page" /></section>
  }
  if (dash.error) {
    return <section className="view active"><ErrorState error={dash.error} onRetry={dash.reload} /></section>
  }

  const d = dash.data || {}
  const rows = coverage.data ?? []
  const avgCoverage = rows.length
    ? Math.round(rows.reduce((n, c) => n + (c.coveragePercent || 0), 0) / rows.length)
    : 0

  return (
    <section className="view active" id="view-overview">
      <div className="tiles">
        <div className="tile">
          <div className="th"><span className="tl">Teachers</span></div>
          <div className="tn">{fmtNumber(d.teacherCount)}</div>
          <div className="tf">on staff</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Learners</span></div>
          <div className="tn">{fmtNumber(d.learnerCount)}</div>
          <div className="tf">enrolled</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Lessons today</span></div>
          <div className="tn">{fmtNumber(d.lessonsToday)}</div>
          <div className="tf">delivered so far</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Curriculum coverage</span></div>
          <div className="tn">{d.curriculumCompletionPercent ?? avgCoverage}%</div>
          <div className={'tf' + ((d.curriculumCompletionPercent ?? avgCoverage) >= 85 ? ' up' : '')}>
            across {rows.length} class{rows.length === 1 ? '' : 'es'}
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="panel">
          <div className="ph">
            <h3>Lessons delivered (last 7 days)</h3>
            <button type="button" className="linkbtn" onClick={delivered.reload}>Refresh</button>
          </div>
          {delivered.loading && !delivered.data ? <Loading label="Loading lessons delivered…" variant="chart" /> : null}
          {delivered.error ? <ErrorState error={delivered.error} onRetry={delivered.reload} /> : null}
          {delivered.data && delivered.data.length === 0 ? (
            <EmptyState title="No lessons delivered yet" hint="Sessions your teachers complete will chart here." />
          ) : null}
          {delivered.data && delivered.data.length > 0 ? <Bars points={delivered.data} /> : null}
        </div>

        <div className="panel">
          <div className="ph">
            <h3>Coverage by class</h3>
            <button type="button" className="linkbtn" onClick={() => onNavigate('curriculum')}>Open curriculum →</button>
          </div>
          {coverage.loading && !coverage.data ? <Loading label="Loading coverage…" variant="bars" /> : null}
          {coverage.error ? <ErrorState error={coverage.error} onRetry={coverage.reload} /> : null}
          {coverage.data && rows.length === 0 ? (
            <EmptyState title="No classes yet" hint="Create a class to start tracking coverage." />
          ) : null}
          {rows.length > 0 ? (
            <table>
              <thead><tr><th>Class</th><th>Delivered</th><th>Coverage</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.classId}>
                    <td className="strong">{c.className}</td>
                    <td>{c.deliveredLessons}/{c.totalLessons}</td>
                    <td>
                      <span className="cbar">
                        <i style={{ width: `${c.coveragePercent}%`, background: coverageColor(c.coveragePercent) }} />
                      </span>
                      {c.coveragePercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <h3>Announcements from IGNITE</h3>
          <button type="button" className="linkbtn" onClick={news.reload}>Refresh</button>
        </div>
        {news.loading && !news.data ? <Loading label="Loading announcements…" variant="rows" /> : null}
        {news.error ? <ErrorState error={news.error} onRetry={news.reload} /> : null}
        {news.data && (news.data.data ?? []).length === 0 ? (
          <EmptyState title="No announcements" hint="Notices posted by IGNITE admin appear here." />
        ) : null}
        {(news.data?.data ?? []).map((a) => (
          <div className="mcard" key={a.id}>
            <div className="strong">{a.title}</div>
            <div className="fm" style={{ margin: '5px 0 6px' }}>{a.message}</div>
            <div className="fm">{fmtRelative(a.createdAt)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
