import { audit } from '../data.js'

export default function Security({ active }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-security">
      <div className="toolbar">
        <div className="filter">Event: All</div>
        <div className="filter">Last 7 days</div>
        <span className="sp"></span>
        <button className="btnO"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M8 11l4 4 4-4M4 21h16" /></svg> Export log</button>
      </div>
      <div className="panel" style={{ padding: '6px 8px' }}>
        <table>
          <thead><tr><th>Event</th><th>Actor</th><th>Target</th><th>When</th><th>Result</th></tr></thead>
          <tbody id="auditBody">
            {audit.map((a, i) => {
              const r = a[4] === 'OK' ? 'b-green' : 'b-amber'
              return (
                <tr key={i}>
                  <td className="strong">{a[0]}</td>
                  <td>{a[1]}</td>
                  <td>{a[2]}</td>
                  <td>{a[3]}</td>
                  <td><span className={'badge ' + r}>{a[4]}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
