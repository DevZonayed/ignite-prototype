import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { HomeIcon, PortfolioIcon, StarIcon, SkillsIcon, ProfileIcon } from './Icon';

const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'portfolio', label: 'Portfolio', Icon: PortfolioIcon },
  { key: 'projects', label: 'Projects', Icon: StarIcon },
  { key: 'skills', label: 'Skills', Icon: SkillsIcon },
  { key: 'profile', label: 'Profile', Icon: ProfileIcon },
];

export default function BottomNav({ current, onNavigate }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.bnav,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {TABS.map(({ key, label, Icon }) => {
        const active = current === key;
        const color = active ? colors.brand : colors.textSubtle;
        return (
          <Pressable key={key} style={styles.tab} onPress={() => onNavigate(key)}>
            <Icon size={22} color={color} strokeWidth={2} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bnav: {
    position: 'absolute',
    bottom: 11,
    left: 11,
    right: 11,
    height: 64,
    borderWidth: 1,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.uiBold,
  },
});
