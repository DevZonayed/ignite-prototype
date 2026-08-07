import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { AppHead, Card, Button, Pill, SectionTitle } from '../components/ui';
import { IconChevronDown, IconBook, IconUser, IconHomework, IconSync, IconCheck } from '../components/Icon';

export default function HomeScreen({ navTo, showToast }) {
  const { colors } = useTheme();

  const stats = [
    ['0/32', 'attendance'],
    ['4', 'homework'],
    ['88%', 'coverage'],
  ];

  const quick = [
    ['lessons', 'Lessons', IconBook],
    ['learners', 'Learners', IconUser],
    ['homework', 'Homework', IconHomework],
    ['sync', 'Sync queue', IconSync],
  ];

  return (
    <View>
      <AppHead name="Hi, Mrs. Okafor" role="JSS 1 · Digital Innovation" onBell={() => navTo('notifications')} />

      {/* class selector */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderWidth: 1.5,
          borderColor: colors.border,
          borderRadius: 12,
          paddingVertical: 11,
          paddingHorizontal: 13,
          backgroundColor: colors.surface,
          marginBottom: 14,
        }}
      >
        <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text, flex: 1 }}>
          👥 JSS 1 · Digital Innovation
        </Text>
        <IconChevronDown size={16} color={colors.textMuted} />
      </View>

      {/* current lesson card */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.brand, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            Current lesson
          </Text>
          <View style={{ marginLeft: 'auto' }}>
            <Pill kind="sync" icon={<IconCheck size={11} strokeWidth={3} />}>
              Synced
            </Pill>
          </View>
        </View>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 19, color: colors.text, marginTop: 4, marginBottom: 2 }}>
          Build a Smart Reading Lamp
        </Text>
        <Text style={{ fontSize: 12.5, color: colors.textMuted }}>Unit 5 · Mission 5 · Robotics</Text>
        <View style={{ height: 7, backgroundColor: colors.surface2, borderRadius: 99, marginVertical: 12, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: '56%', backgroundColor: colors.brand, borderRadius: 99 }} />
        </View>
        <Button variant="ignite" onPress={() => navTo('lesson-detail')}>
          ▶ Open lesson
        </Button>
      </Card>

      {/* stats */}
      <View style={{ flexDirection: 'row', gap: 9, marginBottom: 14 }}>
        {stats.map(([n, l]) => (
          <View key={l} style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 8, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 19, color: colors.text }}>{n}</Text>
            <Text style={{ fontSize: 10.5, color: colors.textMuted, lineHeight: 12, marginTop: 2, textAlign: 'center' }}>{l}</Text>
          </View>
        ))}
      </View>

      <SectionTitle>Quick actions</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {quick.map(([id, label, IconComp]) => (
          <Pressable
            key={id}
            onPress={() => navTo(id)}
            style={{
              width: '48%',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 9,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              backgroundColor: colors.surface,
            }}
          >
            <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
              <IconComp size={17} color={colors.brand} />
            </View>
            <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
