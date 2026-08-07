export default function Overview({ onNavigate }) {
  return (
    <section className="view active" id="view-overview">
      <div className="tiles">
        <div className="tile"><div className="th"><span className="ti" style={{ background: '#e0e7ff', color: '#4f46e5' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21V9l9-6 9 6v12" /></svg></span><span className="tl">Schools live</span></div><div className="tn">20</div><div className="tf up"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg> All operational</div></div>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'color-mix(in srgb,var(--success) 15%,transparent)', color: 'var(--success)' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /></svg></span><span className="tl">Teachers</span></div><div className="tn">50</div><div className="tf">updated just now</div></div>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'color-mix(in srgb,var(--violet) 15%,transparent)', color: 'var(--violet)' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg></span><span className="tl">Learners</span></div><div className="tn">9,842</div><div className="tf">updated just now</div></div>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'color-mix(in srgb,var(--ignite) 15%,transparent)', color: 'var(--ignite)' }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10" /><path d="M9 14l2 2 4-4" /></svg></span><span className="tl">Lessons this week</span></div><div className="tn">1,284</div><div className="tf up"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" /></svg> +8% vs last week</div></div>
      </div>
      <div className="grid2">
        <div className="panel">
          <div className="ph"><h3>Adoption by school</h3><span className="link" onClick={() => onNavigate('schools')}>View all →</span></div>
          <table><thead><tr><th>School</th><th>Teachers</th><th>Coverage</th><th>Last sync</th></tr></thead><tbody>
            <tr><td className="strong">Bright Future Academy</td><td>12/14</td><td><span className="cbar"><i style={{ width: '92%' }}></i></span>92%</td><td>3 min ago</td></tr>
            <tr><td className="strong">Unity College</td><td>9/10</td><td><span className="cbar"><i style={{ width: '88%' }}></i></span>88%</td><td>12 min ago</td></tr>
            <tr><td className="strong">Hillcrest Schools</td><td>7/9</td><td><span className="cbar"><i style={{ width: '79%', background: 'var(--warning)' }}></i></span><span style={{ color: 'var(--warning)', fontWeight: 700 }}>79%</span></td><td>1 hr ago</td></tr>
            <tr><td className="strong">Greenfield Model</td><td>10/11</td><td><span className="cbar"><i style={{ width: '90%' }}></i></span>90%</td><td>8 min ago</td></tr>
          </tbody></table>
        </div>
        <div className="panel">
          <div className="ph"><h3>Audit activity</h3><span className="link" onClick={() => onNavigate('security')}>Open log →</span></div>
          <div className="feed">
            <div className="fitem"><span className="fi" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg></span><div><div className="ft">Curriculum v4 published</div><div className="fm">Today, 10:24</div></div></div>
            <div className="fitem"><span className="fi" style={{ background: 'color-mix(in srgb,var(--success) 15%,transparent)', color: 'var(--success)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M8 11l4 4 4-4M4 21h16" /></svg></span><div><div className="ft">Bulk import · 320 learners</div><div className="fm">Today, 09:41</div></div></div>
            <div className="fitem"><span className="fi" style={{ background: 'color-mix(in srgb,var(--violet) 15%,transparent)', color: 'var(--violet)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg></span><div><div className="ft">Role changed: N. Bello → Principal</div><div className="fm">Yesterday, 16:15</div></div></div>
            <div className="fitem"><span className="fi" style={{ background: 'color-mix(in srgb,var(--ignite) 15%,transparent)', color: 'var(--ignite)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg></span><div><div className="ft">LQS rubric v2 activated</div><div className="fm">Yesterday, 14:02</div></div></div>
          </div>
        </div>
      </div>
    </section>
  )
}
