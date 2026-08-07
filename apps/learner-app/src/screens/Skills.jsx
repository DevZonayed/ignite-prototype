import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { dims } from '../data';
import { PageTitle, Card } from '../components/common';
import RadarChart from '../components/RadarChart';

export default function Skills() {
  const { colors } = useTheme();
  const [tab, setTab] = useState('radar');

  return (
    <View>
      <PageTitle title="My skills" sub="Term 2 · Digital Innovation" />

      {/* LQS badge */}
      <View style={[styles.lqs, { backgroundColor: colors.brandSoft, borderColor: colors.border }]}>
        <Text style={[styles.lqsBig, { color: colors.brand }]}>78</Text>
        <View>
          <Text style={[styles.lqsTitle, { color: colors.text }]}>Learner Quality Score</Text>
          <Text style={[styles.lqsSub, { color: colors.textSubtle }]}>out of 100 · this term</Text>
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

      {tab === 'radar' ? (
        <Card style={{ padding: 8, alignItems: 'center' }}>
          <RadarChart width={300} />
        </Card>
      ) : (
        <Card>
          {dims.map((d, i) => (
            <View
              key={i}
              style={[
                styles.dimrow,
                i < dims.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.surface2 },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: d[2] }]} />
              <Text style={[styles.dimName, { color: colors.text }]}>{d[0]}</Text>
              <Text style={[styles.lv, { color: colors.textSubtle }]}>{d[3].toUpperCase()}</Text>
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
