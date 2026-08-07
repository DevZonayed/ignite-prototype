import { initials } from '../data.js'

function TeacherBody({ d }) {
  const ev = 12 + (parseInt(d.lessons, 10) % 7)
  return (
    <>
      <div className="dstat">
        <div className="ds">
          <div className="dsl">Lessons delivered</div>
          <div className="dsv">{d.lessons}</div>
        </div>
        <div className="ds">
          <div className="dsl">Curriculum coverage</div>
          <div className="dsv">{d.cov}%</div>
        </div>
      </div>
      <div className="dsec">What the principal can see</div>
      <div className="dlist">
        <div className="di">
          <span className="dil">Classes</span>
          <span className="dv">{d.classes}</span>
        </div>
        <div className="di">
          <span className="dil">Attendance marking</span>
          <span className="dv">On time</span>
        </div>
        <div className="di">
          <span className="dil">Evidence uploaded</span>
          <span className="dv">{ev} items</span>
        </div>
        <div className="di">
          <span className="dil">Last active</span>
          <span className="dv">{d.last}</span>
        </div>
        <div className="di">
          <span className="dil">Status</span>
          <span className="dv">{d.status}</span>
        </div>
        <div className="di">
          <span className="dil">Teacher Quality Score</span>
          <span className="dv" style={{ color: 'var(--text-subtle)' }}>
            Phase 2
          </span>
        </div>
      </div>
    </>
  )
}

const SKILLS = [
  ['Coding', '2563EB'],
  ['Creativity', '7C3AED'],
  ['Robotics', 'E11D48'],
  ['Digital Literacy', '6366F1'],
]

function LearnerBody({ d }) {
  return (
    <>
      <div className="dstat">
        <div className="ds">
          <div className="dsl">Learner Quality Score</div>
          <div className="dsv" style={{ color: 'var(--brand)' }}>
            {d.lqs}/100
          </div>
        </div>
        <div className="ds">
          <div className="dsl">Attendance</div>
          <div className="dsv">{d.att}%</div>
        </div>
      </div>
      <div className="dsec">What the principal can see</div>
      <div className="dlist">
        <div className="di">
          <span className="dil">Class</span>
          <span className="dv">{d.cls}</span>
        </div>
        <div className="di">
          <span className="dil">Projects</span>
          <span className="dv">{d.projects} in portfolio</span>
        </div>
        <div className="di">
          <span className="dil">Badges</span>
          <span className="dv">4 earned</span>
        </div>
        <div className="di">
          <span className="dil">Certificate</span>
          <span className="dv">Term 2 · issued</span>
        </div>
        <div className="di">
          <span className="dil">Homework</span>
          <span className="dv">2 pending</span>
        </div>
      </div>
      <div className="dsec">Skills growing</div>
      <div>
        {SKILLS.map((p) => (
          <span key={p[0]} className="dchip" style={{ background: '#' + p[1] }}>
            {p[0]}
          </span>
        ))}
      </div>
    </>
  )
}

export default function Drawer({ detail, onClose }) {
  const open = !!detail

  let name = '–'
  let role = '–'
  let avText = '–'
  let avBg
  let avColor
  let body = null

  if (detail) {
    if (detail.detail === 'teacher') {
      name = detail.name
      role = 'Teacher · Digital Innovation'
      avText = initials(detail.name)
      avBg = '#dbeafe'
      avColor = '#1d4ed8'
      body = <TeacherBody d={detail} />
    } else {
      name = detail.name
      role = detail.cls + ' · Digital Innovation'
      avText = initials(detail.name)
      avBg = '#dcfce7'
      avColor = '#166534'
      body = <LearnerBody d={detail} />
    }
  }

  return (
    <>
      <div className={'drawerback' + (open ? ' on' : '')} id="drawerBack" onClick={onClose}></div>
      <aside className={'drawer' + (open ? ' on' : '')} id="drawer">
        <div className="dh">
          <span className="dav" id="dAv" style={{ background: avBg, color: avColor }}>
            {avText}
          </span>
          <div>
            <div className="dn" id="dName">
              {name}
            </div>
            <div className="dr" id="dRole">
              {role}
            </div>
          </div>
          <button className="dclose" id="dClose" onClick={onClose}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="dbody" id="dBody">
          {body}
        </div>
      </aside>
    </>
  )
}
