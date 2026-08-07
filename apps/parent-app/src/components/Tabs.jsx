import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../ThemeContext';

// Underline tabs — matches .tabs/.tab in parent.html.
export default function Tabs({ tabs, active, onChange }) {
  const { colors, fonts } = useTheme();

  return (
    <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[
              styles.tab,
              on && { borderBottomColor: colors.brand },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: on ? colors.brand : colors.textSubtle, fontFamily: fonts.ui700 },
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabText: { fontSize: 13, fontWeight: '700' },
});
