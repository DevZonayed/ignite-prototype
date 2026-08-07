import React from 'react';
import { ThemeProvider } from './src/ThemeContext';
import AppRoot from './src/App';

export default function App() {
  return (
    <ThemeProvider>
      <AppRoot />
    </ThemeProvider>
  );
}
