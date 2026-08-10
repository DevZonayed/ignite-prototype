import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
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

import { ThemeProvider, useTheme } from './ThemeContext';
import { ChildProvider } from './context/ChildContext';
import { loadSession, clearSession, setUnauthorizedHandler } from './api/auth';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';
import Auth from './screens/Auth';
import Home from './screens/Home';
import Child from './screens/Child';
import Homework from './screens/Homework';
import Report from './screens/Report';
import Profile from './screens/Profile';

const MAINS = ['home', 'child', 'homework', 'report', 'profile'];

function Shell() {
  const { colors } = useTheme();

  // Stack router (mirrors the vanilla-JS stack in parent.html).
  const [stack, setStack] = useState(['home']);
  const scrollRef = useRef(null);

  // Session: null while the stored one is still being read, so the sign-in
  // screen never flashes in front of a parent who is already signed in.
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSession()
      .then((stored) => { if (!cancelled) setUser(stored); })
      .finally(() => { if (!cancelled) setSessionChecked(true); });
    return () => { cancelled = true; };
  }, []);

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

  const active = stack[stack.length - 1];
  const showBottomNav = MAINS.indexOf(active) >= 0;

  const scrollTop = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  };

  const navTo = useCallback((id, isMain = true) => {
    setStack((prev) => {
      if (isMain) return [id];
      if (prev[prev.length - 1] === id) return prev;
      return [...prev, id];
    });
    scrollTop();
  }, []);

  // Toast state
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef(null);
  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 1900);
  }, []);

  const doSignOut = useCallback(() => {
    setStack(['home']);
    setUser(null);
    clearSession();
  }, []);

  const renderScreen = () => {
    switch (active) {
      case 'home':
        return <Home onNavigate={(id) => navTo(id, true)} />;
      case 'child':
        return <Child />;
      case 'homework':
        return <Homework user={user} showToast={showToast} />;
      case 'report':
        return <Report />;
      case 'profile':
        return <Profile user={user} onSignOut={doSignOut} />;
      default:
        return null;
    }
  };

  if (!sessionChecked) {
    return <View style={[styles.root, { backgroundColor: colors.bg }]} />;
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

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg, paddingTop: ANDROID_TOP }]}>
      <StatusBar
        style={colors.text === '#0F172A' ? 'dark' : 'light'}
        translucent
        backgroundColor="transparent"
      />

      {/* Mounted inside the signed-in branch so the child list is fetched with
          a token, and thrown away on sign-out. */}
      <ChildProvider>
        <View style={styles.screens}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderScreen()}
          </ScrollView>

          <Toast message={toast.message} visible={toast.visible} />

          {showBottomNav && (
            <BottomNav active={active} onNavigate={(id) => navTo(id, true)} />
          )}
        </View>
      </ChildProvider>
    </SafeAreaView>
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

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0b1220' }} />;
  }

  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screens: { flex: 1, position: 'relative' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 92,
  },
});
