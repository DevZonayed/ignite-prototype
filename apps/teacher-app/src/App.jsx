import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { ThemeProvider, useTheme } from './ThemeContext';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';

import HomeScreen from './screens/HomeScreen';
import LessonsScreen from './screens/LessonsScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import ActiveScreen from './screens/ActiveScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import ChecklistScreen from './screens/ChecklistScreen';
import EvidenceScreen from './screens/EvidenceScreen';
import HomeworkCreateScreen from './screens/HomeworkCreateScreen';
import LearnersScreen from './screens/LearnersScreen';
import RubricScreen from './screens/RubricScreen';
import HomeworkScreen from './screens/HomeworkScreen';
import HwReviewScreen from './screens/HwReviewScreen';
import AIScreen from './screens/AIScreen';
import ProfileScreen from './screens/ProfileScreen';
import SyncScreen from './screens/SyncScreen';
import AssessmentScreen from './screens/AssessmentScreen';
import ProjectScreen from './screens/ProjectScreen';
import ReflectionScreen from './screens/ReflectionScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SignInScreen from './screens/SignInScreen';
import { loadSession, clearSession, setUnauthorizedHandler } from './api/auth';
import { ClassProvider } from './context/ClassContext';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ActivateScreen from './screens/ActivateScreen';

const MAINS = ['home', 'lessons', 'learners', 'homework', 'ai', 'profile'];

/** Nav params are flat id bags, so one level of comparison is enough. */
function shallowEqual(a = {}, b = {}) {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  return ak.length === bk.length && ak.every((k) => a[k] === b[k]);
}

// Real device status-bar inset. RN's SafeAreaView ignores the Android status bar,
// so reserve its height explicitly; iOS notch handled with a safe default; web = 0.
const TOP_INSET =
  Platform.OS === 'android'
    ? RNStatusBar.currentHeight || 24
    : Platform.OS === 'ios'
    ? 44
    : 0;

function Shell() {
  const { colors, mode } = useTheme();
  const { width, height } = useWindowDimensions();

  // Entries are { id, params }: detail screens need to know which lesson,
  // learner or submission they were opened for, and that has to survive going
  // back and forward through the stack.
  const [stack, setStack] = useState([{ id: 'home', params: {} }]);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [user, setUser] = useState(null);
  // Which pre-auth screen is showing, and the address to prefill on return
  // from a completed password reset.
  const [authView, setAuthView] = useState('signin');
  const [resetIdentifier, setResetIdentifier] = useState('');
  // Null while we check storage, so we don't flash the sign-in screen at
  // someone who is already signed in.
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadSession()
      .then((stored) => { if (!cancelled && stored) setUser(stored); })
      .finally(() => { if (!cancelled) setRestoring(false); });
    return () => { cancelled = true; };
  }, []);
  const toastTimer = useRef(null);
  const scrollRef = useRef(null);

  const currentEntry = stack[stack.length - 1];
  const current = currentEntry.id;
  const params = currentEntry.params;
  const isMain = MAINS.indexOf(current) >= 0;

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 1900);
  }, []);

  const navTo = useCallback((id, navParams = {}) => {
    const main = MAINS.indexOf(id) >= 0;
    setStack((prev) => {
      if (main) return [{ id, params: navParams }];
      const top = prev[prev.length - 1];
      // Re-tapping the screen you are on is a no-op, but opening the same
      // screen for a different learner or lesson is a real navigation.
      if (top.id === id && shallowEqual(top.params, navParams)) return prev;
      return [...prev, { id, params: navParams }];
    });
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, []);

  const goHome = useCallback(() => {
    setStack([{ id: 'home', params: {} }]);
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, []);

  // Bottom nav taps reset the stack (main screens)
  const onNav = useCallback((id) => navTo(id), [navTo]);

  // Sign out: drop the session AND reset nav, so signing back in starts at home
  // rather than resuming on the profile screen.
  const doSignOut = useCallback(() => {
    setSignOutOpen(false);
    setModalOpen(false);
    setStack([{ id: 'home', params: {} }]);
    setUser(null);
    setAuthView('signin');
    clearSession();
  }, []);

  const doSignIn = useCallback(
    (u) => {
      setUser(u);
      setStack([{ id: 'home', params: {} }]);
    },
    []
  );

  // An expired or revoked token makes every screen fail the same way. Drop the
  // session so the app returns to sign-in by itself instead of showing errors.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setAuthView('signin');
      setStack([{ id: 'home', params: {} }]);
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  function renderScreen() {
    // `user` goes to every screen: several need the signed-in teacher's name to
    // label what they send (homework messages, reflections).
    const p = { navTo, goBack, goHome, showToast, params, user };
    switch (current) {
      case 'home':
        return <HomeScreen {...p} />;
      case 'lessons':
        return <LessonsScreen {...p} />;
      case 'lesson-detail':
        return <LessonDetailScreen {...p} />;
      case 'active':
        return <ActiveScreen {...p} />;
      case 'attendance':
        return <AttendanceScreen {...p} />;
      case 'checklist':
        return <ChecklistScreen {...p} />;
      case 'evidence':
        return <EvidenceScreen {...p} />;
      case 'homework-create':
        return <HomeworkCreateScreen {...p} />;
      case 'learners':
        return <LearnersScreen {...p} />;
      case 'rubric':
        return <RubricScreen {...p} />;
      case 'homework':
        return <HomeworkScreen {...p} />;
      case 'hw-review':
        return <HwReviewScreen {...p} />;
      case 'ai':
        return <AIScreen {...p} />;
      case 'profile':
        return <ProfileScreen {...p} onSignOut={() => setSignOutOpen(true)} />;
      case 'sync':
        return <SyncScreen {...p} openRemoveModal={() => setModalOpen(true)} />;
      case 'assessment':
        return <AssessmentScreen {...p} />;
      case 'project':
        return <ProjectScreen {...p} />;
      case 'reflection':
        return <ReflectionScreen {...p} />;
      case 'notifications':
        return <NotificationsScreen {...p} />;
      default:
        return <HomeScreen {...p} />;
    }
  }

  // Phone frame sizing: mimic 390x800 device, but adapt to screen.
  const narrow = width <= 480;
  const deviceW = narrow ? width : 390;
  const deviceH = narrow ? height : Math.min(height - 40, 800);

  return (
    <View style={[styles.stage, { backgroundColor: colors.page }]}>
      <View
        style={[
          styles.device,
          narrow
            ? { width: deviceW, height: deviceH, borderRadius: 0, padding: 0 }
            : { width: deviceW, height: deviceH },
        ]}
      >
        <View style={[styles.viewport, { backgroundColor: colors.bg, borderRadius: narrow ? 0 : 34 }]}>
          {/* Sign-in owns the full viewport so its hero can bleed to the edges;
              signed-in screens keep the shared padded scroll container. */}
          {restoring ? (
            <View style={{ flex: 1, backgroundColor: colors.bg }} />
          ) : user ? (
            // Mounted inside the signed-in branch so the class list is fetched
            // with a token, and thrown away on sign-out.
            <ClassProvider>
              <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 18, paddingTop: TOP_INSET + 10, paddingBottom: 92 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {renderScreen()}
              </ScrollView>
            </ClassProvider>
          ) : authView === 'forgot' ? (
            <ForgotPasswordScreen
              onDone={(identifier) => {
                setResetIdentifier(identifier);
                setAuthView('signin');
              }}
              onCancel={() => setAuthView('signin')}
              showToast={showToast}
              topInset={TOP_INSET}
            />
          ) : authView === 'activate' ? (
            <ActivateScreen
              onActivated={doSignIn}
              onCancel={() => setAuthView('signin')}
              showToast={showToast}
              topInset={TOP_INSET}
            />
          ) : (
            <SignInScreen
              onSignedIn={doSignIn}
              onForgotPassword={() => setAuthView('forgot')}
              onActivate={() => setAuthView('activate')}
              showToast={showToast}
              topInset={TOP_INSET}
              initialIdentifier={resetIdentifier}
            />
          )}

          <Toast message={toast.msg} visible={toast.visible} />

          {user && isMain ? <BottomNav current={current} onNavigate={onNav} /> : null}
        </View>
      </View>

      <ConfirmModal
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          showToast('Item removed from queue');
        }}
      />

      <ConfirmModal
        visible={signOutOpen}
        title="Sign out?"
        body="You will need to sign in again to access your lessons and learners."
        confirmLabel="Sign out"
        onCancel={() => setSignOutOpen(false)}
        onConfirm={doSignOut}
      />

      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <ThemeProvider>
      {fontsLoaded ? <Shell /> : <View style={{ flex: 1, backgroundColor: '#0b1220' }} />}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  device: {
    backgroundColor: '#0b1220',
    borderRadius: 44,
    padding: 11,
    shadowColor: '#0f172a',
    shadowOpacity: 0.32,
    shadowRadius: 70,
    shadowOffset: { width: 0, height: 30 },
    elevation: 12,
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
});
