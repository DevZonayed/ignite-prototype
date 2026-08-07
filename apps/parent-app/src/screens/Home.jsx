import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import ChildSwitcher from '../components/ChildSwitcher';
import { useTheme } from '../ThemeContext';

// HOME screen — child switcher, "This week" card, action rows.
export default function Home({ current, onSelectChild, onNavigate }) {
  const { colors, fonts } = useTheme();

  return (
    <View>
      <ChildSwitcher current={current} onSelect={onSelectChild} />

      {/* This week */}
      <View
        style={[
          styles.weekcard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.weekTitle, { color: colors.text, fontFamily: fonts.display }]}>
          This week
        </Text>
        <View style={styles.wk}>
          <WeekStat
            bg="#dcfce7"
            icon={<Icon name="check" size={19} color="#16a34a" strokeWidth={2} />}
            n="4/5"
            l="present"
          />
          <WeekStat
            bg={colors.brandSoft}
            icon={<Icon name="calendar" size={19} color={colors.brand} strokeWidth={2} />}
            n="2"
            l="projects"
          />
          <WeekStat
            bg="#f5f3ff"
            icon={<Icon name="file" size={19} color={colors.violet} strokeWidth={2} />}
            n="1"
            l="new report"
          />
        </View>
      </View>

      {/* Homework due */}
      <Pressable
        style={[styles.arow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onNavigate('homework')}
      >
        <View style={[styles.ai, { backgroundColor: 'rgba(249,115,22,0.14)' }]}>
          <Icon name="pencil" size={21} color={colors.ignite} strokeWidth={2} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.at, { color: colors.text, fontFamily: fonts.display800 }]}>
            Homework due
          </Text>
          <Text style={[styles.as, { color: colors.textMuted, fontFamily: fonts.ui }]}>
            Smart Reading Lamp · Fri 18 Jul
          </Text>
        </View>
        <View style={[styles.go, { backgroundColor: colors.ignite }]}>
          <Text style={[styles.goText, { color: '#3b1d05', fontFamily: fonts.ui700 }]}>
            Upload
          </Text>
        </View>
      </Pressable>

      {/* New message from teacher */}
      <Pressable
        style={[styles.arow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onNavigate('child')}
      >
        <View style={[styles.ai, { backgroundColor: '#ccfbf1' }]}>
          <Icon name="message" size={21} color={colors.teal} strokeWidth={2} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.at, { color: colors.text, fontFamily: fonts.display800 }]}>
            New message from teacher
          </Text>
          <Text style={[styles.as, { color: colors.textMuted, fontFamily: fonts.ui }]}>
            "Ask Amara to point to the button…"
          </Text>
        </View>
      </Pressable>

      {/* AI report ready */}
      <Pressable
        style={[styles.arow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onNavigate('report')}
      >
        <View style={[styles.ai, { backgroundColor: colors.brandSoft }]}>
          <Icon name="fileCheck" size={21} color={colors.brand} strokeWidth={2} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.at, { color: colors.text, fontFamily: fonts.display800 }]}>
            AI report ready
          </Text>
          <Text style={[styles.as, { color: colors.textMuted, fontFamily: fonts.ui }]}>
            Term 2 · Digital Innovation
          </Text>
        </View>
        <View style={[styles.go, { backgroundColor: colors.brand }]}>
          <Text style={[styles.goText, { color: '#fff', fontFamily: fonts.ui700 }]}>Read</Text>
        </View>
      </Pressable>
    </View>
  );
}

function WeekStat({ bg, icon, n, l }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.wkc}>
      <View style={[styles.ci, { backgroundColor: bg }]}>{icon}</View>
      <Text style={[styles.cn, { color: colors.text, fontFamily: fonts.display }]}>{n}</Text>
      <Text style={[styles.cl, { color: colors.textMuted, fontFamily: fonts.ui }]}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  weekcard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
  },
  weekTitle: { fontSize: 19, fontWeight: '900', marginBottom: 12 },
  wk: { flexDirection: 'row', gap: 8 },
  wkc: { flex: 1, alignItems: 'center' },
  ci: {
    width: 38,
    height: 38,
    borderRadius: 11,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cn: { fontSize: 17, fontWeight: '900' },
  cl: { fontSize: 10 },
  arow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 11,
  },
  ai: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  at: { fontSize: 15, fontWeight: '800' },
  as: { fontSize: 12, marginTop: 1 },
  go: {
    marginLeft: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 9,
  },
  goText: { fontSize: 12.5, fontWeight: '700' },
});
