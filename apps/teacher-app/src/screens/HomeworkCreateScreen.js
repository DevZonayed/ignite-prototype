import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, Button, SectionTitle, EmptyState, withAlpha } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { IconCheck } from '../components/Icon';
import { useClasses } from '../context/ClassContext';
import { useApi, useAction } from '../api/useApi';
import { getLessonMedia, createHomework, getCurrentSession } from '../api/endpoints';

const MEDIA_COLORS = {
  video: '#2563EB',
  gif: '#7C3AED',
  image: '#0891B2',
  document: '#B45309',
};

export default function HomeworkCreateScreen({ goBack, showToast, params }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();

  // Homework belongs to a lesson. Use the one we were opened from, else the
  // lesson currently being taught.
  const session = useApi(() => getCurrentSession(activeClassId), [activeClassId], {
    skip: !activeClassId || !!params?.lessonId,
  });
  const lessonId = params?.lessonId ?? session.data?.lessonId ?? null;

  const media = useApi(() => getLessonMedia(lessonId), [lessonId], {
    skip: !lessonId,
    initial: [],
  });

  const [attached, setAttached] = useState({});
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');

  const attachedIds = Object.keys(attached).filter((id) => attached[id]);
  const canPublish = !!title.trim() && !!lessonId && !!activeClassId;

  const publish = useAction(() =>
    createHomework({
      lessonId,
      classId: activeClassId,
      title: title.trim(),
      ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
      // Published rather than draft: this screen's button says "Publish".
      status: 'published',
      ...(attachedIds.length ? { attachedMediaIds: attachedIds } : {}),
    }),
  );

  async function onPublish() {
    try {
      await publish.run();
      showToast('Homework published');
      setTimeout(goBack, 240);
    } catch {
      // Rendered inline; the form keeps what was typed.
    }
  }

  const items = media.data ?? [];

  return (
    <View>
      <SubHead title="Assign homework" onBack={goBack} />

      {!lessonId && !session.loading ? (
        <EmptyState
          title="No lesson selected"
          sub="Homework is attached to a lesson. Start or open a lesson first."
        />
      ) : null}

      <Card>
        <SectionTitle style={{ margin: 0, marginBottom: 6 }}>Title</SectionTitle>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Type title"
          placeholderTextColor={colors.textSubtle}
          style={{ fontSize: 13, color: colors.text }}
        />
      </Card>

      <Card>
        <SectionTitle style={{ margin: 0, marginBottom: 6 }}>Instructions</SectionTitle>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          multiline
          placeholder="Type instructions"
          placeholderTextColor={colors.textSubtle}
          style={{ fontSize: 13, color: colors.text, minHeight: 52, textAlignVertical: 'top' }}
        />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 14, color: colors.text }}>Attach lesson media</Text>
          <View style={{ backgroundColor: colors.ignite, borderRadius: 20, paddingVertical: 2, paddingHorizontal: 8 }}>
            <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 10, color: '#fff' }}>helps parents</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 9 }}>
          Tap any lesson video or GIF to attach it. Parents see it as a "how to help at home" guide.{' '}
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', color: colors.brand }}>
            {attachedIds.length} attached
          </Text>
        </Text>

        {media.loading ? <Loading label="Loading lesson media…" /> : null}
        {media.error ? <ErrorState error={media.error} onRetry={media.reload} /> : null}
        {!media.loading && !media.error && items.length === 0 ? (
          <EmptyState
            title="No lesson media available"
            sub="Media attached to this lesson will be listed here."
            style={{ marginBottom: 0 }}
          />
        ) : null}

        <View style={{ gap: 7 }}>
          {items.map((m) => {
            const on = !!attached[m.id];
            const swatch = MEDIA_COLORS[m.type] ?? colors.brand;
            return (
              <Pressable
                key={m.id}
                onPress={() => setAttached((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  borderWidth: 1.5,
                  borderColor: on ? colors.ignite : colors.border,
                  backgroundColor: on ? withAlpha(colors.ignite, 0.08) : colors.surface,
                  borderRadius: 11,
                  paddingVertical: 9,
                  paddingHorizontal: 11,
                }}
              >
                <View style={{ width: 30, height: 24, borderRadius: 6, backgroundColor: swatch, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 8, fontFamily: fonts.body700, fontWeight: '800' }}>
                    {String(m.type ?? '').slice(0, 3).toUpperCase()}
                  </Text>
                </View>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 12.5, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>
                  {m.title || m.fileName || 'Untitled'}
                </Text>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: on ? colors.ignite : colors.border, backgroundColor: on ? colors.ignite : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <IconCheck size={11} color="#fff" strokeWidth={3} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {publish.error ? <ErrorState error={publish.error} /> : null}

      <Button variant="primary" disabled={!canPublish || publish.pending} onPress={onPublish}>
        {publish.pending ? 'Publishing…' : 'Publish homework'}
      </Button>
    </View>
  );
}
