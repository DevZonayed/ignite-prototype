import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { IconHome, IconBook, IconUser, IconHomework, IconAI, IconProfile } from './Icon';
import { withAlpha } from './ui';

const TABS = [
  ['home', 'Home', IconHome],
  ['lessons', 'Lessons', IconBook],
  ['learners', 'Learners', IconUser],
  ['homework', 'Homework', IconHomework],
  ['ai', 'AI', IconAI],
  ['profile', 'Profile', IconProfile],
];

export default function BottomNav({ current, onNavigate }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 11,
        left: 11,
        right: 11,
        height: 64,
        backgroundColor: withAlpha(colors.surface, 0.96),
        borderWidth: 1,
        borderColor: colors.border,
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
      }}
    >
      {TABS.map(([id, label, IconComp]) => {
        const active = current === id;
        const color = active ? colors.brand : colors.textSubtle;
        return (
          <Pressable key={id} onPress={() => onNavigate(id)} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
            <IconComp size={22} color={color} />
            <Text style={{ fontSize: 9.5, fontFamily: fonts.body700, fontWeight: '700', color }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
