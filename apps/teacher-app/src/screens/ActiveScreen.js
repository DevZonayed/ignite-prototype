import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, Pill, Hint, withAlpha } from '../components/ui';
import {
  IconUser,
  IconChecklist,
  IconCamera,
  IconGem,
  IconPencil,
  IconBox,
  IconSyncPartial,
} from '../components/Icon';

function fmt(t) {
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return m + ':' + s;
}

export default function ActiveScreen({ navTo, goBack }) {
  const { colors } = useTheme();
  const [t, setT] = useState(765); // 12:45
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setT((v) => v + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const tiles = [
    { screen: 'attendance', name: 'Attendance', count: '18/32', countColor: colors.success, Icon: IconUser, bg: '#dcfce7', ic: '#16a34a' },
    { screen: 'checklist', name: 'Activities', count: '2/4', countColor: colors.brand, Icon: IconChecklist, bg: colors.brandSoft, ic: colors.brand },
    { screen: 'evidence', name: 'Add evidence', count: 'camera', countColor: colors.textSubtle, Icon: IconCamera, bg: colors.brandSoft, ic: colors.brand },
    { screen: 'rubric', name: 'LQS rubric', count: '0/32', countColor: colors.violet, Icon: IconGem, bg: '#f5f3ff', ic: colors.violet },
    { screen: 'homework-create', name: 'Homework', count: 'set', countColor: colors.textSubtle, Icon: IconPencil, bg: withAlpha(colors.ignite, 0.15), ic: colors.ignite },
    { screen: 'assessment', name: 'Assess', count: '0/32', countColor: colors.textSubtle, Icon: IconChecklist, bg: '#e0e7ff', ic: '#4f46e5' },
    { screen: 'project', name: 'Record project', count: '.sb3', countColor: colors.textSubtle, Icon: IconBox, bg: '#ccfbf1', ic: colors.teal },
  ];

  return (
    <View>
      <SubHead
        title="Smart Reading Lamp"
        onBack={goBack}
        right={<Pill kind="syncing" icon={<IconSyncPartial size={11} strokeWidth={3} />}>Syncing…</Pill>}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 13 }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 30, color: colors.brand, letterSpacing: 1 }}>{fmt(t)}</Text>
        <Pressable
          onPress={() => {
            const next = !paused;
            setPaused(next);
            pausedRef.current = next;
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.ignite, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 11 }}
        >
          <Text style={{ color: colors.ignite, fontFamily: fonts.body700, fontWeight: '700', fontSize: 13 }}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 14 }}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.screen}
            onPress={() => navTo(tile.screen)}
            style={{ width: '47%', flexGrow: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, paddingVertical: 14, paddingHorizontal: 12 }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: tile.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>
              <tile.Icon size={20} color={tile.ic} />
            </View>
            <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>{tile.name}</Text>
            <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', marginTop: 2, color: tile.countColor }}>{tile.count}</Text>
          </Pressable>
        ))}
      </View>

      <Button variant="primary" onPress={() => navTo('reflection')}>
        ✓ Complete lesson
      </Button>
      <Hint>Mark attendance first</Hint>
    </View>
  );
}
