import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from '../components/Icon';
import { useTheme } from '../ThemeContext';
import { useChildren } from '../context/ChildContext';
import { useApi, useAction } from '../api/useApi';
import {
  listHomework,
  listSubmissions,
  listSubmissionMessages,
  sendSubmissionMessage,
  createSubmission,
} from '../api/endpoints';
import { Loading, ErrorState, EmptyState } from '../components/ScreenState';
import { displayName } from '../lib/user';

/** "2026-07-18" → "Fri 18 Jul". */
function formatDue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// HOMEWORK screen — the child's current homework, the upload, and the 2-way
// message thread with the teacher.
export default function Homework({ user, showToast }) {
  const { colors, fonts } = useTheme();
  const { activeChild, activeChildId, loading: childrenLoading } = useChildren();

  const homework = useApi(() => listHomework(activeChildId), [activeChildId], {
    skip: !activeChildId,
    initial: [],
  });
  // The newest published assignment is the one a parent is being asked about.
  const current = (homework.data ?? [])[0] ?? null;

  const submissions = useApi(() => listSubmissions(current?.id), [current?.id], {
    skip: !current?.id,
    initial: [],
  });
  // A parent only ever sees their own child's submission on this screen.
  const submission = (submissions.data ?? []).find(
    (sub) => (sub.learnerId ?? sub.learner?.id) === activeChildId,
  ) ?? null;

  const thread = useApi(() => listSubmissionMessages(submission?.id), [submission?.id], {
    skip: !submission?.id,
    initial: [],
  });

  const [msg, setMsg] = useState('');
  const [pickError, setPickError] = useState(null);

  const send = useAction(async (text) => {
    await sendSubmissionMessage(submission.id, text, user ? displayName(user) : undefined);
    await thread.reload();
  });

  const upload = useAction(async (asset) => {
    await createSubmission(current.id, {
      learnerId: activeChildId,
      fileType: asset.type === 'video' ? 'video' : 'image',
      // The server stores a reference, not the bytes — it has no file storage
      // yet. This URI is meaningful on this device only until that exists.
      fileUrl: asset.uri,
      fileName: asset.fileName ?? 'upload',
      ...(asset.fileSize ? { fileSizeMb: Number((asset.fileSize / 1048576).toFixed(2)) } : {}),
    });
    await submissions.reload();
  });

  async function onSend() {
    const v = msg.trim();
    if (!v || !submission) return;
    try {
      await send.run(v);
      setMsg('');
      showToast('Message sent to teacher');
    } catch {
      // Rendered inline; the draft stays put.
    }
  }

  async function onPick() {
    setPickError(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setPickError(new Error('Photo access is off for IGNITE. Turn it on in Settings.'));
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
      if (res.canceled || !res.assets?.length) return;
      await upload.run(res.assets[0]);
      showToast('Homework submitted to teacher');
    } catch (err) {
      setPickError(err);
    }
  }

  if (childrenLoading && !activeChild) return <Loading label="Loading…" />;
  if (!activeChild) {
    return (
      <EmptyState
        title="No children linked yet"
        sub="Ask your school to link your account to your child's record."
      />
    );
  }
  if (homework.loading && !homework.data?.length) return <Loading label="Loading homework…" />;
  if (homework.error) return <ErrorState error={homework.error} onRetry={homework.reload} />;
  if (!current) {
    return (
      <View>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
          Homework
        </Text>
        <EmptyState
          title="Nothing set right now"
          sub="Homework your child's teacher sets will appear here."
        />
      </View>
    );
  }

  const messages = thread.data ?? [];

  return (
    <View>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
        {current.title}
      </Text>
      <Text style={[styles.sub2, { color: colors.textMuted, fontFamily: fonts.ui }]}>
        {[displayName(activeChild), current.dueDate ? `due ${formatDue(current.dueDate)}` : null]
          .filter(Boolean)
          .join(' · ')}
      </Text>

      {current.instructions ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardText, { color: colors.textMuted, fontFamily: fonts.ui }]}>
            {current.instructions}
          </Text>
        </View>
      ) : null}

      {/* Upload drop */}
      <Pressable
        disabled={upload.pending}
        style={[styles.drop, { borderColor: colors.brand, opacity: upload.pending ? 0.5 : 1 }]}
        onPress={onPick}
      >
        <Text style={[styles.dropText, { color: colors.brand, fontFamily: fonts.ui700 }]}>
          {upload.pending ? 'Submitting…' : "＋ Add your child's photo or video"}
        </Text>
      </Pressable>

      {pickError ? <ErrorState error={pickError} /> : null}
      {upload.error ? <ErrorState error={upload.error} /> : null}

      {/* What has already been sent in */}
      {submission ? (
        <View style={[styles.upload, { borderColor: colors.border }]}>
          <View style={[styles.uic, { backgroundColor: colors.brandSoft }]}>
            <Text style={[styles.uicText, { color: colors.brand, fontFamily: fonts.ui700 }]}>
              {String(submission.fileType ?? 'file').slice(0, 3).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.upName, { color: colors.text, fontFamily: fonts.ui700 }]}>
              {[submission.fileName, submission.fileSizeMb ? `${submission.fileSizeMb} MB` : null]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            <Text style={[styles.cardText, { color: colors.textMuted, fontFamily: fonts.ui }]}>
              {submission.reviewStatus === 'reviewed'
                ? 'Reviewed by the teacher'
                : 'Waiting for the teacher to review'}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Messages */}
      <Text style={[styles.msgHead, { color: colors.text, fontFamily: fonts.display800 }]}>
        Messages with the teacher
      </Text>
      {!submission ? (
        <Text style={[styles.cardText, { color: colors.textMuted, fontFamily: fonts.ui }]}>
          Send your child's work in first — the thread with the teacher opens then.
        </Text>
      ) : null}
      <View style={styles.thread}>
        {messages.map((m) => {
          const mine = m.senderType === 'parent';
          return (
            <View key={m.id} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.msgName, { color: colors.textSubtle, fontFamily: fonts.ui }]}>
                {m.senderName || (mine ? 'You' : 'Teacher')}
              </Text>
              <View
                style={[
                  styles.bubble,
                  mine
                    ? { backgroundColor: colors.brand, borderBottomRightRadius: 4 }
                    : {
                        backgroundColor: colors.surface2,
                        borderBottomLeftRadius: 4,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    { color: mine ? '#fff' : colors.text, fontFamily: fonts.ui },
                  ]}
                >
                  {m.body}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {send.error ? <ErrorState error={send.error} /> : null}

      <View style={styles.inputRow}>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          editable={!!submission}
          placeholder={submission ? 'Type message' : 'Available after you submit'}
          placeholderTextColor={colors.textSubtle}
          onSubmitEditing={onSend}
          returnKeyType="send"
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
              fontFamily: fonts.ui,
            },
          ]}
        />
        <Pressable
          disabled={!submission || !msg.trim() || send.pending}
          style={[
            styles.sendBtn,
            { backgroundColor: colors.brand, opacity: !submission || !msg.trim() || send.pending ? 0.5 : 1 },
          ]}
          onPress={onSend}
        >
          <Text style={[styles.sendText, { fontFamily: fonts.display }]}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '900', paddingVertical: 2 },
  sub2: { fontSize: 12.5, marginBottom: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 11,
  },
  cardText: { fontSize: 13, lineHeight: 19 },
  helpHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  helpTitle: { fontSize: 12.5, fontWeight: '800' },
  helpBadge: {
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  helpBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  mediaGrid: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 14,
  },
  mediaCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  mediaThumb: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gif: { color: '#fff', fontSize: 18, fontWeight: '900' },
  mediaMeta: { paddingVertical: 7, paddingHorizontal: 9 },
  mediaLabel: { fontSize: 11.5, fontWeight: '700' },
  drop: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 13,
  },
  dropText: { fontSize: 13, fontWeight: '700' },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    marginBottom: 13,
  },
  uic: {
    width: 40,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uicText: { fontSize: 11, fontWeight: '700' },
  upName: { fontSize: 13, fontWeight: '700' },
  upbar: {
    height: 6,
    borderRadius: 99,
    marginTop: 6,
    overflow: 'hidden',
  },
  upbarFill: { height: '100%', width: '62%' },
  msgHead: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 8,
  },
  thread: {
    gap: 9,
    marginBottom: 11,
  },
  msgName: { fontSize: 10.5, marginBottom: 3 },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 13,
  },
  bubbleText: { fontSize: 12.5, lineHeight: 19 },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 13,
    fontSize: 13,
  },
  sendBtn: {
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  submit: {
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
