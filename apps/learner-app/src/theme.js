// Design tokens translated from design/pages/learner.html :root and [data-theme="dark"]
// Includes helpers for color-mix() equivalents used in the source.

export const light = {
  brand: '#2563EB',
  brand700: '#1D4ED8',
  brandSoft: '#EFF6FF',
  ink: '#172554',
  ignite: '#F97316',
  igniteAmber: '#FBBF24',
  violet: '#7C3AED',
  teal: '#14B8A6',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  page: '#e8edf5',
  bg: '#F5F7FB',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  border: '#E6EBF2',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#64748B',
  // derived (color-mix in the source)
  // .streak: color-mix(in srgb, ignite 12%, transparent) on #F5F7FB bg
  streakBg: 'rgba(249,115,22,0.12)',
  streakBorder: 'rgba(249,115,22,0.30)',
  // radar fill: color-mix(in srgb, brand 18%, transparent)
  radarFill: 'rgba(37,99,235,0.18)',
};

export const dark = {
  brand: '#3B82F6',
  brand700: '#2563EB',
  brandSoft: '#17233f',
  ink: '#172554',
  ignite: '#F97316',
  igniteAmber: '#FBBF24',
  violet: '#7C3AED',
  teal: '#14B8A6',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  page: '#05070d',
  bg: '#0b1220',
  surface: '#111a2e',
  surface2: '#16223b',
  border: '#243049',
  text: '#E7EDF7',
  textMuted: '#A6B4CE',
  textSubtle: '#7686A5',
  streakBg: 'rgba(249,115,22,0.12)',
  streakBorder: 'rgba(249,115,22,0.30)',
  radarFill: 'rgba(59,130,246,0.18)',
};

// Shared constant colors (not theme-dependent)
export const igniteGradient = ['#FBBF24', '#F97316']; // 135deg

export const fonts = {
  display: 'Nunito_900Black',
  displayBold: 'Nunito_800ExtraBold',
  displayHeavy: 'Nunito_700Bold',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
};

export function getTheme(mode) {
  return mode === 'dark' ? dark : light;
}
