import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import ChildSwitcher from '../components/ChildSwitcher';
import { useTheme } from '../ThemeContext';
import { useChildren } from '../context/ChildContext';
import { useApi } from '../api/useApi';
import { getWeeklySummary, getChildFeed, listHomework } from '../api/endpoints';
import { Loading, ErrorState, EmptyState } from '../components/ScreenState';
import { firstName } from '../lib/user';

/** "2026-07-18" → "Fri 18 Jul". Left as-is if it is not a date. */
function formatDue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// HOME screen — child switcher, "This week" card, action rows.
export default function Home({ onNavigate }) {
  const { colors, fonts } = useTheme();
  const { activeChild, activeChildId, loading: childrenLoading, error: childrenError, reload } =
    useChildren();

  const summary = useApi(() => getWeeklySummary(activeChildId), [activeChildId], {
    skip: !activeChildId,
  });
  const feed = useApi(() => getChildFeed(activeChildId), [activeChildId], {
    skip: !activeChildId,
    initial: [],
  });
  const homework = useApi(() => listHomework(activeChildId), [activeChildId], {
    skip: !activeChildId,
    initial: [],
  });

  if (childrenLoading && !activeChild) return <Loading label="Loading your children…" variant="screen" />;
  if (childrenError) return <ErrorState error={childrenError} onRetry={reload} />;
  if (!activeChild) {
    return (
      <EmptyState
        title="No children linked yet"
        sub="Ask your school to link your account to your child's record."
      />
    );
  }

  const stats = summary.data;
  // The newest unread-ish item drives the "message from teacher" row.
  const latestMessage = (feed.data ?? []).find((f) => f.type === 'message');
  const latestReport = (feed.data ?? []).find((f) => f.type === 'report');
  const nextHomework = (homework.data ?? [])[0];

  return (
    <View>
      <ChildSwitcher />

      {/* This week */}
      <View
        style={[
          styles.weekcard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.weekTitle, { color: colors.text, fontFamily: fonts.display }]}>
          This week
        </Text>
        {summary.loading && !stats ? (
          <Loading label="Loading this week…" variant="tiles" />
        ) : (
          <View style={styles.wk}>
            <WeekStat
              bg="#dcfce7"
              icon={<Icon name="check" size={19} color="#16a34a" strokeWidth={2} />}
              n={String(stats?.daysPresent ?? 0)}
              l="days present"
            />
            <WeekStat
              bg={colors.brandSoft}
              icon={<Icon name="calendar" size={19} color={colors.brand} strokeWidth={2} />}
              n={String(stats?.activeProjects ?? 0)}
              l="projects"
            />
            <WeekStat
              bg="#f5f3ff"
              icon={<Icon name="file" size={19} color={colors.violet} strokeWidth={2} />}
              n={String(stats?.newReports ?? 0)}
              l={stats?.newReports === 1 ? 'new report' : 'new reports'}
            />
          </View>
        )}
      </View>

      {/* Homework due */}
      {nextHomework ? (
        <Pressable
          style={[styles.arow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => onNavigate('homework')}
        >
          <View style={[styles.ai, { backgroundColor: 'rgba(249,115,22,0.14)' }]}>
            <Icon name="pencil" size={21} color={colors.ignite} strokeWidth={2} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.at, { color: colors.text, fontFamily: fonts.display800 }]}>
              Homework due
            </Text>
            <Text style={[styles.as, { color: colors.textMuted, fontFamily: fonts.ui }]}>
              {[nextHomework.title, formatDue(nextHomework.dueDate)].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <View style={[styles.go, { backgroundColor: colors.ignite }]}>
            <Text style={[styles.goText, { color: '#3b1d05', fontFamily: fonts.ui700 }]}>
              Open
            </Text>
          </View>
        </Pressable>
      ) : null}

      {/* New message from teacher */}
      {latestMessage ? (
        <Pressable
          style={[styles.arow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => onNavigate('homework')}
        >
          <View style={[styles.ai, { backgroundColor: '#ccfbf1' }]}>
            <Icon name="message" size={21} color={colors.teal} strokeWidth={2} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.at, { color: colors.text, fontFamily: fonts.display800 }]}>
              New message from teacher
            </Text>
            <Text style={[styles.as, { color: colors.textMuted, fontFamily: fonts.ui }]}>
              {latestMessage.title}
            </Text>
          </View>
        </Pressable>
      ) : null}

      {/* AI report ready */}
      <Pressable
        style={[styles.arow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onNavigate('report')}
      >
        <View style={[styles.ai, { backgroundColor: colors.brandSoft }]}>
          <Icon name="fileCheck" size={21} color={colors.brand} strokeWidth={2} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.at, { color: colors.text, fontFamily: fonts.display800 }]}>
            {latestReport ? latestReport.title : 'Progress report'}
          </Text>
          <Text style={[styles.as, { color: colors.textMuted, fontFamily: fonts.ui }]}>
            {firstName(activeChild)}'s termly report
          </Text>
        </View>
        <View style={[styles.go, { backgroundColor: colors.brand }]}>
          <Text style={[styles.goText, { color: '#fff', fontFamily: fonts.ui700 }]}>Read</Text>
        </View>
      </Pressable>
    </View>
  );
}

function WeekStat({ bg, icon, n, l }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.wkc}>
      <View style={[styles.ci, { backgroundColor: bg }]}>{icon}</View>
      <Text style={[styles.cn, { color: colors.text, fontFamily: fonts.display }]}>{n}</Text>
      <Text style={[styles.cl, { color: colors.textMuted, fontFamily: fonts.ui }]}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  weekcard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
  },
  weekTitle: { fontSize: 19, fontWeight: '900', marginBottom: 12 },
  wk: { flexDirection: 'row', gap: 8 },
  wkc: { flex: 1, alignItems: 'center' },
  ci: {
    width: 38,
    height: 38,
    borderRadius: 11,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cn: { fontSize: 17, fontWeight: '900' },
  cl: { fontSize: 10 },
  arow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 11,
  },
  ai: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  at: { fontSize: 15, fontWeight: '800' },
  as: { fontSize: 12, marginTop: 1 },
  go: {
    marginLeft: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 9,
  },
  goText: { fontSize: 12.5, fontWeight: '700' },
});
