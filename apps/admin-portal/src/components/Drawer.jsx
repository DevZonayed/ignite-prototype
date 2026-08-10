import { useResource, useAction } from '../api/useResource.js'
import { getSchoolDashboard, resetUserPassword, updateUserStatus } from '../api/endpoints.js'
import { Loading, ErrorState } from './States.jsx'
import { IconKey, IconUserOff, IconUserCheck } from './Icons.jsx'
import { fullName, humanize, fmtRelative, fmtNumber, statusBadge } from '../lib/format.js'

function initials(user) {
  if (user?.initials) return user.initials
  const name = fullName(user)
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '-'
}

function SchoolBody({ school, curriculum }) {
  const dash = useResource(() => getSchoolDashboard(school.id), [school.id])

  return (
    <>
      {dash.loading && !dash.data ? <Loading /> : null}
      {dash.error ? <ErrorState error={dash.error} onRetry={dash.reload} /> : null}
      {dash.data ? (
        <div className="dstat">
          <div className="ds">
            <div className="dsl">Learners</div>
            <div className="dsv">{fmtNumber(dash.data.totalLearners ?? dash.data.learners)}</div>
          </div>
          <div className="ds">
            <div className="dsl">Teachers</div>
            <div className="dsv">{fmtNumber(dash.data.totalTeachers ?? dash.data.teachers)}</div>
          </div>
        </div>
      ) : null}

      <div className="dsec">School record</div>
      <div className="dlist">
        <div className="di"><span className="dil">Region</span><span className="dv">{school.region || '-'}</span></div>
        <div className="di"><span className="dil">Status</span><span className="dv">{humanize(school.status)}</span></div>
        <div className="di"><span className="dil">Academic year</span><span className="dv">{school.academicYear || '-'}</span></div>
        <div className="di"><span className="dil">Current term</span><span className="dv">{school.currentTerm || '-'}</span></div>
        <div className="di">
          <span className="dil">Curriculum</span>
          <span className="dv">
            {curriculum
              ? `${curriculum.name} v${curriculum.version}`
              : school.curriculumVersionId ? 'Assigned' : 'Not assigned'}
          </span>
        </div>
        <div className="di"><span className="dil">Subject</span><span className="dv">{school.subject || '-'}</span></div>
        <div className="di"><span className="dil">Timezone</span><span className="dv">{school.timezone || '-'}</span></div>
        <div className="di"><span className="dil">AI cap used</span><span className="dv">{school.aiCapUsedPercent ?? 0}%</span></div>
        <div className="di"><span className="dil">Last sync</span><span className="dv">{fmtRelative(school.lastSyncAt)}</span></div>
      </div>
    </>
  )
}

function UserBody({ user, schoolName, onToast, onChanged }) {
  const reset = useAction()
  const status = useAction()

  async function doReset() {
    const res = await reset.run(() => resetUserPassword(user.id))
    onToast(res.ok
      ? (res.value?.message || 'Password reset initiated')
      : res.error.message)
  }

  async function doToggle() {
    const next = user.status === 'active' ? 'suspended' : 'active'
    const res = await status.run(() => updateUserStatus(user.id, next))
    if (res.ok) {
      onToast(`${fullName(user)} is now ${next}`)
      onChanged()
    } else {
      onToast(res.error.message)
    }
  }

  return (
    <>
      <div className="dsec">Account</div>
      <div className="dlist">
        <div className="di"><span className="dil">Email</span><span className="dv">{user.email || '-'}</span></div>
        <div className="di"><span className="dil">Phone</span><span className="dv">{user.phone || '-'}</span></div>
        <div className="di"><span className="dil">Role</span><span className="dv">{humanize(user.role)}</span></div>
        <div className="di"><span className="dil">School</span><span className="dv">{schoolName || '-'}</span></div>
        <div className="di">
          <span className="dil">Status</span>
          <span className="dv"><span className={'badge ' + statusBadge(user.status)}>{humanize(user.status)}</span></span>
        </div>
        <div className="di"><span className="dil">Last login</span><span className="dv">{fmtRelative(user.lastLoginAt)}</span></div>
        <div className="di"><span className="dil">Last active</span><span className="dv">{fmtRelative(user.lastActiveAt)}</span></div>
      </div>

      <div className="drowbtns">
        <span className="db" onClick={doReset} style={{ opacity: reset.busy ? 0.5 : 1 }}>
          <IconKey size={15} />
          {reset.busy ? 'Resetting…' : 'Reset password'}
        </span>
        <span className="db pri" onClick={doToggle} style={{ opacity: status.busy ? 0.5 : 1 }}>
          {user.status === 'active' ? <IconUserOff size={15} /> : <IconUserCheck size={15} />}
          {user.status === 'active' ? 'Suspend account' : 'Activate account'}
        </span>
      </div>
    </>
  )
}

export default function Drawer({ drawer, onClose, onToast, onChanged }) {
  const open = !!drawer
  let name = '-', sub = '-', avText = '-', avBg, avColor, body = null

  if (drawer?.detail === 'school') {
    const s = drawer.school
    name = s.name
    sub = [s.region, s.subject].filter(Boolean).join(' · ') || 'School'
    avText = '🏫'
    avBg = '#e0e7ff'
    avColor = '#4338ca'
    body = <SchoolBody school={s} curriculum={drawer.curriculum} />
  } else if (drawer?.detail === 'user') {
    const u = drawer.user
    name = fullName(u)
    sub = humanize(u.role)
    avText = initials(u)
    avBg = u.avatarBg || '#dbeafe'
    avColor = u.avatarColor || '#1d4ed8'
    body = (
      <UserBody
        user={u}
        schoolName={drawer.schoolName}
        onToast={onToast}
        onChanged={() => { onChanged?.(); onClose() }}
      />
    )
  }

  return (
    <>
      <div className={'drawerback' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'drawer' + (open ? ' on' : '')}>
        <div className="dh">
          <span className="dav" style={{ background: avBg, color: avColor }}>{avText}</span>
          <div><div className="dn">{name}</div><div className="dr">{sub}</div></div>
          <button className="dclose" onClick={onClose} aria-label="Close">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="dbody">{open ? body : null}</div>
      </aside>
    </>
  )
}
