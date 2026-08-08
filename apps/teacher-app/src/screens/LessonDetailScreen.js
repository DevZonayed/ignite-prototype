import React from 'react';
import { View } from 'react-native';
import { SubHead, Button, EmptyState, Hint } from '../components/ui';

export default function LessonDetailScreen({ navTo, goBack }) {
  return (
    <View>
      <SubHead title="Lesson" onBack={goBack} />

      <EmptyState title="No lesson selected" sub="Open a lesson from the Lessons tab to see its plan, media and documents here." />

      <Button variant="ghost" onPress={() => navTo('ai')} style={{ marginBottom: 11 }}>
        ✨ Ask the AI assistant
      </Button>
      <Button variant="ignite" onPress={() => navTo('active')} style={{ opacity: 0.5 }}>
        ▶ Start lesson
      </Button>
      <Hint>Start becomes available when a lesson is loaded.</Hint>
    </View>
  );
}
