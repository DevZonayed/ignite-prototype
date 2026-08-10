import { useState } from 'react'
import { signIn } from '../api/endpoints.js'
import { storeSession, API_BASE_URL } from '../api/client.js'
import { useAction } from '../api/useResource.js'

export default function SignIn({ onSignedIn, onActivate }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const { run, busy, error } = useAction()

  async function submit(e) {
    e.preventDefault()
    const res = await run(() => signIn(identifier.trim(), password))
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21V9l9-6 9 6v12" />
            </svg>
          </span>
          <div>
            <div className="signin-title">IGNITE School</div>
            <div className="signin-sub">Sign in to your school portal</div>
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
          Principal accounts are created by IGNITE when your school is set up.
          <br />
          API: <code>{API_BASE_URL}</code>
        </div>
      </form>
    </div>
  )
}
