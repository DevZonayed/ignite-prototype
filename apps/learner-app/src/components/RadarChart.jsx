import React from 'react';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../ThemeContext';

// Faithful port of the radar builder in the source <script>.
// cx=160, cy=158, R=104, N=dims.length; angle a = -PI/2 + i*2PI/N
// rings at .25/.5/.75/1; axis lines; labels at r=1.17; value polygon; colored dots.
//
// `dims` are the server's radar points: [{ name, value (0..1), color }].
const CX = 160;
const CY = 158;
const R = 104;

function pt(i, r, n) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return [CX + R * r * Math.cos(a), CY + R * r * Math.sin(a)];
}

export default function RadarChart({ width = 300, dims = [] }) {
  const { colors } = useTheme();
  const n = dims.length;
  const rings = [0.25, 0.5, 0.75, 1];

  // A polygon needs at least three spokes to be a shape rather than a line.
  if (n < 3) return null;

  const ringPolys = rings.map((r) =>
    dims.map((_, i) => pt(i, r, n).join(',')).join(' ')
  );

  const valuePoly = dims.map((d, i) => pt(i, d.value, n).join(',')).join(' ');

  return (
    <Svg width={width} height={width} viewBox="0 0 320 320">
      {/* concentric rings */}
      {ringPolys.map((points, idx) => (
        <Polygon
          key={`ring-${idx}`}
          points={points}
          fill="none"
          stroke={colors.border}
          strokeWidth={1}
        />
      ))}

      {/* axis lines + labels */}
      {dims.map((d, i) => {
        const o = pt(i, 1, n);
        const lp = pt(i, 1.17, n);
        const anchor = lp[0] < CX - 6 ? 'end' : lp[0] > CX + 6 ? 'start' : 'middle';
        return (
          <React.Fragment key={`axis-${i}`}>
            <Line x1={CX} y1={CY} x2={o[0]} y2={o[1]} stroke={colors.border} strokeWidth={1} />
            <SvgText
              x={lp[0]}
              y={lp[1] + 3}
              textAnchor={anchor}
              fontSize={10}
              fontWeight="700"
              fill={colors.textMuted}
              fontFamily="Inter_700Bold"
            >
              {d.name}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* value polygon */}
      <Polygon
        points={valuePoly}
        fill={colors.radarFill}
        stroke={colors.brand}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* colored value dots */}
      {dims.map((d, i) => {
        const p = pt(i, d.value, n);
        return (
          <Circle key={`dot-${i}`} cx={p[0]} cy={p[1]} r={3.5} fill={d.color} stroke="#fff" strokeWidth={1.5} />
        );
      })}
    </Svg>
  );
}
