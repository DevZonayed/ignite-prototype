import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, SectionTitle, PageSub, EmptyState } from '../components/ui';
import { ErrorState } from '../components/ScreenState';
import { useAction } from '../api/useApi';
import { completeSession } from '../api/endpoints';

// The server accepts exactly one sentiment, so these are a single choice rather
// than independent toggles.
const SENTIMENTS = [
  ['went_well', 'Went well'],
  ['okay', 'Okay'],
  ['tough', 'Tough'],
];

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

export default function ReflectionScreen({ goBack, showToast, goHome, params }) {
  const { colors } = useTheme();
  const sessionId = params?.sessionId ?? null;
  const elapsedSeconds = params?.elapsedSeconds ?? null;

  const [note, setNote] = useState('');
  const [sentiment, setSentiment] = useState('went_well');

  const finish = useAction(() =>
    completeSession(sessionId, {
      ...(note.trim() ? { reflection: note.trim() } : {}),
      ...(sentiment ? { sentiment } : {}),
      ...(elapsedSeconds != null ? { elapsedSeconds } : {}),
    }),
  );

  async function onComplete() {
    try {
      await finish.run();
      showToast('Lesson completed 🎉');
      setTimeout(goHome, 220);
    } catch {
      // Rendered inline; the note stays on screen.
    }
  }

  if (!sessionId) {
    return (
      <View>
        <SubHead title="Reflect" onBack={goBack} />
        <EmptyState
          title="No lesson to complete"
          sub="Open a running lesson and tap Complete lesson to write a reflection."
        />
      </View>
    );
  }

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
        {SENTIMENTS.map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            on={sentiment === value}
            onPress={() => setSentiment(value)}
          />
        ))}
      </View>

      {finish.error ? <ErrorState error={finish.error} /> : null}

      <Button variant="primary" disabled={finish.pending} onPress={onComplete}>
        {finish.pending ? 'Completing…' : 'Complete & finish'}
      </Button>
    </View>
  );
}
