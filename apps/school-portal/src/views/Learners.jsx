import { names } from '../data.js'

export default function Learners({ active, onOpenDetail }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-learners">
      <div className="toolbar">
        <div className="filter">Class: All</div>
        <div className="filter">Term 2</div>
        <span className="sp"></span>
        <button className="btnP">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>{' '}
          Add learner
        </button>
      </div>
      <div className="panel" style={{ padding: '6px 8px' }}>
        <table>
          <thead>
            <tr>
              <th>Learner</th>
              <th>Class</th>
              <th>LQS</th>
              <th>Attendance</th>
              <th>Projects</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="learnersBody">
            {names.map((n, i) => {
              const lqs = 62 + ((i * 9) % 34)
              const att = 80 + ((i * 5) % 18)
              const cls = ['JSS 1', 'JSS 2', 'JSS 3', 'P 6'][i % 4]
              const projects = 2 + (i % 5)
              const badge = lqs >= 75 ? 'b-green' : lqs >= 65 ? 'b-blue' : 'b-amber'
              return (
                <tr key={n}>
                  <td className="strong">{n}</td>
                  <td>{cls}</td>
                  <td>
                    <span className={'badge ' + badge}>{lqs}/100</span>
                  </td>
                  <td>{att}%</td>
                  <td>{projects}</td>
                  <td>
                    <span
                      className="rowbtn"
                      onClick={() =>
                        onOpenDetail({
                          detail: 'learner',
                          name: n,
                          cls,
                          lqs: String(lqs),
                          att: String(att),
                          projects: String(projects),
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
