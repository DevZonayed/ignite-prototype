import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, Button, SectionTitle, EmptyState, withAlpha } from '../components/ui';
import { IconCheck } from '../components/Icon';
import { hwMedia } from '../data';

export default function HomeworkCreateScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  const [attached, setAttached] = useState({});
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');

  const count = Object.keys(attached).filter((k) => attached[k]).length;
  const canPublish = !!title.trim();

  return (
    <View>
      <SubHead title="Assign homework" onBack={goBack} />

      <Card>
        <SectionTitle style={{ margin: 0, marginBottom: 6 }}>Title</SectionTitle>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Type title"
          placeholderTextColor={colors.textSubtle}
          style={{ fontSize: 13, color: colors.text }}
        />
      </Card>

      <Card>
        <SectionTitle style={{ margin: 0, marginBottom: 6 }}>Instructions</SectionTitle>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          multiline
          placeholder="Type instructions"
          placeholderTextColor={colors.textSubtle}
          style={{ fontSize: 13, color: colors.text, minHeight: 52, textAlignVertical: 'top' }}
        />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 14, color: colors.text }}>Attach lesson media</Text>
          <View style={{ backgroundColor: colors.ignite, borderRadius: 20, paddingVertical: 2, paddingHorizontal: 8 }}>
            <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 10, color: '#fff' }}>helps parents</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 9 }}>
          Tap any lesson video or GIF to attach it. Parents see it as a "how to help at home" guide.{' '}
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', color: colors.brand }}>{count} attached</Text>
        </Text>

        {hwMedia.length === 0 ? (
          <EmptyState title="No lesson media available" sub="Media attached to the current lesson will be listed here." style={{ marginBottom: 0 }} />
        ) : null}

        <View style={{ gap: 7 }}>
          {hwMedia.map((m, i) => {
            const on = !!attached[i];
            return (
              <Pressable
                key={i}
                onPress={() => setAttached((prev) => ({ ...prev, [i]: !prev[i] }))}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  borderWidth: 1.5,
                  borderColor: on ? colors.ignite : colors.border,
                  backgroundColor: on ? withAlpha(colors.ignite, 0.08) : colors.surface,
                  borderRadius: 11,
                  paddingVertical: 9,
                  paddingHorizontal: 11,
                }}
              >
                <View style={{ width: 30, height: 24, borderRadius: 6, backgroundColor: m[2], alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 8, fontFamily: fonts.body700, fontWeight: '800' }}>{m[1]}</Text>
                </View>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 12.5, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>{m[0]}</Text>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: on ? colors.ignite : colors.border, backgroundColor: on ? colors.ignite : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <IconCheck size={11} color="#fff" strokeWidth={3} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Button variant="primary" disabled={!canPublish} onPress={() => { showToast('Homework published'); setTimeout(goBack, 240); }} style={{ opacity: canPublish ? 1 : 0.5 }}>
        Publish homework
      </Button>
    </View>
  );
}
