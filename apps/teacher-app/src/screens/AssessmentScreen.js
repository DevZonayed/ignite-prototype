import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, PageSub, EmptyState } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { useClasses } from '../context/ClassContext';
import { useApi, useAction } from '../api/useApi';
import { listLearners, listAssessments, saveAssessmentsBulk, getCurrentSession } from '../api/endpoints';
import { displayName, initialsOf } from '../lib/user';

export default function AssessmentScreen({ goBack, showToast, params }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();

  const session = useApi(() => getCurrentSession(activeClassId), [activeClassId], {
    skip: !activeClassId || !!params?.sessionId,
  });
  const sessionId = params?.sessionId ?? session.data?.id ?? null;
  const lessonId = params?.lessonId ?? session.data?.lessonId ?? null;

  const roster = useApi(() => listLearners(activeClassId), [activeClassId], {
    skip: !activeClassId,
    initial: [],
  });
  const existing = useApi(() => listAssessments({ lessonSessionId: sessionId }), [sessionId], {
    skip: !sessionId,
    initial: [],
  });

  // learnerId -> 1..4. Anything already recorded for this session wins, so
  // reopening the screen does not silently re-score everyone at the default.
  const [scores, setScores] = useState({});
  useEffect(() => {
    const seeded = {};
    for (const a of existing.data ?? []) {
      const id = a.learnerId ?? a.learner?.id;
      if (id) seeded[id] = Number(a.score);
    }
    setScores(seeded);
  }, [existing.data]);

  const learners = roster.data ?? [];
  const scored = learners.filter((l) => scores[l.id] > 0).length;

  const save = useAction(() =>
    saveAssessmentsBulk({
      lessonId,
      lessonSessionId: sessionId,
      assessments: learners
        .filter((l) => scores[l.id] > 0)
        .map((l) => ({ learnerId: l.id, score: scores[l.id] })),
    }),
  );

  async function onSave() {
    try {
      await save.run();
      showToast('Assessments saved');
      setTimeout(goBack, 240);
    } catch {
      // Rendered inline.
    }
  }

  if (roster.loading && !learners.length) {
    return (
      <View>
        <SubHead title="Assess learners" onBack={goBack} />
        <Loading label="Loading roster…" />
      </View>
    );
  }

  if (!sessionId) {
    return (
      <View>
        <SubHead title="Assess learners" onBack={goBack} />
        <EmptyState
          title="No lesson in progress"
          sub="Assessments are recorded against a running lesson. Start one first."
        />
      </View>
    );
  }

  return (
    <View>
      <SubHead title="Assess learners" onBack={goBack} />
      <PageSub style={{ marginBottom: 10 }}>Quick outcome (1-4) per learner</PageSub>

      {roster.error ? <ErrorState error={roster.error} onRetry={roster.reload} /> : null}
      {save.error ? <ErrorState error={save.error} /> : null}

      {learners.length === 0 ? (
        <EmptyState title="No learners to assess" sub="This class has no learners on its roster." />
      ) : null}

      {learners.map((l) => (
        <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 9 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: l.avatarBg || colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 12, color: l.avatarColor || colors.brand }}>
              {initialsOf(l)}
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, flex: 1, color: colors.text }}>
            {displayName(l)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, flex: 1.1 }}>
            {[1, 2, 3, 4].map((n) => {
              const on = scores[l.id] === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setScores((prev) => ({ ...prev, [l.id]: n }))}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderWidth: 1.5, borderColor: on ? colors.brand : colors.border, borderRadius: 9, backgroundColor: on ? colors.brand : 'transparent' }}
                >
                  <Text style={{ fontSize: 13, fontFamily: fonts.display800, fontWeight: '800', color: on ? '#fff' : colors.textSubtle }}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12, marginHorizontal: -18, paddingHorizontal: 18, marginTop: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 15, color: colors.text }}>
          {scored} / {learners.length} assessed
        </Text>
        <View style={{ marginLeft: 'auto' }}>
          <Button
            variant="primary"
            disabled={scored === 0 || save.pending}
            onPress={onSave}
            style={{ width: 'auto', paddingHorizontal: 18 }}
          >
            {save.pending ? 'Saving…' : 'Save'}
          </Button>
        </View>
      </View>
    </View>
  );
}
