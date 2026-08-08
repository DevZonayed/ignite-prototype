import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, PageSub, EmptyState, withAlpha } from '../components/ui';
import { IconChevronRight, IconChevronDown, IconCheck, IconLock } from '../components/Icon';
import { units } from '../data';

export default function LessonsScreen({ navTo }) {
  const { colors } = useTheme();
  // any unit flagged 'cur' opens by default
  const [open, setOpen] = useState(() => units.map((u) => u[1] === 'cur'));

  function toggle(i) {
    setOpen((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <View>
      <PageTitle>Lessons</PageTitle>
      <PageSub>Tap a unit to see its lessons</PageSub>

      {units.length === 0 ? (
        <EmptyState title="No lessons yet" sub="Curriculum units will appear here once they sync." />
      ) : null}

      {units.map((u, i) => {
        const state = u[1];
        const isOpen = open[i];
        let tagColor, tagBg, tagLabel;
        if (state === 'done') {
          tagColor = colors.success;
          tagBg = withAlpha(colors.success, 0.15);
          tagLabel = 'Complete';
        } else if (state === 'cur') {
          tagColor = colors.brand;
          tagBg = colors.brandSoft;
          tagLabel = 'Current';
        } else {
          tagColor = colors.textSubtle;
          tagBg = colors.surface2;
          tagLabel = 'Locked';
        }

        return (
          <View key={i} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden', marginBottom: 11, backgroundColor: colors.surface }}>
            <Pressable onPress={() => toggle(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 }}>
              <Text style={{ fontSize: 14, fontFamily: fonts.display800, fontWeight: '800', color: colors.text, flex: 1 }}>{u[0]}</Text>
              <View style={{ backgroundColor: tagBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
                <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: tagColor }}>{tagLabel}</Text>
              </View>
              {isOpen ? <IconChevronDown size={18} color={colors.textSubtle} /> : <IconChevronRight size={18} color={colors.textSubtle} />}
            </Pressable>

            {isOpen ? (
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                {u[2].map((lesson, j) => {
                  // lesson state per source logic
                  let lstate;
                  if (state === 'done') lstate = 'done';
                  else if (state === 'cur') lstate = j < 4 ? 'done' : j === 4 ? 'cur' : '';
                  else lstate = 'lock';

                  const locked = lstate === 'lock';
                  const isCur = lstate === 'cur';

                  let numEl;
                  if (lstate === 'done') {
                    numEl = (
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: withAlpha(colors.success, 0.16), alignItems: 'center', justifyContent: 'center' }}>
                        <IconCheck size={13} color={colors.success} strokeWidth={3} />
                      </View>
                    );
                  } else if (isCur) {
                    numEl = (
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: '#fff' }}>{j + 1}</Text>
                      </View>
                    );
                  } else {
                    numEl = (
                      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.textSubtle }}>{j + 1}</Text>
                      </View>
                    );
                  }

                  return (
                    <Pressable
                      key={j}
                      disabled={!isCur}
                      onPress={() => isCur && navTo('lesson-detail')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 11,
                        paddingVertical: 11,
                        paddingHorizontal: 14,
                        borderBottomWidth: j === u[2].length - 1 ? 0 : 1,
                        borderBottomColor: colors.surface2,
                        opacity: locked ? 0.5 : 1,
                      }}
                    >
                      {numEl}
                      <Text style={{ flex: 1, fontSize: 13, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>{lesson}</Text>
                      {isCur ? <IconChevronRight size={16} color={colors.brand} /> : null}
                      {locked ? <IconLock size={14} color={colors.textSubtle} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
