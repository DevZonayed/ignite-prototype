import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Tabs from '../components/Tabs';
import { useTheme } from '../ThemeContext';
import { useChildren } from '../context/ChildContext';
import { useApi } from '../api/useApi';
import { getAttendance, getChildPortfolio, getChildSkills } from '../api/endpoints';
import { Loading, ErrorState, EmptyState } from '../components/ScreenState';
import { displayName } from '../lib/user';

const TABS = [
  { key: 'att', label: 'Attendance' },
  { key: 'pf', label: 'Portfolio' },
  { key: 'sk', label: 'Skills' },
];

// Portfolio thumbnails, derived from the project type the server sends.
const TYPE_STYLE = {
  scratch: { top: '#2563EB', label: '.sb3', isText: true },
  python: { top: '#16A34A', label: '.py', isText: true },
  robotics: { top: '#E11D48', label: '◎', isText: false },
  design: { top: '#7C3AED', label: '✎', isText: false },
  video: { top: '#14B8A6', label: '▶', isText: false },
};
const TYPE_FALLBACK = { top: '#64748B', label: '◎', isText: false };

/** The rubric's 1-4 scale, as the words the report uses. */
function levelLabel(level) {
  if (level >= 3.5) return 'SECURE';
  if (level >= 2.5) return 'DEVELOPING';
  if (level > 0) return 'EMERGING';
  return '—';
}

/** "2026-08-03" → "3 Aug". */
function weekLabel(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value ?? '');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// CHILD screen — title from active child, Attendance/Portfolio/Skills tabs.
export default function Child() {
  const { colors, fonts } = useTheme();
  const [tab, setTab] = useState('att');
  const { activeChild, activeChildId, loading: childrenLoading } = useChildren();

  const attendance = useApi(() => getAttendance(activeChildId), [activeChildId], {
    skip: !activeChildId,
  });
  const portfolio = useApi(() => getChildPortfolio(activeChildId), [activeChildId], {
    skip: !activeChildId,
    initial: [],
  });
  const skills = useApi(() => getChildSkills(activeChildId), [activeChildId], {
    skip: !activeChildId,
  });

  if (childrenLoading && !activeChild) return <Loading label="Loading…" />;
  if (!activeChild) {
    return (
      <EmptyState
        title="No children linked yet"
        sub="Ask your school to link your account to your child's record."
      />
    );
  }

  const dims = skills.data?.dimensions ?? [];

  return (
    <View>
      <Text style={[styles.pagetitle, { color: colors.text, fontFamily: fonts.display }]}>
        {displayName(activeChild)}
      </Text>
      <Text style={[styles.pagesub, { color: colors.textMuted, fontFamily: fonts.ui }]}>
        Digital Innovation
      </Text>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'att' &&
        (attendance.loading && !attendance.data ? (
          <Loading label="Loading attendance…" />
        ) : attendance.error ? (
          <ErrorState error={attendance.error} onRetry={attendance.reload} />
        ) : (
          <View>
            <View
              style={[
                styles.card,
                styles.rowBetween,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardStrong, { color: colors.text, fontFamily: fonts.ui700 }]}>
                This term
              </Text>
              <Text style={[styles.cardStrong, { color: colors.success, fontFamily: fonts.ui700 }]}>
                {attendance.data?.termPercent ?? 0}% present
              </Text>
            </View>
            <View
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.cardMuted, { color: colors.textMuted, fontFamily: fonts.ui }]}>
                {(attendance.data?.weeklyBreakdown ?? []).length
                  ? attendance.data.weeklyBreakdown
                      .map((w) => `${weekLabel(w.week)} ${w.percent}%`)
                      .join(' · ')
                  : 'No attendance recorded yet.'}
              </Text>
            </View>
          </View>
        ))}

      {tab === 'pf' &&
        (portfolio.loading && !portfolio.data?.length ? (
          <Loading label="Loading portfolio…" />
        ) : portfolio.error ? (
          <ErrorState error={portfolio.error} onRetry={portfolio.reload} />
        ) : !portfolio.data?.length ? (
          <EmptyState
            title="No work saved yet"
            sub="Projects your child's teacher saves will appear here."
          />
        ) : (
          <View style={styles.pgrid}>
            {portfolio.data.map((p) => {
              const st = TYPE_STYLE[p.type] ?? TYPE_FALLBACK;
              return (
                <View key={p.id} style={[styles.pcard, { borderColor: colors.border }]}>
                  <View style={[styles.pcardTop, { backgroundColor: st.top }]}>
                    <Text
                      style={
                        st.isText
                          ? { color: '#fff', fontWeight: '700', fontSize: 11 }
                          : { color: '#fff', fontSize: 20 }
                      }
                    >
                      {st.label}
                    </Text>
                  </View>
                  <View style={styles.pcardMeta}>
                    <Text style={[styles.pt, { color: colors.text, fontFamily: fonts.ui700 }]}>
                      {p.title}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

      {tab === 'sk' &&
        (skills.loading && !dims.length ? (
          <Loading label="Loading skills…" />
        ) : skills.error ? (
          <ErrorState error={skills.error} onRetry={skills.reload} />
        ) : !dims.length ? (
          <EmptyState
            title="No skills scored yet"
            sub="Your child's teacher rates these during lessons."
          />
        ) : (
          <View>
            <View
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {dims.map((d) => (
                <View key={d.name} style={styles.dimrow}>
                  <View style={[styles.dot, { backgroundColor: d.color }]} />
                  <Text style={[styles.dimName, { color: colors.text, fontFamily: fonts.ui }]}>
                    {d.name}
                  </Text>
                  <Text style={[styles.lv, { color: colors.textSubtle, fontFamily: fonts.ui700 }]}>
                    {levelLabel(d.level)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pagetitle: { fontSize: 22, fontWeight: '900', paddingVertical: 2 },
  pagesub: { fontSize: 12.5, marginBottom: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 11,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStrong: { fontSize: 13, fontWeight: '700' },
  cardMuted: { fontSize: 13 },
  pgrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pcard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    width: '48%',
    flexGrow: 1,
  },
  pcardTop: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pcardMeta: { paddingVertical: 8, paddingHorizontal: 9 },
  pt: { fontSize: 12, fontWeight: '700' },
  dimrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 7,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dimName: { fontSize: 12.5 },
  lv: { marginLeft: 'auto', fontSize: 10, fontWeight: '700' },
  lqs: { fontSize: 11.5, textAlign: 'center' },
});
