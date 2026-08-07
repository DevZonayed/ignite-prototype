import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, PageSub } from '../components/ui';
import { att, assessScores } from '../data';

export default function AssessmentScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  const [scores, setScores] = useState(() => att.map((_, i) => assessScores[i] || 3));

  return (
    <View>
      <SubHead title="Assess learners" onBack={goBack} />
      <PageSub style={{ marginBottom: 10 }}>Smart Reading Lamp · quick outcome (1–4) per learner</PageSub>

      {att.map((a, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 9 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: a[2], alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 12, color: a[3] }}>{a[1]}</Text>
          </View>
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, flex: 1, color: colors.text }}>{a[0]}</Text>
          <View style={{ flexDirection: 'row', gap: 6, flex: 1.1 }}>
            {[1, 2, 3, 4].map((n) => {
              const on = scores[i] === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setScores((prev) => prev.map((s, idx) => (idx === i ? n : s)))}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderWidth: 1.5, borderColor: on ? colors.brand : colors.border, borderRadius: 9, backgroundColor: on ? colors.brand : 'transparent' }}
                >
                  <Text style={{ fontSize: 13, fontFamily: fonts.display800, fontWeight: '800', color: on ? '#fff' : colors.textSubtle }}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12, marginHorizontal: -18, paddingHorizontal: 18, marginTop: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 15, color: colors.text }}>6 / 32 assessed</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Button variant="primary" onPress={() => { showToast('Assessments saved'); setTimeout(goBack, 240); }} style={{ width: 'auto', paddingHorizontal: 18 }}>
            Save
          </Button>
        </View>
      </View>
    </View>
  );
}
