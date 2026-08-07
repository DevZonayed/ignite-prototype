import { schools } from '../data.js'

export default function Schools({ active, onOpenDetail }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-schools">
      <div className="toolbar">
        <div className="filter"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h18l-7 8v6l-4 2v-8z" /></svg> All regions</div>
        <div className="filter">Status: Active</div>
        <span className="sp"></span>
        <button className="btnP"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg> Add school</button>
      </div>
      <div className="panel" style={{ padding: '6px 8px' }}>
        <table>
          <thead><tr><th>School</th><th>Region</th><th>Teachers</th><th>Learners</th><th>Coverage</th><th>Status</th><th></th></tr></thead>
          <tbody id="schoolsBody">
            {schools.map((s) => (
              <tr key={s.name}>
                <td className="strong">{s.name}</td>
                <td>{s.region}</td>
                <td>{s.teachers}</td>
                <td>{s.learners}</td>
                <td><span className="cbar"><i style={{ width: s.cov + '%', ...(s.cov < 75 ? { background: 'var(--warning)' } : {}) }}></i></span>{s.cov}%</td>
                <td><span className={'badge ' + s.st}>{s.stt}</span></td>
                <td>
                  <span
                    className="rowbtn"
                    onClick={() => onOpenDetail({ detail: 'school', name: s.name, region: s.region, teachers: s.teachers, learners: s.learners, cov: s.cov, status: s.stt })}
                  >Manage</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
