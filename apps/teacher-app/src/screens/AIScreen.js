import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, EmptyState, withAlpha } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { IconShield, IconSend } from '../components/Icon';
import { useApi, useAction } from '../api/useApi';
import { listAiMessages, sendAiMessage } from '../api/endpoints';

export default function AIScreen({ params }) {
  const { colors } = useTheme();
  const lessonId = params?.lessonId ?? null;
  const [input, setInput] = useState('');

  const thread = useApi(() => listAiMessages(lessonId ? { lessonId } : undefined), [lessonId], {
    initial: [],
  });

  const send = useAction(async (text) => {
    await sendAiMessage(text, lessonId);
    await thread.reload();
  });

  async function onSend() {
    const text = input.trim();
    if (!text) return;
    try {
      await send.run(text);
      setInput('');
    } catch {
      // Rendered inline; the question stays in the box.
    }
  }

  // The server returns newest-first; a conversation reads oldest-first.
  const messages = [...(thread.data ?? [])].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

  return (
    <View>
      <PageTitle>Lesson assistant</PageTitle>

      {thread.loading && !messages.length ? <Loading label="Loading conversation…" /> : null}
      {thread.error && !messages.length ? (
        <ErrorState error={thread.error} onRetry={thread.reload} />
      ) : null}
      {!thread.loading && !thread.error && !messages.length ? (
        <EmptyState title="No conversation yet" sub="Ask for lesson ideas, explanations or classroom tips." />
      ) : null}

      {messages.map((m) => {
        const mine = m.role === 'user';
        return (
          <View
            key={m.id}
            style={{
              alignSelf: mine ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              backgroundColor: mine ? colors.brandSoft : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              padding: 11,
              marginBottom: 9,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>{m.content}</Text>
          </View>
        );
      })}

      {send.pending ? <Loading label="Thinking…" /> : null}
      {send.error ? <ErrorState error={send.error} /> : null}

      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: withAlpha(colors.warning, 0.1), borderWidth: 1, borderColor: withAlpha(colors.warning, 0.34), borderRadius: 12, padding: 11, marginBottom: 12, marginTop: 6 }}>
        <IconShield size={16} color={colors.warning} />
        <Text style={{ fontSize: 12, color: colors.warning, fontFamily: fonts.body600, fontWeight: '600', flex: 1 }}>
          AI suggestions help you plan. You decide what to use. Nothing is published to learners.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.border, borderRadius: 999, paddingLeft: 15, paddingRight: 6, paddingVertical: 6, backgroundColor: colors.surface }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your question"
          placeholderTextColor={colors.textSubtle}
          onSubmitEditing={onSend}
          style={{ flex: 1, fontSize: 13, color: colors.text }}
        />
        <Pressable
          onPress={onSend}
          disabled={!input.trim() || send.pending}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !input.trim() || send.pending ? 0.5 : 1,
          }}
        >
          <IconSend size={17} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
