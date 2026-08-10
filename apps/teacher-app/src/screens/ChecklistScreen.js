import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, EmptyState, withAlpha } from '../components/ui';
import { AsyncList, ErrorState } from '../components/ScreenState';
import { IconCheck } from '../components/Icon';
import { useApi, useAction } from '../api/useApi';
import { getLessonActivities, toggleLessonActivity } from '../api/endpoints';

export default function ChecklistScreen({ goBack, params }) {
  const { colors } = useTheme();
  const lessonId = params?.lessonId ?? null;

  const state = useApi(() => getLessonActivities(lessonId), [lessonId], {
    skip: !lessonId,
    initial: [],
  });

  // Each tap writes straight through — there is no separate save step, so the
  // checklist cannot be left half-recorded if the screen is closed.
  const toggle = useAction(async (activityId) => {
    await toggleLessonActivity(lessonId, activityId);
    await state.reload();
  });

  if (!lessonId) {
    return (
      <View>
        <SubHead title="Activities" onBack={goBack} />
        <EmptyState
          title="No lesson selected"
          sub="Open the activities from a running lesson to check them off."
        />
      </View>
    );
  }

  const rows = state.data ?? [];
  const done = rows.filter((a) => a.completed).length;

  return (
    <View>
      <SubHead title="Activities" onBack={goBack} />

      {rows.length ? (
        <Text style={{ fontSize: 12, color: colors.textSubtle, marginBottom: 12 }}>
          {done}/{rows.length} complete · tap to toggle
        </Text>
      ) : null}

      {toggle.error ? <ErrorState error={toggle.error} /> : null}

      <AsyncList
        state={state}
        loadingLabel="Loading activities…"
        empty={{
          title: 'No activities for this lesson',
          sub: 'Lesson activities will appear here as they are added to the plan.',
        }}
      >
        {(activities) =>
          [...activities]
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
            .map((a, i) => (
              <Pressable key={a.id} disabled={toggle.pending} onPress={() => toggle.run(a.id)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  {a.completed ? (
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: withAlpha(colors.success, 0.16), alignItems: 'center', justifyContent: 'center' }}>
                      <IconCheck size={13} color={colors.success} strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.textSubtle }}>{i + 1}</Text>
                    </View>
                  )}
                  <Text style={{ flex: 1, fontSize: 13, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>
                    {a.title}
                  </Text>
                </Card>
              </Pressable>
            ))
        }
      </AsyncList>
    </View>
  );
}
