import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, EmptyState, withAlpha } from '../components/ui';
import { IconShield, IconSend } from '../components/Icon';

export default function AIScreen({ showToast }) {
  const { colors } = useTheme();
  const [input, setInput] = useState('');

  return (
    <View>
      <PageTitle>Lesson assistant</PageTitle>

      <EmptyState title="No conversation yet" sub="Ask for lesson ideas, explanations or classroom tips." />

      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: withAlpha(colors.warning, 0.1), borderWidth: 1, borderColor: withAlpha(colors.warning, 0.34), borderRadius: 12, padding: 11, marginBottom: 12 }}>
        <IconShield size={16} color={colors.warning} />
        <Text style={{ fontSize: 12, color: colors.warning, fontFamily: fonts.body600, fontWeight: '600', flex: 1 }}>
          AI suggestions help you plan — you decide what to use. Nothing is published to learners.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.border, borderRadius: 999, paddingLeft: 15, paddingRight: 6, paddingVertical: 6, backgroundColor: colors.surface }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about this lesson…"
          placeholderTextColor={colors.textSubtle}
          style={{ flex: 1, fontSize: 13, color: colors.text }}
        />
        <Pressable
          onPress={() => {
            if (!input.trim()) return;
            showToast('AI assistant is not connected yet');
          }}
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}
        >
          <IconSend size={17} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
