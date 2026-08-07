import { useState } from 'react'
import { units } from '../data.js'

export default function Curriculum({ active }) {
  const [open, setOpen] = useState({ 2: true })

  const toggle = (i) => setOpen((o) => ({ ...o, [i]: !o[i] }))

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-curriculum">
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Coverage by unit — click a unit to expand its lessons.
      </p>
      <div id="accWrap">
        {units.map((u, i) => {
          const isOpen = !!open[i]
          return (
            <div className={'acc' + (isOpen ? ' open' : '')} key={u[0]}>
              <div className="ah" onClick={() => toggle(i)}>
                <h4>{u[0]}</h4>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: u[1] < 75 ? 'var(--warning)' : 'var(--success)',
                  }}
                >
                  {u[1]}%
                </span>
                <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
              <div className="abody">
                {u[2].map((l, j) => {
                  const pct = u[1] > 0 ? (j < Math.round((u[2].length * u[1]) / 100) ? 100 : 0) : 0
                  return (
                    <div className="lrow" key={l}>
                      <span className="ln">
                        {j + 1}. {l}
                      </span>
                      <span className="lp">
                        <span className="mini">
                          <i style={{ width: pct + '%' }}></i>
                        </span>
                      </span>
                      <span style={{ width: '38px', textAlign: 'right', fontWeight: 700, fontSize: '12px' }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
