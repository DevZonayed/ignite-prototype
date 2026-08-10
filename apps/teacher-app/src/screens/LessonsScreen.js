import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { PageTitle, PageSub, withAlpha } from '../components/ui';
import { AsyncList } from '../components/ScreenState';
import { IconChevronRight, IconChevronDown, IconCheck, IconLock } from '../components/Icon';
import { useApi } from '../api/useApi';
import { listCurricula, getCurriculum } from '../api/endpoints';

export default function LessonsScreen({ navTo }) {
  const { colors } = useTheme();

  // The published curriculum, then its units. Two calls because the list
  // endpoint does not embed units and the detail endpoint does.
  const curricula = useApi(() => listCurricula(), [], { initial: [] });
  const publishedId =
    (curricula.data || []).find((c) => c.status === 'published')?.id ??
    (curricula.data || [])[0]?.id ??
    null;

  const detail = useApi(() => getCurriculum(publishedId), [publishedId], {
    skip: !publishedId,
  });

  const units = detail.data?.units ?? [];
  const ordered = [...units].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const currentUnitId = ordered.find((u) => u.status === 'current')?.id ?? null;

  const [open, setOpen] = useState({});
  // Open whichever unit the class is on, once it is known. Keyed by id so a
  // reload that reorders units cannot expand the wrong one.
  useEffect(() => {
    if (currentUnitId) setOpen((prev) => ({ ...prev, [currentUnitId]: true }));
  }, [currentUnitId]);

  function toggle(id) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // One ladder for both requests: whichever is loading or failed shows through.
  const state = {
    data: ordered,
    loading: curricula.loading || detail.loading,
    error: curricula.error || detail.error,
    reload: () => {
      curricula.reload();
      detail.reload();
    },
  };

  return (
    <View>
      <PageTitle>Lessons</PageTitle>
      <PageSub>Tap a unit to see its lessons</PageSub>

      <AsyncList
        state={state}
        loadingLabel="Loading curriculum…"
        empty={{ title: 'No lessons yet', sub: 'Curriculum units will appear here once they sync.' }}
      >
        {(rows) =>
          rows.map((u) => {
            const isOpen = !!open[u.id];
            let tagColor, tagBg, tagLabel;
            if (u.status === 'done') {
              tagColor = colors.success;
              tagBg = withAlpha(colors.success, 0.15);
              tagLabel = 'Complete';
            } else if (u.status === 'current') {
              tagColor = colors.brand;
              tagBg = colors.brandSoft;
              tagLabel = 'Current';
            } else {
              tagColor = colors.textSubtle;
              tagBg = colors.surface2;
              tagLabel = 'Locked';
            }

            const lessons = [...(u.lessons || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            return (
              <View key={u.id} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden', marginBottom: 11, backgroundColor: colors.surface }}>
                <Pressable onPress={() => toggle(u.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 }}>
                  <Text style={{ fontSize: 14, fontFamily: fonts.display800, fontWeight: '800', color: colors.text, flex: 1 }}>{u.title}</Text>
                  <View style={{ backgroundColor: tagBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
                    <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: tagColor }}>{tagLabel}</Text>
                  </View>
                  {isOpen ? <IconChevronDown size={18} color={colors.textSubtle} /> : <IconChevronRight size={18} color={colors.textSubtle} />}
                </Pressable>

                {isOpen ? (
                  <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                    {lessons.length === 0 ? (
                      <Text style={{ padding: 14, fontSize: 12.5, color: colors.textSubtle }}>
                        This unit has no lessons yet.
                      </Text>
                    ) : null}
                    {lessons.map((lesson, j) => {
                      const done = lesson.status === 'done';
                      const isCur = lesson.status === 'current';
                      // A locked lesson is the class's pacing, not a permission
                      // check — it stays unopenable until the unit reaches it.
                      const openable = done || isCur;

                      let numEl;
                      if (done) {
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
                          key={lesson.id}
                          disabled={!openable}
                          onPress={() => openable && navTo('lesson-detail', { lessonId: lesson.id })}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 11,
                            paddingVertical: 11,
                            paddingHorizontal: 14,
                            borderBottomWidth: j === lessons.length - 1 ? 0 : 1,
                            borderBottomColor: colors.surface2,
                            opacity: openable ? 1 : 0.5,
                          }}
                        >
                          {numEl}
                          <Text style={{ flex: 1, fontSize: 13, fontFamily: fonts.body600, fontWeight: '600', color: colors.text }}>{lesson.title}</Text>
                          {openable ? <IconChevronRight size={16} color={colors.brand} /> : <IconLock size={14} color={colors.textSubtle} />}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })
        }
      </AsyncList>
    </View>
  );
}
