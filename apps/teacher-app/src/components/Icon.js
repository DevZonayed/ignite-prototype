import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

// Icon library — each inline SVG from teacher.html converted to react-native-svg.
// Props: size, color (stroke), fill, strokeWidth
const defaults = { size: 22, color: 'currentColor', fill: 'none', strokeWidth: 2 };

function base(props) {
  const size = props.size ?? defaults.size;
  const stroke = props.color ?? defaults.color;
  const fill = props.fill ?? defaults.fill;
  const strokeWidth = props.strokeWidth ?? defaults.strokeWidth;
  return { size, stroke, fill, strokeWidth };
}

export function IconBell(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}

export function IconBellSimple(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    </Svg>
  );
}

export function IconChevronDown(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function IconChevronRight(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

export function IconChevronLeft(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

export function IconCheck(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

export function IconHome(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 11l9-8 9 8" />
      <Path d="M5 10v10h14V10" />
    </Svg>
  );
}

export function IconBook(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="4" width="18" height="16" rx="2" />
      <Path d="M3 9h18" />
    </Svg>
  );
}

export function IconUser(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="9" cy="8" r="3" />
      <Path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
    </Svg>
  );
}

export function IconHomework(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 11l3 3 8-8" />
      <Path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    </Svg>
  );
}

export function IconAI(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2a10 10 0 1 0 10 10" />
      <Path d="M12 6v6l4 2" />
      <Circle cx="19" cy="5" r="2" />
    </Svg>
  );
}

export function IconProfile(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </Svg>
  );
}

export function IconSync(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <Path d="M21 3v5h-5" />
    </Svg>
  );
}

export function IconSyncPartial(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12a9 9 0 1 1-3-6.7" />
    </Svg>
  );
}

export function IconCamera(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  );
}

export function IconChecklist(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 11l3 3L22 4" />
      <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </Svg>
  );
}

export function IconShield(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3l8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6z" />
      <Path d="M9 12l2 2 4-4" />
    </Svg>
  );
}

export function IconGem(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <Path d="M12 8v6M9 11h6" />
    </Svg>
  );
}

export function IconPencil(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 20h9" />
      <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Svg>
  );
}

export function IconBox(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="7" width="18" height="13" rx="2" />
      <Path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}

export function IconBoxSimple(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="7" width="18" height="13" rx="2" />
    </Svg>
  );
}

export function IconImage(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  const withCircle = props.withCircle !== false;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="4" width="18" height="14" rx="2" />
      <Path d="m3 14 5-5 4 4 3-3 6 6" />
      {withCircle ? <Circle cx="8.5" cy="8.5" r="1.5" /> : null}
    </Svg>
  );
}

export function IconPlay(props) {
  const size = props.size ?? 13;
  const fill = props.fill ?? '#172554';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <Path d="M8 5v14l11-7z" />
    </Svg>
  );
}

export function IconSend(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
    </Svg>
  );
}

export function IconTrash(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </Svg>
  );
}

export function IconLock(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="5" y="11" width="14" height="9" rx="2" />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

export function IconSignOut(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </Svg>
  );
}

export function IconSun(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

export function IconMoon(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Svg>
  );
}

// Dark-theme profile icon (circle + rays subset used in profile row)
export function IconThemeRow(props) {
  const { size, stroke, fill, strokeWidth } = base(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M20 12h2M2 12h2" />
    </Svg>
  );
}
