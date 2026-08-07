import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Drawer from './components/Drawer.jsx'
import Overview from './views/Overview.jsx'
import Teachers from './views/Teachers.jsx'
import Learners from './views/Learners.jsx'
import Classes from './views/Classes.jsx'
import Curriculum from './views/Curriculum.jsx'
import Homework from './views/Homework.jsx'
import Attendance from './views/Attendance.jsx'
import Reports from './views/Reports.jsx'
import Settings from './views/Settings.jsx'
import { titles } from './data.js'

function initialView() {
  const h = (window.location.hash || '').replace('#', '')
  return titles[h] ? h : 'overview'
}

function initialTheme() {
  let saved
  try {
    saved = localStorage.ignite_theme
  } catch (e) {
    // ignore
  }
  if (saved) return saved
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [view, setView] = useState(initialView)
  const [theme, setTheme] = useState(initialTheme)
  const [detail, setDetail] = useState(null)
  const [toast, setToastState] = useState({ msg: '', on: false })

  // apply theme to <html> + persist
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.ignite_theme = theme
    } catch (e) {
      // ignore
    }
  }, [theme])

  // page title + hash sync
  useEffect(() => {
    document.title = 'IGNITE — School Portal'
    if (window.location.hash !== '#' + view) {
      window.history.replaceState(null, '', '#' + view)
    }
    window.scrollTo(0, 0)
  }, [view])

  const navigate = (v) => {
    if (!titles[v]) return
    setView(v)
  }

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const toastTimer = useRef()
  const showToast = (m) => {
    setToastState({ msg: m, on: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastState((s) => ({ ...s, on: false })), 2200)
  }

  return (
    <>
      <div className="app">
        <Sidebar view={view} onNavigate={navigate} />
        <div className="main">
          <Topbar title={titles[view]} theme={theme} onToggleTheme={toggleTheme} />
          <div className="content">
            <Overview active={view === 'overview'} onNavigate={navigate} />
            <Teachers active={view === 'teachers'} onOpenDetail={setDetail} />
            <Learners active={view === 'learners'} onOpenDetail={setDetail} />
            <Classes active={view === 'classes'} />
            <Curriculum active={view === 'curriculum'} />
            <Homework active={view === 'homework'} onNavigate={navigate} onToast={showToast} />
            <Attendance active={view === 'attendance'} />
            <Reports active={view === 'reports'} />
            <Settings active={view === 'settings'} theme={theme} onToggleTheme={toggleTheme} />
          </div>
        </div>
      </div>

      <Drawer detail={detail} onClose={() => setDetail(null)} />

      <div
        id="toast"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '28px',
          transform: toast.on ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
          background: 'var(--text)',
          color: 'var(--surface)',
          padding: '11px 18px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: 'var(--shadow)',
          opacity: toast.on ? 1 : 0,
          pointerEvents: 'none',
          transition: '.25s',
          zIndex: 200,
        }}
      >
        {toast.msg}
      </div>
    </>
  )
}
