import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from '../components/Icon';
import { initialThread, teacherReply } from '../data';
import { useTheme } from '../ThemeContext';

// HOMEWORK screen — Smart Reading Lamp: instructions, teacher media, upload, 2-way thread, submit.
export default function Homework({ showToast }) {
  const { colors, fonts } = useTheme();
  const [thread, setThread] = useState(initialThread);
  const [msg, setMsg] = useState('');

  const send = () => {
    const v = msg.trim();
    if (!v) return;
    setThread((prev) => [...prev, ['p', 'You', v]]);
    setMsg('');
    showToast('Message sent to teacher');
    setTimeout(() => {
      setThread((prev) => [...prev, teacherReply]);
    }, 1400);
  };

  return (
    <View>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
        Smart Reading Lamp
      </Text>
      <Text style={[styles.sub2, { color: colors.textMuted, fontFamily: fonts.ui }]}>
        Robotics · Mission 5 · due Fri 18 Jul
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardText, { color: colors.textMuted, fontFamily: fonts.ui }]}>
          Rebuild the lamp from the LG-305 manual, test it 5×, then upload a photo and a 60–90s
          video of your child explaining it.
        </Text>
      </View>

      {/* How to help */}
      <View style={styles.helpHead}>
        <Text style={[styles.helpTitle, { color: colors.text, fontFamily: fonts.display800 }]}>
          How to help at home{' '}
        </Text>
        <View style={[styles.helpBadge, { backgroundColor: colors.ignite }]}>
          <Text style={[styles.helpBadgeText, { fontFamily: fonts.display800 }]}>
            from the teacher
          </Text>
        </View>
      </View>

      <View style={styles.mediaGrid}>
        <Pressable
          style={[styles.mediaCard, { borderColor: colors.border }]}
          onPress={() => showToast('Playing · Testing your lamp')}
        >
          <View style={[styles.mediaThumb, { backgroundColor: '#b45309' }]}>
            <View style={styles.playCircle}>
              <Icon name="play" size={14} fill="#172554" />
            </View>
          </View>
          <View style={styles.mediaMeta}>
            <Text style={[styles.mediaLabel, { color: colors.text, fontFamily: fonts.ui700 }]}>
              Testing your lamp · 2:20
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.mediaCard, { borderColor: colors.border }]}
          onPress={() => showToast('Playing · Button-press demo')}
        >
          <View style={[styles.mediaThumb, { backgroundColor: '#7c3aed' }]}>
            <Text style={[styles.gif, { fontFamily: fonts.display }]}>GIF</Text>
          </View>
          <View style={styles.mediaMeta}>
            <Text style={[styles.mediaLabel, { color: colors.text, fontFamily: fonts.ui700 }]}>
              Button-press demo
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Upload drop */}
      <Pressable
        style={[styles.drop, { borderColor: colors.brand }]}
        onPress={() => showToast('Choose a photo or file')}
      >
        <Text style={[styles.dropText, { color: colors.brand, fontFamily: fonts.ui700 }]}>
          ＋ Add your child's photo or video
        </Text>
      </Pressable>

      {/* In-progress upload */}
      <View style={[styles.upload, { borderColor: colors.border }]}>
        <View style={[styles.uic, { backgroundColor: colors.brandSoft }]}>
          <Text style={[styles.uicText, { color: colors.brand, fontFamily: fonts.ui700 }]}>
            IMG
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.upName, { color: colors.text, fontFamily: fonts.ui700 }]}>
            lamp-photo.jpg · 0.9 MB
          </Text>
          <View style={[styles.upbar, { backgroundColor: colors.surface2 }]}>
            <View style={[styles.upbarFill, { backgroundColor: colors.brand }]} />
          </View>
        </View>
      </View>

      {/* Messages */}
      <Text style={[styles.msgHead, { color: colors.text, fontFamily: fonts.display800 }]}>
        Messages with the teacher
      </Text>
      <View style={styles.thread}>
        {thread.map((m, i) => {
          const mine = m[0] === 'p';
          return (
            <View key={i} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.msgName, { color: colors.textSubtle, fontFamily: fonts.ui }]}>
                {m[1]}
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
                  {m[2]}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Message the teacher…"
          placeholderTextColor={colors.textSubtle}
          onSubmitEditing={send}
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
        <Pressable style={[styles.sendBtn, { backgroundColor: colors.brand }]} onPress={send}>
          <Text style={[styles.sendText, { fontFamily: fonts.display }]}>Send</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.submit, { backgroundColor: colors.brand }]}
        onPress={() => showToast('Homework submitted to teacher')}
      >
        <Text style={[styles.submitText, { fontFamily: fonts.display }]}>Submit homework</Text>
      </Pressable>
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
