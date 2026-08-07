import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button } from '../components/ui';
import { dims } from '../data';

export default function RubricScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  const [scores, setScores] = useState(() => dims.map((d) => d[2]));

  return (
    <View>
      <SubHead title="LQS rubric" onBack={goBack} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 14 }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 15, color: '#166534' }}>AE</Text>
        </View>
        <View>
          <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 15, color: colors.text }}>Amara Eze</Text>
          <Text style={{ fontSize: 12, color: colors.textSubtle }}>Term 2 · rate 1–4</Text>
        </View>
      </View>

      {dims.map((d, i) => (
        <View key={i} style={{ marginBottom: 11 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: d[1] }} />
            <Text style={{ fontSize: 13, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>{d[0]}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4].map((n) => {
              const on = scores[i] === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setScores((prev) => prev.map((s, idx) => (idx === i ? n : s)))}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderWidth: 1.5, borderColor: on ? colors.brand : colors.border, borderRadius: 8, backgroundColor: on ? colors.brand : 'transparent' }}
                >
                  <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: on ? '#fff' : colors.textSubtle }}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Button variant="primary" onPress={() => { showToast('Rubric saved · next learner'); setTimeout(goBack, 240); }}>
        Save & next learner →
      </Button>
    </View>
  );
}
