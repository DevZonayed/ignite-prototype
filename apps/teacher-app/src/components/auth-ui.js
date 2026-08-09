import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { useTheme } from '../ThemeContext';
import { fonts, igniteGrad } from '../theme';
import { withAlpha } from './ui';

// Hero gradient stops per mode. The dark pair is the documented hero1/hero2 in
// apps/DESIGN_SYSTEM.md; the light pair runs ink -> brand-700 so the panel reads
// as brand in both themes and its foreground can stay light-on-dark either way.
const HERO_STOPS = {
  light: ['#172554', '#1D4ED8'],
  dark: ['#05070d', '#0e1e42'],
};

// The hero is dark in both themes, so its foreground colours are fixed rather
// than pulled from the theme tokens.
export const ON_HERO = '#FFFFFF';
export const ON_HERO_MUTED = 'rgba(255,255,255,0.72)';
export const ON_HERO_LINE = 'rgba(255,255,255,0.18)';
export const ON_HERO_FILL = 'rgba(255,255,255,0.10)';

const HERO_MAX_HEIGHT = 268;
const SHEET_OVERLAP = 28;

/** Four-point spark: the "ignite" mark, drawn symmetrically about (12,12). */
export function SparkMark({ size = 26, color = '#3b1d05' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3C12.8 8.4 15.6 11.2 21 12C15.6 12.8 12.8 15.6 12 21C11.2 15.6 8.4 12.8 3 12C8.4 11.2 11.2 8.4 12 3Z"
        fill={color}
      />
    </Svg>
  );
}

function HeroBackdrop({ mode, brand }) {
  const stops = HERO_STOPS[mode] || HERO_STOPS.light;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id="authHero" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={stops[0]} />
          <Stop offset="1" stopColor={stops[1]} />
        </LinearGradient>
        <RadialGradient id="authOrbWarm" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={igniteGrad[0]} stopOpacity="0.55" />
          <Stop offset="0.55" stopColor={igniteGrad[1]} stopOpacity="0.22" />
          <Stop offset="1" stopColor={igniteGrad[1]} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="authOrbCool" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={brand} stopOpacity="0.45" />
          <Stop offset="1" stopColor={brand} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#authHero)" />
      <Circle cx="88%" cy="14%" r={165} fill="url(#authOrbWarm)" />
      <Circle cx="2%" cy="92%" r={185} fill="url(#authOrbCool)" />
    </Svg>
  );
}

/**
 * Shared auth chrome: a fixed gradient hero with the form sheet filling the rest
 * of the viewport. The sheet must NOT live inside a ScrollView with flex:1, because it
 * collapses to content height and leaves bare page background beneath it.
 */
export function AuthLayout({ topInset = 0, hero, children, scrollRef }) {
  const { colors, mode } = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  // Cap the hero on short devices so the form keeps the room it needs.
  const heroHeight = Math.max(
    190,
    Math.min(HERO_MAX_HEIGHT, Math.round(windowHeight * 0.32)),
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1 }}>
        <View style={{ height: heroHeight + topInset, paddingTop: topInset }}>
          <HeroBackdrop mode={mode} brand={colors.brand} />
          <View
            style={{
              flex: 1,
              paddingHorizontal: 24,
              paddingTop: 14,
              paddingBottom: SHEET_OVERLAP + 14,
            }}
          >
            {hero}
          </View>
        </View>

        <View
          style={{
            flex: 1,
            marginTop: -SHEET_OVERLAP,
            backgroundColor: colors.surface,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 26,
              // clear the iOS home indicator
              paddingBottom: Platform.OS === 'ios' ? 54 : 30,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/** Sheet heading + supporting line. */
export function AuthHeading({ title, sub }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontFamily: fonts.display,
          fontWeight: '900',
          fontSize: 28,
          lineHeight: 34,
          color: colors.text,
        }}
      >
        {title}
      </Text>
      {sub ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            lineHeight: 20,
            color: colors.textMuted,
            marginTop: 5,
          }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Labelled text field with a leading icon and a brand focus ring.
 *
 * Do NOT put elevation / shadow* on the input row: on Android (RN 0.81) it stops
 * the TextInput inside from taking focus at all. Focus is signalled with the
 * border, fill and label colour instead.
 */
export function AuthField({
  label,
  icon,
  focused,
  onFocus,
  onBlur,
  trailing,
  inputRef,
  hint,
  hintTone = 'muted',
  ...inputProps
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 7 }}>
      <Text
        style={{
          fontFamily: fonts.body700,
          fontWeight: '700',
          fontSize: 11,
          letterSpacing: 0.7,
          textTransform: 'uppercase',
          color: focused ? colors.brand : colors.textSubtle,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 13,
          borderWidth: 1.5,
          borderColor: focused ? colors.brand : colors.border,
          borderRadius: 14,
          backgroundColor: focused ? colors.surface : colors.surface2,
        }}
      >
        {icon
          ? React.cloneElement(icon, {
              size: 18,
              color: focused ? colors.brand : colors.textSubtle,
            })
          : null}
        <TextInput
          ref={inputRef}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholderTextColor={colors.textSubtle}
          style={{
            flex: 1,
            fontFamily: fonts.body,
            fontSize: 15.5,
            paddingVertical: 15,
            color: colors.text,
          }}
          {...inputProps}
        />
        {trailing}
      </View>
      {hint ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 12.5,
            lineHeight: 18,
            color: hintTone === 'warning' ? colors.danger : colors.textSubtle,
          }}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Primary sheet CTA with a busy state. */
export function AuthButton({ label, onPress, busy, disabled, style }) {
  const { colors } = useTheme();
  const inert = busy || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={inert}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inert, busy: !!busy }}
      style={({ pressed }) => [
        {
          minHeight: 54,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.brand,
          opacity: inert ? 0.6 : 1,
          transform: [{ scale: pressed && !inert ? 0.985 : 1 }],
          shadowColor: colors.brand,
          shadowOpacity: 0.34,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 5,
        },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          style={{
            fontFamily: fonts.display800,
            fontWeight: '800',
            fontSize: 16,
            letterSpacing: 0.2,
            color: colors.onBrand,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/** Inline message strip. tone: 'error' | 'info' */
export function AuthNotice({ tone = 'error', children, style }) {
  const { colors } = useTheme();
  const accent = tone === 'error' ? colors.danger : colors.brand;
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: 9,
          alignItems: 'flex-start',
          padding: 12,
          borderRadius: 12,
          backgroundColor: withAlpha(accent, 0.1),
          borderWidth: 1,
          borderColor: withAlpha(accent, 0.32),
        },
        style,
      ]}
    >
      <View
        style={{ width: 5, alignSelf: 'stretch', borderRadius: 3, backgroundColor: accent }}
      />
      <Text
        style={{
          flex: 1,
          fontFamily: fonts.body500,
          fontSize: 12.5,
          lineHeight: 18,
          color: accent,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

/** Small text button used for secondary actions under the CTA. */
export function AuthTextLink({ label, onPress, disabled, align = 'center', style }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={style}>
      <Text
        style={{
          fontFamily: fonts.body700,
          fontWeight: '700',
          fontSize: 13.5,
          textAlign: align,
          color: disabled ? colors.textSubtle : colors.brand,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
