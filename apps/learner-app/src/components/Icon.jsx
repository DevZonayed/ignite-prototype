import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// Stroke-style icon wrapper matching the source inline SVGs (fill=none, stroke=currentColor).
function Stroke({ size = 24, color = '#000', strokeWidth = 2, children, viewBox = '0 0 24 24' }) {
  return (
    <Svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color} strokeWidth={strokeWidth}>
      {children}
    </Svg>
  );
}

export function HomeIcon({ size = 22, color = '#000', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M3 11l9-8 9 8" />
      <Path d="M5 10v10h14V10" />
    </Stroke>
  );
}

export function PortfolioIcon({ size = 22, color = '#000', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Rect x={3} y={4} width={18} height={16} rx={2} />
      <Path d="M3 9h18" />
    </Stroke>
  );
}

export function StarIcon({ size = 22, color = '#000', strokeWidth = 2, fill = 'none' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth}>
      <Path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z" />
    </Svg>
  );
}

export function SkillsIcon({ size = 22, color = '#000', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
    </Stroke>
  );
}

export function ProfileIcon({ size = 22, color = '#000', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </Stroke>
  );
}

export function ChevronLeftIcon({ size = 18, color = '#000', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M15 18l-6-6 6-6" />
    </Stroke>
  );
}

export function ChevronRightIcon({ size = 16, color = '#000', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M9 6l6 6-6 6" />
    </Stroke>
  );
}

// Medal used in celebrate banner (fill=none, stroke=#fff)
export function MedalIcon({ size = 26, color = '#fff', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Circle cx={12} cy={8} r={6} />
      <Path d="M15.5 13 17 22l-5-3-5 3 1.5-9" />
    </Stroke>
  );
}

// Earned badge (award) icon
export function AwardIcon({ size = 24, color = '#fff', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Circle cx={12} cy={8} r={5} />
      <Path d="M8.2 12 7 22l5-3 5 3-1.2-10" />
    </Stroke>
  );
}

// Locked badge (padlock) icon
export function LockIcon({ size = 22, color = '#94a3b8', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Rect x={5} y={11} width={14} height={9} rx={2} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Stroke>
  );
}

// Theme "gear/sun-dot" icon used in the Dark theme row (.pi)
export function SunDotIcon({ size = 17, color = '#000', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 2v2M12 20v2M20 12h2M2 12h2" />
    </Stroke>
  );
}

// Toast check
export function CheckIcon({ size = 16, color = '#4ade80', strokeWidth = 3 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M20 6 9 17l-5-5" />
    </Stroke>
  );
}

// --- Portfolio thumbnail glyphs (fill=none, stroke=#fff) ---
export function PlayIcon({ size = 15, color = '#172554' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M8 5v14l11-7z" />
    </Svg>
  );
}

export function PythonBracketsIcon({ size = 30, color = '#fff', strokeWidth = 2.2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />
    </Stroke>
  );
}

export function RobotIcon({ size = 30, color = '#fff', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Rect x={5} y={8} width={14} height={11} rx={2} />
      <Path d="M12 8V5M9 3h6M9 13h.01M15 13h.01" />
    </Stroke>
  );
}

export function ImageIcon({ size = 30, color = '#fff', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Rect x={3} y={4} width={18} height={16} rx={2} />
      <Path d="m3 15 5-5 4 4 3-3 6 6" />
      <Circle cx={8.5} cy={9} r={1.4} />
    </Stroke>
  );
}

export function CodeBracketsIcon({ size = 30, color = '#fff', strokeWidth = 2 }) {
  return (
    <Stroke size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
      <Circle cx={12} cy={12} r={3} />
    </Stroke>
  );
}

export { Stroke };
