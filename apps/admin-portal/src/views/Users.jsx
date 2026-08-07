import { users } from '../data.js'

export default function Users({ active, onOpenDetail }) {
  return (
    <section className={'view' + (active ? ' active' : '')} id="view-users">
      <div className="toolbar">
        <div className="filter">Role: All</div>
        <div className="filter">School: All</div>
        <span className="sp"></span>
        <button className="btnP"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg> Invite user</button>
      </div>
      <div className="panel" style={{ padding: '6px 8px' }}>
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>School</th><th>Status</th><th>Last active</th><th></th></tr></thead>
          <tbody id="usersBody">
            {users.map((u) => {
              const st = u[3] === 'Active' ? 'b-green' : (u[3] === 'Suspended' ? 'b-amber' : 'b-grey')
              const role = u[1].includes('Admin') ? 'b-blue' : (u[1] === 'Principal' ? 'b-blue' : 'b-grey')
              return (
                <tr key={u[0]}>
                  <td className="strong">{u[0]}</td>
                  <td><span className={'badge ' + role}>{u[1]}</span></td>
                  <td>{u[2]}</td>
                  <td><span className={'badge ' + st}>{u[3]}</span></td>
                  <td>{u[4]}</td>
                  <td><span className="rowbtn" onClick={() => onOpenDetail({ detail: 'user', name: u[0], role: u[1], school: u[2], status: u[3], last: u[4] })}>Edit</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
