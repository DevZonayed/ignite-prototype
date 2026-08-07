import React, { useCallback, useRef, useState } from 'react';
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
import { mains } from './data';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';
import Home from './screens/Home';
import Child from './screens/Child';
import Homework from './screens/Homework';
import Report from './screens/Report';
import Profile from './screens/Profile';

function Shell() {
  const { colors } = useTheme();

  // Stack router (mirrors the vanilla-JS stack in parent.html).
  const [stack, setStack] = useState(['home']);
  const [current, setCurrent] = useState(0); // active child index
  const scrollRef = useRef(null);

  const active = stack[stack.length - 1];
  const showBottomNav = mains.indexOf(active) >= 0;

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

  const renderScreen = () => {
    switch (active) {
      case 'home':
        return (
          <Home current={current} onSelectChild={setCurrent} onNavigate={(id) => navTo(id, true)} />
        );
      case 'child':
        return <Child current={current} />;
      case 'homework':
        return <Homework showToast={showToast} />;
      case 'report':
        return <Report current={current} />;
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg, paddingTop: ANDROID_TOP }]}>
      <StatusBar
        style={colors.text === '#0F172A' ? 'dark' : 'light'}
        translucent
        backgroundColor="transparent"
      />

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
