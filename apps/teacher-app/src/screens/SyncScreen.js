import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, Hint, Pill } from '../components/ui';
import { AsyncList, ErrorState } from '../components/ScreenState';
import { useApi, useAction } from '../api/useApi';
import { getSyncQueue, triggerSync } from '../api/endpoints';

export default function SyncScreen({ goBack, showToast }) {
  const { colors } = useTheme();

  const state = useApi(() => getSyncQueue(), [], { initial: [] });

  const sync = useAction(async () => {
    await triggerSync();
    await state.reload();
  });

  async function onSync() {
    showToast('Syncing…');
    try {
      await sync.run();
      showToast('Sync complete');
    } catch {
      // Rendered inline.
    }
  }

  return (
    <View>
      <SubHead title="Sync queue" onBack={goBack} />

      <Button variant="primary" disabled={sync.pending} onPress={onSync} style={{ marginBottom: 14 }}>
        {sync.pending ? 'Syncing…' : '↻ Sync now'}
      </Button>

      {sync.error ? <ErrorState error={sync.error} /> : null}

      <AsyncList
        state={state}
        loadingLabel="Loading queue…"
        empty={{
          title: 'Nothing waiting to sync',
          sub: 'Work you save offline will queue up here until it reaches the server.',
        }}
      >
        {(items) =>
          items.map((item) => (
            <View
              key={item.id}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>
                  {item.entityType || 'Item'}
                </Text>
                <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>
                  {item.action || 'pending'}
                </Text>
              </View>
              <Pill kind={item.status === 'synced' ? 'ok' : 'sync'}>{item.status || 'queued'}</Pill>
            </View>
          ))
        }
      </AsyncList>

      <Hint style={{ textAlign: 'left' }}>Nothing is marked Synced until the server confirms it.</Hint>
    </View>
  );
}
