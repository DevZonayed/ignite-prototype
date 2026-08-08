import React from 'react';
import { View } from 'react-native';
import { SubHead, EmptyState } from '../components/ui';

export default function HwReviewScreen({ goBack }) {
  return (
    <View>
      <SubHead title="Review submission" onBack={goBack} />
      <EmptyState title="No submission selected" sub="Open a pending submission from the Homework tab to review it and message the parent." />
    </View>
  );
}
