import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { projects } from '../data';
import { PageTitle } from '../components/common';
import { StarIcon, ChevronRightIcon } from '../components/Icon';

export default function Projects({ onOpenItem }) {
  const { colors } = useTheme();
  return (
    <View>
      <PageTitle title="Projects" sub="Everything I've built" />
      {projects.map((p, i) => (
        <Pressable
          key={i}
          onPress={() => onOpenItem(i)}
          style={[styles.work, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.thumb, { backgroundColor: colors.brandSoft }]}>
            <StarIcon size={20} color={colors.brand} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.wt, { color: colors.text }]}>{p.t}</Text>
            <Text style={[styles.wm, { color: colors.textSubtle }]}>{p.f}</Text>
          </View>
          <ChevronRightIcon size={16} color={colors.textSubtle} strokeWidth={2} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  work: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 9,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wt: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
  },
  wm: {
    fontSize: 12,
  },
});
