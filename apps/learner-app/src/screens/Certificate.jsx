import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead } from '../components/common';

export default function Certificate({ onBack, onToast }) {
  const { colors } = useTheme();
  return (
    <View>
      <SubHead title="Certificate" onBack={onBack} />

      <View style={[styles.certcard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.inner}>
          <Text style={[styles.brand, { color: colors.brand }]}>IGNITE</Text>
          <Text style={[styles.title, { color: colors.text }]}>Certificate of Achievement</Text>
          <View style={styles.rule} />
          <Text style={[styles.name, { color: colors.ink }]}>Amara Eze</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Digital Innovation · Term 2</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Bright Future Academy · 17 Jul 2026
          </Text>
          <Text style={[styles.verified, { color: colors.textSubtle }]}>
            Verified · ID IGN-2026-0148
          </Text>
        </View>
      </View>

      <Pressable
        style={[styles.btn, { backgroundColor: colors.brand }]}
        onPress={() => onToast('Certificate downloaded (PDF)')}
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
