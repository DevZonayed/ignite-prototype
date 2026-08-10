import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle } from '../components/common';
import { AsyncList } from '../components/ScreenState';
import { StarIcon, ChevronRightIcon } from '../components/Icon';
import { useApi } from '../api/useApi';
import { getPortfolio } from '../api/endpoints';
import { flattenGroups, subtitleFor } from '../lib/project';

export default function Projects({ user, onOpenItem }) {
  const { colors } = useTheme();
  const learnerId = user?.id ?? null;

  const portfolio = useApi(() => getPortfolio(learnerId), [learnerId], { skip: !learnerId });
  const state = { ...portfolio, data: flattenGroups(portfolio.data) };

  return (
    <View>
      <PageTitle title="Projects" sub="Everything I've built" />

      <AsyncList
        state={state}
        loadingLabel="Loading projects…"
        empty={{
          title: 'No projects yet',
          sub: 'Work your teacher saves to your portfolio will appear here.',
        }}
      >
        {(projects) =>
          projects.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onOpenItem(p.id)}
              style={[styles.work, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.thumb, { backgroundColor: colors.brandSoft }]}>
                <StarIcon size={20} color={colors.brand} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.wt, { color: colors.text }]}>{p.title}</Text>
                <Text style={[styles.wm, { color: colors.textSubtle }]}>{subtitleFor(p)}</Text>
              </View>
              <ChevronRightIcon size={16} color={colors.textSubtle} strokeWidth={2} />
            </Pressable>
          ))
        }
      </AsyncList>
    </View>
  );
}

const styles = StyleSheet.create({
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
  wt: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
  },
  wm: {
    fontSize: 12,
  },
});
