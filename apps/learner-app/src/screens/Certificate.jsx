import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead } from '../components/common';
import { Loading, ErrorState, EmptyState } from '../components/ScreenState';
import { useApi } from '../api/useApi';
import { getCertificate } from '../api/endpoints';

/** "2026-06-28" → "28 Jun 2026". Left as-is if the server sends something else. */
function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Certificate({ user, onBack, onToast }) {
  const { colors } = useTheme();
  const learnerId = user?.id ?? null;

  const certificate = useApi(() => getCertificate(learnerId), [learnerId], { skip: !learnerId });
  const cert = certificate.data ?? null;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';

  if (certificate.loading && !cert) {
    return (
      <View>
        <SubHead title="Certificate" onBack={onBack} />
        <Loading label="Loading certificate…" />
      </View>
    );
  }

  if (certificate.error && !cert) {
    return (
      <View>
        <SubHead title="Certificate" onBack={onBack} />
        <ErrorState error={certificate.error} onRetry={certificate.reload} />
      </View>
    );
  }

  if (!cert) {
    return (
      <View>
        <SubHead title="Certificate" onBack={onBack} />
        <EmptyState
          title="No certificate yet"
          sub="Your certificate appears here once your school issues it."
        />
      </View>
    );
  }

  return (
    <View>
      <SubHead title="Certificate" onBack={onBack} />

      <View style={[styles.certcard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.inner}>
          <Text style={[styles.brand, { color: colors.brand }]}>IGNITE</Text>
          <Text style={[styles.title, { color: colors.text }]}>Certificate of Achievement</Text>
          <View style={styles.rule} />
          <Text style={[styles.name, { color: colors.ink }]}>{name}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {[cert.course, cert.term].filter(Boolean).join(' · ')}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {[cert.school, formatDate(cert.issueDate)].filter(Boolean).join(' · ')}
          </Text>
          <Text style={[styles.verified, { color: colors.textSubtle }]}>
            Verified · ID {cert.verifiedId ?? cert.id}
          </Text>
        </View>
      </View>

      {/* The server exposes a download route, but it needs a file writer and a
          share sheet to be useful on a phone — not wired yet. */}
      <Pressable
        style={[styles.btn, { backgroundColor: colors.brand }]}
        onPress={() => onToast('Ask your teacher for a printed copy')}
      >
        <Text style={styles.btnText}>⬇ Download PDF</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  certcard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  inner: {
    borderWidth: 2,
    borderColor: '#e7c98a',
    margin: 10,
    borderRadius: 10,
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  brand: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 17,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  rule: {
    height: 1,
    backgroundColor: '#e7c98a',
    width: '60%',
    marginBottom: 8,
  },
  name: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 24,
  },
  meta: {
    fontSize: 12.5,
    marginTop: 4,
    textAlign: 'center',
  },
  verified: {
    fontSize: 11,
    marginTop: 14,
    textAlign: 'center',
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  btnText: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 15,
    color: '#fff',
  },
});
