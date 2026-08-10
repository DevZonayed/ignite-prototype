import { useState } from 'react'
import { signIn } from '../api/endpoints.js'
import { storeSession, API_BASE_URL } from '../api/client.js'
import { useAction } from '../api/useResource.js'

const ADMIN_ROLES = [
  { value: 'platform_admin', label: 'Platform admin' },
  { value: 'curriculum_admin', label: 'Curriculum admin' },
]

export default function SignIn({ onSignedIn, onActivate }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('platform_admin')
  const { run, busy, error } = useAction()

  async function submit(e) {
    e.preventDefault()
    const res = await run(() => signIn(identifier.trim(), password, role))
    if (res.ok) {
      storeSession(res.value.accessToken, res.value.user)
      onSignedIn(res.value.user)
    }
  }

  return (
    <div className="signin">
      <form className="signin-card" onSubmit={submit}>
        <div className="signin-brand">
          <span className="signin-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M12 3C12.8 8.4 15.6 11.2 21 12C15.6 12.8 12.8 15.6 12 21C11.2 15.6 8.4 12.8 3 12C8.4 11.2 11.2 8.4 12 3Z" fill="currentColor" />
            </svg>
          </span>
          <div>
            <div className="signin-title">IGNITE Admin</div>
            <div className="signin-sub">Sign in to manage the platform</div>
          </div>
        </div>

        <label className="signin-label" htmlFor="si-id">Email</label>
        <input
          id="si-id"
          className="signin-input"
          type="email"
          autoComplete="username"
          placeholder="Type email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <label className="signin-label" htmlFor="si-pw">Password</label>
        <input
          id="si-pw"
          className="signin-input"
          type="password"
          autoComplete="current-password"
          placeholder="Type password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="signin-label" htmlFor="si-role">Sign in as</label>
        <select
          id="si-role"
          className="signin-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ADMIN_ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        {error ? <div className="signin-err" role="alert">{error.message}</div> : null}

        <button className="btnP signin-btn" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="signin-foot">
          Have an invite code?{' '}
          <a href="#activate" onClick={(e) => { e.preventDefault(); onActivate() }}>
            Activate your account
          </a>
          <br />
          API: <code>{API_BASE_URL}</code>
        </div>
      </form>
    </div>
  )
}
