import { dims } from '../data.js'

export default function Scoring({ active }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-scoring">
      <div className="grid2">
        <div className="panel">
          <div className="ph"><h3>Learner Quality Score — rubric</h3><span className="link">Save v3</span></div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>10 dimensions · weights configurable · total 100%</p>
          <div className="dimlist" id="dimList">
            {dims.map((d) => (
              <div className="dimrow" key={d[0]}>
                <span className="dimdot" style={{ background: d[1] }}></span>
                <span className="dimname">{d[0]}</span>
                <span className="dimtrack"><i style={{ width: (d[2] * 5) + '%', background: d[1] }}></i></span>
                <span className="dimw">{d[2]}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="panel">
            <div className="ph"><h3>Badge rules</h3><span className="link">+ Add</span></div>
            <div className="badgegrid">
              <div className="bcard"><div className="bd"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3" /></svg></div><div className="bn">First Scratch</div><div className="bc">1st .sb3 saved</div></div>
              <div className="bcard"><div className="bd"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 12a8 8 0 1 1 8 8" /></svg></div><div className="bn">Loop Master</div><div className="bc">loops project done</div></div>
              <div className="bcard"><div className="bd"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M12 8V5" /></svg></div><div className="bn">Robotics Rookie</div><div className="bc">1st robot build</div></div>
              <div className="bcard"><div className="bd"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6" /></svg></div><div className="bn">Python Starter</div><div className="bc">1st .py file</div></div>
            </div>
          </div>
          <div className="panel" style={{ marginBottom: 0 }}>
            <div className="ph"><h3>Certificate template</h3><span className="link">Preview</span></div>
            <div style={{ border: '2px solid #e7c98a', borderRadius: '10px', padding: '16px', textAlign: 'center', background: 'var(--surface-2)' }}><div style={{ fontFamily: 'var(--fd)', fontWeight: 900, color: 'var(--brand)', fontSize: '12px' }}>IGNITE</div><div style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '15px', margin: '5px 0' }}>Certificate of Achievement</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{'{{learner}}'} · Digital Innovation · {'{{term}}'}</div></div>
          </div>
        </div>
      </div>
    </section>
  )
}
