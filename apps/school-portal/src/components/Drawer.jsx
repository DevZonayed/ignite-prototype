import { useResource } from '../api/useResource.js'
import { getClassLearners } from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState } from './States.jsx'
import { fullName, humanize, fmtRelative, statusBadge, coverageColor } from '../lib/format.js'

function initials(user) {
  if (user?.initials) return user.initials
  const name = fullName(user)
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '-'
}

function UserBody({ user, classes }) {
  return (
    <>
      <div className="dsec">Account</div>
      <div className="dlist">
        <div className="di"><span className="dil">Email</span><span className="dv">{user.email || '-'}</span></div>
        <div className="di"><span className="dil">Phone</span><span className="dv">{user.phone || '-'}</span></div>
        <div className="di"><span className="dil">Role</span><span className="dv">{humanize(user.role)}</span></div>
        <div className="di">
          <span className="dil">Status</span>
          <span className="dv">
            <span className={'badge ' + statusBadge(user.status)}>{humanize(user.status)}</span>
          </span>
        </div>
        <div className="di"><span className="dil">Last login</span><span className="dv">{fmtRelative(user.lastLoginAt)}</span></div>
        <div className="di"><span className="dil">Last active</span><span className="dv">{fmtRelative(user.lastActiveAt)}</span></div>
      </div>

      {user.role === 'teacher' ? (
        <>
          <div className="dsec">Classes</div>
          {classes && classes.length > 0 ? (
            <div className="dlist">
              {classes.map((c) => (
                <div className="di" key={c.id}>
                  <span className="dil">{c.name}</span>
                  <span className="dv">{c.learnerCount ?? 0} learners</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No classes assigned" hint="Assign a class from the Classes screen." />
          )}
        </>
      ) : null}
    </>
  )
}

function ClassBody({ cls, teacher }) {
  const learners = useResource(() => getClassLearners(cls.id), [cls.id])
  const rows = learners.data ?? []

  return (
    <>
      <div className="dstat">
        <div className="ds">
          <div className="dsl">Learners</div>
          <div className="dsv">{cls.learnerCount ?? rows.length}</div>
        </div>
        <div className="ds">
          <div className="dsl">Coverage</div>
          <div className="dsv" style={{ color: coverageColor(cls.curriculumCoveragePercent ?? 0) }}>
            {cls.curriculumCoveragePercent ?? 0}%
          </div>
        </div>
      </div>

      <div className="dsec">Class record</div>
      <div className="dlist">
        <div className="di"><span className="dil">Grade level</span><span className="dv">{cls.gradeLevel || '-'}</span></div>
        <div className="di"><span className="dil">Subject</span><span className="dv">{cls.subject || '-'}</span></div>
        <div className="di">
          <span className="dil">Teacher</span>
          <span className="dv">{teacher ? fullName(teacher) : 'Unassigned'}</span>
        </div>
      </div>

      <div className="dsec">Learners</div>
      {learners.loading && !learners.data ? <Loading label="Loading learners…" variant="list" /> : null}
      {learners.error ? <ErrorState error={learners.error} onRetry={learners.reload} /> : null}
      {learners.data && rows.length === 0 ? (
        <EmptyState title="No learners in this class yet" />
      ) : null}
      {rows.length > 0 ? (
        <div className="dlist">
          {rows.map((l) => (
            <div className="di" key={l.id}>
              <span className="dil">{fullName(l)}</span>
              <span className="dv">
                <span className={'badge ' + statusBadge(l.status)}>{humanize(l.status)}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  )
}

export default function Drawer({ drawer, onClose }) {
  const open = !!drawer
  let name = '-', sub = '-', avText = '-', avBg, avColor, body = null

  if (drawer?.detail === 'user') {
    const u = drawer.user
    name = fullName(u)
    sub = humanize(u.role)
    avText = initials(u)
    avBg = u.avatarBg || '#dbeafe'
    avColor = u.avatarColor || '#1d4ed8'
    body = <UserBody user={u} classes={drawer.classes} />
  } else if (drawer?.detail === 'class') {
    const c = drawer.cls
    name = c.name
    sub = [c.gradeLevel, c.subject].filter(Boolean).join(' · ') || 'Class'
    avText = '🎓'
    avBg = '#e0e7ff'
    avColor = '#4338ca'
    body = <ClassBody cls={c} teacher={drawer.teacher} />
  }

  return (
    <>
      <div className={'drawerback' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'drawer' + (open ? ' on' : '')}>
        <div className="dh">
          <span className="dav" style={{ background: avBg, color: avColor }}>{avText}</span>
          <div><div className="dn">{name}</div><div className="dr">{sub}</div></div>
          <button className="dclose" onClick={onClose} aria-label="Close">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="dbody">{open ? body : null}</div>
      </aside>
    </>
  )
}
