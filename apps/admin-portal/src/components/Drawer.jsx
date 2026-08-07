function inits(s) {
  return s.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function SchoolBody({ d }) {
  const low = +d.cov < 75
  return (
    <>
      <div className="dstat">
        <div className="ds"><div className="dsl">Learners</div><div className="dsv">{d.learners}</div></div>
        <div className="ds"><div className="dsl">Coverage</div><div className="dsv" style={low ? { color: 'var(--warning)' } : undefined}>{d.cov}%</div></div>
      </div>
      <div className="dsec">School overview</div>
      <div className="dlist">
        <div className="di"><span className="dil">Region</span><span className="dv">{d.region}</span></div>
        <div className="di"><span className="dil">Teachers active</span><span className="dv">{d.teachers}</span></div>
        <div className="di"><span className="dil">Status</span><span className="dv">{d.status}</span></div>
        <div className="di"><span className="dil">Curriculum</span><span className="dv">Digital Innovation v4</span></div>
        <div className="di"><span className="dil">Last sync</span><span className="dv">a few min ago</span></div>
      </div>
      <div className="dsec">Needs attention</div>
      <div className="dlist">
        <div className="di"><span className="dil">{low ? 'JSS 3 behind sequence · nudge teacher' : 'No issues — on track'}</span></div>
      </div>
      <div className="drowbtns"><span className="db">Open school portal</span><span className="db pri">Manage users</span></div>
    </>
  )
}

function UserBody({ d }) {
  const scope = d.role.indexOf('Admin') >= 0 ? 'All schools' : (d.role === 'Principal' ? 'Own school' : 'Assigned classes/child')
  return (
    <>
      <div className="dsec">Account</div>
      <div className="dlist">
        <div className="di"><span className="dil">Role</span><span className="dv">{d.role}</span></div>
        <div className="di"><span className="dil">School</span><span className="dv">{d.school}</span></div>
        <div className="di"><span className="dil">Status</span><span className="dv">{d.status}</span></div>
        <div className="di"><span className="dil">Last active</span><span className="dv">{d.last}</span></div>
        <div className="di"><span className="dil">Access scope</span><span className="dv">{scope}</span></div>
      </div>
      <div className="drowbtns"><span className="db">Reset password</span><span className="db pri">Edit roles</span></div>
    </>
  )
}

export default function Drawer({ drawer, onClose }) {
  const open = !!drawer
  let name = '–', role = '–', avText = '–', avBg, avColor, body = null
  if (drawer) {
    if (drawer.detail === 'school') {
      name = drawer.name
      role = drawer.region + ' · Digital Innovation'
      avText = '🏫'
      avBg = '#e0e7ff'
      avColor = '#4338ca'
      body = <SchoolBody d={drawer} />
    } else {
      name = drawer.name
      role = drawer.role
      avText = inits(drawer.name)
      avBg = '#dbeafe'
      avColor = '#1d4ed8'
      body = <UserBody d={drawer} />
    }
  }
  return (
    <>
      <div className={'drawerback' + (open ? ' on' : '')} id="drawerBack" onClick={onClose}></div>
      <aside className={'drawer' + (open ? ' on' : '')} id="drawer">
        <div className="dh">
          <span className="dav" id="dAv" style={{ background: avBg, color: avColor }}>{avText}</span>
          <div><div className="dn" id="dName">{name}</div><div className="dr" id="dRole">{role}</div></div>
          <button className="dclose" id="dClose" onClick={onClose}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="dbody" id="dBody">{body}</div>
      </aside>
    </>
  )
}
