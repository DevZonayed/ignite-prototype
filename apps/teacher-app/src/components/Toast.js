import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import { fonts } from '../theme';
import { IconCheck } from './Icon';

export default function Toast({ message, visible }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 86,
        backgroundColor: '#0f172a',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        zIndex: 5,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
          },
        ],
      }}
    >
      <IconCheck size={16} color="#4ade80" strokeWidth={3} />
      <Text style={{ color: '#fff', fontSize: 13, fontFamily: fonts.body600, fontWeight: '600' }}>{message}</Text>
    </Animated.View>
  );
}
