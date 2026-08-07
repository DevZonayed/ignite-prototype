import { useCallback, useEffect, useRef, useState } from 'react'
import { titles } from './data.js'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Drawer from './components/Drawer.jsx'
import Toast from './components/Toast.jsx'
import Overview from './views/Overview.jsx'
import Schools from './views/Schools.jsx'
import Users from './views/Users.jsx'
import Imports from './views/Imports.jsx'
import Curriculum from './views/Curriculum.jsx'
import Media from './views/Media.jsx'
import Announcements from './views/Announcements.jsx'
import Scoring from './views/Scoring.jsx'
import AIServices from './views/AIServices.jsx'
import Monitoring from './views/Monitoring.jsx'
import Security from './views/Security.jsx'

function initialTheme() {
  let saved
  try { saved = localStorage.ignite_theme } catch (e) { /* ignore */ }
  if (saved) return saved
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
}

function initialView() {
  const h = (location.hash || '').replace('#', '')
  return titles[h] ? h : 'overview'
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [view, setView] = useState(initialView)
  const [drawer, setDrawer] = useState(null)
  const [toast, setToast] = useState({ message: '', visible: false })
  const toastTimer = useRef(null)
  const contentRef = useRef(null)

  // theme -> <html data-theme> + persist
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.ignite_theme = theme } catch (e) { /* ignore */ }
  }, [theme])

  // view -> hash + scroll top
  useEffect(() => {
    if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view)
    if (contentRef.current) contentRef.current.scrollTop = 0
  }, [view])

  const navigate = useCallback((v) => {
    if (titles[v]) setView(v)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const showToast = useCallback((m) => {
    setToast({ message: m, visible: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 2200)
  }, [])

  return (
    <>
      <div className="app">
        <Sidebar view={view} onNavigate={navigate} />
        <div className="main">
          <Topbar title={titles[view]} theme={theme} onToggleTheme={toggleTheme} />
          <div className="content" ref={contentRef}>
            {view === 'overview' && <Overview onNavigate={navigate} />}
            <Schools active={view === 'schools'} onOpenDetail={setDrawer} />
            <Users active={view === 'users'} onOpenDetail={setDrawer} />
            <Imports active={view === 'imports'} />
            <Curriculum active={view === 'curriculum'} />
            <Media active={view === 'media'} />
            <Announcements active={view === 'announcements'} onToast={showToast} />
            <Scoring active={view === 'scoring'} />
            <AIServices active={view === 'ai'} />
            <Monitoring active={view === 'monitoring'} />
            <Security active={view === 'security'} />
          </div>
        </div>
      </div>
      <Drawer drawer={drawer} onClose={() => setDrawer(null)} />
      <Toast message={toast.message} visible={toast.visible} />
    </>
  )
}
