import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Tabs from '../components/Tabs';
import { children } from '../data';
import { useTheme } from '../ThemeContext';

const TABS = [
  { key: 'att', label: 'Attendance' },
  { key: 'pf', label: 'Portfolio' },
  { key: 'sk', label: 'Skills' },
];

const PORTFOLIO = [
  { top: '#2563EB', label: '.sb3', title: 'Maze Game', isText: true },
  { top: '#16A34A', label: '.py', title: 'Number Guesser', isText: true },
  { top: '#E11D48', label: '◎', title: 'Line Robot', isText: false },
  { top: '#7C3AED', label: '✎', title: 'Digital Hero', isText: false },
];

const SKILLS = [
  { color: '#2563EB', name: 'Coding', lv: 'SECURE' },
  { color: '#7C3AED', name: 'Creativity', lv: 'SECURE' },
  { color: '#16A34A', name: 'Problem Solving', lv: 'SECURE' },
  { color: '#E11D48', name: 'Robotics', lv: 'DEVELOPING' },
  { color: '#F59E0B', name: 'Attendance', lv: 'SECURE' },
];

// CHILD screen — title from active child, Attendance/Portfolio/Skills tabs.
export default function Child({ current }) {
  const { colors, fonts } = useTheme();
  const [tab, setTab] = useState('att');
  const c = children[current];

  return (
    <View>
      <Text style={[styles.pagetitle, { color: colors.text, fontFamily: fonts.display }]}>
        {c.short}
      </Text>
      <Text style={[styles.pagesub, { color: colors.textMuted, fontFamily: fonts.ui }]}>
        {(c.n.split(' · ')[1] || 'JSS 1') + ' · Digital Innovation'}
      </Text>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'att' && (
        <View>
          <View
            style={[
              styles.card,
              styles.rowBetween,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardStrong, { color: colors.text, fontFamily: fonts.ui700 }]}>
              This term
            </Text>
            <Text style={[styles.cardStrong, { color: colors.success, fontFamily: fonts.ui700 }]}>
              92% present
            </Text>
          </View>
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardMuted, { color: colors.textMuted, fontFamily: fonts.ui }]}>
              Mon ✓ · Tue ✓ · Wed ✓ · Thu — absent · Fri ✓
            </Text>
          </View>
        </View>
      )}

      {tab === 'pf' && (
        <View style={styles.pgrid}>
          {PORTFOLIO.map((p) => (
            <View
              key={p.title}
              style={[styles.pcard, { borderColor: colors.border }]}
            >
              <View style={[styles.pcardTop, { backgroundColor: p.top }]}>
                <Text
                  style={
                    p.isText
                      ? { color: '#fff', fontWeight: '700', fontSize: 11 }
                      : { color: '#fff', fontSize: 20 }
                  }
                >
                  {p.label}
                </Text>
              </View>
              <View style={styles.pcardMeta}>
                <Text style={[styles.pt, { color: colors.text, fontFamily: fonts.ui700 }]}>
                  {p.title}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {tab === 'sk' && (
        <View>
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {SKILLS.map((s) => (
              <View key={s.name} style={styles.dimrow}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text style={[styles.dimName, { color: colors.text, fontFamily: fonts.ui }]}>
                  {s.name}
                </Text>
                <Text style={[styles.lv, { color: colors.textSubtle, fontFamily: fonts.ui700 }]}>
                  {s.lv}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.lqs, { color: colors.textSubtle, fontFamily: fonts.ui }]}>
            Overall Learner Quality Score:{' '}
            <Text style={{ color: colors.brand, fontWeight: '700' }}>78/100</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pagetitle: { fontSize: 22, fontWeight: '900', paddingVertical: 2 },
  pagesub: { fontSize: 12.5, marginBottom: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 11,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStrong: { fontSize: 13, fontWeight: '700' },
  cardMuted: { fontSize: 13 },
  pgrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pcard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    width: '48%',
    flexGrow: 1,
  },
  pcardTop: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pcardMeta: { paddingVertical: 8, paddingHorizontal: 9 },
  pt: { fontSize: 12, fontWeight: '700' },
  dimrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 7,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dimName: { fontSize: 12.5 },
  lv: { marginLeft: 'auto', fontSize: 10, fontWeight: '700' },
  lqs: { fontSize: 11.5, textAlign: 'center' },
});
