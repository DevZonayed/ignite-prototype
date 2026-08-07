import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, Button, SectionTitle, GradientBox } from '../components/ui';
import { IconImage, IconPlay } from '../components/Icon';
import { tThreadInit } from '../data';

export default function HwReviewScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  const [thread, setThread] = useState(tThreadInit);
  const [input, setInput] = useState('');

  function send() {
    const v = input.trim();
    if (!v) return;
    setThread((prev) => [...prev, ['me', 'You', v]]);
    setInput('');
    showToast('Reply sent to parent');
  }

  return (
    <View>
      <SubHead title="Chidi — Reading Lamp" onBack={goBack} />

      <Card>
        <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.brand, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Smart Reading Lamp · Mission 5
        </Text>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 19, color: colors.text, marginTop: 4, marginBottom: 2 }}>Chidi Okonkwo</Text>
        <Text style={{ fontSize: 12.5, color: colors.textMuted }}>Submitted today · JSS 1</Text>
      </Card>

      <SectionTitle>Submission</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 9, marginBottom: 12 }}>
        <Pressable onPress={() => showToast('Opening photo')} style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
          <GradientBox colors={['#0ea5e9', '#38bdf8']} idSuffix="hwphoto" style={{ height: 74, alignItems: 'center', justifyContent: 'center' }}>
            <IconImage size={24} color="#fff" strokeWidth={1.8} withCircle={false} />
          </GradientBox>
          <Text style={{ paddingVertical: 7, paddingHorizontal: 9, fontSize: 11.5, fontFamily: fonts.body700, fontWeight: '700', color: colors.text }}>lamp-photo.jpg</Text>
        </Pressable>
        <Pressable onPress={() => showToast('Playing submission video')} style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
          <GradientBox colors={['#1e293b', '#0f172a']} idSuffix="hwvid" style={{ height: 74, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.92)', alignItems: 'center', justifyContent: 'center' }}>
              <IconPlay size={13} />
            </View>
          </GradientBox>
          <Text style={{ paddingVertical: 7, paddingHorizontal: 9, fontSize: 11.5, fontFamily: fonts.body700, fontWeight: '700', color: colors.text }}>demo.mp4 · 1:12</Text>
        </Pressable>
      </View>

      <SectionTitle>Messages with the parent</SectionTitle>
      <View style={{ gap: 9, marginBottom: 11 }}>
        {thread.map((m, i) => {
          const mine = m[0] === 'me';
          return (
            <View key={i} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <Text style={{ fontSize: 10.5, color: colors.textSubtle, marginBottom: 3 }}>{m[1]}</Text>
              <View
                style={{
                  maxWidth: '82%',
                  paddingVertical: 9,
                  paddingHorizontal: 12,
                  borderRadius: 13,
                  backgroundColor: mine ? colors.brand : colors.surface2,
                  borderBottomRightRadius: mine ? 4 : 13,
                  borderBottomLeftRadius: mine ? 13 : 4,
                }}
              >
                <Text style={{ fontSize: 12.5, lineHeight: 19, color: mine ? '#fff' : colors.text }}>{m[2]}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          placeholder="Reply to the parent…"
          placeholderTextColor={colors.textSubtle}
          style={{ flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 11, paddingVertical: 11, paddingHorizontal: 13, fontSize: 13, backgroundColor: colors.surface, color: colors.text }}
        />
        <Button variant="primary" onPress={send} style={{ width: 'auto', paddingHorizontal: 15 }}>
          Send
        </Button>
      </View>

      <Button variant="primary" onPress={() => { showToast('Feedback published · parent notified'); setTimeout(goBack, 240); }}>
        Publish feedback
      </Button>
    </View>
  );
}
