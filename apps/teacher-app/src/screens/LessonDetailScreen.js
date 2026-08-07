import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, Button, SectionTitle, GradientBox } from '../components/ui';
import { IconImage, IconPlay } from '../components/Icon';
import { vids } from '../data';

const secs = ['All'].concat(vids.map((v) => v[2]));

export default function LessonDetailScreen({ navTo, goBack, showToast }) {
  const { colors } = useTheme();
  const [curSec, setCurSec] = useState('All');

  const filtered = vids.filter((v) => curSec === 'All' || v[2] === curSec);

  const glance = [
    ['Input', 'Push button'],
    ['Brain', 'Arduino'],
    ['Output', 'LED'],
    ['Duration', '90 min'],
  ];

  const steps = [
    '1. Identify the problem — reading in the dark.',
    '2. Name the input (push button), brain (Arduino) & output (LED).',
    '3. Build the circuit from the LG-305 manual.',
    '4. Write & upload the PictoBlox program.',
    '5. Test the invention 5× and explain how it works.',
  ];

  const kit = ['Arduino UNO', 'Breadboard', 'Push button', 'LED', '220Ω resistor', 'Jumper wires'];

  return (
    <View>
      <SubHead title="Mission 5" onBack={goBack} />

      <Card>
        <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.brand, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Unit 5 · Robotics · Little Genius Lab™
        </Text>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 19, color: colors.text, marginTop: 4, marginBottom: 2 }}>
          Build a Smart Reading Lamp
        </Text>
        <Text style={{ fontSize: 12.5, color: colors.textMuted }}>Robotics · Arduino + PictoBlox · ~90 min</Text>
      </Card>

      <SectionTitle>At a glance</SectionTitle>
      <Card style={{ paddingVertical: 12, paddingHorizontal: 13 }}>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Essential question</Text>
        <Text style={{ fontSize: 13, fontFamily: fonts.body600, fontWeight: '600', color: colors.text, lineHeight: 19 }}>
          How can we use a button, an LED and Arduino to build a smart reading lamp?
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 11 }}>
          {glance.map(([l, v]) => (
            <View key={l}>
              <Text style={{ fontSize: 11, color: colors.textSubtle }}>{l}</Text>
              <Text style={{ fontSize: 12.5, fontFamily: fonts.body700, fontWeight: '700', color: colors.text }}>{v}</Text>
            </View>
          ))}
        </View>
      </Card>

      <SectionTitle>Steps</SectionTitle>
      <Card>
        {steps.map((s, i) => (
          <Text key={i} style={{ fontSize: 13, lineHeight: 25, color: colors.text }}>{s}</Text>
        ))}
      </Card>

      <SectionTitle>Kit components</SectionTitle>
      <Card style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {kit.map((k) => (
          <View key={k} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 11 }}>
            <Text style={{ fontSize: 12, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>{k}</Text>
          </View>
        ))}
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6, marginBottom: 10, marginHorizontal: 2 }}>
        <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 14, color: colors.text }}>Lesson media</Text>
        <View style={{ backgroundColor: colors.ignite, borderRadius: 20, paddingVertical: 2, paddingHorizontal: 8 }}>
          <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 10.5, color: '#fff' }}>flexible</Text>
        </View>
      </View>
      <Text style={{ fontSize: 11.5, color: colors.textMuted, marginBottom: 10, lineHeight: 18 }}>
        A lesson can hold as many videos and images as it needs — this one has 6 videos + 2 images, grouped by section. Curated in the IGNITE Admin portal, then it appears here for you.
      </Text>

      {/* media section tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }} contentContainerStyle={{ gap: 6, paddingBottom: 8 }}>
        {secs.map((s) => {
          const on = s === curSec;
          return (
            <Pressable
              key={s}
              onPress={() => setCurSec(s)}
              style={{
                borderRadius: 20,
                paddingVertical: 6,
                paddingHorizontal: 13,
                borderWidth: 1,
                borderColor: on ? colors.ignite : colors.border,
                backgroundColor: on ? colors.ignite : 'transparent',
              }}
            >
              <Text style={{ fontSize: 11.5, fontFamily: fonts.body700, fontWeight: '700', color: on ? '#fff' : colors.textMuted }}>
                {s + (s === 'All' ? ' · 6' : '')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* filtered video list */}
      <View style={{ gap: 8, marginBottom: 13 }}>
        {filtered.map((v) => (
          <Pressable
            key={v[0]}
            onPress={() => showToast('Playing · ' + v[0])}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 9, paddingHorizontal: 11 }}
          >
            <GradientBox colors={[v[3], 'rgba(0,0,0,0.35)']} radius={8} idSuffix={'v' + v[0]} style={{ width: 54, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.92)', alignItems: 'center', justifyContent: 'center' }}>
                  <IconPlay size={11} />
                </View>
              </View>
            </GradientBox>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 12.5, fontFamily: fonts.body700, fontWeight: '700', color: colors.text }}>{v[0]}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{v[1]} · MP4</Text>
            </View>
            <View style={{ backgroundColor: colors.surface2, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 9 }}>
              <Text style={{ fontSize: 10, fontFamily: fonts.body700, fontWeight: '700', color: colors.textSubtle }}>{v[2]}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={{ fontSize: 10.5, fontFamily: fonts.body700, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.textSubtle, marginBottom: 7 }}>
        Images & GIFs · 2
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 11 }}>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
          <GradientBox colors={['#7c3aed', '#a78bfa']} idSuffix="gif" style={{ height: 74, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontWeight: '900', color: '#fff', fontSize: 20, letterSpacing: 1 }}>GIF</Text>
            <View style={{ position: 'absolute', bottom: 6, right: 8, backgroundColor: 'rgba(0,0,0,.35)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 5 }}>
              <Text style={{ fontSize: 10, color: '#fff' }}>button</Text>
            </View>
          </GradientBox>
          <Text style={{ padding: 8, paddingHorizontal: 10, fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: colors.text }}>Button-press demo</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
          <GradientBox colors={['#0ea5e9', '#38bdf8']} idSuffix="jpg" style={{ height: 74, alignItems: 'center', justifyContent: 'center' }}>
            <IconImage size={26} color="#fff" strokeWidth={1.8} />
            <View style={{ position: 'absolute', bottom: 6, right: 8, backgroundColor: 'rgba(0,0,0,.35)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 5 }}>
              <Text style={{ fontSize: 10, color: '#fff' }}>JPG</Text>
            </View>
          </GradientBox>
          <Text style={{ padding: 8, paddingHorizontal: 10, fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: colors.text }}>LG-305 wiring diagram</Text>
        </View>
      </View>

      <SectionTitle style={{ marginTop: 2 }}>Documents</SectionTitle>
      <Card style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 11 }}>
          <View style={{ backgroundColor: '#ef4444', borderRadius: 5, paddingVertical: 2, paddingHorizontal: 5 }}>
            <Text style={{ color: '#fff', fontSize: 9, fontFamily: fonts.body700, fontWeight: '700' }}>PDF</Text>
          </View>
          <Text style={{ fontSize: 12, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>LG-305 manual</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 11 }}>
          <View style={{ backgroundColor: '#2563EB', borderRadius: 5, paddingVertical: 2, paddingHorizontal: 5 }}>
            <Text style={{ color: '#fff', fontSize: 9, fontFamily: fonts.body700, fontWeight: '700' }}>.sb3</Text>
          </View>
          <Text style={{ fontSize: 12, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>Reading-lamp program</Text>
        </View>
      </Card>

      <Button variant="ghost" onPress={() => navTo('ai')} style={{ marginBottom: 11 }}>
        ✨ Ask the AI assistant
      </Button>
      <Button variant="ignite" onPress={() => navTo('active')}>
        ▶ Start lesson
      </Button>
    </View>
  );
}
