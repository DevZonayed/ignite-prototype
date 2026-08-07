import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, SectionTitle, GradientBox, withAlpha } from '../components/ui';
import { IconShield } from '../components/Icon';

export default function EvidenceScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  return (
    <View>
      <SubHead
        title="Add evidence"
        onBack={goBack}
        right={<Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.textSubtle }}>Offline</Text>}
      />

      <GradientBox colors={['#1e293b', '#0f172a']} idSuffix="ev" radius={14} style={{ height: 170, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>
        <View>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#93c5fd', lineHeight: 19 }}>
            <Text style={{ color: '#f0abfc' }}>when</Text> green flag clicked{'\n'}
            {'  '}<Text style={{ color: '#f0abfc' }}>repeat</Text> <Text style={{ color: '#fbbf24' }}>10</Text>{'\n'}
            {'    '}move <Text style={{ color: '#fbbf24' }}>10</Text> steps{'\n'}
            {'    '}next costume
          </Text>
        </View>
      </GradientBox>

      <SectionTitle>Tag learners</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 13 }}>
        <View style={{ backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>Amara Eze ✕</Text>
        </View>
        <View style={{ backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>Chidi O. ✕</Text>
        </View>
        <View style={{ borderWidth: 1.5, borderColor: colors.brand, borderStyle: 'dashed', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: colors.brand }}>+ Add</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: withAlpha(colors.warning, 0.1), borderWidth: 1, borderColor: withAlpha(colors.warning, 0.34), borderRadius: 12, padding: 11, marginBottom: 12 }}>
        <IconShield size={16} color={colors.warning} />
        <Text style={{ fontSize: 12, color: colors.warning, fontFamily: fonts.body600, fontWeight: '600', flex: 1 }}>Consent-checked · faces protected</Text>
      </View>

      <Button variant="primary" onPress={() => { showToast('Queued · will sync when online'); setTimeout(goBack, 240); }}>
        Upload
      </Button>
    </View>
  );
}
