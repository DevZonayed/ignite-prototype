import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { projects, thumbFor } from '../data';
import Gradient from '../components/Gradient';
import { PageTitle } from '../components/common';
import {
  PlayIcon,
  PythonBracketsIcon,
  RobotIcon,
  ImageIcon,
  CodeBracketsIcon,
} from '../components/Icon';

function ThumbGlyph({ kind }) {
  if (kind === 'video') {
    return (
      <View style={styles.videoCircle}>
        <PlayIcon size={15} color="#172554" />
      </View>
    );
  }
  if (kind === 'python') return <PythonBracketsIcon size={30} color="#fff" strokeWidth={2.2} />;
  if (kind === 'robot') return <RobotIcon size={30} color="#fff" strokeWidth={2} />;
  if (kind === 'design') return <ImageIcon size={30} color="#fff" strokeWidth={2} />;
  return <CodeBracketsIcon size={30} color="#fff" strokeWidth={2} />;
}

export default function Portfolio({ onOpenItem }) {
  const { colors } = useTheme();
  return (
    <View>
      <PageTitle title="My Portfolio" sub="Term 2 · tap a project" />
      <View style={styles.pgrid}>
        {projects.map((p, i) => {
          const t = thumbFor(p.f);
          return (
            <Pressable
              key={i}
              onPress={() => onOpenItem(i)}
              style={[styles.pcard, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Gradient colors={p.c} style={styles.top}>
                <ThumbGlyph kind={t.kind} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t.badge}</Text>
                </View>
              </Gradient>
              <View style={styles.meta}>
                <Text style={[styles.pt, { color: colors.text }]}>{p.t}</Text>
                <Text style={[styles.pf, { color: colors.textSubtle }]}>{p.f}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pgrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pcard: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 11,
  },
  top: {
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fonts.uiBold,
    color: '#fff',
  },
  meta: {
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  pt: {
    fontFamily: fonts.uiBold,
    fontSize: 12.5,
  },
  pf: {
    fontFamily: 'Menlo',
    fontSize: 10,
    marginTop: 4,
  },
});
