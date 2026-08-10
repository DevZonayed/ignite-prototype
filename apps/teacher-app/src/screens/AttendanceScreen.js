import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, EmptyState } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { useClasses } from '../context/ClassContext';
import { useApi, useAction } from '../api/useApi';
import {
  getCurrentSession,
  listLearners,
  getSessionAttendance,
  saveSessionAttendance,
} from '../api/endpoints';
import { displayName, initialsOf } from '../lib/user';

// Server statuses, with the single-letter control the screen has always used.
const SEG = [
  ['present', 'P', '#16a34a'],
  ['absent', 'A', '#dc2626'],
  ['late', 'L', '#d97706'],
];

export default function AttendanceScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();

  // Attendance belongs to a lesson session, not to a class: there is nothing to
  // mark until a lesson is running.
  const session = useApi(() => getCurrentSession(activeClassId), [activeClassId], {
    skip: !activeClassId,
  });
  const sessionId = session.data?.id ?? null;

  const roster = useApi(() => listLearners(activeClassId), [activeClassId], {
    skip: !activeClassId,
    initial: [],
  });
  const existing = useApi(() => getSessionAttendance(sessionId), [sessionId], {
    skip: !sessionId,
    initial: [],
  });

  // learnerId -> status. Seeded from whatever the session already holds, so
  // reopening the screen shows what was marked rather than a blank sheet.
  const [status, setStatus] = useState({});
  useEffect(() => {
    if (!existing.data) return;
    const seeded = {};
    for (const rec of existing.data) {
      const id = rec.learnerId ?? rec.learner?.id;
      if (id) seeded[id] = rec.status;
    }
    setStatus(seeded);
  }, [existing.data]);

  const learners = roster.data ?? [];
  const marked = learners.filter((l) => status[l.id]).length;

  const save = useAction(() =>
    saveSessionAttendance(
      sessionId,
      learners.filter((l) => status[l.id]).map((l) => ({ learnerId: l.id, status: status[l.id] })),
    ),
  );

  function markAll() {
    setStatus(Object.fromEntries(learners.map((l) => [l.id, 'present'])));
  }

  async function onSave() {
    try {
      await save.run();
      showToast('Attendance saved');
      setTimeout(goBack, 240);
    } catch {
      // The error is rendered below; the screen stays open so nothing is lost.
    }
  }

  const loading = session.loading || roster.loading || existing.loading;
  const error = session.error || roster.error || existing.error;

  if (loading && !learners.length) {
    return (
      <View style={{ flex: 1 }}>
        <SubHead title="Attendance" onBack={goBack} />
        <Loading label="Loading register…" />
      </View>
    );
  }

  if (error && !learners.length) {
    return (
      <View style={{ flex: 1 }}>
        <SubHead title="Attendance" onBack={goBack} />
        <ErrorState
          error={error}
          onRetry={() => {
            session.reload();
            roster.reload();
          }}
        />
      </View>
    );
  }

  if (!sessionId) {
    return (
      <View style={{ flex: 1 }}>
        <SubHead title="Attendance" onBack={goBack} />
        <EmptyState
          title="No lesson in progress"
          sub="Attendance is recorded against a running lesson. Start one from the lesson plan first."
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SubHead title="Attendance" onBack={goBack} />

      {learners.length === 0 ? (
        <EmptyState title="No learners to mark" sub="This class has no learners on its roster." />
      ) : (
        <Button variant="ghost" onPress={markAll} style={{ marginBottom: 12 }}>
          ✓ Mark all present
        </Button>
      )}

      {save.error ? <ErrorState error={save.error} /> : null}

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
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {SEG.map(([code, label, activeBg]) => {
              const on = status[l.id] === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => setStatus((prev) => ({ ...prev, [l.id]: code }))}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 7,
                    borderWidth: 1.5,
                    borderColor: on ? activeBg : colors.border,
                    borderRadius: 7,
                    backgroundColor: on ? activeBg : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 10, fontFamily: fonts.body700, fontWeight: '700', color: on ? '#fff' : colors.textSubtle }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12, marginHorizontal: -18, paddingHorizontal: 18, marginTop: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 15, color: colors.text }}>
          {marked} / {learners.length} marked
        </Text>
        <View style={{ marginLeft: 'auto' }}>
          <Button
            variant="primary"
            disabled={marked === 0 || save.pending}
            onPress={onSave}
            style={{ width: 'auto', paddingHorizontal: 18, opacity: marked === 0 || save.pending ? 0.5 : 1 }}
          >
            {save.pending ? 'Saving…' : 'Save attendance'}
          </Button>
        </View>
      </View>
    </View>
  );
}
