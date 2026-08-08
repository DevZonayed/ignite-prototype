import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Card, Button, EmptyState, withAlpha } from '../components/ui';
import { IconCheck } from '../components/Icon';

const ITEMS = [];

export default function ChecklistScreen({ goBack, showToast }) {
  const { colors } = useTheme();
  return (
    <View>
      <SubHead title="Activities" onBack={goBack} />
      {ITEMS.length === 0 ? (
        <EmptyState title="No activities for this lesson" sub="Lesson activities will appear here as you check them off." />
      ) : null}
      {ITEMS.map(([state, label], i) => (
        <Card key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          {state === 'done' ? (
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: withAlpha(colors.success, 0.16), alignItems: 'center', justifyContent: 'center' }}>
              <IconCheck size={13} color={colors.success} strokeWidth={3} />
            </View>
          ) : (
            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.textSubtle }}>{state}</Text>
            </View>
          )}
          <Text style={{ fontSize: 13, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>{label}</Text>
        </Card>
      ))}
      <Button variant="primary" onPress={() => { showToast('Activities saved'); setTimeout(goBack, 240); }}>
        Save activities
      </Button>
    </View>
  );
}
