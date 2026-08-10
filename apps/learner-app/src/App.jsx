import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// RN's SafeAreaView handles the iOS notch but ignores the Android status bar,
// so reserve its height explicitly on Android; iOS/web get it from SafeAreaView.
const ANDROID_TOP = Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 0;
// The auth hero runs full-bleed under the status bar, so it needs the real
// inset on every platform — ANDROID_TOP is 0 on iOS and would let the notch
// clip the badge row. Mirrors teacher-app's TOP_INSET.
const AUTH_TOP_INSET =
  Platform.OS === 'android'
    ? RNStatusBar.currentHeight || 24
    : Platform.OS === 'ios'
      ? 44
      : 0;
import { useFonts } from 'expo-font';
import {
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

import { useTheme } from './ThemeContext';

import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import { SkelScreen } from './components/Skeleton';

import Auth from './screens/Auth';
import { loadSession, clearSession, setUnauthorizedHandler } from './api/auth';

import Home from './screens/Home';
import Portfolio from './screens/Portfolio';
import Projects from './screens/Projects';
import Skills from './screens/Skills';
import Profile from './screens/Profile';
import ItemDetail from './screens/ItemDetail';
import Certificate from './screens/Certificate';

const MAINS = ['home', 'portfolio', 'projects', 'skills', 'profile'];

export default function AppRoot() {
  const { colors, mode, ready } = useTheme();

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Router: stack of screen ids. Item detail carries the project's id — an
  // index would point at the wrong project as soon as a list reorders.
  const [stack, setStack] = useState(['home']);
  const [itemId, setItemId] = useState(null);
  const scrollRef = useRef(null);

  // Session: null while the stored one is still being read, so the sign-in
  // screen never flashes in front of a learner who is already signed in.
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSession()
      .then((stored) => { if (!cancelled) setUser(stored); })
      .finally(() => { if (!cancelled) setSessionChecked(true); });
    return () => { cancelled = true; };
  }, []);

  // Toast
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 1900);
  }, []);

  const scrollTop = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  };

  const navTo = useCallback((id, isMain) => {
    setStack((prev) => {
      if (isMain) return [id];
      if (prev[prev.length - 1] !== id) return [...prev, id];
      return prev;
    });
    scrollTop();
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    scrollTop();
  }, []);

  const openItem = useCallback((id) => {
    setItemId(id);
    navTo('item', false);
  }, [navTo]);

  // An expired or revoked token makes every screen fail the same way. Drop the
  // session so the app returns to sign-in by itself instead of showing errors.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStack(['home']);
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  if (!fontsLoaded || !ready || !sessionChecked) {
    // A skeleton of the home screen rather than a spinner: the boot wait is
    // short, and showing the shape it is about to become makes the app feel
    // like it is already there. No fonts are needed to draw bars, which
    // matters because this branch also covers the font load.
    return (
      <View style={[styles.boot, { backgroundColor: colors.bg }]}>
        <SkelScreen />
      </View>
    );
  }

  if (!user) {
    // No top padding here on purpose: the auth hero is a full-bleed gradient
    // that runs under the status bar, so it takes the inset itself and keeps
    // its own content clear of it. Status-bar text is always light because the
    // hero is dark in both themes.
    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <StatusBar style="light" />
        <Auth onSignedIn={setUser} topInset={AUTH_TOP_INSET} />
      </View>
    );
  }

  const current = stack[stack.length - 1];
  const isMainScreen = MAINS.indexOf(current) >= 0;

  let screen = null;
  switch (current) {
    case 'home':
      screen = <Home user={user} onOpenItem={openItem} />;
      break;
    case 'portfolio':
      screen = <Portfolio user={user} onOpenItem={openItem} />;
      break;
    case 'projects':
      screen = <Projects user={user} onOpenItem={openItem} />;
      break;
    case 'skills':
      screen = <Skills user={user} />;
      break;
    case 'profile':
      screen = <Profile user={user} onOpenCertificate={() => navTo('certificate', false)} />;
      break;
    case 'item':
      screen = <ItemDetail projectId={itemId} onBack={goBack} onToast={showToast} />;
      break;
    case 'certificate':
      screen = <Certificate user={user} onBack={goBack} onToast={showToast} />;
      break;
    default:
      screen = <Home user={user} onOpenItem={openItem} />;
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg, paddingTop: ANDROID_TOP }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />

      <View style={styles.screens}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {screen}
        </ScrollView>

        <Toast message={toast.message} visible={toast.visible} />

        {isMainScreen && (
          <BottomNav current={current} onNavigate={(id) => navTo(id, true)} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 28,
  },
  screens: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 92,
  },
});
