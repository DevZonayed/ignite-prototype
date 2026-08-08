import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, PageSub, EmptyState } from '../components/ui';
import { IconChevronRight } from '../components/Icon';
import { lr } from '../data';

export default function LearnersScreen({ navTo }) {
  const { colors } = useTheme();
  return (
    <View>
      <PageTitle>Learners</PageTitle>
      <PageSub>Tap a learner to rate the LQS rubric</PageSub>
      {lr.length === 0 ? (
        <EmptyState title="No learners yet" sub="Your class roster will appear here once it syncs." />
      ) : null}
      {lr.map((l, i) => (
        <Pressable
          key={i}
          onPress={() => navTo('rubric')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 11, marginBottom: 9 }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: l[2], alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 12, color: l[3] }}>{l[1]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>{l[0]}</Text>
            <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>Tap to rate LQS rubric</Text>
          </View>
          <IconChevronRight size={16} color={colors.textSubtle} />
        </Pressable>
      ))}
    </View>
  );
}
