import { useResource } from '../api/useResource.js'
import { getSchool, getSchoolSettings } from '../api/endpoints.js'
import { Loading, ErrorState } from '../components/States.jsx'
import { fmtRelative, humanize } from '../lib/format.js'

export default function Settings({ active, schoolId, user }) {
  const school = useResource(() => getSchool(schoolId), [schoolId], { enabled: active })
  const settings = useResource(() => getSchoolSettings(schoolId), [schoolId], { enabled: active })

  const s = school.data || {}
  const cfg = settings.data || {}

  return (
    <section className={'view' + (active ? ' active' : '')}>
      <div className="grid2">
        <div className="panel">
          <div className="ph"><h3>School record</h3></div>
          {school.loading && !school.data ? <Loading /> : null}
          {school.error ? <ErrorState error={school.error} onRetry={school.reload} /> : null}
          {school.data ? (
            <div className="dlist">
              <div className="di"><span className="dil">Name</span><span className="dv">{s.name}</span></div>
              <div className="di"><span className="dil">Region</span><span className="dv">{s.region || '-'}</span></div>
              <div className="di">
                <span className="dil">Status</span>
                <span className="dv">
                  <span className={'badge ' + (s.status === 'active' ? 'b-green' : 'b-amber')}>
                    {humanize(s.status)}
                  </span>
                </span>
              </div>
              <div className="di"><span className="dil">Subject</span><span className="dv">{s.subject || '-'}</span></div>
              <div className="di"><span className="dil">Last sync</span><span className="dv">{fmtRelative(s.lastSyncAt)}</span></div>
            </div>
          ) : null}
        </div>

        <div className="panel">
          <div className="ph"><h3>Term and configuration</h3></div>
          {settings.loading && !settings.data ? <Loading /> : null}
          {settings.error ? <ErrorState error={settings.error} onRetry={settings.reload} /> : null}
          {settings.data ? (
            <div className="dlist">
              <div className="di"><span className="dil">Academic year</span><span className="dv">{cfg.academicYear || '-'}</span></div>
              <div className="di"><span className="dil">Current term</span><span className="dv">{cfg.currentTerm || '-'}</span></div>
              <div className="di"><span className="dil">Timezone</span><span className="dv">{cfg.timezone || '-'}</span></div>
              <div className="di"><span className="dil">AI cap used</span><span className="dv">{cfg.aiCapUsedPercent ?? 0}%</span></div>
            </div>
          ) : null}
          <div className="note-strip" style={{ marginTop: 12 }}>
            These settings are managed by IGNITE admin. Contact them to change
            your term, timezone or AI allowance.
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="ph"><h3>Your account</h3></div>
        <div className="dlist">
          <div className="di"><span className="dil">Name</span><span className="dv">{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '-'}</span></div>
          <div className="di"><span className="dil">Email</span><span className="dv">{user?.email || '-'}</span></div>
          <div className="di"><span className="dil">Role</span><span className="dv">{humanize(user?.role)}</span></div>
        </div>
      </div>
    </section>
  )
}
