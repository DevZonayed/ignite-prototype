import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, Button, SectionTitle, withAlpha } from '../components/ui';
import { IconShield } from '../components/Icon';

function Chip({ label, on, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1.5,
        borderColor: on ? colors.brand : colors.border,
        backgroundColor: on ? colors.brandSoft : 'transparent',
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: on ? colors.brand : colors.textMuted }}>{label}</Text>
    </Pressable>
  );
}

export default function ProjectScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  // chip2 toggles: default 'on' from source
  const [types, setTypes] = useState({ 0: true });
  const [tags, setTags] = useState({ 0: true, 1: true });

  const typeLabels = ['Scratch (.sb3)', 'Python (.py)', 'Robotics', 'Design'];
  const tagLabels = ['Amara Eze', 'Chidi Okonkwo', '+ Add'];

  return (
    <View>
      <SubHead title="Record project" onBack={goBack} />

      <Card>
        <SectionTitle style={{ margin: 0, marginBottom: 6 }}>Project title</SectionTitle>
        <Text style={{ fontSize: 13, color: colors.textMuted }}>Smart Reading Lamp — Mission 5</Text>
      </Card>

      <SectionTitle>Type</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {typeLabels.map((l, i) => (
          <Chip key={i} label={l} on={!!types[i]} onPress={() => setTypes((p) => ({ ...p, [i]: !p[i] }))} />
        ))}
      </View>

      <SectionTitle>Tag learners</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {tagLabels.map((l, i) => (
          <Chip key={i} label={l} on={!!tags[i]} onPress={() => setTags((p) => ({ ...p, [i]: !p[i] }))} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: withAlpha(colors.warning, 0.1), borderWidth: 1, borderColor: withAlpha(colors.warning, 0.34), borderRadius: 12, padding: 11, marginBottom: 12 }}>
        <IconShield size={16} color={colors.warning} />
        <Text style={{ fontSize: 12, color: colors.warning, fontFamily: fonts.body600, fontWeight: '600', flex: 1 }}>
          Saved to each learner's lifelong portfolio.
        </Text>
      </View>

      <Button variant="primary" onPress={() => { showToast('Project saved to portfolios'); setTimeout(goBack, 240); }}>
        Save to portfolio
      </Button>
    </View>
  );
}
