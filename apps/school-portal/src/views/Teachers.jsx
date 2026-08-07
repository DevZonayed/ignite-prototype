import { tch } from '../data.js'

export default function Teachers({ active, onOpenDetail }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-teachers">
      <div className="toolbar">
        <div className="filter">Subject: Digital Innovation</div>
        <div className="filter">Status: Active</div>
        <span className="sp"></span>
        <button className="btnP">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>{' '}
          Add teacher
        </button>
      </div>
      <div className="panel" style={{ padding: '6px 8px' }}>
        <table>
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Classes</th>
              <th>Lessons</th>
              <th>Coverage</th>
              <th>Last active</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="teachersBody">
            {tch.map((t) => {
              const st = t[5] === 'Active' ? 'b-green' : 'b-amber'
              const name = 'Mr/Mrs ' + t[0]
              return (
                <tr key={t[0]}>
                  <td className="strong">{name}</td>
                  <td>{t[1]}</td>
                  <td>{t[2]}</td>
                  <td>
                    <span className="cbar">
                      <i style={{ width: t[3] + '%', ...(t[3] < 80 ? { background: 'var(--warning)' } : {}) }}></i>
                    </span>
                    {t[3]}%
                  </td>
                  <td>{t[4]}</td>
                  <td>
                    <span className={'badge ' + st}>{t[5]}</span>
                  </td>
                  <td>
                    <span
                      className="rowbtn"
                      onClick={() =>
                        onOpenDetail({
                          detail: 'teacher',
                          name,
                          classes: t[1],
                          lessons: String(t[2]),
                          cov: String(t[3]),
                          last: t[4],
                          status: t[5],
                        })
                      }
                    >
                      View
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
