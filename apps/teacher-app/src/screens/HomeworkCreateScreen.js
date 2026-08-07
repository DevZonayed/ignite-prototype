import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, Button, SectionTitle, withAlpha } from '../components/ui';
import { IconCheck } from '../components/Icon';
import { hwMedia } from '../data';

export default function HomeworkCreateScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  const [attached, setAttached] = useState({});

  const count = Object.keys(attached).filter((k) => attached[k]).length;

  return (
    <View>
      <SubHead title="Assign homework" onBack={goBack} />

      <Card>
        <SectionTitle style={{ margin: 0, marginBottom: 6 }}>Title</SectionTitle>
        <Text style={{ fontSize: 13, color: colors.textMuted }}>Rebuild your Smart Reading Lamp</Text>
      </Card>

      <Card>
        <SectionTitle style={{ margin: 0, marginBottom: 6 }}>Instructions</SectionTitle>
        <Text style={{ fontSize: 13, color: colors.textMuted }}>
          Rebuild the lamp from your LG-305 manual, test it 5×, and film a 60–90s demo explaining the input, brain and output.
        </Text>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 14, color: colors.text }}>Attach lesson media</Text>
          <View style={{ backgroundColor: colors.ignite, borderRadius: 20, paddingVertical: 2, paddingHorizontal: 8 }}>
            <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 10, color: '#fff' }}>helps parents</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 9 }}>
          Tap any lesson video or GIF to attach it — parents see it as a "how to help at home" guide.{' '}
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', color: colors.brand }}>{count} attached</Text>
        </Text>

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

      <Card style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <SectionTitle style={{ margin: 0 }}>Due date</SectionTitle>
        <Text style={{ fontSize: 13, fontFamily: fonts.body700, fontWeight: '700', color: colors.text }}>Fri 18 Jul</Text>
      </Card>

      <Button variant="primary" onPress={() => { showToast('Homework published · parents notified'); setTimeout(goBack, 240); }}>
        Publish homework
      </Button>
    </View>
  );
}
