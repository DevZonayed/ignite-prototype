import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, PageSub } from '../components/ui';
import { AsyncList } from '../components/ScreenState';
import { IconChevronRight } from '../components/Icon';
import { useClasses } from '../context/ClassContext';
import { useApi } from '../api/useApi';
import { listLearners } from '../api/endpoints';
import { displayName, initialsOf } from '../lib/user';

export default function LearnersScreen({ navTo }) {
  const { colors } = useTheme();
  const { activeClass, activeClassId } = useClasses();

  const state = useApi(() => listLearners(activeClassId), [activeClassId], {
    skip: !activeClassId,
    initial: [],
  });

  return (
    <View>
      <PageTitle>Learners</PageTitle>
      <PageSub>
        {activeClass ? `${activeClass.name} — tap a learner to rate the LQS rubric` : 'Tap a learner to rate the LQS rubric'}
      </PageSub>

      <AsyncList
        state={state}
        loadingLabel="Loading roster…"
        empty={{
          title: 'No learners yet',
          sub: activeClassId
            ? 'This class has no learners on its roster.'
            : 'You are not assigned to a class yet.',
        }}
      >
        {(learners) =>
          learners.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => navTo('rubric', { learnerId: l.id })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 11, marginBottom: 9 }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: l.avatarBg || colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 12, color: l.avatarColor || colors.brand }}>
                  {initialsOf(l)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>
                  {displayName(l)}
                </Text>
                <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>Tap to rate LQS rubric</Text>
              </View>
              <IconChevronRight size={16} color={colors.textSubtle} />
            </Pressable>
          ))
        }
      </AsyncList>
    </View>
  );
}
