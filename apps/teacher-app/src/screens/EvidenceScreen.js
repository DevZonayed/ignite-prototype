import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, SectionTitle, GradientBox, withAlpha } from '../components/ui';
import { IconShield, IconCamera } from '../components/Icon';

export default function EvidenceScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  return (
    <View>
      <SubHead title="Add evidence" onBack={goBack} />

      <GradientBox colors={['#1e293b', '#0f172a']} idSuffix="ev" radius={14} style={{ height: 170, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>
        <IconCamera size={30} color="#94a3b8" />
        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>No evidence captured yet</Text>
      </GradientBox>

      <SectionTitle>Tag learners</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 13 }}>
        <Text style={{ fontSize: 12.5, color: colors.textSubtle }}>Learners from your roster will appear here.</Text>
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
