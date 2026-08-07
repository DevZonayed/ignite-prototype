const sun = (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>
)
const moon = <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />

export default function Topbar({ title, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <div>
        <h1 id="pageTitle">{title}</h1>
        <div className="crumb">Bright Future Academy · Digital Innovation</div>
      </div>
      <span className="sp"></span>
      <div className="search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input placeholder="Search teachers, learners…" />
      </div>
      <button className="iconbtn" id="themeBtn" title="Toggle theme" onClick={onToggleTheme}>
        <svg id="themeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {theme === 'dark' ? sun : moon}
        </svg>
      </button>
      <button className="iconbtn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      </button>
    </header>
  )
}
