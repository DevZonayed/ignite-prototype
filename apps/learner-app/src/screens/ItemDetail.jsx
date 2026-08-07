import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { projects } from '../data';
import { Card, SubHead } from '../components/common';
import Gradient from '../components/Gradient';

export default function ItemDetail({ index, onBack, onToast }) {
  const { colors } = useTheme();
  const p = projects[index] || projects[0];

  return (
    <View>
      <SubHead title={p.t} onBack={onBack} />

      {/* preview: code monospace OR title */}
      <Gradient colors={['#1e293b', '#0f172a']} style={styles.preview} borderRadius={14}>
        {p.code ? (
          <Text style={styles.code}>{p.code}</Text>
        ) : (
          <Text style={styles.previewTitle}>{p.t}</Text>
        )}
      </Gradient>

      <Card>
        <Text style={[styles.desc, { color: colors.textMuted }]}>{p.desc}</Text>
      </Card>

      <Card style={styles.skillsCard}>
        <Text style={[styles.skillsLabel, { color: colors.textSubtle }]}>Skills</Text>
        <Text style={[styles.skillsVal, { color: colors.text }]}>{p.skills}</Text>
      </Card>

      <Pressable
        style={[styles.btn, { backgroundColor: colors.brand }]}
        onPress={() => onToast('Shared to your parent')}
      >
        <Text style={styles.btnText}>Share with parent</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  code: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: '#93c5fd',
    lineHeight: 21,
  },
  previewTitle: {
    color: '#93c5fd',
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 22,
  },
  desc: {
    fontSize: 13,
  },
  skillsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillsLabel: {
    fontSize: 12.5,
  },
  skillsVal: {
    fontSize: 12.5,
    fontFamily: fonts.uiBold,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 15,
    color: '#fff',
  },
});
