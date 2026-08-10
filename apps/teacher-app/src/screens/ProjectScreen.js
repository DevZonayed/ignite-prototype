import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, Button, SectionTitle, EmptyState, withAlpha, Hint } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { IconShield } from '../components/Icon';
import { useClasses } from '../context/ClassContext';
import { useApi, useAction } from '../api/useApi';
import { listLearners, createProject, getCurrentSession } from '../api/endpoints';
import { displayName, initialsOf } from '../lib/user';

// The server's fileType enum, with the labels this screen has always shown.
const TYPES = [
  ['scratch', 'Scratch (.sb3)'],
  ['python', 'Python (.py)'],
  ['robotics', 'Robotics'],
  ['design', 'Design'],
];

function Chip({ label, on, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1.5,
        borderColor: on ? colors.brand : colors.border,
        backgroundColor: on ? colors.brandSoft : 'transparent',
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: on ? colors.brand : colors.textMuted }}>{label}</Text>
    </Pressable>
  );
}

export default function ProjectScreen({ goBack, showToast, params }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();

  const session = useApi(() => getCurrentSession(activeClassId), [activeClassId], {
    skip: !activeClassId || !!params?.lessonId,
  });
  const lessonId = params?.lessonId ?? session.data?.lessonId ?? null;

  const roster = useApi(() => listLearners(activeClassId), [activeClassId], {
    skip: !activeClassId,
    initial: [],
  });

  const [title, setTitle] = useState('');
  // Single choice: a portfolio project has one fileType.
  const [type, setType] = useState('scratch');
  const [tagged, setTagged] = useState({});

  const learners = roster.data ?? [];
  const taggedIds = Object.keys(tagged).filter((id) => tagged[id]);
  const canSave = !!title.trim() && taggedIds.length > 0;

  // A portfolio project belongs to one learner, so tagging several learners
  // records the same piece of work into each of their portfolios.
  const save = useAction(() =>
    Promise.all(
      taggedIds.map((learnerId) =>
        createProject({
          title: title.trim(),
          fileType: type,
          learnerId,
          ...(lessonId ? { lessonId } : {}),
        }),
      ),
    ),
  );

  async function onSave() {
    try {
      await save.run();
      showToast(
        taggedIds.length > 1
          ? `Saved to ${taggedIds.length} portfolios`
          : 'Project saved to portfolio',
      );
      setTimeout(goBack, 240);
    } catch {
      // Rendered inline.
    }
  }

  return (
    <View>
      <SubHead title="Record project" onBack={goBack} />

      <Card>
        <SectionTitle style={{ margin: 0, marginBottom: 6 }}>Project title</SectionTitle>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Catch the Star"
          placeholderTextColor={colors.textSubtle}
          style={{ fontSize: 13, color: colors.text }}
        />
      </Card>

      <SectionTitle>Type</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {TYPES.map(([value, label]) => (
          <Chip key={value} label={label} on={type === value} onPress={() => setType(value)} />
        ))}
      </View>

      <SectionTitle>Tag learners</SectionTitle>
      {roster.loading ? <Loading label="Loading roster…" /> : null}
      {roster.error ? <ErrorState error={roster.error} onRetry={roster.reload} /> : null}
      {!roster.loading && learners.length === 0 ? (
        <EmptyState title="No learners to tag" sub="Your class roster will appear here." style={{ marginBottom: 14 }} />
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {learners.map((l) => (
          <Chip
            key={l.id}
            label={`${initialsOf(l)} · ${displayName(l)}`}
            on={!!tagged[l.id]}
            onPress={() => setTagged((p) => ({ ...p, [l.id]: !p[l.id] }))}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: withAlpha(colors.warning, 0.1), borderWidth: 1, borderColor: withAlpha(colors.warning, 0.34), borderRadius: 12, padding: 11, marginBottom: 12 }}>
        <IconShield size={16} color={colors.warning} />
        <Text style={{ fontSize: 12, color: colors.warning, fontFamily: fonts.body600, fontWeight: '600', flex: 1 }}>
          Saved to each learner's lifelong portfolio.
        </Text>
      </View>

      {save.error ? <ErrorState error={save.error} /> : null}

      <Button variant="primary" disabled={!canSave || save.pending} onPress={onSave}>
        {save.pending ? 'Saving…' : 'Save to portfolio'}
      </Button>
      {!canSave ? <Hint>Add a title and tag at least one learner.</Hint> : null}
    </View>
  );
}
