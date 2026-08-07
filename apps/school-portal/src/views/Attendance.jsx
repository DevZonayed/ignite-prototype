import { useState } from 'react'
import { weeks, heatColor } from '../data.js'

export default function Attendance({ active }) {
  const [tab, setTab] = useState('heat')

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-attendance">
      <div className="tabs">
        <div className={'tab' + (tab === 'heat' ? ' on' : '')} data-tab="heat" onClick={() => setTab('heat')}>
          Attendance heat-map
        </div>
        <div className={'tab' + (tab === 'assess' ? ' on' : '')} data-tab="assess" onClick={() => setTab('assess')}>
          Assessment distribution
        </div>
      </div>
      <div className={'tabpanel' + (tab === 'heat' ? ' on' : '')} id="tp-heat">
        <div className="panel">
          <table className="heat">
            <thead>
              <tr>
                <th></th>
                <th>JSS 1</th>
                <th>JSS 2</th>
                <th>JSS 3</th>
              </tr>
            </thead>
            <tbody id="heatBody">
              {weeks.map((w) => (
                <tr key={w[0]}>
                  <th style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>{w[0]}</th>
                  {[w[1], w[2], w[3]].map((v, k) => (
                    <td key={k} style={{ background: heatColor(v) }}>
                      {v}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="legend">
            <span>
              <span className="sw" style={{ background: '#dcfce7' }}></span>Needs attention
            </span>
            <span>
              <span className="sw" style={{ background: '#86efac' }}></span>Good
            </span>
            <span>
              <span className="sw" style={{ background: '#16a34a' }}></span>Excellent
            </span>
          </div>
        </div>
      </div>
      <div className={'tabpanel' + (tab === 'assess' ? ' on' : '')} id="tp-assess">
        <div className="panel">
          <div className="ph">
            <h3>Assessment distribution — Term 2</h3>
          </div>
          <svg className="chart" viewBox="0 0 420 220" aria-label="Assessment distribution">
            <rect x="60" y="70" width="70" height="120" rx="6" fill="#EF4444" />
            <text x="95" y="60" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">
              18
            </text>
            <text x="95" y="208" textAnchor="middle" fontSize="11" fill="var(--text-subtle)">
              Emerging
            </text>
            <rect x="175" y="40" width="70" height="150" rx="6" fill="#F59E0B" />
            <text x="210" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">
              42
            </text>
            <text x="210" y="208" textAnchor="middle" fontSize="11" fill="var(--text-subtle)">
              Developing
            </text>
            <rect x="290" y="18" width="70" height="172" rx="6" fill="#16A34A" />
            <text x="325" y="12" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">
              76
            </text>
            <text x="325" y="208" textAnchor="middle" fontSize="11" fill="var(--text-subtle)">
              Secure
            </text>
            <line x1="40" y1="190" x2="390" y2="190" stroke="var(--border)" />
          </svg>
        </div>
      </div>
    </section>
  )
}
