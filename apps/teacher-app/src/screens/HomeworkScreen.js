import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, Button, withAlpha } from '../components/ui';
import { AsyncList } from '../components/ScreenState';
import { IconCheck } from '../components/Icon';
import { useClasses } from '../context/ClassContext';
import { useApi } from '../api/useApi';
import { listClassSubmissions } from '../api/endpoints';
import { displayName, initialsOf } from '../lib/user';

function HwRow({ badge, badgeBg, badgeColor, title, meta, action, actionColor, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}
    >
      <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: badgeBg, alignItems: 'center', justifyContent: 'center' }}>
        {typeof badge === 'string' ? (
          <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: badgeColor }}>{badge}</Text>
        ) : (
          badge
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>{title}</Text>
        <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>{meta}</Text>
      </View>
      {action ? <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: actionColor }}>{action}</Text> : null}
    </Pressable>
  );
}

export default function HomeworkScreen({ navTo }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();
  const [tab, setTab] = useState('pending');

  const state = useApi(
    () => listClassSubmissions(activeClassId, tab),
    [activeClassId, tab],
    { skip: !activeClassId, initial: [] },
  );

  return (
    <View>
      <PageTitle>Homework</PageTitle>

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {[['pending', 'Pending'], ['reviewed', 'Reviewed']].map(([id, label]) => {
          const on = tab === id;
          return (
            <Pressable key={id} onPress={() => setTab(id)} style={{ paddingVertical: 9, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: on ? colors.brand : 'transparent', marginBottom: -1 }}>
              <Text style={{ fontSize: 13, fontFamily: fonts.body700, fontWeight: '700', color: on ? colors.brand : colors.textSubtle }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button variant="ghost" onPress={() => navTo('homework-create')} style={{ marginBottom: 13 }}>
        + Set homework
      </Button>

      <AsyncList
        state={state}
        loadingLabel="Loading submissions…"
        empty={
          tab === 'pending'
            ? { title: 'No pending submissions', sub: 'Learner submissions will appear here for review.' }
            : { title: 'Nothing reviewed yet', sub: 'Submissions you have given feedback to will appear here.' }
        }
      >
        {(subs) =>
          subs.map((s) => {
            const learner = s.learner ?? null;
            const reviewed = s.reviewStatus === 'reviewed';
            return (
              <HwRow
                key={s.id}
                badge={
                  reviewed ? (
                    <IconCheck size={17} color={colors.success} strokeWidth={3} />
                  ) : (
                    initialsOf(learner)
                  )
                }
                badgeBg={reviewed ? withAlpha(colors.success, 0.15) : learner?.avatarBg || colors.brandSoft}
                badgeColor={learner?.avatarColor || colors.brand}
                title={learner ? displayName(learner) : 'Learner'}
                meta={s.homework?.title ?? 'Homework'}
                action={reviewed ? 'Reviewed' : 'Review'}
                actionColor={reviewed ? colors.success : colors.brand}
                onPress={() => navTo('hw-review', { submissionId: s.id })}
              />
            );
          })
        }
      </AsyncList>
    </View>
  );
}
