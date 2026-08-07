import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../ThemeContext';
import { fonts, igniteGrad } from '../theme';
import { IconChevronLeft, IconBell } from './Icon';

// A full-bleed ignite gradient background (135deg amber -> orange) using SVG.
export function IgniteGradient({ style, radius = 0, children }) {
  return (
    <View style={[{ overflow: 'hidden', borderRadius: radius }, style]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="igniteGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={igniteGrad[0]} />
            <Stop offset="1" stopColor={igniteGrad[1]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#igniteGrad)" />
      </Svg>
      {children}
    </View>
  );
}

// Generic 135deg two-stop gradient box
export function GradientBox({ colors, style, radius = 0, children, idSuffix = 'g' }) {
  const id = 'grad_' + idSuffix + '_' + colors.join('_').replace(/[^a-z0-9]/gi, '');
  return (
    <View style={[{ overflow: 'hidden', borderRadius: radius }, style]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}

export function Card({ style, children }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 15,
          marginBottom: 13,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Button variants: ignite | primary | ghost
export function Button({ variant = 'primary', onPress, children, style, textStyle }) {
  const { colors } = useTheme();
  const content = (
    <Text
      style={[
        {
          fontFamily: fonts.display,
          fontWeight: '900',
          fontSize: 15,
          color: variant === 'ignite' ? '#3b1d05' : variant === 'primary' ? '#fff' : colors.brand,
        },
        textStyle,
      ]}
    >
      {children}
    </Text>
  );

  if (variant === 'ignite') {
    return (
      <Pressable onPress={onPress} style={[styles.btnWrap, style]}>
        <IgniteGradient radius={12} style={StyleSheet.absoluteFill} />
        <View style={styles.btnInner}>{content}</View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.btnWrap,
        {
          backgroundColor: variant === 'primary' ? colors.brand : colors.surface,
          borderWidth: variant === 'ghost' ? 1.5 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.btnInner}>{content}</View>
    </Pressable>
  );
}

export function Pill({ kind = 'sync', icon, children }) {
  const { colors } = useTheme();
  let bg, color;
  if (kind === 'sync') {
    color = colors.success;
    bg = withAlpha(colors.success, 0.14);
  } else {
    color = colors.brand;
    bg = colors.brandSoft;
  }
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {icon ? React.cloneElement(icon, { color }) : null}
      <Text style={{ color, fontSize: 10.5, fontFamily: fonts.body700, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}

export function SectionTitle({ children, style }) {
  const { colors } = useTheme();
  return (
    <Text style={[{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 14, color: colors.text, marginTop: 6, marginHorizontal: 2, marginBottom: 10 }, style]}>
      {children}
    </Text>
  );
}

export function PageTitle({ children }) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 22, color: colors.text, paddingTop: 2, paddingBottom: 4 }}>
      {children}
    </Text>
  );
}

export function PageSub({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[{ fontSize: 12.5, color: colors.textMuted, marginBottom: 14 }, style]}>{children}</Text>;
}

// Sub-screen header with back button
export function SubHead({ title, onBack, right }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4, paddingBottom: 14 }}>
      <Pressable
        onPress={onBack}
        style={{ width: 38, height: 38, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
      >
        <IconChevronLeft size={18} color={colors.text} />
      </Pressable>
      <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 19, color: colors.text }}>{title}</Text>
      {right ? <View style={{ marginLeft: 'auto' }}>{right}</View> : null}
    </View>
  );
}

// App header (home / profile)
export function AppHead({ name, role, onBell }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingTop: 6, paddingBottom: 14 }}>
      <IgniteGradient radius={22} style={{ width: 44, height: 44 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 16, color: '#3b1d05' }}>FO</Text>
        </View>
      </IgniteGradient>
      <View>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 20, color: colors.text }}>{name}</Text>
        <Text style={{ fontSize: 12, color: colors.textSubtle }}>{role}</Text>
      </View>
      {onBell ? (
        <Pressable
          onPress={onBell}
          style={{ marginLeft: 'auto', width: 38, height: 38, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <IconBell size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

// hint text
export function Hint({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[{ fontSize: 12.5, color: colors.textSubtle, textAlign: 'center', marginTop: 14 }, style]}>{children}</Text>;
}

// Convert #RRGGBB + alpha to rgba() string (approximation of color-mix)
export function withAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  btnWrap: {
    borderRadius: 12,
    width: '100%',
    overflow: 'hidden',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
});
