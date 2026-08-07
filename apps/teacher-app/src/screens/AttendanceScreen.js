import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button } from '../components/ui';
import { att } from '../data';

const SEG = [
  ['p', 'P', '#16a34a'],
  ['a', 'A', '#dc2626'],
  ['l', 'L', '#d97706'],
];

export default function AttendanceScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  const [status, setStatus] = useState(() => att.map((a) => a[4]));

  function markAll() {
    setStatus(att.map(() => 'p'));
  }

  return (
    <View style={{ flex: 1 }}>
      <SubHead title="Attendance" onBack={goBack} />
      <Button variant="ghost" onPress={markAll} style={{ marginBottom: 12 }}>
        ✓ Mark all present
      </Button>

      {att.map((a, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 9 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: a[2], alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 12, color: a[3] }}>{a[1]}</Text>
          </View>
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, flex: 1, color: colors.text }}>{a[0]}</Text>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {SEG.map(([code, label, activeBg]) => {
              const on = status[i] === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => setStatus((prev) => prev.map((s, idx) => (idx === i ? code : s)))}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 7,
                    borderWidth: 1.5,
                    borderColor: on ? activeBg : colors.border,
                    borderRadius: 7,
                    backgroundColor: on ? activeBg : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 10, fontFamily: fonts.body700, fontWeight: '700', color: on ? '#fff' : colors.textSubtle }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12, marginHorizontal: -18, paddingHorizontal: 18, marginTop: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 15, color: colors.text }}>18 / 32 marked</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Button
            variant="primary"
            onPress={() => { showToast('Attendance saved · 32 learners'); setTimeout(goBack, 240); }}
            style={{ width: 'auto', paddingHorizontal: 18 }}
          >
            Save attendance
          </Button>
        </View>
      </View>
    </View>
  );
}
