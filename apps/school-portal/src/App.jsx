import { useCallback, useEffect, useRef, useState } from 'react'
import { titles } from './data.js'
import { getStoredUser, clearSession, onUnauthorized } from './api/client.js'
import { useResource } from './api/useResource.js'
import { getSchool } from './api/endpoints.js'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Drawer from './components/Drawer.jsx'
import { ErrorState } from './components/States.jsx'
import SignIn from './views/SignIn.jsx'
import Activate from './views/Activate.jsx'
import Overview from './views/Overview.jsx'
import People from './views/People.jsx'
import Classes from './views/Classes.jsx'
import Curriculum from './views/Curriculum.jsx'
import Homework from './views/Homework.jsx'
import Attendance from './views/Attendance.jsx'
import Reports from './views/Reports.jsx'
import Settings from './views/Settings.jsx'
import Profile from './views/Profile.jsx'

function initialView() {
  const h = (window.location.hash || '').replace('#', '')
  return titles[h] ? h : 'overview'
}

/**
 * Invite emails link to `/?email=…&code=…#activate`. Read those once on load —
 * the address bar is scrubbed straight after, so the single-use code does not
 * linger in history or get copied out of a shared screen.
 */
function initialActivation() {
  if ((window.location.hash || '').replace('#', '') !== 'activate') return null
  const params = new URLSearchParams(window.location.search)
  return { email: params.get('email') || '', code: params.get('code') || '' }
}

function initialTheme() {
  let saved
  try { saved = localStorage.ignite_theme } catch (e) { /* ignore */ }
  if (saved) return saved
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [view, setView] = useState(initialView)
  const [theme, setTheme] = useState(initialTheme)
  const [user, setUser] = useState(getStoredUser)
  const [activation, setActivation] = useState(initialActivation)
  const [detail, setDetail] = useState(null)
  const [toast, setToastState] = useState({ msg: '', on: false })
  const toastTimer = useRef()

  // Drop the invite code out of the URL as soon as it has been read.
  useEffect(() => {
    if (activation) window.history.replaceState(null, '', window.location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const schoolId = user?.schoolId ?? null
  const school = useResource(() => getSchool(schoolId), [schoolId], { enabled: !!schoolId })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.ignite_theme = theme } catch (e) { /* ignore */ }
  }, [theme])

  // Any 401 anywhere drops back to sign-in.
  useEffect(() => onUnauthorized(() => { setUser(null); setDetail(null) }), [])

  const firstNav = useRef(true)
  useEffect(() => {
    document.title = 'IGNITE School Portal'
    if (window.location.hash !== '#' + view) {
      if (firstNav.current) window.history.replaceState(null, '', '#' + view)
      else window.history.pushState(null, '', '#' + view)
    }
    firstNav.current = false
    window.scrollTo(0, 0)
  }, [view])

  useEffect(() => {
    const onHash = () => {
      const h = (window.location.hash || '').replace('#', '')
      if (titles[h]) setView(h)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((v) => { if (titles[v]) setView(v) }, [])
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const showToast = useCallback((m) => {
    setToastState({ msg: m, on: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastState((p) => ({ ...p, on: false })), 2600)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setUser(null)
    setDetail(null)
    setView('overview')
  }, [])

  // Following an invite link is an explicit intent, so it wins even when a
  // session is already stored on this browser.
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

  if (!user) {
    return <SignIn onSignedIn={setUser} onActivate={() => setActivation({ email: '', code: '' })} />
  }

  // A principal without a school cannot be scoped to anything, so say so
  // plainly rather than rendering nine broken screens.
  if (!schoolId) {
    return (
      <div className="signin">
        <div className="signin-card">
          <ErrorState
            error={{ message: 'Your account is not linked to a school. Ask IGNITE admin to assign you to one.' }}
          />
          <button className="btnO" style={{ marginTop: 12 }} onClick={signOut}>Sign out</button>
        </div>
      </div>
    )
  }

  const shared = { schoolId, onToast: showToast }

  return (
    <>
      <div className="app">
        <Sidebar view={view} onNavigate={navigate} user={user} />
        <div className="main">
          <Topbar
            title={titles[view]}
            subtitle={
              school.data
                ? `${school.data.name} · ${school.data.currentTerm || ''} ${school.data.academicYear || ''}`.trim()
                : 'Loading school…'
            }
            theme={theme}
            onToggleTheme={toggleTheme}
            user={user}
            onSignOut={signOut}
          />
          <div className="content">
            {view === 'overview' && <Overview schoolId={schoolId} onNavigate={navigate} />}
            <People
              key="teachers"
              active={view === 'teachers'}
              role="teacher"
              onOpenDetail={setDetail}
              {...shared}
            />
            <People
              key="learners"
              active={view === 'learners'}
              role="learner"
              onOpenDetail={setDetail}
              {...shared}
            />
            <Classes active={view === 'classes'} onOpenDetail={setDetail} {...shared} />
            <Curriculum active={view === 'curriculum'} schoolId={schoolId} />
            <Homework active={view === 'homework'} {...shared} />
            <Attendance active={view === 'attendance'} schoolId={schoolId} />
            <Reports active={view === 'reports'} {...shared} />
            <Settings active={view === 'settings'} schoolId={schoolId} user={user} />
            <Profile
              active={view === 'profile'}
              user={user}
              onUserChanged={setUser}
              onToast={showToast}
              extraRows={
                <div className="di">
                  <span className="dil">School</span>
                  <span className="dv">{school.data?.name || '-'}</span>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <Drawer drawer={detail} onClose={() => setDetail(null)} />

      <div className={'toast' + (toast.on ? ' on' : '')}>{toast.msg}</div>
    </>
  )
}
