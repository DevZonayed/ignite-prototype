export default function AIServices({ active }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-ai">
      <div className="tiles" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /></svg></span><span className="tl">AI calls this month</span></div><div className="tn">42,180</div><div className="tf">of 80,000 cap · 53%</div></div>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'color-mix(in srgb,var(--violet) 15%,transparent)', color: 'var(--violet)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 4 7v10l8 5 8-5V7z" /><path d="M12 22V12M4 7l8 5 8-5" /></svg></span><span className="tl">Est. spend</span></div><div className="tn">$186</div><div className="tf">within budget</div></div>
        <div className="tile"><div className="th"><span className="ti" style={{ background: 'color-mix(in srgb,var(--success) 15%,transparent)', color: 'var(--success)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg></span><span className="tl">Reports published</span></div><div className="tn">312</div><div className="tf">98% teacher-reviewed</div></div>
      </div>
      <div className="grid2">
        <div className="panel">
          <div className="ph"><h3>Per-school usage &amp; caps</h3><span className="link">Edit caps</span></div>
          <table><thead><tr><th>School</th><th>Assistant calls</th><th>Reports</th><th>Cap used</th></tr></thead><tbody>
            <tr><td className="strong">Bright Future Academy</td><td>3,120</td><td>48</td><td><span className="cbar"><i style={{ width: '62%' }}></i></span>62%</td></tr>
            <tr><td className="strong">Unity College</td><td>2,540</td><td>39</td><td><span className="cbar"><i style={{ width: '51%' }}></i></span>51%</td></tr>
            <tr><td className="strong">Hillcrest Schools</td><td>4,010</td><td>44</td><td><span className="cbar"><i style={{ width: '88%', background: 'var(--warning)' }}></i></span><span style={{ color: 'var(--warning)', fontWeight: 700 }}>88%</span></td></tr>
            <tr><td className="strong">Greenfield Model</td><td>1,980</td><td>35</td><td><span className="cbar"><i style={{ width: '40%' }}></i></span>40%</td></tr>
          </tbody></table>
        </div>
        <div className="panel">
          <div className="ph"><h3>AI configuration</h3><span className="link">Save</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="edlabel">Model tier</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge b-blue" style={{ padding: '8px 14px', cursor: 'pointer' }}>● Small (default)</span>
                <span className="badge b-grey" style={{ padding: '8px 14px', cursor: 'pointer' }}>Large (parent reports)</span>
              </div>
            </div>
            <div>
              <div className="edlabel">Lesson-assistant prompt scope</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 13px', background: 'var(--surface-2)' }}>Grounded to the current lesson only · no learner PII · classroom-safe tone</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)', borderRadius: '9px', padding: '12px 14px' }}>
              <div style={{ flex: 1 }}><div className="strong" style={{ fontSize: '13.5px' }}>Require teacher review before publishing parent reports</div><div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Recommended · human accountability</div></div>
              <span style={{ width: '44px', height: '26px', borderRadius: '99px', background: 'var(--brand)', position: 'relative', flex: 'none' }}><span style={{ position: 'absolute', right: '3px', top: '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff' }}></span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)', borderRadius: '9px', padding: '12px 14px' }}>
              <div style={{ flex: 1 }}><div className="strong" style={{ fontSize: '13.5px' }}>Voice-to-text lesson notes</div><div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Phase 2</div></div>
              <span className="badge b-grey">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
