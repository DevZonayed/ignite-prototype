import { useEffect, useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { getMe, updateMe, changePassword } from '../api/endpoints.js'
import { storeSession, getToken } from '../api/client.js'
import { Loading, ErrorState } from '../components/States.jsx'
import { fullName, humanize, fmtDateTime, statusBadge } from '../lib/format.js'

function initialsOf(user) {
  if (user?.initials) return user.initials
  const name = fullName(user)
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '-'
}

export default function Profile({ active, user, onUserChanged, onToast, extraRows }) {
  const me = useResource(() => getMe(), [], { enabled: active })
  const profile = me.data || user

  const [form, setForm] = useState({ firstName: '', lastName: '' })
  useEffect(() => {
    if (profile) {
      setForm({ firstName: profile.firstName || '', lastName: profile.lastName || '' })
    }
  }, [profile?.firstName, profile?.lastName])

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')

  const saveDetails = useAction()
  const savePassword = useAction()

  const detailsDirty =
    profile &&
    (form.firstName !== (profile.firstName || '') || form.lastName !== (profile.lastName || ''))

  async function submitDetails(e) {
    e.preventDefault()
    const res = await saveDetails.run(() => updateMe({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    }))
    if (res.ok) {
      // Keep the stored session in step so the sidebar and topbar update too.
      storeSession(getToken(), res.value)
      onUserChanged(res.value)
      onToast('Profile updated')
      me.reload()
    }
  }

  async function submitPassword(e) {
    e.preventDefault()
    if (pw.newPassword !== pw.confirmPassword) {
      setPwError('The two new passwords do not match.')
      return
    }
    if (pw.newPassword.length < 8 || !/[A-Za-z]/.test(pw.newPassword) || !/\d/.test(pw.newPassword)) {
      setPwError('Use at least 8 characters, including a letter and a number.')
      return
    }
    setPwError('')
    const res = await savePassword.run(() => changePassword(pw))
    if (res.ok) {
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' })
      onToast('Password changed')
    }
  }

  if (active && me.loading && !me.data && !user) {
    return <section className="view active"><Loading label="Loading your profile…" /></section>
  }

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-profile">
      <div className="profile-head">
        <span
          className="profile-avatar"
          style={{ background: profile?.avatarBg || '#dbeafe', color: profile?.avatarColor || '#1d4ed8' }}
        >
          {initialsOf(profile)}
        </span>
        <div>
          <div className="profile-name">{fullName(profile)}</div>
          <div className="profile-meta">
            <span className="badge b-blue">{humanize(profile?.role)}</span>
            {profile?.status ? (
              <span className={'badge ' + statusBadge(profile.status)}>{humanize(profile.status)}</span>
            ) : null}
            <span className="fm">{profile?.email}</span>
          </div>
        </div>
      </div>

      {me.error ? <ErrorState error={me.error} onRetry={me.reload} /> : null}

      <div className="grid2">
        <div className="panel">
          <div className="ph"><h3>Your details</h3></div>
          <form className="annseg" onSubmit={submitDetails}>
            <div className="modal-grid">
              <div className="modal-field">
                <label className="signin-label" htmlFor="pf-first">First name</label>
                <input
                  id="pf-first"
          placeholder="Type first name"
                  className="signin-input"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="modal-field">
                <label className="signin-label" htmlFor="pf-last">Last name</label>
                <input
                  id="pf-last"
          placeholder="Type last name"
                  className="signin-input"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>

            {saveDetails.error ? <div className="signin-err">{saveDetails.error.message}</div> : null}

            <div className="pubbar">
              <button className="btnP" type="submit" disabled={!detailsDirty || saveDetails.busy}>
                {saveDetails.busy ? 'Saving…' : 'Save details'}
              </button>
            </div>
          </form>

          <div className="dsec">Account</div>
          <div className="dlist">
            <div className="di"><span className="dil">Email</span><span className="dv">{profile?.email || '-'}</span></div>
            <div className="di"><span className="dil">Phone</span><span className="dv">{profile?.phone || '-'}</span></div>
            <div className="di"><span className="dil">Role</span><span className="dv">{humanize(profile?.role)}</span></div>
            {extraRows}
            <div className="di"><span className="dil">Last login</span><span className="dv">{fmtDateTime(profile?.lastLoginAt)}</span></div>
            <div className="di"><span className="dil">Member since</span><span className="dv">{fmtDateTime(profile?.createdAt)}</span></div>
          </div>
          <div className="note-strip" style={{ marginTop: 12 }}>
            Your email is your sign-in name. Ask an administrator if it needs to change.
          </div>
        </div>

        <div className="panel">
          <div className="ph"><h3>Change password</h3></div>
          <form className="annseg" onSubmit={submitPassword}>
            <div className="modal-field">
              <label className="signin-label" htmlFor="pf-cur">Current password</label>
              <input
                id="pf-cur"
          placeholder="Type current password"
                className="signin-input"
                type="password"
                autoComplete="current-password"
                value={pw.currentPassword}
                onChange={(e) => { setPw((p) => ({ ...p, currentPassword: e.target.value })); setPwError('') }}
                required
              />
            </div>
            <div className="modal-field">
              <label className="signin-label" htmlFor="pf-new">New password</label>
              <input
                id="pf-new"
                className="signin-input"
                type="password"
                autoComplete="new-password"
                placeholder="Type new password"
                value={pw.newPassword}
                onChange={(e) => { setPw((p) => ({ ...p, newPassword: e.target.value })); setPwError('') }}
                required
              />
              <div className="modal-hint">At least 8 characters, including a letter and a number.</div>
            </div>
            <div className="modal-field">
              <label className="signin-label" htmlFor="pf-conf">Confirm new password</label>
              <input
                id="pf-conf"
          placeholder="Retype new password"
                className="signin-input"
                type="password"
                autoComplete="new-password"
                value={pw.confirmPassword}
                onChange={(e) => { setPw((p) => ({ ...p, confirmPassword: e.target.value })); setPwError('') }}
                required
              />
            </div>

            {pwError || savePassword.error ? (
              <div className="signin-err">{pwError || savePassword.error.message}</div>
            ) : null}

            <div className="pubbar">
              <button
                className="btnP"
                type="submit"
                disabled={savePassword.busy || !pw.currentPassword || !pw.newPassword}
              >
                {savePassword.busy ? 'Changing…' : 'Change password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
