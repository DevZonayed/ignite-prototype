import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, withAlpha } from '../components/ui';
import { IconCheck } from '../components/Icon';

function HwRow({ badge, badgeBg, badgeColor, title, meta, action, actionColor, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}
    >
      <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: badgeBg, alignItems: 'center', justifyContent: 'center' }}>
        {typeof badge === 'string' ? (
          <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: badgeColor }}>{badge}</Text>
        ) : (
          badge
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>{title}</Text>
        <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>{meta}</Text>
      </View>
      {action ? <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: actionColor }}>{action}</Text> : null}
    </Pressable>
  );
}

export default function HomeworkScreen({ navTo }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState('pending');

  return (
    <View>
      <PageTitle>Homework</PageTitle>

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {[['pending', 'Pending (4)'], ['reviewed', 'Reviewed']].map(([id, label]) => {
          const on = tab === id;
          return (
            <Pressable key={id} onPress={() => setTab(id)} style={{ paddingVertical: 9, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: on ? colors.brand : 'transparent', marginBottom: -1 }}>
              <Text style={{ fontSize: 13, fontFamily: fonts.body700, fontWeight: '700', color: on ? colors.brand : colors.textSubtle }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'pending' ? (
        <View>
          <HwRow badge=".sb3" badgeBg={colors.brandSoft} badgeColor={colors.brand} title="Amara Eze — Maze game" meta="Scratch · submitted 2h ago" action="Review" actionColor={colors.warning} />
          <HwRow badge="IMG" badgeBg={colors.brandSoft} badgeColor={colors.brand} title="Chidi Okonkwo — Reading Lamp" meta="Photo + video · submitted today" action="Review" actionColor={colors.warning} onPress={() => navTo('hw-review')} />
          <HwRow badge=".py" badgeBg={colors.brandSoft} badgeColor={colors.brand} title="Ngozi Bello — Number guesser" meta="Python · submitted today" action="Review" actionColor={colors.warning} />
        </View>
      ) : (
        <View>
          <HwRow badge={<IconCheck size={16} color={colors.success} strokeWidth={3} />} badgeBg={withAlpha(colors.success, 0.15)} title="Fatima Sani — Sprite walk" meta="Feedback published" />
          <HwRow badge={<IconCheck size={16} color={colors.success} strokeWidth={3} />} badgeBg={withAlpha(colors.success, 0.15)} title="Tunde Adeyemi — Costume swap" meta="Feedback published" />
        </View>
      )}
    </View>
  );
}
