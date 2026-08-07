import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, Pill, Hint, withAlpha } from '../components/ui';
import { IconChecklist, IconBoxSimple, IconTrash } from '../components/Icon';

export default function SyncScreen({ goBack, showToast, openRemoveModal }) {
  const { colors } = useTheme();

  return (
    <View>
      <SubHead title="Sync queue" onBack={goBack} />

      <Button variant="primary" onPress={() => showToast('Syncing…')} style={{ marginBottom: 14 }}>
        ↻ Sync now
      </Button>

      {/* Syncing item */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
          <IconChecklist size={18} color={colors.brand} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>Attendance — JSS 1</Text>
          <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>Record · 2 KB</Text>
        </View>
        <Pill kind="syncing">Syncing…</Pill>
      </View>

      {/* Queued item */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: withAlpha(colors.ignite, 0.14), alignItems: 'center', justifyContent: 'center' }}>
          <IconBoxSimple size={18} color={colors.ignite} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>Scratch project — Maze</Text>
          <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>Media · 1.4 MB · attempt 1</Text>
        </View>
        <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.warning }}>Queued</Text>
      </View>

      {/* Retry item */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: withAlpha(colors.danger, 0.12), alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', color: colors.danger, fontSize: 16 }}>!</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>LQS rubric — 12 learners</Text>
          <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>Record · attempt 2</Text>
        </View>
        <Text style={{ fontSize: 11, fontFamily: fonts.body700, fontWeight: '700', color: colors.danger }}>Retry</Text>
      </View>

      <View style={{ marginTop: 2, marginBottom: 12 }}>
        <Pressable
          onPress={openRemoveModal}
          style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#fecaca', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 }}
        >
          <IconTrash size={13} color={colors.danger} />
          <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: colors.danger }}>Remove failed item</Text>
        </Pressable>
      </View>

      <Hint style={{ textAlign: 'left' }}>Nothing is marked Synced until the server confirms it.</Hint>
    </View>
  );
}
