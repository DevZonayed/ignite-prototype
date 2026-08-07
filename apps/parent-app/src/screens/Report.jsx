import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import { children } from '../data';
import { useTheme } from '../ThemeContext';

// REPORT screen — published AI progress report with trust banner + sections.
export default function Report({ current }) {
  const { colors, fonts } = useTheme();
  const c = children[current];

  return (
    <View>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
        Progress report
      </Text>
      <Text style={[styles.sub2, { color: colors.textMuted, fontFamily: fonts.ui }]}>
        {c.short} · Term 2 · Digital Innovation
      </Text>

      {/* Published pill */}
      <View style={styles.pubRow}>
        <View style={styles.pub}>
          <Icon name="check" size={12} color={colors.success} strokeWidth={3} />
          <Text style={[styles.pubText, { color: colors.success, fontFamily: fonts.ui700 }]}>
            Published
          </Text>
        </View>
      </View>

      {/* Trust banner */}
      <View
        style={[styles.trust, { backgroundColor: colors.brandSoft, borderColor: colors.border }]}
      >
        <Icon name="shieldCheck" size={16} color={colors.brand} strokeWidth={2} />
        <Text style={[styles.trustText, { color: colors.text, fontFamily: fonts.ui600 }]}>
          Reviewed by Mrs. Okafor before publishing
        </Text>
      </View>

      {/* What went well */}
      <View style={[styles.rep, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.rh}>
          <View style={[styles.ric, { backgroundColor: '#dcfce7' }]}>
            <Icon name="trophy" size={18} color="#16a34a" strokeWidth={2} />
          </View>
          <Text style={[styles.rt, { color: colors.text, fontFamily: fonts.display }]}>
            What went well
          </Text>
        </View>
        <Text style={[styles.rb, { color: colors.text, fontFamily: fonts.ui }]}>
          Amara builds Scratch loops confidently and explains her code clearly.
        </Text>
      </View>

      {/* Skills growing */}
      <View style={[styles.rep, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.rh}>
          <View style={[styles.ric, { backgroundColor: '#f5f3ff' }]}>
            <Icon name="trending" size={18} color={colors.violet} strokeWidth={2} />
          </View>
          <Text style={[styles.rt, { color: colors.text, fontFamily: fonts.display }]}>
            Skills growing
          </Text>
        </View>
        <View style={styles.chips}>
          <Chip bg="#2563EB" label="Coding" />
          <Chip bg="#7C3AED" label="Creativity" />
          <Chip bg="#6366F1" label="Digital Literacy" />
        </View>
      </View>

      {/* Next steps */}
      <View style={[styles.rep, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.rh}>
          <View style={[styles.ric, { backgroundColor: 'rgba(249,115,22,0.15)' }]}>
            <Icon name="house2" size={18} color={colors.ignite} strokeWidth={2} />
          </View>
          <Text style={[styles.rt, { color: colors.text, fontFamily: fonts.display }]}>
            Next steps
          </Text>
        </View>
        <Text style={[styles.rb, { color: colors.text, fontFamily: fonts.ui }]}>
          Try a simple robotics motor loop at home.
        </Text>
      </View>

      <Text style={[styles.footnote, { color: colors.textSubtle, fontFamily: fonts.ui }]}>
        Based on term data · sources on request
      </Text>
    </View>
  );
}

function Chip({ bg, label }) {
  const { fonts } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipText, { fontFamily: fonts.ui700 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '900', paddingVertical: 2 },
  sub2: { fontSize: 12.5, marginBottom: 14 },
  pubRow: { flexDirection: 'row', marginBottom: 10 },
  pub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(22,163,74,0.14)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pubText: { fontSize: 11, fontWeight: '700' },
  trust: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    marginBottom: 13,
  },
  trustText: { fontSize: 12.5, fontWeight: '600', flexShrink: 1 },
  rep: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginBottom: 11,
  },
  rh: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 7,
  },
  ric: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rt: { fontSize: 15, fontWeight: '900' },
  rb: { fontSize: 12.5, lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
    marginRight: 4,
    marginTop: 3,
  },
  chipText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  footnote: { fontSize: 11, textAlign: 'center' },
});
