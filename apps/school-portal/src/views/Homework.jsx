import { hwTiles, hwClasses, hwAlerts, hwSubs, otColor } from '../data.js'

export default function Homework({ active, onNavigate, onToast }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-homework">
      <div className="toolbar">
        <div className="filter">Class: All</div>
        <div className="filter">This week</div>
        <span className="sp"></span>
        <button
          className="btnP"
          data-toast="Reminders sent to parents of pending learners"
          onClick={() => onToast('Reminders sent to parents of pending learners')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>{' '}
          Send reminders
        </button>
      </div>
      <div className="tiles" id="hwTiles">
        {hwTiles.map((t) => (
          <div className="tile" key={t[0]}>
            <div className="th">
              <span className="ti" style={{ background: `color-mix(in srgb,${t[2]} 15%,transparent)`, color: t[2] }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3 8-8" />
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
                </svg>
              </span>
              <span className="tl">{t[0]}</span>
            </div>
            <div className="tn">{t[1]}</div>
            <div className="tf">{t[3]}</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="panel" style={{ padding: '6px 8px' }}>
          <div className="ph" style={{ padding: '12px 12px 8px' }}>
            <h3>Compliance by class — this week</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Set</th>
                <th>Submitted</th>
                <th>Pending</th>
                <th>Late</th>
                <th>On&nbsp;time</th>
              </tr>
            </thead>
            <tbody id="hwClassBody">
              {hwClasses.map((c) => (
                <tr key={c[0]}>
                  <td className="strong">{c[0]}</td>
                  <td>{c[1]}</td>
                  <td>{c[2]}</td>
                  <td>
                    {c[3] > 0 ? (
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{c[3]}</span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td>
                    {c[4] > 0 ? <span style={{ color: '#ef4444', fontWeight: 700 }}>{c[4]}</span> : '0'}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: otColor(c[5]) }}>{c[5]}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="ph">
            <h3>Needs a nudge</h3>
            <span className="link" data-view="learners" onClick={() => onNavigate('learners')}>
              All learners →
            </span>
          </div>
          <div id="hwAlerts">
            {hwAlerts.map((a) => (
              <div className="alert" key={a[0]}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={a[4]}
                  strokeWidth="2"
                  style={{ flex: 'none' }}
                >
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div className="an">
                    {a[0]} · {a[1]}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {a[2]} — {a[3]}
                  </div>
                </div>
                <span
                  className="rowbtn"
                  data-toast={'Reminder sent to parent of ' + a[0]}
                  onClick={() => onToast('Reminder sent to parent of ' + a[0])}
                >
                  Remind
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="panel" style={{ padding: '6px 8px' }}>
        <div className="ph" style={{ padding: '12px 12px 8px' }}>
          <h3>Recent submissions</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Learner</th>
              <th>Class</th>
              <th>Homework</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="hwSubsBody">
            {hwSubs.map((s, i) => (
              <tr key={s[0] + i}>
                <td className="strong">{s[0]}</td>
                <td>{s[1]}</td>
                <td>{s[2]}</td>
                <td>{s[3]}</td>
                <td>
                  <span style={{ fontWeight: 700, color: s[5] }}>{s[4]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
