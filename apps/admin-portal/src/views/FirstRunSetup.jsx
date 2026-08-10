import { useState } from 'react'
import { bootstrapAdmin } from '../api/endpoints.js'
import { storeSession } from '../api/client.js'
import { useAction } from '../api/useResource.js'

/** Mirrors BootstrapAdminDto on the server so we fail fast, before a round trip. */
function passwordProblem(password, confirm) {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Include at least one letter and one number.'
  }
  if (password !== confirm) return 'The two passwords do not match.'
  return null
}

export default function FirstRunSetup({ onCreated }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  })
  const [localError, setLocalError] = useState('')
  const { run, busy, error } = useAction()

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (localError) setLocalError('')
  }

  async function submit(e) {
    e.preventDefault()
    const problem = passwordProblem(form.password, form.confirmPassword)
    if (problem) { setLocalError(problem); return }

    const res = await run(() => bootstrapAdmin(form))
    if (res.ok) {
      storeSession(res.value.accessToken, res.value.user)
      onCreated(res.value.user)
    }
  }

  const message = localError || error?.message

  return (
    <div className="signin">
      {/* Rendered as a modal over the sign-in ground so first run reads as an
          interruption, not just another page. */}
      <div className="modal-back" />
      <form className="signin-card firstrun-card" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="fr-title">
        <div className="signin-brand">
          <span className="signin-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M12 3C12.8 8.4 15.6 11.2 21 12C15.6 12.8 12.8 15.6 12 21C11.2 15.6 8.4 12.8 3 12C8.4 11.2 11.2 8.4 12 3Z" fill="currentColor" />
            </svg>
          </span>
          <div>
            <div className="signin-title" id="fr-title">Set up IGNITE</div>
            <div className="signin-sub">No administrator exists yet. Create the first one</div>
          </div>
        </div>

        <p className="firstrun-note">
          This account gets full platform access: schools, users, AI spend limits
          and the audit log. It can only be created once. Afterwards, new admins
          are invited from inside the portal.
        </p>

        <div className="inline-row">
          <div style={{ flex: 1 }}>
            <label className="signin-label" htmlFor="fr-first">First name</label>
            <input id="fr-first" placeholder="Type first name" className="signin-input" value={form.firstName} onChange={set('firstName')} required />
          </div>
          <div style={{ flex: 1 }}>
            <label className="signin-label" htmlFor="fr-last">Last name</label>
            <input id="fr-last" placeholder="Type last name" className="signin-input" value={form.lastName} onChange={set('lastName')} required />
          </div>
        </div>

        <label className="signin-label" htmlFor="fr-email">Email</label>
        <input
          id="fr-email"
          className="signin-input"
          type="email"
          autoComplete="username"
          placeholder="Type email"
          value={form.email}
          onChange={set('email')}
          required
        />

        <label className="signin-label" htmlFor="fr-pw">Password</label>
        <input
          id="fr-pw"
          className="signin-input"
          type="password"
          autoComplete="new-password"
          placeholder="Type password"
          value={form.password}
          onChange={set('password')}
          required
        />
        <div className="modal-hint">At least 8 characters, including a letter and a number.</div>

        <label className="signin-label" htmlFor="fr-pw2">Confirm password</label>
        <input
          id="fr-pw2"
          className="signin-input"
          type="password"
          autoComplete="new-password"
          placeholder="Retype password"
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          required
        />

        {message ? <div className="signin-err" role="alert">{message}</div> : null}

        <button className="btnP signin-btn" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create admin account'}
        </button>
      </form>
    </div>
  )
}
