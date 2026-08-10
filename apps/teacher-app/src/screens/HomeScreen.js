import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { AppHead, EmptyState, SectionTitle, Card, Button } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { firstName, roleLabel } from '../lib/user';
import { IconBook, IconUser, IconHomework, IconSync } from '../components/Icon';
import { useClasses } from '../context/ClassContext';
import { useApi } from '../api/useApi';
import { getCurrentSession, getLesson } from '../api/endpoints';

export default function HomeScreen({ navTo, user }) {
  const { colors } = useTheme();
  const first = firstName(user);
  const { activeClass, activeClassId, loading: classesLoading, error: classesError } = useClasses();

  const session = useApi(() => getCurrentSession(activeClassId), [activeClassId], {
    skip: !activeClassId,
  });
  const lessonId = session.data?.lessonId ?? null;
  const lesson = useApi(() => getLesson(lessonId), [lessonId], { skip: !lessonId });

  const quick = [
    ['lessons', 'Lessons', IconBook],
    ['learners', 'Learners', IconUser],
    ['homework', 'Homework', IconHomework],
    ['sync', 'Sync queue', IconSync],
  ];

  function renderCurrent() {
    if (classesError) return <ErrorState error={classesError} />;
    if (classesLoading || session.loading) return <Loading label="Checking for a lesson…" variant="tiles" />;
    if (!activeClassId) {
      return (
        <EmptyState
          title="No class assigned"
          sub="Once a school adds you to a class, your lessons and learners appear here."
        />
      );
    }
    if (!session.data) {
      return (
        <EmptyState
          title="No lesson in progress"
          sub={`Start a lesson from the Lessons tab to begin teaching ${activeClass?.name ?? 'your class'}.`}
        />
      );
    }
    return (
      <Card>
        <Text style={{ fontSize: 11.5, fontFamily: fonts.body700, fontWeight: '700', color: colors.brand, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}>
          Lesson in progress
        </Text>
        <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 16, color: colors.text, marginBottom: 3 }}>
          {lesson.data?.title ?? 'Lesson'}
        </Text>
        <Text style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 12 }}>
          {activeClass?.name}
        </Text>
        <Button
          variant="ignite"
          onPress={() => navTo('active', { sessionId: session.data.id, lessonId })}
        >
          ▶ Resume lesson
        </Button>
      </Card>
    );
  }

  return (
    <View>
      <AppHead name={first ? 'Hi, ' + first : 'Welcome'} role={roleLabel(user)} onBell={() => navTo('notifications')} />

      {renderCurrent()}

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
