import { useResource } from '../api/useResource.js'
import {
  getAttendanceTrend, getAttendanceHeatmap, getAssessmentDistribution,
} from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import { fmtNumber } from '../lib/format.js'

/** Attendance percentage per week, drawn as a simple column chart. */
function TrendChart({ points }) {
  const max = Math.max(1, ...points.map((p) => p.attendancePercent ?? p.percent ?? 0))
  return (
    <div className="chart">
      {points.map((p, i) => {
        const value = p.attendancePercent ?? p.percent ?? 0
        return (
          <div className="chart-col" key={p.week ?? i} title={`${p.week ?? `Week ${i + 1}`}: ${value}%`}>
            <div className="chart-bar" style={{ height: `${Math.round((value / max) * 100)}%` }}>
              <span className="chart-val">{value}%</span>
            </div>
            <span className="chart-lbl">{p.week ?? `W${i + 1}`}</span>
          </div>
        )
      })}
    </div>
  )
}

const BANDS = [
  { key: 'emerging', label: 'Emerging', color: 'var(--danger)' },
  { key: 'developing', label: 'Developing', color: 'var(--warning)' },
  { key: 'secure', label: 'Secure', color: 'var(--success)' },
]

export default function Attendance({ active, schoolId }) {
  const trend = useResource(() => getAttendanceTrend(schoolId, 6), [schoolId], { enabled: active })
  const heatmap = useResource(() => getAttendanceHeatmap(schoolId), [schoolId], { enabled: active })
  const dist = useResource(() => getAssessmentDistribution(schoolId), [schoolId], { enabled: active })

  const trendRows = trend.data ?? []
  const heatRows = heatmap.data ?? []
  const d = dist.data || {}
  const distTotal = d.total ?? BANDS.reduce((n, b) => n + (d[b.key] || 0), 0)

  return (
    <section className={'view' + (active ? ' active' : '')}>
      <div className="grid2">
        <div className="panel">
          <div className="ph">
            <h3>Attendance trend (last 6 weeks)</h3>
            <span className="link" onClick={trend.reload}>Refresh</span>
          </div>
          {trend.loading && !trend.data ? <Loading /> : null}
          {trend.error ? <ErrorState error={trend.error} onRetry={trend.reload} /> : null}
          {trend.data && trendRows.length === 0 ? (
            <EmptyState
              title="No attendance recorded yet"
              hint="The trend builds once teachers mark attendance in their lessons."
            />
          ) : null}
          {trendRows.length > 0 ? <TrendChart points={trendRows} /> : null}
        </div>

        <div className="panel">
          <div className="ph">
            <h3>Assessment distribution</h3>
            <span className="link" onClick={dist.reload}>Refresh</span>
          </div>
          {dist.loading && !dist.data ? <Loading /> : null}
          {dist.error ? <ErrorState error={dist.error} onRetry={dist.reload} /> : null}
          {dist.data && distTotal === 0 ? (
            <EmptyState
              title="No assessments recorded yet"
              hint="Scores your teachers save against lessons appear here."
            />
          ) : null}
          {distTotal > 0 ? (
            <>
              <div className="distbar">
                {BANDS.map((b) => {
                  const n = d[b.key] || 0
                  if (!n) return null
                  return (
                    <span
                      key={b.key}
                      style={{ width: `${(n / distTotal) * 100}%`, background: b.color }}
                      title={`${b.label}: ${n}`}
                    />
                  )
                })}
              </div>
              <table>
                <thead><tr><th>Band</th><th>Learners</th><th>Share</th></tr></thead>
                <tbody>
                  {BANDS.map((b) => (
                    <tr key={b.key}>
                      <td className="strong">
                        <span className="dimdot" style={{ background: b.color }} /> {b.label}
                      </td>
                      <td>{fmtNumber(d[b.key] || 0)}</td>
                      <td>{Math.round(((d[b.key] || 0) / distTotal) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <h3>Attendance by class</h3>
          <span className="link" onClick={heatmap.reload}>Refresh</span>
        </div>
        {heatmap.loading && !heatmap.data ? <Loading /> : null}
        {heatmap.error ? <ErrorState error={heatmap.error} onRetry={heatmap.reload} /> : null}
        {heatmap.data && heatRows.length === 0 ? (
          <EmptyState
            title="Nothing to show yet"
            hint="Each class appears here once attendance has been marked for it."
          />
        ) : null}
        {heatRows.length > 0 ? (
          <table>
            <thead><tr><th>Class</th><th>Present</th><th>Absent</th><th>Rate</th></tr></thead>
            <tbody>
              {heatRows.map((r, i) => (
                <tr key={r.classId ?? i}>
                  <td className="strong">{r.className ?? r.label ?? '-'}</td>
                  <td>{fmtNumber(r.presentCount ?? r.present)}</td>
                  <td>{fmtNumber(r.absentCount ?? r.absent)}</td>
                  <td>{r.attendancePercent ?? r.percent ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  )
}
