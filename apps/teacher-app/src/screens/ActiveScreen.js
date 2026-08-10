import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, Hint, EmptyState, withAlpha } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import {
  IconUser,
  IconChecklist,
  IconCamera,
  IconGem,
  IconPencil,
  IconBox,
} from '../components/Icon';
import { useClasses } from '../context/ClassContext';
import { useApi } from '../api/useApi';
import {
  getCurrentSession,
  getSessionAttendance,
  getLessonActivities,
  listEvidence,
  updateSession,
} from '../api/endpoints';

function fmt(t) {
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return m + ':' + s;
}

export default function ActiveScreen({ navTo, goBack, params }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();

  // Prefer the id we were navigated with, but fall back to whatever is running
  // so the screen still works when opened cold from the bottom nav.
  const current = useApi(() => getCurrentSession(activeClassId), [activeClassId], {
    skip: !activeClassId || !!params?.sessionId,
  });
  const sessionId = params?.sessionId ?? current.data?.id ?? null;
  const lessonId = params?.lessonId ?? current.data?.lessonId ?? null;
  const startedElapsed = current.data?.elapsedSeconds ?? 0;

  const attendance = useApi(() => getSessionAttendance(sessionId), [sessionId], {
    skip: !sessionId,
    initial: [],
  });
  const activities = useApi(() => getLessonActivities(lessonId), [lessonId], {
    skip: !lessonId,
    initial: [],
  });
  // Evidence is filtered by lesson and class — the server has no session filter.
  const evidence = useApi(
    () => listEvidence({ lessonId, classId: activeClassId }),
    [lessonId, activeClassId],
    { skip: !lessonId || !activeClassId, initial: [] },
  );

  // The clock resumes from what the server already counted, so backgrounding
  // the app or reopening the screen does not restart the lesson at 00:00.
  const [t, setT] = useState(0);
  useEffect(() => setT(startedElapsed), [startedElapsed]);

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const elapsedRef = useRef(0);
  elapsedRef.current = t;

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setT((v) => v + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Checkpoint the clock so a crash or a swipe-away does not lose the lesson's
  // elapsed time. Every 30s is often enough to be useful and rare enough not to
  // chatter at the server.
  useEffect(() => {
    if (!sessionId) return undefined;
    const id = setInterval(() => {
      updateSession(sessionId, { elapsedSeconds: elapsedRef.current }).catch(() => {
        // Offline or briefly unreachable: the next tick tries again.
      });
    }, 30000);
    return () => clearInterval(id);
  }, [sessionId]);

  const markedCount = (attendance.data ?? []).length;
  const doneActivities = (activities.data ?? []).filter((a) => a.completed).length;
  const evidenceCount = (evidence.data ?? []).length;

  const tiles = [
    { screen: 'attendance', name: 'Attendance', count: markedCount ? `${markedCount} marked` : '', Icon: IconUser, bg: '#dcfce7', ic: '#16a34a' },
    { screen: 'checklist', name: 'Activities', count: activities.data?.length ? `${doneActivities}/${activities.data.length}` : '', Icon: IconChecklist, bg: colors.brandSoft, ic: colors.brand },
    { screen: 'evidence', name: 'Add evidence', count: evidenceCount ? `${evidenceCount} added` : '', Icon: IconCamera, bg: colors.brandSoft, ic: colors.brand },
    { screen: 'rubric', name: 'LQS rubric', count: '', Icon: IconGem, bg: '#f5f3ff', ic: colors.violet },
    { screen: 'homework-create', name: 'Homework', count: '', Icon: IconPencil, bg: withAlpha(colors.ignite, 0.15), ic: colors.ignite },
    { screen: 'assessment', name: 'Assess', count: '', Icon: IconChecklist, bg: '#e0e7ff', ic: '#4f46e5' },
    { screen: 'project', name: 'Record project', count: '', Icon: IconBox, bg: '#ccfbf1', ic: colors.teal },
  ];

  if (current.loading && !sessionId) {
    return (
      <View>
        <SubHead title="Active lesson" onBack={goBack} />
        <Loading label="Finding the running lesson…" />
      </View>
    );
  }

  if (!sessionId) {
    return (
      <View>
        <SubHead title="Active lesson" onBack={goBack} />
        {current.error ? <ErrorState error={current.error} onRetry={current.reload} /> : null}
        <EmptyState
          title="No lesson in progress"
          sub="Open a lesson from the Lessons tab and start it to see the teaching tools here."
        />
      </View>
    );
  }

  return (
    <View>
      <SubHead title="Active lesson" onBack={goBack} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 13 }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 30, color: colors.brand, letterSpacing: 1 }}>{fmt(t)}</Text>
        <Pressable
          onPress={() => {
            const next = !paused;
            setPaused(next);
            pausedRef.current = next;
            // Persist immediately: a pause is usually followed by putting the
            // phone down, which is exactly when the periodic save may not run.
            updateSession(sessionId, { elapsedSeconds: elapsedRef.current }).catch(() => {});
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.ignite, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 11 }}
        >
          <Text style={{ color: colors.ignite, fontFamily: fonts.body700, fontWeight: '700', fontSize: 13 }}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 14 }}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.screen}
            onPress={() => navTo(tile.screen, { sessionId, lessonId })}
            style={{ width: '47%', flexGrow: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, paddingVertical: 14, paddingHorizontal: 12 }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: tile.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>
              <tile.Icon size={20} color={tile.ic} />
            </View>
            <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>{tile.name}</Text>
            {tile.count ? (
              <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', marginTop: 2, color: colors.textSubtle }}>{tile.count}</Text>
            ) : null}
          </Pressable>
        ))}
      </View>

      <Button
        variant="primary"
        onPress={() => navTo('reflection', { sessionId, lessonId, elapsedSeconds: t })}
      >
        ✓ Complete lesson
      </Button>
      {markedCount === 0 ? <Hint>Mark attendance first</Hint> : null}
    </View>
  );
}
