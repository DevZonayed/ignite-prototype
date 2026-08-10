import { fullName, humanize } from '../lib/format.js'

const sunPath = (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>
)
const moonPath = <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />

export default function Topbar({ title, theme, onToggleTheme, user, onSignOut }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <div className="crumb">IGNITE Admin · Phase 1 pilot</div>
      </div>
      <span className="sp" />

      {user ? (
        <div className="whoami" title={user.email || ''}>
          <span className="whoami-name">{fullName(user)}</span>
          <span className="badge b-blue">{humanize(user.role)}</span>
        </div>
      ) : null}

      <button className="iconbtn" title="Toggle theme" onClick={onToggleTheme}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {theme === 'dark' ? sunPath : moonPath}
        </svg>
      </button>

      <button className="iconbtn" title="Sign out" onClick={onSignOut}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </header>
  )
}
