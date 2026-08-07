import { monVals, monDays } from '../data.js'

export default function Monitoring({ active }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-monitoring">
      <div className="tiles" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></span><span className="tl">Active now</span></div><div className="tn">1,204</div><div className="tf">learners online</div></div>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'color-mix(in srgb,var(--success) 15%,transparent)', color: 'var(--success)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-3-6.7" /></svg></span><span className="tl">Sync health</span></div><div className="tn">99.4%</div><div className="tf up">within SLA</div></div>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'color-mix(in srgb,var(--ignite) 15%,transparent)', color: 'var(--ignite)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /></svg></span><span className="tl">AI calls today</span></div><div className="tn">3,410</div><div className="tf">within cap</div></div>
      </div>
      <div className="panel">
        <div className="ph"><h3>Lessons delivered — this week (all schools)</h3></div>
        <svg className="chart" viewBox="0 0 720 220" aria-label="Weekly lessons bar chart">
          <g id="barsMon">
            {monVals.map((v, i) => {
              const x = 60 + i * 92
              const h = (v / 280) * 150
              return (
                <g key={i}>
                  <rect x={x} y={185 - h} width="46" height={h} rx="6" fill="var(--brand)" />
                  <text x={x + 23} y="205" fontSize="11" fill="var(--text-subtle)" textAnchor="middle">{monDays[i]}</text>
                  <text x={x + 23} y={180 - h} fontSize="11" fontWeight="700" fill="var(--text)" textAnchor="middle">{v}</text>
                </g>
              )
            })}
          </g>
          <line x1="40" y1="185" x2="700" y2="185" stroke="var(--border)" />
        </svg>
      </div>
    </section>
  )
}
