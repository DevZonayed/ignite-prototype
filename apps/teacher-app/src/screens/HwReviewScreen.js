import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, EmptyState, Button, Card, SectionTitle, withAlpha } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { useApi, useAction } from '../api/useApi';
import {
  getSubmission,
  listSubmissionMessages,
  sendSubmissionMessage,
  publishFeedback,
} from '../api/endpoints';
import { displayName } from '../lib/user';

export default function HwReviewScreen({ goBack, showToast, params, user }) {
  const { colors } = useTheme();
  const submissionId = params?.submissionId ?? null;

  const submission = useApi(() => getSubmission(submissionId), [submissionId], {
    skip: !submissionId,
  });
  const thread = useApi(() => listSubmissionMessages(submissionId), [submissionId], {
    skip: !submissionId,
    initial: [],
  });

  const [draft, setDraft] = useState('');

  const send = useAction(async (text) => {
    await sendSubmissionMessage(submissionId, text, user ? displayName(user) : undefined);
    await thread.reload();
  });
  const publish = useAction(async () => {
    await publishFeedback(submissionId);
    await submission.reload();
  });

  async function onSend() {
    const text = draft.trim();
    if (!text) return;
    try {
      await send.run(text);
      setDraft('');
    } catch {
      // Rendered inline; the draft stays in the box so nothing is lost.
    }
  }

  async function onPublish() {
    try {
      await publish.run();
      showToast('Feedback published');
      setTimeout(goBack, 240);
    } catch {
      // Rendered inline.
    }
  }

  if (!submissionId) {
    return (
      <View>
        <SubHead title="Review submission" onBack={goBack} />
        <EmptyState
          title="No submission selected"
          sub="Open a pending submission from the Homework tab to review it and message the parent."
        />
      </View>
    );
  }

  if (submission.loading && !submission.data) {
    return (
      <View>
        <SubHead title="Review submission" onBack={goBack} />
        <Loading label="Loading submission…" />
      </View>
    );
  }

  if (submission.error && !submission.data) {
    return (
      <View>
        <SubHead title="Review submission" onBack={goBack} />
        <ErrorState error={submission.error} onRetry={submission.reload} />
      </View>
    );
  }

  const s = submission.data ?? {};
  const reviewed = s.reviewStatus === 'reviewed';
  const messages = thread.data ?? [];

  return (
    <View>
      <SubHead title="Review submission" onBack={goBack} />

      <Card>
        <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 15, color: colors.text, marginBottom: 4 }}>
          {s.learner ? displayName(s.learner) : 'Learner'}
        </Text>
        <Text style={{ fontSize: 12.5, color: colors.textMuted }}>
          {[s.fileName, s.fileType, s.fileSizeMb ? `${s.fileSizeMb} MB` : null].filter(Boolean).join(' · ') ||
            'No file attached'}
        </Text>
        {reviewed ? (
          <View style={{ alignSelf: 'flex-start', marginTop: 9, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: withAlpha(colors.success, 0.15) }}>
            <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.success }}>Reviewed</Text>
          </View>
        ) : null}
      </Card>

      <SectionTitle>Messages</SectionTitle>
      {thread.loading && !messages.length ? <Loading label="Loading thread…" /> : null}
      {thread.error && !messages.length ? <ErrorState error={thread.error} onRetry={thread.reload} /> : null}
      {!thread.loading && !messages.length ? (
        <Text style={{ fontSize: 12.5, color: colors.textSubtle, marginBottom: 12 }}>
          No messages yet. Start the conversation below.
        </Text>
      ) : null}

      {messages.map((m) => {
        const mine = m.senderType === 'teacher';
        return (
          <View
            key={m.id}
            style={{
              alignSelf: mine ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              backgroundColor: mine ? colors.brandSoft : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 10,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.textSubtle, marginBottom: 3 }}>
              {m.senderName || (mine ? 'You' : 'Parent')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>{m.body}</Text>
          </View>
        );
      })}

      {send.error ? <ErrorState error={send.error} /> : null}

      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Write a message to the parent…"
        placeholderTextColor={colors.textSubtle}
        multiline
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 12,
          minHeight: 72,
          color: colors.text,
          backgroundColor: colors.surface,
          marginBottom: 11,
          marginTop: 6,
          textAlignVertical: 'top',
        }}
      />
      <Button variant="ghost" disabled={!draft.trim() || send.pending} onPress={onSend} style={{ marginBottom: 11 }}>
        {send.pending ? 'Sending…' : 'Send message'}
      </Button>

      {publish.error ? <ErrorState error={publish.error} /> : null}
      {!reviewed ? (
        <Button variant="primary" disabled={publish.pending} onPress={onPublish}>
          {publish.pending ? 'Publishing…' : 'Mark reviewed'}
        </Button>
      ) : null}
    </View>
  );
}
