import { useState } from 'react'
import { activateAccount } from '../api/endpoints.js'
import { storeSession } from '../api/client.js'
import { useAction } from '../api/useResource.js'

/** The role this portal actually signs people in as. */
const PORTAL_ROLE = 'principal'

/** Where each other role goes once their password is set. */
const HOME_FOR_ROLE = {
  platform_admin: 'the IGNITE admin portal',
  curriculum_admin: 'the IGNITE admin portal',
  teacher: 'the IGNITE Teacher app',
  learner: 'the IGNITE Learner app',
  parent: 'the IGNITE Parent app',
}

/** Mirrors the server's ActivateDto rules so the failure is caught before the round trip. */
function passwordProblem(password, confirm) {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Include at least one letter and one number.'
  }
  if (password !== confirm) return 'The two passwords do not match.'
  return null
}

/**
 * Redeem an invite code from the link in an invite email: sets the password and
 * activates the account.
 *
 * The invite code is single-use and any role can redeem it here, so a principal
 * is signed straight in while everyone else gets told which app to open next —
 * dropping a teacher into the principal's portal would only show them errors.
 */
export default function Activate({ initialEmail = '', initialCode = '', onActivated, onCancel }) {
  const [identifier, setIdentifier] = useState(initialEmail)
  const [inviteCode, setInviteCode] = useState(initialCode)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localErr, setLocalErr] = useState(null)
  const [done, setDone] = useState(null)
  const { run, busy, error } = useAction()

  async function submit(e) {
    e.preventDefault()
    setLocalErr(null)

    const problem = passwordProblem(password, confirm)
    if (problem) { setLocalErr(problem); return }

    const res = await run(() => activateAccount(identifier, inviteCode, password))
    if (!res.ok) return

    const { accessToken, user } = res.value
    if (user?.role === PORTAL_ROLE) {
      storeSession(accessToken, user)
      onActivated(user)
    } else {
      // Activated, but this is not their portal — do not store a session.
      setDone(user)
    }
  }

  if (done) {
    return (
      <div className="signin">
        <div className="signin-card">
          <div className="signin-brand">
            <span className="signin-mark" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <div>
              <div className="signin-title">Account activated</div>
              <div className="signin-sub">Your password is set</div>
            </div>
          </div>
          <p style={{ margin: '4px 0 18px', fontSize: 14, lineHeight: '21px', color: 'var(--text-subtle)' }}>
            You are set up as a {String(done.role || '').replace(/_/g, ' ')}, so sign in
            from {HOME_FOR_ROLE[done.role] || 'the IGNITE app for your role'} using{' '}
            <strong>{done.email}</strong> and the password you just chose.
          </p>
          <button className="btnO signin-btn" type="button" onClick={onCancel}>
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  const shown = localErr || error?.message

  return (
    <div className="signin">
      <form className="signin-card" onSubmit={submit}>
        <div className="signin-brand">
          <span className="signin-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21V9l9-6 9 6v12" />
            </svg>
          </span>
          <div>
            <div className="signin-title">Activate your account</div>
            <div className="signin-sub">Choose a password to finish setting up</div>
          </div>
        </div>

        <label className="signin-label" htmlFor="ac-id">Email</label>
        <input
          id="ac-id"
          className="signin-input"
          type="email"
          autoComplete="username"
          placeholder="Type email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <label className="signin-label" htmlFor="ac-code">Invite code</label>
        <input
          id="ac-code"
          className="signin-input"
          placeholder="Type the code from your invite email"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          autoCapitalize="characters"
          spellCheck="false"
          required
        />

        <label className="signin-label" htmlFor="ac-pw">New password</label>
        <input
          id="ac-pw"
          className="signin-input"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters, one letter and one number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="signin-label" htmlFor="ac-pw2">Confirm password</label>
        <input
          id="ac-pw2"
          className="signin-input"
          type="password"
          autoComplete="new-password"
          placeholder="Type it again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {shown ? <div className="signin-err" role="alert">{shown}</div> : null}

        <button
          className="btnP signin-btn"
          type="submit"
          disabled={busy || !identifier.trim() || !inviteCode.trim() || !password || !confirm}
        >
          {busy ? 'Activating…' : 'Activate account'}
        </button>

        <div className="signin-foot">
          Setting a password confirms you accept the IGNITE terms of use.
          <br />
          Already activated?{' '}
          <a href="#signin" onClick={(e) => { e.preventDefault(); onCancel() }}>Sign in instead</a>
        </div>
      </form>
    </div>
  )
}
