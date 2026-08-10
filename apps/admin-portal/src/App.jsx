import { useCallback, useEffect, useRef, useState } from 'react'
import { titles } from './data.js'
import { getStoredUser, clearSession, onUnauthorized } from './api/client.js'
import { getBootstrapStatus } from './api/endpoints.js'
import { useResource } from './api/useResource.js'
import { Loading, ErrorState } from './components/States.jsx'
import FirstRunSetup from './views/FirstRunSetup.jsx'
import Activate from './views/Activate.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Drawer from './components/Drawer.jsx'
import Toast from './components/Toast.jsx'
import SignIn from './views/SignIn.jsx'
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
import Profile from './views/Profile.jsx'

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

/**
 * Invite emails link to `/?email=…&code=…#activate`. Read those once on load —
 * the address bar is scrubbed straight after, so the single-use code does not
 * linger in history or get copied out of a shared screen.
 */
function initialActivation() {
  if ((location.hash || '').replace('#', '') !== 'activate') return null
  const params = new URLSearchParams(location.search)
  return { email: params.get('email') || '', code: params.get('code') || '' }
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [view, setView] = useState(initialView)
  const [user, setUser] = useState(getStoredUser)
  const [activation, setActivation] = useState(initialActivation)
  const [drawer, setDrawer] = useState(null)
  const [toast, setToast] = useState({ message: '', visible: false })
  // Bumped to make list views refetch after a write elsewhere (e.g. the drawer).
  const [dataVersion, setDataVersion] = useState(0)
  const toastTimer = useRef(null)
  const contentRef = useRef(null)

  // Only asked while signed out; a signed-in session already implies an admin.
  const bootstrap = useResource(() => getBootstrapStatus(), [], { enabled: !user })

  // Drop the invite code out of the URL as soon as it has been read.
  useEffect(() => {
    if (activation) history.replaceState(null, '', location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.ignite_theme = theme } catch (e) { /* ignore */ }
  }, [theme])

  // Any 401 anywhere drops us back to the sign-in screen.
  useEffect(() => onUnauthorized(() => {
    setUser(null)
    setDrawer(null)
  }), [])

  const firstNav = useRef(true)
  useEffect(() => {
    if (location.hash !== '#' + view) {
      if (firstNav.current) history.replaceState(null, '', '#' + view)
      else history.pushState(null, '', '#' + view)
    }
    firstNav.current = false
    if (contentRef.current) contentRef.current.scrollTop = 0
  }, [view])

  useEffect(() => {
    const onHash = () => {
      const h = (location.hash || '').replace('#', '')
      if (titles[h]) setView(h)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((v) => { if (titles[v]) setView(v) }, [])
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const showToast = useCallback((m) => {
    setToast({ message: m, visible: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast((p) => ({ ...p, visible: false })), 2600)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setUser(null)
    setDrawer(null)
    setView('overview')
  }, [])

  // Following an invite link is an explicit intent, so it wins over both the
  // stored session and the first-run check.
  if (activation) {
    return (
      <Activate
        initialEmail={activation.email}
        initialCode={activation.code}
        onActivated={(u) => { setActivation(null); setUser(u) }}
        onCancel={() => setActivation(null)}
      />
    )
  }

  // Decide between first-run setup and the sign-in form before showing either.
  if (!user) {
    if (bootstrap.loading && bootstrap.data == null) {
      return <div className="signin"><Loading label="Contacting the IGNITE API…" /></div>
    }
    if (bootstrap.error) {
      return (
        <div className="signin">
          <div className="signin-card">
            <ErrorState error={bootstrap.error} onRetry={bootstrap.reload} />
          </div>
        </div>
      )
    }
    if (bootstrap.data?.needsBootstrap) {
      return (
        <FirstRunSetup
          onCreated={(u) => { setUser(u); bootstrap.reload() }}
        />
      )
    }
    return <SignIn onSignedIn={setUser} onActivate={() => setActivation({ email: '', code: '' })} />
  }

  const bump = () => setDataVersion((v) => v + 1)

  return (
    <>
      <div className="app">
        <Sidebar view={view} onNavigate={navigate} user={user} />
        <div className="main">
          <Topbar
            title={titles[view]}
            theme={theme}
            onToggleTheme={toggleTheme}
            user={user}
            onSignOut={signOut}
          />
          <div className="content" ref={contentRef}>
            {view === 'overview' && <Overview key={dataVersion} onNavigate={navigate} />}
            <Schools key={'schools' + dataVersion} active={view === 'schools'} onOpenDetail={setDrawer} onToast={showToast} />
            <Users key={'users' + dataVersion} active={view === 'users'} onOpenDetail={setDrawer} onToast={showToast} />
            <Imports active={view === 'imports'} onToast={showToast} />
            <Curriculum active={view === 'curriculum'} onToast={showToast} />
            <Media active={view === 'media'} onToast={showToast} />
            <Announcements active={view === 'announcements'} onToast={showToast} />
            <Scoring active={view === 'scoring'} onToast={showToast} />
            <AIServices active={view === 'ai'} onToast={showToast} />
            <Monitoring active={view === 'monitoring'} />
            <Security active={view === 'security'} />
            <Profile
              active={view === 'profile'}
              user={user}
              onUserChanged={setUser}
              onToast={showToast}
            />
          </div>
        </div>
      </div>
      <Drawer
        drawer={drawer}
        onClose={() => setDrawer(null)}
        onToast={showToast}
        onChanged={bump}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </>
  )
}
