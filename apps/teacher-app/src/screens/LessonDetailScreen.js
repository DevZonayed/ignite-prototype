import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, EmptyState, Hint, SectionTitle, Card } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { useClasses } from '../context/ClassContext';
import { useApi, useAction } from '../api/useApi';
import { getLesson, getCurrentSession, startSession } from '../api/endpoints';

/** Renders a lesson-plan field only when the server actually holds one. */
function Field({ label, value }) {
  const { colors } = useTheme();
  if (!value) return null;
  const text = Array.isArray(value) ? value.filter(Boolean).join('\n• ') : String(value);
  if (!text.trim()) return null;
  return (
    <View style={{ marginBottom: 13 }}>
      <Text style={{ fontSize: 11.5, fontFamily: fonts.body700, fontWeight: '700', color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>
        {Array.isArray(value) ? `• ${text}` : text}
      </Text>
    </View>
  );
}

export default function LessonDetailScreen({ navTo, goBack, showToast, params }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();
  const lessonId = params?.lessonId ?? null;

  const lesson = useApi(() => getLesson(lessonId), [lessonId], { skip: !lessonId });
  const session = useApi(() => getCurrentSession(activeClassId), [activeClassId], {
    skip: !activeClassId,
  });

  // Starting a lesson twice would open a second session for the same class, so
  // an already-running session takes you straight to it instead.
  const begin = useAction(async () => {
    if (session.data?.id) return session.data;
    return startSession({ lessonId, classId: activeClassId });
  });

  async function onStart() {
    try {
      const s = await begin.run();
      showToast(session.data?.id ? 'Resuming lesson' : 'Lesson started');
      navTo('active', { sessionId: s?.id, lessonId });
    } catch {
      // Surfaced inline below.
    }
  }

  if (!lessonId) {
    return (
      <View>
        <SubHead title="Lesson" onBack={goBack} />
        <EmptyState
          title="No lesson selected"
          sub="Open a lesson from the Lessons tab to see its plan, media and documents here."
        />
      </View>
    );
  }

  if (lesson.loading && !lesson.data) {
    return (
      <View>
        <SubHead title="Lesson" onBack={goBack} />
        <Loading label="Loading lesson plan…" />
      </View>
    );
  }

  if (lesson.error && !lesson.data) {
    return (
      <View>
        <SubHead title="Lesson" onBack={goBack} />
        <ErrorState error={lesson.error} onRetry={lesson.reload} />
      </View>
    );
  }

  const l = lesson.data ?? {};
  const running = !!session.data?.id;

  return (
    <View>
      <SubHead title={l.title || 'Lesson'} onBack={goBack} />

      <Card style={{ marginBottom: 13 }}>
        <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 16, color: colors.text, marginBottom: 6 }}>
          {l.title}
        </Text>
        <Text style={{ fontSize: 12.5, color: colors.textMuted }}>
          {[l.gradeLevel, l.term && `Term ${l.term}`, l.week && `Week ${l.week}`, l.durationMinutes && `${l.durationMinutes} min`]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </Card>

      <SectionTitle>Lesson plan</SectionTitle>
      <Field label="Theme" value={l.theme} />
      <Field label="Big idea" value={l.bigIdea} />
      <Field label="Essential question" value={l.essentialQuestion} />
      <Field label="Real-world problem" value={l.realWorldProblem} />
      <Field label="Learning outcomes" value={l.learningOutcomes} />
      <Field label="Success criteria" value={l.successCriteria} />
      <Field label="Key vocabulary" value={l.keyVocabulary} />
      <Field label="Teacher materials" value={l.teacherMaterials} />
      <Field label="Learner materials" value={l.learnerMaterials} />
      <Field label="Teaching points" value={l.teachingPoints} />
      <Field label="Home challenge" value={l.homeChallenge} />
      <Field label="Coaching notes" value={l.coachingNotes} />

      {begin.error ? <ErrorState error={begin.error} /> : null}

      <Button variant="ghost" onPress={() => navTo('ai', { lessonId })} style={{ marginBottom: 11 }}>
        ✨ Ask the AI assistant
      </Button>
      <Button
        variant="ignite"
        disabled={begin.pending || !activeClassId}
        onPress={onStart}
        style={{ opacity: begin.pending || !activeClassId ? 0.5 : 1 }}
      >
        {begin.pending ? 'Starting…' : running ? '▶ Resume lesson' : '▶ Start lesson'}
      </Button>
      {!activeClassId ? <Hint>Start becomes available once you are assigned a class.</Hint> : null}
    </View>
  );
}
