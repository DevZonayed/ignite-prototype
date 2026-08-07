export default function Reports({ active }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-reports">
      <div className="toolbar">
        <div className="filter">Term 2</div>
        <span className="sp"></span>
        <button className="btnP">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12M8 11l4 4 4-4M4 21h16" />
          </svg>{' '}
          New report
        </button>
      </div>
      <div className="panel" style={{ padding: '6px 8px' }}>
        <table>
          <thead>
            <tr>
              <th>Report</th>
              <th>Scope</th>
              <th>Generated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="strong">Weekly coverage summary</td>
              <td>All classes</td>
              <td>Today</td>
              <td>
                <span className="rowbtn">Download PDF</span>
              </td>
            </tr>
            <tr>
              <td className="strong">Attendance register — Term 2</td>
              <td>JSS 1–3</td>
              <td>Mon</td>
              <td>
                <span className="rowbtn">Download PDF</span>
              </td>
            </tr>
            <tr>
              <td className="strong">Project completion report</td>
              <td>Digital Innovation</td>
              <td>Last week</td>
              <td>
                <span className="rowbtn">Download PDF</span>
              </td>
            </tr>
            <tr>
              <td className="strong">Teacher activity log</td>
              <td>14 teachers</td>
              <td>Last week</td>
              <td>
                <span className="rowbtn">Download PDF</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
