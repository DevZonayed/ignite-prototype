import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { Card, SubHead } from '../components/common';
import { Loading, ErrorState, EmptyState } from '../components/ScreenState';
import Gradient from '../components/Gradient';
import { useApi } from '../api/useApi';
import { getProject } from '../api/endpoints';
import { styleFor, subtitleFor } from '../lib/project';

export default function ItemDetail({ projectId, onBack }) {
  const { colors } = useTheme();

  const project = useApi(() => getProject(projectId), [projectId], { skip: !projectId });

  if (!projectId) {
    return (
      <View>
        <SubHead title="Project" onBack={onBack} />
        <EmptyState title="No project selected" sub="Open a project from your portfolio." />
      </View>
    );
  }

  if (project.loading && !project.data) {
    return (
      <View>
        <SubHead title="Project" onBack={onBack} />
        <Loading label="Loading project…" />
      </View>
    );
  }

  if (project.error && !project.data) {
    return (
      <View>
        <SubHead title="Project" onBack={onBack} />
        <ErrorState error={project.error} onRetry={project.reload} />
      </View>
    );
  }

  const p = project.data ?? {};

  return (
    <View>
      <SubHead title={p.title} onBack={onBack} />

      {/* preview: code monospace OR title */}
      <Gradient colors={styleFor(p).gradient} style={styles.preview} borderRadius={14}>
        {p.codeSnippet ? (
          <Text style={styles.code}>{p.codeSnippet}</Text>
        ) : (
          <Text style={styles.previewTitle}>{p.title}</Text>
        )}
      </Gradient>

      <Card>
        <Text style={[styles.desc, { color: colors.textMuted }]}>
          {p.description || subtitleFor(p) || 'No description yet.'}
        </Text>
      </Card>

      {p.skills ? (
        <Card style={styles.skillsCard}>
          <Text style={[styles.skillsLabel, { color: colors.textSubtle }]}>Skills</Text>
          <Text style={[styles.skillsVal, { color: colors.text }]}>{p.skills}</Text>
        </Card>
      ) : null}

      {/* No "Share with parent" button: the server restricts sharing to
          teachers (POST /portfolio/projects/:id/share is @Roles('teacher')), so
          the control would 403 every time a learner pressed it. */}
      <Text style={[styles.shareNote, { color: colors.textSubtle }]}>
        Your teacher shares finished work with your parent.
      </Text>
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
  shareNote: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
});
