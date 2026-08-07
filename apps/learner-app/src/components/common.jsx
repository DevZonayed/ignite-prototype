import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { ChevronLeftIcon } from './Icon';

// .card
export function Card({ style, children, ...rest }) {
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
      {...rest}
    >
      {children}
    </View>
  );
}

// .pagetitle + .pagesub
export function PageTitle({ title, sub }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={[base.pagetitle, { color: colors.text }]}>{title}</Text>
      {sub ? <Text style={[base.pagesub, { color: colors.textMuted }]}>{sub}</Text> : null}
    </View>
  );
}

// .sectitle
export function SecTitle({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[base.sectitle, { color: colors.text }, style]}>{children}</Text>;
}

// .subhead with back button
export function SubHead({ title, onBack }) {
  const { colors } = useTheme();
  return (
    <View style={base.subhead}>
      <Pressable
        onPress={onBack}
        style={[base.back, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <ChevronLeftIcon size={18} color={colors.text} strokeWidth={2} />
      </Pressable>
      <Text style={[base.subheadTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

export const base = StyleSheet.create({
  pagetitle: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 22,
    paddingVertical: 2,
  },
  pagesub: {
    fontSize: 12.5,
    marginBottom: 14,
  },
  sectitle: {
    fontFamily: fonts.displayBold,
    fontWeight: '800',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 10,
    marginHorizontal: 2,
  },
  subhead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 14,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subheadTitle: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 19,
  },
});
