const NAV = [
  {
    view: 'overview',
    label: 'Overview',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    view: 'teachers',
    label: 'Teachers',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
        <path d="M16 3.5a3 3 0 0 1 0 5.8" />
      </svg>
    ),
  },
  {
    view: 'learners',
    label: 'Learners',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
  {
    view: 'classes',
    label: 'Classes',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    view: 'curriculum',
    label: 'Curriculum',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10" />
        <path d="M9 4v6h6" />
      </svg>
    ),
  },
  {
    view: 'homework',
    label: 'Homework',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3 8-8" />
        <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
      </svg>
    ),
  },
  {
    view: 'attendance',
    label: 'Attendance',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    view: 'reports',
    label: 'Reports',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
      </svg>
    ),
  },
  {
    view: 'settings',
    label: 'Settings',
    icon: (
      <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 2.6 7" />
      </svg>
    ),
  },
]

export default function Sidebar({ view, onNavigate }) {
  return (
    <aside className="side">
      <div className="brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2c1 4-2 5-2 8a4 4 0 0 0 8 0c0-1-.4-2-1-3 .3 2-1 3-1 3 .5-3-2-5-4-8z" fill="#F97316" />
        </svg>{' '}
        <span>IGNITE School</span>
      </div>
      {NAV.map((n) => (
        <a
          key={n.view}
          className={view === n.view ? 'on' : undefined}
          data-view={n.view}
          onClick={() => onNavigate(n.view)}
        >
          {n.icon}
          <span>{n.label}</span>
        </a>
      ))}
      <div className="userchip">
        <span className="ua">FO</span>
        <div>
          <div className="un">Funke Okafor</div>
          <div className="ur">Principal</div>
        </div>
      </div>
    </aside>
  )
}
