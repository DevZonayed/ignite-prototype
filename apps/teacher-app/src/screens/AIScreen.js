import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, withAlpha } from '../components/ui';
import { IconBook, IconShield, IconSend } from '../components/Icon';

function Sug({ title, sub }) {
  const { colors } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 11, padding: 10, marginTop: 9 }}>
      <Text style={{ fontFamily: fonts.display800, fontWeight: '800', color: colors.brand, fontSize: 13 }}>{title}</Text>
      <Text style={{ fontSize: 12.5, marginTop: 2, color: colors.text }}>{sub}</Text>
    </View>
  );
}

export default function AIScreen() {
  const { colors } = useTheme();
  return (
    <View>
      <PageTitle>Lesson assistant</PageTitle>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 12 }}>
        <IconBook size={14} color={colors.brand} />
        <Text style={{ fontSize: 12, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>This lesson · Build a Smart Reading Lamp</Text>
      </View>

      <View style={{ alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: colors.brandSoft, borderRadius: 16, borderBottomRightRadius: 4, paddingVertical: 11, paddingHorizontal: 13, marginBottom: 12 }}>
        <Text style={{ color: colors.brand700, fontSize: 13.5 }}>Give me 3 simple ways to explain a loop to JSS 1</Text>
      </View>

      <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, borderBottomLeftRadius: 4, padding: 13, marginBottom: 12 }}>
        <Text style={{ fontSize: 13, color: colors.text }}>Here are three classroom-ready ways:</Text>
        <Sug title="Analogy" sub="A loop is like a song chorus — repeat the steps until you say stop." />
        <Sug title="Scratch demo" sub="Use a repeat 10 block to make the cat walk across the stage." />
        <Sug title="Check question" sub={'"What changes if we use repeat 4 instead?"'} />
      </View>

      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: withAlpha(colors.warning, 0.1), borderWidth: 1, borderColor: withAlpha(colors.warning, 0.34), borderRadius: 12, padding: 11, marginBottom: 12 }}>
        <IconShield size={16} color={colors.warning} />
        <Text style={{ fontSize: 12, color: colors.warning, fontFamily: fonts.body600, fontWeight: '600', flex: 1 }}>
          AI suggestions help you plan — you decide what to use. Nothing is published to learners.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.border, borderRadius: 999, paddingLeft: 15, paddingRight: 6, paddingVertical: 6, backgroundColor: colors.surface }}>
        <Text style={{ flex: 1, fontSize: 13, color: colors.textSubtle }}>Ask about this lesson…</Text>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
          <IconSend size={17} color="#fff" />
        </View>
      </View>
    </View>
  );
}
