import { useResource } from '../api/useResource.js'
import { getMonitoringStats, getLessonsDelivered, getHealth } from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState, Skel } from '../components/States.jsx'
import { fmtNumber } from '../lib/format.js'

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

export default function Monitoring({ active }) {
  const stats = useResource(() => getMonitoringStats(), [], { enabled: active })
  const delivered = useResource(() => getLessonsDelivered(), [], { enabled: active })
  const health = useResource(() => getHealth(), [], { enabled: active })

  const s = stats.data || {}
  const h = health.data || {}

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-monitoring">
      <div className="tiles">
        <div className="tile">
          <div className="th"><span className="tl">Active learners</span></div>
          <div className="tn">{stats.loading && !stats.data ? <Skel w={72} h={24} /> : fmtNumber(s.activeLearners)}</div>
          <div className="tf">across all schools</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Sync health</span></div>
          <div className="tn">{stats.loading && !stats.data ? <Skel w={72} h={24} /> : `${s.syncHealthPercent ?? 0}%`}</div>
          <div className={'tf' + ((s.syncHealthPercent ?? 0) >= 90 ? ' up' : '')}>
            {(s.syncHealthPercent ?? 0) >= 90 ? 'healthy' : 'needs attention'}
          </div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">AI calls today</span></div>
          <div className="tn">{stats.loading && !stats.data ? <Skel w={72} h={24} /> : fmtNumber(s.aiCallsToday)}</div>
          <div className="tf">platform-wide</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">API status</span></div>
          <div className="tn" style={{ fontSize: 22 }}>
            {health.loading && !health.data ? <Skel w={54} h={20} r={999} /> : (
              <span className={'badge ' + (h.status === 'ok' ? 'b-green' : 'b-amber')}>
                {h.status || 'unknown'}
              </span>
            )}
          </div>
          <div className="tf">
            database {h.database ? 'connected' : 'unavailable'}
            {typeof h.uptime === 'number' ? ` · up ${Math.floor(h.uptime / 60)} min` : ''}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <h3>Lessons delivered (last 7 days)</h3>
          <button type="button" className="linkbtn" onClick={delivered.reload}>Refresh</button>
        </div>
        {delivered.loading && !delivered.data ? <Loading variant="chart" /> : null}
        {delivered.error ? <ErrorState error={delivered.error} onRetry={delivered.reload} /> : null}
        {delivered.data && delivered.data.length === 0 ? (
          <EmptyState title="No lessons delivered yet" hint="Sessions completed by teachers will chart here." />
        ) : null}
        {delivered.data && delivered.data.length > 0 ? <Bars points={delivered.data} /> : null}
      </div>

      {stats.error ? <ErrorState error={stats.error} onRetry={stats.reload} /> : null}
    </section>
  )
}
