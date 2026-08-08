import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, EmptyState } from '../components/ui';

const ITEMS = [];

export default function NotificationsScreen({ goBack }) {
  const { colors } = useTheme();
  return (
    <View>
      <SubHead title="Notifications" onBack={goBack} />
      {ITEMS.length === 0 ? (
        <EmptyState title="No notifications" sub="Updates about homework, badges and curriculum will appear here." />
      ) : null}
      {ITEMS.map(([emoji, title, meta], i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>{emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>{title}</Text>
            <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>{meta}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
