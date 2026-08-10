import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, EmptyState } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { useClasses } from '../context/ClassContext';
import { useApi, useAction } from '../api/useApi';
import { listDimensions, listScores, saveScoresBulk, listLearners } from '../api/endpoints';
import { displayName } from '../lib/user';

export default function RubricScreen({ goBack, showToast, navTo, params }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();
  const learnerId = params?.learnerId ?? null;

  const dims = useApi(() => listDimensions(), [], { initial: [] });
  const existing = useApi(() => listScores({ learnerId }), [learnerId], {
    skip: !learnerId,
    initial: [],
  });
  // Only to name the learner in the header and to find who comes next.
  const roster = useApi(() => listLearners(activeClassId), [activeClassId], {
    skip: !activeClassId,
    initial: [],
  });

  // dimensionId -> 1..4
  const [scores, setScores] = useState({});
  useEffect(() => {
    const seeded = {};
    for (const s of existing.data ?? []) {
      const id = s.dimensionId ?? s.dimension?.id;
      if (id) seeded[id] = Number(s.score);
    }
    setScores(seeded);
  }, [existing.data]);

  const dimensions = dims.data ?? [];
  const learners = roster.data ?? [];
  const learner = learners.find((l) => l.id === learnerId) ?? null;
  const index = learners.findIndex((l) => l.id === learnerId);
  const next = index >= 0 && index < learners.length - 1 ? learners[index + 1] : null;

  const save = useAction(() =>
    saveScoresBulk({
      entries: [
        {
          learnerId,
          scores: dimensions
            .filter((d) => scores[d.id])
            .map((d) => ({ dimensionId: d.id, score: scores[d.id] })),
        },
      ],
    }),
  );

  async function onSave() {
    try {
      await save.run();
      showToast('Rubric saved');
      // Straight on to the next learner keeps a whole-class rating pass moving;
      // at the end of the roster there is nowhere to go but back.
      if (next) navTo('rubric', { learnerId: next.id });
      else setTimeout(goBack, 240);
    } catch {
      // Rendered inline.
    }
  }

  if (!learnerId) {
    return (
      <View>
        <SubHead title="LQS rubric" onBack={goBack} />
        <EmptyState title="No learner selected" sub="Open a learner from the Learners tab to rate them." />
      </View>
    );
  }

  if (dims.loading && !dimensions.length) {
    return (
      <View>
        <SubHead title="LQS rubric" onBack={goBack} />
        <Loading label="Loading rubric…" variant="bars" />
      </View>
    );
  }

  if (dims.error && !dimensions.length) {
    return (
      <View>
        <SubHead title="LQS rubric" onBack={goBack} />
        <ErrorState error={dims.error} onRetry={dims.reload} />
      </View>
    );
  }

  const rated = dimensions.filter((d) => scores[d.id]).length;

  return (
    <View>
      <SubHead title={learner ? displayName(learner) : 'LQS rubric'} onBack={goBack} />

      {dimensions.length === 0 ? (
        <EmptyState
          title="No rubric dimensions yet"
          sub="The LQS rubric dimensions will appear here once they sync."
        />
      ) : (
        <Text style={{ fontSize: 12, color: colors.textSubtle, marginBottom: 14 }}>
          Rate 1-4 · {rated}/{dimensions.length} rated
        </Text>
      )}

      {save.error ? <ErrorState error={save.error} /> : null}

      {dimensions.map((d) => (
        <View key={d.id} style={{ marginBottom: 11 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: d.color || colors.brand }} />
            <Text style={{ fontSize: 13, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>{d.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4].map((n) => {
              const on = scores[d.id] === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setScores((prev) => ({ ...prev, [d.id]: n }))}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderWidth: 1.5, borderColor: on ? colors.brand : colors.border, borderRadius: 8, backgroundColor: on ? colors.brand : 'transparent' }}
                >
                  <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: on ? '#fff' : colors.textSubtle }}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Button
        variant="primary"
        disabled={rated === 0 || save.pending}
        onPress={onSave}
      >
        {save.pending ? 'Saving…' : next ? 'Save & next learner →' : 'Save'}
      </Button>
    </View>
  );
}
