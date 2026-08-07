import React from 'react';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../ThemeContext';

// Reproduces the Term-progress ring SVG from the source:
// r=33, stroke-width=9, dasharray=207.3, dashoffset=58, rotate(-90), 72% label.
export default function ProgressRing({
  size = 78,
  percent = 72,
  dashArray = 207.3,
  dashOffset = 58,
}) {
  const { colors } = useTheme();
  // viewBox 0 0 80 80 scaled to size
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Circle cx={40} cy={40} r={33} fill="none" stroke={colors.surface2} strokeWidth={9} />
      <Circle
        cx={40}
        cy={40}
        r={33}
        fill="none"
        stroke={colors.brand}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={`${dashArray}`}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 40 40)"
      />
      <SvgText
        x={40}
        y={46}
        textAnchor="middle"
        fontFamily="Nunito_900Black"
        fontWeight="900"
        fontSize={19}
        fill={colors.text}
      >
        {percent}%
      </SvgText>
    </Svg>
  );
}
