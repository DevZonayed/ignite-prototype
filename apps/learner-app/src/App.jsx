import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
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

import { useTheme } from './ThemeContext';

import BottomNav from './components/BottomNav';
import Toast from './components/Toast';

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

  // Router: stack of screen ids. Item detail carries its project index.
  const [stack, setStack] = useState(['home']);
  const [itemIndex, setItemIndex] = useState(0);
  const scrollRef = useRef(null);

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

  const openItem = useCallback((i) => {
    setItemIndex(i);
    navTo('item', false);
  }, [navTo]);

  if (!fontsLoaded || !ready) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  const current = stack[stack.length - 1];
  const isMainScreen = MAINS.indexOf(current) >= 0;

  let screen = null;
  switch (current) {
    case 'home':
      screen = <Home onOpenItem={openItem} />;
      break;
    case 'portfolio':
      screen = <Portfolio onOpenItem={openItem} />;
      break;
    case 'projects':
      screen = <Projects onOpenItem={openItem} />;
      break;
    case 'skills':
      screen = <Skills />;
      break;
    case 'profile':
      screen = <Profile onOpenCertificate={() => navTo('certificate', false)} />;
      break;
    case 'item':
      screen = <ItemDetail index={itemIndex} onBack={goBack} onToast={showToast} />;
      break;
    case 'certificate':
      screen = <Certificate onBack={goBack} onToast={showToast} />;
      break;
    default:
      screen = <Home onOpenItem={openItem} />;
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
