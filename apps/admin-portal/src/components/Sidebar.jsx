import { humanize } from '../lib/format.js'
const navItems = [
  { view: 'overview', label: 'Overview', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
  ) },
  { view: 'schools', label: 'Schools', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" /></svg>
  ) },
  { view: 'users', label: 'Users', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M16 3.5a3 3 0 0 1 0 5.8M21 20c0-2-1.5-3.7-4-4.3" /></svg>
  ) },
  { view: 'imports', label: 'Imports', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M8 11l4 4 4-4M4 21h16" /></svg>
  ) },
  { view: 'curriculum', label: 'Curriculum', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10" /><path d="M9 4v6h6" /></svg>
  ) },
  { view: 'media', label: 'Media', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="m3 14 4-4 4 4 3-3 4 4" /><circle cx="8" cy="9" r="1" /></svg>
  ) },
  { view: 'announcements', label: 'Announcements', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 0 1-5.8-1.1V14" /></svg>
  ) },
  { view: 'scoring', label: 'Scoring', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>
  ) },
  { view: 'ai', label: 'AI services', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /><circle cx="19" cy="5" r="2.5" /></svg>
  ) },
  { view: 'monitoring', label: 'Monitoring', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  ) },
  { view: 'security', label: 'Security & Audit', icon: (
    <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
  ) },
]

const LockIcon = () => (
  <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
)


function displayName(user) {
  if (!user) return 'Signed in'
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return name || user.email || 'Signed in'
}

function initialsOf(user) {
  if (user?.initials) return user.initials
  return displayName(user).split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Sidebar({ view, onNavigate, user }) {
  return (
    <aside className="side">
      <div className="brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2c1 4-2 5-2 8a4 4 0 0 0 8 0c0-1-.4-2-1-3 .3 2-1 3-1 3 .5-3-2-5-4-8z" fill="#F97316" /><path d="M12 9c.5 2-1 3-1 4.4a2.3 2.3 0 0 0 4.6 0c0-1.4-1.1-2.1-1.4-3.6-.5 1.2-1.7 1.3-2.2-.8z" fill="#FBBF24" /></svg>{' '}
        <span>IGNITE Admin</span>
      </div>
      {navItems.map((n) => (
        <a
          key={n.view}
          className={view === n.view ? 'on' : undefined}
          onClick={() => onNavigate(n.view)}
        >
          {n.icon}
          <span>{n.label}</span>
        </a>
      ))}
      <div className="sep"></div>
      <a className="lock"><LockIcon /><span>Analytics</span><span className="p3">Phase 3</span></a>
      <a className="lock"><LockIcon /><span>Benchmarking</span><span className="p3">Phase 3</span></a>
      <button
        type="button"
        className={'userchip' + (view === 'profile' ? ' on' : '')}
        onClick={() => onNavigate('profile')}
        title="Open your profile"
      >
        <span className="ua" style={user?.avatarBg ? { background: user.avatarBg, color: user.avatarColor } : undefined}>
          {initialsOf(user)}
        </span>
        <div className="uinfo">
          <div className="un">{displayName(user)}</div>
          <div className="ur">{humanize(user?.role)}</div>
        </div>
        <svg className="uchev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </aside>
  )
}
