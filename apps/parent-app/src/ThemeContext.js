import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, fonts } from './theme';

const STORAGE_KEY = 'ignite_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') setMode(saved);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const applyTheme = async (next) => {
    setMode(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () => applyTheme(mode === 'dark' ? 'light' : 'dark');

  const value = {
    mode,
    colors: getTheme(mode),
    fonts,
    toggleTheme,
    applyTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
