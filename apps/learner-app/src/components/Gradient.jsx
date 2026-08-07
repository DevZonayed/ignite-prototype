import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

// A 135deg linear-gradient fill via react-native-svg, positioned absolutely to fill parent.
// 135deg CSS = from top-left to bottom-right. In SVG userSpace that's (0,0) -> (1,1).
export default function Gradient({ colors, style, children, borderRadius = 0 }) {
  const [c1, c2] = colors;
  const id = React.useId ? React.useId().replace(/:/g, '') : `g${c1}${c2}`.replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c1} />
            <Stop offset="1" stopColor={c2} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
