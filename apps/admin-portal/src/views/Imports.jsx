export default function Imports({ active }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-imports">
      <div className="panel">
        <div className="stepper">
          <div className="stp done"><span className="sc">✓</span><span className="sl">Template</span></div><div className="stpline done"></div>
          <div className="stp done"><span className="sc">✓</span><span className="sl">Upload</span></div><div className="stpline done"></div>
          <div className="stp done"><span className="sc">✓</span><span className="sl">Map</span></div><div className="stpline done"></div>
          <div className="stp cur"><span className="sc">4</span><span className="sl">Validate</span></div><div className="stpline"></div>
          <div className="stp next"><span className="sc">5</span><span className="sl">Import</span></div>
        </div>
        <div className="grid2 even">
          <div>
            <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Column mapping</h3>
            <table>
              <thead><tr><th>Source column</th><th>Mapped to</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>full_name</td><td>Learner name</td><td><span className="mapped">✓ Mapped</span></td></tr>
                <tr><td>dob</td><td>Date of birth</td><td><span className="mapped">✓ Mapped</span></td></tr>
                <tr><td>class</td><td>Class</td><td><span className="mapped">✓ Mapped</span></td></tr>
                <tr><td>guardian_email</td><td>Guardian email</td><td><span className="mapped">✓ Mapped</span></td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Validation results</h3>
            <div className="valhead">
              <div className="valcirc"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg></div>
              <div>
                <div className="valn">318 of 320 rows valid</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>320 input rows · 318 valid · 2 errors</div>
              </div>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--danger)', marginBottom: '9px' }}>Errors (2)</div>
            <div className="errrow"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg> Row 44 — missing guardian email <span className="fix">Fix</span></div>
            <div className="errrow"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg> Row 210 — invalid class 'JSS4' <span className="fix">Fix</span></div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}><button className="btnO">Back</button><button className="btnP">Run import (318 rows)</button></div>
          </div>
        </div>
      </div>
    </section>
  )
}
