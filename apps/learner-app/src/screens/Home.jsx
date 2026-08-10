import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts, igniteGradient } from '../theme';
import Gradient from '../components/Gradient';
import ProgressRing from '../components/ProgressRing';
import { MedalIcon } from '../components/Icon';
import { Card, SecTitle } from '../components/common';
import { AsyncList, Loading } from '../components/ScreenState';
import { useApi } from '../api/useApi';
import { getProgress, getRecentWork } from '../api/endpoints';
import { styleFor, subtitleFor, tagFor } from '../lib/project';

export default function Home({ user, onOpenItem }) {
  const { colors } = useTheme();
  const learnerId = user?.id ?? null;

  const progress = useApi(() => getProgress(learnerId), [learnerId], { skip: !learnerId });
  const recent = useApi(() => getRecentWork(learnerId), [learnerId], {
    skip: !learnerId,
    initial: [],
  });

  const first = (user?.firstName || '').trim();
  const initial = (first || user?.email || '?').charAt(0).toUpperCase();
  const streak = progress.data?.streak ?? 0;
  const latestBadge = progress.data?.latestBadge ?? null;

  return (
    <View>
      {/* apphead */}
      <View style={styles.apphead}>
        <Gradient colors={igniteGradient} style={styles.av} borderRadius={23}>
          <Text style={styles.avText}>{initial}</Text>
        </Gradient>
        <View>
          <Text style={[styles.hi, { color: colors.text }]}>
            {first ? `Hi, ${first}!` : 'Hi there!'}
          </Text>
          {streak > 0 ? (
            <View
              style={[
                styles.streak,
                { backgroundColor: colors.streakBg, borderColor: colors.streakBorder },
              ]}
            >
              <Text style={[styles.streakText, { color: colors.ignite }]}>
                🔥 {streak}-day spark
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Most recent badge. Nothing to celebrate yet on a new account. */}
      {latestBadge ? (
        <Gradient colors={igniteGradient} style={styles.celebrate} borderRadius={20}>
          <View style={styles.medal}>
            <MedalIcon size={26} color="#fff" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.celTitle}>New badge! {latestBadge.name}</Text>
            <Text style={styles.celSub}>Keep going — the next one is close</Text>
          </View>
        </Gradient>
      ) : null}

      {/* term progress ring */}
      <Card>
        {progress.loading && !progress.data ? (
          <Loading label="Loading progress…" variant="tiles" />
        ) : (
          <View style={styles.ringrow}>
            <ProgressRing size={78} percent={progress.data?.termProgressPercent ?? 0} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.ringTitle, { color: colors.text }]}>Term progress</Text>
              <Text style={[styles.ringSub, { color: colors.textMuted }]}>
                Digital Innovation · keep going!
              </Text>
            </View>
          </View>
        )}
      </Card>

      <SecTitle>Recent work</SecTitle>

      <AsyncList
        state={recent}
        loadingLabel="Loading recent work…"
        empty={{
          title: 'No work yet',
          sub: 'Projects your teacher saves will show up here.',
        }}
      >
        {(items) =>
          items.slice(0, 3).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onOpenItem(p.id)}
              style={[styles.work, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.thumb, { backgroundColor: styleFor(p).gradient[1] }]}>
                <Text style={styles.thumbText}>{tagFor(p)}</Text>
              </View>
              <View>
                <Text style={[styles.wt, { color: colors.text }]}>{p.title}</Text>
                <Text style={[styles.wm, { color: colors.textSubtle }]}>{subtitleFor(p)}</Text>
              </View>
            </Pressable>
          ))
        }
      </AsyncList>
    </View>
  );
}

const styles = StyleSheet.create({
  apphead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingTop: 6,
    paddingBottom: 14,
  },
  av: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avText: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 17,
    color: '#3b1d05',
  },
  hi: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 22,
  },
  streak: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  streakText: {
    fontSize: 12,
    fontFamily: fonts.uiBold,
  },
  celebrate: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  medal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celTitle: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 16,
    color: '#fff',
  },
  celSub: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.92,
    marginTop: 2,
  },
  ringrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ringTitle: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 17,
  },
  ringSub: {
    fontSize: 13,
  },
  work: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 9,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {
    color: '#fff',
    fontFamily: fonts.uiBold,
    fontSize: 11,
  },
  wt: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
  },
  wm: {
    fontSize: 12,
  },
});
