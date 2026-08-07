import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../ThemeContext';

const ITEMS = [
  { screen: 'home', label: 'Home', icon: 'home' },
  { screen: 'child', label: 'Child', icon: 'user' },
  { screen: 'homework', label: 'Homework', icon: 'pencil' },
  { screen: 'report', label: 'Report', icon: 'fileText' },
  { screen: 'profile', label: 'Profile', icon: 'gear' },
];

// Floating bottom nav — matches .bnav in parent.html.
export default function BottomNav({ active, onNavigate }) {
  const { colors, fonts } = useTheme();

  return (
    <View
      style={[
        styles.bnav,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {ITEMS.map((item) => {
        const on = item.screen === active;
        const tint = on ? colors.brand : colors.textSubtle;
        return (
          <Pressable
            key={item.screen}
            style={styles.item}
            onPress={() => onNavigate(item.screen)}
          >
            <Icon name={item.icon} size={22} color={tint} strokeWidth={2} />
            <Text
              style={[styles.label, { color: tint, fontFamily: fonts.ui700 }]}
            >
              {item.label}
            </Text>
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
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
});
