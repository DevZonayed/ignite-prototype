import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, Card } from '../components/common';
import { Loading, ErrorState, EmptyState } from '../components/ScreenState';
import RadarChart from '../components/RadarChart';
import { useApi } from '../api/useApi';
import { getLqs, getRadar } from '../api/endpoints';

export default function Skills({ user }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState('radar');
  const learnerId = user?.id ?? null;

  const lqs = useApi(() => getLqs(learnerId), [learnerId], { skip: !learnerId });
  const radar = useApi(() => getRadar(learnerId), [learnerId], { skip: !learnerId });

  const dims = lqs.data?.dimensions ?? [];
  const radarDims = radar.data?.dimensions ?? [];

  // The server's totalScore is a weighted sum, not a percentage. Show it as a
  // whole number and leave the "out of 100" wording off unless it fits.
  const score = lqs.data?.totalScore;
  const displayScore = score == null ? '—' : Math.round(Number(score));

  const loading = lqs.loading || radar.loading;
  const error = lqs.error || radar.error;

  return (
    <View>
      <PageTitle title="My skills" sub="Digital Innovation" />

      {error ? (
        <ErrorState
          error={error}
          onRetry={() => {
            lqs.reload();
            radar.reload();
          }}
        />
      ) : null}

      {/* LQS badge */}
      <View style={[styles.lqs, { backgroundColor: colors.brandSoft, borderColor: colors.border }]}>
        <Text style={[styles.lqsBig, { color: colors.brand }]}>{displayScore}</Text>
        <View>
          <Text style={[styles.lqsTitle, { color: colors.text }]}>Learner Quality Score</Text>
          <Text style={[styles.lqsSub, { color: colors.textSubtle }]}>across all dimensions</Text>
        </View>
      </View>

      {/* tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {['radar', 'table'].map((key) => {
          const active = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[
                styles.tab,
                active && { borderBottomColor: colors.brand },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? colors.brand : colors.textSubtle },
                ]}
              >
                {key === 'radar' ? 'Radar' : 'Table'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading && !dims.length ? (
        <Loading label="Loading your skills…" variant="bars" rows={5} />
      ) : !dims.length ? (
        <EmptyState
          title="No skills scored yet"
          sub="Your teacher's rubric ratings will appear here once they start."
        />
      ) : tab === 'radar' ? (
        <Card style={{ padding: 8, alignItems: 'center' }}>
          <RadarChart width={300} dims={radarDims} />
        </Card>
      ) : (
        <Card>
          {dims.map((d, i) => (
            <View
              key={d.dimensionId ?? d.name}
              style={[
                styles.dimrow,
                i < dims.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.surface2 },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: d.color }]} />
              <Text style={[styles.dimName, { color: colors.text }]}>{d.name}</Text>
              <Text style={[styles.lv, { color: colors.textSubtle }]}>
                {String(d.level ?? '').toUpperCase()}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lqs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginBottom: 14,
  },
  lqsBig: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 26,
  },
  lqsTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
  },
  lqsSub: {
    fontSize: 11.5,
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fonts.uiBold,
  },
  dimrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dimName: {
    fontSize: 12.5,
  },
  lv: {
    marginLeft: 'auto',
    fontSize: 10,
    fontFamily: fonts.uiBold,
  },
});
