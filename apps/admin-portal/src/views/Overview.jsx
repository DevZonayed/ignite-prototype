import { useResource } from '../api/useResource.js'
import { getPlatformDashboard, listSchools, listAudit } from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import { fmtNumber, fmtRelative, coverageColor } from '../lib/format.js'

const ICONS = {
  school: <path d="M3 21V9l9-6 9 6v12" />,
  teacher: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /></>,
  learner: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  lesson: <><path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10" /><path d="M9 14l2 2 4-4" /></>,
}

function Tile({ icon, bg, color, label, value, foot, footUp }) {
  return (
    <div className="tile">
      <div className="th">
        <span className="ti" style={{ background: bg, color }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {ICONS[icon]}
          </svg>
        </span>
        <span className="tl">{label}</span>
      </div>
      <div className="tn">{value}</div>
      <div className={'tf' + (footUp ? ' up' : '')}>{foot}</div>
    </div>
  )
}

export default function Overview({ onNavigate }) {
  const dash = useResource(() => getPlatformDashboard(), [])
  const schools = useResource(() => listSchools({ limit: 5 }), [])
  const audit = useResource(() => listAudit({ limit: 5 }), [])

  if (dash.loading && !dash.data) {
    return <section className="view active"><Loading label="Loading platform overview…" /></section>
  }
  if (dash.error) {
    return <section className="view active"><ErrorState error={dash.error} onRetry={dash.reload} /></section>
  }

  const d = dash.data || {}

  return (
    <section className="view active" id="view-overview">
      <div className="tiles">
        <Tile
          icon="school" bg="#e0e7ff" color="#4f46e5"
          label="Schools live" value={fmtNumber(d.totalSchools)}
          foot={`${fmtNumber(d.totalLessons)} lessons authored`}
        />
        <Tile
          icon="teacher"
          bg="color-mix(in srgb,var(--success) 15%,transparent)" color="var(--success)"
          label="Teachers" value={fmtNumber(d.totalTeachers)}
          foot={`${fmtNumber(d.activeTeachers)} active`}
        />
        <Tile
          icon="learner"
          bg="color-mix(in srgb,var(--violet) 15%,transparent)" color="var(--violet)"
          label="Learners" value={fmtNumber(d.totalLearners)}
          foot={`${fmtNumber(d.activeLearners)} active`}
        />
        <Tile
          icon="lesson"
          bg="color-mix(in srgb,var(--ignite) 15%,transparent)" color="var(--ignite)"
          label="Lessons this week" value={fmtNumber(d.lessonsThisWeek)}
          foot={`Sync health ${d.syncHealthPercent ?? 0}%`}
          footUp={(d.syncHealthPercent ?? 0) >= 90}
        />
      </div>

      <div className="grid2">
        <div className="panel">
          <div className="ph">
            <h3>Adoption by school</h3>
            <span className="link" onClick={() => onNavigate('schools')}>View all →</span>
          </div>
          {schools.loading && !schools.data ? <Loading /> : null}
          {schools.error ? <ErrorState error={schools.error} onRetry={schools.reload} /> : null}
          {schools.data && schools.data.data.length === 0 ? (
            <EmptyState title="No schools yet" hint="Schools you create will appear here." />
          ) : null}
          {schools.data && schools.data.data.length > 0 ? (
            <table>
              <thead><tr><th>School</th><th>Region</th><th>AI cap used</th><th>Last sync</th></tr></thead>
              <tbody>
                {schools.data.data.map((s) => (
                  <tr key={s.id}>
                    <td className="strong">{s.name}</td>
                    <td>{s.region || '-'}</td>
                    <td>
                      <span className="cbar">
                        <i style={{ width: `${s.aiCapUsedPercent ?? 0}%`, background: coverageColor(100 - (s.aiCapUsedPercent ?? 0)) }} />
                      </span>
                      {s.aiCapUsedPercent ?? 0}%
                    </td>
                    <td>{fmtRelative(s.lastSyncAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        <div className="panel">
          <div className="ph">
            <h3>Audit activity</h3>
            <span className="link" onClick={() => onNavigate('security')}>Open log →</span>
          </div>
          {audit.loading && !audit.data ? <Loading /> : null}
          {audit.error ? <ErrorState error={audit.error} onRetry={audit.reload} /> : null}
          {audit.data && audit.data.data.length === 0 ? (
            <EmptyState title="No audit entries yet" />
          ) : null}
          {audit.data && audit.data.data.length > 0 ? (
            <div className="feed">
              {audit.data.data.map((a) => (
                <div className="fitem" key={a.id}>
                  <span
                    className="fi"
                    style={
                      a.result === 'OK'
                        ? { background: 'var(--brand-soft)', color: 'var(--brand)' }
                        : { background: 'color-mix(in srgb,var(--danger) 15%,transparent)', color: 'var(--danger)' }
                    }
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                    </svg>
                  </span>
                  <div>
                    <div className="ft">{a.event}</div>
                    <div className="fm">{a.actorName || 'system'} · {fmtRelative(a.timestamp || a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
