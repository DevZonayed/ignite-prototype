import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { AppHead, EmptyState, SectionTitle } from '../components/ui';
import { IconBook, IconUser, IconHomework, IconSync } from '../components/Icon';

// "Mrs. Ada Lovelace" -> "Ada" for the greeting
function firstName(name) {
  const clean = String(name || '')
    .replace(/^(mr|mrs|ms|miss|dr)\.?\s+/i, '')
    .trim();
  return clean.split(/\s+/)[0] || '';
}

export default function HomeScreen({ navTo, user }) {
  const { colors } = useTheme();

  const first = firstName(user && user.name);

  const quick = [
    ['lessons', 'Lessons', IconBook],
    ['learners', 'Learners', IconUser],
    ['homework', 'Homework', IconHomework],
    ['sync', 'Sync queue', IconSync],
  ];

  return (
    <View>
      <AppHead name={first ? 'Hi, ' + first : 'Welcome'} role={(user && user.role) || ''} onBell={() => navTo('notifications')} />

      {/* current lesson */}
      <EmptyState title="No lesson in progress" sub="Your current lesson from the curriculum will appear here." />

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
