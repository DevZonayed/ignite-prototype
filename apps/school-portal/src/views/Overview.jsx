import { tiles } from '../data.js'

export default function Overview({ active, onNavigate }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-overview">
      <div className="tiles" id="ovTiles">
        {tiles.map((t) => (
          <div className="tile" key={t[0]}>
            <div className="th">
              <span
                className="ti"
                style={{ background: `color-mix(in srgb,${t[2]} 15%,transparent)`, color: t[2] }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
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
        <div className="panel">
          <div className="ph">
            <h3>Attendance trend — last 6 weeks</h3>
            <span className="link" data-view="attendance" onClick={() => onNavigate('attendance')}>
              Details →
            </span>
          </div>
          <svg className="chart" viewBox="0 0 520 190" aria-label="Attendance trend">
            <line x1="40" y1="20" x2="40" y2="160" stroke="var(--border)" />
            <line x1="40" y1="160" x2="510" y2="160" stroke="var(--border)" />
            <polyline
              points="70,66 150,52 230,45 310,38 390,42 470,42"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon
              points="70,66 150,52 230,45 310,38 390,42 470,42 470,160 70,160"
              fill="color-mix(in srgb,var(--brand) 10%,transparent)"
            />
            <g fill="var(--brand)">
              <circle cx="70" cy="66" r="4" />
              <circle cx="150" cy="52" r="4" />
              <circle cx="230" cy="45" r="4" />
              <circle cx="310" cy="38" r="4" />
              <circle cx="390" cy="42" r="4" />
              <circle cx="470" cy="42" r="4" />
            </g>
            <g fontSize="10" fill="var(--text-subtle)" textAnchor="middle">
              <text x="70" y="178">W1</text>
              <text x="150" y="178">W2</text>
              <text x="230" y="178">W3</text>
              <text x="310" y="178">W4</text>
              <text x="390" y="178">W5</text>
              <text x="470" y="178">W6</text>
            </g>
          </svg>
        </div>
        <div className="panel">
          <div className="ph">
            <h3>Curriculum coverage</h3>
          </div>
          <div className="cov">
            <span className="cn">JSS 1</span>
            <div className="cbar2">
              <i style={{ width: '95%' }}></i>
            </div>
            <span className="cp">95%</span>
          </div>
          <div className="cov">
            <span className="cn">JSS 2</span>
            <div className="cbar2">
              <i style={{ width: '88%' }}></i>
            </div>
            <span className="cp">88%</span>
          </div>
          <div className="cov">
            <span className="cn">JSS 3</span>
            <div className="cbar2">
              <i style={{ width: '75%', background: 'var(--warning)' }}></i>
            </div>
            <span className="cp">75%</span>
          </div>
          <div className="cov">
            <span className="cn">P 6</span>
            <div className="cbar2">
              <i style={{ width: '91%' }}></i>
            </div>
            <span className="cp">91%</span>
          </div>
          <div className="cov">
            <span className="cn">P 5</span>
            <div className="cbar2">
              <i style={{ width: '83%' }}></i>
            </div>
            <span className="cp">83%</span>
          </div>
        </div>
      </div>
      <div className="grid2">
        <div className="panel">
          <div className="ph">
            <h3>Teacher activity</h3>
            <span className="link" data-view="teachers" onClick={() => onNavigate('teachers')}>
              All teachers →
            </span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Lessons delivered</th>
                <th>Last active</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="strong">Mr. Adewale Balogun</td>
                <td>28</td>
                <td>Today, 10:24</td>
              </tr>
              <tr>
                <td className="strong">Mrs. Funke Okafor</td>
                <td>24</td>
                <td>Today, 08:57</td>
              </tr>
              <tr>
                <td className="strong">Mr. Chinedu Nwosu</td>
                <td>19</td>
                <td>Yesterday</td>
              </tr>
              <tr>
                <td className="strong">Ms. Aisha Bello</td>
                <td>22</td>
                <td>Today, 09:40</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="ph">
            <h3>Needs attention</h3>
          </div>
          <div className="alert">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--warning)"
              strokeWidth="2"
              style={{ flex: 'none' }}
            >
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            <div>
              <div className="an">JSS 3 · 2 lessons behind sequence</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Robotics unit — nudge sent to teacher</div>
            </div>
          </div>
          <div
            className="alert"
            data-view="homework"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('homework')}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              style={{ flex: 'none' }}
            >
              <path d="M9 11l3 3 8-8" />
              <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
            </svg>
            <div style={{ flex: 1 }}>
              <div className="an">Homework · 14 pending, 9 late this week</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>JSS 3 lowest at 68% — open compliance →</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
