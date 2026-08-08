import React from 'react';
import { View } from 'react-native';
import { SubHead, Button, EmptyState, Hint } from '../components/ui';

export default function SyncScreen({ goBack, showToast, openRemoveModal }) {
  return (
    <View>
      <SubHead title="Sync queue" onBack={goBack} />

      <Button variant="primary" onPress={() => showToast('Syncing…')} style={{ marginBottom: 14 }}>
        ↻ Sync now
      </Button>

      <EmptyState title="Nothing waiting to sync" sub="Work you save offline will queue up here until it reaches the server." />

      <Hint style={{ textAlign: 'left' }}>Nothing is marked Synced until the server confirms it.</Hint>
    </View>
  );
}
