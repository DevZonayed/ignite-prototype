import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, SectionTitle, PageSub } from '../components/ui';

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

export default function ReflectionScreen({ goBack, showToast, goHome }) {
  const { colors } = useTheme();
  const [note, setNote] = useState('');
  // chip2 independent toggle; 'Went well' default on
  const [chips, setChips] = useState({ 0: true });
  const labels = ['Went well', 'Okay', 'Tough'];

  return (
    <View>
      <SubHead title="Reflect" onBack={goBack} />
      <PageSub style={{ marginBottom: 10 }}>A quick note before you finish</PageSub>

      <TextInput
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Type your reflection"
        placeholderTextColor={colors.textSubtle}
        style={{ minHeight: 110, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 13, color: colors.text, backgroundColor: colors.surface, marginBottom: 12, textAlignVertical: 'top' }}
      />

      <SectionTitle>How did it go?</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {labels.map((l, i) => (
          <Chip key={i} label={l} on={!!chips[i]} onPress={() => setChips((p) => ({ ...p, [i]: !p[i] }))} />
        ))}
      </View>

      <Button variant="primary" onPress={() => { showToast('Lesson completed 🎉'); setTimeout(goHome, 220); }}>
        Complete & finish
      </Button>
    </View>
  );
}
