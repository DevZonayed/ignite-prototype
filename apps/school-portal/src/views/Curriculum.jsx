import { useResource } from '../api/useResource.js'
import { getCoverage, listCurricula, getSchool } from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState, Skel } from '../components/States.jsx'
import { fmtDate, humanize, coverageColor } from '../lib/format.js'

export default function Curriculum({ active, schoolId }) {
  const coverage = useResource(() => getCoverage(schoolId), [schoolId], { enabled: active })
  const curricula = useResource(() => listCurricula(), [], { enabled: active })
  const school = useResource(() => getSchool(schoolId), [schoolId], { enabled: active })

  const rows = coverage.data ?? []
  const assigned = (curricula.data ?? []).find((c) => c.id === school.data?.curriculumVersionId)
  const units = assigned?.units ?? []
  const avg = rows.length
    ? Math.round(rows.reduce((n, c) => n + (c.coveragePercent || 0), 0) / rows.length)
    : 0

  return (
    <section className={'view' + (active ? ' active' : '')}>
      <div className="tiles">
        <div className="tile">
          <div className="th"><span className="tl">Assigned curriculum</span></div>
          <div className="tn" style={{ fontSize: 20 }}>
            {school.loading && !school.data ? <Skel w={140} h={14} /> : assigned ? `${assigned.name} v${assigned.version}` : 'None'}
          </div>
          <div className="tf">
            {assigned?.publishedAt ? `published ${fmtDate(assigned.publishedAt)}` : 'assigned by IGNITE admin'}
          </div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Average coverage</span></div>
          <div className="tn">{avg}%</div>
          <div className={'tf' + (avg >= 85 ? ' up' : '')}>across {rows.length} class{rows.length === 1 ? '' : 'es'}</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Classes on track</span></div>
          <div className="tn">{rows.filter((c) => (c.coveragePercent || 0) >= 85).length}</div>
          <div className="tf">at 85% or above</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Needs attention</span></div>
          <div className="tn">{rows.filter((c) => (c.coveragePercent || 0) < 70).length}</div>
          <div className="tf">below 70%</div>
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <h3>Coverage by class</h3>
          <button type="button" className="linkbtn" onClick={coverage.reload}>Refresh</button>
        </div>
        {coverage.loading && !coverage.data ? <Loading label="Loading coverage…" variant="bars" /> : null}
        {coverage.error ? <ErrorState error={coverage.error} onRetry={coverage.reload} /> : null}
        {coverage.data && rows.length === 0 ? (
          <EmptyState
            title="No coverage recorded yet"
            hint="Coverage appears once your teachers deliver lessons to a class."
          />
        ) : null}
        {rows.length > 0 ? (
          <table>
            <thead><tr><th>Class</th><th>Delivered</th><th>Remaining</th><th>Coverage</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.classId}>
                  <td className="strong">{c.className}</td>
                  <td>{c.deliveredLessons}/{c.totalLessons}</td>
                  <td>{Math.max(0, (c.totalLessons || 0) - (c.deliveredLessons || 0))}</td>
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

      <div className="panel">
        <div className="ph"><h3>Units in your curriculum</h3></div>
        <div className="note-strip">
          Curriculum content is authored by IGNITE and is read-only here.
        </div>
        {curricula.loading && !curricula.data ? <Loading label="Loading curriculum…" variant="rows" /> : null}
        {!assigned && curricula.data ? (
          <EmptyState
            title="No curriculum assigned to your school"
            hint="IGNITE admin assigns a published curriculum version to your school."
          />
        ) : null}
        {assigned && units.length === 0 ? (
          <EmptyState title="This curriculum has no units yet" />
        ) : null}
        {units.length > 0 ? (
          <div className="tree">
            {units.map((u) => (
              <div className="tnode" key={u.id}>
                <div className="tnum">{u.order}</div>
                <div>
                  <div className="strong">{u.title}</div>
                  <div className="fm">
                    {(u.lessons?.length ?? 0)} lesson{(u.lessons?.length ?? 0) === 1 ? '' : 's'}
                    {u.status ? ` · ${humanize(u.status)}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
