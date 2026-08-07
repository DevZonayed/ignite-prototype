// Theme tokens ported from design/pages/parent.html :root and [data-theme="dark"]

const staticTokens = {
  brandGrad: '#F97316', // ignite grad fallback base (RN has no CSS gradient in solids)
  igniteAmber: '#FBBF24',
  ignite: '#F97316',
  violet: '#7C3AED',
  teal: '#14B8A6',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  ink: '#172554',
};

export const light = {
  ...staticTokens,
  brand: '#2563EB',
  brand700: '#1D4ED8',
  brandSoft: '#EFF6FF',
  page: '#e8edf5',
  bg: '#F5F7FB',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  border: '#E6EBF2',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#64748B',
};

export const dark = {
  ...staticTokens,
  brand: '#3B82F6',
  brand700: '#2563EB',
  brandSoft: '#17233f',
  page: '#05070d',
  bg: '#0b1220',
  surface: '#111a2e',
  surface2: '#16223b',
  border: '#243049',
  text: '#E7EDF7',
  textMuted: '#A6B4CE',
  textSubtle: '#7686A5',
};

export const fonts = {
  display: 'Nunito_900Black',
  display800: 'Nunito_800ExtraBold',
  display700: 'Nunito_700Bold',
  ui: 'Inter_400Regular',
  ui500: 'Inter_500Medium',
  ui600: 'Inter_600SemiBold',
  ui700: 'Inter_700Bold',
};

export function getTheme(mode) {
  return mode === 'dark' ? dark : light;
}
