// Theme tokens ported from design/pages/teacher.html :root and [data-theme="dark"]

export const light = {
  brand: '#2563EB',
  brand700: '#1D4ED8',
  brandSoft: '#EFF6FF',
  ink: '#172554',
  onBrand: '#ffffff',
  ignite: '#F97316',
  igniteAmber: '#FBBF24',
  violet: '#7C3AED',
  teal: '#14B8A6',
  green: '#16A34A',
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
};

export const dark = {
  brand: '#3B82F6',
  brand700: '#2563EB',
  brandSoft: '#17233f',
  ink: '#c9d6f0',
  onBrand: '#ffffff',
  ignite: '#F97316',
  igniteAmber: '#FBBF24',
  violet: '#7C3AED',
  teal: '#14B8A6',
  green: '#16A34A',
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
};

// Ignite gradient stops (135deg #FBBF24 -> #F97316)
export const igniteGrad = ['#FBBF24', '#F97316'];

export const fonts = {
  // display / headings = Nunito ; ui / body = Inter
  display: 'Nunito_900Black',
  display800: 'Nunito_800ExtraBold',
  display700: 'Nunito_700Bold',
  body: 'Inter_400Regular',
  body500: 'Inter_500Medium',
  body600: 'Inter_600SemiBold',
  body700: 'Inter_700Bold',
};

export function getTheme(mode) {
  return mode === 'dark' ? dark : light;
}
