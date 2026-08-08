import React, { useState, useCallback, useRef } from 'react';
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

const MAINS = ['home', 'lessons', 'learners', 'homework', 'ai', 'profile'];

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

  const [stack, setStack] = useState(['home']);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [user, setUser] = useState(null);
  const toastTimer = useRef(null);
  const scrollRef = useRef(null);

  const current = stack[stack.length - 1];
  const isMain = MAINS.indexOf(current) >= 0;

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 1900);
  }, []);

  const navTo = useCallback((id, asMain) => {
    const main = asMain !== undefined ? asMain : MAINS.indexOf(id) >= 0;
    setStack((prev) => {
      if (main) return [id];
      if (prev[prev.length - 1] === id) return prev;
      return [...prev, id];
    });
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, []);

  const goHome = useCallback(() => {
    setStack(['home']);
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, []);

  // Bottom nav taps reset the stack (main screens)
  const onNav = useCallback((id) => navTo(id, true), [navTo]);

  // Sign out: drop the session AND reset nav, so signing back in starts at home
  // rather than resuming on the profile screen.
  const doSignOut = useCallback(() => {
    setSignOutOpen(false);
    setModalOpen(false);
    setStack(['home']);
    setUser(null);
  }, []);

  const doSignIn = useCallback(
    (u) => {
      setUser(u);
      setStack(['home']);
    },
    []
  );

  function renderScreen() {
    const p = { navTo, goBack, goHome, showToast };
    switch (current) {
      case 'home':
        return <HomeScreen {...p} user={user} />;
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
        return <ProfileScreen {...p} user={user} onSignOut={() => setSignOutOpen(true)} />;
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
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 18, paddingTop: TOP_INSET + 10, paddingBottom: 92 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {user ? renderScreen() : <SignInScreen onSignedIn={doSignIn} showToast={showToast} />}
          </ScrollView>

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
